import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { Purchase } from '../entities/purchase.entity';
import { Product } from '../entities/product.entity';
import { CreatePurchaseDto, PurchaseQueryDto } from '../dto/purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto) {
    // 开启事务
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 检查商品是否存在
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: createPurchaseDto.productId },
        lock: { mode: 'pessimistic_write' }, // 使用悲观锁防止并发问题
      });

      if (!product) {
        throw new BadRequestException('商品不存在');
      }

      // 创建采购记录
      const purchase = await queryRunner.manager.save(
        Purchase,
        createPurchaseDto,
      );

      // 更新商品库存
      product.stock += createPurchaseDto.quantity;
      await queryRunner.manager.save(Product, product);

      // 提交事务
      await queryRunner.commitTransaction();
      return purchase;
    } catch (err) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 释放资源
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const purchase = await queryRunner.manager.findOne(Purchase, {
        where: { id },
      });

      if (!purchase) {
        throw new BadRequestException('采购记录不存在');
      }

      const product = await queryRunner.manager.findOne(Product, {
        where: { id: purchase.productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!product) {
        throw new BadRequestException('商品不存在');
      }

      // 检查可用库存是否足够（总库存 - 已售数量 >= 要删除的数量）
      if (product.stock - product.soldQuantity < purchase.quantity) {
        throw new BadRequestException('商品已售出部分库存，无法删除采购记录');
      }

      // 更新商品库存
      product.stock -= purchase.quantity;
      await queryRunner.manager.save(Product, product);

      await queryRunner.manager.remove(Purchase, purchase);

      await queryRunner.commitTransaction();
      return purchase;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: PurchaseQueryDto) {
    const { productId, startTime, endTime, page = 1, pageSize = 10 } = query;
    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (startTime && endTime) {
      where.createdAt = Between(new Date(startTime), new Date(endTime));
    }

    const [list, total] = await this.purchaseRepository.findAndCount({
      where,
      relations: ['product'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }
}

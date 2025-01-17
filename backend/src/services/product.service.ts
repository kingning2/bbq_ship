import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
} from '../dto/product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      // 检查分类是否存在
      const category = await this.categoryRepository.findOne({
        where: { id: createProductDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('分类不存在');
      }

      const product = this.productRepository.create(createProductDto);
      return await this.productRepository.save(product);
    } catch (error) {
      this.logger.error('创建商品失败', error.stack);
      throw error;
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
      });

      if (!product) {
        throw new BadRequestException('商品不存在');
      }

      if (updateProductDto.categoryId) {
        const category = await this.categoryRepository.findOne({
          where: { id: updateProductDto.categoryId },
        });

        if (!category) {
          throw new BadRequestException('分类不存在');
        }
      }

      await this.productRepository.update(id, updateProductDto);
      return await this.productRepository.findOne({
        where: { id },
        relations: ['category'],
      });
    } catch (error) {
      this.logger.error('更新商品失败', error.stack);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
      });

      if (!product) {
        throw new BadRequestException('商品不存在');
      }

      await this.productRepository.remove(product);
      return product;
    } catch (error) {
      this.logger.error('删除商品失败', error.stack);
      throw error;
    }
  }

  async findAll(query: ProductQueryDto) {
    const { name, categoryId, status, isHot, page, pageSize } = query;
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (name) {
      queryBuilder.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    if (typeof isHot === 'boolean') {
      queryBuilder.andWhere('product.isHot = :isHot', { isHot });
    }

    // 如果不传分页参数，则返回所有数据
    if (page && pageSize) {
      queryBuilder.skip((page - 1) * pageSize).take(pageSize);
    }

    const [list, total] = await queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .getManyAndCount();

    return {
      list,
      total,
      page: page || 1,
      pageSize: pageSize || total,
    };
  }

  async findOne(id: number) {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['category'],
      });

      if (!product) {
        throw new BadRequestException('商品不存在');
      }

      return product;
    } catch (error) {
      this.logger.error('获取商品详情失败', error.stack);
      throw error;
    }
  }

  async updateStatus(id: number, status: 'on' | 'off') {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
      });

      if (!product) {
        throw new BadRequestException('商品不存在');
      }

      await this.productRepository.update(id, { status });
      return await this.productRepository.findOne({
        where: { id },
        relations: ['category'],
      });
    } catch (error) {
      this.logger.error('更新商品状态失败', error.stack);
      throw error;
    }
  }

  async updateHot(id: number, isHot: boolean) {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
      });

      if (!product) {
        throw new BadRequestException('商品不存在');
      }

      await this.productRepository.update(id, { isHot });
      return await this.productRepository.findOne({
        where: { id },
        relations: ['category'],
      });
    } catch (error) {
      this.logger.error('更新商品热销状态失败', error.stack);
      throw error;
    }
  }
}

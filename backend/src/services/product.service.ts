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
    try {
      const {
        page = 1,
        pageSize = 10,
        name,
        categoryId,
        status,
        isHot,
      } = query;
      const where: any = {};

      if (name) {
        where.name = Like(`%${name}%`);
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (status) {
        where.status = status;
      }

      if (typeof isHot === 'boolean') {
        where.isHot = isHot;
      }

      const [list, total] = await this.productRepository.findAndCount({
        where,
        relations: ['category'],
        skip: (page - 1) * pageSize,
        take: pageSize,
        order: {
          createdAt: 'DESC',
        },
      });

      return {
        list,
        total,
      };
    } catch (error) {
      this.logger.error('获取商品列表失败', error.stack);
      throw error;
    }
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

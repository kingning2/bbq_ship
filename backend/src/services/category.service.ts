import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Category } from '../entities/category.entity';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryDto,
} from '../dto/category.dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  // 创建分类
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      // 检查分类名是否已存在
      const existCategory = await this.categoryRepository.findOne({
        where: { name: createCategoryDto.name },
      });

      if (existCategory) {
        throw new BadRequestException('分类名称已存在');
      }

      const category = this.categoryRepository.create(createCategoryDto);
      const result = await this.categoryRepository.save(category);

      this.logger.log(`创建分类成功: ${category.name}`);
      return result;
    } catch (error) {
      this.logger.error('创建分类失败', error.stack);
      throw error;
    }
  }

  // 更新分类
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
      });

      if (!category) {
        throw new BadRequestException('分类不存在');
      }

      // 检查新名称是否与其他分类重复
      if (updateCategoryDto.name !== category.name) {
        const existCategory = await this.categoryRepository.findOne({
          where: { name: updateCategoryDto.name },
        });

        if (existCategory) {
          throw new BadRequestException('分类名称已存在');
        }
      }

      const result = await this.categoryRepository.save({
        ...category,
        ...updateCategoryDto,
      });

      this.logger.log(`更新分类成功: ${category.name}`);
      return result;
    } catch (error) {
      this.logger.error('更新分类失败', error.stack);
      throw error;
    }
  }

  // 删除分类
  async remove(id: number) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
      });

      if (!category) {
        throw new BadRequestException('分类不存在');
      }

      await this.categoryRepository.remove(category);
      this.logger.log(`删除分类成功: ${category.name}`);
      return category;
    } catch (error) {
      this.logger.error('删除分类失败', error.stack);
      throw error;
    }
  }

  // 获取分类列表
  async findAll(query: CategoryQueryDto) {
    try {
      const { name, page = 1, pageSize = 10 } = query;
      const where = {};

      if (name) {
        where['name'] = Like(`%${name}%`);
      }

      const [list, total] = await this.categoryRepository.findAndCount({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        order: {
          createdAt: 'DESC',
        },
        relations: ['products'],
      });

      return {
        list,
        total,
      };
    } catch (error) {
      this.logger.error('获取分类列表失败', error.stack);
      throw error;
    }
  }

  // 获取分类详情
  async findOne(id: number) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
      });

      if (!category) {
        throw new BadRequestException('分类不存在');
      }

      return category;
    } catch (error) {
      this.logger.error('获取分类详情失败', error.stack);
      throw error;
    }
  }
}

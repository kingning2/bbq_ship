import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string) {
    try {
      this.logger.log(`查找用户: ${username}`);
      const user = await this.userRepository.findOne({ where: { username } });
      if (!user) {
        this.logger.warn(`用户不存在: ${username}`);
      }
      return user;
    } catch (error) {
      this.logger.error(`查找用户失败: ${username}`, error.stack);
      throw error;
    }
  }

  async findById(id: number) {
    try {
      this.logger.log(`查找用户: ID ${id}`);
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        this.logger.warn(`用户不存在: ID ${id}`);
      }
      return user;
    } catch (error) {
      this.logger.error(`查找用户失败: ID ${id}`, error.stack);
      throw error;
    }
  }

  async create(userData: Partial<User>) {
    try {
      this.logger.log(`创建用户: ${userData.username}`);
      const user = this.userRepository.create(userData);
      const result = await this.userRepository.save(user);
      this.logger.log(`用户创建成功: ID ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`创建用户失败: ${userData.username}`, error.stack);
      throw error;
    }
  }

  async update(id: number, userData: Partial<User>) {
    try {
      this.logger.log(`更新用户: ID ${id}`);
      await this.userRepository.update(id, userData);
      const updated = await this.findById(id);
      this.logger.log(`用户更新成功: ID ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`更新用户失败: ID ${id}`, error.stack);
      throw error;
    }
  }
}

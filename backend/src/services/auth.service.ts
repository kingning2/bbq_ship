import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as crypto from 'crypto';
import { LoginDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private md5(str: string): string {
    const input = String(str);
    return crypto.createHash('md5').update(input).digest('hex').toLowerCase();
  }

  private async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const inputHash = this.md5(password);
    return inputHash === hashedPassword;
  }

  async validateUser(loginDto: LoginDto) {
    try {
      const { username, phone, password, role } = loginDto;
      let user: User | null = null;

      if (role === 'business') {
        user = await this.userRepository.findOne({ where: { username } });
      } else {
        this.logger.log(`顾客登录: ${phone}`);
        user = await this.userRepository.findOne({ where: { phone } });

        if (!user) {
          this.logger.log(`创建新顾客账号: ${phone}`);
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 6);
          const username = `user_${timestamp}_${randomStr}`;

          user = await this.userRepository.save({
            username,
            phone,
            password: this.md5(password),
            role: 'customer',
          });
        }
      }

      if (!user) {
        return null;
      }

      const isPasswordValid = await this.comparePassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(`验证用户失败: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async login(user: any) {
    try {
      const payload = {
        username: user.username,
        sub: user.id,
        role: user.role,
      };
      return {
        code: 200,
        message: '登录成功',
        data: {
          token: this.jwtService.sign(payload),
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            phone: user.phone,
          },
        },
      };
    } catch (error) {
      this.logger.error('生成token失败:', error.stack);
      throw new BadRequestException('登录失败');
    }
  }
}

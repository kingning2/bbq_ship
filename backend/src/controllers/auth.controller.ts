import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/auth.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.log('收到登录请求');
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      return {
        code: 400,
        message:
          loginDto.role === 'business'
            ? '用户名或密码错误'
            : '手机号或密码错误',
      };
    }
    return this.authService.login(user);
  }
}

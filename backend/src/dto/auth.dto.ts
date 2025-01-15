import {
  IsNotEmpty,
  IsEnum,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class LoginDto {
  @ValidateIf((o) => o.role === 'business')
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  username?: string;

  @ValidateIf((o) => o.role === 'customer')
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' })
  phone?: string;

  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @IsEnum(['customer', 'business'], { message: '角色只能是顾客或商家' })
  role: 'customer' | 'business';
}

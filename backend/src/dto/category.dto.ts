import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString({ message: '分类名称必须是字符串' })
  @MaxLength(50, { message: '分类名称最大长度为50' })
  name: string;

  @IsString({ message: '分类描述必须是字符串' })
  @MaxLength(200, { message: '分类描述最大长度为200' })
  description: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: '分类名称必须是字符串' })
  @MaxLength(50, { message: '分类名称最大长度为50' })
  name?: string;

  @IsOptional()
  @IsString({ message: '分类描述必须是字符串' })
  @MaxLength(200, { message: '分类描述最大长度为200' })
  description?: string;
}

export class CategoryQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number;
}

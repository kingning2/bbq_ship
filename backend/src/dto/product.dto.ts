import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsOptional,
  Min,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty({ message: '商品名称不能为空' })
  @IsString({ message: '商品名称必须是字符串' })
  @MaxLength(100, { message: '商品名称最大长度为100' })
  name: string;

  @IsString({ message: '商品描述必须是字符串' })
  @MaxLength(500, { message: '商品描述最大长度为500' })
  description: string;

  @IsNotEmpty({ message: '商品价格不能为空' })
  @IsNumber({}, { message: '商品价格必须是数字' })
  @Min(0, { message: '商品价格不能小于0' })
  @Type(() => Number)
  price: number;

  @IsNotEmpty({ message: '商品库存不能为空' })
  @IsNumber({}, { message: '商品库存必须是数字' })
  @Min(0, { message: '商品库存不能小于0' })
  @Type(() => Number)
  stock: number;

  @IsOptional()
  @IsUrl({}, { message: '商品图片必须是有效的URL' })
  image?: string;

  @IsEnum(['on', 'off'], { message: '商品状态必须是on或off' })
  status: 'on' | 'off';

  @IsBoolean({ message: '是否热销必须是布尔值' })
  isHot: boolean;

  @IsNotEmpty({ message: '商品分类不能为空' })
  @IsNumber({}, { message: '商品分类必须是数字' })
  @Type(() => Number)
  categoryId: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: '商品名称必须是字符串' })
  @MaxLength(100, { message: '商品名称最大长度为100' })
  name?: string;

  @IsOptional()
  @IsString({ message: '商品描述必须是字符串' })
  @MaxLength(500, { message: '商品描述最大长度为500' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: '商品价格必须是数字' })
  @Min(0, { message: '商品价格不能小于0' })
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: '商品库存必须是数字' })
  @Min(0, { message: '商品库存不能小于0' })
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsUrl({}, { message: '商品图片必须是有效的URL' })
  image?: string;

  @IsOptional()
  @IsEnum(['on', 'off'], { message: '商品状态必须是on或off' })
  status?: 'on' | 'off';

  @IsOptional()
  @IsBoolean({ message: '是否热销必须是布尔值' })
  isHot?: boolean;

  @IsOptional()
  @IsNumber({}, { message: '商品分类必须是数字' })
  @Type(() => Number)
  categoryId?: number;
}

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsEnum(['on', 'off'])
  status?: 'on' | 'off';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isHot?: boolean;

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

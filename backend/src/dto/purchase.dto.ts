import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreatePurchaseDto {
  @IsNotEmpty({ message: '商品ID不能为空' })
  @IsNumber({}, { message: '商品ID必须是数字' })
  productId: number;

  @IsNotEmpty({ message: '采购数量不能为空' })
  @IsNumber({}, { message: '采购数量必须是数字' })
  @Min(1, { message: '采购数量必须大于0' })
  quantity: number;

  @IsNotEmpty({ message: '采购单价不能为空' })
  @IsNumber({}, { message: '采购单价必须是数字' })
  @Min(0, { message: '采购单价必须大于等于0' })
  price: number;

  @IsNotEmpty({ message: '供应商不能为空' })
  @IsString({ message: '供应商必须是字符串' })
  supplier: string;

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;
}

export class PurchaseQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '商品ID必须是数字' })
  productId?: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  pageSize?: number;
}

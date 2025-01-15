import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(['amount', 'percentage'])
  type: 'amount' | 'percentage';

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  value: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minAmount?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  probability?: number;
}

export class UpdateCouponDto extends CreateCouponDto {}

export class CouponResponseDto {
  id: number;
  code: string;
  name: string;
  type: 'amount' | 'percentage';
  value: number;
  minAmount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class CouponListResponseDto {
  code: number;
  message: string;
  data: {
    list: CouponResponseDto[];
    total: number;
  };
}

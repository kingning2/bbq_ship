import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

// 创建订单时的订单项DTO
export class CreateOrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

// 创建订单的DTO
export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsString()
  @IsOptional()
  remark?: string;

  @IsEnum(['self', 'delivery'])
  @IsNotEmpty()
  deliveryType: 'self' | 'delivery';

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  couponId?: number;
}

// 返回订单项的DTO
export class OrderItemResponseDto {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
  subtotal: number;
}

// 返回优惠券的DTO
export class CouponResponseDto {
  id: number;
  code: string;
  name: string;
  type: 'amount' | 'percentage';
  value: number;
  minAmount?: number;
}

// 返回订单的DTO
export class OrderResponseDto {
  id: number;
  orderNo: string;
  status: string;
  orderItems: OrderItemResponseDto[];
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  coupon?: CouponResponseDto;
  createdAt: string;
}

// 返回订单列表的DTO
export class OrderListResponseDto {
  code: number;
  message: string;
  data: {
    list: OrderResponseDto[];
    total: number;
  };
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from '../controllers/order.controller';
import { OrderService } from '../services/order.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { UserCoupon } from '../entities/user-coupon.entity';
import { Coupon } from '../entities/coupon.entity';
import { OrderGateway } from '../gateways/order.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, UserCoupon, Coupon]),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderGateway],
})
export class OrderModule {}

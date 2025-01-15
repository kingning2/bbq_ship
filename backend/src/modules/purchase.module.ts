import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from '../entities/purchase.entity';
import { Product } from '../entities/product.entity';
import { PurchaseController } from '../controllers/purchase.controller';
import { PurchaseService } from '../services/purchase.service';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, Product])],
  controllers: [PurchaseController],
  providers: [PurchaseService],
})
export class PurchaseModule {}

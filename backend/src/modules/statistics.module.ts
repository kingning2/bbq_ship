import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from '../controllers/statistics.controller';
import { StatisticsService } from '../services/statistics.service';
import { Order } from '../entities/order.entity';
import { Product } from '../entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}

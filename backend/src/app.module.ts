import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth.module';
import { CategoryModule } from './modules/category.module';
import { ProductModule } from './modules/product.module';
import { PurchaseModule } from './modules/purchase.module';
import { OrderModule } from './modules/order.module';
import { CouponModule } from './modules/coupon.module';
import { StatisticsModule } from './modules/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CategoryModule,
    ProductModule,
    PurchaseModule,
    OrderModule,
    CouponModule,
    StatisticsModule,
  ],
})
export class AppModule {}

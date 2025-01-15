import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Product } from '../entities/product.entity';
import { OrderStatus } from '../enums/order-status.enum';
import * as dayjs from 'dayjs';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getStatistics() {
    const now = dayjs();
    const todayStart = now.startOf('day').toDate();
    const weekStart = now.startOf('week').toDate();
    const monthStart = now.startOf('month').toDate();

    // 获取今日数据
    const todayData = await this.getStatisticsByDateRange(
      todayStart,
      now.toDate(),
    );

    // 获取本周数据
    const weekData = await this.getStatisticsByDateRange(
      weekStart,
      now.toDate(),
    );

    // 获取本月数据
    const monthData = await this.getStatisticsByDateRange(
      monthStart,
      now.toDate(),
    );

    // 获取销售趋势（最近30天）
    const trend = await this.getTrend();

    // 获取热销商品
    const hotProducts = await this.getHotProducts();

    return {
      code: 200,
      message: '获取统计数据成功',
      data: {
        today: todayData,
        week: weekData,
        month: monthData,
        trend,
        hotProducts,
      },
    };
  }

  private async getStatisticsByDateRange(startDate: Date, endDate: Date) {
    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: OrderStatus.COMPLETED,
      },
      relations: ['orderItems', 'orderItems.product'],
    });

    const orderCount = orders.length;
    const totalAmount = Number(
      orders
        .reduce((sum, order) => sum + Number(order.finalAmount), 0)
        .toFixed(2),
    );

    const profit = Number(
      orders
        .reduce((sum, order) => {
          const orderCost = order.orderItems.reduce(
            (itemSum, item) =>
              itemSum + Number(item.product.costPrice) * item.quantity,
            0,
          );
          return sum + (Number(order.finalAmount) - orderCost);
        }, 0)
        .toFixed(2),
    );

    return {
      orderCount,
      totalAmount,
      profit,
    };
  }

  private async getTrend() {
    const startDate = dayjs().subtract(29, 'day').startOf('day').toDate();
    const endDate = dayjs().endOf('day').toDate();

    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: OrderStatus.COMPLETED,
      },
      relations: ['orderItems', 'orderItems.product'],
    });

    const trend = [];
    for (let i = 0; i < 30; i++) {
      const date = dayjs().subtract(i, 'day');
      const dayOrders = orders.filter(
        (order) =>
          dayjs(order.createdAt).format('YYYY-MM-DD') ===
          date.format('YYYY-MM-DD'),
      );

      const dayTotalAmount = Number(
        dayOrders
          .reduce((sum, order) => sum + Number(order.finalAmount), 0)
          .toFixed(2),
      );

      const dayProfit = Number(
        dayOrders
          .reduce((sum, order) => {
            const orderCost = order.orderItems.reduce(
              (itemSum, item) =>
                itemSum + Number(item.product.costPrice) * item.quantity,
              0,
            );
            return sum + (Number(order.finalAmount) - orderCost);
          }, 0)
          .toFixed(2),
      );

      trend.unshift({
        date: date.format('MM-DD'),
        orderCount: dayOrders.length,
        totalAmount: dayTotalAmount,
        profit: dayProfit,
      });
    }

    return trend;
  }

  private async getHotProducts() {
    const products = await this.productRepository.find({
      where: { isHot: true },
      take: 10,
      order: {
        soldQuantity: 'DESC',
      },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      soldQuantity: product.soldQuantity,
      totalAmount: Number(
        (Number(product.price) * product.soldQuantity).toFixed(2),
      ),
    }));
  }
}

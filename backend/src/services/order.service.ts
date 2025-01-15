import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { Coupon } from '../entities/coupon.entity';
import { CreateOrderDto } from '../dto/order.dto';
import { OrderStatus } from '../entities/order.entity';
import { UserCoupon } from '../entities/user-coupon.entity';
import { OrderGateway } from '../gateways/order.gateway';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    private dataSource: DataSource,
    private readonly orderGateway: OrderGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 检查并更新商品库存
      let originalAmount = 0;
      for (const item of createOrderDto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' }, // 使用悲观锁防止并发问题
        });

        if (!product) {
          throw new BadRequestException(`商品ID ${item.productId} 不存在`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`商品 ${product.name} 库存不足`);
        }

        // 减少库存
        product.stock -= item.quantity;
        // 增加销量
        product.soldQuantity += item.quantity;
        await queryRunner.manager.save(product);

        originalAmount += product.price * item.quantity;
      }

      // 2. 计算优惠金额
      let discountAmount = 0;
      if (createOrderDto.couponId) {
        const coupon = await this.couponRepository.findOneBy({
          id: createOrderDto.couponId,
        });
        if (!coupon) {
          throw new BadRequestException('优惠券不存在');
        }
        if (originalAmount < coupon.minAmount) {
          throw new BadRequestException('未达到优惠券使用条件');
        }
        discountAmount =
          coupon.type === 'amount'
            ? coupon.value
            : (originalAmount * (100 - coupon.value)) / 100;
      }

      // 3. 创建订单
      const order = this.orderRepository.create({
        orderNo: `ORDER${Date.now()}${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0')}`,
        userId,
        status: OrderStatus.PENDING,
        originalAmount,
        discountAmount,
        finalAmount: originalAmount - discountAmount,
        couponId: createOrderDto.couponId,
        remark: createOrderDto.remark,
        deliveryType: createOrderDto.deliveryType,
        address: createOrderDto.address,
      });

      await queryRunner.manager.save(order);

      // 4. 创建订单项
      for (const item of createOrderDto.items) {
        const orderItem = this.orderItemRepository.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
        await queryRunner.manager.save(orderItem);
      }

      await queryRunner.commitTransaction();

      // 创建订单成功后发送通知
      this.orderGateway.notifyNewOrder(order);
      this.orderGateway.notifyOrderUpdate(userId, order);

      return {
        code: 200,
        message: '创建订单成功',
        data: order,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findByUserId(userId: number, query: any) {
    const { page = 1, pageSize = 10 } = query;

    const [orders, total] = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('order.coupon', 'coupon')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      code: 200,
      message: '获取订单列表成功',
      data: {
        list: orders.map((order) => ({
          id: order.id,
          orderNo: order.orderNo,
          status: order.status,
          originalAmount: order.originalAmount,
          discountAmount: order.discountAmount,
          finalAmount: order.finalAmount,
          deliveryType: order.deliveryType,
          address: order.address,
          remark: order.remark,
          createdAt: order.createdAt.toISOString(),
          items: order.orderItems.map((item) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: {
              id: item.product.id,
              name: item.product.name,
              image: item.product.image,
            },
          })),
          coupon: order.coupon
            ? {
                id: order.coupon.id,
                name: order.coupon.name,
                type: order.coupon.type,
                value: order.coupon.value,
              }
            : null,
        })),
        total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    };
  }

  async cancelOrder(orderId: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId, userId },
        relations: ['orderItems'],
      });

      if (!order) {
        throw new BadRequestException('订单不存在');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('只能取消待处理的订单');
      }

      // 恢复商品库存
      for (const item of order.orderItems) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (product) {
          // 增加库存
          product.stock += item.quantity;
          // 减少销量
          product.soldQuantity -= item.quantity;
          await queryRunner.manager.save(product);
        }
      }

      // 更新订单状态
      order.status = OrderStatus.CANCELLED;
      await queryRunner.manager.save(order);

      // 如果使用了优惠券，恢复优惠券
      if (order.couponId) {
        const userCoupon = await queryRunner.manager.findOne(UserCoupon, {
          where: {
            userId: order.userId,
            couponId: order.couponId,
            isUsed: true,
          },
        });

        if (userCoupon) {
          userCoupon.isUsed = false;
          await queryRunner.manager.save(userCoupon);
        }
      }

      await queryRunner.commitTransaction();

      // 取消订单成功后发送通知
      this.orderGateway.notifyOrderUpdate(userId, order);

      return {
        code: 200,
        message: '取消订单成功',
        data: null,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findBusinessOrders(query: any) {
    const { page = 1, pageSize = 10, status, startTime, endTime } = query;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('order.coupon', 'coupon')
      .leftJoinAndSelect('order.user', 'user');

    // 添加时间范围筛选
    if (startTime) {
      queryBuilder.andWhere('order.createdAt >= :startTime', { startTime });
    }
    if (endTime) {
      queryBuilder.andWhere('order.createdAt <= :endTime', { endTime });
    }

    // 状态筛选
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    // 按创建时间倒序排序
    queryBuilder.orderBy('order.createdAt', 'DESC');

    // 获取总数和分页数据
    const [orders, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // 格式化返回数据
    return {
      code: 200,
      message: '获取订单列表成功',
      data: {
        list: orders.map((order) => ({
          id: order.id,
          orderNo: order.orderNo,
          status: order.status,
          originalAmount: order.originalAmount,
          discountAmount: order.discountAmount,
          finalAmount: order.finalAmount,
          deliveryType: order.deliveryType,
          address: order.address,
          remark: order.remark,
          createdAt: order.createdAt,
          user: {
            id: order.user.id,
            username: order.user.username,
            phone: order.user.phone,
          },
          items: order.orderItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            product: {
              id: item.product.id,
              name: item.product.name,
              image: item.product.image,
            },
          })),
          coupon: order.coupon
            ? {
                id: order.coupon.id,
                name: order.coupon.name,
                type: order.coupon.type,
                value: order.coupon.value,
              }
            : null,
        })),
        total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    };
  }

  async updateStatus(orderId: number, status: OrderStatus) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems'],
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    // 检查状态转换是否合法
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new BadRequestException('非法的状态转换');
    }

    order.status = status;
    await this.orderRepository.save(order);

    // 通知相关用户
    this.orderGateway.notifyOrderUpdate(order.userId, order);

    return {
      code: 200,
      message: '更新状态成功',
      data: null,
    };
  }
}

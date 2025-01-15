import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { UserCoupon } from '../entities/user-coupon.entity';
import {
  CreateCouponDto,
  UpdateCouponDto,
  CouponListResponseDto,
} from '../dto/coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private userCouponRepository: Repository<UserCoupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto) {
    const coupon = this.couponRepository.create({
      ...createCouponDto,
      isActive: true,
    });
    await this.couponRepository.save(coupon);

    return {
      code: 200,
      message: '创建优惠券成功',
      data: coupon,
    };
  }

  async findAll(query: any): Promise<CouponListResponseDto> {
    const { page = 1, pageSize = 10 } = query;

    const [coupons, total] = await this.couponRepository.findAndCount({
      where: { isActive: true },
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      code: 200,
      message: '获取优惠券列表成功',
      data: {
        list: coupons.map((coupon) => ({
          ...coupon,
          createdAt: coupon.createdAt.toISOString(),
          updatedAt: coupon.updatedAt.toISOString(),
        })),
        total,
      },
    };
  }

  async findOne(id: number) {
    const coupon = await this.couponRepository.findOneBy({ id });
    if (!coupon) {
      return {
        code: 404,
        message: '优惠券不存在',
        data: null,
      };
    }

    return {
      code: 200,
      message: '获取优惠券成功',
      data: {
        ...coupon,
        createdAt: coupon.createdAt.toISOString(),
        updatedAt: coupon.updatedAt.toISOString(),
      },
    };
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.couponRepository.findOneBy({ id });
    if (!coupon) {
      return {
        code: 404,
        message: '优惠券不存在',
        data: null,
      };
    }

    await this.couponRepository.update(id, updateCouponDto);

    return {
      code: 200,
      message: '更新优惠券成功',
      data: null,
    };
  }

  async remove(id: number) {
    const coupon = await this.couponRepository.findOneBy({ id });
    if (!coupon) {
      return {
        code: 404,
        message: '优惠券不存在',
        data: null,
      };
    }

    await this.couponRepository.update(id, { isActive: false });

    return {
      code: 200,
      message: '删除优惠券成功',
      data: null,
    };
  }

  async getUserCoupons(userId: number) {
    const userCoupons = await this.userCouponRepository
      .createQueryBuilder('userCoupon')
      .leftJoinAndSelect('userCoupon.coupon', 'coupon')
      .where('userCoupon.userId = :userId', { userId })
      .andWhere('coupon.isActive = :isActive', { isActive: true })
      .orderBy('userCoupon.createdAt', 'DESC')
      .getMany();

    return {
      code: 200,
      message: '获取用户优惠券成功',
      data: userCoupons.map((uc) => ({
        ...uc.coupon,
        isUsed: uc.isUsed,
        createdAt: uc.createdAt.toISOString(),
        updatedAt: uc.updatedAt.toISOString(),
      })),
    };
  }

  async getValidCoupons() {
    const coupons = await this.couponRepository
      .createQueryBuilder('coupon')
      .where('coupon.isActive = :isActive', { isActive: true })
      .orderBy('coupon.value', 'DESC')
      .getMany();

    return {
      code: 200,
      message: '获取有效优惠券成功',
      data: coupons,
    };
  }

  async drawCoupon(userId: number) {
    // 获取所有有效的优惠券
    const validCoupons = await this.couponRepository.find({
      where: { isActive: true },
    });

    if (validCoupons.length === 0) {
      throw new BadRequestException('暂无可用优惠券');
    }

    // 生成 0-100 之间的随机数
    const randomNum = Math.random() * 100;
    let accumulatedProbability = 0;
    let selectedCoupon: Coupon | null = null;

    // 根据概率区间选择优惠券
    for (const coupon of validCoupons) {
      accumulatedProbability += coupon.probability || 0;
      if (randomNum <= accumulatedProbability) {
        selectedCoupon = coupon;
        break;
      }
    }

    // 如果没有选中任何优惠券（概率总和小于100的情况），选择最后一个
    if (!selectedCoupon) {
      selectedCoupon = validCoupons[validCoupons.length - 1];
    }

    // 创建用户优惠券记录
    const userCoupon = this.userCouponRepository.create({
      userId,
      couponId: selectedCoupon.id,
      isUsed: false,
    });

    await this.userCouponRepository.save(userCoupon);

    return {
      code: 200,
      message: '领取优惠券成功',
      data: {
        id: selectedCoupon.id,
        code: selectedCoupon.code,
        name: selectedCoupon.name,
        type: selectedCoupon.type,
        value: selectedCoupon.value,
        minAmount: selectedCoupon.minAmount,
        probability: selectedCoupon.probability,
        isUsed: false,
        createdAt: userCoupon.createdAt.toISOString(),
      },
    };
  }

  // 获取所有可抽奖的优惠券列表（用于前端转盘显示）
  async getDrawableCoupons() {
    const coupons = await this.couponRepository.find({
      where: { isActive: true },
      select: ['id', 'name', 'type', 'value', 'minAmount', 'probability'],
    });

    return {
      code: 200,
      message: '获取优惠券列表成功',
      data: coupons.map((coupon) => ({
        id: coupon.id,
        name: coupon.name,
        probability: coupon.probability,
      })),
    };
  }
}

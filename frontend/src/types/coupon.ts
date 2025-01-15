export interface Coupon {
  id: number;
  name: string;
  type: 'amount' | 'discount'; // amount: 固定金额, discount: 折扣
  value: number;
  minAmount: number;
  probability: number; // 抽奖概率(0-100)
  startTime: string;
  endTime: string;
  status: 'valid' | 'invalid';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponParams {
  name: string;
  type: 'amount' | 'discount';
  value: number;
  minAmount: number;
  probability: number;
  startTime: string;
  endTime: string;
}

export interface UpdateCouponParams extends Partial<CreateCouponParams> {
  id: number;
}

export interface CouponListResponse {
  code: number;
  message: string;
  data: {
    list: Coupon[];
    total: number;
  };
} 
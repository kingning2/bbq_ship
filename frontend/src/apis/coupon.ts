import request from '@/utils/request';

export interface Coupon {
  id: number;
  code: string;
  name: string;
  type: 'amount' | 'percentage';  // amount: 固定金额, percentage: 百分比
  value: number;  // 优惠金额或折扣率
  minAmount?: number;  // 最低使用金额
  isActive: boolean;  // 是否有效
  createdAt: string;
  updatedAt: string;
}

export interface CouponListResponse {
  code: number;
  message: string;
  data: {
    list: Coupon[];
    total: number;
  };
}

// 获取优惠券列表
export const getCouponList = (params?: {
  page?: number;
  pageSize?: number;
}) => {
  return request.get<CouponListResponse>('/coupon', { params });
};

// 创建优惠券
export const createCoupon = (data: {
  code: string;
  name: string;
  type: 'amount' | 'percentage';
  value: number;
  minAmount?: number;
}) => {
  return request.post('/coupon', data);
};

// 更新优惠券
export const updateCoupon = (id: number, data: Partial<Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>>) => {
  return request.put(`/coupon/${id}`, data);
};

// 删除优惠券
export const deleteCoupon = (id: number) => {
  return request.delete(`/coupon/${id}`);
};

// 获取用户优惠券
export const getUserCoupons = () => {
  return request.get('/coupon/user');
};

// 获取有效优惠券
export const getValidCoupons = () => {
  return request.get('/coupon/valid');
};

// 领取优惠券
export const drawCoupon = () => {
  return request.post('/coupon/draw');
}; 
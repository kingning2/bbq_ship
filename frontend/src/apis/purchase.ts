import request from '@/utils/request';
import type { PurchaseItem, PurchaseParams } from '@/types/purchase';

// 获取采购列表
export const getPurchaseList = (params: PurchaseParams) => {
  return request.get('/purchase', { params });
};

export interface CreatePurchaseDto {
  productId: number;
  quantity: number;
  price: number;
  supplier: string;
  remark?: string;
}

// 创建采购记录
export const createPurchase = (data: CreatePurchaseDto) => {
  return request.post('/purchase', data);
};

// 删除采购记录
export const deletePurchase = (id: number) => {
  return request.delete(`/purchase/${id}`);
}; 
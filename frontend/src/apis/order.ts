import request from '@/utils/request';

export const getOrderList = (params: any) => {
  return request.get('/order', { params });
};

export const updateOrderStatus = (orderId: number, data: { status: string }) => {
  return request.put(`/order/${orderId}/status`, data);
};

// 创建订单
export const createOrder = (data: {
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  remark?: string;
}) => {
  return request.post('/order', data);
};

export const getOrders = (params: {
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
  return request.get('/order', { params });
};

export const cancelOrder = (orderId: number) => {
  return request.post(`/order/${orderId}/cancel`);
};

// 获取商家订单列表
export const getBusinessOrders = (params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
  return request.get('/order/business', { params });
};
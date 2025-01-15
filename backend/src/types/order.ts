export enum OrderStatus {
  PENDING = 'pending', // 待处理
  PROCESSING = 'processing', // 制作中
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
}

export interface CreateOrderDto {
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  couponId?: number;
  remark?: string;
  deliveryType: 'self' | 'delivery';
  address?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image: string;
  };
}

export interface Order {
  id: number;
  orderNo: string;
  status: OrderStatus;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  deliveryType: 'self' | 'delivery';
  address?: string;
  remark?: string;
  createdAt: string;
  items: OrderItem[];
  user: {
    id: number;
    username: string;
    phone?: string;
  };
  coupon?: {
    id: number;
    name: string;
    type: 'amount' | 'percentage';
    value: number;
  };
}

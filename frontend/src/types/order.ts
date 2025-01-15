export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
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
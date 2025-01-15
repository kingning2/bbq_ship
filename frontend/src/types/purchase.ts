export interface PurchaseItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
  price: number;
  supplier: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseParams {
  page?: number;
  pageSize?: number;
  productId?: number;
  startTime?: string;
  endTime?: string;
} 
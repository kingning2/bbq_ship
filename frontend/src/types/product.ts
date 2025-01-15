export interface ProductItem {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  status: 'on' | 'off';
  isHot: boolean;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductParams {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  status: 'on' | 'off';
  isHot: boolean;
  categoryId: number;
}

export interface UpdateProductParams extends Partial<CreateProductParams> {
  id: number;
}

export interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  name?: string;
  categoryId?: number;
  status?: 'on' | 'off';
  isHot?: boolean;
}

export interface ProductListResponse {
  code: number;
  message: string;
  data: {
    list: ProductItem[];
    total: number;
  } | null;
}

export interface ProductResponse {
  code: number;
  message: string;
  data: ProductItem | null;
} 
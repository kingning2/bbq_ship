import request from '@/utils/request';
import type {
  ProductQueryParams,
  ProductListResponse,
  ProductResponse,
  CreateProductParams,
  UpdateProductParams,
} from '@/types/product';

// 获取商品列表
export const getProductList = (params: ProductQueryParams) => {
  return request.get<ProductListResponse>('/product', { params });
};

// 获取商品详情
export const getProductDetail = (id: number) => {
  return request.get<ProductResponse>(`/product/${id}`);
};

// 创建商品
export const createProduct = (data: CreateProductParams) => {
  return request.post<ProductResponse>('/product', data);
};

// 更新商品
export const updateProduct = ({ id, ...data }: UpdateProductParams) => {
  return request.put<ProductResponse>(`/product/${id}`, data);
};

// 删除商品
export const deleteProduct = (id: number) => {
  return request.delete<ProductResponse>(`/product/${id}`);
};

// 更新商品状态
export const updateProductStatus = (id: number, status: 'on' | 'off') => {
  return request.patch<ProductResponse>(`/product/${id}/status`, { status });
};

// 更新商品热销状态
export const updateProductHot = (id: number, isHot: boolean) => {
  return request.patch<ProductResponse>(`/product/${id}/hot`, { isHot });
}; 
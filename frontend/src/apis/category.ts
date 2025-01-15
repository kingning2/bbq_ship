import request from '@/utils/request';
import type {
  CategoryQueryParams,
  CategoryListResponse,
  CategoryResponse,
  CreateCategoryParams,
  UpdateCategoryParams,
} from '@/types/category';

// 获取分类列表
export const getCategoryList = (params: CategoryQueryParams) => {
  return request.get<CategoryListResponse>('/category', { params });
};

// 获取分类详情
export const getCategoryDetail = (id: number) => {
  return request.get<CategoryResponse>(`/category/${id}`);
};

// 创建分类
export const createCategory = (data: CreateCategoryParams) => {
  return request.post<CategoryResponse>('/category', data);
};

// 更新分类
export const updateCategory = ({ id, ...data }: UpdateCategoryParams) => {
  return request.put<CategoryResponse>(`/category/${id}`, data);
};

// 删除分类
export const deleteCategory = (id: number) => {
  return request.delete<CategoryResponse>(`/category/${id}`);
}; 
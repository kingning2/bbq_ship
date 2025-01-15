// 分类列表项
export interface CategoryItem {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// 创建分类参数
export interface CreateCategoryParams {
  name: string;
  description: string;
}

// 更新分类参数
export interface UpdateCategoryParams extends CreateCategoryParams {
  id: number;
}

// 分页查询参数
export interface CategoryQueryParams {
  page?: number;
  pageSize?: number;
  name?: string;
}

// 分页响应数据
export interface CategoryListResponse {
  code: number;
  message: string;
  data: {
    list: CategoryItem[];
    total: number;
  } | null;
}

// 通用响应数据
export interface CategoryResponse {
  code: number;
  message: string;
  data: CategoryItem | null;
} 
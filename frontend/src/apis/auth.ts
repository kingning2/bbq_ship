import request from '@/utils/request';
import type { LoginParams, LoginResponse } from '@/types/auth';

// 登录接口
export const login = (data: LoginParams) => {
  // 确保密码没有被预处理
  console.log('登录参数:', data);
  return request.post<LoginResponse>('/auth/login', data);
};

// 获取当前用户信息
export const getCurrentUser = () => {
  return request.get<LoginResponse>('/auth/profile');
};

// 退出登录
export const logout = () => {
  return request.post('/auth/logout');
};

// 添加修改密码的接口
export const updatePassword = (data: { oldPassword: string; newPassword: string }) => {
  return request.put('/auth/password', data);
}; 
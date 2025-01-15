// 获取token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 设置token
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// 移除token
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// 获取用户信息
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

// 设置用户信息
export const setUserInfo = (userInfo: any): void => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

// 移除用户信息
export const removeUserInfo = (): void => {
  localStorage.removeItem('userInfo');
};

// 清除所有认证信息
export const clearAuth = (): void => {
  removeToken();
  removeUserInfo();
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// 从token中解析用户ID
export const getUserIdFromToken = (): number | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    // 这里假设token是JWT格式
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload.id;
  } catch (e) {
    console.error('Failed to parse token:', e);
    return null;
  }
}; 
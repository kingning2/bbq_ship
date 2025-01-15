import axios from 'axios';
import { Toast } from 'antd-mobile';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    config.headers['ngrok-skip-browser-warning'] = '69420'
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除本地存储的用户信息
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 跳转到登录页
      window.location.href = '/login';
      
      Toast.show({
        icon: 'fail',
        content: '登录已过期，请重新登录',
      });
    } else {
      Toast.show({
        icon: 'fail',
        content: error.response?.data?.message || '请求失败',
      });
    }
    return Promise.reject(error);
  },
);

export default request; 
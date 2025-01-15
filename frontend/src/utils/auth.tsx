import React from 'react';
import { Navigate } from 'react-router-dom';

interface RequireAuthProps {
  children: JSX.Element;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 如果是商家，但访问的是移动端页面
  if (user.role === 'business' && window.location.pathname.startsWith('/mobile')) {
    return <Navigate to="/admin" replace />;
  }

  // 如果是顾客，但访问的是管理端页面
  if (user.role === 'customer' && window.location.pathname.startsWith('/admin')) {
    return <Navigate to="/mobile/order" replace />;
  }

  return children;
}; 
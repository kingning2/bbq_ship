import React from 'react';
import { RouteObject } from 'react-router-dom';

// 商家端页面组件
const ProductManage = React.lazy(() => import('@/pages/business/product'));
const CategoryManage = React.lazy(() => import('@/pages/business/category'));
const OrderManage = React.lazy(() => import('@/pages/business/order'));
const CouponManage = React.lazy(() => import('@/pages/business/coupon'));
const PurchaseManage = React.lazy(() => import('@/pages/business/purchase'));
const Statistics = React.lazy(() => import('@/pages/business/statistics'));

export const businessRoutes: RouteObject[] = [
  {
    path: 'product',
    element: <ProductManage />,
  },
  {
    path: 'category',
    element: <CategoryManage />,
  },
  {
    path: 'order',
    element: <OrderManage />,
  },
  {
    path: 'coupon',
    element: <CouponManage />,
  },
  {
    path: 'purchase',
    element: <PurchaseManage />,
  },
  {
    path: 'statistics',
    element: <Statistics />,
  },
  {
    path: '',
    element: <ProductManage />,
  },
]; 
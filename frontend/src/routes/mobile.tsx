import { RouteObject } from 'react-router-dom';
import Order from '@/pages/mobile/order';
import Orders from '@/pages/mobile/orders';
import Coupons from '@/pages/mobile/coupons';
import Profile from '@/pages/mobile/profile';
import Checkout from '@/pages/mobile/checkout';

export const mobileRoutes: RouteObject[] = [
  {
    path: 'order',
    element: <Order />,
  },
  {
    path: 'orders',
    element: <Orders />,
  },
  {
    path: 'coupons',
    element: <Coupons />,
  },
  {
    path: 'profile',
    element: <Profile />,
  },
  {
    path: 'checkout',
    element: <Checkout />,
  },
  {
    path: '',
    element: <Order />,
  },
]; 
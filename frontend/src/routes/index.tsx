import { Navigate, RouteObject } from 'react-router-dom';
import Login from '@/pages/login';
import BusinessLayout from '@/layouts/BusinessLayout';
import MobileLayout from '@/layouts/MobileLayout';
import { businessRoutes } from '@/routes/business';
import { mobileRoutes } from '@/routes/mobile';
import { RequireAuth } from '@/utils/auth.tsx';

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/business',
    element: <BusinessLayout />,
    children: businessRoutes,
  },
  {
    path: '/mobile',
    element: (
      <RequireAuth>
        <MobileLayout />
      </RequireAuth>
    ),
    children: mobileRoutes,
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
]; 
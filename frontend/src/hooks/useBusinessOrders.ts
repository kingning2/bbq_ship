import { useState, useCallback } from 'react';
import { message } from 'antd';
import { getBusinessOrders, updateOrderStatus } from '@/apis/order';
import { Order, OrderStatus } from '@/types/order';

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

interface UseBusinessOrdersReturn {
  orders: Order[];
  loading: boolean;
  pagination: PaginationState;
  loadOrders: (params?: any) => Promise<void>;
  handleStatusChange: (orderId: number, status: OrderStatus) => Promise<void>;
  setPagination: (pagination: PaginationState) => void;
}

export const useBusinessOrders = (): UseBusinessOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const loadOrders = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const { data: res } = await getBusinessOrders({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params,
      });

      if (res.code === 200) {
        setOrders(res.data.list);
        setPagination((prev) => ({
          ...prev,
          total: res.data.total,
        }));
      } else {
        message.error(res.message || '加载订单失败');
      }
    } catch (err) {
      console.error('加载订单失败:', err);
      message.error('加载订单失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  const handleStatusChange = useCallback(async (orderId: number, status: OrderStatus) => {
    try {
      const { data: res } = await updateOrderStatus(orderId, { status });
      if (res.code === 200) {
        message.success('更新状态成功');
        loadOrders();
      } else {
        message.error(res.message || '更新状态失败');
      }
    } catch (err) {
      console.error('更新状态失败:', err);
      message.error('更新状态失败');
    }
  }, [loadOrders]);

  return {
    orders,
    loading,
    pagination,
    loadOrders,
    handleStatusChange,
    setPagination,
  };
}; 
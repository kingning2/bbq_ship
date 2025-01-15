import React, { useState, useEffect, useCallback } from 'react';
import { List, Tag, Empty, PullToRefresh, SpinLoading, Image, Button, Dialog, Toast } from 'antd-mobile';
import { getOrderList, cancelOrder } from '@/apis/order';
import styles from './index.module.less';
import dayjs from 'dayjs';
import { useOrderSocket } from '@/hooks/useOrderSocket';

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

interface Coupon {
  id: number;
  name: string;
  type: 'amount' | 'percentage';
  value: number;
}

interface Order {
  id: number;
  orderNo: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  deliveryType: 'self' | 'delivery';
  address?: string;
  remark?: string;
  createdAt: string;
  items: OrderItem[];
  coupon?: Coupon;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: res } = await getOrderList({});
      if (res.code === 200) {
        setOrders(res.data.list);
      }
    } catch (err) {
      console.error('加载订单失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useOrderSocket(loadData);

  const getStatusTag = (status: Order['status']) => {
    const statusMap = {
      pending: { color: 'warning', text: '待处理' },
      processing: { color: 'primary', text: '制作中' },
      completed: { color: 'success', text: '已完成' },
      cancelled: { color: 'danger', text: '已取消' },
    };
    return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
  };

  const renderOrderItems = (items: OrderItem[]) => (
    <div className={styles.items}>
      {items.map((item) => (
        <div key={item.id} className={styles.item}>
          <div className={styles.itemImage}>
            <Image
              src={item.product.image || '/placeholder.png'}
              width={60}
              height={60}
              fit='cover'
              style={{ borderRadius: 4 }}
            />
          </div>
          <div className={styles.itemContent}>
            <div className={styles.itemLeft}>
              <span className={styles.name}>{item.product.name}</span>
              <span className={styles.price}>¥{item.price}</span>
            </div>
            <div className={styles.itemRight}>
              <span className={styles.quantity}>x{item.quantity}</span>
              <span className={styles.subtotal}>
                ¥{(item.quantity * item.price).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPriceInfo = (order: Order) => (
    <div className={styles.priceInfo}>
      <div className={styles.originalPrice}>
        总价：¥{order.originalAmount}
      </div>
      {order.coupon && (
        <div className={styles.discountPrice}>
          <span className={styles.couponName}>{order.coupon.name}</span>
          <span className={styles.discountAmount}>
            -¥{order.discountAmount}
          </span>
        </div>
      )}
      <div className={styles.finalPrice}>
        实付：¥{order.finalAmount}
      </div>
    </div>
  );

  const handleCancel = async (orderId: number) => {
    Dialog.confirm({
      content: '确定要取消订单吗？',
      onConfirm: async () => {
        try {
          const { data: res } = await cancelOrder(orderId);
          if (res.code === 200) {
            Toast.show({
              icon: 'success',
              content: '取消成功',
            });
            loadData();
          }
        } catch (err) {
          Toast.show({
            icon: 'fail',
            content: '取消失败',
          });
        }
      },
    });
  };

  const renderOrderActions = (order: Order) => {
    if (order.status === 'pending') {
      return (
        <div className={styles.actions}>
          <Button
            size='small'
            color='danger'
            fill='outline'
            onClick={() => handleCancel(order.id)}
          >
            取消订单
          </Button>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <SpinLoading color='primary' />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PullToRefresh onRefresh={loadData}>
        {orders.length === 0 ? (
          <Empty description="暂无订单" />
        ) : (
          <List>
            {orders.map((order) => {
              console.log(order);
              
              return <List.Item key={order.id} className={styles.orderItem}>
              <div className={styles.orderHeader}>
                <div className={styles.orderNoWrapper}>
                  <div className={styles.orderNo}>订单号：{order.orderNo}</div>
                  <div className={styles.orderTime}>
                    {dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                  </div>
                </div>
                {getStatusTag(order.status)}
              </div>
              <div className={styles.orderInfo}>
                {renderOrderItems(order.items)}
                <div className={styles.amount}>
                  <span className={styles.total}>
                    共{order.items.reduce((sum, item) => sum + item.quantity, 0)}件
                  </span>
                  {renderPriceInfo(order)}
                </div>
                {order.remark && (
                  <div className={styles.remark}>备注：{order.remark}</div>
                )}
                {order.deliveryType === 'delivery' && order.address && (
                  <div className={styles.address}>配送地址：{order.address}</div>
                )}
                {renderOrderActions(order)}
              </div>
            </List.Item>
            })}
          </List>
        )}
      </PullToRefresh>
    </div>
  );
};

export default OrdersPage; 
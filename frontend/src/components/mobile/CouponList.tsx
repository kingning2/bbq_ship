import React from 'react';
import { Empty, DotLoading } from 'antd-mobile';
import styles from './CouponList.module.less';

interface Coupon {
  id: number;
  code: string;
  name: string;
  type: 'amount' | 'percentage';
  value: number;
  minAmount: number;
  isUsed: boolean;
  createdAt: string;
}

interface CouponListProps {
  coupons: Coupon[];
  loading?: boolean;
}

const CouponList: React.FC<CouponListProps> = ({ coupons = [], loading = false }) => {
  return (
    <div className={styles.couponModal}>
      <div className={styles.title}>我的优惠券</div>
      {loading ? (
        <div className={styles.loading}>
          <DotLoading color='primary' />
          <span>加载中...</span>
        </div>
      ) : coupons.length > 0 ? (
        <div className={styles.couponList}>
          {coupons.map((coupon, index) => (
            <div
              key={index}
              className={`${styles.couponItem} ${
                coupon.isUsed ? styles.used : ''
              }`}
            >
              <div className={styles.couponValue}>
                <span className={styles.number}>
                  {coupon.name}
                </span>
              </div>
              <div className={styles.couponInfo}>
                <div className={styles.couponLimit}>
                  {coupon.minAmount > 0 ? `满${coupon.minAmount}元可用` : '无门槛'}
                </div>
                <div className={styles.couponTime}>
                  领取时间：{new Date(coupon.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div style={{ color: coupon.isUsed ? '#F84945' : '#d4af37' }}>
                  {coupon.isUsed ? '已使用' : '未使用'}
                </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty description="暂无优惠券" />
      )}
    </div>
  );
};

export default CouponList; 
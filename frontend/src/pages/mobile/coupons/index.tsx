import React, { useState, useEffect } from 'react';
import { PullToRefresh, Empty, Toast, DotLoading, Modal } from 'antd-mobile';
import { getUserCoupons, getValidCoupons, drawCoupon } from '@/apis/coupon';
import styles from './index.module.less';
import LuckyWheel from '@/components/mobile/LuckyWheel';
import CouponList from '@/components/mobile/CouponList';

interface Prize {
  id: number;
  name: string;
  probability: number;
}

interface Coupon {
  id: number;
  name: string;
  type: 'amount' | 'discount';
  value: number;
  minAmount: number;
  startTime: string;
  endTime: string;
  status: 'unused' | 'used' | 'expired';
}

const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(false);
  const [wheelLoading, setWheelLoading] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);

  // 加载用户优惠券
  const loadData = async () => {
    try {
      setLoading(true);
      const { data: res } = await getUserCoupons();
      if (res.code === 200) {
        setCoupons(res.data);
        // 检查未使用的优惠券数量
        const unusedCount = res.data.filter(
          (coupon: Coupon) => coupon.status === 'unused'
        ).length;
        setLoading(unusedCount >= 2);
      }
    } catch (error) {
      console.error('加载优惠券失败:', error);
      Toast.show({
        icon: 'fail',
        content: '加载优惠券失败',
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载抽奖奖品
  const loadPrizes = async () => {
    try {
      setWheelLoading(true);
      const { data: res } = await getValidCoupons();
      console.log('获取优惠券响应:', res);

      if (res.code === 200) {
        if (Array.isArray(res.data)) {
          setPrizes(res.data.sort((a, b) => a.id - b.id));
          if (res.data.length === 0) {
            Toast.show({
              icon: 'fail',
              content: '暂无可用优惠券',
            });
          }
        } else {
          console.error('优惠券数据格式错误:', res.data);
          Toast.show({
            icon: 'fail',
            content: '数据格式错误',
          });
        }
      } else {
        Toast.show({
          icon: 'fail',
          content: res.message || '获取优惠券失败',
        });
      }
    } catch (error) {
      console.error('加载奖品列表失败:', error);
      Toast.show({
        icon: 'fail',
        content: '加载失败，请重试',
      });
    } finally {
      setWheelLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadPrizes();
  }, []);

  const handleDrawStart = async () => {
    try {
      const { data: res } = await drawCoupon();
      if (res.code === 200 && res.data) {
        return res.data.code;
      }
      throw new Error(res.message || '抽奖失败');
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: error.message || '抽奖失败',
      });
      return null;
    }
  };

  const onLuckyWheelEnd = (prize: any) => {    
    if (prize) {
      Toast.show({
        icon: 'success',
        content: `恭喜获得${prize.name}`,
      });
      loadData();
      setShowCoupons(true); // 抽奖结束后显示优惠券列表
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wheelContainer}>
        <LuckyWheel
          prizes={prizes}
          onStart={handleDrawStart}
          disabled={loading || coupons.filter(c => !c.isUsed).length >= 3}
          onEnd={onLuckyWheelEnd}
        />
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={styles.couponButton}
          onClick={() => setShowCoupons(true)}
        >
          我的优惠券
        </button>
      </div>

      <Modal
        visible={showCoupons}
        onClose={() => setShowCoupons(false)}
        content={
          <CouponList
            coupons={coupons}
            loading={wheelLoading}
          />
        }
        closeOnMaskClick
        showCloseButton
      />
    </div>
  );
};

export default CouponsPage; 
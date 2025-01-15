import React, { useState } from 'react';
import { List, Button, Modal, Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { getUserCoupons } from '@/apis/coupon';
import CouponList from '@/components/mobile/CouponList';
import styles from './index.module.less';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showCoupons, setShowCoupons] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleShowCoupons = async () => {
    try {
      setLoading(true);
      const { data: res } = await getUserCoupons();
      if (res.code === 200) {
        setCoupons(res.data);
        setShowCoupons(true);
      }
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: '加载优惠券失败',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {user.username?.[0]?.toUpperCase()}
        </div>
        <div className={styles.username}>{user.username}</div>
      </div>

      <List>
        <List.Item
          onClick={handleShowCoupons}
          arrow={true}
        >
          我的优惠券
        </List.Item>
        <List.Item>联系客服</List.Item>
        <List.Item>关于我们</List.Item>
      </List>

      <div className={styles.logout}>
        <Button block color="danger" onClick={handleLogout}>
          退出登录
        </Button>
      </div>

      <Modal
        visible={showCoupons}
        onClose={() => setShowCoupons(false)}
        content={
          <CouponList
            coupons={coupons}
            loading={loading}
          />
        }
        closeOnMaskClick
        showCloseButton
      />
    </div>
  );
};

export default ProfilePage; 
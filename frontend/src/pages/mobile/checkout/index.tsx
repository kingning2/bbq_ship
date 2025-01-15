import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  List,
  Image,
  Button,
  TextArea,
  Toast,
  Dialog,
  Radio,
  Popup,
  Empty,
} from 'antd-mobile';
import { createOrder } from '@/apis/order';
import { getUserCoupons } from '@/apis/coupon';
import styles from './index.module.less';

interface LocationState {
  cart: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
}

interface Coupon {
  id: number;
  name: string;
  type: 'amount' | 'discount';
  value: number;
  minAmount: number;
  endTime: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = location.state as LocationState;
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'takeout' | 'self'>('self');
  const [address, setAddress] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showCoupons, setShowCoupons] = useState(false);

  // 计算商品总价
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // 计算优惠金额
  const discountAmount = selectedCoupon
    ? selectedCoupon.type === 'amount'
      ? +selectedCoupon.value
      : Math.round(totalAmount * (1 - selectedCoupon.value / 10))
    : 0;


  // 实付金额
  const finalAmount = totalAmount - discountAmount;

  // 加载优惠券
  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { data: res } = await getUserCoupons();
      if (res.code === 200) {
        setCoupons(res.data);
      }
    } catch (err) {
      Toast.show({
        icon: 'fail',
        content: '加载优惠券失败',
      });
    }
  };

  // 提交订单
  const handleSubmit = async () => {
    if (deliveryType === 'takeout' && !address) {
      Toast.show({
        icon: 'fail',
        content: '请填写配送地址',
      });
      return;
    }

    try {
      setSubmitting(true);
      const orderData = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        remark,
        deliveryType,
        address: deliveryType === 'takeout' ? address : '',
        couponId: selectedCoupon?.id,
      };

      const { data: res } = await createOrder(orderData);
      if (res.code === 200) {
        Dialog.alert({
          content: '下单成功！',
          onConfirm: () => {
            navigate('/mobile/orders');
          },
        });
      } else {
        Toast.show({
          icon: 'fail',
          content: res.message || '下单失败',
        });
      }
    } catch (err) {
      Toast.show({
        icon: 'fail',
        content: '下单失败',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectCoupon = (coupon: any) => {
    // 判断优惠券是否可用
    if (totalAmount < coupon.minAmount) {
      Toast.show({
        icon: 'fail',
        content: `订单金额需满${coupon.minAmount}元才能使用该优惠券`
      });
      return;
    }
    setSelectedCoupon(coupon);
    setShowCoupons(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <List header="配送方式">
          <List.Item>
            <Radio.Group
              value={deliveryType}
              onChange={(val) => setDeliveryType(val as 'takeout' | 'self')}
            >
              <div className={styles.deliveryOptions}>
                <Radio value="self">到店自取</Radio>
                <Radio value="takeout">外卖配送</Radio>
              </div>
            </Radio.Group>
          </List.Item>
          {deliveryType === 'takeout' && (
            <List.Item>
              <TextArea
                placeholder="请输入配送地址"
                value={address}
                onChange={setAddress}
                rows={2}
              />
            </List.Item>
          )}
        </List>

        <List header="商品清单">
          {cart.map((item) => (
            <List.Item
              key={item.id}
              prefix={
                <Image
                  src={item.image}
                  style={{ borderRadius: 4 }}
                  fit="cover"
                  width={40}
                  height={40}
                />
              }
              extra={`¥${(item.price * item.quantity).toFixed(2)}`}
            >
              <div className={styles.itemInfo}>
                <div className={styles.name}>{item.name}</div>
                <div className={styles.quantity}>x{item.quantity}</div>
              </div>
            </List.Item>
          ))}
        </List>

        <List header="优惠券">
          <List.Item
            extra={
              <div className={styles.couponExtra}>
                <span className={selectedCoupon ? styles.selected : styles.noSelected}>
                  {selectedCoupon
                    ? `省${discountAmount.toFixed(2)}元`
                    : '未选择'}
                </span>
              </div>
            }
            onClick={() => setShowCoupons(true)}
          >
            优惠券
          </List.Item>
        </List>

        <List header="订单备注" className={styles.remarkList}>
          <List.Item>
            <TextArea
              placeholder="请输入备注信息（选填）"
              value={remark}
              onChange={setRemark}
              rows={3}
            />
          </List.Item>
        </List>

        <div className={styles.summary}>
          <div className={styles.amount}>
            <span>商品总额</span>
            <span>¥{totalAmount.toFixed(2)}</span>
          </div>
          {selectedCoupon && (
            <div className={styles.amount}>
              <span>优惠金额</span>
              <span className={styles.discount}>-¥{discountAmount.toFixed(2)}</span>
            </div>
          )}
          {deliveryType === 'takeout' && (
            <div className={styles.amount}>
              <span>配送费</span>
              <span>¥{deliveryFee.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.total}>
          实付金额：
          <span className={styles.price}>¥{finalAmount.toFixed(2)}</span>
        </div>
        <Button
          color="primary"
          onClick={handleSubmit}
          loading={submitting}
          loadingText="提交中"
        >
          提交订单
        </Button>
      </div>

      <Popup
        visible={showCoupons}
        onMaskClick={() => setShowCoupons(false)}
        bodyStyle={{ height: '60vh' }}
      >
        <div className={styles.couponPopup}>
          <div className={styles.couponHeader}>
            <h3>选择优惠券</h3>
            <Button
              fill="none"
              onClick={() => {
                setSelectedCoupon(null);
                setShowCoupons(false);
              }}
            >
              不使用优惠券
            </Button>
          </div>
          <div className={styles.couponList}>
            {coupons.length > 0 ? (
              coupons.map((coupon) => {
                const isDisabled = totalAmount < coupon.minAmount;
                return (
                  <div 
                    key={coupon.id}
                    className={`${styles.couponItem} ${isDisabled ? styles.disabled : ''} ${
                      selectedCoupon?.id === coupon.id ? styles.active : ''
                    }`}
                    onClick={() => !isDisabled && handleSelectCoupon(coupon)}
                  >
                    <div className={styles.couponValue}>
                      {coupon.type === 'amount' ? (
                        <>
                          <span className={styles.symbol}>¥</span>
                          <span className={styles.number}>{coupon.value}</span>
                        </>
                      ) : (
                        <>
                          <span className={styles.number}>{+coupon.value}</span>
                          <span className={styles.symbol}>折</span>
                        </>
                      )}
                    </div>
                    <div className={styles.couponInfo}>
                      <div className={styles.couponName}>{coupon.name}</div>
                      <div className={styles.couponLimit}>
                        满{coupon.minAmount}元可用
                        {isDisabled && <span className={styles.disabledTip}>（当前订单金额不满足使用条件）</span>}
                      </div>
                      <div className={styles.couponTime}>
                        有效期至：{new Date(coupon.endTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <Empty description="暂无优惠券" />
            )}
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default CheckoutPage; 
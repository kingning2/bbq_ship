import React, { useState, useEffect } from 'react';
import {
  List,
  Image,
  Button,
  Badge,
  Popup,
  Stepper,
  Empty,
  Toast,
  Tag,
} from 'antd-mobile';
import { DeleteOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { getProductList } from '@/apis/product';
import { getCategoryList } from '@/apis/category';
import styles from './index.module.less';

const OrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载分类和商品数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoryRes, productRes] = await Promise.all([
        getCategoryList({}),
        getProductList({
          status: 'on',
          pageSize: 100
        }),
      ]);

      if (categoryRes.data.code === 200) {
        setCategories(categoryRes.data.data.list);
      }

      if (productRes.data.code === 200) {
        setProducts(productRes.data.data.list);
      }
    } catch (err) {
      Toast.show({
        icon: 'fail',
        content: '加载数据失败',
      });
    } finally {
      setLoading(false);
    }
  };

  // 添加到购物车
  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    Toast.show({
      icon: 'success',
      content: '已添加到购物车',
    });
  };

  // 更新购物车商品数量
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity } : item,
        ),
      );
    }
  };

  // 清空购物车
  const clearCart = () => {
    setCart([]);
    Toast.show({
      icon: 'success',
      content: '购物车已清空',
    });
  };

  // 计算总价
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // 提交订单
  const submitOrder = () => {
    if (cart.length === 0) {
      Toast.show({
        icon: 'fail',
        content: '购物车为空',
      });
      return;
    }
    navigate('/mobile/checkout', { state: { cart } });
  };

  // 过滤商品列表
  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.categoryId === Number(activeCategory));

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div
            className={`${styles.categoryItem} ${styles.all} ${
              activeCategory === 'all' ? styles.active : ''
            }`}
            onClick={() => setActiveCategory('all')}
          >
            全部
          </div>
          {categories.map((category) => (
            <div
              key={category.id}
              className={`${styles.categoryItem} ${
                activeCategory === category.id ? styles.active : ''
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </div>
          ))}
        </div>

        <div style={{
          paddingBottom: cart.length > 0 ? '74px' : '0',
        }} className={styles.productList}>
          {filteredProducts.map((product) => (
            <div key={product.id} className={styles.productItem}>
              <Image
                src={product.image}
                alt={product.name}
                className={styles.productImage}
              />
              <div className={styles.productInfo}>
                <div className={styles.productName}>{product.name}</div>
                <div className={styles.productDesc}>{product.description}</div>
                <div className={styles.productPrice}>
                  <span className={styles.price}>¥{product.price}</span>
                  {product.isHot && (
                    <Tag color="danger" className={styles.hotTag}>
                      热销
                    </Tag>
                  )}
                </div>
                <div className={styles.productStats}>
                  <span className={styles.sales}>已售 {product.salesCount || 0}</span>
                  <span className={`${styles.stock} ${product.stock > 10 ? styles.sufficient : styles.insufficient}`}>
                    {product.stock > 10 ? '库存充足' : `剩余 ${product.stock} 份`}
                  </span>
                </div>
                <div className={styles.productAction}>
                  {cart.find((item) => item.id === product.id)?.quantity > 0 ? (
                    <Stepper
                      min={0}
                      max={product.stock}
                      value={cart.find((item) => item.id === product.id)?.quantity || 0}
                      onChange={(value) => updateQuantity(product.id, value)}
                    />
                  ) : (
                    <Button
                      color="primary"
                      size="small"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? '已售罄' : '加入购物车'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className={styles.noMore}>已经到底啦</div>
        </div>
      </div>

      {cart.length > 0 && (
        <div className={styles.cartBar}>
          <Badge content={cart.length} className={styles.cartBadge}>
            <Button
              color="primary"
              fill="outline"
              onClick={() => setCartVisible(true)}
            >
              购物车
            </Button>
          </Badge>
          <div className={styles.cartInfo}>
            <div className={styles.totalAmount}>¥{totalAmount.toFixed(2)}</div>
            <Button color="primary" onClick={submitOrder}>
              去结算
            </Button>
          </div>
        </div>
      )}

      <Popup
        visible={cartVisible}
        onMaskClick={() => setCartVisible(false)}
        position="bottom"
        bodyStyle={{ height: '60vh' }}
      >
        <div className={styles.cartPopup}>
          <div className={styles.cartHeader}>
            <h3>购物车</h3>
            <Button
              fill="none"
              onClick={clearCart}
              icon={<DeleteOutline />}
            >
              清空
            </Button>
          </div>
          {cart.length === 0 ? (
            <Empty description="购物车为空" />
          ) : (
            <List className={styles.cartList}>
              {cart.map((item) => (
                <List.Item
                  key={item.id}
                  prefix={
                    <Image
                      src={item.image}
                      alt={item.name}
                      className={styles.cartItemImage}
                    />
                  }
                  extra={
                    <Stepper
                      min={0}
                      value={item.quantity}
                      onChange={(value) => updateQuantity(item.id, value)}
                    />
                  }
                >
                  <div className={styles.cartItemInfo}>
                    <div className={styles.cartItemName}>{item.name}</div>
                    <div className={styles.cartItemPrice}>
                      ¥{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </List.Item>
              ))}
            </List>
          )}
          <div className={styles.cartFooter}>
            <div className={styles.totalAmount}>
              合计：¥{totalAmount.toFixed(2)}
            </div>
            <Button color="primary" onClick={submitOrder}>
              去结算
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default OrderPage; 
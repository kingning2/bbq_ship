import React from 'react'
import { TabBar, NavBar } from 'antd-mobile'
import { ShopbagOutline, ReceiptOutline, UserOutline, CouponOutline } from 'antd-mobile-icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import styles from './MobileLayout.module.less'

const MobileLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { pathname } = location

  // 获取当前页面标题
  const getPageTitle = () => {
    switch (pathname) {
      case '/mobile/order':
        return 'BBQ点餐'
      case '/mobile/orders':
        return '我的订单'
      case '/mobile/coupons':
        return '优惠券'
      case '/mobile/profile':
        return '个人中心'
      case '/mobile/checkout':
        return '确认订单'
      default:
        return 'BBQ点餐系统'
    }
  }

  const onBack = () => {
    if (pathname !== '/mobile/order') {
      navigate('/mobile/order')
    }
  }

  // 底部标签页配置
  const tabs = [
    {
      key: '/mobile/order',
      title: '点餐',
      icon: <ShopbagOutline />,
    },
    {
      key: '/mobile/orders',
      title: '订单',
      icon: <ReceiptOutline />,
    },
    {
      key: '/mobile/coupons',
      title: '优惠券',
      icon: <CouponOutline />,
    },
    {
      key: '/mobile/profile',
      title: '我的',
      icon: <UserOutline />,
    },
  ]

  const isNavBar = (path: string) => {
    return tabs.map((item) => item.key).includes(path)
  }

  return (
    <div className={styles.container}>
      {!isNavBar(pathname) ? (
        <NavBar className={styles.navbar} onBack={onBack}>
          {getPageTitle()}
        </NavBar>
      ) : (
        <div className={styles.navbar}>{getPageTitle()}</div>
      )}
      <div className={styles.content}>
        <Outlet />
      </div>

      {pathname !== '/mobile/checkout' && (
        <TabBar
          className={styles.tabbar}
          activeKey={pathname}
          onChange={(value) => navigate(value)}
        >
          {tabs.map((item) => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      )}
    </div>
  )
}

export default MobileLayout

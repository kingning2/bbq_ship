import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Avatar, Space, Dropdown, Modal, Form, Input, message } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShopOutlined,
  OrderedListOutlined,
  GiftOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  UserOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import AuthRoute from '@/components/common/AuthRoute';
import styles from './BusinessLayout.module.less';
import { updatePassword } from '@/apis/auth';

const { Header, Sider, Content } = Layout;

const BusinessLayout: React.FC = () => {
  // 从localStorage获取初始折叠状态
  const [collapsed, setCollapsed] = useState(() => {
    const savedCollapsed = localStorage.getItem('menuCollapsed');
    return savedCollapsed ? JSON.parse(savedCollapsed) : false;
  });

  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 获取当前展开的子菜单
  const getDefaultOpenKeys = () => {
    const pathParts = location.pathname.split('/');
    if (pathParts.length >= 2) {
      return [`/${pathParts[1]}`];
    }
    return [];
  };

  // 保存折叠状态到localStorage
  useEffect(() => {
    localStorage.setItem('menuCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // 菜单项配置
  const menuItems = [
    {
      key: '/business',
      icon: <ShopOutlined />,
      label: '商品管理',
      children: [
        {
          key: '/business/product',
          icon: <ShopOutlined />,
          label: '商品列表',
        },
        {
          key: '/business/category',
          icon: <AppstoreOutlined />,
          label: '分类管理',
        },
        {
          key: '/business/purchase',
          icon: <ShoppingOutlined />,
          label: '采购管理',
        },
      ],
    },
    
    {
      key: '/business/order',
      icon: <OrderedListOutlined />,
      label: '订单管理',
    },
    {
      key: '/business/coupon',
      icon: <GiftOutlined />,
      label: '优惠券管理',
    },
    {
      key: '/business/statistics',
      icon: <BarChartOutlined />,
      label: '数据统计',
    },
  ];

  // 处理退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('menuCollapsed'); // 清除菜单状态
    navigate('/login');
  };

  // 获取当前用户信息
  const [username, setUsername] = useState('');
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUsername(user.username);
    }
  }, []);

  const [passwordForm] = Form.useForm();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // 处理修改密码
  const handleUpdatePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      const { data: res } = await updatePassword(values);
      if (res.code === 200) {
        message.success('密码修改成功，请重新登录');
        handleLogout();
      } else {
        message.error(res.message);
      }
    } catch (err) {
      message.error('修改密码失败');
    }
  };

  // 用户菜单项
  const userMenuItems = [
    {
      key: 'password',
      icon: <KeyOutlined />,
      label: '修改密码',
      onClick: () => setPasswordModalVisible(true),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <AuthRoute requiredRole="business">
      <Layout className={styles.layout}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className={styles.logo}>BBQ</div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={getDefaultOpenKeys()}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Layout className={styles.layout}>
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <div className={styles.headerContent}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className={styles.trigger}
              />
              <div className={styles.userInfo}>
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <Space className={styles.userDropdown}>
                    <Avatar 
                      icon={<UserOutlined />} 
                      style={{ backgroundColor: '#D4AF37' }}
                    />
                    <span className={styles.username}>{username}</span>
                  </Space>
                </Dropdown>
              </div>
            </div>
          </Header>
          <Content className={styles.content}>
            <div
              style={{
                height: '100%',
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Outlet />
            </div>
          </Content>
        </Layout>
        
        <Modal
          title="修改密码"
          open={passwordModalVisible}
          onOk={handleUpdatePassword}
          onCancel={() => {
            setPasswordModalVisible(false);
            passwordForm.resetFields();
          }}
          maskClosable={false}
        >
          <Form form={passwordForm} layout="vertical">
            <Form.Item
              name="oldPassword"
              label="原密码"
              rules={[
                { required: true, message: '请输入原密码' },
                { min: 6, message: '密码长度不能小于6位' },
              ]}
            >
              <Input.Password placeholder="请输入原密码" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码长度不能小于6位' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('oldPassword') !== value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('新密码不能与原密码相同'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请确认新密码" />
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </AuthRoute>
  );
};

export default BusinessLayout; 
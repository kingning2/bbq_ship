import React, { useState } from 'react';
import { Form, Input, Button, Toast, Radio, Space, Dialog } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { login } from '@/apis/auth';
import styles from './index.module.less';

interface LoginForm {
  username?: string;
  phone?: string;
  password: string;
  role: 'customer' | 'business';
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [role, setRole] = useState<'customer' | 'business'>('customer');

  const onFinish = async (values: LoginForm) => {
    try {
      const { data: res } = await login(values);
      if (res.code === 200) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        Toast.show({
          icon: 'success',
          content: '登录成功',
        });

        if (res.data.user.role === 'business') {
          navigate('/business');
        } else {
          navigate('/mobile/order');
        }
      }
    } catch (error) {
      console.error('登录失败:', error);
      Toast.show({
        icon: 'fail',
        content: '登录失败',
      });
    }
  };

  const handleRoleChange = (value: 'customer' | 'business') => {
    setRole(value);
    form.setFieldsValue({ role: value, phone: undefined });
  };

  const showHelp = () => {
    Dialog.alert({
      title: '帮助说明',
      content: role === 'customer' 
        ? '顾客账号可以自动注册，首次登录时需要填写手机号。' 
        : '商家账号需要管理员创建，请联系管理员获取账号。',
      confirmText: '知道了',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2>BBQ点餐系统</h2>
        <Form
          form={form}
          layout='vertical'
          onFinish={onFinish}
          footer={
            <Button block type='submit' color='primary'>
              登录
            </Button>
          }
          initialValues={{ role: 'customer' }}
        >
          {role === 'business' ? (
            <Form.Item
              name='username'
              label='用户名'
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder='请输入用户名' />
            </Form.Item>
          ) : (
            <Form.Item
              name='phone'
              label='手机号'
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
              ]}
            >
              <Input placeholder='请输入手机号' type='tel' maxLength={11} />
            </Form.Item>
          )}
          
          <Form.Item
            name='password'
            label='密码'
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input type='password' placeholder='请输入密码' />
          </Form.Item>
          
          <Form.Item
            name='role'
            label={
              <div className={styles.roleLabel}>
                <span>角色</span>
                <a onClick={showHelp}>帮助</a>
              </div>
            }
          >
            <Radio.Group onChange={handleRoleChange}>
              <Space direction='horizontal'>
                <Radio value='customer'>顾客</Radio>
                <Radio value='business'>商家</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage; 
import React, { useEffect } from 'react';
import {
  Table,
  Card,
  Space,
  Tag,
  Button,
  Select,
  Form,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useBusinessOrders } from '@/hooks/useBusinessOrders';
import { OrderStatus } from '@/types/order';
import dayjs from 'dayjs';
import styles from './index.module.less';

const { Option } = Select;

const OrderPage: React.FC = () => {
  const [form] = Form.useForm();
  const {
    orders,
    loading,
    pagination,
    loadOrders,
    handleStatusChange,
    setPagination,
  } = useBusinessOrders();

  useEffect(() => {
    loadOrders();
  }, [pagination.current, pagination.pageSize]);

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: '下单用户',
      dataIndex: ['user', 'username'],
      key: 'username',
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => {
        const statusMap = {
          [OrderStatus.PENDING]: { text: '待处理', color: 'warning' },
          [OrderStatus.PROCESSING]: { text: '制作中', color: 'processing' },
          [OrderStatus.COMPLETED]: { text: '已完成', color: 'success' },
          [OrderStatus.CANCELLED]: { text: '已取消', color: 'error' },
        };
        return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
      },
    },
    {
      title: '商品信息',
      key: 'items',
      render: (_, record: any) => (
        <div>
          {record.items.map((item: any) => (
            <div key={item.id}>
              {item.product.name} x {item.quantity}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: '订单金额',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (amount: number) => `¥${amount}`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: any) => {
        if (record.status === OrderStatus.CANCELLED || 
            record.status === OrderStatus.COMPLETED) {
          return null;
        }

        const nextStatus = {
          [OrderStatus.PENDING]: OrderStatus.PROCESSING,
          [OrderStatus.PROCESSING]: OrderStatus.COMPLETED,
        }[record.status];

        if (!nextStatus) return null;

        const buttonText = {
          [OrderStatus.PROCESSING]: '开始制作',
          [OrderStatus.COMPLETED]: '完成订单',
        }[nextStatus];

        return (
          <Button
            type="primary"
            onClick={() => handleStatusChange(record.id, nextStatus)}
          >
            {buttonText}
          </Button>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <Card
        title="订单管理"
        extra={
          <Form form={form} layout="inline" onFinish={() => loadOrders()}>
            <Form.Item name="status" label="订单状态">
              <Select
                placeholder="请选择状态"
                allowClear
                style={{ width: 200 }}
              >
                <Option value={OrderStatus.PENDING}>待处理</Option>
                <Option value={OrderStatus.PROCESSING}>制作中</Option>
                <Option value={OrderStatus.COMPLETED}>已完成</Option>
                <Option value={OrderStatus.CANCELLED}>已取消</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                >
                  搜索
                </Button>
                <Button onClick={() => form.resetFields()}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
        }
      >
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Card>
    </div>
  );
};

export default OrderPage; 
import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Space,
  Tag,
  Button,
  Form,
  Select,
  Drawer,
  Descriptions,
  Image,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useBusinessOrders } from '@/hooks/useBusinessOrders';
import { Order, OrderStatus } from '@/types/order';
import { useOrderSocket } from '@/hooks/useOrderSocket';
import dayjs from 'dayjs';
import styles from './index.module.less';

const { Option } = Select;

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image: string;
  };
}

const OrderManage: React.FC = () => {
  const [form] = Form.useForm();
  const {
    orders,
    loading,
    pagination,
    loadOrders,
    handleStatusChange,
    setPagination,
  } = useBusinessOrders();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // 使用自定义 hook 处理 WebSocket
  useOrderSocket(() => loadOrders());

  // 处理查看详情
  const handleViewDetail = (record: Order) => {
    setCurrentOrder(record);
    setDrawerVisible(true);
  };

  // 表格列定义
  const columns: ColumnsType<Order> = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      align: 'center',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      ),
    },
    {
      title: '顾客',
      dataIndex: ['user', 'username'],
      key: 'username',
      align: 'center',
    },
    {
      title: '商品总额',
      dataIndex: 'originalAmount',
      key: 'originalAmount',
      align: 'center',
      render: (text) => `¥${text}`,
    },
    {
      title: '优惠金额',
      dataIndex: 'discountAmount',
      key: 'discountAmount',
      align: 'center',
      render: (text) => `¥${text}`,
    },
    {
      title: '实付金额',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      align: 'center',
      render: (text) => `¥${text}`,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: OrderStatus) => {
        const statusMap = {
          [OrderStatus.PENDING]: { color: 'gold', text: '待处理' },
          [OrderStatus.PROCESSING]: { color: 'blue', text: '制作中' },
          [OrderStatus.COMPLETED]: { color: 'green', text: '已完成' },
          [OrderStatus.CANCELLED]: { color: 'red', text: '已取消' },
        };
        return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
      },
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 200,
      render: (_, record) => (
        <Space>
          {record.status === OrderStatus.PENDING && (
            <>
              <Button
                type="primary"
                onClick={() => handleStatusChange(record.id, OrderStatus.PROCESSING)}
              >
                开始制作
              </Button>
              <Button
                danger
                onClick={() => handleStatusChange(record.id, OrderStatus.CANCELLED)}
              >
                取消订单
              </Button>
            </>
          )}
          {record.status === OrderStatus.PROCESSING && (
            <Button
              type="primary"
              onClick={() => handleStatusChange(record.id, OrderStatus.COMPLETED)}
            >
              完成订单
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 订单详情商品列表列定义
  const orderItemColumns: ColumnsType<OrderItem> = [
    {
      title: '商品图片',
      dataIndex: ['product', 'image'],
      key: 'image',
      align: 'center',
      width: 100,
      render: (text) => (
        <Image
          src={text || 'https://via.placeholder.com/100'}
          alt="商品图片"
          width={60}
          height={60}
          style={{ objectFit: 'cover' }}
        />
      ),
    },
    {
      title: '商品名称',
      dataIndex: ['product', 'name'],
      key: 'name',
      align: 'center',
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      render: (text) => `¥${text}`,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: '小计',
      key: 'subtotal',
      align: 'center',
      render: (_, record) => `¥${(record.price * record.quantity).toFixed(2)}`,
    },
  ];

  useEffect(() => {
    loadOrders();
  }, [pagination.current, pagination.pageSize]);

  return (
    <div className={styles.container}>
      <Card
        title="订单管理"
        extra={
          <Form form={form} layout="inline" onFinish={() => loadOrders(form.getFieldsValue())}>
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
                <Button onClick={() => {
                  form.resetFields();
                  loadOrders();
                }}>
                  重置
                </Button>
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
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Card>

      <Drawer
        title="订单详情"
        placement="right"
        width={800}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {currentOrder && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="订单号">
                {currentOrder.orderNo}
              </Descriptions.Item>
              <Descriptions.Item label="下单时间">
                {currentOrder.createdAt}
              </Descriptions.Item>
              <Descriptions.Item label="顾客">
                {currentOrder.user.username}
              </Descriptions.Item>
              <Descriptions.Item label="订单状态">
                <Tag color={
                  {
                    [OrderStatus.PENDING]: 'gold',
                    [OrderStatus.PROCESSING]: 'blue',
                    [OrderStatus.COMPLETED]: 'green',
                    [OrderStatus.CANCELLED]: 'red',
                  }[currentOrder.status]
                }>
                  {
                    {
                      [OrderStatus.PENDING]: '待处理',
                      [OrderStatus.PROCESSING]: '制作中',
                      [OrderStatus.COMPLETED]: '已完成',
                      [OrderStatus.CANCELLED]: '已取消',
                    }[currentOrder.status]
                  }
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="商品总额">
                ¥{currentOrder.originalAmount}
              </Descriptions.Item>
              <Descriptions.Item label="优惠金额">
                ¥{currentOrder.discountAmount}
              </Descriptions.Item>
              <Descriptions.Item label="实付金额" span={2}>
                <span style={{ color: '#f50', fontSize: '16px', fontWeight: 'bold' }}>
                  ¥{currentOrder.finalAmount}
                </span>
              </Descriptions.Item>
              {currentOrder.remark && (
                <Descriptions.Item label="备注" span={2}>
                  {currentOrder.remark}
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginTop: '24px' }}>
              <h3>商品明细</h3>
              <Table
                columns={orderItemColumns}
                dataSource={currentOrder.items}
                rowKey="id"
                pagination={false}
              />
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              {currentOrder.status === OrderStatus.PENDING && (
                <Space>
                  <Button
                    type="primary"
                    onClick={() => handleStatusChange(currentOrder.id, OrderStatus.PROCESSING)}
                  >
                    开始制作
                  </Button>
                  <Button
                    danger
                    onClick={() => handleStatusChange(currentOrder.id, OrderStatus.CANCELLED)}
                  >
                    取消订单
                  </Button>
                </Space>
              )}
              {currentOrder.status === OrderStatus.PROCESSING && (
                <Button
                  type="primary"
                  onClick={() => handleStatusChange(currentOrder.id, OrderStatus.COMPLETED)}
                >
                  完成订单
                </Button>
              )}
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default OrderManage; 
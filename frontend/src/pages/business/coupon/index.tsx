import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  getCouponList,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '@/apis/coupon';
import type { Coupon } from '@/types/coupon';
import styles from './index.module.less';

const { RangePicker } = DatePicker;
const { Option } = Select;

const CouponManage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 表格列定义
  const columns: ColumnsType<Coupon> = [
    {
      title: '优惠券名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      render: (text) => (text === 'amount' ? '固定金额' : '折扣比例'),
    },
    {
      title: '优惠值',
      key: 'value',
      align: 'center',
      render: (_, record) =>
        record.type === 'amount' ? `¥${record.value}` : `${record.value}%`,
    },
    {
      title: '最低使用金额',
      dataIndex: 'minAmount',
      key: 'minAmount',
      align: 'center',
      render: (text) => (text ? `¥${text}` : '--'),
    },
    {
      title: '抽奖概率',
      dataIndex: 'probability',
      key: 'probability',
      align: 'center',
      render: (text) => (text ? `${text}%` : '100%'),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? '有效' : '无效'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该优惠券吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 加载数据
  const loadData = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      const { data: res } = await getCouponList();
      if (res.code === 200) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } catch (err) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 处理编辑
  const handleEdit = (record: Coupon) => {
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      type: record.type,
      value: record.value,
      minAmount: record.minAmount,
      probability: record.probability,
    });
    setEditingId(record.id);
    setModalVisible(true);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      const { data: res } = await deleteCoupon(id);
      if (res.code === 200) {
        message.success('删除成功');
        loadData();
      }
    } catch (err) {
      message.error('删除失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 构造请求参数
      const params = {
        code: editingId 
          ? values.code
          : `COUPON${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: values.name,
        type: values.type,
        value: values.value,
        minAmount: values.minAmount || 0,
        probability: values.probability || 100,
      };

      if (editingId) {
        const { data: res } = await updateCoupon(editingId, params);
        if (res.code === 200) {
          message.success('更新成功');
        }
      } else {
        const { data: res } = await createCoupon(params);
        if (res.code === 200) {
          message.success('创建成功');
        }
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error('操作失败:', err);
      message.error('操作失败');
    }
  };

  return (
    <div className={styles.container}>
      <Card
        title="优惠券管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            添加优惠券
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200, y: 350 }}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
              loadData(page, size);
            },
          }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑优惠券' : '添加优惠券'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        maskClosable={false}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            hidden
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="优惠券名称"
            rules={[{ required: true, message: '请输入优惠券名称' }]}
          >
            <Input placeholder="请输入优惠券名称" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="type"
            label="优惠券类型"
            rules={[{ required: true, message: '请选择优惠券类型' }]}
          >
            <Select placeholder="请选择优惠券类型">
              <Option value="amount">固定金额</Option>
              <Option value="percentage">折扣比例</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.type !== curr.type}
          >
            {({ getFieldValue }) => (
              <Form.Item
                label={getFieldValue('type') === 'amount' ? '优惠金额' : '折扣比例'}
                name="value"
                rules={[
                  { required: true, message: '请输入优惠值' },
                  {
                    type: 'number',
                    min: 0,
                    max: getFieldValue('type') === 'percentage' ? 100 : 999999,
                    message: getFieldValue('type') === 'percentage' ? '折扣比例不能超过100%' : '金额不能小于0',
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={getFieldValue('type') === 'percentage' ? 100 : undefined}
                  precision={2}
                  placeholder={getFieldValue('type') === 'amount' ? '请输入优惠金额' : '请输入折扣比例(0-100)'}
                  style={{ width: '100%' }}
                  addonAfter={getFieldValue('type') === 'percentage' ? '%' : '元'}
                />
              </Form.Item>
            )}
          </Form.Item>

          <Form.Item
            name="minAmount"
            label="最低使用金额"
            rules={[
              { type: 'number', min: 0, message: '最低使用金额不能小于0' },
            ]}
          >
            <InputNumber
              min={0}
              precision={2}
              placeholder="请输入最低使用金额"
              style={{ width: '100%' }}
              addonAfter="元"
            />
          </Form.Item>

          <Form.Item
            name="probability"
            label="抽奖概率"
            rules={[
              { type: 'number', min: 0, max: 100, message: '抽奖概率必须在0-100之间' },
            ]}
          >
            <InputNumber
              min={0}
              max={100}
              precision={2}
              placeholder="请输入抽奖概率(0-100)"
              style={{ width: '100%' }}
              addonAfter="%"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponManage; 
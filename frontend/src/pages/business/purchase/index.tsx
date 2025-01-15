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
  message,
  Popconfirm,
  Image,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getPurchaseList, createPurchase, deletePurchase } from '@/apis/purchase';
import { getProductList } from '@/apis/product';
import type { PurchaseItem } from '@/types/purchase';
import type { ProductItem } from '@/types/product';
import styles from './index.module.less';

const { Option } = Select;
const { RangePicker } = DatePicker;

const PurchaseManage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PurchaseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [products, setProducts] = useState<ProductItem[]>([]);

  // 加载商品数据
  const loadProducts = async () => {
    try {
      const { data: res } = await getProductList({ pageSize: 999 });
      if (res.code === 200 && res.data) {
        setProducts(res.data.list);
      }
    } catch (err) {
      message.error('加载商品数据失败');
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // 加载采购数据
  const loadData = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      const values = await searchForm.validateFields().catch(() => ({}));
      const { dateRange, ...rest } = values;
      const params = {
        page,
        pageSize: size,
        ...rest,
        startTime: dateRange?.[0]?.format('YYYY-MM-DD'),
        endTime: dateRange?.[1]?.format('YYYY-MM-DD'),
      };
      const { data: res } = await getPurchaseList(params);
      if (res.code === 200 && res.data) {
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

  // 表格列定义
  const columns: ColumnsType<PurchaseItem> = [
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
      key: 'productName',
      align: 'center',
    },
    {
      title: '采购数量',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 100,
    },
    {
      title: '采购单价',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      width: 100,
      render: (text) => `¥${text}`,
    },
    {
      title: '采购总价',
      key: 'totalPrice',
      align: 'center',
      width: 100,
      render: (_, record) => `¥${(record.price * record.quantity).toFixed(2)}`,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      align: 'center',
      render: (text) => text || '--'
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      align: 'center',
      render: (text) => text || '--'
    },
    {
      title: '采购时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定要删除该采购记录吗？"
          description="删除后无法恢复，请谨慎操作"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      const { data: res } = await deletePurchase(id);
      if (res.code === 200) {
        message.success('删除成功');
        loadData();
      } else {
        message.error(res.message);
      }
    } catch (err) {
      message.error('删除失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { data: res } = await createPurchase(values);
      if (res.code === 200) {
        message.success('添加成功');
        setModalVisible(false);
        form.resetFields();
        loadData();
      } else {
        message.error(res.message);
      }
    } catch (err) {
      message.error('操作失败');
    }
  };

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    loadData(pagination.current, pagination.pageSize);
  };

  // 处理搜索
  const handleSearch = () => {
    setCurrentPage(1);
    loadData(1, pageSize);
  };

  // 处理重置
  const handleReset = () => {
    searchForm.resetFields();
    setCurrentPage(1);
    loadData(1, pageSize);
  };

  // 处理添加按钮点击
  const handleAdd = () => {
    form.resetFields();
    // 设置供应商默认值为当前用户名
    form.setFieldValue('supplier', '市场采购');
    setModalVisible(true);
  };

  return (
    <div className={styles.container}>
      <Card
        title="采购管理"
        extra={
          <Space>
            <Form
              form={searchForm}
              layout="inline"
              onFinish={handleSearch}
            >
              <Form.Item name="productId" label="商品">
                <Select
                  placeholder="请选择商品"
                  allowClear
                  style={{ width: 200 }}
                >
                  {products.map((product) => (
                    <Option key={product.id} value={product.id}>
                      {product.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="dateRange" label="采购时间">
                <RangePicker style={{ width: 250 }} />
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
                  <Button onClick={handleReset}>重置</Button>
                </Space>
              </Form.Item>
            </Form>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              添加采购
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ y: 'calc(100vh - 300px)' }}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            position: ['bottomCenter']
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title="添加采购"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        maskClosable={false}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="productId"
            label="商品"
            rules={[{ required: true, message: '请选择商品' }]}
          >
            <Select placeholder="请选择商品">
              {products.map((product) => (
                <Option key={product.id} value={product.id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="quantity"
            label="采购数量"
            rules={[{ required: true, message: '请输入采购数量' }]}
          >
            <InputNumber
              min={1}
              placeholder="请输入采购数量"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="采购单价"
            rules={[{ required: true, message: '请输入采购单价' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              precision={2}
              prefix="¥"
              placeholder="请输入采购单价"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="supplier"
            label="供应商"
            rules={[{ required: true, message: '请输入供应商' }]}
            initialValue={'市场采购'}
          >
            <Input 
              placeholder="请输入供应商" 
              disabled // 禁用输入，使用当前用户名作为固定值
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea
              placeholder="请输入备注"
              rows={4}
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PurchaseManage; 
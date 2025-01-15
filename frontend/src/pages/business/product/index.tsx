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
  Switch,
  Upload,
  message,
  Popconfirm,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getProductList,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  updateProductHot,
} from '@/apis/product';
import { getCategoryList } from '@/apis/category';
import type { ProductItem } from '@/types/product';
import type { CategoryItem } from '@/types/category';
import styles from './index.module.less';

const { Option } = Select;

interface ProductItem {
  soldQuantity: number;
}

const ProductManage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [previewUrl, setPreviewUrl] = useState('');

  // 加载分类数据
  const loadCategories = async () => {
    try {
      const { data: res } = await getCategoryList({});
      if (res.code === 200 && res.data) {
        setCategories(res.data.list);
      }
    } catch (err) {
      message.error('加载分类数据失败');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // 加载数据
  const loadData = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      const values = await searchForm.validateFields().catch(() => ({}));
      const { data: res } = await getProductList({
        page,
        pageSize: size,
        ...values,
      });
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
  const columns: ColumnsType<ProductItem> = [
    {
      title: '商品图片',
      dataIndex: 'image',
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
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 80,
      align: 'center',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      render: (text) => `¥${text}`,
      width: 100,
    },
    {
      title: '库存',
      key: 'stock',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>总库存：{record.stock}</div>
          <div>已售：{record.soldQuantity}</div>
          <div>可用：{record.stock - record.soldQuantity}</div>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (text, record) => (
        <Switch
          checked={text === 'on'}
          onChange={(checked) =>
            handleStatusChange(record.id, checked ? 'on' : 'off')
          }
          checkedChildren="上架"
          unCheckedChildren="下架"
          disabled={record.stock - record.soldQuantity <= 0}
        />
      ),
    },
    {
      title: '热销',
      dataIndex: 'isHot',
      key: 'isHot',
      width: 120,
      align: 'center',
      render: (text, record) => (
        <Switch
          checked={text}
          onChange={(checked) => handleHotChange(record.id, checked)}
          checkedChildren="是"
          unCheckedChildren="否"
        />
      ),
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
            title="确定要删除该商品吗？"
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
        </Space>
      ),
    },
  ];

  // 处理编辑
  const handleEdit = (record: ProductItem) => {
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      price: record.price,
      categoryId: record.categoryId,
      image: record.image,
      status: record.status,
      isHot: record.isHot,
    });
    setEditingId(record.id);
    setModalVisible(true);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      const { data: res } = await deleteProduct(id);
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

  // 处理状态变更
  const handleStatusChange = async (id: number, status: 'on' | 'off') => {
    try {
      const product = data.find(item => item.id === id);
      if (product && status === 'on' && product.stock - product.soldQuantity <= 0) {
        message.error('商品没有可用库存，无法上架');
        return;
      }

      const { data: res } = await updateProductStatus(id, status);
      if (res.code === 200) {
        message.success('更新状态成功');
        loadData();
      } else {
        message.error(res.message);
      }
    } catch (err) {
      message.error('更新状态失败');
    }
  };

  // 处理热销状态变更
  const handleHotChange = async (id: number, isHot: boolean) => {
    try {
      const { data: res } = await updateProductHot(id, isHot);
      if (res.code === 200) {
        message.success('更新热销状态成功');
        loadData();
      } else {
        message.error(res.message);
      }
    } catch (err) {
      message.error('更新热销状态失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        // 更新商品
        const { data: res } = await updateProduct({
          ...values,
          id: editingId,
        });
        if (res.code === 200) {
          message.success('更新成功');
        } else {
          message.error(res.message);
          return;
        }
      } else {
        // 创建商品
        const { data: res } = await createProduct(values);
        if (res.code === 200) {
          message.success('添加成功');
        } else {
          message.error(res.message);
          return;
        }
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      setPreviewUrl('');
      loadData();
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

  // 处理图片URL变化
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreviewUrl(url);
    form.setFieldValue('image', url);
  };

  return (
    <div className={styles.container}>
      <Card
        title="商品管理"
        extra={
          <Form
            form={searchForm}
            layout="inline"
            className={styles.searchForm}
            onFinish={handleSearch}
          >
            <Form.Item name="name" label="商品名称">
              <Input
                placeholder="请输入商品名称"
                allowClear
                style={{ width: 200 }}
              />
            </Form.Item>
            <Form.Item name="categoryId" label="商品分类">
              <Select
                placeholder="请选择分类"
                allowClear
                style={{ width: 200 }}
              >
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="status" label="商品状态">
              <Select
                placeholder="请选择状态"
                allowClear
                style={{ width: 200 }}
              >
                <Option value="on">上架</Option>
                <Option value="off">下架</Option>
              </Select>
            </Form.Item>
            <Form.Item name="isHot" label="是否热销">
              <Select
                placeholder="请选择"
                allowClear
                style={{ width: 200 }}
              >
                <Option value={true}>是</Option>
                <Option value={false}>否</Option>
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
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
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
        title="编辑商品"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
          setPreviewUrl('');
        }}
        maskClosable={false}
        width={800}
      >
        <div className={styles.editForm}>
          <div className={styles.imageSection}>
            <Form.Item label="商品图片" className={styles.imageUrl}>
              <Input
                placeholder="请输入商品图片URL"
                onChange={handleImageChange}
                value={previewUrl || form.getFieldValue('image')}
              />
            </Form.Item>
            <div className={styles.imagePreview}>
              <Image
                src={previewUrl || form.getFieldValue('image') || 'https://via.placeholder.com/200'}
                alt="商品图片预览"
                fallback="https://via.placeholder.com/200"
                className={styles.previewImage}
              />
            </div>
          </div>
          
          <div className={styles.formSection}>
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label="商品名称"
                rules={[{ required: true, message: '请输入商品名称' }]}
              >
                <Input placeholder="请输入商品名称" />
              </Form.Item>
              <Form.Item name="description" label="商品描述">
                <Input.TextArea
                  placeholder="请输入商品描述"
                  rows={4}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
              <Form.Item
                name="categoryId"
                label="商品分类"
                rules={[{ required: true, message: '请选择商品分类' }]}
              >
                <Select placeholder="请选择分类">
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="status" label="商品状态">
                <Select>
                  <Option value="on">上架</Option>
                  <Option value="off">下架</Option>
                </Select>
              </Form.Item>
              <Form.Item name="isHot" label="是否热销" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductManage; 
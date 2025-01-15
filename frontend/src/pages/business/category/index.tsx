import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/apis/category';
import type { CategoryItem } from '@/types/category';
import styles from './index.module.less';

const CategoryManage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CategoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 表格列定义
  const columns: ColumnsType<CategoryItem> = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
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
            title="确定删除该分类吗？"
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
      const values = await searchForm.validateFields().catch(() => ({}));
      const { data: res } = await getCategoryList({
        page,
        pageSize: size,
        name: values?.name,
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

  // 处理编辑
  const handleEdit = (record: CategoryItem) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    });
    setModalVisible(true);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      const { data: res } = await deleteCategory(id);
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
      if (editingId) {
        // 更新时只发送需要更新的字段
        const { data: res } = await updateCategory({
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
        // 创建
        const { data: res } = await createCategory(values);
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

  return (
    <div className={styles.container}>
      <Card
        title="分类管理"
        extra={
          <Space>
            <Form
              form={searchForm}
              layout="inline"
              className={styles.searchForm}
              onFinish={handleSearch}
            >
              <Form.Item name="name" label="分类名称">
                <Input
                  placeholder="请输入分类名称"
                  allowClear
                  onPressEnter={handleSearch}
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Form>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingId(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              添加分类
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingId ? '编辑分类' : '添加分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ description: '' }}
        >
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea
              placeholder="请输入分类描述"
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

export default CategoryManage; 
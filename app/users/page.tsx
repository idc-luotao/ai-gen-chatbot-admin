'use client';

import { Table, Card, Button, Space, message, Modal, Form, Input, Select } from 'antd';
import { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { User } from '../../types/auth';
import { request } from '../../utils/http';
import { useTranslation } from '../../utils/i18n';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  avatar_url: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { t } = useTranslation();

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: t('users.userId'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('users.username'),
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: t('users.avatar'),
      dataIndex: 'avatar_url',
      key: 'avatar_url',
    },
    {
      title: t('users.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('users.createTime'),
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: t('users.updateTime'),
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: t('users.actions'),
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>{t('users.edit')}</a>
          <a onClick={() => handleDelete(record)}>{t('users.delete')}</a>
        </Space>
      ),
    },
  ];

  // 获取用户数据
  const fetchUsers = async (page = pagination.current, pageSize = pagination.pageSize) => {
    try {
      setLoading(true);
      const response = await request.get<{
        data: User[];
        total: number;
        page: number;
        per_page: number;
        num_pages: number;
      }>('/console/api/chat-users', {
        params: {
          page,
          per_page: pageSize
        }
      });

      // 添加调试日志
      console.log('API Response:', response);
      
      if (response.data ) {
        setUsers(response.data);
        setPagination({
          current: response.page,
          pageSize: response.per_page,
          total: response.total
        });
      } else {
        console.error('Invalid response format:', response);
        message.error(t('users.invalidResponse'));
      }
    } catch (error: any) {
      console.error('Fetch users error:', error);
      message.error(error.response?.data?.message || t('users.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      Modal.confirm({
        title: t('users.confirmCreate'),
        content: t('users.confirmCreateContent'),
        onOk: async () => {
          try {
            setLoading(true);
            // 调用创建用户API
            await request.post('/console/api/chat-users', {
              username: values.username,
              email: values.email,
              avatar_url: values.avatar_url,
              password: values.password
            });
            
            message.success(t('users.createSuccess'));
            setIsModalOpen(false);
            form.resetFields();
            fetchUsers(); // 刷新用户列表
          } catch (error: any) {
            message.error(error.response?.data?.message || t('users.createFailed'));
          } finally {
            setLoading(false);
          }
        }
      });
    } catch (error) {
      message.error(t('users.formValidationFailed'));
    }
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    editForm.setFieldsValue({
      username: record.username,
      email: record.email,
      avatar_url: record.avatar_url
    });
    setIsEditModalOpen(true);
  };

  const handleEditModalCancel = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    editForm.resetFields();
  };

  const handleEditModalOk = async () => {
    try {
      const values = await editForm.validateFields();
      Modal.confirm({
        title: t('users.confirmEdit'),
        content: t('users.confirmEditContent'),
        onOk: async () => {
          try {
            setLoading(true);
            // 调用编辑用户API
            if (!values.password) {
              const { password, ...dataWithoutPassword } = values;
              await request.put(`/console/api/chat-users/${editingUser?.id}`, dataWithoutPassword);
            } else {
              await request.put(`/console/api/chat-users/${editingUser?.id}`, values);
            }
            
            message.success(t('users.editSuccess'));
            setIsEditModalOpen(false);
            setEditingUser(null);
            editForm.resetFields();
            fetchUsers(); // 刷新用户列表
          } catch (error: any) {
            message.error(error.response?.data?.message || t('users.editFailed'));
          } finally {
            setLoading(false);
          }
        }
      });
    } catch (error) {
      message.error(t('users.formValidationFailed'));
    }
  };

  const handleDelete = (record: User) => {
    Modal.confirm({
      title: t('users.confirmDelete'),
      content: t('users.confirmDeleteContent'),
      okType: 'danger',
      onOk: async () => {
        try {
          setLoading(true);
          await request.delete(`/console/api/chat-users/${record.id}`);
          message.success(t('users.deleteSuccess'));
          fetchUsers(); // 刷新用户列表
        } catch (error: any) {
          message.error(error.response?.data?.message || t('users.deleteFailed'));
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleTableChange = (newPagination: any) => {
    fetchUsers(newPagination.current, newPagination.pageSize);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{t('users.title')}</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddUser}
        >
          {t('users.addUser')}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: handleTableChange,
          showSizeChanger: true,
          showTotal: (total) => t('knowledge.total', { total }),
        }}
      />
      <Modal
        title={t('users.addUser')}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label={t('users.username')}
            rules={[{ required: true, message: t('users.inputUsername') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label={t('users.email')}
            rules={[{ required: true, message: t('users.inputEmail') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('users.password')}
            rules={[{ required: true, message: t('users.inputPassword') }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="avatar_url"
            label={`${t('users.avatar')} ${t('users.optional')}`}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={t('users.edit')}
        open={isEditModalOpen}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        confirmLoading={loading}
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label={t('users.username')}
            rules={[{ required: true, message: t('users.inputUsername') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label={t('users.email')}
            rules={[{ required: true, message: t('users.inputEmail') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={`${t('users.password')} ${t('users.optional')}`}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="avatar_url"
            label={`${t('users.avatar')} ${t('users.optional')}`}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

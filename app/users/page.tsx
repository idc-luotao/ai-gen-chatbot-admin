'use client';

import { Table, Card, Button, Space, message, Modal, Form, Input, Select } from 'antd';
import { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { User } from '../../types/auth';
import { request } from '../../utils/http';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '头像',
      dataIndex: 'avatar_url',
      key: 'avatar_url',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>编辑</a>
          <a onClick={() => handleDelete(record)}>删除</a>
        </Space>
      ),
    },
  ];

  // 获取用户数据
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await request.get<User[]>('/console/api/chat-users');
      setUsers(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取用户列表失败');
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
        title: '确认创建用户',
        content: '确定要创建这个用户吗？',
        onOk: async () => {
          try {
            setLoading(true);
            // 调用创建用户API
            await request.post('/console/api/chat-users', {
              username: values.username,
              email: values.email,
              avatar_url: values.avatar_url
            });
            
            message.success('用户创建成功');
            setIsModalOpen(false);
            form.resetFields();
            fetchUsers(); // 刷新用户列表
          } catch (error: any) {
            message.error(error.response?.data?.message || '创建用户失败');
          } finally {
            setLoading(false);
          }
        }
      });
    } catch (error) {
      message.error('表单验证失败');
    }
  };

  const handleEdit = (record: User) => {
    // TODO: 实现编辑用户功能
    message.info('编辑用户功能开发中');
  };

  const handleDelete = (record: User) => {
    // TODO: 实现删除用户功能
    message.info('删除用户功能开发中');
  };

  return (
    <Card
      title="用户管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
          添加用户
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title="添加用户"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          name="userForm"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="avatar_url"
            label="头像URL"
          >
            <Input placeholder="请输入头像URL" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

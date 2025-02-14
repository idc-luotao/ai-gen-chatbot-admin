'use client';

import { Table, Card, Button, Space, message } from 'antd';
import { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { User } from '../../types/auth';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

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
      title: '用户类型',
      dataIndex: 'userType',
      key: 'userType',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
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

  // 模拟获取用户数据
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际的API调用
      const mockData: User[] = [
        {
          id: 1,
          username: '测试用户1',
          email: 'test1@example.com',
          createdAt: '2024-02-14',
          userType: 'admin',
        },
        {
          id: 2,
          username: '测试用户2',
          email: 'test2@example.com',
          createdAt: '2024-02-14',
          userType: 'user',
        },
      ];
      setUsers(mockData);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    // TODO: 实现添加用户功能
    message.info('添加用户功能开发中');
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加用户
        </Button>
      }
    >
      <Table<User>
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
    </Card>
  );
}

'use client';

import { Table, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import UploadDialog from '../../components/UploadDialog';

export default function KnowledgePage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [data, setData] = useState([
    { id: 1, title: '示例知识点1', category: '分类1', createTime: '2024-02-14' },
    { id: 2, title: '示例知识点2', category: '分类2', createTime: '2024-02-14' },
  ]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
  ];

  const handleUploadSuccess = (file) => {
    // 这里可以处理文件上传成功后的逻辑
    // 例如刷新数据列表
    setUploadOpen(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<UploadOutlined />}
          onClick={() => setUploadOpen(true)}
        >
          上传文件
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      <UploadDialog
        open={uploadOpen}
        onCancel={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}

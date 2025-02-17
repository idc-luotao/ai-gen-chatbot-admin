'use client';

import { Table, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import UploadDialog from '../../components/UploadDialog';
import { UploadFile } from 'antd/lib/upload/interface';
import { ColumnsType } from 'antd/es/table';

interface KnowledgeItem {
  id: number;
  title: string;
  category: string;
  createTime: string;
}

export default function KnowledgePage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [data, setData] = useState<KnowledgeItem[]>([
    { id: 1, title: '示例知识点1', category: '分类1', createTime: '2024-02-14' },
    { id: 2, title: '示例知识点2', category: '分类2', createTime: '2024-02-14' },
  ]);

  const columns: ColumnsType<KnowledgeItem> = [
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

  const handleUploadSuccess = (file: UploadFile) => {
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
      <Table<KnowledgeItem>
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
      <UploadDialog
        open={uploadOpen}
        onCancel={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}

'use client';

import { Table, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import UploadDialog from '../../components/UploadDialog';
import { UploadFile } from 'antd/lib/upload/interface';
import { ColumnsType } from 'antd/es/table';
import { request } from '../../utils/http';

interface KnowledgeItem {
  id: number;
  title: string;
  category: string;
  createTime: string;
}

interface PaginationParams {
  current: number;
  pageSize: number;
}

interface KnowledgeResponse {
  items: KnowledgeItem[];
  total: number;
}

export default function KnowledgePage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [data, setData] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<PaginationParams>({
    current: 1,
    pageSize: 10
  });

  const columns: ColumnsType<KnowledgeItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '标题',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
  ];

  const fetchKnowledgeList = async (params: PaginationParams) => {
    setLoading(true);
    try {
      // TODO: 替换为实际的API地址
      const response = await request.get<KnowledgeResponse>('http://localhost:5001/console/api/datasets?page=1&limit=30&include_all=false', {
        params: {
          page: params.current,
          pageSize: params.pageSize
        }
      });

      setData(response.data);
      setTotal(response.total);
    } catch (error) {
      message.error('获取知识点列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
   fetchKnowledgeList(pagination);
  }, [pagination]);

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
  };

  const handleUploadSuccess = async (file: UploadFile, title: string) => {
    // TODO: 调用保存API，传入file和title参数
    message.success('上传成功');
    setUploadOpen(false);
    // 刷新列表
    fetchKnowledgeList(pagination);
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
        loading={loading}
        pagination={{
          ...pagination,
          total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />
      <UploadDialog
        open={uploadOpen}
        onCancel={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}

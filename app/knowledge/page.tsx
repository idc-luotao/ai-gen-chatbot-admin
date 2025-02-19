'use client';

import { Table, Button, message, Modal, Upload, Form, Input } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { UploadFile } from 'antd/lib/upload/interface';
import { ColumnsType } from 'antd/es/table';
import { request } from '../../utils/http';
import moment from 'moment';
import http from '../../utils/http';
import { getToken } from '../../utils/storage';

const { Dragger } = Upload;

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
  const [form] = Form.useForm();
  const [uploadedFile, setUploadedFile] = useState<UploadFile | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [fileId, setFileId] = useState('');
  const uploadProps = {
    name: 'file',
    multiple: false,
    action: `${http.defaults.baseURL}/console/api/files/upload?source=datasets`,
    withCredentials: false,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    onChange(info: any) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
        setUploadedFile(info.file);
      } else if (status === 'error') {
        console.error('Upload error:', info.file.error, info.file.response);
        message.error(`${info.file.name} 文件上传失败: ${info.file.response?.message || '未知错误'}`);
        setUploadedFile(null);
      }
    },
    onError(error: any) {
      console.error('Upload error details:', error);
    },
    beforeUpload: (file: File) => {

      console.log('Uploading file:', file.name);
      console.log('Current token:', getToken());
      request.upload(`/console/api/files/upload?source=datasets`
        , file, { title: file.name }).then((res) => {
          console.log('Upload response:', res.id);
          setFileId(res.id);
          setUploadedFile(file);
        });
      
      return false;
    },
  };

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
      title: 'LLM',
      dataIndex: 'embedding_model_provider',
      key: 'embedding_model_provider',
    },
    {
      title: 'LLM-Model',
      dataIndex: 'embedding_model',
      key: 'embedding_model',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (timestamp: number) => moment.unix(timestamp).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const fetchKnowledgeList = async (params: PaginationParams) => {
    setLoading(true);
    try {
      const response = await request.get<KnowledgeResponse>('/console/api/datasets?page=1&limit=30&include_all=false', {
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

  const handleSave = async () => {
    if (!uploadedFile) {
      message.error('请先上传文件');
      return;
    }

    try {
      setSaveLoading(true);
      const values = await form.validateFields();
      request.post('/console/api/datasets/init12'
        , {"data_source":{"type":"upload_file","info_list":{"data_source_type":"upload_file","file_info_list":{"file_ids":[""+fileId+""]}}},"indexing_technique":"high_quality","process_rule":{"rules":{"pre_processing_rules":[{"id":"remove_extra_spaces","enabled":true},{"id":"remove_urls_emails","enabled":false}],"segmentation":{"separator":"\n\n","max_tokens":500,"chunk_overlap":50}},"mode":"custom"},"doc_form":"text_model","doc_language":"Chinese","retrieval_model":{"search_method":"semantic_search","reranking_enable":false,"reranking_model":{"reranking_provider_name":"","reranking_model_name":""},"top_k":3,"score_threshold_enabled":false,"score_threshold":0.5},"embedding_model":"text-embedding-3-large","embedding_model_provider":"openai"})
        .then((res) => {
          message.success('上传成功');
          setUploadOpen(false);
          form.resetFields();
          setUploadedFile(null);
          // 刷新列表
          fetchKnowledgeList(pagination);
        })
        .catch((error) => {
          console.error('Save failed:', error);
          message.error('上传文件失败');
        })
        .finally(() => {
          setSaveLoading(false);
        });
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写知识点名称');
      } else {
        console.error('Save failed:', error);
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setUploadedFile(null);
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
        loading={loading}
        pagination={{
          ...pagination,
          total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />
      <Modal
        title="上传文件"
        open={uploadOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={saveLoading}
            onClick={handleSave}
          >
            保存
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="知识点名称"
            rules={[{ required: true, message: '请输入知识点名称' }]}
          >
            <Input placeholder="请输入知识点名称" />
          </Form.Item>
          <Form.Item label="上传文件">
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持单个或批量上传，严禁上传公司内部资料及其他违禁文件
              </p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

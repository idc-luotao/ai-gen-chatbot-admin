'use client';

import { Modal, Upload, message, Button, Form, Input } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { useState } from 'react';
import { getToken } from '../utils/storage';
import { request } from '../utils/http';

const { Dragger } = Upload;

interface UploadDialogProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (file: UploadFile, title: string) => void;
  action: string;
}

const UploadDialog = ({ open, onCancel, onSuccess, action }: UploadDialogProps) => {
  const [form] = Form.useForm();
  const [uploadedFile, setUploadedFile] = useState<UploadFile | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const uploadProps = {
    name: 'file',
    multiple: false,
    action: action,
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
      request.upload(action, file, { title: file.name });
      return false;
    },
  };

  const handleSave = async () => {
    if (!uploadedFile) {
      message.error('请先上传文件');
      return;
    }
    
    try {
      setSaveLoading(true);
      const values = await form.validateFields();
      onSuccess(uploadedFile, values.title);
      form.resetFields();
      setUploadedFile(null);
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
    onCancel();
  };

  return (
    <Modal
      title="上传文件"
      open={open}
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
  );
};

export default UploadDialog;

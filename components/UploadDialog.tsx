'use client';

import { Modal, Upload, message, Button, Form, Input } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { useState } from 'react';

const { Dragger } = Upload;

interface UploadDialogProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (file: UploadFile, title: string) => void;
}

const UploadDialog = ({ open, onCancel, onSuccess }: UploadDialogProps) => {
  const [form] = Form.useForm();
  const [uploadedFile, setUploadedFile] = useState<UploadFile | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const uploadProps = {
    name: 'file',
    multiple: false,
    action: '/api/upload',
    onChange(info: any) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
        setUploadedFile(info.file);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
        setUploadedFile(null);
      }
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

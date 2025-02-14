'use client';

import { Modal, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';

const { Dragger } = Upload;

interface UploadDialogProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (file: UploadFile) => void;
}

const UploadDialog = ({ open, onCancel, onSuccess }: UploadDialogProps) => {
  const uploadProps = {
    name: 'file',
    multiple: false,
    action: '/api/upload',
    onChange(info: any) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
        onSuccess(info.file);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  return (
    <Modal
      title="上传文件"
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持单个或批量上传，严禁上传公司内部资料及其他违禁文件
        </p>
      </Dragger>
    </Modal>
  );
};

export default UploadDialog;

'use client';

import { Modal, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Dragger } = Upload;

const UploadDialog = ({ open, onCancel, onSuccess }) => {
  const [fileList, setFileList] = useState([]);

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: '/api/upload',
    fileList,
    onChange(info) {
      const { status } = info.file;
      
      // 更新文件列表
      setFileList(info.fileList);

      if (status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
        if (onSuccess) {
          onSuccess(info.file);
        }
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <Modal
      title="上传文件"
      open={open}
      onCancel={onCancel}
      // 使用 footer={null} 移除默认的确定和取消按钮
      footer={null}
      width={520}
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

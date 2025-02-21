'use client';

import { Button } from 'antd';
import { MessageOutlined, SettingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useUser } from '../../contexts/UserContext';
import { USER_TYPE_ADMIN } from '@/utils/storage';

export default function MainPage() {
  const router = useRouter();
  const { userName, userType } = useUser();
  const isAdmin = userType === USER_TYPE_ADMIN;

  const handleChatClick = () => {
    router.push('/chatbot');
  };

  const handleManageClick = () => {
    // 跳转到管理页面
    router.push('/knowledge');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>AI 智能助手</h1>
        <p className={styles.description}>
          欢迎使用我们的 AI 智能助手系统。这是一个强大的人工智能对话系统，
          可以帮助您解答问题、提供建议和完成各种任务。您可以选择直接开始对话，
          或者进入管理后台配置系统参数和知识库。
        </p>
        <div className={styles.buttonGroup}>
          <Button
            type="primary"
            size="large"
            icon={<MessageOutlined />}
            className={styles.button}
            onClick={handleChatClick}
          >
            开始对话
          </Button>
          {isAdmin && (
          <Button
            type="default"
            size="large"
            icon={<SettingOutlined />}
            className={styles.button}
            onClick={handleManageClick}
          >
            系统管理
          </Button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { Button } from 'antd';
import { MessageOutlined, SettingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useUser } from '../../contexts/UserContext';
import { USER_TYPE_ADMIN } from '@/utils/storage';
import { useTranslation } from '@/utils/i18n';

export default function MainPage() {
  const router = useRouter();
  const { userName, userType } = useUser();
  const { t } = useTranslation();
  const isAdmin = userType === USER_TYPE_ADMIN;

  const handleChatClick = () => {
    router.push('/chatbot2');
  };

  const handleManageClick = () => {
    // 跳转到管理页面
    router.push('/knowledge');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>{t('main.title')}</h1>
        <p className={styles.description}>
          {t('main.description')}
        </p>
        <div className={styles.buttonGroup}>
          <Button
            type="primary"
            size="large"
            icon={<MessageOutlined />}
            className={styles.button}
            onClick={handleChatClick}
          >
            {t('main.startChat')}
          </Button>
          {isAdmin && (
          <Button
            type="default"
            size="large"
            icon={<SettingOutlined />}
            className={styles.button}
            onClick={handleManageClick}
          >
            {t('main.systemManage')}
          </Button>
          )}
        </div>
      </div>
    </div>
  );
}

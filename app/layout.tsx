'use client';

import { Layout, Typography, Dropdown, message } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';
import SideMenu from '../components/SideMenu';
import LanguageSelector from '../components/LanguageSelector';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import './globals.css';
import { request } from '../utils/http';
import { getUserType, removeTokens, USER_TYPE_ADMIN } from '../utils/storage';
import { UserProvider, useUser } from '../contexts/UserContext';
import { t, useTranslation } from '../utils/i18n';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const isAdminPage = pathname === '/users' || pathname === '/knowledge' || pathname === '/llm-settings';
  const { userName, userType } = useUser();
  const userTypeValue = getUserType();
  const isAdmin = userTypeValue === USER_TYPE_ADMIN;
  const { t } = useTranslation();

  const handleMenuClick = async ({ key }: { key: string }) => {
    if (key === 'settings') {
      message.info('设置功能开发中');
    } else if (key === 'logout') {
      try {
        await request.get('/console/api/logout');
        removeTokens();
        message.success('已退出登录');
        router.push('/login');
      } catch (error: any) {
        message.error(error.response?.data?.message || '退出登录失败');
      }
    } else if (key === 'home') {
      router.push('/main');
    }
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: t('admin.home'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('admin.logout'),
    },
  ];

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout>
        <Header style={{
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                height: '32px',
                marginRight: '16px'
              }}
            />
            <Text strong style={{ fontSize: '18px' }}>{t('admin.system')}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Dropdown
              menu={{
                items: menuItems,
                onClick: handleMenuClick,
              }}
              placement="bottomRight"
              arrow
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '0 8px',
                borderRadius: '4px',
                transition: 'all 0.3s',
                ':hover': {
                  backgroundColor: 'rgba(0,0,0,0.025)'
                }
              }}>
                <UserOutlined style={{ marginRight: '8px' }} />
                <Text>{isAdmin ? USER_TYPE_ADMIN+'('+userName+')' : userName}</Text>
              </div>
            </Dropdown>
            <LanguageSelector />
          </div>
        </Header>
        <Layout>
          {isAdminPage && (
            <Sider width={200} theme="light">
              <SideMenu />
            </Sider>
          )}
          <Content style={{ padding: '24px', background: '#fff' }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <AppLayout>{children}</AppLayout>
        </UserProvider>
      </body>
    </html>
  );
}

'use client';

import { Layout, Typography, Dropdown, message } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import SideMenu from '../components/SideMenu';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import './globals.css';
import { request } from '../utils/http';
import { removeTokens, USER_TYPE_ADMIN } from '../utils/storage';
import { UserProvider, useUser } from '../contexts/UserContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const isAdminPage = pathname === '/users' || pathname === '/knowledge' || pathname === '/llm-settings';
  const { userName, userType } = useUser();
  const isAdmin = userType === USER_TYPE_ADMIN;

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
    }
  };

  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '注销',
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
            <Text strong style={{ fontSize: '18px' }}>管理系统</Text>
          </div>
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
              <Text>{isAdmin ? USER_TYPE_ADMIN : userName}</Text>
            </div>
          </Dropdown>
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

'use client';

import { Layout, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import SideMenu from '../components/SideMenu';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import './globals.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <body>
        {isLoginPage ? (
          children
        ) : (
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
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UserOutlined style={{ marginRight: '8px' }} />
                  <Text>管理员</Text>
                </div>
              </Header>
              <Layout>
                <Sider width={200} theme="light">
                  <SideMenu />
                </Sider>
                <Content style={{ padding: '24px', background: '#fff' }}>
                  {children}
                </Content>
              </Layout>
            </Layout>
          </Layout>
        )}
      </body>
    </html>
  );
}

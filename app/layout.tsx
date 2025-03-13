'use client';

import { Layout, Typography, Dropdown, message } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, GlobalOutlined } from '@ant-design/icons';
import SideMenu from '../components/SideMenu';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
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
  const isAdminPage = pathname === '/users' || pathname === '/knowledge';
  const { userName, userType } = useUser();
  const isAdmin = userType === USER_TYPE_ADMIN;

  // 言語オプション
  const languageOptions = [
    { code: "en", name: "英語" },
    { code: "ja", name: "日本語" },
    { code: "zh", name: "中国語" },
    { code: "ko", name: "韓国語" },
    { code: "fr", name: "フランス語" },
    { code: "de", name: "ドイツ語" },
    { code: "es", name: "スペイン語" },
    { code: "ru", name: "ロシア語" },
  ];

  const [sourceLang, setSourceLang] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // localStorageから言語設定を読み込む（ない場合は日本語をデフォルトに）
    const savedLanguage = localStorage.getItem("language") || "ja";
    setSourceLang(savedLanguage);
  }, []);


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

  const handleLanguageSelect = (langCode: string) => {
    setSourceLang(langCode);
    localStorage.setItem('language', langCode); // localStorageに保存
    setLangDropdownOpen(false); // ドロップダウンを閉じる
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
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
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
            <Dropdown 
              overlay={
                <ul className="dropdown-menu" style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', padding: '4px 0', borderRadius: '4px', minWidth: '120px' }}>
                  {languageOptions.map((lang) => (
                    <li 
                      key={lang.code} 
                      onClick={() => handleLanguageSelect(lang.code)}
                      style={{ 
                        padding: '5px 12px', 
                        cursor: 'pointer', 
                        backgroundColor: sourceLang === lang.code ? 'rgba(0,0,0,0.05)' : 'transparent',
                        color: sourceLang === lang.code ? '#1890ff' : 'inherit'
                      }}
                    >
                      {lang.name}
                    </li>
                  ))}
                </ul>
              }
              trigger={['click']}
              disabled={isRecording || isProcessing}
              open={langDropdownOpen}
              onOpenChange={setLangDropdownOpen}
            >
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: '16px' }}>
                <GlobalOutlined style={{ marginRight: '4px' }} />
                <span>{languageOptions.find(lang => lang.code === sourceLang)?.name || '言語を選択'}</span>
              </div>
            </Dropdown>
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

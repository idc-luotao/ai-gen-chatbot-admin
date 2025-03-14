'use client';

import { Menu } from 'antd';
import { BookOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

const SideMenu = () => {
  const router = useRouter();

  const items: MenuItem[] = [
    {
      key: 'knowledge',
      icon: <BookOutlined />,
      label: '知识点管理',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: 'llm-settings',
      icon: <SettingOutlined />,
      label: 'LLM设置',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    router.push(`/${e.key}`);
  };

  return (
    <Menu
      mode="inline"
      defaultSelectedKeys={['knowledge']}
      style={{ height: '100%', borderRight: 0 }}
      items={items}
      onClick={handleMenuClick}
    />
  );
};

export default SideMenu;

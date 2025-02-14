'use client';

import { Menu } from 'antd';
import { BookOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const SideMenu = () => {
  const router = useRouter();

  const items = [
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
  ];

  const handleMenuClick = (e) => {
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

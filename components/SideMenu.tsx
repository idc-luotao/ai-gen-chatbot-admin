'use client';

import { Menu } from 'antd';
import { BookOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { MenuProps } from 'antd';
import { useTranslation } from '../utils/i18n';

type MenuItem = Required<MenuProps>['items'][number];

const SideMenu = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const items: MenuItem[] = [
    {
      key: 'knowledge',
      icon: <BookOutlined />,
      label: t('sidebar.knowledge'),
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: t('sidebar.users'),
    },
    {
      key: 'llm-settings',
      icon: <SettingOutlined />,
      label: t('sidebar.llmSettings'),
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

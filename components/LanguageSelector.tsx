'use client';

import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { I18nService, Language, useTranslation } from '../utils/i18n';

const { Option } = Select;

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();
  
  const handleLanguageChange = (value: string) => {
    i18n.setLanguage(value as Language);
  };
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '16px' }}>
      <GlobalOutlined style={{ marginRight: '8px', color: '#666' }} />
      <Select
        defaultValue={i18n.getLanguage()}
        style={{ width: 100 }}
        onChange={handleLanguageChange}
        bordered={false}
      >
        <Option value="zh">中文</Option>
        <Option value="en">English</Option>
      </Select>
    </div>
  );
};

export default LanguageSelector;

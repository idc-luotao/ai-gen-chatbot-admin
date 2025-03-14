'use client';

import { Form, Input, Button, Select, Card, message } from 'antd';
import { useState, useEffect } from 'react';
import { request } from '../../utils/http';
import { useTranslation } from '../../utils/i18n';

const { Option } = Select;

interface LLMSettings {
  provider: string;
  apiKey: string;
}

export default function LLMSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // fetchSettings();
  }, []);

  const fetchSettings = async () => {
    // setLoading(true);
    // try {
    //   // 这里替换为实际的API调用
    //   const response = await request.get('/console/api/workspaces/current/default-model?model_type=llm');
    //   form.setFieldsValue(response);
    // } catch (error) {
    //   console.error('获取LLM设置失败:', error);
    //   message.error('获取LLM设置失败');
    //   // 设置默认值
    //   form.setFieldsValue({
    //     provider: 'openai',
    //     apiKey: '',
    //   });
    // } finally {
    //   setLoading(false);
    // }
  };

  const onFinish = async (values: LLMSettings) => {
    setLoading(true);
    try {
      // 创建请求对象，根据提供商设置不同的API密钥字段
      let requestData: any = {
        config_from: "predefined-model",
        load_balancing: {
          enabled: false,
          configs: []
        },
        credentials: {}
      };
      
      // 根据选择的提供商设置对应的API密钥字段
      if (values.provider === 'openai') {
        requestData.credentials = {
          openai_api_key: values.apiKey
        };
      } else if (values.provider === 'tongyi') {
        requestData.credentials = {
          dashscope_api_key: values.apiKey
        };
      }
      // 发送请求
      await request.post('/console/api/workspaces/current/model-providers/tongyi', requestData);
      message.success(t('llm.saveSuccess'));
    } catch (error) {
      console.error('保存LLM设置失败:', error);
      message.error(t('llm.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Card title={t('llm.title')} bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            provider: 'tongyi',
            apiKey: '',
          }}
        >
          <Form.Item
            name="provider"
            label={t('llm.provider')}
            rules={[{ required: true, message: t('llm.selectProvider') }]}
          >
            <Select>
            <Option value="tongyi">通义千问</Option>
              <Option value="openai">OpenAI</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="apiKey"
            label={t('llm.apiKey')}
            rules={[{ required: true, message: t('llm.enterApiKey') }]}
          >
            <Input.Password placeholder={t('llm.enterApiKey')} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('llm.save')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

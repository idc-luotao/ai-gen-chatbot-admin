'use client';

import { Form, Input, Button, Select, Card, message, Typography, Space } from 'antd';
import { useState, useEffect } from 'react';
import { request } from '../../utils/http';
import { useTranslation } from '../../utils/i18n';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Paragraph, Link } = Typography;

interface CredentialFormSchema {
  variable: string;
  label: {
    zh_Hans: string;
    en_US: string;
  };
  type: string;
  required: boolean;
  default: string | null;
  options: any[] | null;
  placeholder: {
    zh_Hans: string;
    en_US: string;
  } | null;
  max_length: number;
  show_on: any[];
}

interface Help {
  title: {
    zh_Hans: string;
    en_US: string;
  };
  url: {
    zh_Hans: string;
    en_US: string;
  };
}

interface ModelProvider {
  provider: string;
  label: {
    zh_Hans: string;
    en_US: string;
  };
  description: {
    zh_Hans: string;
    en_US: string;
  } | null;
  help: Help;
  provider_credential_schema: {
    credential_form_schemas: CredentialFormSchema[];
  };
}

export default function LLMSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<ModelProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('tongyi');
  const { t, language } = useTranslation();
  const currentLang = language === 'zh' ? 'zh_Hans' : 'en_US';

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      // 实际项目中应该从API获取数据
      // 这里使用提供的示例数据
      const mockData = {
        data: [
          {
            provider: "openai",
            label: {
              zh_Hans: "OpenAI",
              en_US: "OpenAI"
            },
            description: {
              zh_Hans: "OpenAI 提供的模型，例如 GPT-3.5-Turbo 和 GPT-4。",
              en_US: "Models provided by OpenAI, such as GPT-3.5-Turbo and GPT-4."
            },
            help: {
              title: {
                zh_Hans: "从 OpenAI 获取 API Key",
                en_US: "Get your API Key from OpenAI"
              },
              url: {
                zh_Hans: "https://platform.openai.com/account/api-keys",
                en_US: "https://platform.openai.com/account/api-keys"
              }
            },
            provider_credential_schema: {
              credential_form_schemas: [
                {
                  variable: "openai_api_key",
                  label: {
                    zh_Hans: "API Key",
                    en_US: "API Key"
                  },
                  type: "secret-input",
                  required: true,
                  default: null,
                  options: null,
                  placeholder: {
                    zh_Hans: "在此输入您的 API Key",
                    en_US: "Enter your API Key"
                  },
                  max_length: 0,
                  show_on: []
                },
                {
                  variable: "openai_organization",
                  label: {
                    zh_Hans: "组织 ID",
                    en_US: "Organization"
                  },
                  type: "text-input",
                  required: false,
                  default: null,
                  options: null,
                  placeholder: {
                    zh_Hans: "在此输入您的组织 ID",
                    en_US: "Enter your Organization ID"
                  },
                  max_length: 0,
                  show_on: []
                },
                {
                  variable: "openai_api_base",
                  label: {
                    zh_Hans: "API Base",
                    en_US: "API Base"
                  },
                  type: "text-input",
                  required: false,
                  default: null,
                  options: null,
                  placeholder: {
                    zh_Hans: "在此输入您的 API Base, 如：https://api.openai.com",
                    en_US: "Enter your API Base, e.g. https://api.openai.com"
                  },
                  max_length: 0,
                  show_on: []
                }
              ]
            }
          },
          {
            provider: "tongyi",
            label: {
              zh_Hans: "通义千问",
              en_US: "TONGYI"
            },
            description: null,
            help: {
              title: {
                zh_Hans: "从阿里云百炼获取 API Key",
                en_US: "Get your API key from AliCloud"
              },
              url: {
                zh_Hans: "https://bailian.console.aliyun.com/?apiKey=1#/api-key",
                en_US: "https://bailian.console.aliyun.com/?apiKey=1#/api-key"
              }
            },
            provider_credential_schema: {
              credential_form_schemas: [
                {
                  variable: "dashscope_api_key",
                  label: {
                    zh_Hans: "API Key",
                    en_US: "API Key"
                  },
                  type: "secret-input",
                  required: true,
                  default: null,
                  options: null,
                  placeholder: {
                    zh_Hans: "在此输入您的 API Key",
                    en_US: "Enter your API Key"
                  },
                  max_length: 0,
                  show_on: []
                }
              ]
            }
          }
        ]
      };
      
      setProviders(mockData.data);
      
      // 设置默认值
      form.setFieldsValue({
        provider: 'tongyi',
      });
    } catch (error) {
      console.error('获取LLM提供商失败:', error);
      message.error(t('llm.fetchProvidersFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    // 重置表单中的凭证字段
    const currentProvider = providers.find(p => p.provider === value);
    if (currentProvider) {
      const resetFields: Record<string, any> = {};
      currentProvider.provider_credential_schema.credential_form_schemas.forEach(schema => {
        resetFields[schema.variable] = schema.default || undefined;
      });
      form.setFieldsValue(resetFields);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 创建请求对象
      const requestData: any = {
        config_from: "predefined-model",
        load_balancing: {
          enabled: false,
          configs: []
        },
        credentials: {}
      };
      
      // 根据选择的提供商设置对应的凭证字段
      const currentProvider = providers.find(p => p.provider === values.provider);
      if (currentProvider) {
        currentProvider.provider_credential_schema.credential_form_schemas.forEach(schema => {
          if (values[schema.variable] !== undefined) {
            requestData.credentials[schema.variable] = values[schema.variable];
          }
        });
      }
      
      // 发送请求
      await request.post(`/console/api/workspaces/current/model-providers/${values.provider}`, requestData);
      message.success(t('llm.saveSuccess'));
    } catch (error) {
      console.error('保存LLM设置失败:', error);
      message.error(t('llm.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 根据schema渲染表单项
  const renderFormItems = () => {
    const currentProvider = providers.find(p => p.provider === selectedProvider);
    if (!currentProvider) return null;

    return (
      <>
        {currentProvider.description && (
          <Paragraph style={{ marginBottom: '20px' }}>
            {currentProvider.description[currentLang]}
          </Paragraph>
        )}
        
        {currentProvider.provider_credential_schema.credential_form_schemas.map(schema => {
          const label = (
            <Space>
              {schema.label[currentLang]}
              {schema.required && <span style={{ color: '#ff4d4f' }}>*</span>}
            </Space>
          );

          return (
            <Form.Item
              key={schema.variable}
              name={schema.variable}
              label={label}
              rules={[
                { 
                  required: schema.required, 
                  message: schema.placeholder 
                    ? schema.placeholder[currentLang] 
                    : t('llm.fieldRequired')
                }
              ]}
            >
              {schema.type === 'secret-input' ? (
                <Input.Password 
                  placeholder={schema.placeholder ? schema.placeholder[currentLang] : ''} 
                />
              ) : schema.type === 'text-input' ? (
                <Input 
                  placeholder={schema.placeholder ? schema.placeholder[currentLang] : ''} 
                />
              ) : schema.type === 'select' && schema.options ? (
                <Select placeholder={schema.placeholder ? schema.placeholder[currentLang] : ''}>
                  {schema.options.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label[currentLang]}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Input 
                  placeholder={schema.placeholder ? schema.placeholder[currentLang] : ''} 
                />
              )}
            </Form.Item>
          );
        })}
        
        {currentProvider.help && (
          <Form.Item>
            <Link href={currentProvider.help.url[currentLang]} target="_blank">
              {currentProvider.help.title[currentLang]}
            </Link>
          </Form.Item>
        )}
      </>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Card title={t('llm.title')} bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            provider: 'tongyi',
          }}
        >
          <Form.Item
            name="provider"
            label={t('llm.provider')}
            rules={[{ required: true, message: t('llm.selectProvider') }]}
          >
            <Select onChange={handleProviderChange}>
              {providers.map(provider => (
                <Option key={provider.provider} value={provider.provider}>
                  {provider.label[currentLang]}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {renderFormItems()}

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

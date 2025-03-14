'use client';

import { Form, Input, Button, Select, Card, message, Switch, InputNumber, Divider } from 'antd';
import { useState, useEffect } from 'react';
import { request } from '../../utils/http';

const { Option } = Select;
const { TextArea } = Input;

interface LLMSettings {
  provider: string;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
  enableStreaming: boolean;
}

export default function LLMSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<string[]>(['openai', 'anthropic', 'tongyi', 'custom']);
  const [models, setModels] = useState<Record<string, string[]>>({
    openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    anthropic: ['claude-2', 'claude-instant-1', 'claude-3-opus', 'claude-3-sonnet'],
    tongyi: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    custom: ['custom-model'],
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // 这里替换为实际的API调用
      const response = await request.get('/console/api/llm-settings');
      form.setFieldsValue(response);
    } catch (error) {
      console.error('获取LLM设置失败:', error);
      message.error('获取LLM设置失败');
      // 设置默认值
      form.setFieldsValue({
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1024,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        enableStreaming: true,
        systemPrompt: '你是一个AI助手，请帮助用户解答问题。',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (value: string) => {
    // 当提供商变更时，重置模型选择
    form.setFieldsValue({ model: models[value][0] });
  };

  const onFinish = async (values: LLMSettings) => {
    setLoading(true);
    try {
      // 这里替换为实际的API调用
      await request.post('/console/api/llm-settings', values);
      message.success('保存成功');
    } catch (error) {
      console.error('保存LLM设置失败:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Card title="LLM模型设置" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 1024,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
            enableStreaming: true,
            systemPrompt: '你是一个AI助手，请帮助用户解答问题。',
          }}
        >
          <Divider orientation="left">基本设置</Divider>
          
          <Form.Item
            name="provider"
            label="LLM提供商"
            rules={[{ required: true, message: '请选择LLM提供商' }]}
          >
            <Select onChange={handleProviderChange}>
              <Option value="openai">OpenAI</Option>
              <Option value="anthropic">Anthropic</Option>
              <Option value="tongyi">通义千问</Option>
              <Option value="custom">自定义</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="model"
            label="模型"
            rules={[{ required: true, message: '请选择模型' }]}
          >
            <Select>
              {form.getFieldValue('provider') && 
                models[form.getFieldValue('provider')]?.map(model => (
                  <Option key={model} value={model}>{model}</Option>
                ))
              }
            </Select>
          </Form.Item>

          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="请输入API密钥" />
          </Form.Item>

          <Divider orientation="left">高级参数</Divider>

          <Form.Item
            name="temperature"
            label="温度 (Temperature)"
            tooltip="控制生成文本的随机性，值越高随机性越大，范围0-2"
            rules={[{ required: true, message: '请输入温度值' }]}
          >
            <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="maxTokens"
            label="最大Token数 (Max Tokens)"
            tooltip="生成文本的最大长度"
            rules={[{ required: true, message: '请输入最大Token数' }]}
          >
            <InputNumber min={1} max={8192} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="topP"
            label="Top P"
            tooltip="控制生成文本的多样性，范围0-1"
            rules={[{ required: true, message: '请输入Top P值' }]}
          >
            <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="frequencyPenalty"
            label="频率惩罚 (Frequency Penalty)"
            tooltip="减少重复词汇的出现，范围0-2"
            rules={[{ required: true, message: '请输入频率惩罚值' }]}
          >
            <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="presencePenalty"
            label="存在惩罚 (Presence Penalty)"
            tooltip="减少主题重复，范围0-2"
            rules={[{ required: true, message: '请输入存在惩罚值' }]}
          >
            <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="enableStreaming"
            label="启用流式响应"
            valuePropName="checked"
            tooltip="启用后可以获得更快的响应体验"
          >
            <Switch />
          </Form.Item>

          <Divider orientation="left">系统提示词</Divider>

          <Form.Item
            name="systemPrompt"
            label="系统提示词 (System Prompt)"
            tooltip="设置AI助手的行为和角色定位"
            rules={[{ required: true, message: '请输入系统提示词' }]}
          >
            <TextArea rows={6} placeholder="输入系统提示词，定义AI助手的行为和角色" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

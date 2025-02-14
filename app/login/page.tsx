'use client';

import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form] = Form.useForm<LoginForm>();

  const onFinish = async (values: LoginForm) => {
    try {
      // TODO: 实现实际的登录API调用
      console.log('登录信息:', values);
      
      // 模拟登录成功
      message.success('登录成功');
      router.push('/knowledge');
    } catch (error) {
      message.error('登录失败，请检查邮箱和密码');
    }
  };

  return (
    <div className={styles.container}>
      <Card 
        title="管理系统登录" 
        className={styles.loginCard}
        headStyle={{ textAlign: 'center' }}
      >
        <Form<LoginForm>
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入邮箱" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度至少为6位' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

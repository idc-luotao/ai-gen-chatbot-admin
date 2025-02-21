'use client';

import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { request } from '../../utils/http';
import { setToken, setRefreshToken, setUserType, setUserName, USER_TYPE_ADMIN, USER_TYPE_COMMON } from '../../utils/storage';
import { useUser } from '../../contexts/UserContext';
import axios from 'axios';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { setUserInfo } = useUser();
  const [form] = Form.useForm<LoginForm>();

  const onFinish = async (values: LoginForm) => {
    try {
      // 先检查用户类型
      const typeResponse = await request.get('/console/api/user/get_type', {
        params: { email: values.email }  
      });
      
      console.log('User type response:', typeResponse);
      
      if (typeResponse.data?.admin_user === 1) {
        setUserType(USER_TYPE_ADMIN);
        // 如果是管理员用户，继续登录流程
        const param = {
          email: values.email,
          password: values.password,
          language: "zh-Hans",
          remember_me: true
        };
        
        const loginResponse = await request.post('/console/api/login', param);
        console.log('Login response:', loginResponse);
        
        if (loginResponse.result === 'success') {
          message.success('登录成功');
          setToken(loginResponse.data.access_token);
          setRefreshToken(loginResponse.data.refresh_token);
          setUserType(loginResponse.data.user_type);
          setUserName(USER_TYPE_ADMIN);  
          setUserInfo(loginResponse.username, USER_TYPE_ADMIN);
          router.replace('/main');
        } else {
          message.error('登录失败，请检查邮箱和密码');
        }
      }
      else if (typeResponse.data?.admin_user === 0) {
        setUserType(USER_TYPE_COMMON);
        // 如果是普通用户，继续登录流程
        const param = {
          email: values.email,
          password: values.password,
          language: "zh-Hans",
          remember_me: true
        };
        
        const loginResponse = await request.post('/console/api/chat-user/login', param);
        console.log('Login response:', loginResponse);
        
        if (loginResponse.result === 'success') {
          message.success('登录成功');
          setToken(loginResponse.data.access_token);
          setRefreshToken(loginResponse.data.refresh_token);
          setUserType(loginResponse.data.user_type);
          setUserName(loginResponse.username);  
          setUserInfo(loginResponse.username, USER_TYPE_COMMON);
          router.replace('/main');
        } else {
          message.error('登录失败，请检查邮箱和密码');
        }
      }
      else {
        message.error('您没有管理员权限');
      }
    } catch (error) {
      console.error('Login error:', error);
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

'use client';

import { useState, useEffect } from 'react';
import { Input, Button, List, Avatar, message, Layout } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import styles from './page.module.css';
import { request } from '../../utils/simpleHttp';
import { useUser } from '../../contexts/UserContext';
import { getUserName } from '../../utils/storage';
import axios from 'axios';

const { Sider, Content } = Layout;

interface Message {
  content: string;
  type: 'user' | 'bot';
  timestamp: number;
}

interface ChatHistory {
  id: string;
  title: string;
}

export default function ChatbotPage() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { userName } = useUser();

  // 获取聊天历史
  useEffect(() => {
    const fetchChatHistories = async () => {
      try {
        const userName = getUserName();
        const token = "app-BFJYGd9Nlbyi5Hhj9RvmyusG";
        const url = `/v1/conversations?last_id=&limit=20&user=${userName}`;
        const response = await request.get(url, token);
        if (response.data.data) {
          const histories = response.data.data.map((conv: any) => ({
            id: conv.id,
            title: conv.name || '未命名对话'
          }));
          setChatHistories(histories);
        }
      } catch (error) {
        message.error('获取聊天历史失败');
        console.error('Error fetching chat histories:', error);
      }
    };

    fetchChatHistories();
  }, []);

  // 选择历史对话
  const handleSelectChat = async (chatId: string) => {
    setSelectedChatId(chatId);
    // TODO: 从后端获取历史消息
    const mockMessages: Message[] = [
      {
        content: '这是历史消息',
        type: 'user',
        timestamp: Date.now() - 1000 * 60,
      },
      {
        content: '这是一条模拟的回复消息',
        type: 'bot',
        timestamp: Date.now(),
      },
    ];
    setMessages(mockMessages);
  };

  // 创建新对话
  const handleNewChat = () => {
    setSelectedChatId(null);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) {
      return;
    }

    const userMessage: Message = {
      content: inputValue,
      type: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // TODO: 实现实际的聊天API
    
      setTimeout(() => {
        const botMessage: Message = {
          content: '这是一个模拟的回复',
          type: 'bot',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, botMessage]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('网络错误，请稍后重试');
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout className={styles.pageContainer}>
      <Sider width={250} theme="light" className={styles.historySider}>
        <div className={styles.historyHeader}>
          <Button type="primary" onClick={handleNewChat} block>
            新建对话
          </Button>
        </div>
        <List
          className={styles.historyList}
          dataSource={chatHistories}
          renderItem={(chat) => (
            <List.Item
              className={`${styles.historyItem} ${selectedChatId === chat.id ? styles.selectedHistory : ''}`}
              onClick={() => handleSelectChat(chat.id)}
            >
              <List.Item.Meta
                avatar={<MessageOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                title={chat.title}
              />
            </List.Item>
          )}
        />
      </Sider>
      <Content className={styles.chatContainer}>
        <div className={styles.chatWindow}>
          <List
            className={styles.messageList}
            dataSource={messages}
            renderItem={(msg) => (
              <List.Item className={msg.type === 'user' ? styles.userMessage : styles.botMessage}>
                <List.Item.Meta
                  avatar={
                    <Avatar icon={msg.type === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                           style={{ backgroundColor: msg.type === 'user' ? '#1890ff' : '#52c41a' }}
                    />
                  }
                  content={msg.content}
                />
              </List.Item>
            )}
          />
          <div className={styles.inputArea}>
            <Input.TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              className={styles.input}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              className={styles.sendButton}
            >
              发送
            </Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Input, Button, List, Avatar, message, Layout } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import styles from './page.module.css';
import { request } from '../../utils/http';
import { useUser } from '../../contexts/UserContext';

const { Sider, Content } = Layout;

interface Message {
  content: string;
  type: 'user' | 'bot';
  timestamp: number;
}

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
}

export default function ChatbotPage() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { userName } = useUser();

  // 获取历史对话记录
  useEffect(() => {
    const fetchChatHistories = async () => {
      try {
        const response = await request.get('/console/api/chat/histories');
        if (response.result === 'success') {
          setChatHistories(response.data);
        }
      } catch (error) {
        message.error('获取历史记录失败');
      }
    };

    fetchChatHistories();
  }, []);

  // 选择历史对话
  const handleSelectChat = async (chatId: string) => {
    setSelectedChatId(chatId);
    try {
      const response = await request.get(`/console/api/chat/history/${chatId}`);
      if (response.result === 'success') {
        setMessages(response.data.messages);
      }
    } catch (error) {
      message.error('获取对话内容失败');
    }
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
      const response = await request.post('/console/api/chat', {
        message: inputValue,
        user: userName,
        chatId: selectedChatId,
      });

      if (response.result === 'success') {
        const botMessage: Message = {
          content: response.data.reply,
          type: 'bot',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, botMessage]);
        
        // 更新历史记录
        if (response.data.chatId) {
          setSelectedChatId(response.data.chatId);
          const fetchChatHistories = async () => {
            const historyResponse = await request.get('/console/api/chat/histories');
            if (historyResponse.result === 'success') {
              setChatHistories(historyResponse.data);
            }
          };
          fetchChatHistories();
        }
      } else {
        message.error('获取回复失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
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
                avatar={<MessageOutlined />}
                title={chat.title}
                description={chat.lastMessage}
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

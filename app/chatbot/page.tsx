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
    // 模拟对话数据
    const mockMessages: Message[] = [
      {
        content: '你好，我想了解一下关于人工智能的基础知识。',
        type: 'user',
        timestamp: Date.now() - 1000 * 60 * 5,
      },
      {
        content: '当然可以。人工智能（AI）是一个广泛的领域，主要研究如何让计算机模拟人类智能。它包括几个主要方向：\n\n1. 机器学习：让计算机通过数据学习和改进\n2. 深度学习：使用神经网络处理复杂问题\n3. 自然语言处理：理解和生成人类语言\n4. 计算机视觉：理解和处理图像数据\n\n您对哪个方向特别感兴趣？',
        type: 'bot',
        timestamp: Date.now() - 1000 * 60 * 4,
      },
      {
        content: '我对自然语言处理比较感兴趣，能详细介绍一下吗？',
        type: 'user',
        timestamp: Date.now() - 1000 * 60 * 3,
      },
      {
        content: '自然语言处理（NLP）是AI的重要分支，主要研究计算机如何理解和处理人类语言。以下是一些关键应用：\n\n1. 机器翻译：在不同语言间进行翻译\n2. 文本分类：对文档进行自动分类\n3. 情感分析：理解文本中的情感倾向\n4. 问答系统：自动回答用户问题\n5. 文本生成：创建人类可读的文本\n\n现代NLP主要基于深度学习模型，如Transformer架构，代表作品有GPT和BERT等。',
        type: 'bot',
        timestamp: Date.now() - 1000 * 60 * 2,
      },
      {
        content: '这些模型是如何学习理解人类语言的？',
        type: 'user',
        timestamp: Date.now() - 1000 * 60,
      },
      {
        content: '这些模型通过以下步骤学习理解人类语言：\n\n1. 预训练：在大量文本数据上学习语言的基本模式\n2. 词向量：将单词转换为计算机可理解的数值向量\n3. 注意力机制：学习识别文本中的重要关系\n4. 上下文理解：考虑词语在不同语境中的含义\n5. 微调：针对特定任务进行优化\n\n比如GPT-3就是在超过4500亿个词语上训练得到的，这使它能够理解和生成接近人类水平的文本。',
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
                {msg.type === 'user' ? (
                  <>
                    <div className={styles.messageContent}>
                      {msg.content.split('\n').map((line, index) => (
                        <div key={index}>
                          {line}
                          {index < msg.content.split('\n').length - 1 && <br />}
                        </div>
                      ))}
                    </div>
                    <Avatar 
                      size={32}
                      style={{ 
                        backgroundColor: '#1677ff'
                      }}
                    >
                      用户
                    </Avatar>
                  </>
                ) : (
                  <>
                    <Avatar 
                      size={32}
                      style={{ 
                        backgroundColor: '#1677ff'
                      }}
                    >
                      AI
                    </Avatar>
                    <div className={styles.messageContent}>
                      {msg.content.split('\n').map((line, index) => (
                        <div key={index}>
                          {line}
                          {index < msg.content.split('\n').length - 1 && <br />}
                        </div>
                      ))}
                    </div>
                  </>
                )}
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

'use client';

import { useState, useRef, useEffect } from 'react';
import { Layout, List, Input, Button, Avatar, Empty, Upload } from 'antd';
import { SendOutlined, DeleteOutlined, PlusOutlined, PaperClipOutlined } from '@ant-design/icons';
import styles from './page.module.css';

const { Header, Content, Sider } = Layout;

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'user',
      content: '你好，我想了解一下人工智能的基本概念。',
      timestamp: Date.now() - 7200000
    },
    {
      id: '2',
      type: 'bot',
      content: '人工智能（AI）是一个广泛的领域，主要研究如何让计算机模拟和展现人类的智能。它包括几个主要方面：\n\n1. 机器学习：让计算机通过数据学习和改进\n2. 深度学习：使用神经网络处理复杂问题\n3. 自然语言处理：理解和生成人类语言\n4. 计算机视觉：处理和理解视觉信息\n\n您对哪个方面特别感兴趣？我们可以深入讨论。',
      timestamp: Date.now() - 7180000
    },
    {
      id: '3',
      type: 'user',
      content: '我对自然语言处理比较感兴趣，能详细介绍一下吗？',
      timestamp: Date.now() - 7100000
    },
    {
      id: '4',
      type: 'bot',
      content: '自然语言处理（NLP）是AI的重要分支，它致力于让计算机理解和处理人类语言。主要应用包括：\n\n1. 机器翻译：在不同语言间进行翻译\n2. 文本分类：对文本进行分类和标记\n3. 情感分析：理解文本中的情感倾向\n4. 问答系统：理解问题并生成答案\n5. 语音识别：将语音转换为文本\n\n现代NLP主要基于深度学习模型，如Transformer架构，代表性的模型包括GPT和BERT等。',
      timestamp: Date.now() - 7080000
    },
    {
      id: '5',
      type: 'user',
      content: 'GPT是什么？它和传统的NLP模型有什么区别？',
      timestamp: Date.now() - 7000000
    },
    {
      id: '6',
      type: 'bot',
      content: 'GPT（Generative Pre-trained Transformer）是一种先进的语言模型，它有几个重要特点：\n\n1. 预训练：在大量文本数据上进行预训练，学习语言的基本规律\n2. 生成能力：能够生成连贯、流畅的文本\n3. 上下文理解：能够理解长文本的上下文关系\n4. 零样本学习：可以完成没有专门训练过的任务\n\n与传统NLP模型相比，GPT：\n- 不需要针对特定任务进行设计\n- 理解能力更强\n- 生成的文本更自然\n- 可以处理多种不同类型的任务',
      timestamp: Date.now() - 6980000
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: '人工智能基础知识',
      lastMessage: '',
      timestamp: Date.now() - 6980000
    },
    {
      id: '2',
      title: '机器学习应用',
      lastMessage: '',
      timestamp: Date.now() - 86400000
    },
    {
      id: '3',
      title: '深度学习框架',
      lastMessage: '',
      timestamp: Date.now() - 172800000
    },
    {
      id: '4',
      title: '计算机视觉讨论',
      lastMessage: '',
      timestamp: Date.now() - 259200000
    }
  ]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // 模拟机器人回复
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '这是一个模拟的机器人回复消息。',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: '新对话',
      lastMessage: '',
      timestamp: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setSelectedSession(newSession.id);
    setMessages([]);
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const date = new Date(timestamp);

    // 如果是今天的消息，显示时间
    if (diff < 24 * 60 * 60 * 1000) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // 如果是最近7天的消息，显示星期几
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return days[date.getDay()];
    }
    
    // 其他情况显示日期
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <Layout className={styles.pageContainer}>
      <Sider width={300} className={styles.sider}>
        <div className={styles.sessionHeader}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleNewChat}
            className={styles.newChatButton}
          >
            新建对话
          </Button>
        </div>
        <List
          className={styles.sessionList}
          dataSource={sessions}
          renderItem={(session) => (
            <List.Item
              className={`${styles.sessionItem} ${selectedSession === session.id ? styles.selectedSession : ''}`}
              onClick={() => setSelectedSession(session.id)}
            >
              <div className={styles.sessionTitle}>{session.title}</div>
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setSessions(prev => prev.filter(s => s.id !== session.id));
                }}
              />
            </List.Item>
          )}
        />
      </Sider>
      <Layout className={styles.chatContainer}>
        <Content className={styles.chatContent}>
          {selectedSession ? (
            <>
              <div className={styles.messageList}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={msg.type === 'user' ? styles.userMessage : styles.botMessage}
                  >
                    {msg.type === 'user' ? (
                      <>
                        <Avatar 
                          size={32}
                          style={{ backgroundColor: '#1677ff' }}
                        >
                          用户
                        </Avatar>
                        <div className={styles.messageContent}>
                          <div className={styles.messageText}>{msg.content}</div>
                          <div className={styles.messageTime}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Avatar 
                          size={32}
                          style={{ backgroundColor: '#1677ff' }}
                        >
                          AI
                        </Avatar>
                        <div className={styles.messageContent}>
                          <div className={styles.messageText}>{msg.content}</div>
                          <div className={styles.messageTime}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className={styles.inputArea}>
                <Upload
                  className={styles.upload}
                  showUploadList={false}
                  beforeUpload={(file) => {
                    // 将文件名添加到输入框
                    setInputValue(prev => {
                      const prefix = prev.trim() ? prev.trim() + ' ' : '';
                      return prefix + `[文件: ${file.name}]`;
                    });
                    // 返回 false 阻止自动上传
                    return false;
                  }}
                >
                  <Button 
                    type="text" 
                    icon={<PaperClipOutlined />}
                    className={styles.uploadButton}
                  />
                </Upload>
                <Input.TextArea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="输入消息，按Enter发送，Shift+Enter换行"
                  autoSize={{ minRows: 1, maxRows: 4 }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  className={styles.sendButton}
                >
                  发送
                </Button>
              </div>
            </>
          ) : (
            <Empty
              description="请选择一个会话或创建新的会话"
              className={styles.emptyState}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
}

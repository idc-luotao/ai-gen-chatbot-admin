'use client';

import { useState, useRef, useEffect } from 'react';
import { Layout, List, Input, Button, Avatar, Empty, Upload, message } from 'antd';
import { SendOutlined, DeleteOutlined, PlusOutlined, PaperClipOutlined } from '@ant-design/icons';
import styles from './page.module.css';
import { request } from '../../utils/simpleHttp';
import { getUserName } from '../../utils/storage';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取会话列表
  useEffect(() => {
    fetchConversations();
  }, []);

  // 当选择会话变化时，加载对应的消息
  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession);
    } else {
      setMessages([]);
    }
  }, [selectedSession]);

  const fetchConversations = async () => {
    try {
      const userName = getUserName();
      const token = "app-BFJYGd9Nlbyi5Hhj9RvmyusG"; // 使用固定的 token，实际应用中应该从存储中获取
      const url = `/v1/conversations?last_id=&limit=20&user=${userName}`;
      
      setLoading(true);
      const response = await request.get(url, token);
      setLoading(false);
      
      if (response.data.data) {
        const conversations = response.data.data.map((conv: any) => ({
          id: conv.id,
          title: conv.name || '未命名对话',
          lastMessage: '',
          timestamp: new Date(conv.updated_at || conv.created_at).getTime()
        }));
        setSessions(conversations);
        
        // 如果有会话，默认选择第一个
        if (conversations.length > 0 && !selectedSession) {
          setSelectedSession(conversations[0].id);
        }
      }
    } catch (error) {
      setLoading(false);
      message.error('获取会话列表失败');
      console.error('Error fetching conversations:', error);
    }
  };

  // 获取特定会话的消息（使用模拟数据）
  const fetchMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 模拟消息数据
      const mockMessages: Message[] = [
        {
          id: '1',
          type: 'user',
          content: '你好，我想了解一下关于人工智能的基础知识。',
          timestamp: Date.now() - 1000 * 60 * 30
        },
        {
          id: '2',
          type: 'bot',
          content: '当然可以。人工智能（AI）是一个广泛的领域，主要研究如何让计算机模拟人类智能。它包括几个主要方向：\n\n1. 机器学习：让计算机通过数据学习和改进\n2. 深度学习：使用神经网络处理复杂问题\n3. 自然语言处理：理解和生成人类语言\n4. 计算机视觉：理解和处理图像数据\n\n您对哪个方向特别感兴趣？',
          timestamp: Date.now() - 1000 * 60 * 29
        },
        {
          id: '3',
          type: 'user',
          content: '我对自然语言处理比较感兴趣，能详细介绍一下吗？',
          timestamp: Date.now() - 1000 * 60 * 25
        },
        {
          id: '4',
          type: 'bot',
          content: '自然语言处理（NLP）是AI的重要分支，主要研究计算机如何理解和处理人类语言。以下是一些关键应用：\n\n1. 机器翻译：在不同语言间进行翻译\n2. 文本分类：对文档进行自动分类\n3. 情感分析：理解文本中的情感倾向\n4. 问答系统：自动回答用户问题\n5. 文本生成：创建人类可读的文本\n\n现代NLP主要基于深度学习模型，如Transformer架构，代表作品有GPT和BERT等。',
          timestamp: Date.now() - 1000 * 60 * 24
        },
        {
          id: '5',
          type: 'user',
          content: '这些模型是如何学习理解人类语言的？',
          timestamp: Date.now() - 1000 * 60 * 20
        },
        {
          id: '6',
          type: 'bot',
          content: '这些模型通过以下步骤学习理解人类语言：\n\n1. 预训练：在大量文本数据上学习语言的基本模式\n2. 词向量：将单词转换为计算机可理解的数值向量\n3. 注意力机制：学习识别文本中的重要关系\n4. 上下文理解：考虑词语在不同语境中的含义\n5. 微调：针对特定任务进行优化\n\n比如GPT-3就是在超过4500亿个词语上训练得到的，这使它能够理解和生成接近人类水平的文本。',
          timestamp: Date.now() - 1000 * 60 * 19
        }
      ];
      
      // 根据会话ID生成不同的消息内容
      const sessionIdNum = parseInt(conversationId.replace(/\D/g, '')) || 0;
      const adjustedMessages = mockMessages.map(msg => {
        // 根据会话ID调整消息内容，使不同会话显示不同内容
        if (sessionIdNum % 3 === 0) {
          return msg;
        } else if (sessionIdNum % 3 === 1) {
          return {
            ...msg,
            content: msg.type === 'user' 
              ? `我想了解机器学习的应用场景。` 
              : `机器学习在多个领域有广泛应用：\n\n1. 医疗：疾病诊断和预测\n2. 金融：风险评估和欺诈检测\n3. 零售：个性化推荐系统\n4. 制造业：预测性维护\n5. 交通：自动驾驶技术\n\n这些应用都依赖于从大量数据中学习模式的能力。`
          };
        } else {
          return {
            ...msg,
            content: msg.type === 'user' 
              ? `深度学习和传统机器学习有什么区别？` 
              : `深度学习与传统机器学习的主要区别：\n\n1. 特征提取：深度学习自动提取特征，传统机器学习需要手动设计\n2. 数据量：深度学习通常需要更大的数据集\n3. 计算资源：深度学习需要更强的计算能力\n4. 模型复杂度：深度学习模型层次更深，参数更多\n5. 可解释性：深度学习模型通常是"黑盒"，较难解释\n\n深度学习在处理非结构化数据（如图像、文本）时表现尤为出色。`
          };
        }
      });
      
      setMessages(adjustedMessages);
    } catch (error) {
      message.error('获取消息失败');
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    // 先在界面上显示用户消息
    setMessages(prev => [...prev, newMessage]);
    const currentInput = inputValue;
    setInputValue('');

    // 模拟机器人回复
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '这是一个模拟的机器人回复消息。根据您的问题，我需要更多信息来提供准确的回答。您能否提供更多细节？',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleNewChat = () => {
    setSelectedSession(null);
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
          loading={loading}
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
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    // 模拟网络延迟
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // 从列表中移除
                    setSessions(prev => prev.filter(s => s.id !== session.id));
                    
                    // 如果删除的是当前选中的会话，清空选择
                    if (selectedSession === session.id) {
                      setSelectedSession(null);
                      setMessages([]);
                    }
                    
                    message.success('删除成功');
                  } catch (error) {
                    message.error('删除失败');
                    console.error('Error deleting conversation:', error);
                  }
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
                {loadingMessages ? (
                  <div className={styles.loadingMessages}>加载消息中...</div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => (
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
                  ))
                ) : (
                  <div className={styles.emptyMessages}>
                    <Empty description="暂无消息" />
                  </div>
                )}
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

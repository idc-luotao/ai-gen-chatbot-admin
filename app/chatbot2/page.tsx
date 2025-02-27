'use client';

import { useState, useRef, useEffect } from 'react';
import { Layout, List, Input, Button, Avatar, Empty, Upload, message, Modal } from 'antd';
import { SendOutlined, DeleteOutlined, PlusOutlined, PaperClipOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import styles from './page.module.css';
import { request } from '../../utils/simpleHttp';
import { getUserName } from '../../utils/storage';
import { API_TOKEN } from '../../utils/config';

const { Header, Content, Sider } = Layout;
const { confirm } = Modal;

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
      const token = API_TOKEN; // 从配置文件获取 token
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

  // 获取特定会话的消息
  const fetchMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const userName = getUserName();
      const token = API_TOKEN; // 从配置文件获取 token
      const url = `/v1/messages?conversation_id=${conversationId}&user=${userName}`;
      
      const response = await request.get(url, token);
      
      if (response.data.data) {
        const messageList1 = response.data.data.map((msg: any) => ({
          id: msg.id,
          type: 'user',
          content: msg.query,
          timestamp: new Date(msg.created_at).getTime()
        }));
        // 将API返回的消息格式转换为应用中使用的格式
        const messageList2 = response.data.data.map((msg: any) => ({
          id: msg.id,
          type: 'bot',
          content: msg.answer,
          timestamp: new Date(msg.created_at).getTime()
        }));
        // 将API返回的消息格式转换为应用中使用的格式
        const messageList = messageList1.concat(messageList2);

        // 按时间顺序排序消息
        messageList.sort((a: Message, b: Message) => a.timestamp - b.timestamp);
        
        setMessages(messageList);
      } else {
        setMessages([]);
      }
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

    try {
      const userName = getUserName();
      const token = API_TOKEN; // 从配置文件获取 token
      
      // 如果没有选中的会话，先创建一个新会话
      let conversationId = selectedSession;
      
      if (!conversationId) {
        // 创建新会话
        const createConvResponse = await request.post(
          '/v1/conversations', 
          token, 
          { 
            user: userName,
            name: currentInput.length > 20 ? currentInput.substring(0, 20) + '...' : currentInput
          }
        );
        
        if (createConvResponse.data.data) {
          conversationId = createConvResponse.data.data.id;
          const newConv = {
            id: conversationId,
            title: createConvResponse.data.data.name || '新对话',
            lastMessage: currentInput,
            timestamp: Date.now()
          };
          
          setSessions(prev => [newConv, ...prev]);
          setSelectedSession(conversationId);
        } else {
          message.error('创建会话失败');
          return;
        }
      }
      
      // 发送消息
      await request.post(
        '/v1/messages', 
        token, 
        {
          conversation_id: conversationId,
          content: currentInput,
          role: 'user',
          user: userName
        }
      );
      
      // 刷新消息列表
      fetchMessages(conversationId);
      
    } catch (error) {
      message.error('发送消息失败');
      console.error('Error sending message:', error);
    }
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
                onClick={(e) => {
                  e.stopPropagation();
                  
                  // 显示确认对话框
                  confirm({
                    title: '确认删除',
                    icon: <ExclamationCircleOutlined />,
                    content: '确定要删除这个会话吗？此操作不可恢复。',
                    okText: '确认',
                    cancelText: '取消',
                    onOk: async () => {
                      try {
                        const userName = getUserName();
                        const token = API_TOKEN; // 从配置文件获取 token
                        // 使用 DELETE 请求，并在请求体中传递 user 参数
                        await request.delete(
                          `/v1/conversations/${session.id}`, 
                          token,
                          { user: userName }
                        );
                        
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
                    }
                  });
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

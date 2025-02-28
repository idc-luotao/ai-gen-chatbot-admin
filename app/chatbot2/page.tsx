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
  isStreaming?: boolean;
  fileInfo?: {
    fileName: string;
    fileId: string;
  };
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
  const [isStreaming, setIsStreaming] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{fileName: string, fileId: string} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取会话列表
  useEffect(() => {
    fetchConversations();
  }, []);

  // 当选择会话变化时，加载对应的消息
  useEffect(() => {
    if (selectedSession&&selectedSession!=='empty') {
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
          id: 'user-' + msg.id,
          type: 'user',
          content: msg.query,
          timestamp: new Date(msg.created_at).getTime()
        }));
        // 将API返回的消息格式转换为应用中使用的格式
        const messageList2 = response.data.data.map((msg: any) => ({
          id: 'bot-' + msg.id,
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
    // 如果没有输入内容且没有上传文件，则不发送
    if (!inputValue.trim() && !uploadedFile) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: uploadedFile ? '' : inputValue,
      timestamp: Date.now(),
      fileInfo: uploadedFile || undefined
    };

    // 先在界面上显示用户消息
    setMessages(prev => [...prev, newMessage]);
    const currentInput = inputValue;
    setInputValue('');
    const currentImageUrl = imageUrl;
    setImageUrl(''); // 清空图片URL
    
    // 清空上传的文件信息
    const currentUploadedFile = uploadedFile;
    setUploadedFile(null);
    
    try {
      const userName = getUserName();
      const token = API_TOKEN; // 从配置文件获取 token

      // 如果没有选中的会话，先创建一个新会话
      let conversationId = selectedSession;
      if(conversationId==='empty'){
          conversationId = '';
      }

      // 创建一个空的机器人回复消息，用于流式显示
      const botMessageId = `bot-${Date.now()}`;

      const botMessage: Message = {
        id: botMessageId,
        type: 'bot',
        content: '正在思考...',
        timestamp: Date.now(),
        isStreaming: true
      };

      // 添加空的机器人消息到消息列表
      setMessages(prev => [...prev, botMessage]);
      setIsStreaming(true);

      // 准备文件数组
      const files = [];
      if (currentImageUrl) {
        files.push({
          type: "image",
          transfer_method: "remote_url",
          url: currentImageUrl
        });
      }
      
      // 如果有上传的文件，添加到请求中
      if (currentUploadedFile) {
        files.push({
          type: "file",
          transfer_method: "file_id",
          file_id: currentUploadedFile.fileId,
          file_name: currentUploadedFile.fileName
        });
      }

      // 调用流式API
      try {
        console.log('开始流式请求');

        // 准备请求数据
        const requestData = {
          inputs: {},
          query: currentUploadedFile ? `[文件上传] ${currentUploadedFile.fileName}` : currentInput,
          response_mode: "streaming",
          conversation_id: conversationId || "",
          user: userName,
          files: files
        };

        // 使用simpleHttp中的stream方法
        await request.stream(
          '/v1/chat-messages',
          token,
          requestData,
          (jsonData) => {
            // 处理每个数据块
            console.log('收到数据块:', jsonData);

            if (jsonData.event === 'message' && jsonData.answer !== undefined) {
              // 更新内容
              const streamContent = jsonData.answer;
              console.log('更新消息内容:', streamContent);

              // 更新消息 - 使用函数式更新确保基于最新状态
              setMessages(prev => {
                // 查找当前机器人消息
                const currentMessage = prev.find(msg => msg.id === botMessageId);
                
                // 如果找不到消息或消息已经包含了这个内容，则不更新
                if (!currentMessage) return prev;
                
                // 创建新的消息列表，替换机器人消息
                return prev.map(msg => 
                  msg.id === botMessageId
                    ? { ...msg, content: msg.content + streamContent }
                    : msg
                );
              });
            } else if (jsonData.event === 'message_end') {
              console.log('收到消息结束事件');
            }
          },
          // 完成回调
          () => {
            console.log('流式传输完成');
            setIsStreaming(false);

            // 更新最终状态
            setMessages(prev => {
              return prev.map(msg => 
                msg.id === botMessageId
                  ? { ...msg, isStreaming: false }
                  : msg
              );
            });
          },
          // 错误回调
          (error) => {
            console.error('流式请求错误:', error);
            setIsStreaming(false);

            // 更新错误状态
            setMessages(prev =>
              prev.map(msg =>
                msg.id === botMessageId
                  ? { ...msg, content: '获取回复失败，请重试', isStreaming: false }
                  : msg
              )
            );

            message.error('获取回复失败');
          }
        );
      } catch (error) {
        setIsStreaming(false);
        message.error('获取回复失败');
        console.error('Error streaming response:', error);

        // 移除空的机器人消息或标记为错误
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId
              ? { ...msg, content: '获取回复失败，请重试', isStreaming: false }
              : msg
          )
        );
      }
    } catch (error) {
      message.error('发送消息失败');
      console.error('Error sending message:', error);
    }
  };

  const handleNewChat = () => {
    setSelectedSession('empty');
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
                            {msg.fileInfo && (
                              <div className={styles.fileInfo}>
                                <div className={styles.fileName}>文件名: {msg.fileInfo.fileName}</div>
                                <div className={styles.fileId}>文件ID: {msg.fileInfo.fileId}</div>
                              </div>
                            )}
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
                            <div className={styles.messageText}>
                              {msg.content}
                              {msg.isStreaming && <span className={styles.cursorBlink}>|</span>}
                            </div>
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
                <div className={styles.inputWrapper}>
                  <div className={styles.inputActions}>
                    <Upload
                      showUploadList={false}
                      beforeUpload={async (file) => {
                        try {
                          // 显示上传中提示
                          const uploadingKey = `uploading-${Date.now()}`;
                          message.loading({ content: `正在上传文件: ${file.name}...`, key: uploadingKey });
                          
                          // 使用simpleHttp的uploadFile方法上传文件
                          const token = API_TOKEN;
                          const userName = getUserName();
                          const response = await request.uploadFile(
                            '/v1/files/upload',
                            token,
                            file,
                            userName,
                            (percent) => {
                              message.loading({ 
                                content: `正在上传文件: ${file.name}... ${percent}%`, 
                                key: uploadingKey 
                              });
                            }
                          );
                          
                          // 解析响应
                          const data = response.data;
                          
                          // 设置上传的文件信息
                          setUploadedFile({
                            fileName: data.name,
                            fileId: data.id
                          });
                          
                          // 显示成功消息
                          message.success({ 
                            content: `${file.name} 上传成功，文件ID: ${data.id}`, 
                            key: uploadingKey 
                          });
                        } catch (error) {
                          console.error('文件上传失败:', error);
                          message.error(`文件上传失败: ${error.message}`);
                        }
                        
                        // 阻止默认上传行为
                        return false;
                      }}
                    >
                      <Button 
                        icon={<PaperClipOutlined />} 
                        type="text"
                        title="上传文件"
                        disabled={!!uploadedFile}
                      />
                    </Upload>
                    {uploadedFile && (
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        title="取消上传"
                        onClick={() => setUploadedFile(null)}
                      />
                    )}
                  </div>
                  {uploadedFile ? (
                    <div className={styles.fileInfoInput}>
                      <div className={styles.fileName}>文件名: {uploadedFile.fileName}</div>
                      <div className={styles.fileId}>文件ID: {uploadedFile.fileId}</div>
                    </div>
                  ) : (
                    <Input.TextArea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="输入消息..."
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  )}
                  <div className={styles.sendButton}>
                    <Button
                      type="primary"
                      onClick={handleSendMessage}
                      loading={isStreaming}
                      disabled={isStreaming}
                      icon={<SendOutlined />}
                    >
                      发送
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.messageList}>
                <div className={styles.emptyMessages}>
                  <Empty description="新建对话" />
                </div>
                <div ref={messagesEndRef} />
              </div>
              <div className={styles.inputArea}>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputActions}>
                    <Upload
                      showUploadList={false}
                      beforeUpload={async (file) => {
                        try {
                          // 显示上传中提示
                          const uploadingKey = `uploading-${Date.now()}`;
                          message.loading({ content: `正在上传文件: ${file.name}...`, key: uploadingKey });
                          
                          // 使用simpleHttp的uploadFile方法上传文件
                          const token = API_TOKEN;
                          const userName = getUserName();
                          const response = await request.uploadFile(
                            '/v1/files/upload',
                            token,
                            file,
                            userName,
                            (percent) => {
                              message.loading({ 
                                content: `正在上传文件: ${file.name}... ${percent}%`, 
                                key: uploadingKey 
                              });
                            }
                          );
                          
                          // 解析响应
                          const data = response.data;
                          
                          // 设置上传的文件信息
                          setUploadedFile({
                            fileName: data.name,
                            fileId: data.id
                          });
                          
                          // 显示成功消息
                          message.success({ 
                            content: `${file.name} 上传成功，文件ID: ${data.id}`, 
                            key: uploadingKey 
                          });
                        } catch (error) {
                          console.error('文件上传失败:', error);
                          message.error(`文件上传失败: ${error.message}`);
                        }
                        
                        // 阻止默认上传行为
                        return false;
                      }}
                    >
                      <Button 
                        icon={<PaperClipOutlined />} 
                        type="text"
                        title="上传文件"
                        disabled={!!uploadedFile}
                      />
                    </Upload>
                    {uploadedFile && (
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        title="取消上传"
                        onClick={() => setUploadedFile(null)}
                      />
                    )}
                  </div>
                  {uploadedFile ? (
                    <div className={styles.fileInfoInput}>
                      <div className={styles.fileName}>文件名: {uploadedFile.fileName}</div>
                      <div className={styles.fileId}>文件ID: {uploadedFile.fileId}</div>
                    </div>
                  ) : (
                    <Input.TextArea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="输入消息开始新对话..."
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  )}
                  <div className={styles.sendButton}>
                    <Button
                      type="primary"
                      onClick={handleSendMessage}
                      loading={isStreaming}
                      disabled={isStreaming}
                      icon={<SendOutlined />}
                    >
                      发送
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}

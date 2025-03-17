'use client';

import { useState, useRef, useEffect } from 'react';
import { Layout, List, Input, Button, Avatar, Empty, Upload, message, Modal, Dropdown } from 'antd';
import { SendOutlined, DeleteOutlined, PlusOutlined, PaperClipOutlined, ExclamationCircleOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import styles from './page.module.css';
import { request } from '../../utils/simpleHttp';
import { getUserName } from '../../utils/storage';
import { API_TOKEN } from '../../utils/config';
import { useTranslation } from '../../utils/i18n';

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
  formElements?: {
    type: 'button' | 'text' | 'select';
    id: string;
    label: string;
    value?: string;
    options?: { label: string; value: string }[];
    placeholder?: string;
    action?: string;
  }[];
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
}

export default function ChatbotPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ fileName: string, fileId: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取会话列表
  useEffect(() => {
    fetchConversations();
  }, []);

  // 当选择会话变化时，加载对应的消息
  useEffect(() => {
    if (selectedSession && selectedSession !== 'empty') {
      fetchMessages(selectedSession);
    } else {
      setMessages([]);
    }
  }, [selectedSession]);

  const fetchConversations = async () => {
    try {
      const userName = getUserName();
      const token = API_TOKEN as string; // 从配置文件获取 token
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
      message.error(t('chatbot2.fetchConversationsFailed'));
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
      message.error(t('chatbot2.fetchMessagesFailed'));
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
      if (conversationId === 'empty') {
        conversationId = '';
      }

      // 创建一个空的机器人回复消息，用于流式显示
      const botMessageId = `bot-${Date.now()}`;

      // 用于累积完整响应的变量
      let fullResponse = '';

      const botMessage: Message = {
        id: botMessageId,
        type: 'bot',
        content: t('chatbot2.processing'),
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
          inputs: { explainJson: true },
          query: currentUploadedFile ? `[文件上传] ${currentUploadedFile.fileName}` : currentInput,
          response_mode: "streaming",
          conversation_id: conversationId || "",
          user: userName,
          files: files,
          question_type: "1"
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

              // 累积完整响应
              fullResponse += streamContent;

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
              console.log('收到消息结束事件，设置conversation_id');
              conversationId = jsonData.conversation_id

              // 更新最终消息
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === botMessageId
                    ? {
                      ...msg,
                      content: fullResponse,
                      isStreaming: false
                    }
                    : msg
                )
              );
              // 更新选中的会话ID
              setSelectedSession(prev => {
                if (prev === conversationId) return prev;
                return conversationId;
              });
            }
          },
          // 完成回调
          async () => {
            console.log('流式传输完成');
            setIsStreaming(false);
            // 获取完整的响应消息
            console.log('完整的响应消息:', fullResponse);
            // 更新最终状态
            setMessages(prev => {
              return prev.map(msg =>
                msg.id === botMessageId
                  ? { ...msg, isStreaming: false }
                  : msg
              );
            });
            const indexStart = fullResponse.indexOf('```json');
            if (indexStart >= 0) {
              const indexEnd = fullResponse.lastIndexOf('```');
              const jsonString = fullResponse.substring(indexStart + 8, indexEnd - 1);
              console.log('提取的JSON字符串:', jsonString);

              try {
                // 将字符串转换为JSON对象
                const jsonData = JSON.parse(jsonString);
                console.log('解析后的JSON数据发送请求:', jsonData);
                // 调用API
                const res1 = await request.get(
                  'http://localhost:5003/get_param',
                  '',
                  {
                    params: jsonData
                  }
                )
                generateFormFromParams(res1.data.params,'');
              } catch (error) {
                console.error('JSON解析错误:', error);
                console.error('json error:', jsonString);
              }
            } else {
              // 非JSON格式的响应处理
              console.log('响应不是JSON格式');
            }
          },
          // 错误回调
          (error) => {
            console.error('流式请求错误:', error);
            setIsStreaming(false);
            // 更新错误状态
            setMessages(prev =>
              prev.map(msg =>
                msg.id === botMessageId
                  ? { ...msg, content: t('chatbot2.getReplyFailed'), isStreaming: false }
                  : msg
              )
            );

            message.error(t('chatbot2.getReplyFailed'));
          },
          // 开始回调 - 清空"正在思考..."
          () => {
            setMessages(prev => {
              return prev.map(msg =>
                msg.id === botMessageId
                  ? { ...msg, content: '' }
                  : msg
              );
            });
          }
        );

      } catch (error) {
        setIsStreaming(false);
        message.error(t('chatbot2.getReplyFailed'));
        console.error('Error streaming response:', error);

        // 移除空的机器人消息或标记为错误
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId
              ? { ...msg, content: t('chatbot2.getReplyFailed'), isStreaming: false }
              : msg
          )
        );
      }
    } catch (error) {
      message.error(t('chatbot2.sendMessageFailed'));
      console.error('Error sending message:', error);
    }
  };

  const handleNewChat = () => {
    setSessions(prev => [{ id: 'empty', title: t('chatbot2.newConversation'), lastMessage: '', timestamp: Date.now() }, ...prev]);
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
      const days = [t('chatbot2.sunday'), t('chatbot2.monday'), t('chatbot2.tuesday'), t('chatbot2.wednesday'), t('chatbot2.thursday'), t('chatbot2.friday'), t('chatbot2.saturday')];
      return days[date.getDay()];
    }

    // 其他情况显示日期
    return `${date.getMonth() + 1}${t('chatbot2.month')}${date.getDate()}${t('chatbot2.day')}`;
  };

  // 处理表单元素操作
  const handleFormElementAction = (elementId: string, action: string) => {
    console.log(`执行表单元素操作: ${elementId}, 动作: ${action}`);
    // 根据action执行不同的操作
    if (action.startsWith('submit:')) {
      const formData = extractFormData();
      const submitTo = action.replace('submit:', '');
      handleFormSubmit(submitTo, formData);
    } else if (action === 'clear') {
      clearFormData();
    }
  };

  // 处理表单提交
  const handleFormSubmit = async (submitTo: string, formData: Record<string, string>) => {

    const token = API_TOKEN as string;
    const userName = getUserName();

    // // 创建一个新的用户消息，显示提交的表单数据
    // const formDataMessage = Object.entries(formData)
    //   .map(([key, value]) => `${key}: ${value}`)
    //   .join('\n');

    // const userMessage: Message = {
    //   id: `user-${Date.now()}`,
    //   type: 'user',
    //   content: `提交表单数据:\n${formDataMessage}`,
    //   timestamp: Date.now()
    // };

    // setMessages(prev => [...prev, userMessage]);

    const funSendQuestionStram = async (param: any) => {
      request.stream(
        '/v1/chat-messages',
        token,
        param,
        (jsonData) => {
          if (jsonData.event === 'message' && jsonData.answer !== undefined) {
            // 更新内容
            const streamContent = jsonData.answer;
            console.log('更新消息内容2:', streamContent);
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
        () => {
          console.log('收到消息结束事件onComplete');
          setIsStreaming(false);
        }
      )
    }

    // 创建一个空的机器人回复消息
    const botMessageId = `bot-${Date.now()}`;
    const botMessage: Message = {
      id: botMessageId,
      type: 'bot',
      content: t('chatbot2.processingFormData'),
      timestamp: Date.now(),
      isStreaming: true
    };

    // 添加空的机器人消息到消息列表
    setMessages(prev => [...prev, botMessage]);
    setIsStreaming(true);

    const requestParam = {
      "id": "1",
      "type": "flow",
      "params": formData
    };

    const funcMakeLLMRequest = (question:string, prompt:string) => {
      const errorResponseQuest = {
        inputs: { explainJson: true },
        query: question,
        response_mode: "streaming",
        conversation_id: selectedSession || "",
        user: userName,
        files: [],
        question_type: "2",
        dynamic_prompt: encodeURIComponent(prompt)
      };
      return errorResponseQuest;
    }

    try {
      const responseExecute = await request.post('http://localhost:5003/execute', '', requestParam);
      const questionData = responseExecute.data.result_data;
      const dynamicPrompt = responseExecute.data.message;
      await funSendQuestionStram(funcMakeLLMRequest(questionData, dynamicPrompt));
    } catch (error: any) {
      const errorResponseData = error.response?.data.error;
      const dynamicPrompt = errorResponseData.message;
      await funSendQuestionStram(funcMakeLLMRequest(errorResponseData,dynamicPrompt));
    }
  };

  // 处理表单元素值变化
  const handleFormElementChange = (elementId: string, value: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (!msg.formElements) return msg;

        const updatedFormElements = msg.formElements.map(element =>
          element.id === elementId ? { ...element, value } : element
        );

        return { ...msg, formElements: updatedFormElements };
      })
    );
  };

  // 提取表单数据
  const extractFormData = () => {
    const formData: Record<string, string> = {};

    messages.forEach(msg => {
      if (msg.formElements) {
        msg.formElements.forEach(element => {
          if (element.value) {
            formData[element.id] = element.value;
          }
        });
      }
    });

    return formData;
  };

  // 清除表单数据
  const clearFormData = () => {
    setMessages(prev =>
      prev.map(msg => {
        if (!msg.formElements) return msg;

        const clearedFormElements = msg.formElements.map(element =>
          ({ ...element, value: '' })
        );

        return { ...msg, formElements: clearedFormElements };
      })
    );
  };

  // 根据JSON参数生成表单
  const generateFormFromParams = (params: any[], submitEndpoint: string = '/v1/form-submit') => {
    const botMessageId = `bot-${Date.now()}`;

    // 创建表单元素
    const formElements = params.map(param => ({
      type: param.param_type,
      id: param.api_param_name,
      label: param.api_param_name, // 使用参数名作为标签
      placeholder: `${t('chatbot2.pleaseEnter')}${param.api_param_name}`,
      value: ''
    }));

    // 添加提交和清除按钮
    formElements.push(
      {
        type: 'button',
        id: 'submit',
        label: t('chatbot2.submit'),
        action: `submit:${submitEndpoint}`
      },
      {
        type: 'button',
        id: 'clear',
        label: t('chatbot2.clear'),
        action: 'clear'
      }
    );

    // 创建机器人消息
    const botMessage: Message = {
      id: botMessageId,
      type: 'bot',
      content: t('chatbot2.fillParams'),
      timestamp: Date.now(),
      formElements: formElements as any
    };

    // 添加到消息列表
    setMessages(prev => [...prev, botMessage]);
  };

  // 测试生成表单的函数
  const testGenerateForm = async () => {

    try {
      const res1 = await request.get(
        'http://localhost:5003/get_param',
        '',
        {
          params: {
            id: 1,
            type: 'flow'
          }
        }
      )
      generateFormFromParams(res1.data.params, '');
    } catch (error) {
      console.error('获取参数失败:', error);
    }
    // const paramsJson = {
    //   "params": [
    //     {
    //       "api_param_name": "UserNo",
    //       "param_type": "text"
    //     },
    //     {
    //       "api_param_name": "FK_Flow",
    //       "param_type": "text"
    //     },
    //     {
    //       "api_param_name": "ser",
    //       "param_type": "text"
    //     },
    //     {
    //       "api_param_name": "MainTblName",
    //       "param_type": "text"
    //     }
    //   ]
    // };


  };

  // 添加示例表单到消息
  const addExampleForm = () => {
    const botMessageId = `bot-${Date.now()}`;
    const botMessage: Message = {
      id: botMessageId,
      type: 'bot',
      content: t('chatbot2.fillParams'),
      timestamp: Date.now(),
      formElements: [
        {
          type: 'text',
          id: 'name',
          label: t('chatbot2.applicationType'),
          placeholder: t('chatbot2.pleaseEnterApplicationType')
        },
        {
          type: 'text',
          id: 'email',
          label: t('chatbot2.email'),
          placeholder: t('chatbot2.pleaseEnterEmail')
        },
        {
          type: 'select',
          id: 'department',
          label: t('chatbot2.department'),
          options: [
            { label: t('chatbot2.selectDepartment'), value: '' },
            { label: t('chatbot2.techDepartment'), value: 'tech' },
            { label: t('chatbot2.marketingDepartment'), value: 'marketing' },
            { label: t('chatbot2.hrDepartment'), value: 'hr' }
          ]
        },
        {
          type: 'button',
          id: 'submit',
          label: t('chatbot2.submit'),
          action: 'submit:/v1/form-submit'
        },
        {
          type: 'button',
          id: 'clear',
          label: t('chatbot2.clear'),
          action: 'clear'
        }
      ]
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    try {
      const userName = getUserName();
      const token = API_TOKEN as string; // 从配置文件获取 token
      const url = `/v1/conversations/${sessionId}`;

      request.put(url, token, { name: newTitle, user: userName });

      // 更新会话标题
      setSessions(prev => prev.map(session => session.id === sessionId ? { ...session, title: newTitle } : session));
      message.success(t('chatbot2.renameSuccess'));
    } catch (error) {
      message.error(t('chatbot2.renameFailed'));
      console.error('Error renaming conversation:', error);
    }
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
            {t('chatbot2.newChat')}
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
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'rename',
                      icon: <EditOutlined />,
                      onClick: (e) => {
                        e.domEvent.stopPropagation();
                        const newTitle = prompt(t('chatbot2.enterNewTitle') || 'Enter new title');
                        if (newTitle) {
                          handleRenameSession(session.id, newTitle);
                        }
                      }
                    },
                    {
                      key: 'delete',
                      icon: <DeleteOutlined />,
                      onClick: (e) => {
                        e.domEvent.stopPropagation();
                        // 显示确认对话框
                        confirm({
                          title: t('chatbot2.deleteConfirm'),
                          icon: <ExclamationCircleOutlined />,
                          content: t('chatbot2.deleteConfirmContent'),
                          okText: t('chatbot2.confirm'),
                          cancelText: t('chatbot2.cancel'),
                          onOk: async () => {
                            try {
                              const userName = getUserName();
                              const token = API_TOKEN as string; // 从配置文件获取 token
                              // 使用 DELETE 请求，并在请求体中传递 user 参数
                              if (session.id !== 'empty') {
                                await request.delete(
                                  `/v1/conversations/${session.id}`,
                                  token,
                                  { user: userName }
                                );
                              }
                              // 从列表中移除
                              setSessions(prev => prev.filter(s => s.id !== session.id));

                              // 如果删除的是当前选中的会话，清空选择
                              if (selectedSession === session.id) {
                                setSelectedSession(null);
                                setMessages([]);
                              }

                              message.success(t('chatbot2.deleteSuccess'));
                            } catch (error) {
                              message.error(t('chatbot2.deleteFailed'));
                              console.error('Error deleting conversation:', error);
                            }
                          }
                        });
                      }
                    }
                  ]
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  className={styles.moreButton}
                  onClick={(e) => e.stopPropagation()}
                />
              </Dropdown>
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
                  <div className={styles.loadingMessages}>{t('chatbot2.loadingMessages')}</div>
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
                            {t('chatbot2.user')}
                          </Avatar>
                          <div className={styles.messageContent}>
                            <div className={styles.messageText}>{msg.content}</div>
                            {msg.fileInfo && (
                              <div className={styles.fileInfo}>
                                <div className={styles.fileName}>{t('chatbot2.fileName')} {msg.fileInfo.fileName}</div>
                                <div className={styles.fileId}>{t('chatbot2.fileId')} {msg.fileInfo.fileId}</div>
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
                            {t('chatbot2.ai')}
                          </Avatar>
                          <div className={styles.messageContent}>
                            <div className={styles.messageText}>
                              {msg.content}
                              {msg.isStreaming && <span className={styles.cursorBlink}>|</span>}
                              {msg.formElements && msg.formElements.length > 0 && (
                                <div className={styles.formElements}>
                                  {/* 渲染非按钮类型的表单元素 */}
                                  {msg.formElements
                                    .filter(element => element.type !== 'button')
                                    .map((element) => (
                                      <div key={element.id} className={styles.formElement}>
                                        {element.type === 'text' && (
                                          <div className={styles.inputElement}>
                                            <label>{element.label}</label>
                                            <Input
                                              placeholder={element.placeholder || ''}
                                              value={element.value || ''}
                                              onChange={(e) => handleFormElementChange(element.id, e.target.value)}
                                              style={{ width: '100%' }}
                                            />
                                          </div>
                                        )}
                                        {element.type === 'select' && (
                                          <div className={styles.selectElement}>
                                            <label>{element.label}</label>
                                            <select
                                              value={element.value || ''}
                                              onChange={(e) => handleFormElementChange(element.id, e.target.value)}
                                            >
                                              {element.options?.map(option => (
                                                <option key={option.value} value={option.value}>
                                                  {option.label}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                        )}
                                      </div>
                                    ))}

                                  {/* 将按钮分组到底部 */}
                                  <div className={styles.formButtonGroup}>
                                    {msg.formElements
                                      .filter(element => element.type === 'button')
                                      .map(element => (
                                        <Button
                                          key={element.id}
                                          onClick={() => handleFormElementAction(element.id, element.action || '')}
                                          type={element.id === 'submit' ? 'primary' : undefined}
                                        >
                                          {element.label}
                                        </Button>
                                      ))
                                    }
                                  </div>
                                </div>
                              )}
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
                    <Empty description={t('chatbot2.noMessages')} />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className={styles.inputArea}>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputActions}>
                    {/* 
                    <Upload
                      showUploadList={false}
                      beforeUpload={async (file) => {
                        try {
                          // 显示上传中提示
                          const uploadingKey = `uploading-${Date.now()}`;
                          message.loading({ content: `${t('chatbot2.uploadingFile')} ${file.name}...`, key: uploadingKey });

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
                                content: `${t('chatbot2.uploadingFile')} ${file.name}... ${percent}%`,
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
                            content: `${file.name} ${t('chatbot2.uploadSuccess')} ${data.id}`,
                            key: uploadingKey
                          });
                        } catch (error) {
                          console.error(t('chatbot2.uploadFailed'), error);
                          message.error(`${t('chatbot2.uploadFailed')} ${error.message}`);
                        }

                        // 阻止默认上传行为
                        return false;
                      }}
                    >
                      <Button
                        icon={<PaperClipOutlined />}
                        type="text"
                        title={t('chatbot2.uploadFile')}
                        disabled={!!uploadedFile}
                      />
                    </Upload>
                    {uploadedFile && (
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        title={t('chatbot2.cancelUpload')}
                        onClick={() => setUploadedFile(null)}
                      />
                    )}
                    */}
                  </div>
                  {uploadedFile ? (
                    <div className={styles.fileInfoInput}>
                      <div className={styles.fileName}>{t('chatbot2.fileName')} {uploadedFile.fileName}</div>
                      <div className={styles.fileId}>{t('chatbot2.fileId')} {uploadedFile.fileId}</div>
                    </div>
                  ) : (
                    <Input.TextArea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={t('chatbot2.inputMessage')}
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
                      {t('chatbot2.send')}
                    </Button>
                    <Button
                      onClick={testGenerateForm}
                      style={{ marginLeft: '8px' }}
                      disabled={isStreaming}
                    >
                      {t('chatbot2.testJsonForm')}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.messageList}>
                <div className={styles.emptyMessages}>
                  <Empty description={t('chatbot2.newChat')} />
                </div>
                <div ref={messagesEndRef} />
              </div>
              <div className={styles.inputArea}>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputActions}>
                    {/* 
                    <Upload
                      showUploadList={false}
                      beforeUpload={async (file) => {
                        try {
                          // 显示上传中提示
                          const uploadingKey = `uploading-${Date.now()}`;
                          message.loading({ content: `${t('chatbot2.uploadingFile')} ${file.name}...`, key: uploadingKey });

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
                                content: `${t('chatbot2.uploadingFile')} ${file.name}... ${percent}%`,
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
                            content: `${file.name} ${t('chatbot2.uploadSuccess')} ${data.id}`,
                            key: uploadingKey
                          });
                        } catch (error) {
                          console.error(t('chatbot2.uploadFailed'), error);
                          message.error(`${t('chatbot2.uploadFailed')} ${error.message}`);
                        }

                        // 阻止默认上传行为
                        return false;
                      }}
                    >
                      <Button
                        icon={<PaperClipOutlined />}
                        type="text"
                        title={t('chatbot2.uploadFile')}
                        disabled={!!uploadedFile}
                      />
                    </Upload>
                    {uploadedFile && (
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        title={t('chatbot2.cancelUpload')}
                        onClick={() => setUploadedFile(null)}
                      />
                    )}
                    */}
                  </div>
                    <Input.TextArea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={t('chatbot2.inputMessageForNewChat')}
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  <div className={styles.sendButton}>
                    <Button
                      type="primary"
                      onClick={handleSendMessage}
                      loading={isStreaming}
                      disabled={isStreaming}
                      icon={<SendOutlined />}
                    >
                      {t('chatbot2.send')}
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

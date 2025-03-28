// Simple i18n implementation without external dependencies

export type Language = 'zh' | 'en' | 'ja';

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Translation keys
const translations: Translations = {
  zh: {
    // Header
    'admin.system': '管理系统',
    'admin.logout': '注销',
    'admin.language': '语言',
    'admin.home': '主页',
    
    // Main page
    'main.title': 'AI 智能助手',
    'main.description': '欢迎使用我们的 AI 智能助手系统。这是一个强大的人工智能对话系统，可以帮助您解答问题、提供建议和完成各种任务。您可以选择直接开始对话，或者进入管理后台配置系统参数和知识库。',
    'main.startChat': '开始对话',
    'main.systemManage': '系统管理',
    
    // Sidebar
    'sidebar.knowledge': '知识点管理',
    'sidebar.users': '用户管理',
    'sidebar.llmSettings': 'LLM设置',
    
    // LLM Settings
    'llm.title': 'LLM模型设置',
    'llm.provider': 'LLM提供商',
    'llm.apiKey': 'API密钥',
    'llm.save': '保存设置',
    'llm.selectProvider': '请选择LLM提供商',
    'llm.enterApiKey': '请输入API密钥',
    'llm.saveSuccess': '保存成功',
    'llm.saveFailed': '保存失败',
    'llm.fetchProvidersFailed': '获取LLM提供商列表失败',
    'llm.fieldRequired': '此字段为必填项',
    
    // Knowledge page
    'knowledge.title': '知识点管理',
    'knowledge.upload': '上传文件',
    'knowledge.cancel': '取消',
    'knowledge.save': '保存',
    'knowledge.uploadText': '点击或拖拽文件到此区域上传',
    'knowledge.uploadHint': '支持单个或批量上传，严禁上传公司内部资料及其他违禁文件',
    'knowledge.uploadSuccess': '文件上传成功',
    'knowledge.uploadFailed': '文件上传失败',
    'knowledge.saveSuccess': '上传成功',
    'knowledge.saveFailed': '上传失败',
    'knowledge.pleaseUpload': '请先上传文件',
    'knowledge.fetchFailed': '获取知识点列表失败',
    'knowledge.id': 'ID',
    'knowledge.knowledgeTitle': '标题',
    'knowledge.llm': 'LLM',
    'knowledge.llmModel': 'LLM-Model',
    'knowledge.createTime': '创建时间',
    'knowledge.total': '共 {total} 条',
    
    // Users page
    'users.title': '用户管理',
    'users.addUser': '添加用户',
    'users.userId': '用户ID',
    'users.username': '用户名',
    'users.avatar': '头像',
    'users.email': '邮箱',
    'users.password': '密码',
    'users.createTime': '创建时间',
    'users.updateTime': '更新时间',
    'users.actions': '操作',
    'users.edit': '编辑',
    'users.delete': '删除',
    'users.confirmCreate': '确认创建用户',
    'users.confirmCreateContent': '确定要创建这个用户吗？',
    'users.createSuccess': '用户创建成功',
    'users.createFailed': '创建用户失败',
    'users.formValidationFailed': '表单验证失败',
    'users.confirmEdit': '确认修改用户',
    'users.confirmEditContent': '确定要保存这些修改吗？',
    'users.editSuccess': '用户修改成功',
    'users.editFailed': '修改用户失败',
    'users.confirmDelete': '确认删除用户',
    'users.confirmDeleteContent': '确定要删除这个用户吗？此操作不可撤销！',
    'users.deleteSuccess': '用户删除成功',
    'users.deleteFailed': '删除用户失败',
    'users.fetchFailed': '获取用户列表失败',
    'users.invalidResponse': '获取用户列表失败：数据格式错误',
    'users.inputUsername': '请输入用户名',
    'users.inputEmail': '请输入邮箱',
    'users.inputPassword': '请输入密码',
    'users.inputAvatar': '请输入头像URL',
    'users.optional': '(可选)',
    
    // Chatbot2 page
    'chatbot2.newChat': '新建对话',
    'chatbot2.deleteConfirm': '确认删除',
    'chatbot2.deleteConfirmContent': '确定要删除这个会话吗？此操作不可恢复。',
    'chatbot2.rename': '重命名',
    'chatbot2.renameSuccess': '重命名成功',
    'chatbot2.delete': '删除',
    'chatbot2.confirm': '确认',
    'chatbot2.cancel': '取消',
    'chatbot2.deleteSuccess': '删除成功',
    'chatbot2.deleteFailed': '删除失败',
    'chatbot2.loadingMessages': '加载消息中...',
    'chatbot2.noMessages': '暂无消息',
    'chatbot2.user': '用户',
    'chatbot2.ai': 'AI',
    'chatbot2.fileName': '文件名:',
    'chatbot2.fileId': '文件ID:',
    'chatbot2.uploadingFile': '正在上传文件:',
    'chatbot2.uploadSuccess': '上传成功，文件ID:',
    'chatbot2.uploadFailed': '文件上传失败:',
    'chatbot2.uploadFile': '上传文件',
    'chatbot2.cancelUpload': '取消上传',
    'chatbot2.inputMessage': '输入消息...',
    'chatbot2.inputMessageForNewChat': '输入消息开始新对话...',
    'chatbot2.send': '发送',
    'chatbot2.testJsonForm': '测试JSON表单',
    'chatbot2.fillParams': '请填写以下参数:',
    'chatbot2.submit': '提交',
    'chatbot2.clear': '清除',
    'chatbot2.processingFormData': '处理表单数据中...',
    'chatbot2.sunday': '周日',
    'chatbot2.monday': '周一',
    'chatbot2.tuesday': '周二',
    'chatbot2.wednesday': '周三',
    'chatbot2.thursday': '周四',
    'chatbot2.friday': '周五',
    'chatbot2.saturday': '周六',
    'chatbot2.month': '月',
    'chatbot2.day': '日',
    'chatbot2.pleaseEnter': '请输入',
    'chatbot2.processing': '正在思考...',
    'chatbot2.getReplyFailed': '获取回复失败，请重试',
    'chatbot2.sendMessageFailed': '发送消息失败',
    'chatbot2.fetchConversationsFailed': '获取会话列表失败',
    'chatbot2.fetchMessagesFailed': '获取消息失败',
    'chatbot2.newConversation': '新对话',
    'chatbot2.applicationType': '申请类型',
    'chatbot2.pleaseEnterApplicationType': '请输入申请类型',
    'chatbot2.email': '邮箱',
    'chatbot2.pleaseEnterEmail': '请输入您的邮箱',
    'chatbot2.department': '部门',
    'chatbot2.selectDepartment': '请选择部门',
    'chatbot2.techDepartment': '技术部',
    'chatbot2.marketingDepartment': '市场部',
    'chatbot2.hrDepartment': '人力资源',
  },
  en: {
    // Header
    'admin.system': 'Admin System',
    'admin.logout': 'Logout',
    'admin.language': 'Language',
    'admin.home': 'Home',
    
    // Main page
    'main.title': 'AI Assistant',
    'main.description': 'Welcome to our AI Assistant system. This is a powerful artificial intelligence dialogue system that can help you answer questions, provide suggestions, and complete various tasks. You can choose to start a conversation directly or enter the admin backend to configure system parameters and knowledge base.',
    'main.startChat': 'Start Chat',
    'main.systemManage': 'System Management',
    
    // Sidebar
    'sidebar.knowledge': 'Knowledge Management',
    'sidebar.users': 'User Management',
    'sidebar.llmSettings': 'LLM Settings',
    
    // LLM Settings
    'llm.title': 'LLM Model Settings',
    'llm.provider': 'LLM Provider',
    'llm.apiKey': 'API Key',
    'llm.save': 'Save Settings',
    'llm.selectProvider': 'Please select LLM provider',
    'llm.enterApiKey': 'Please enter API key',
    'llm.saveSuccess': 'Saved successfully',
    'llm.saveFailed': 'Save failed',
    'llm.fetchProvidersFailed': 'Failed to fetch LLM providers',
    'llm.fieldRequired': 'This field is required',
    
    // Knowledge page
    'knowledge.title': 'Knowledge Management',
    'knowledge.upload': 'Upload File',
    'knowledge.cancel': 'Cancel',
    'knowledge.save': 'Save',
    'knowledge.uploadText': 'Click or drag files to this area to upload',
    'knowledge.uploadHint': 'Support single or batch upload, it is strictly forbidden to upload company internal materials and other prohibited files',
    'knowledge.uploadSuccess': 'File uploaded successfully',
    'knowledge.uploadFailed': 'File upload failed',
    'knowledge.saveSuccess': 'Upload successful',
    'knowledge.saveFailed': 'Upload failed',
    'knowledge.pleaseUpload': 'Please upload a file first',
    'knowledge.fetchFailed': 'Failed to get knowledge list',
    'knowledge.id': 'ID',
    'knowledge.knowledgeTitle': 'Title',
    'knowledge.llm': 'LLM',
    'knowledge.llmModel': 'LLM-Model',
    'knowledge.createTime': 'Create Time',
    'knowledge.total': 'Total {total} items',
    
    // Users page
    'users.title': 'User Management',
    'users.addUser': 'Add User',
    'users.userId': 'User ID',
    'users.username': 'Username',
    'users.avatar': 'Avatar',
    'users.email': 'Email',
    'users.password': 'Password',
    'users.createTime': 'Create Time',
    'users.updateTime': 'Update Time',
    'users.actions': 'Actions',
    'users.edit': 'Edit',
    'users.delete': 'Delete',
    'users.confirmCreate': 'Confirm Create User',
    'users.confirmCreateContent': 'Are you sure you want to create this user?',
    'users.createSuccess': 'User created successfully',
    'users.createFailed': 'Failed to create user',
    'users.formValidationFailed': 'Form validation failed',
    'users.confirmEdit': 'Confirm Edit User',
    'users.confirmEditContent': 'Are you sure you want to save these changes?',
    'users.editSuccess': 'User modified successfully',
    'users.editFailed': 'Failed to modify user',
    'users.confirmDelete': 'Confirm Delete User',
    'users.confirmDeleteContent': 'Are you sure you want to delete this user? This action cannot be undone!',
    'users.deleteSuccess': 'User deleted successfully',
    'users.deleteFailed': 'Failed to delete user',
    'users.fetchFailed': 'Failed to get user list',
    'users.invalidResponse': 'Failed to get user list: Invalid data format',
    'users.inputUsername': 'Please enter username',
    'users.inputEmail': 'Please enter email',
    'users.inputPassword': 'Please enter password',
    'users.inputAvatar': 'Please enter avatar URL',
    'users.optional': '(Optional)',
    
    // Chatbot2 page
    'chatbot2.newChat': 'New Chat',
    'chatbot2.deleteConfirm': 'Confirm Delete',
    'chatbot2.deleteConfirmContent': 'Are you sure you want to delete this conversation? This action cannot be undone.',
    'chatbot2.rename': 'Rename',
    'chatbot2.renameSuccess': 'Renamed successfully',
    'chatbot2.delete': 'Delete',
    'chatbot2.confirm': 'Confirm',
    'chatbot2.cancel': 'Cancel',
    'chatbot2.deleteSuccess': 'Deleted successfully',
    'chatbot2.deleteFailed': 'Delete failed',
    'chatbot2.loadingMessages': 'Loading messages...',
    'chatbot2.noMessages': 'No messages',
    'chatbot2.user': 'User',
    'chatbot2.ai': 'AI',
    'chatbot2.fileName': 'File name:',
    'chatbot2.fileId': 'File ID:',
    'chatbot2.uploadingFile': 'Uploading file:',
    'chatbot2.uploadSuccess': 'Upload successful, File ID:',
    'chatbot2.uploadFailed': 'File upload failed:',
    'chatbot2.uploadFile': 'Upload File',
    'chatbot2.cancelUpload': 'Cancel Upload',
    'chatbot2.inputMessage': 'Enter message...',
    'chatbot2.inputMessageForNewChat': 'Enter message to start a new conversation...',
    'chatbot2.send': 'Send',
    'chatbot2.testJsonForm': 'Test JSON Form',
    'chatbot2.fillParams': 'Please fill in the following parameters:',
    'chatbot2.submit': 'Submit',
    'chatbot2.clear': 'Clear',
    'chatbot2.processingFormData': 'Processing form data...',
    'chatbot2.sunday': 'Sunday',
    'chatbot2.monday': 'Monday',
    'chatbot2.tuesday': 'Tuesday',
    'chatbot2.wednesday': 'Wednesday',
    'chatbot2.thursday': 'Thursday',
    'chatbot2.friday': 'Friday',
    'chatbot2.saturday': 'Saturday',
    'chatbot2.month': '/',
    'chatbot2.day': '',
    'chatbot2.pleaseEnter': 'Please enter ',
    'chatbot2.processing': 'Thinking...',
    'chatbot2.getReplyFailed': 'Failed to get reply, please try again',
    'chatbot2.sendMessageFailed': 'Failed to send message',
    'chatbot2.fetchConversationsFailed': 'Failed to fetch conversations',
    'chatbot2.fetchMessagesFailed': 'Failed to fetch messages',
    'chatbot2.newConversation': 'New conversation',
    'chatbot2.applicationType': 'Application Type',
    'chatbot2.pleaseEnterApplicationType': 'Please enter application type',
    'chatbot2.email': 'Email',
    'chatbot2.pleaseEnterEmail': 'Please enter your email',
    'chatbot2.department': 'Department',
    'chatbot2.selectDepartment': 'Please select department',
    'chatbot2.techDepartment': 'Technology',
    'chatbot2.marketingDepartment': 'Marketing',
    'chatbot2.hrDepartment': 'Human Resources',
  },
  ja: {
    // Header
    'admin.system': '管理システム',
    'admin.logout': 'ログアウト',
    'admin.language': '言語',
    'admin.home': 'ホーム',
    
    // Main page
    'main.title': 'AIアシスタント',
    'main.description': '私たちのAIアシスタントシステムへようこそ。これは、質問に答え、提案を提供し、さまざまなタスクを完了するのに役立つ強力な人工知能対話システムです。会話を直接開始するか、管理バックエンドに入ってシステムパラメータとナレッジベースを設定することができます。',
    'main.startChat': '会話を開始',
    'main.systemManage': 'システム管理',
    
    // Sidebar
    'sidebar.knowledge': 'ナレッジ管理',
    'sidebar.users': 'ユーザー管理',
    'sidebar.llmSettings': 'LLM設定',
    
    // LLM Settings
    'llm.title': 'LLMモデル設定',
    'llm.provider': 'LLMプロバイダー',
    'llm.apiKey': 'APIキー',
    'llm.save': '設定を保存',
    'llm.selectProvider': 'LLMプロバイダーを選択してください',
    'llm.enterApiKey': 'APIキーを入力してください',
    'llm.saveSuccess': '保存に成功しました',
    'llm.saveFailed': '保存に失敗しました',
    'llm.fetchProvidersFailed': 'LLMプロバイダーの取得に失敗しました',
    'llm.fieldRequired': 'この項目は必須です',
    
    // Knowledge page
    'knowledge.title': 'ナレッジ管理',
    'knowledge.upload': 'ファイルをアップロード',
    'knowledge.cancel': 'キャンセル',
    'knowledge.save': '保存',
    'knowledge.uploadText': 'クリックまたはファイルをこの領域にドラッグしてアップロード',
    'knowledge.uploadHint': '単一またはバッチアップロードをサポートし、会社の内部資料やその他の禁止ファイルのアップロードは厳禁です',
    'knowledge.uploadSuccess': 'ファイルのアップロードに成功しました',
    'knowledge.uploadFailed': 'ファイルのアップロードに失敗しました',
    'knowledge.saveSuccess': 'アップロードに成功しました',
    'knowledge.saveFailed': 'アップロードに失敗しました',
    'knowledge.pleaseUpload': '最初にファイルをアップロードしてください',
    'knowledge.fetchFailed': 'ナレッジリストの取得に失敗しました',
    'knowledge.id': 'ID',
    'knowledge.knowledgeTitle': 'タイトル',
    'knowledge.llm': 'LLM',
    'knowledge.llmModel': 'LLMモデル',
    'knowledge.createTime': '作成時間',
    'knowledge.total': '合計 {total} 件',
    
    // Users page
    'users.title': 'ユーザー管理',
    'users.addUser': 'ユーザーを追加',
    'users.userId': 'ユーザーID',
    'users.username': 'ユーザー名',
    'users.avatar': 'アバター',
    'users.email': 'メールアドレス',
    'users.password': 'パスワード',
    'users.createTime': '作成時間',
    'users.updateTime': '更新時間',
    'users.actions': '操作',
    'users.edit': '編集',
    'users.delete': '削除',
    'users.confirmCreate': 'ユーザー作成の確認',
    'users.confirmCreateContent': 'このユーザーを作成してもよろしいですか？',
    'users.createSuccess': 'ユーザーが正常に作成されました',
    'users.createFailed': 'ユーザーの作成に失敗しました',
    'users.formValidationFailed': 'フォームの検証に失敗しました',
    'users.confirmEdit': 'ユーザー編集の確認',
    'users.confirmEditContent': 'これらの変更を保存してもよろしいですか？',
    'users.editSuccess': 'ユーザーが正常に変更されました',
    'users.editFailed': 'ユーザーの変更に失敗しました',
    'users.confirmDelete': 'ユーザー削除の確認',
    'users.confirmDeleteContent': 'このユーザーを削除してもよろしいですか？この操作は元に戻せません！',
    'users.deleteSuccess': 'ユーザーが正常に削除されました',
    'users.deleteFailed': 'ユーザーの削除に失敗しました',
    'users.fetchFailed': 'ユーザーリストの取得に失敗しました',
    'users.invalidResponse': 'ユーザーリストの取得に失敗しました：データ形式が無効です',
    'users.inputUsername': 'ユーザー名を入力してください',
    'users.inputEmail': 'メールアドレスを入力してください',
    'users.inputPassword': 'パスワードを入力してください',
    'users.inputAvatar': 'アバターURLを入力してください',
    'users.optional': '(オプション)',
    
    // Chatbot2 page
    'chatbot2.newChat': '新しい対話',
    'chatbot2.deleteConfirm': '削除の確認',
    'chatbot2.deleteConfirmContent': 'この会話を削除してもよろしいですか？この操作は元に戻せません。',
    'chatbot2.rename': '名前を変更',
    'chatbot2.renameSuccess': '名前の変更に成功しました',
    'chatbot2.delete': '削除',
    'chatbot2.confirm': '確認',
    'chatbot2.cancel': 'キャンセル',
    'chatbot2.deleteSuccess': '削除に成功しました',
    'chatbot2.deleteFailed': '削除に失敗しました',
    'chatbot2.loadingMessages': 'メッセージを読み込み中...',
    'chatbot2.noMessages': 'メッセージがありません',
    'chatbot2.user': 'ユーザー',
    'chatbot2.ai': 'AI',
    'chatbot2.fileName': 'ファイル名:',
    'chatbot2.fileId': 'ファイルID:',
    'chatbot2.uploadingFile': 'ファイルをアップロード中:',
    'chatbot2.uploadSuccess': 'アップロード成功、ファイルID:',
    'chatbot2.uploadFailed': 'ファイルのアップロードに失敗しました:',
    'chatbot2.uploadFile': 'ファイルをアップロード',
    'chatbot2.cancelUpload': 'アップロードをキャンセル',
    'chatbot2.inputMessage': 'メッセージを入力...',
    'chatbot2.inputMessageForNewChat': '新しい対話を始めるメッセージを入力...',
    'chatbot2.send': '送信',
    'chatbot2.testJsonForm': 'JSONフォームをテスト',
    'chatbot2.fillParams': '以下のパラメータを入力してください:',
    'chatbot2.submit': '提出',
    'chatbot2.clear': 'クリア',
    'chatbot2.processingFormData': 'フォームデータを処理中...',
    'chatbot2.sunday': '日曜日',
    'chatbot2.monday': '月曜日',
    'chatbot2.tuesday': '火曜日',
    'chatbot2.wednesday': '水曜日',
    'chatbot2.thursday': '木曜日',
    'chatbot2.friday': '金曜日',
    'chatbot2.saturday': '土曜日',
    'chatbot2.month': '月',
    'chatbot2.day': '日',
    'chatbot2.pleaseEnter': '入力してください：',
    'chatbot2.processing': '考え中...',
    'chatbot2.getReplyFailed': '返信の取得に失敗しました。もう一度お試しください',
    'chatbot2.sendMessageFailed': 'メッセージの送信に失敗しました',
    'chatbot2.fetchConversationsFailed': '会話リストの取得に失敗しました',
    'chatbot2.fetchMessagesFailed': 'メッセージの取得に失敗しました',
    'chatbot2.newConversation': '新しい会話',
    'chatbot2.applicationType': '申請タイプ',
    'chatbot2.pleaseEnterApplicationType': '申請タイプを入力してください',
    'chatbot2.email': 'メールアドレス',
    'chatbot2.pleaseEnterEmail': 'メールアドレスを入力してください',
    'chatbot2.department': '部署',
    'chatbot2.selectDepartment': '部署を選択してください',
    'chatbot2.techDepartment': '技術部',
    'chatbot2.marketingDepartment': 'マーケティング部',
    'chatbot2.hrDepartment': '人事部',
  },
};

// Create a context for i18n
export class I18nService {
  private static instance: I18nService;
  private currentLanguage: Language = 'zh';
  private listeners: Array<(lang: Language) => void> = [];
  
  private constructor() {
    // Initialize with browser language if possible
    const browserLang = navigator.language.split('-')[0] as Language;
    if (browserLang === 'en' || browserLang === 'zh' || browserLang === 'ja') {
      this.currentLanguage = browserLang;
    }
    
    // Try to load from localStorage
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang === 'en' || savedLang === 'zh' || savedLang === 'ja') {
      this.currentLanguage = savedLang;
    }
  }
  
  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }
  
  public getLanguage(): Language {
    return this.currentLanguage;
  }
  
  public setLanguage(lang: Language): void {
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
    this.notifyListeners();
  }
  
  public translate(key: string, params?: Record<string, any>): string {
    let text = translations[this.currentLanguage]?.[key] || key;
    
    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, String(value));
      });
    }
    
    return text;
  }
  
  public addListener(listener: (lang: Language) => void): void {
    this.listeners.push(listener);
  }
  
  public removeListener(listener: (lang: Language) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }
}

// Helper function to get translation
export function t(key: string, params?: Record<string, any>): string {
  return I18nService.getInstance().translate(key, params);
}

// Hook for functional components
export function useTranslation() {
  const [, setUpdate] = useState(0);
  
  useEffect(() => {
    const handleLanguageChange = () => {
      setUpdate(prev => prev + 1);
    };
    
    I18nService.getInstance().addListener(handleLanguageChange);
    
    return () => {
      I18nService.getInstance().removeListener(handleLanguageChange);
    };
  }, []);
  
  return { 
    t, 
    i18n: I18nService.getInstance(),
    language: I18nService.getInstance().getLanguage()
  };
}

// Import React hooks
import { useState, useEffect } from 'react';

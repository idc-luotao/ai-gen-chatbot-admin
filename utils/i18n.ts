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
    
    // Knowledge page
    'knowledge.upload': '上传文件',
    'knowledge.cancel': '取消',
    'knowledge.save': '保存',
    'knowledge.uploadText': '点击或拖拽文件到此区域上传',
    'knowledge.uploadHint': '支持单个或批量上传，严禁上传公司内部资料及其他违禁文件',
  },
  en: {
    // Header
    'admin.system': 'Admin System',
    'admin.logout': 'Logout',
    'admin.language': 'Language',
    
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
    
    // Knowledge page
    'knowledge.upload': 'Upload File',
    'knowledge.cancel': 'Cancel',
    'knowledge.save': 'Save',
    'knowledge.uploadText': 'Click or drag files to this area to upload',
    'knowledge.uploadHint': 'Support single or batch upload, it is strictly forbidden to upload company internal materials and other prohibited files',
  },
  ja: {
    // Header
    'admin.system': '管理システム',
    'admin.logout': 'ログアウト',
    'admin.language': '言語',
    
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
    
    // Knowledge page
    'knowledge.upload': 'ファイルをアップロード',
    'knowledge.cancel': 'キャンセル',
    'knowledge.save': '保存',
    'knowledge.uploadText': 'クリックまたはファイルをこの領域にドラッグしてアップロード',
    'knowledge.uploadHint': '単一またはバッチアップロードをサポートしています。会社の内部資料やその他の禁止ファイルのアップロードは厳禁です',
  }
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
  
  public translate(key: string): string {
    return translations[this.currentLanguage]?.[key] || key;
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
export function t(key: string): string {
  return I18nService.getInstance().translate(key);
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
  
  return { t, i18n: I18nService.getInstance() };
}

// Import React hooks
import { useState, useEffect } from 'react';

import axios, { AxiosRequestConfig } from 'axios';

// 创建 axios 实例
const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 请求方法
interface RequestMethods {
  get: (url: string, token: string, config?: AxiosRequestConfig) => Promise<any>;
  post: (url: string, token: string, data?: any, config?: AxiosRequestConfig) => Promise<any>;
  put: (url: string, token: string, data?: any, config?: AxiosRequestConfig) => Promise<any>;
  delete: (url: string, token: string, data?: any, config?: AxiosRequestConfig) => Promise<any>;
  stream: (
    url: string, 
    token: string, 
    data: any, 
    onChunk: (chunk: any) => void, 
    onComplete?: () => void,
    onError?: (error: any) => void,
    onStart?: () => void
  ) => Promise<void>;
  uploadFile: (
    url: string,
    token: string,
    file: File,
    user: string,
    onProgress?: (percent: number) => void
  ) => Promise<any>;
}

const request: RequestMethods = {
  get: (url, token, config = {}) => {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
    return http.get(url, config)
  },
  post: (url, token, data = {}, config = {}) => {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
    return http.post(url, data, config)
  },
  put: (url, token, data = {}, config = {}) => {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
    return http.put(url, data, config)
  },
  delete: (url, token, data = {}, config = {}) => {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
    return http.delete(url, { data, ...config })
  },
  uploadFile: async (url, token, file, user, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user', user);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
        onProgress(percentCompleted);
      };
    }

    return http.post(url, formData, config);
  },
  stream: async (url, token, data, onChunk, onComplete, onError, onStart) => {
    try {
      console.log('开始流式请求:', url);
      console.log('请求数据:', data);
      
      // // 调用开始回调
      // if (onStart) {
      //   onStart();
      // }
      
      // // 使用axios进行流式请求
      // const response = await axios({
      //   method: 'post',
      //   url: `${http.defaults.baseURL}${url}`,
      //   data: data,
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   responseType: 'stream',
      //   onDownloadProgress: (progressEvent) => {
      //     // 这个回调在浏览器环境中不会提供原始数据
      //     console.log('下载进度:', progressEvent);
      //   }
      // });
      
      // 由于axios在浏览器环境中不能直接处理流式数据
      // 我们需要使用fetch API来实现流式处理
      const fetchResponse = await fetch(`${http.defaults.baseURL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!fetchResponse.ok) {
        throw new Error(`HTTP error! status: ${fetchResponse.status}`);
      }

      if (!fetchResponse.body) {
        throw new Error('Response body is null');
      }
      
      // 服务端响应已到达，准备开始读取流
      if (onStart) {
        onStart();
      }

      const reader = fetchResponse.body.getReader();
      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { value, done } = await reader.read();
          
          if (done) {
            console.log('读取完成');
            break;
          }
          
          // 解码新接收的数据
          const chunk = decoder.decode(value, { stream: true });
          // console.log('接收到新数据:', chunk);
          
          // 处理数据块
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              
              if (data === '[DONE]') {
                console.log('收到[DONE]标记');
                continue;
              }
              
              try {
                const jsonData = JSON.parse(data);
                console.log('解析JSON数据:', jsonData);
                onChunk(jsonData);
              } catch (e) {
                console.error('解析JSON错误:', e, '原始行:', line);
              }
            } else {
              try {
                const jsonData = JSON.parse(line);
                console.log('解析JSON数据:', jsonData);
                onChunk(jsonData);
              } catch (e) {
                console.error('解析JSON错误:', e, '原始行:', line);
              }
            }
          }
        }
      } catch (error) {
        console.error('读取流时出错:', error);
        if (onError) onError(error);
      } finally {
        // 流式传输完成
        console.log('流式传输完成');
        if (onComplete) onComplete();
      }
    } catch (error) {
      console.error('流式请求错误:', error);
      if (onError) onError(error);
      throw error;
    }
  }
};

export { request };

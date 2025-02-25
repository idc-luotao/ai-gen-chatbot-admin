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
  delete: (url: string, token: string, config?: AxiosRequestConfig) => Promise<any>;
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
  delete: (url, token, config = {}) => {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
    return http.delete(url, config)
  },
};

export { request };

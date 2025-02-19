import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getToken, getRefreshToken, setToken, setRefreshToken, removeTokens, isTokenExpired } from './storage';
import { AuthResponse } from '../types/auth';

// 创建 axios 实例
const http: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 是否正在刷新token
let isRefreshing: boolean = false;
// 等待token刷新的请求队列
let requests: Array<(token: string) => void> = [];

// 刷新token的函数
const refreshTokenFn = async (): Promise<string | null> => {
  try {
    const refresh_token = getRefreshToken();
    if (!refresh_token) {
      console.log("!refreshToken error")
      throw new Error('No refresh token');
    }

    const response = await axios.post<AuthResponse>(
      `${http.defaults.baseURL}/console/api/refresh-token`,
      { refresh_token }
    );

    const { access_token, refresh_token: newRefreshToken } = response.data;
    setToken(access_token);
    setRefreshToken(newRefreshToken);
    return access_token;
  } catch (error) {
    console.log("error:"+error)
    removeTokens();
    window.location.href = '/login';
    return null;
  }
};

// 请求拦截器
http.interceptors.request.use(
  async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
    const token = getToken();
    
    if (token && !isTokenExpired(token)) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
      return config;
    }

    if (config.url?.includes('/auth/refresh') || config.url?.includes('/auth/login')) {
      return config;
    }

    // Token过期，尝试刷新
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshTokenFn();
      isRefreshing = false;

      if (newToken) {
        // 执行队列中的请求
        requests.forEach((cb) => cb(newToken));
        requests = [];
      }
    }

    // 将请求添加到队列
    return new Promise((resolve) => {
      requests.push((token: string) => {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`
        };
        resolve(config);
      });
    });
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 如果是刷新token的请求失败，直接跳转登录页
    if (originalRequest.url?.includes('/auth/refresh')) {
      removeTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 如果是401错误且不是登录请求，尝试刷新token
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshTokenFn();
        isRefreshing = false;

        if (newToken) {
          // 重试原始请求
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`
          };
          return http(originalRequest);
        }
      }

      // 将请求添加到队列
      return new Promise((resolve) => {
        requests.push((token: string) => {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`
          };
          resolve(http(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

// 定义请求方法的类型
interface RequestMethods {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
}

// 导出请求方法
export const request: RequestMethods = {
  get: (url, config = {}) => http.get(url, config),
  post: (url, data = {}, config = {}) => http.post(url, data, config),
  put: (url, data = {}, config = {}) => http.put(url, data, config),
  delete: (url, config = {}) => http.delete(url, config),
  patch: (url, data = {}, config = {}) => http.patch(url, data, config),
};

export default http;

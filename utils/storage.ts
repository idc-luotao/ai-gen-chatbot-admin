import { TokenPayload } from '../types/auth';

const APP_TOKEN_KEY = 'app_access_token';
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const USER_TYPE = 'user_type';
export const USER_TYPE_ADMIN = 'ADMIN';
export const USER_TYPE_COMMON = 'COMMON';

const USER_NAME = 'user_name';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const setRefreshToken = (refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const setUserType = (userType: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_TYPE, userType);
};

export const setUserName = (userName: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_NAME, userName);
};

export const setAppToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APP_TOKEN_KEY, token);
};

export const getUserType = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_TYPE);
};

export const getUserName = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_NAME);
};

export const getAppToken = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(APP_TOKEN_KEY) || '';
};

export const removeTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_TYPE);
  localStorage.removeItem(USER_NAME);
};

export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as TokenPayload;
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
};

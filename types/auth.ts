export interface TokenPayload {
  exp: number;
  [key: string]: any;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  userType: 'admin' | 'user';
  createdAt: string;
}

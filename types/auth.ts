export interface TokenPayload {
  exp: number;
  [key: string]: any;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  createdAt: string;
}

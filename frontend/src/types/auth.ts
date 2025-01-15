export interface LoginParams {
  username?: string;
  phone?: string;
  password: string;
  role: 'customer' | 'business';
}

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      username: string;
      phone: string;
      role: string;
    };
  };
} 
import type { LoginCredentials, LoginResponse } from '../types/auth';
import apiRequest from './apiClient';
import { IS_DEMO_MODE } from './config';
import { loginToDemo, logoutFromDemo } from './demoApi';

const login = (credentials: LoginCredentials) => {
  if (IS_DEMO_MODE) {
    return loginToDemo(credentials);
  }

  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

const logout = async (token: string) => {
  if (IS_DEMO_MODE) {
    return logoutFromDemo(token);
  }

  await apiRequest('/api/auth/logout', {
    method: 'POST',
    token,
  });
};

export { login, logout };

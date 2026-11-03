import type { LoginCredentials, LoginResponse } from '../types/auth';
import apiRequest from './apiClient';

const login = (credentials: LoginCredentials) => {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

const logout = async (token: string) => {
  await apiRequest('/api/auth/logout', {
    method: 'POST',
    token,
  });
};

export { login, logout };

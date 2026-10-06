import type { UserProfile } from './profile';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  expiresAt: string;
  user: UserProfile;
};

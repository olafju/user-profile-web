import type { UserProfile } from './profile';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = LoginCredentials & {
  displayName: string;
};

export type LoginResponse = {
  token: string;
  expiresAt: string;
  user: UserProfile;
};

export type RegisterResponse = {
  message: string;
  user: UserProfile;
};

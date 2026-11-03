import type { ProfileUpdate, UserProfile } from '../types/profile';
import apiRequest from './apiClient';

type ProfileResponse = {
  user: UserProfile;
};

const getProfile = async (token: string) => {
  const response = await apiRequest<ProfileResponse>('/api/auth/me', {
    token,
  });

  return response.user;
};

const updateProfile = async (token: string, changes: ProfileUpdate) => {
  const response = await apiRequest<ProfileResponse>('/api/auth/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify(changes),
  });

  return response.user;
};

export { getProfile, updateProfile };

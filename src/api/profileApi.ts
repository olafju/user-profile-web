import type { ProfileUpdate, UserProfile } from '../types/profile';
import apiRequest from './apiClient';
import { IS_DEMO_MODE } from './config';
import { getDemoProfile, updateDemoProfile } from './demoApi';

type ProfileResponse = {
  user: UserProfile;
};

const getProfile = async (token: string) => {
  if (IS_DEMO_MODE) {
    return getDemoProfile(token);
  }

  const response = await apiRequest<ProfileResponse>('/api/auth/me', {
    token,
  });

  return response.user;
};

const updateProfile = async (token: string, changes: ProfileUpdate) => {
  if (IS_DEMO_MODE) {
    return updateDemoProfile(token, changes);
  }

  const response = await apiRequest<ProfileResponse>('/api/auth/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify(changes),
  });

  return response.user;
};

export { getProfile, updateProfile };

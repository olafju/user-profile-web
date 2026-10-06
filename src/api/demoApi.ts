import type { LoginCredentials, LoginResponse } from '../types/auth';
import type { ProfileUpdate, UserProfile } from '../types/profile';
import ApiError from './ApiError';
import { DEMO_CREDENTIALS } from './config';

const DEMO_TOKEN = 'demo-access-token';
const RESPONSE_DELAY = 300;

let activeToken: string | null = null;
let demoProfile: UserProfile = {
  id: 'demo-user',
  email: DEMO_CREDENTIALS.email,
  displayName: 'Demo User',
  bio: 'This profile works without a backend.',
};

const waitForDemoResponse = () => {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, RESPONSE_DELAY);
  });
};

const requireDemoSession = (token: string) => {
  if (!activeToken || token !== activeToken) {
    throw new ApiError('Session expired.', 401);
  }
};

const loginToDemo = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  await waitForDemoResponse();

  if (
    credentials.email !== DEMO_CREDENTIALS.email ||
    credentials.password !== DEMO_CREDENTIALS.password
  ) {
    throw new ApiError('Invalid demo email or password.', 401);
  }

  activeToken = DEMO_TOKEN;

  return {
    token: DEMO_TOKEN,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    user: { ...demoProfile },
  };
};

const logoutFromDemo = async (token: string) => {
  await waitForDemoResponse();
  requireDemoSession(token);
  activeToken = null;
};

const getDemoProfile = async (token: string) => {
  await waitForDemoResponse();
  requireDemoSession(token);

  return { ...demoProfile };
};

const updateDemoProfile = async (token: string, changes: ProfileUpdate) => {
  await waitForDemoResponse();
  requireDemoSession(token);

  demoProfile = {
    ...demoProfile,
    ...changes,
  };

  return { ...demoProfile };
};

export {
  getDemoProfile,
  loginToDemo,
  logoutFromDemo,
  updateDemoProfile,
};

const apiUrl = import.meta.env.VITE_API_URL?.trim() ?? '';
const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const DEMO_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'Demo123!',
} as const;

if (!IS_DEMO_MODE && !apiUrl) {
  throw new Error('VITE_API_URL is not configured.');
}

const API_URL = apiUrl.replace(/\/+$/, '');

export { DEMO_CREDENTIALS, IS_DEMO_MODE };
export default API_URL;

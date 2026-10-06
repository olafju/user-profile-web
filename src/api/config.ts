const apiUrl = import.meta.env.VITE_API_URL.trim();

if (!apiUrl) {
  throw new Error('VITE_API_URL is not configured.');
}

const API_URL = apiUrl.replace(/\/+$/, '');

export default API_URL;

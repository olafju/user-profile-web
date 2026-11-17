import type { UserRole } from '../types/auth';

const getTokenRole = (token: string): UserRole | null => {
  try {
    const payloadPart = token.split('.')[1];

    if (!payloadPart) {
      return null;
    }

    const base64 = payloadPart
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, '=');
    const payload: unknown = JSON.parse(atob(base64));

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'role' in payload &&
      (payload.role === 'user' || payload.role === 'admin')
    ) {
      return payload.role;
    }
  } catch {
    return null;
  }

  return null;
};

export default getTokenRole;

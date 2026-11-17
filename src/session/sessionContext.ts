import { createContext } from 'react';
import type { UserRole } from '../types/auth';

export type SessionContextValue = {
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  startSession: (token: string) => void;
  endSession: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export default SessionContext;

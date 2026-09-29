import { createContext } from 'react';

export type SessionContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  startSession: (token: string) => void;
  endSession: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export default SessionContext;

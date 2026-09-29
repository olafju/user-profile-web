import { useState } from 'react';
import type { ReactNode } from 'react';
import SessionContext from './sessionContext';

type SessionProviderProps = {
  children: ReactNode;
};

function SessionProvider({ children }: SessionProviderProps) {
  const [token, setToken] = useState<string | null>(null);

  const startSession = (newToken: string) => {
    setToken(newToken);
  };

  const endSession = () => {
    setToken(null);
  };

  return (
    <SessionContext.Provider
      value={{
        token,
        isAuthenticated: token !== null,
        startSession,
        endSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export default SessionProvider;

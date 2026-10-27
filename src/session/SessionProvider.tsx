import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import SessionContext from './sessionContext';

const SESSION_TOKEN_KEY = 'user-profile-token';

type SessionProviderProps = {
  children: ReactNode;
};

function SessionProvider({ children }: SessionProviderProps) {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  });

  const startSession = useCallback((newToken: string) => {
    sessionStorage.setItem(SESSION_TOKEN_KEY, newToken);
    setToken(newToken);
  }, []);

  const endSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    setToken(null);
  }, []);

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

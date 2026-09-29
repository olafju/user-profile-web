import { useContext } from 'react';
import SessionContext from './sessionContext';

const useSession = () => {
  const session = useContext(SessionContext);

  if (session === undefined) {
    throw new Error('useSession must be used inside SessionProvider.');
  }

  return session;
};

export default useSession;

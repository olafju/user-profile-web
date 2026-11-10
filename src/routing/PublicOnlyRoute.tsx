import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useSession from '../session/useSession';

type PublicOnlyRouteProps = {
  children: ReactNode;
};

const getReturnPath = (state: unknown) => {
  if (
    typeof state === 'object' &&
    state !== null &&
    'returnTo' in state &&
    typeof state.returnTo === 'string' &&
    state.returnTo.startsWith('/') &&
    !state.returnTo.startsWith('//')
  ) {
    return state.returnTo;
  }

  return '/profile';
};

function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated } = useSession();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={getReturnPath(location.state)} replace />;
  }

  return children;
}

export default PublicOnlyRoute;

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import useSession from '../session/useSession';

type PublicOnlyRouteProps = {
  children: ReactNode;
};

function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated } = useSession();

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

export default PublicOnlyRoute;

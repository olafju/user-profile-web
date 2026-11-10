import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useSession from '../session/useSession';

type ProtectedRouteProps = {
  children: ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useSession();
  const location = useLocation();

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;

    return <Navigate to="/login" replace state={{ returnTo }} />;
  }

  return children;
}

export default ProtectedRoute;

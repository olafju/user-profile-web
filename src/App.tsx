import type { LoginCredentials } from './types/auth';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import ProtectedRoute from './routing/ProtectedRoute';
import PublicOnlyRoute from './routing/PublicOnlyRoute';
import useSession from './session/useSession';

const wait = (delay: number) => {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, delay);
  });
};

const mockLogin = async (credentials: LoginCredentials) => {
  await wait(800);

  if (credentials.password === 'wrong-password') {
    throw new Error('Invalid email or password.');
  }
};

function App() {
  const { isAuthenticated, startSession, endSession } = useSession();

  const handleLogin = async (credentials: LoginCredentials) => {
    await mockLogin(credentials);
    startSession('mock-access-token');
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage login={handleLogin} />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage onLogout={endSession} />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? '/profile' : '/login'}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;

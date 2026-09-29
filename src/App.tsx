import type { LoginCredentials } from './types/auth';
import type { ProfileUpdate, UserProfile } from './types/profile';
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

let mockProfile: UserProfile = {
  id: 'user-001',
  email: 'user@example.com',
  displayName: 'Demo User',
  bio: 'This profile currently uses controlled mock data.',
};

const mockLogin = async (credentials: LoginCredentials) => {
  await wait(800);

  if (credentials.password === 'wrong-password') {
    throw new Error('Invalid email or password.');
  }

  mockProfile = { ...mockProfile, email: credentials.email };
};

const mockSaveProfile = async (changes: ProfileUpdate) => {
  await wait(700);
  mockProfile = { ...mockProfile, ...changes };

  return { ...mockProfile };
};

const mockRefreshProfile = async () => {
  await wait(500);

  return { ...mockProfile };
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
            <ProfilePage
              initialProfile={{ ...mockProfile }}
              saveProfile={mockSaveProfile}
              refreshProfile={mockRefreshProfile}
              onLogout={endSession}
            />
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

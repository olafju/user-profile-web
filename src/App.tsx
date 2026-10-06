import { useState } from 'react';
import type { LoginCredentials } from './types/auth';
import type { ProfileUpdate, UserProfile } from './types/profile';
import { Navigate, Route, Routes } from 'react-router-dom';
import ApiError from './api/ApiError';
import { login, logout } from './api/authApi';
import { getProfile, updateProfile } from './api/profileApi';
import LoginPage from './pages/LoginPage/LoginPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import ProtectedRoute from './routing/ProtectedRoute';
import PublicOnlyRoute from './routing/PublicOnlyRoute';
import useSession from './session/useSession';

function App() {
  const { token, isAuthenticated, startSession, endSession } = useSession();
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(
    null,
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogin = async (credentials: LoginCredentials) => {
    const response = await login(credentials);

    setCurrentProfile(response.user);
    startSession(response.token);
  };

  const getSessionToken = () => {
    if (!token) {
      throw new ApiError('Session token is missing.', 401);
    }

    return token;
  };

  const handleAuthenticatedError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      setCurrentProfile(null);
      endSession();
    }
  };

  const handleSaveProfile = async (changes: ProfileUpdate) => {
    try {
      const savedProfile = await updateProfile(getSessionToken(), changes);
      setCurrentProfile(savedProfile);

      return savedProfile;
    } catch (error: unknown) {
      handleAuthenticatedError(error);
      throw error;
    }
  };

  const handleRefreshProfile = async () => {
    try {
      const refreshedProfile = await getProfile(getSessionToken());
      setCurrentProfile(refreshedProfile);

      return refreshedProfile;
    } catch (error: unknown) {
      handleAuthenticatedError(error);
      throw error;
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      if (token) {
        await logout(token);
      }
    } catch {
      // Local logout must still complete when the backend is unavailable.
    } finally {
      setCurrentProfile(null);
      endSession();
      setIsLoggingOut(false);
    }
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
            {currentProfile ? (
              <ProfilePage
                initialProfile={currentProfile}
                saveProfile={handleSaveProfile}
                refreshProfile={handleRefreshProfile}
                isLoggingOut={isLoggingOut}
                onLogout={handleLogout}
              />
            ) : null}
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

import { useEffect, useState } from 'react';
import type { LoginCredentials } from './types/auth';
import type { ProfileUpdate, UserProfile } from './types/profile';
import { Navigate, Route, Routes } from 'react-router-dom';
import ApiError from './api/ApiError';
import { login, logout } from './api/authApi';
import { getProfile, updateProfile } from './api/profileApi';
import Button from './components/atoms/Button/Button';
import Message from './components/atoms/Message/Message';
import Spinner from './components/atoms/Spinner/Spinner';
import ProfileTemplate from './components/templates/ProfileTemplate/ProfileTemplate';
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
  const [profileLoadError, setProfileLoadError] = useState<string>();
  const [profileLoadAttempt, setProfileLoadAttempt] = useState(0);
  const isRestoringProfile = Boolean(
    token && !currentProfile && !profileLoadError,
  );

  useEffect(() => {
    if (!token || currentProfile) {
      return;
    }

    let isCancelled = false;

    getProfile(token)
      .then((profile) => {
        if (!isCancelled) {
          setCurrentProfile(profile);
        }
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          endSession();
          return;
        }

        setProfileLoadError(
          error instanceof Error
            ? error.message
            : 'Unable to load the profile.',
        );
      });

    return () => {
      isCancelled = true;
    };
  }, [currentProfile, endSession, profileLoadAttempt, token]);

  const handleLogin = async (credentials: LoginCredentials) => {
    const response = await login(credentials);

    setProfileLoadError(undefined);
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
      setProfileLoadError(undefined);
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
      setProfileLoadError(undefined);
      endSession();
      setIsLoggingOut(false);
    }
  };

  const handleRetryProfileLoad = () => {
    setProfileLoadError(undefined);
    setProfileLoadAttempt((currentAttempt) => currentAttempt + 1);
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
            ) : (
              <ProfileTemplate
                title="Profile"
                isLoggingOut={isLoggingOut}
                onLogout={handleLogout}
              >
                {isRestoringProfile ? (
                  <Spinner label="Loading profile" />
                ) : profileLoadError ? (
                  <>
                    <Message variant="error">{profileLoadError}</Message>
                    <Button onClick={handleRetryProfileLoad}>Try again</Button>
                  </>
                ) : null}
              </ProfileTemplate>
            )}
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

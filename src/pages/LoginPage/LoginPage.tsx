import { useState } from 'react';
import type { LoginCredentials } from '../../types/auth';
import LoginForm from '../../components/organisms/LoginForm/LoginForm';
import AuthTemplate from '../../components/templates/AuthTemplate/AuthTemplate';

type LoginPageProps = {
  login: (credentials: LoginCredentials) => Promise<void>;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to log in. Try again.';
};

function LoginPage({ login }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setSubmitError(undefined);

    try {
      await login(credentials);
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthTemplate
      title="Welcome back"
      description="Log in to manage your profile."
    >
      <LoginForm
        isLoading={isLoading}
        submitError={submitError}
        onSubmit={handleLogin}
      />
    </AuthTemplate>
  );
}

export default LoginPage;

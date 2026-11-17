import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { LoginCredentials } from '../../types/auth';
import Message from '../../components/atoms/Message/Message';
import LoginForm from '../../components/organisms/LoginForm/LoginForm';
import AuthTemplate from '../../components/templates/AuthTemplate/AuthTemplate';

type LoginPageProps = {
  login: (credentials: LoginCredentials) => Promise<void>;
  notice?: string;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to log in. Try again.';
};

function LoginPage({ login, notice }: LoginPageProps) {
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
      {notice && <Message variant="success">{notice}</Message>}
      <LoginForm
        isLoading={isLoading}
        submitError={submitError}
        onSubmit={handleLogin}
      />
      <p className="auth-template__footer">
        Don&apos;t have an account? <Link to="/register">Create one</Link>
      </p>
    </AuthTemplate>
  );
}

export default LoginPage;

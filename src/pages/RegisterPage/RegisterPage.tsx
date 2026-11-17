import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { RegisterCredentials } from '../../types/auth';
import Message from '../../components/atoms/Message/Message';
import RegisterForm from '../../components/organisms/RegisterForm/RegisterForm';
import AuthTemplate from '../../components/templates/AuthTemplate/AuthTemplate';

type RegisterPageProps = {
  register: (credentials: RegisterCredentials) => Promise<void>;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to create the account. Try again.';
};

function RegisterPage({ register }: RegisterPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = async (credentials: RegisterCredentials) => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setSubmitError(undefined);

    try {
      await register(credentials);
      setIsRegistered(true);
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthTemplate
      title="Create account"
      description="Register a new account, then log in."
    >
      {isRegistered ? (
        <Message variant="success">
          Account created successfully. You can now log in.
        </Message>
      ) : (
        <RegisterForm
          isLoading={isLoading}
          submitError={submitError}
          onSubmit={handleRegister}
        />
      )}

      <p className="auth-template__footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthTemplate>
  );
}

export default RegisterPage;

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { LoginCredentials } from '../../../types/auth';
import Button from '../../atoms/Button/Button';
import Message from '../../atoms/Message/Message';
import Spinner from '../../atoms/Spinner/Spinner';
import FormField from '../../molecules/FormField/FormField';
import './LoginForm.css';

type LoginFormProps = {
  isLoading?: boolean;
  submitError?: string;
  onSubmit: (credentials: LoginCredentials) => void;
};

type LoginFormErrors = {
  email?: string;
  password?: string;
};

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateLogin = (email: string, password: string) => {
  const errors: LoginFormErrors = {};

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return errors;
};

function LoginForm({ isLoading = false, submitError, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({});

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      email: undefined,
    }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      password: undefined,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const errors = validateLogin(email, password);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    onSubmit({ email: email.trim(), password });
  };

  return (
    <form
      className="login-form"
      aria-busy={isLoading}
      noValidate
      onSubmit={handleSubmit}
    >
      {submitError && <Message variant="error">{submitError}</Message>}

      <FormField
        id="login-email"
        label="Email"
        type="email"
        value={email}
        placeholder="you@example.com"
        disabled={isLoading}
        autoComplete="email"
        error={fieldErrors.email}
        onChange={handleEmailChange}
      />

      <FormField
        id="login-password"
        label="Password"
        type="password"
        value={password}
        placeholder="Enter your password"
        disabled={isLoading}
        autoComplete="current-password"
        error={fieldErrors.password}
        onChange={handlePasswordChange}
      />

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Spinner label="Logging in" />}
        {isLoading ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  );
}

export default LoginForm;

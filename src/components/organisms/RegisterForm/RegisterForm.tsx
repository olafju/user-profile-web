import { useState } from 'react';
import type { FormEvent } from 'react';
import type { RegisterCredentials } from '../../../types/auth';
import Button from '../../atoms/Button/Button';
import Message from '../../atoms/Message/Message';
import Spinner from '../../atoms/Spinner/Spinner';
import FormField from '../../molecules/FormField/FormField';
import './RegisterForm.css';

type RegisterFormProps = {
  isLoading?: boolean;
  submitError?: string;
  onSubmit: (credentials: RegisterCredentials) => void;
};

type RegisterFormErrors = {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getByteLength = (value: string) => {
  return new TextEncoder().encode(value).length;
};

const validateRegistration = (
  displayName: string,
  email: string,
  password: string,
  confirmPassword: string,
) => {
  const errors: RegisterFormErrors = {};
  const trimmedDisplayName = displayName.trim();
  const trimmedEmail = email.trim();
  const passwordByteLength = getByteLength(password);

  if (!trimmedDisplayName) {
    errors.displayName = 'Display name is required.';
  } else if (trimmedDisplayName.length > 80) {
    errors.displayName = 'Display name must be at most 80 characters.';
  }

  if (!trimmedEmail) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(trimmedEmail)) {
    errors.email = 'Enter a valid email address.';
  } else if (trimmedEmail.length > 254) {
    errors.email = 'Email must be at most 254 characters.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (passwordByteLength < 8) {
    errors.password = 'Password must contain at least 8 characters.';
  } else if (passwordByteLength > 72) {
    errors.password = 'Password must be at most 72 bytes.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Repeat your password.';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
};

function RegisterForm({
  isLoading = false,
  submitError,
  onSubmit,
}: RegisterFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});

  const clearFieldError = (field: keyof RegisterFormErrors) => {
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const errors = validateRegistration(
      displayName,
      email,
      password,
      confirmPassword,
    );
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    onSubmit({
      displayName: displayName.trim(),
      email: email.trim(),
      password,
    });
  };

  return (
    <form
      className="register-form"
      aria-busy={isLoading}
      noValidate
      onSubmit={handleSubmit}
    >
      {submitError && <Message variant="error">{submitError}</Message>}

      <FormField
        id="register-display-name"
        label="Display name"
        type="text"
        value={displayName}
        placeholder="Enter your display name"
        disabled={isLoading}
        autoComplete="name"
        error={fieldErrors.displayName}
        onChange={(value) => {
          setDisplayName(value);
          clearFieldError('displayName');
        }}
      />

      <FormField
        id="register-email"
        label="Email"
        type="email"
        value={email}
        placeholder="you@example.com"
        disabled={isLoading}
        autoComplete="email"
        error={fieldErrors.email}
        onChange={(value) => {
          setEmail(value);
          clearFieldError('email');
        }}
      />

      <FormField
        id="register-password"
        label="Password"
        type="password"
        value={password}
        placeholder="At least 8 characters"
        disabled={isLoading}
        autoComplete="new-password"
        error={fieldErrors.password}
        onChange={(value) => {
          setPassword(value);
          clearFieldError('password');
          clearFieldError('confirmPassword');
        }}
      />

      <FormField
        id="register-confirm-password"
        label="Repeat password"
        type="password"
        value={confirmPassword}
        placeholder="Repeat your password"
        disabled={isLoading}
        autoComplete="new-password"
        error={fieldErrors.confirmPassword}
        onChange={(value) => {
          setConfirmPassword(value);
          clearFieldError('confirmPassword');
        }}
      />

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Spinner label="Creating account" />}
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}

export default RegisterForm;

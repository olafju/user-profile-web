import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../../atoms/Button/Button';
import Message from '../../atoms/Message/Message';
import Spinner from '../../atoms/Spinner/Spinner';
import FormField from '../../molecules/FormField/FormField';
import './DeleteAccountForm.css';

type DeleteAccountFormProps = {
  onDelete: (password: string) => Promise<void>;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to delete the account. Try again.';
};

function DeleteAccountForm({ onDelete }: DeleteAccountFormProps) {
  const [password, setPassword] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isDeleting) {
      return;
    }

    if (!password) {
      setPasswordError('Enter your current password.');
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      setPasswordError('Password must be at most 72 bytes.');
      return;
    }

    if (!isConfirmed) {
      setSubmitError('Confirm that you understand this action is permanent.');
      return;
    }

    setIsDeleting(true);
    setPasswordError(undefined);
    setSubmitError(undefined);

    try {
      await onDelete(password);
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="delete-account" aria-labelledby="delete-account-title">
      <div>
        <h2 id="delete-account-title">Delete account</h2>
        <p>
          This permanently deletes your account and invalidates all sessions.
        </p>
      </div>

      <form
        className="delete-account__form"
        aria-busy={isDeleting}
        noValidate
        onSubmit={handleSubmit}
      >
        <FormField
          id="delete-account-password"
          label="Current password"
          type="password"
          value={password}
          placeholder="Enter your current password"
          disabled={isDeleting}
          autoComplete="current-password"
          error={passwordError}
          onChange={(value) => {
            setPassword(value);
            setPasswordError(undefined);
            setSubmitError(undefined);
          }}
        />

        <label className="delete-account__confirmation">
          <input
            type="checkbox"
            checked={isConfirmed}
            disabled={isDeleting}
            onChange={(event) => {
              setIsConfirmed(event.target.checked);
              setSubmitError(undefined);
            }}
          />
          I understand that this action cannot be undone.
        </label>

        {submitError && <Message variant="error">{submitError}</Message>}

        <Button type="submit" variant="danger" disabled={isDeleting}>
          {isDeleting && <Spinner label="Deleting account" />}
          {isDeleting ? 'Deleting account...' : 'Delete account'}
        </Button>
      </form>
    </section>
  );
}

export default DeleteAccountForm;

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import RegisterForm from '../../src/components/organisms/RegisterForm/RegisterForm';

describe('RegisterForm', () => {
  it('shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<RegisterForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Display name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByText('Repeat your password.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid registration data without the repeated password', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Display name'), 'New User');
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Repeat password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(onSubmit).toHaveBeenCalledWith({
      displayName: 'New User',
      email: 'new@example.com',
      password: 'password123',
    });
  });
});

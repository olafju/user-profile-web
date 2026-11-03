import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import ApiError from '../src/api/ApiError';
import { login, logout } from '../src/api/authApi';
import { getProfile } from '../src/api/profileApi';
import SessionProvider from '../src/session/SessionProvider';
import type { UserProfile } from '../src/types/profile';

vi.mock('../src/api/authApi', () => ({
  login: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../src/api/profileApi', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
}));

const profile: UserProfile = {
  id: 'user-1',
  email: 'olaf@example.com',
  displayName: 'Olaf',
  bio: 'Frontend developer',
};

const renderApp = (initialPath = '/login') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <SessionProvider>
        <App />
      </SessionProvider>
    </MemoryRouter>,
  );
};

const submitLogin = async () => {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText('Email'), profile.email);
  await user.type(screen.getByLabelText('Password'), 'secret123');
  await user.click(screen.getByRole('button', { name: 'Log in' }));

  return user;
};

const renderLoggedInApp = async () => {
  vi.mocked(login).mockResolvedValue({
    token: 'access-token',
    expiresAt: '2026-10-06T12:00:00.000Z',
    user: profile,
  });

  renderApp();
  const user = await submitLogin();
  await screen.findByRole('heading', { name: 'Profile' });

  return user;
};

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('redirects a visitor without a session to the login page', async () => {
    renderApp('/profile');

    expect(
      await screen.findByRole('heading', { name: 'Welcome back' }),
    ).toBeInTheDocument();
  });

  it('logs in, displays the profile and stores the token', async () => {
    await renderLoggedInApp();

    expect(login).toHaveBeenCalledWith({
      email: profile.email,
      password: 'secret123',
    });
    expect(screen.getByDisplayValue(profile.displayName)).toBeInTheDocument();
    expect(localStorage.getItem('user-profile-token')).toBe('access-token');
  });

  it('restores the profile from a stored token', async () => {
    localStorage.setItem('user-profile-token', 'stored-token');
    vi.mocked(getProfile).mockResolvedValue(profile);

    renderApp('/profile');

    expect(
      await screen.findByDisplayValue(profile.displayName),
    ).toBeInTheDocument();
    expect(getProfile).toHaveBeenCalledWith('stored-token');
  });

  it('ends the session when the API returns 401', async () => {
    vi.mocked(getProfile).mockRejectedValue(
      new ApiError('Session expired.', 401),
    );
    const user = await renderLoggedInApp();

    await user.click(screen.getByRole('button', { name: 'Refresh profile' }));

    expect(
      await screen.findByRole('heading', { name: 'Welcome back' }),
    ).toBeInTheDocument();
    expect(localStorage.getItem('user-profile-token')).toBeNull();
  });

  it('logs out and removes the stored token', async () => {
    vi.mocked(logout).mockResolvedValue(undefined);
    const user = await renderLoggedInApp();

    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(logout).toHaveBeenCalledWith('access-token');
    expect(
      await screen.findByRole('heading', { name: 'Welcome back' }),
    ).toBeInTheDocument();
    expect(localStorage.getItem('user-profile-token')).toBeNull();
  });
});

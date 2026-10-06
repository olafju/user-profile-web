import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import ApiError from './api/ApiError';
import { login, logout } from './api/authApi';
import { getProfile, updateProfile } from './api/profileApi';
import SessionProvider from './session/SessionProvider';
import type { UserProfile } from './types/profile';

vi.mock('./api/authApi', () => ({
  login: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('./api/profileApi', () => ({
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

const submitLoginForm = async () => {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText('Email'), profile.email);
  await user.type(screen.getByLabelText('Password'), 'secret123');
  await user.click(screen.getByRole('button', { name: 'Log in' }));

  return user;
};

const loginSuccessfully = async () => {
  vi.mocked(login).mockResolvedValue({
    token: 'access-token',
    expiresAt: '2026-10-06T12:00:00.000Z',
    user: profile,
  });

  const user = await submitLoginForm();
  await screen.findByRole('heading', { name: 'Profile' });

  return user;
};

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('redirects a visitor without a session from profile to login', async () => {
    renderApp('/profile');

    expect(
      await screen.findByRole('heading', { name: 'Welcome back' }),
    ).toBeInTheDocument();
  });

  it('validates required login fields before calling the API', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in and displays the profile returned by the API', async () => {
    renderApp();

    await loginSuccessfully();

    expect(login).toHaveBeenCalledWith({
      email: profile.email,
      password: 'secret123',
    });
    expect(screen.getByDisplayValue(profile.displayName)).toBeInTheDocument();
    expect(screen.getByDisplayValue(profile.bio)).toBeInTheDocument();
  });

  it('shows the API error when login fails', async () => {
    vi.mocked(login).mockRejectedValue(
      new ApiError('Invalid email or password.', 401),
    );
    renderApp();

    await submitLoginForm();

    expect(
      await screen.findByText('Invalid email or password.'),
    ).toBeInTheDocument();
  });

  it('shows a message when the backend is unavailable', async () => {
    vi.mocked(login).mockRejectedValue(
      new ApiError('Backend is unavailable.'),
    );
    renderApp();

    await submitLoginForm();

    expect(
      await screen.findByText('Backend is unavailable.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Welcome back' }),
    ).toBeInTheDocument();
  });

  it('saves edited profile data with the session token', async () => {
    const savedProfile = {
      ...profile,
      displayName: 'Olaf Nowak',
      bio: 'React developer',
    };
    vi.mocked(updateProfile).mockResolvedValue(savedProfile);
    renderApp();
    const user = await loginSuccessfully();

    const displayNameInput = screen.getByLabelText('Display name');
    const bioInput = screen.getByLabelText('Bio');
    await user.clear(displayNameInput);
    await user.type(displayNameInput, savedProfile.displayName);
    await user.clear(bioInput);
    await user.type(bioInput, savedProfile.bio);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(updateProfile).toHaveBeenCalledWith('access-token', {
      displayName: savedProfile.displayName,
      bio: savedProfile.bio,
    });
    expect(
      await screen.findByText('Profile saved successfully.'),
    ).toBeInTheDocument();
  });

  it('refreshes the profile with data returned by the API', async () => {
    const refreshedProfile = {
      ...profile,
      displayName: 'Updated on server',
    };
    vi.mocked(getProfile).mockResolvedValue(refreshedProfile);
    renderApp();
    const user = await loginSuccessfully();

    await user.click(screen.getByRole('button', { name: 'Refresh profile' }));

    expect(getProfile).toHaveBeenCalledWith('access-token');
    expect(
      await screen.findByDisplayValue(refreshedProfile.displayName),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Profile refreshed successfully.'),
    ).toBeInTheDocument();
  });

  it('ends the session when refreshing the profile returns 401', async () => {
    vi.mocked(getProfile).mockRejectedValue(
      new ApiError('Session expired.', 401),
    );
    renderApp();
    const user = await loginSuccessfully();

    await user.click(screen.getByRole('button', { name: 'Refresh profile' }));

    expect(
      await screen.findByRole('heading', { name: 'Welcome back' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Profile' }),
    ).not.toBeInTheDocument();
  });

  it('logs out on the server and returns to the login page', async () => {
    vi.mocked(logout).mockResolvedValue(undefined);
    renderApp();
    const user = await loginSuccessfully();

    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(logout).toHaveBeenCalledWith('access-token');
    expect(
      await screen.findByRole('heading', { name: 'Welcome back' }),
    ).toBeInTheDocument();
  });
});

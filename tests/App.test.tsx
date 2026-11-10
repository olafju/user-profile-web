import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import ApiError from '../src/api/ApiError';
import { login, logout } from '../src/api/authApi';
import { getProfile, updateProfile } from '../src/api/profileApi';
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
    expect(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(profile.displayName)).toBeInTheDocument();
    expect(localStorage.getItem('user-profile-token')).toBe('access-token');
  });

  it('returns to the protected page after logging in', async () => {
    vi.mocked(login).mockResolvedValue({
      token: 'access-token',
      expiresAt: '2026-10-06T12:00:00.000Z',
      user: profile,
    });

    renderApp('/bar-2');

    expect(
      await screen.findByRole('heading', { name: 'Welcome back' }),
    ).toBeInTheDocument();

    await submitLogin();

    expect(await screen.findByText('Bar 2 works')).toBeInTheDocument();
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

  it('synchronizes the session when the page regains focus', async () => {
    vi.mocked(getProfile).mockResolvedValue(profile);
    renderApp();

    expect(
      await screen.findByRole('heading', { name: 'Welcome back' }),
    ).toBeInTheDocument();

    act(() => {
      localStorage.setItem('user-profile-token', 'stored-token');
      window.dispatchEvent(new Event('focus'));
    });

    expect(
      await screen.findByDisplayValue(profile.displayName),
    ).toBeInTheDocument();
    expect(getProfile).toHaveBeenCalledWith('stored-token');
  });

  it('navigates between the dashboard and profile', async () => {
    const user = await renderLoggedInApp();

    await user.click(screen.getByRole('link', { name: 'Dashboard' }));

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Card 1' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Products' }));

    expect(
      await screen.findByRole('heading', { name: 'Products' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Bar 2' }));

    expect(await screen.findByText('Bar 2 works')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Open profile' }));

    expect(
      await screen.findByRole('heading', { name: 'Profile' }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(profile.displayName)).toBeInTheDocument();
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

  it('shows profile field errors without clearing entered values', async () => {
    const user = await renderLoggedInApp();
    const displayNameInput = screen.getByLabelText('Display name');
    const bioInput = screen.getByLabelText('Bio');

    vi.mocked(updateProfile).mockRejectedValue(
      new ApiError(
        'Correct the highlighted fields.',
        422,
        'validation_failed',
        {
          displayName: 'This display name is unavailable.',
          bio: 'The bio contains unsupported text.',
        },
      ),
    );

    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'Existing name');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(updateProfile).toHaveBeenCalledWith('access-token', {
      displayName: 'Existing name',
      bio: profile.bio,
    });
    expect(
      await screen.findByText('This display name is unavailable.'),
    ).toBeInTheDocument();
    expect(screen.getByText('The bio contains unsupported text.')).toBeInTheDocument();
    expect(displayNameInput).toHaveValue('Existing name');
    expect(displayNameInput).toHaveAttribute('aria-invalid', 'true');
    expect(bioInput).toHaveAttribute('aria-invalid', 'true');

    await user.type(displayNameInput, ' 2');

    expect(
      screen.queryByText('This display name is unavailable.'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('The bio contains unsupported text.')).toBeInTheDocument();
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

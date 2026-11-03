import { render, screen } from '@testing-library/react';
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
    localStorage.clear();
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
    expect(localStorage.getItem('user-profile-token')).toBe('access-token');
  });

  it('restores the profile from a persisted token', async () => {
    localStorage.setItem('user-profile-token', 'stored-token');
    vi.mocked(getProfile).mockResolvedValue(profile);

    renderApp('/profile');

    expect(screen.getByRole('status', { name: 'Loading profile' })).toBeInTheDocument();
    expect(await screen.findByDisplayValue(profile.displayName)).toBeInTheDocument();
    expect(getProfile).toHaveBeenCalledWith('stored-token');
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

  it.each([
    {
      field: 'displayName',
      label: 'Display name',
      limit: 80,
      errorMessage: 'Display name must be at most 80 characters.',
    },
    {
      field: 'bio',
      label: 'Bio',
      limit: 280,
      errorMessage: 'Bio must be at most 280 characters.',
    },
  ])(
    'blocks saving an overlong $label and allows saving after correction',
    async ({ field, label, limit, errorMessage }) => {
      const validValue = 'a'.repeat(limit);
      const savedProfile = { ...profile, [field]: validValue };
      vi.mocked(updateProfile).mockResolvedValue(savedProfile);
      renderApp();
      const user = await loginSuccessfully();
      const input = screen.getByLabelText(label);

      await user.clear(input);
      await user.paste('a'.repeat(limit + 1));
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAccessibleDescription(errorMessage);
      expect(updateProfile).not.toHaveBeenCalled();

      await user.clear(input);
      await user.paste(validValue);

      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
      expect(input).toHaveAttribute('aria-invalid', 'false');
      expect(input).not.toHaveAttribute('aria-describedby');

      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(updateProfile).toHaveBeenCalledWith('access-token', {
        displayName: savedProfile.displayName,
        bio: savedProfile.bio,
      });
      expect(
        await screen.findByText('Profile saved successfully.'),
      ).toBeInTheDocument();
    },
  );

  it.each([
    { description: 'without surrounding whitespace', padding: '' },
    { description: 'with surrounding whitespace', padding: '  ' },
  ])(
    'accepts profile values at both length limits $description',
    async ({ padding }) => {
      const savedProfile = {
        ...profile,
        displayName: 'a'.repeat(80),
        bio: 'b'.repeat(280),
      };
      const displayName = `${padding}${savedProfile.displayName}${padding}`;
      const bio = `${padding}${savedProfile.bio}${padding}`;
      vi.mocked(updateProfile).mockResolvedValue(savedProfile);
      renderApp();
      const user = await loginSuccessfully();

      await user.clear(screen.getByLabelText('Display name'));
      await user.paste(displayName);
      await user.clear(screen.getByLabelText('Bio'));
      await user.paste(bio);
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(updateProfile).toHaveBeenCalledWith('access-token', {
        displayName,
        bio,
      });
      expect(
        await screen.findByText('Profile saved successfully.'),
      ).toBeInTheDocument();
    },
  );

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
    expect(localStorage.getItem('user-profile-token')).toBeNull();
  });
});

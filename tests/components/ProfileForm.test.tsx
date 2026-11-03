import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ProfileForm from '../../src/components/organisms/ProfileForm/ProfileForm';
import type { UserProfile } from '../../src/types/profile';

const profile: UserProfile = {
  id: 'user-1',
  email: 'olaf@example.com',
  displayName: 'Olaf',
  bio: 'Frontend developer',
};

const renderProfileForm = (profileOverrides: Partial<UserProfile> = {}) => {
  const onSave = vi.fn();

  render(
    <ProfileForm
      profile={{ ...profile, ...profileOverrides }}
      onChange={vi.fn()}
      onSave={onSave}
      onRefresh={vi.fn()}
    />,
  );

  return { onSave };
};

describe('ProfileForm', () => {
  it('allows saving a valid profile', async () => {
    const user = userEvent.setup();
    const { onSave } = renderProfileForm();

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSave).toHaveBeenCalledOnce();
  });

  it('does not save a display name longer than 80 characters', async () => {
    const user = userEvent.setup();
    const { onSave } = renderProfileForm({
      displayName: 'a'.repeat(81),
    });

    expect(
      screen.getByText('Display name must be at most 80 characters.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('does not save a bio longer than 280 characters', async () => {
    const user = userEvent.setup();
    const { onSave } = renderProfileForm({
      bio: 'a'.repeat(281),
    });

    expect(
      screen.getByText('Bio must be at most 280 characters.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('allows saving values exactly at both length limits', async () => {
    const user = userEvent.setup();
    const { onSave } = renderProfileForm({
      displayName: 'a'.repeat(80),
      bio: 'b'.repeat(280),
    });

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSave).toHaveBeenCalledOnce();
  });
});

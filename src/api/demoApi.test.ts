import { describe, expect, it } from 'vitest';
import { DEMO_CREDENTIALS } from './config';
import {
  getDemoProfile,
  loginToDemo,
  logoutFromDemo,
  updateDemoProfile,
} from './demoApi';

describe('demo API', () => {
  it('rejects invalid credentials', async () => {
    await expect(
      loginToDemo({
        email: 'wrong@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject({
      message: 'Invalid demo email or password.',
      status: 401,
    });
  });

  it('supports the complete profile flow', async () => {
    const loginResponse = await loginToDemo(DEMO_CREDENTIALS);
    const updatedProfile = await updateDemoProfile(loginResponse.token, {
      displayName: 'Updated Demo User',
      bio: 'Updated without a backend.',
    });

    expect(updatedProfile.displayName).toBe('Updated Demo User');
    await expect(getDemoProfile(loginResponse.token)).resolves.toEqual(
      updatedProfile,
    );

    await logoutFromDemo(loginResponse.token);

    await expect(getDemoProfile(loginResponse.token)).rejects.toMatchObject({
      status: 401,
    });
  });
});

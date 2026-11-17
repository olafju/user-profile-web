import { describe, expect, it } from 'vitest';
import getTokenRole from '../../src/session/getTokenRole';

const createToken = (payload: object) => {
  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `header.${encodedPayload}.signature`;
};

describe('getTokenRole', () => {
  it('reads an admin role from a JWT payload', () => {
    expect(getTokenRole(createToken({ role: 'admin' }))).toBe('admin');
  });

  it('returns null for an invalid or unsupported role', () => {
    expect(getTokenRole('invalid-token')).toBeNull();
    expect(getTokenRole(createToken({ role: 'owner' }))).toBeNull();
  });
});

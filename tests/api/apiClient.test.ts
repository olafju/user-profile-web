import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ApiError from '../../src/api/ApiError';
import apiRequest from '../../src/api/apiClient';
import type { ApiErrorResponse } from '../../src/api/apiTypes';

const fetchMock = vi.fn<typeof fetch>();

describe('apiRequest', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds the access token and returns JSON data', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ value: 'response data' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await apiRequest<{ value: string }>('/api/example', {
      method: 'POST',
      token: 'access-token',
      body: JSON.stringify({ name: 'example' }),
    });

    expect(response).toEqual({ value: 'response data' });

    const [url, options] = fetchMock.mock.calls[0];
    const headers = new Headers(options?.headers);

    expect(String(url)).toMatch(/\/api\/example$/);
    expect(headers.get('Authorization')).toBe('Bearer access-token');
    expect(headers.get('Accept')).toBe('application/json');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('converts the stage 2 error response into ApiError', async () => {
    const errorResponse: ApiErrorResponse = {
      error: {
        code: 'validation_failed',
        message: 'Correct the highlighted fields.',
        fields: {
          title: 'Required, 3-100 characters.',
        },
      },
    };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(errorResponse), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(apiRequest('/api/items')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Correct the highlighted fields.',
      status: 422,
      code: 'validation_failed',
      fields: {
        title: 'Required, 3-100 characters.',
      },
    });
  });

  it('still supports the previous error response format', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ details: [{ message: 'Invalid request.' }] }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    await expect(apiRequest('/api/example')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Invalid request.',
      status: 400,
    });
  });

  it('returns a readable error when the backend is unavailable', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(apiRequest('/api/example')).rejects.toEqual(
      new ApiError('Backend is unavailable.'),
    );
  });
});

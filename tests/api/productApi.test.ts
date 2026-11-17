import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiRequest from '../../src/api/apiClient';
import { getProducts } from '../../src/api/productApi';

vi.mock('../../src/api/apiClient', () => ({
  default: vi.fn(),
}));

describe('productApi', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('requests the selected product page and limit', async () => {
    const controller = new AbortController();

    vi.mocked(apiRequest).mockResolvedValue({
      items: [],
      page: 2,
      limit: 10,
      total: 0,
    });

    await getProducts({
      page: 2,
      limit: 10,
      signal: controller.signal,
    });

    expect(apiRequest).toHaveBeenCalledWith('/api/products?page=2&limit=10', {
      signal: controller.signal,
    });
  });
});

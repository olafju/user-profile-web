import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiRequest from '../../src/api/apiClient';
import { createProduct, getProducts } from '../../src/api/productApi';

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

  it('creates a product with the administrator token', async () => {
    const product = {
      name: 'Coffee',
      description: 'Arabica beans',
      price: 49.99,
      quantity: 12,
    };
    const createdProduct = {
      id: '1',
      ...product,
      addedAt: '2026-11-17T09:30:00Z',
    };

    vi.mocked(apiRequest).mockResolvedValue({ item: createdProduct });

    await expect(createProduct('admin-token', product)).resolves.toEqual(
      createdProduct,
    );
    expect(apiRequest).toHaveBeenCalledWith('/api/products', {
      method: 'POST',
      token: 'admin-token',
      body: JSON.stringify(product),
    });
  });
});

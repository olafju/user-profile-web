import type { ProductListResponse } from '../types/product';
import apiRequest from './apiClient';

type GetProductsOptions = {
  page: number;
  limit: number;
  signal?: AbortSignal;
};

const getProducts = ({ page, limit, signal }: GetProductsOptions) => {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiRequest<ProductListResponse>(
    `/api/products?${searchParams.toString()}`,
    { signal },
  );
};

export { getProducts };

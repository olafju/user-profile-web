import type {
  Product,
  ProductInput,
  ProductListResponse,
} from '../types/product';
import apiRequest from './apiClient';

type GetProductsOptions = {
  page: number;
  limit: number;
  signal?: AbortSignal;
};

type ProductResponse = {
  item: Product;
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

const createProduct = async (token: string, product: ProductInput) => {
  const response = await apiRequest<ProductResponse>('/api/products', {
    method: 'POST',
    token,
    body: JSON.stringify(product),
  });

  return response.item;
};

export { createProduct, getProducts };

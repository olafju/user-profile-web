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

const updateProduct = async (
  token: string,
  productId: string,
  product: ProductInput,
) => {
  const response = await apiRequest<ProductResponse>(
    `/api/products/${encodeURIComponent(productId)}`,
    {
      method: 'PUT',
      token,
      body: JSON.stringify(product),
    },
  );

  return response.item;
};

const deleteProduct = async (token: string, productId: string) => {
  await apiRequest(`/api/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
    token,
  });
};

export { createProduct, deleteProduct, getProducts, updateProduct };

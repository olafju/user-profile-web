import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getProducts } from '../../src/api/productApi';
import ProductsPage from '../../src/pages/ProductsPage/ProductsPage';
import type { ProductListResponse } from '../../src/types/product';

vi.mock('../../src/api/productApi', () => ({
  getProducts: vi.fn(),
}));

const firstPage: ProductListResponse = {
  items: [
    {
      id: 'product-1',
      name: 'Wireless Mouse',
      description: 'Compact wireless mouse.',
      price: 129.99,
      quantity: 24,
      addedAt: '2026-11-17T09:30:00Z',
    },
  ],
  page: 1,
  limit: 10,
  total: 12,
};

const secondPage: ProductListResponse = {
  items: [
    {
      id: 'product-11',
      name: 'Cable Organizer',
      description: 'Reusable cable clips.',
      price: 39.99,
      quantity: 52,
      addedAt: '2026-11-16T10:00:00Z',
    },
  ],
  page: 2,
  limit: 10,
  total: 12,
};

const renderProductsPage = (
  options: {
    canManage?: boolean;
    initialPath?: string;
    onEditProduct?: () => void;
    onDeleteProduct?: () => void;
  } = {},
) => {
  render(
    <MemoryRouter initialEntries={[options.initialPath ?? '/products']}>
      <ProductsPage
        canManage={options.canManage}
        onEditProduct={options.onEditProduct}
        onDeleteProduct={options.onDeleteProduct}
        onLogout={vi.fn()}
      />
      <LocationSearch />
    </MemoryRouter>,
  );
};

function LocationSearch() {
  const location = useLocation();

  return <output data-testid="location-search">{location.search}</output>;
}

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getProducts).mockImplementation(({ page }) => {
      return Promise.resolve(page === 2 ? secondPage : firstPage);
    });
  });

  it('loads the first product page from the API', async () => {
    renderProductsPage();

    expect(
      screen.getByRole('status', { name: 'Loading products' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('12 products')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(getProducts).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      signal: expect.any(AbortSignal),
    });
  });

  it('does not show management actions to a regular user', async () => {
    renderProductsPage();

    await screen.findByText('Wireless Mouse');

    expect(
      screen.queryByRole('button', { name: 'Edit Wireless Mouse' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete Wireless Mouse' }),
    ).not.toBeInTheDocument();
  });

  it('shows working management actions when management is enabled', async () => {
    const user = userEvent.setup();
    const onEditProduct = vi.fn();
    const onDeleteProduct = vi.fn();

    renderProductsPage({
      canManage: true,
      onEditProduct,
      onDeleteProduct,
    });

    await user.click(
      await screen.findByRole('button', { name: 'Edit Wireless Mouse' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Delete Wireless Mouse' }),
    );

    expect(onEditProduct).toHaveBeenCalledWith(firstPage.items[0]);
    expect(onDeleteProduct).toHaveBeenCalledWith(firstPage.items[0]);
  });

  it('loads the page stored in the URL', async () => {
    renderProductsPage({ initialPath: '/products?page=2' });

    expect(await screen.findByText('Cable Organizer')).toBeInTheDocument();
    expect(getProducts).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      signal: expect.any(AbortSignal),
    });
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
  });

  it('changes the page and stores it in the URL', async () => {
    const user = userEvent.setup();

    renderProductsPage();

    await screen.findByText('Wireless Mouse');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Cable Organizer')).toBeInTheDocument();
    expect(screen.getByTestId('location-search')).toHaveTextContent('page=2');
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
  });

  it('normalizes a page outside the available range', async () => {
    renderProductsPage({ initialPath: '/products?page=99' });

    await waitFor(() => {
      expect(screen.getByTestId('location-search')).toHaveTextContent('page=2');
    });
    expect(await screen.findByText('Cable Organizer')).toBeInTheDocument();
  });

  it('shows an error and retries the request', async () => {
    const user = userEvent.setup();
    vi.mocked(getProducts)
      .mockRejectedValueOnce(new Error('Unable to load products.'))
      .mockResolvedValueOnce(firstPage);

    renderProductsPage();

    expect(
      await screen.findByText('Unable to load products.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument();
    expect(getProducts).toHaveBeenCalledTimes(2);
  });

  it('shows an empty state without pagination', async () => {
    vi.mocked(getProducts).mockResolvedValue({
      items: [],
      page: 1,
      limit: 10,
      total: 0,
    });

    renderProductsPage();

    expect(await screen.findByText('No products available.')).toBeInTheDocument();
    expect(screen.getByText('0 products')).toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: 'Product pages' }),
    ).not.toBeInTheDocument();
  });
});

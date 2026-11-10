import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ProductsPage from '../../src/pages/ProductsPage/ProductsPage';
import type { Product } from '../../src/types/product';

const renderProductsPage = (
  options: {
    canManage?: boolean;
    initialPath?: string;
    onEditProduct?: (product: Product) => void;
    onDeleteProduct?: (product: Product) => void;
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
  it('does not show management actions to a regular user', () => {
    renderProductsPage();

    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit Wireless Mouse' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete Wireless Mouse' }),
    ).not.toBeInTheDocument();
  });

  it('shows working management actions to an admin', async () => {
    const user = userEvent.setup();
    const onEditProduct = vi.fn();
    const onDeleteProduct = vi.fn();

    renderProductsPage({
      canManage: true,
      onEditProduct,
      onDeleteProduct,
    });

    await user.click(
      screen.getByRole('button', { name: 'Edit Wireless Mouse' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Delete Wireless Mouse' }),
    );

    expect(onEditProduct).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'product-1' }),
    );
    expect(onDeleteProduct).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'product-1' }),
    );
  });

  it('restores product search from the URL', () => {
    renderProductsPage({ initialPath: '/products?q=mouse' });

    expect(screen.getByRole('searchbox', { name: 'Search products' })).toHaveValue(
      'mouse',
    );
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.queryByText('Mechanical Keyboard')).not.toBeInTheDocument();
  });

  it('updates the URL and product list after the search delay', async () => {
    const user = userEvent.setup();

    renderProductsPage();

    await user.type(
      screen.getByRole('searchbox', { name: 'Search products' }),
      'hub',
    );

    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('location-search')).toHaveTextContent('?q=hub');
    });

    expect(screen.getByText('USB-C Hub')).toBeInTheDocument();
    expect(screen.queryByText('Wireless Mouse')).not.toBeInTheDocument();
  });

  it('restores product sorting from the URL', () => {
    renderProductsPage({ initialPath: '/products?sort=price' });

    expect(screen.getByRole('combobox', { name: 'Sort products' })).toHaveValue(
      'price',
    );

    const productRows = screen.getAllByRole('row').slice(1);

    expect(within(productRows[0]).getByText('Wireless Mouse')).toBeInTheDocument();
    expect(
      within(productRows[productRows.length - 1]).getByText(
        'Mechanical Keyboard',
      ),
    ).toBeInTheDocument();
  });

  it('updates product sorting without removing the search query', async () => {
    const user = userEvent.setup();

    renderProductsPage({ initialPath: '/products?q=mouse' });

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Sort products' }),
      '-price',
    );

    expect(screen.getByTestId('location-search')).toHaveTextContent('q=mouse');
    expect(screen.getByTestId('location-search')).toHaveTextContent(
      'sort=-price',
    );
  });
});

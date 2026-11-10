import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ProductsPage from '../../src/pages/ProductsPage/ProductsPage';
import type { Product } from '../../src/types/product';

const renderProductsPage = (
  options: {
    canManage?: boolean;
    onEditProduct?: (product: Product) => void;
    onDeleteProduct?: (product: Product) => void;
  } = {},
) => {
  render(
    <MemoryRouter>
      <ProductsPage
        canManage={options.canManage}
        onEditProduct={options.onEditProduct}
        onDeleteProduct={options.onDeleteProduct}
        onLogout={vi.fn()}
      />
    </MemoryRouter>,
  );
};

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
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ApiError from '../../src/api/ApiError';
import ProductForm from '../../src/components/organisms/ProductForm/ProductForm';

describe('ProductForm', () => {
  it('shows validation errors for missing product data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ProductForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Add product' }));

    expect(screen.getByText('Product name is required.')).toBeInTheDocument();
    expect(screen.getByText('Price is required.')).toBeInTheDocument();
    expect(screen.getByText('Quantity is required.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits normalized product data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<ProductForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Name'), 'Coffee');
    await user.type(screen.getByLabelText('Description'), 'Arabica beans');
    await user.type(screen.getByLabelText('Price'), '49.99');
    await user.type(screen.getByLabelText('Quantity'), '12');
    await user.click(screen.getByRole('button', { name: 'Add product' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Coffee',
      description: 'Arabica beans',
      price: 49.99,
      quantity: 12,
    });
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
    expect(screen.getByLabelText('Price')).toHaveValue(null);
    expect(screen.getByLabelText('Quantity')).toHaveValue(null);
  });

  it('shows API validation errors under the correct fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError('Correct the highlighted fields.', 400, null, {
        name: 'Product name is already in use.',
        price: 'Price is invalid.',
      }),
    );

    render(<ProductForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Name'), 'Coffee');
    await user.type(screen.getByLabelText('Price'), '49.99');
    await user.type(screen.getByLabelText('Quantity'), '12');
    await user.click(screen.getByRole('button', { name: 'Add product' }));

    expect(
      screen.getByText('Product name is already in use.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Price is invalid.')).toBeInTheDocument();
    expect(
      screen.getByText('Correct the highlighted fields.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Coffee');
    expect(screen.getByLabelText('Price')).toHaveValue(49.99);

    await user.type(screen.getByLabelText('Name'), ' beans');

    expect(
      screen.queryByText('Product name is already in use.'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Price is invalid.')).toBeInTheDocument();
  });

  it('edits an existing product and supports cancelling', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();

    render(
      <ProductForm
        initialProduct={{
          id: 'product-1',
          name: 'Coffee',
          description: 'Arabica beans',
          price: 49.99,
          quantity: 12,
          addedAt: '2026-11-17T09:30:00Z',
        }}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByLabelText('Name')).toHaveValue('Coffee');
    await user.clear(screen.getByLabelText('Price'));
    await user.type(screen.getByLabelText('Price'), '44.50');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Coffee',
      description: 'Arabica beans',
      price: 44.5,
      quantity: 12,
    });
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
    expect(screen.getByLabelText('Price')).toHaveValue(null);
    expect(screen.getByLabelText('Quantity')).toHaveValue(null);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

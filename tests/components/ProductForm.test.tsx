import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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
    expect(
      await screen.findByText('Product created successfully.'),
    ).toBeInTheDocument();
  });
});

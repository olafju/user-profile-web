import { useState } from 'react';
import type { FormEvent } from 'react';
import type { ProductInput } from '../../../types/product';
import Button from '../../atoms/Button/Button';
import Message from '../../atoms/Message/Message';
import Spinner from '../../atoms/Spinner/Spinner';
import FormField from '../../molecules/FormField/FormField';
import TextareaField from '../../molecules/TextareaField/TextareaField';
import './ProductForm.css';

type ProductFormProps = {
  onSubmit: (product: ProductInput) => Promise<void>;
};

type ProductFormErrors = Partial<Record<keyof ProductInput, string>>;

const validateProduct = (
  name: string,
  description: string,
  price: string,
  quantity: string,
) => {
  const errors: ProductFormErrors = {};
  const normalizedName = name.trim();
  const normalizedPrice = Number(price);
  const normalizedQuantity = Number(quantity);

  if (!normalizedName) {
    errors.name = 'Product name is required.';
  } else if (normalizedName.length > 160) {
    errors.name = 'Product name must be at most 160 characters.';
  }

  if (description.length > 5000) {
    errors.description = 'Description must be at most 5000 characters.';
  }

  if (!price) {
    errors.price = 'Price is required.';
  } else if (!/^\d+(?:\.\d{1,2})?$/.test(price)) {
    errors.price = 'Enter a price with at most two decimal places.';
  } else if (normalizedPrice > 99999999.99) {
    errors.price = 'Price is too high.';
  }

  if (!quantity) {
    errors.quantity = 'Quantity is required.';
  } else if (!/^\d+$/.test(quantity)) {
    errors.quantity = 'Quantity must be a whole number.';
  } else if (normalizedQuantity > 4294967295) {
    errors.quantity = 'Quantity is too high.';
  }

  return errors;
};

function ProductForm({ onSubmit }: ProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ProductFormErrors>({});
  const [submitError, setSubmitError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFieldState = (field: keyof ProductInput) => {
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setSubmitError(undefined);
    setSuccessMessage(undefined);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const errors = validateProduct(name, description, price, quantity);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(undefined);
    setSuccessMessage(undefined);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        quantity: Number(quantity),
      });
      setName('');
      setDescription('');
      setPrice('');
      setQuantity('');
      setSuccessMessage('Product created successfully.');
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : 'Unable to create the product. Try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="product-form"
      aria-busy={isSubmitting}
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="product-form__header">
        <h3>Add product</h3>
        <p>Create a new item in the public catalogue.</p>
      </div>

      <div className="product-form__fields">
        <FormField
          id="product-name"
          label="Name"
          type="text"
          value={name}
          placeholder="Product name"
          disabled={isSubmitting}
          maxLength={160}
          error={fieldErrors.name}
          onChange={(value) => {
            setName(value);
            clearFieldState('name');
          }}
        />

        <TextareaField
          id="product-description"
          label="Description"
          value={description}
          placeholder="Product description"
          disabled={isSubmitting}
          rows={3}
          maxLength={5000}
          error={fieldErrors.description}
          onChange={(value) => {
            setDescription(value);
            clearFieldState('description');
          }}
        />

        <div className="product-form__number-fields">
          <FormField
            id="product-price"
            label="Price"
            type="number"
            value={price}
            placeholder="0.00"
            disabled={isSubmitting}
            min={0}
            max={99999999.99}
            step="0.01"
            error={fieldErrors.price}
            onChange={(value) => {
              setPrice(value);
              clearFieldState('price');
            }}
          />

          <FormField
            id="product-quantity"
            label="Quantity"
            type="number"
            value={quantity}
            placeholder="0"
            disabled={isSubmitting}
            min={0}
            max={4294967295}
            step={1}
            error={fieldErrors.quantity}
            onChange={(value) => {
              setQuantity(value);
              clearFieldState('quantity');
            }}
          />
        </div>
      </div>

      {submitError ? (
        <Message variant="error">{submitError}</Message>
      ) : successMessage ? (
        <Message variant="success">{successMessage}</Message>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Spinner label="Creating product" />}
        {isSubmitting ? 'Creating product...' : 'Add product'}
      </Button>
    </form>
  );
}

export default ProductForm;

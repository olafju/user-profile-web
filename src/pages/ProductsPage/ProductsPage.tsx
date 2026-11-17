import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../../api/productApi';
import Button from '../../components/atoms/Button/Button';
import Message from '../../components/atoms/Message/Message';
import Spinner from '../../components/atoms/Spinner/Spinner';
import ProductForm from '../../components/organisms/ProductForm/ProductForm';
import AppShell from '../../components/templates/AppShell/AppShell';
import type { Product, ProductInput } from '../../types/product';
import './ProductsPage.css';

type ProductsPageProps = {
  canManage?: boolean;
  isLoggingOut?: boolean;
  onDeleteProduct?: (productId: string) => Promise<void>;
  onCreateProduct?: (product: ProductInput) => Promise<void>;
  onUpdateProduct?: (
    productId: string,
    product: ProductInput,
  ) => Promise<void>;
  onLogout?: () => void;
};

type ProductsLoadState = {
  page: number | null;
  attempt: number;
  products: Product[];
  total: number;
  errorMessage?: string;
};

type ActionNotice = {
  key: number;
  message: string;
};

const productsPerPage = 10;

const priceFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
});

const dateFormatter = new Intl.DateTimeFormat('pl-PL');

const getPageNumber = (value: string | null) => {
  const pageNumber = Number(value);

  return Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to load products. Try again.';
};

function ProductsPage({
  canManage = false,
  isLoggingOut = false,
  onDeleteProduct,
  onCreateProduct,
  onUpdateProduct,
  onLogout,
}: ProductsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPage = getPageNumber(searchParams.get('page'));
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [actionNotice, setActionNotice] = useState<ActionNotice | null>(null);
  const [loadState, setLoadState] = useState<ProductsLoadState>({
    page: null,
    attempt: 0,
    products: [],
    total: 0,
  });
  const isLoading =
    loadState.page !== requestedPage || loadState.attempt !== loadAttempt;
  const products = loadState.products;
  const total = loadState.total;
  const errorMessage = isLoading ? undefined : loadState.errorMessage;
  const totalPages = Math.max(1, Math.ceil(total / productsPerPage));
  const currentPage = Math.min(requestedPage, totalPages);

  useEffect(() => {
    const controller = new AbortController();

    getProducts({
      page: requestedPage,
      limit: productsPerPage,
      signal: controller.signal,
    })
      .then((response) => {
        if (controller.signal.aborted) {
          return;
        }

        setLoadState({
          page: requestedPage,
          attempt: loadAttempt,
          products: response.items,
          total: response.total,
        });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLoadState({
            page: requestedPage,
            attempt: loadAttempt,
            products: [],
            total: 0,
            errorMessage: getErrorMessage(error),
          });
        }
      });

    return () => controller.abort();
  }, [loadAttempt, requestedPage]);

  useEffect(() => {
    if (isLoading || errorMessage || requestedPage === currentPage) {
      return;
    }

    setSearchParams(
      (currentSearchParams) => {
        const nextSearchParams = new URLSearchParams(currentSearchParams);

        if (currentPage === 1) {
          nextSearchParams.delete('page');
        } else {
          nextSearchParams.set('page', String(currentPage));
        }

        return nextSearchParams;
      },
      { replace: true },
    );
  }, [
    currentPage,
    errorMessage,
    isLoading,
    requestedPage,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!actionNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setActionNotice(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [actionNotice]);

  const showActionNotice = (message: string) => {
    setActionNotice((currentNotice) => ({
      key: (currentNotice?.key ?? 0) + 1,
      message,
    }));
  };

  const handlePageChange = (nextPage: number) => {
    setSearchParams((currentSearchParams) => {
      const nextSearchParams = new URLSearchParams(currentSearchParams);

      if (nextPage === 1) {
        nextSearchParams.delete('page');
      } else {
        nextSearchParams.set('page', String(nextPage));
      }

      return nextSearchParams;
    });
  };

  const handleRetry = () => {
    setLoadAttempt((currentAttempt) => currentAttempt + 1);
  };

  const handleCreateProduct = async (product: ProductInput) => {
    if (!onCreateProduct) {
      return;
    }

    await onCreateProduct(product);
    setLoadAttempt((currentAttempt) => currentAttempt + 1);
    showActionNotice('Product created successfully.');
  };

  const handleUpdateProduct = async (product: ProductInput) => {
    if (!editingProduct || !onUpdateProduct) {
      return;
    }

    await onUpdateProduct(editingProduct.id, product);
    setLoadAttempt((currentAttempt) => currentAttempt + 1);
    setEditingProduct(null);
    showActionNotice('Product updated successfully.');
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete || !onDeleteProduct || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(undefined);

    try {
      await onDeleteProduct(productToDelete.id);
      setProductToDelete(null);
      setLoadAttempt((currentAttempt) => currentAttempt + 1);
    } catch (error: unknown) {
      setDeleteError(
        error instanceof Error && error.message
          ? error.message
          : 'Unable to delete the product. Try again.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const productCountLabel = isLoading
    ? 'Loading...'
    : errorMessage
      ? 'Unavailable'
      : `${total} products`;

  return (
    <AppShell
      title="Products"
      description="Browse products available in the catalogue."
      isLoggingOut={isLoggingOut}
      onLogout={onLogout}
    >
      <section
        className="products-page"
        aria-busy={isLoading}
        aria-labelledby="products-title"
      >
        <header className="products-page__header">
          <div>
            <h2 id="products-title">Product list</h2>
            <p>Products loaded from the API.</p>
          </div>
          <span>{productCountLabel}</span>
        </header>

        {actionNotice && (
          <div
            className="products-page__action-notice"
            key={actionNotice.key}
            role="status"
          >
            <p>{actionNotice.message}</p>
            <span aria-hidden="true" />
          </div>
        )}

        {canManage && editingProduct && onUpdateProduct ? (
          <ProductForm
            key={editingProduct.id}
            initialProduct={editingProduct}
            onSubmit={handleUpdateProduct}
            onCancel={() => setEditingProduct(null)}
          />
        ) : canManage && onCreateProduct ? (
          <ProductForm key="create-product" onSubmit={handleCreateProduct} />
        ) : null}

        {canManage && productToDelete && onDeleteProduct && (
          <section
            className="products-page__delete-confirmation"
            aria-labelledby="delete-product-title"
          >
            <div>
              <h3 id="delete-product-title">Delete product?</h3>
              <p>
                <strong>{productToDelete.name}</strong> will be permanently
                removed from the catalogue.
              </p>
            </div>

            {deleteError && <Message variant="error">{deleteError}</Message>}

            <div className="products-page__delete-actions">
              <Button
                variant="danger"
                disabled={isDeleting}
                onClick={handleDeleteProduct}
              >
                {isDeleting && <Spinner label="Deleting product" />}
                {isDeleting ? 'Deleting...' : 'Confirm deletion'}
              </Button>
              <Button
                variant="secondary"
                disabled={isDeleting}
                onClick={() => {
                  setProductToDelete(null);
                  setDeleteError(undefined);
                }}
              >
                Cancel
              </Button>
            </div>
          </section>
        )}

        {isLoading ? (
          <div className="products-page__state">
            <Spinner label="Loading products" />
            <p>Loading products...</p>
          </div>
        ) : errorMessage ? (
          <div className="products-page__state">
            <Message variant="error">{errorMessage}</Message>
            <Button onClick={handleRetry}>Try again</Button>
          </div>
        ) : (
          <>
            <div className="products-page__table-wrapper">
              <table aria-label="Product list">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Price</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Added</th>
                    {canManage && <th scope="col">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="products-page__product">
                          <strong>{product.name}</strong>
                          <span>{product.description}</span>
                        </div>
                      </td>
                      <td>{priceFormatter.format(product.price)}</td>
                      <td>
                        <span
                          className={`products-page__quantity${
                            product.quantity === 0
                              ? ' products-page__quantity--empty'
                              : ''
                          }`}
                        >
                          {product.quantity}
                        </span>
                      </td>
                      <td>
                        {dateFormatter.format(new Date(product.addedAt))}
                      </td>
                      {canManage && (
                        <td>
                          <div className="products-page__actions">
                            <button
                              type="button"
                              disabled={!onUpdateProduct}
                              onClick={() => setEditingProduct(product)}
                              aria-label={`Edit ${product.name}`}
                            >
                              Edit
                            </button>
                            <button
                              className="products-page__action--danger"
                              type="button"
                              disabled={!onDeleteProduct}
                              onClick={() => {
                                setProductToDelete(product);
                                setDeleteError(undefined);
                              }}
                              aria-label={`Delete ${product.name}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td
                        className="products-page__empty"
                        colSpan={canManage ? 5 : 4}
                      >
                        No products available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {total > 0 && (
              <nav
                className="products-page__pagination"
                aria-label="Product pages"
              >
                <p aria-live="polite">
                  Page {currentPage} of {totalPages}
                </p>
                <div>
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </nav>
            )}
          </>
        )}
      </section>
    </AppShell>
  );
}

export default ProductsPage;

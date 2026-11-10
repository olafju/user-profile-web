import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/atoms/Button/Button';
import Message from '../../components/atoms/Message/Message';
import Spinner from '../../components/atoms/Spinner/Spinner';
import AppShell from '../../components/templates/AppShell/AppShell';
import type { Product } from '../../types/product';
import './ProductsPage.css';

type ProductsPageProps = {
  canManage?: boolean;
  errorMessage?: string;
  isLoading?: boolean;
  isLoggingOut?: boolean;
  products?: Product[];
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onRetry?: () => void;
  onLogout: () => void;
};

type ProductSort =
  | '-createdAt'
  | 'createdAt'
  | 'name'
  | 'price'
  | '-price';

const defaultProductSort: ProductSort = '-createdAt';
const productsPerPage = 10;

const productSortOptions: { value: ProductSort; label: string }[] = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: 'name', label: 'Name: A to Z' },
  { value: 'price', label: 'Price: low to high' },
  { value: '-price', label: 'Price: high to low' },
];

const mockProducts: Product[] = [
  {
    id: 'product-1',
    name: 'Wireless Mouse',
    description: 'Compact mouse with a silent click mechanism.',
    price: 129.99,
    stock: 24,
    version: 1,
    createdAt: '2026-11-10T09:30:00Z',
  },
  {
    id: 'product-2',
    name: 'Mechanical Keyboard',
    description: 'Keyboard with tactile switches and white backlight.',
    price: 349,
    stock: 12,
    version: 1,
    createdAt: '2026-11-10T11:15:00Z',
  },
  {
    id: 'product-3',
    name: 'USB-C Hub',
    description: 'Six-port hub for a laptop or tablet.',
    price: 219.5,
    stock: 0,
    version: 1,
    createdAt: '2026-11-10T08:00:00Z',
  },
  {
    id: 'product-4',
    name: 'Laptop Stand',
    description: 'Adjustable aluminium stand for a notebook.',
    price: 159,
    stock: 31,
    version: 1,
    createdAt: '2026-11-10T14:45:00Z',
  },
  {
    id: 'product-5',
    name: 'Webcam',
    description: 'Full HD webcam with an integrated privacy cover.',
    price: 249.99,
    stock: 18,
    version: 1,
    createdAt: '2026-11-09T10:45:00Z',
  },
  {
    id: 'product-6',
    name: 'Noise-Cancelling Headphones',
    description: 'Wireless headphones with active noise cancellation.',
    price: 499,
    stock: 7,
    version: 1,
    createdAt: '2026-11-09T16:20:00Z',
  },
  {
    id: 'product-7',
    name: 'Portable SSD',
    description: 'Fast external storage with a one-terabyte capacity.',
    price: 419,
    stock: 14,
    version: 1,
    createdAt: '2026-11-09T14:10:00Z',
  },
  {
    id: 'product-8',
    name: 'Monitor Light Bar',
    description: 'Adjustable desk light mounted directly on a monitor.',
    price: 189,
    stock: 22,
    version: 1,
    createdAt: '2026-11-09T08:15:00Z',
  },
  {
    id: 'product-9',
    name: 'Desk Mat',
    description: 'Large desk mat with a non-slip rubber base.',
    price: 79.99,
    stock: 40,
    version: 1,
    createdAt: '2026-11-08T15:00:00Z',
  },
  {
    id: 'product-10',
    name: 'USB Microphone',
    description: 'Desktop microphone for calls and voice recording.',
    price: 299,
    stock: 9,
    version: 1,
    createdAt: '2026-11-09T12:00:00Z',
  },
  {
    id: 'product-11',
    name: 'Bluetooth Speaker',
    description: 'Compact wireless speaker with twelve-hour battery life.',
    price: 199,
    stock: 16,
    version: 1,
    createdAt: '2026-11-09T09:30:00Z',
  },
  {
    id: 'product-12',
    name: 'Cable Organizer',
    description: 'Set of reusable clips for arranging desk cables.',
    price: 39.99,
    stock: 52,
    version: 1,
    createdAt: '2026-11-08T10:00:00Z',
  },
];

const priceFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
});

const dateFormatter = new Intl.DateTimeFormat('pl-PL');

const getProductSort = (value: string | null): ProductSort => {
  const matchingOption = productSortOptions.find(
    (option) => option.value === value,
  );

  return matchingOption?.value ?? defaultProductSort;
};

const getPageNumber = (value: string | null) => {
  const pageNumber = Number(value);

  return Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
};

const compareProducts = (
  firstProduct: Product,
  secondProduct: Product,
  sort: ProductSort,
) => {
  switch (sort) {
    case 'createdAt':
      return (
        Date.parse(firstProduct.createdAt) -
        Date.parse(secondProduct.createdAt)
      );
    case '-createdAt':
      return (
        Date.parse(secondProduct.createdAt) -
        Date.parse(firstProduct.createdAt)
      );
    case 'name':
      return firstProduct.name.localeCompare(secondProduct.name);
    case 'price':
      return firstProduct.price - secondProduct.price;
    case '-price':
      return secondProduct.price - firstProduct.price;
  }
};

function ProductsPage({
  canManage = false,
  errorMessage,
  isLoading = false,
  isLoggingOut = false,
  products = mockProducts,
  onEditProduct,
  onDeleteProduct,
  onRetry,
  onLogout,
}: ProductsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const sort = getProductSort(searchParams.get('sort'));
  const [searchDraft, setSearchDraft] = useState({ query, value: query });
  const searchValue = searchDraft.query === query ? searchDraft.value : query;

  useEffect(() => {
    const normalizedSearchValue = searchValue.trim();

    if (normalizedSearchValue === query) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSearchParams(
        (currentSearchParams) => {
          const nextSearchParams = new URLSearchParams(currentSearchParams);

          if (normalizedSearchValue) {
            nextSearchParams.set('q', normalizedSearchValue);
          } else {
            nextSearchParams.delete('q');
          }

          nextSearchParams.delete('page');

          return nextSearchParams;
        },
        { replace: true },
      );
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [query, searchValue, setSearchParams]);

  const normalizedQuery = query.trim().toLowerCase();
  const matchingProducts = products
    .filter((product) => {
      const searchableText = `${product.name} ${product.description}`;

      return searchableText.toLowerCase().includes(normalizedQuery);
    })
    .sort((firstProduct, secondProduct) =>
      compareProducts(firstProduct, secondProduct, sort),
    );
  const totalPages = Math.max(
    1,
    Math.ceil(matchingProducts.length / productsPerPage),
  );
  const requestedPage = getPageNumber(searchParams.get('page'));
  const currentPage = Math.min(requestedPage, totalPages);
  const firstProductIndex = (currentPage - 1) * productsPerPage;
  const visibleProducts = matchingProducts.slice(
    firstProductIndex,
    firstProductIndex + productsPerPage,
  );

  useEffect(() => {
    if (isLoading || errorMessage) {
      return;
    }

    const pageParam = searchParams.get('page');
    const normalizedPageParam = currentPage === 1 ? null : String(currentPage);

    if (pageParam === normalizedPageParam) {
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
  }, [currentPage, errorMessage, isLoading, searchParams, setSearchParams]);

  const handleSortChange = (nextSort: string) => {
    setSearchParams((currentSearchParams) => {
      const nextSearchParams = new URLSearchParams(currentSearchParams);
      nextSearchParams.set('sort', nextSort);
      nextSearchParams.delete('page');

      return nextSearchParams;
    });
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

  const productCountLabel = isLoading
    ? 'Loading...'
    : errorMessage
      ? 'Unavailable'
      : `${matchingProducts.length} products`;
  const emptyMessage = query
    ? 'No products match your search.'
    : 'No products available.';

  return (
    <AppShell
      title="Products"
      description="A preview of the product catalogue."
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
            <p>Example data used until the products API is available.</p>
          </div>
          <span>{productCountLabel}</span>
        </header>

        {isLoading ? (
          <div className="products-page__state">
            <Spinner label="Loading products" />
            <p>Loading products...</p>
          </div>
        ) : errorMessage ? (
          <div className="products-page__state">
            <Message variant="error">{errorMessage}</Message>
            {onRetry && <Button onClick={onRetry}>Try again</Button>}
          </div>
        ) : (
          <>
            <div className="products-page__filters">
              <div className="products-page__filter">
                <label htmlFor="product-search">Search products</label>
                <input
                  id="product-search"
                  type="search"
                  value={searchValue}
                  placeholder="Search by name or description"
                  onChange={(event) =>
                    setSearchDraft({ query, value: event.target.value })
                  }
                />
              </div>

              <div className="products-page__filter products-page__filter--sort">
                <label htmlFor="product-sort">Sort products</label>
                <select
                  id="product-sort"
                  value={sort}
                  onChange={(event) => handleSortChange(event.target.value)}
                >
                  {productSortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="products-page__table-wrapper">
              <table aria-label="Example product list">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Price</th>
                    <th scope="col">Stock</th>
                    <th scope="col">Version</th>
                    <th scope="col">Added</th>
                    {canManage && <th scope="col">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((product) => (
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
                          className={`products-page__stock${
                            product.stock === 0
                              ? ' products-page__stock--empty'
                              : ''
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td>v{product.version}</td>
                      <td>
                        {dateFormatter.format(new Date(product.createdAt))}
                      </td>
                      {canManage && (
                        <td>
                          <div className="products-page__actions">
                            <button
                              type="button"
                              disabled={!onEditProduct}
                              onClick={() => onEditProduct?.(product)}
                              aria-label={`Edit ${product.name}`}
                            >
                              Edit
                            </button>
                            <button
                              className="products-page__action--danger"
                              type="button"
                              disabled={!onDeleteProduct}
                              onClick={() => onDeleteProduct?.(product)}
                              aria-label={`Delete ${product.name}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {visibleProducts.length === 0 && (
                    <tr>
                      <td
                        className="products-page__empty"
                        colSpan={canManage ? 6 : 5}
                      >
                        {emptyMessage}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {matchingProducts.length > 0 && (
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

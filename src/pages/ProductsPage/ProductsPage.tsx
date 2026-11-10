import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppShell from '../../components/templates/AppShell/AppShell';
import type { Product } from '../../types/product';
import './ProductsPage.css';

type ProductsPageProps = {
  canManage?: boolean;
  isLoggingOut?: boolean;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onLogout: () => void;
};

type ProductSort =
  | '-createdAt'
  | 'createdAt'
  | 'name'
  | 'price'
  | '-price';

const defaultProductSort: ProductSort = '-createdAt';

const productSortOptions: { value: ProductSort; label: string }[] = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: 'name', label: 'Name: A to Z' },
  { value: 'price', label: 'Price: low to high' },
  { value: '-price', label: 'Price: high to low' },
];

const products: Product[] = [
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
  isLoggingOut = false,
  onEditProduct,
  onDeleteProduct,
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

          return nextSearchParams;
        },
        { replace: true },
      );
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [query, searchValue, setSearchParams]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleProducts = products
    .filter((product) => {
      const searchableText = `${product.name} ${product.description}`;

      return searchableText.toLowerCase().includes(normalizedQuery);
    })
    .sort((firstProduct, secondProduct) =>
      compareProducts(firstProduct, secondProduct, sort),
    );

  const handleSortChange = (nextSort: string) => {
    setSearchParams((currentSearchParams) => {
      const nextSearchParams = new URLSearchParams(currentSearchParams);
      nextSearchParams.set('sort', nextSort);

      return nextSearchParams;
    });
  };

  return (
    <AppShell
      title="Products"
      description="A preview of the product catalogue."
      isLoggingOut={isLoggingOut}
      onLogout={onLogout}
    >
      <section className="products-page" aria-labelledby="products-title">
        <header className="products-page__header">
          <div>
            <h2 id="products-title">Product list</h2>
            <p>Example data used until the products API is available.</p>
          </div>
          <span>{visibleProducts.length} products</span>
        </header>

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
                  <td>{dateFormatter.format(new Date(product.createdAt))}</td>
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
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

export default ProductsPage;

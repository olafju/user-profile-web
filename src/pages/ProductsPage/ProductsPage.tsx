import AppShell from '../../components/templates/AppShell/AppShell';
import type { Product } from '../../types/product';
import './ProductsPage.css';

type ProductsPageProps = {
  isLoggingOut?: boolean;
  onLogout: () => void;
};

const products: Product[] = [
  {
    id: 'product-1',
    name: 'Wireless Mouse',
    description: 'Compact mouse with a silent click mechanism.',
    price: 129.99,
    stock: 24,
    version: 1,
    createdAt: '2026-11-02T09:30:00Z',
  },
  {
    id: 'product-2',
    name: 'Mechanical Keyboard',
    description: 'Keyboard with tactile switches and white backlight.',
    price: 349,
    stock: 12,
    version: 1,
    createdAt: '2026-11-03T11:15:00Z',
  },
  {
    id: 'product-3',
    name: 'USB-C Hub',
    description: 'Six-port hub for a laptop or tablet.',
    price: 219.5,
    stock: 0,
    version: 1,
    createdAt: '2026-11-05T08:00:00Z',
  },
  {
    id: 'product-4',
    name: 'Laptop Stand',
    description: 'Adjustable aluminium stand for a notebook.',
    price: 159,
    stock: 31,
    version: 1,
    createdAt: '2026-11-07T14:45:00Z',
  },
];

const priceFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
});

const dateFormatter = new Intl.DateTimeFormat('pl-PL');

function ProductsPage({
  isLoggingOut = false,
  onLogout,
}: ProductsPageProps) {
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
          <span>{products.length} products</span>
        </header>

        <div className="products-page__table-wrapper">
          <table aria-label="Example product list">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Price</th>
                <th scope="col">Stock</th>
                <th scope="col">Version</th>
                <th scope="col">Added</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

export default ProductsPage;

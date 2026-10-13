import ProductCard from './ProductCard.jsx';

// A grid of product cards with loading, error and empty states.
export default function ProductGrid({ products, status, empty = 'No products found.', children }) {
  if (status === 'loading') return <p className="state">Loading products…</p>;
  if (status === 'error') return <p className="state">We couldn’t load products. Please try again shortly.</p>;
  if (!products.length) {
    return (
      <div className="state">
        <p>{empty}</p>
        {children}
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

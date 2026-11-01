import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../product/ProductGrid.jsx';
import Icon from '../common/Icon.jsx';
import { getProducts } from '../../services/api.js';

const SHOW = 4;

// A home-page row of product cards. Defaults to featured products; pass filters for other rows (e.g. Girls).
export default function FeaturedProducts({
  filters = { featured: true },
  eyebrow = 'Loved by little ones',
  title = 'Featured products',
  to = '/collections',
}) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const key = JSON.stringify(filters);

  useEffect(() => {
    getProducts(filters)
      .then((data) => {
        setProducts(data.slice(0, SHOW));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <section className="section">
      <div className="container">
        <div className="section__head">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="section__title">{title}</h2>
          </div>
          <Link to={to} className="text-link">
            View all <Icon name="arrow" size={18} />
          </Link>
        </div>
        <ProductGrid products={products} status={status} />
      </div>
    </section>
  );
}

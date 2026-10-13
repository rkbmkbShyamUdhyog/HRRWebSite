import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../product/ProductGrid.jsx';
import Icon from '../common/Icon.jsx';
import { getProducts } from '../../services/api.js';

const SHOW = 4;

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getProducts({ featured: true })
      .then((data) => {
        setProducts(data.slice(0, SHOW));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="section__head">
          <div>
            <p className="eyebrow">Loved by little ones</p>
            <h2 className="section__title">Featured products</h2>
          </div>
          <Link to="/collections" className="text-link">
            View all <Icon name="arrow" size={18} />
          </Link>
        </div>
        <ProductGrid products={products} status={status} />
      </div>
    </section>
  );
}

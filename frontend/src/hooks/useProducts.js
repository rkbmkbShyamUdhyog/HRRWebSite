import { useEffect, useState } from 'react';
import { getProducts } from '../services/api.js';

// Fetches products for the given filters, ignoring stale responses.
export default function useProducts(filters, enabled = true) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const key = JSON.stringify(filters);

  useEffect(() => {
    if (!enabled) return;
    let ignore = false;
    setStatus('loading');
    getProducts(filters)
      .then((data) => {
        if (ignore) return;
        setProducts(data);
        setStatus('ready');
      })
      .catch(() => !ignore && setStatus('error'));
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return { products, status };
}

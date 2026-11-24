import { useEffect, useRef, useState } from 'react';
import { getProducts } from '../services/api.js';
import { seededProducts } from '../prerender/seed.js';

// Fetches products for the given filters, ignoring stale responses.
export default function useProducts(filters, enabled = true) {
  const [seeded] = useState(() => (enabled ? seededProducts(filters) : null));
  const [products, setProducts] = useState(seeded ?? []);
  const [status, setStatus] = useState(seeded ? 'ready' : 'loading');
  // Prerendered data is already on screen: refresh it quietly instead of flashing "Loading…".
  const keepSeeded = useRef(Boolean(seeded));
  const key = JSON.stringify(filters);

  useEffect(() => {
    if (!enabled) return;
    let ignore = false;
    if (keepSeeded.current) keepSeeded.current = false;
    else setStatus('loading');
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

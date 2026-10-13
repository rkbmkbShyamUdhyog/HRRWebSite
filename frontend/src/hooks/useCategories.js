import { useEffect, useState } from 'react';
import { getCategories } from '../services/api.js';

// Collections rarely change, so share one request between the header, footer and pages.
let cached = null;
let pending = null;

export default function useCategories() {
  const [categories, setCategories] = useState(cached ?? []);

  useEffect(() => {
    if (cached) return;
    pending ??= getCategories()
      .then((data) => (cached = data))
      .catch(() => {
        pending = null;
        return [];
      });
    let ignore = false;
    pending.then((data) => !ignore && setCategories(data));
    return () => {
      ignore = true;
    };
  }, []);

  return categories;
}

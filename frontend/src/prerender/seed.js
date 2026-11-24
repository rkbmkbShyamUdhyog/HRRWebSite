// Catalogue data baked into each prerendered page (window.__HRR_SEED__), so the HTML that search
// engines and AI tools read already contains the products, and the first render in the browser
// shows the same content instead of "Loading…". The app still fetches fresh data straight after,
// and the seed is cleared once the app has mounted, so later navigation works exactly as before.

let seed = typeof window !== 'undefined' ? window.__HRR_SEED__ ?? null : null;

export const getSeed = () => seed;

// Used by the build-time renderer (entry-server.jsx) and by App once it has mounted.
export function setSeed(value) {
  seed = value ?? null;
}

const normalize = (value) => String(value ?? '').trim().toLowerCase();

// Same filtering as the API's findProducts (backend/src/services/product.service.js).
function filterProducts(products, { q, collection, gender, category, featured } = {}) {
  const query = normalize(q);
  const col = normalize(collection);
  const gen = normalize(gender);
  const cat = normalize(category);

  return products.filter((product) => {
    if (col && normalize(product.collection) !== col && normalize(product.gender) !== col) return false;
    if (gen && normalize(product.gender) !== gen) return false;
    if (cat && normalize(product.category) !== cat) return false;
    if ((featured === true || featured === 'true') && !product.featured) return false;
    if (!query) return true;
    const haystack = [
      product.name,
      product.collection,
      product.gender,
      product.category,
      ...(product.colors ?? []).map((color) => color.name),
    ].map(normalize);
    return haystack.some((text) => text.includes(query));
  });
}

// Products for these filters from the seed, or null when there is no seed.
export function seededProducts(filters) {
  return seed?.products ? filterProducts(seed.products, filters) : null;
}

// { product, related } like GET /api/products/:slug, or null when it isn't in the seed.
export function seededProduct(slug) {
  const products = seed?.products;
  const product = products?.find((p) => p.slug === slug || p.id === slug);
  if (!product) return null;
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  return { product, related };
}

export const seededCategories = () => seed?.categories ?? null;

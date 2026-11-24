import { supabase } from '../config/supabase.js';

const RELATED_COUNT = 4;
const CACHE_MS = 60 * 1000;

const normalize = (value) => String(value ?? '').trim().toLowerCase();

// Turns a products row (with its nested product_colors) back into the JSON shape the frontend uses.
function toProduct(row) {
  const product = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    collection: row.collection,
    gender: row.gender,
    category: row.category,
    price: row.price,
    mrp: row.mrp,
    description: row.description,
    featured: row.featured ?? false,
  };
  // imageFit is only present on products that set it (e.g. "contain" for unisex photos).
  if (row.image_fit != null) product.imageFit = row.image_fit;
  product.colors = (row.product_colors ?? []).map((color) => ({
    name: color.name,
    hex: color.hex,
    images: color.images ?? [],
    sizes: color.sizes ?? [],
    amazonUrl: color.amazon_url ?? '',
  }));
  product.details = toDetails(row.details);
  return product;
}

// products.details is jsonb: { intro, highlights[], sizeNote }. Returns null when there is nothing to show.
function toDetails(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const text = (value) => (typeof value === 'string' ? value.trim() : '');
  const details = {
    intro: text(raw.intro),
    highlights: Array.isArray(raw.highlights) ? raw.highlights.map(text).filter(Boolean) : [],
    sizeNote: text(raw.sizeNote ?? raw.size_note),
  };
  return details.intro || details.highlights.length || details.sizeNote ? details : null;
}

async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_colors(name, hex, images, sizes, amazon_url, sort_order)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .order('sort_order', { ascending: true, referencedTable: 'product_colors' });

  if (error) throw new Error(`Could not load products from Supabase: ${error.message}`);
  return data.map(toProduct);
}

// The product list is cached in memory for 60 seconds. Concurrent requests share one fetch,
// and if Supabase is unreachable the last good list keeps being served.
let cache = { products: null, loadedAt: 0 };
let inflight = null;

async function getProducts() {
  if (cache.products && Date.now() - cache.loadedAt < CACHE_MS) return cache.products;
  if (!inflight) {
    inflight = fetchProducts()
      .then((products) => {
        cache = { products, loadedAt: Date.now() };
        return products;
      })
      .catch((err) => {
        if (!cache.products) throw err;
        console.error(`${err.message}. Serving the cached list.`);
        return cache.products;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

// A collection filter such as "Boys" matches the product's collection or its gender.
export async function findProducts({ q, collection, gender, category, featured } = {}) {
  const products = await getProducts();
  const query = normalize(q);
  const col = normalize(collection);
  const gen = normalize(gender);
  const cat = normalize(category);

  return products.filter((product) => {
    if (col && normalize(product.collection) !== col && normalize(product.gender) !== col) return false;
    if (gen && normalize(product.gender) !== gen) return false;
    if (cat && normalize(product.category) !== cat) return false;
    if (featured === 'true' && !product.featured) return false;
    if (!query) return true;

    const haystack = [
      product.name,
      product.collection,
      product.gender,
      product.category,
      ...product.colors.map((color) => color.name),
    ].map(normalize);

    return haystack.some((text) => text.includes(query));
  });
}

export async function findProduct(idOrSlug) {
  const products = await getProducts();
  return products.find((product) => product.slug === idOrSlug || product.id === idOrSlug) ?? null;
}

// Other products in the same category.
export async function findRelatedProducts(product) {
  const products = await getProducts();
  return products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, RELATED_COUNT);
}

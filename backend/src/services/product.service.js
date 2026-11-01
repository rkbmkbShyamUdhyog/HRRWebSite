import { watchFile } from 'node:fs';
import { readJson, dataPath } from './readJson.js';

const RELATED_COUNT = 4;
const PRODUCTS_FILE = 'products.json';

const normalize = (value) => String(value ?? '').trim().toLowerCase();

// Products are read once at startup and re-read whenever products.json changes on disk,
// so edits show up without a restart. A bad edit (invalid JSON) keeps the last good copy.
let products = readJson(PRODUCTS_FILE);

watchFile(dataPath(PRODUCTS_FILE), { interval: 1000 }, (curr, prev) => {
  if (curr.mtimeMs === prev.mtimeMs) return;
  try {
    products = readJson(PRODUCTS_FILE);
    console.log(`Reloaded ${PRODUCTS_FILE} (${products.length} products)`);
  } catch (err) {
    console.error(`Could not reload ${PRODUCTS_FILE}, keeping the previous version: ${err.message}`);
  }
});

// A collection filter such as "Boys" matches the product's collection or its gender.
export function findProducts({ q, collection, gender, category, featured } = {}) {
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

export function findProduct(idOrSlug) {
  return products.find((product) => product.slug === idOrSlug || product.id === idOrSlug) ?? null;
}

// Other products in the same category.
export function findRelatedProducts(product) {
  return products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, RELATED_COUNT);
}

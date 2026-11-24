// Adds the new sizes and the "About this product" details to the catalogue, in Supabase
// and in src/data/products.backup.json. Safe to run again: sizes are de-duplicated and
// sorted, and details are overwritten with the same text, so a second run changes nothing.
//
//   npm run update:catalog
//
// Needs the products.details column (supabase/migrations/002_product_details.sql).
import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const BACKUP_FILE = here('../src/data/products.backup.json');
const DETAILS = JSON.parse(readFileSync(here('./data/product-details.json'), 'utf8'));

const SIZE_ORDER = [
  '18-24 months', '2-3 yrs', '3-4 yrs', '4-5 yrs', '5-6 yrs',
  '6-7 yrs', '7-8 yrs', '8-9 yrs', '9-10 yrs', '10-11 yrs',
];

// Sizes to add, by product id (with the exact name as a fallback if the id is not found).
const SIZE_ADDITIONS = [
  { id: 'hrr-london', name: 'London T-shirt & Jeans Set', add: ['18-24 months'] },
  { id: 'hrr-blue-style', name: 'Blue Style Calf-Length Dress', add: ['8-9 yrs', '9-10 yrs'] },
  { id: 'ftc-pink-midi', name: 'Pink Gingham Sleeveless Midi Dress', add: ['8-9 yrs', '9-10 yrs'] },
];
const UNISEX_ADD = ['8-9 yrs', '9-10 yrs'];

const { SUPABASE_SECRET_KEY } = process.env;
const SUPABASE_URL = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : '';
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in backend/.env');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

const fail = (step, error) => {
  console.error(`${step} failed: ${error.message ?? error}`);
  process.exit(1);
};

const unknownSpellings = new Set();

// Adds the new sizes, removes duplicates and sorts by SIZE_ORDER. Sizes not in SIZE_ORDER
// keep their spelling and go after the known ones, in their original order.
function mergeSizes(current, additions) {
  const unique = [...new Set([...(current ?? []), ...additions])];
  for (const size of unique) if (!SIZE_ORDER.includes(size)) unknownSpellings.add(size);
  const rank = (size) => (SIZE_ORDER.includes(size) ? SIZE_ORDER.indexOf(size) : SIZE_ORDER.length);
  return unique
    .map((size, i) => ({ size, i }))
    .sort((a, b) => rank(a.size) - rank(b.size) || a.i - b.i)
    .map(({ size }) => size);
}

const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// ---------- Resolve the target products in Supabase ----------
const { data: products, error: productsError } = await supabase
  .from('products')
  .select('id, name, gender, details, product_colors(id, name, sizes, sort_order)');
if (productsError) fail('Loading products', productsError);

const byId = new Map(products.map((p) => [p.id, p]));
const idMismatches = [];

function resolve(id, name) {
  if (byId.has(id)) return byId.get(id);
  const match = name ? products.find((p) => p.name === name) : null;
  if (match) idMismatches.push(`${id} -> found by name as "${match.id}"`);
  else idMismatches.push(`${id} -> not found${name ? ` (no product named "${name}")` : ''}`);
  return match ?? null;
}

// Product id (as stored) -> sizes to add.
const sizePlan = new Map();
for (const { id, name, add } of SIZE_ADDITIONS) {
  const product = resolve(id, name);
  if (product) sizePlan.set(product.id, [...(sizePlan.get(product.id) ?? []), ...add]);
}
const unisex = products.filter((p) => p.gender === 'Unisex');
for (const product of unisex) sizePlan.set(product.id, [...(sizePlan.get(product.id) ?? []), ...UNISEX_ADD]);

// ---------- Part A: sizes ----------
console.log('\nSizes');
console.log('-----');
const sizeResults = new Map(); // `${productId}|${colorName}` -> new sizes, reused for the backup file
for (const [productId, additions] of sizePlan) {
  const product = byId.get(productId);
  const colors = [...(product.product_colors ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  if (colors.length === 0) console.log(`${product.name}: no colours found, nothing to update`);
  for (const color of colors) {
    const before = color.sizes ?? [];
    const after = mergeSizes(before, additions);
    sizeResults.set(`${productId}|${color.name}`, after);
    const label = `${product.name} / ${color.name}`;
    if (same(before, after)) {
      console.log(`${label}: already up to date\n  ${after.join(', ')}`);
      continue;
    }
    const { error } = await supabase.from('product_colors').update({ sizes: after }).eq('id', color.id);
    if (error) fail(`Updating sizes for ${label}`, error);
    console.log(`${label}\n  before: ${before.join(', ')}\n  after:  ${after.join(', ')}`);
  }
}

// ---------- Part B: details ----------
console.log('\nDetails');
console.log('-------');
const detailsWritten = [];
const detailsByStoredId = new Map();
for (const [id, details] of Object.entries(DETAILS)) {
  const product = resolve(id, null);
  if (!product) continue;
  detailsByStoredId.set(product.id, details);
  const unchanged = JSON.stringify(product.details) === JSON.stringify(details);
  if (!unchanged) {
    const { error } = await supabase.from('products').update({ details }).eq('id', product.id);
    if (error) fail(`Writing details for ${product.name}`, error);
  }
  detailsWritten.push(`${product.name} (${product.id})${unchanged ? ', already up to date' : ''}`);
}
for (const line of detailsWritten) console.log(`  ${line}`);
console.log(`${detailsWritten.length} of ${Object.keys(DETAILS).length} products have details.`);

// ---------- Backup file ----------
// Same sizes and details as Supabase, so the backup matches.
const backup = JSON.parse(readFileSync(BACKUP_FILE, 'utf8'));
for (const product of backup) {
  for (const color of product.colors ?? []) {
    const sizes = sizeResults.get(`${product.id}|${color.name}`);
    if (sizes) color.sizes = sizes;
  }
  const details = detailsByStoredId.get(product.id);
  if (details) product.details = details;
}
const original = readFileSync(BACKUP_FILE, 'utf8');
const updated = `${JSON.stringify(backup, null, 2)}\n`;
if (updated !== original) writeFileSync(BACKUP_FILE, updated);
console.log(`\nBackup file: ${updated === original ? 'already up to date' : 'updated'} (src/data/products.backup.json)`);

// ---------- Notes ----------
console.log('\nNotes');
console.log('-----');
console.log(`Unisex products: ${unisex.map((p) => p.name).join('; ') || 'none found'}`);
console.log(idMismatches.length ? `Ids that differ:\n  ${idMismatches.join('\n  ')}` : 'All ids matched.');
console.log(
  unknownSpellings.size
    ? `Sizes spelled differently (kept as-is): ${[...unknownSpellings].join(', ')}`
    : 'No sizes with different spellings.'
);

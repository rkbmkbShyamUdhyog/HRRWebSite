// Copies the product catalogue (products.json) into Supabase and uploads its photos
// to the public "products" Storage bucket. Safe to run again: everything is upserted.
//
//   npm run seed
import 'dotenv/config';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'products';
const PATH_PREFIX = '/assets/pics/';
const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const PICS_DIR = here('../../frontend/src/assets/pics');
const DATA_FILES = [here('../src/data/products.json'), here('../src/data/products.backup.json')];

const CONTENT_TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

const { SUPABASE_SECRET_KEY } = process.env;
// Accept a URL copied with a path (e.g. .../rest/v1/); the client needs only the project origin.
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

const publicUrl = (fileName) =>
  `${SUPABASE_URL.replace(/\/+$/, '')}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(fileName)}`;

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) fail('Listing buckets', error);
  const existing = buckets.find((b) => b.name === BUCKET);
  if (!existing) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (createError) fail('Creating bucket', createError);
    console.log(`Created public bucket "${BUCKET}"`);
  } else if (!existing.public) {
    const { error: updateError } = await supabase.storage.updateBucket(BUCKET, { public: true });
    if (updateError) fail('Making bucket public', updateError);
    console.log(`Made bucket "${BUCKET}" public`);
  }
}

async function main() {
  const dataFile = DATA_FILES.find(existsSync);
  if (!dataFile) fail('Reading products', 'neither products.json nor products.backup.json found');
  const products = JSON.parse(readFileSync(dataFile, 'utf-8'));

  // Map lower-cased file names to the real names on disk, so a path whose case differs still matches.
  const onDisk = new Map(readdirSync(PICS_DIR).map((name) => [name.toLowerCase(), name]));

  const referenced = new Set();
  for (const product of products) {
    for (const color of product.colors ?? []) for (const img of color.images ?? []) referenced.add(img);
  }

  await ensureBucket();

  const urlFor = new Map(); // original path -> Supabase public URL
  const missing = [];
  let uploaded = 0;

  for (const path of referenced) {
    if (!path.startsWith(PATH_PREFIX)) continue; // already a full URL
    const wanted = decodeURIComponent(path.slice(PATH_PREFIX.length));
    const fileName = onDisk.get(wanted.toLowerCase());
    if (!fileName) {
      missing.push(path);
      continue;
    }
    const contentType = CONTENT_TYPES[extname(fileName).toLowerCase()] ?? 'application/octet-stream';
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, readFileSync(join(PICS_DIR, fileName)), { upsert: true, contentType });
    if (error) fail(`Uploading "${fileName}"`, error);
    uploaded++;
    urlFor.set(path, publicUrl(fileName));
  }

  const productRows = products.map((p, i) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand ?? null,
    collection: p.collection ?? null,
    gender: p.gender ?? null,
    category: p.category ?? null,
    price: p.price ?? null,
    mrp: p.mrp ?? null,
    description: p.description ?? null,
    featured: p.featured ?? false,
    image_fit: p.imageFit ?? null,
    is_active: true,
    sort_order: i,
  }));

  const colorRows = products.flatMap((p) =>
    (p.colors ?? []).map((c, i) => ({
      product_id: p.id,
      name: c.name,
      hex: c.hex ?? null,
      images: (c.images ?? []).map((img) => urlFor.get(img) ?? img),
      sizes: c.sizes ?? [],
      amazon_url: c.amazonUrl ?? '',
      sort_order: i,
    }))
  );

  const { error: productError } = await supabase.from('products').upsert(productRows, { onConflict: 'id' });
  if (productError) fail('Saving products', productError);

  const { error: colorError } = await supabase
    .from('product_colors')
    .upsert(colorRows, { onConflict: 'product_id,name' });
  if (colorError) fail('Saving colours', colorError);

  console.log('\nSeed summary');
  console.log(`  Source:          ${dataFile}`);
  console.log(`  Products:        ${productRows.length}`);
  console.log(`  Colours:         ${colorRows.length}`);
  console.log(`  Images uploaded: ${uploaded} of ${referenced.size} referenced`);
  if (missing.length) {
    console.log(`  Missing images (${missing.length}) - not found in ${PICS_DIR}:`);
    for (const m of missing) console.log(`    ${m}`);
  } else {
    console.log('  Missing images:  none');
  }
}

main().catch((err) => fail('Seed', err));

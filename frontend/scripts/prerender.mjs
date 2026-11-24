// Turns the single-page app into real HTML pages after `vite build`, so search engines and AI
// tools (most of which don't run JavaScript) can read every page and product.
//
// For each route it writes dist/<route>/index.html with the page's text already rendered, its own
// <title>, description, canonical link, social-preview tags and schema.org JSON-LD. It also writes
// sitemap.xml, robots.txt and llms.txt (a plain-text guide to the site for AI agents).
//
// Product data comes from the live API (VITE_API_URL), falling back to the backend's backup JSON.
// The site's public address comes from SITE_URL, or Vercel's VERCEL_PROJECT_PRODUCTION_URL.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(root, 'dist');
const SSR_DIR = join(root, 'dist-ssr');
const BACKUP_DIR = join(root, '../backend/src/data');

const env = { ...loadEnv('production', root, ''), ...process.env };
const API = (env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const productionHost = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL || '';
const SITE = (env.SITE_URL || (productionHost ? `https://${productionHost}` : '')).trim().replace(/\/+$/, '');

const BRAND = 'HRR';
const DEFAULT_TITLE = 'HRR — Happy dresses for little adventures';
const DEFAULT_DESCRIPTION =
  'HRR makes happy, comfy kidswear for ages 18 months to 10 years: T-shirt and jeans sets, party sets, dresses and unisex packs, designed in Kolkata and sold on Amazon India.';

// ---------- Data ----------
async function fetchJson(path) {
  const res = await fetch(`${API}/api${path}`, { signal: AbortSignal.timeout(90_000) });
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return res.json();
}

const readBackup = (file) => JSON.parse(readFileSync(join(BACKUP_DIR, file), 'utf8'));

async function loadCatalogue() {
  if (API) {
    try {
      const [products, categories] = await Promise.all([fetchJson('/products'), fetchJson('/categories')]);
      console.log(`prerender: loaded ${products.length} products from ${API}`);
      return { products, categories };
    } catch (err) {
      console.warn(`prerender: could not reach the API (${err.message}); using the backup files.`);
    }
  }
  try {
    const products = readBackup('products.backup.json');
    const categories = readBackup('categories.json');
    console.log(`prerender: loaded ${products.length} products from backend/src/data`);
    return { products, categories };
  } catch {
    console.warn('prerender: no product data available; pages are rendered without products.');
    return { products: [], categories: [] };
  }
}

// ---------- Helpers ----------
const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// JSON safe to drop inside a <script> tag.
const LINE_SEPARATORS = new RegExp(String.fromCharCode(91, 0x2028, 0x2029, 93), 'g');
const scriptJson = (value) => JSON.stringify(value).replace(/</g, String.fromCharCode(92) + 'u003c').replace(LINE_SEPARATORS, '');

const abs = (path) => (SITE ? `${SITE}${path}` : path);
const clip = (text, max = 160) => {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};
const rupees = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const allSizes = (p) => [...new Set((p.colors ?? []).flatMap((c) => c.sizes ?? []))];

const SITE_INFO = (() => {
  const src = readFileSync(join(root, 'src/data/site.js'), 'utf8');
  const list = (key) => [...(src.match(new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`))?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
  return { emails: list('emails'), phones: list('phones'), addresses: list('addresses') };
})();

function organizationLd() {
  return {
    '@type': 'Organization',
    '@id': abs('/#organization'),
    name: BRAND,
    url: abs('/'),
    description: DEFAULT_DESCRIPTION,
    email: SITE_INFO.emails[0],
    telephone: SITE_INFO.phones[0],
    address: SITE_INFO.addresses.map((a) => ({ '@type': 'PostalAddress', streetAddress: a, addressCountry: 'IN' })),
  };
}

function breadcrumbLd(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: abs(item.path) })),
  };
}

function productLd(p, path) {
  const images = [...new Set((p.colors ?? []).flatMap((c) => c.images ?? []))].filter((u) => /^https?:/.test(u));
  const buyable = (p.colors ?? []).some((c) => c.amazonUrl);
  const ld = {
    '@type': 'Product',
    name: p.name,
    sku: p.id,
    url: abs(path),
    description: p.details?.intro || p.description,
    brand: { '@type': 'Brand', name: p.brand || BRAND },
    category: p.category,
    audience: { '@type': 'PeopleAudience', suggestedGender: p.gender },
    color: (p.colors ?? []).map((c) => c.name).join(', '),
    size: allSizes(p),
  };
  if (images.length) ld.image = images;
  if (p.price != null) {
    ld.offers = {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: 'INR',
      availability: buyable ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      url: (p.colors ?? []).find((c) => c.amazonUrl)?.amazonUrl || abs(path),
    };
  }
  return ld;
}

// ---------- Routes ----------
function buildRoutes({ products, categories }) {
  const crumbsHome = { name: BRAND, path: '/' };
  const page = (path, title, description, extraLd = []) => ({
    path,
    title: title ? `${title} — ${BRAND}` : DEFAULT_TITLE,
    description: clip(description || DEFAULT_DESCRIPTION),
    ld: [...extraLd, ...(title ? [breadcrumbLd([crumbsHome, { name: title, path }])] : [])],
  });

  const productList = {
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/product/${p.slug}`), name: p.name })),
  };

  const routes = [
    page('/', '', DEFAULT_DESCRIPTION, [{ '@type': 'WebSite', name: BRAND, url: abs('/'), publisher: { '@id': abs('/#organization') } }, productList]),
    page('/about', 'About', 'The HRR story: kidswear designed in Kolkata and made in Howrah, West Bengal, for children from 18 months to 10 years.'),
    page('/process', 'Our Process', 'How HRR designs, makes and checks every outfit, from fabric to finished set.'),
    page('/news', 'News', 'News, size guides and care tips from HRR.'),
    page('/contact', 'Contact Us', `Contact HRR by email (${SITE_INFO.emails.join(', ')}) or phone (${SITE_INFO.phones.join(', ')}). ${SITE_INFO.addresses[0] ?? ''}`),
    page('/collections', 'Our Products', `All HRR products: ${products.map((p) => p.name).join(', ')}.`, [productList]),
    { ...page('/shop', 'Our Products', `All HRR products: ${products.map((p) => p.name).join(', ')}.`, [productList]), canonical: '/collections' },
    page('/privacy', 'Privacy Policy', 'How the HRR website handles your personal information.'),
    page('/terms', 'Terms & Conditions', 'Terms and conditions for using the HRR website.'),
  ];

  for (const c of categories) {
    const items = products.filter((p) => p.gender === c.name || p.collection === c.name);
    routes.push(
      page(`/collections/${c.slug}`, c.name, `${c.description} ${items.length ? `Includes ${items.map((p) => p.name).join(', ')}.` : ''}`, [
        { '@type': 'ItemList', itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/product/${p.slug}`), name: p.name })) },
      ])
    );
  }

  for (const p of products) {
    const path = `/product/${p.slug}`;
    const price = p.price != null ? ` ${rupees(p.price)}${p.mrp > p.price ? ` (MRP ${rupees(p.mrp)})` : ''}.` : '';
    const sizes = allSizes(p);
    routes.push({
      path,
      title: `${p.name} — ${BRAND}`,
      description: clip(`${p.details?.intro || p.description}${price} Sizes ${sizes[0] ?? ''} to ${sizes.at(-1) ?? ''}.`),
      image: p.colors?.[0]?.images?.[0],
      type: 'product',
      ld: [
        productLd(p, path),
        breadcrumbLd([crumbsHome, { name: 'Our Products', path: '/collections' }, { name: p.name, path }]),
      ],
    });
  }
  return routes;
}

// ---------- HTML ----------
function headTags(route) {
  const canonical = abs(route.canonical ?? route.path);
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(), ...route.ld] };
  return [
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    SITE && `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:site_name" content="${BRAND}" />`,
    `<meta property="og:type" content="${route.type === 'product' ? 'product' : 'website'}" />`,
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    SITE && `<meta property="og:url" content="${esc(canonical)}" />`,
    route.image && `<meta property="og:image" content="${esc(route.image)}" />`,
    `<meta name="twitter:card" content="${route.image ? 'summary_large_image' : 'summary'}" />`,
    `<link rel="alternate" type="text/plain" title="Site guide for AI tools" href="/llms.txt" />`,
    `<script type="application/ld+json">${scriptJson(ld)}</script>`,
  ]
    .filter(Boolean)
    .join('\n    ');
}

function writePage(template, route, appHtml, seed) {
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(route.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(route.description)}" />`)
    .replace('</head>', `    ${headTags(route)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>\n    <script>window.__HRR_SEED__=${scriptJson(seed)}</script>`);
  // Written as both about.html and about/index.html: Vercel's cleanUrls serves /about from about.html,
  // and the folder form covers /about/ and other static hosts.
  const files =
    route.path === '/'
      ? [join(DIST, 'index.html')]
      : [join(DIST, `${route.path.slice(1)}.html`), join(DIST, route.path.slice(1), 'index.html')];
  for (const file of files) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
  }
}

function writeSitemap(routes) {
  if (!SITE) {
    console.warn('prerender: no SITE_URL or VERCEL_PROJECT_PRODUCTION_URL, so sitemap.xml is skipped.');
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .filter((r) => !r.canonical)
    .map((r) => `  <url><loc>${esc(abs(r.path))}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n');
  writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
}

function writeRobots() {
  // Everyone may crawl, including AI crawlers (named so their operators see an explicit allow).
  const aiBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bytespider', 'meta-externalagent', 'Amazonbot', 'DuckAssistBot', 'cohere-ai'];
  const lines = ['User-agent: *', 'Allow: /', '', ...aiBots.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', ''])];
  if (SITE) lines.push(`Sitemap: ${SITE}/sitemap.xml`);
  writeFileSync(join(DIST, 'robots.txt'), `${lines.join('\n')}\n`);
}

function writeLlmsTxt({ products, categories }) {
  const out = [
    `# ${BRAND}`,
    '',
    `> ${DEFAULT_DESCRIPTION}`,
    '',
    'HRR is a kidswear brand from Howrah and Kolkata, West Bengal, India. Products are sold on Amazon India; each product page links to its Amazon listing. Sizes go by age.',
    '',
    '## Pages',
    '',
    `- [Home](${abs('/')}): brand overview and featured products`,
    `- [All products](${abs('/collections')}): every product, searchable by name, category or colour`,
    ...categories.map((c) => `- [${c.name}](${abs(`/collections/${c.slug}`)}): ${c.description}`),
    `- [About](${abs('/about')}): the HRR story`,
    `- [Our Process](${abs('/process')}): how outfits are designed and made`,
    `- [News](${abs('/news')}): updates, size and care tips`,
    `- [Contact](${abs('/contact')}): email, phone and addresses`,
    '',
    '## Products',
    '',
  ];
  for (const p of products) {
    out.push(`### [${p.name}](${abs(`/product/${p.slug}`)})`, '');
    out.push(`- For: ${p.gender}; category: ${p.category}`);
    if (p.price != null) out.push(`- Price: ${rupees(p.price)}${p.mrp > p.price ? ` (MRP ${rupees(p.mrp)})` : ''}`);
    for (const c of p.colors ?? []) {
      out.push(`- Colour ${c.name}: sizes ${(c.sizes ?? []).join(', ') || 'not listed'}${c.amazonUrl ? `; buy: ${c.amazonUrl}` : '; coming soon'}`);
    }
    out.push('', p.details?.intro || p.description || '', '');
    if (p.details?.highlights?.length) out.push(...p.details.highlights.map((h) => `- ${h}`), '');
    if (p.details?.sizeNote) out.push(`Size & fit: ${p.details.sizeNote}`, '');
  }
  out.push(
    '## Contact',
    '',
    ...SITE_INFO.emails.map((e) => `- Email: ${e}`),
    ...SITE_INFO.phones.map((t) => `- Phone: ${t}`),
    ...SITE_INFO.addresses.map((a) => `- Address: ${a}`),
    ''
  );
  writeFileSync(join(DIST, 'llms.txt'), out.join('\n'));
}

// ---------- Run ----------
const template = readFileSync(join(DIST, 'index.html'), 'utf8');
const { render } = await import(pathToFileURL(join(SSR_DIR, 'entry-server.js')).href);
const catalogue = await loadCatalogue();
const seed = { products: catalogue.products, categories: catalogue.categories };
const routes = buildRoutes(catalogue);

for (const route of routes) writePage(template, route, render(route.path, seed), seed);
writeSitemap(routes);
writeRobots();
writeLlmsTxt(catalogue);
if (existsSync(SSR_DIR)) rmSync(SSR_DIR, { recursive: true, force: true });

console.log(`prerender: wrote ${routes.length} pages${SITE ? ` for ${SITE}` : ''}, robots.txt, llms.txt${SITE ? ', sitemap.xml' : ''}.`);

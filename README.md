# HRR — Brand Website

A brand site for **HRR**, a kidswear label for little ones from 18 months to 8 years. Visitors browse collections and products here. HRR does not sell on the site, so there is no cart, checkout, payment or login. Products and their photos are stored in Supabase. Each product page has a **Buy** button that opens the selected colour's Amazon listing in a new tab.

```
├── frontend/   Vite + React + React Router, plain CSS
└── backend/    Node.js + Express API, products from Supabase
```

## Requirements

- Node.js 18 or newer (20+ recommended)

## Running locally

Use two terminals, one for each app.

**1. Backend** (API on http://localhost:5000)

```bash
cd backend
npm install
cp .env.example .env    # then fill in SUPABASE_URL and SUPABASE_SECRET_KEY
npm run dev
```

**2. Frontend** (site on http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server forwards every `/api` request to the backend on port 5000, so start the backend first.

### Production build

```bash
cd frontend
npm run build      # outputs to frontend/dist
npm run preview    # serves the build locally (preview does not proxy /api)
```

When deploying, serve `frontend/dist` and route `/api` to the backend (`npm start` in `backend/`). All unknown paths must fall back to `index.html` so links like `/product/twirl-floral-frock` work.

## Pages

| Path | Page |
| --- | --- |
| `/` | Home: hero, stats, brand story, collections, featured products, Why HRR, testimonials, news, call to action |
| `/collections` | All products, with search and a filter by collection |
| `/collections/:collection` | One collection (`girls`, `boys`, `unisex`), filterable by sub-category (`?category=`) |
| `/product/:slug` | Product detail with gallery, colours, sizes, Buy button and related products |
| `/about`, `/process`, `/news`, `/contact` | Placeholder content pages |
| `/privacy`, `/terms` | Placeholder legal pages |

The header's **Our Products** mega-menu and the mobile accordion menu are both built from `categories.json`. The search icon opens a search bar that leads to `/collections?q=…`.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/categories` | Collections with their sub-categories |
| GET | `/api/products` | All products. Optional filters, all case-insensitive and combinable: `?collection=` (matches the product's `collection` or `gender`), `?category=`, `?featured=true`, `?q=` (matches name, collection, gender, category or colour name) |
| GET | `/api/products/:idOrSlug` | `{ product, related }`, where `related` holds up to 4 other products in the same category, or `404 { "error": "Product not found" }` |

Example: `/api/products?collection=Boys&q=pink`

## Editing content

Products and their photos live in **Supabase**: the `products` and `product_colors` tables, and the public `products` Storage bucket. The backend reads them with the secret key from `backend/.env` and keeps the list in memory for 60 seconds, so changes show up on the site within about a minute, with no restart or redeploy. `categories.json` is still a file and is read on every request.

`backend/src/data/products.backup.json` is a backup of the catalogue as it was before the move to Supabase. The site no longer reads it. The tables were created with `backend/supabase/schema.sql`.

### Adding or editing products in Supabase

1. **Upload the photos.** Go to Supabase → **Storage** → bucket **products** → **Upload file** (`.jpg`, `.jpeg`, `.png` or `.webp`). Click a file → **Get URL** to copy its public link.
2. **Add or edit the product.** Go to **Table Editor** → **products**. Click **Insert → Insert row**, or click a cell to edit it. Fill in a unique `id` and `slug`, plus `name`, `gender`, `category`, `price`, `mrp` and the other fields (see the table below). Use `sort_order` to choose where the product appears; lower numbers come first.
3. **Add its colours.** Go to **Table Editor** → **product_colors** → **Insert row**. Set `product_id` to the product's `id`, then fill in `name`, `hex`, and:
   - `images`: paste the photo URLs from step 1. The first photo is the main image.
   - `sizes`: list the sizes, e.g. `18-24 months`, `2-3 yrs` … `7-8 yrs`, youngest first.
   - `amazon_url`: paste the Amazon link for that colour, or leave it empty to show "Coming soon".
   - `sort_order`: the colour's position; `0` is the first swatch.
4. **Wait about a minute and refresh the site.**

To hide a product without deleting it, set `is_active` to `false`. Deleting a product also deletes its colours.

To copy the backup file into Supabase again (for example into a new project), run `npm run seed` in `backend/`. It uploads the photos from `frontend/src/assets/pics/`, upserts every product and colour, and is safe to run more than once.

### Product fields

| Column | Notes |
| --- | --- |
| `id` | Unique internal ID. `/api/products/<id>` also works |
| `slug` | Unique and URL-safe (lowercase words joined by hyphens). Used in the product link: `/product/<slug>` |
| `brand` | Brand name |
| `collection` | Product line, e.g. `Kids` |
| `gender` | Must match a collection `name` in `categories.json` (`Girls`, `Boys` or `Unisex`). The collection pages, the "Shop for" filter and the product page breadcrumb use it |
| `category` | Should match one of that collection's `subcategories`, so the mega-menu links find it. Related products are other products in the same category |
| `price` / `mrp` | Whole rupees. The discount % is calculated from these. Set `mrp` equal to `price` to hide the discount. Leave `price` empty to show "See price on Amazon" |
| `featured` | `true` to show the product in the Home page's Featured products row (the first 4 are shown) |
| `image_fit` | `contain` shows whole photos uncropped (used for the wide unisex group shots). Leave empty to fill the frame |
| `is_active` | `false` hides the product from the site |
| `sort_order` | Display order, lowest first |

| `product_colors` column | Notes |
| --- | --- |
| `product_id` | The product's `id` |
| `name` / `hex` | Colour name and swatch colour. A product can't have two colours with the same name |
| `images` | Public photo URLs from the `products` bucket. The first is the main image and is used on product cards. If an image fails to load, the site shows a soft "HRR" tile instead |
| `sizes` | Sizes available in that colour, by age: `18-24 months`, `2-3 yrs` … `7-8 yrs`. Cards show the overall range (e.g. "18 months–8 yrs"), so keep the `<from>-<to> months` / `<from>-<to> yrs` format |
| `amazon_url` | The Amazon listing for that exact colour. The Buy button opens it in a new tab. Leave it empty for a disabled "Coming soon" button |
| `sort_order` | Swatch order, lowest first |

### Collections: `backend/src/data/categories.json`

Each collection has a `slug` (used in `/collections/<slug>`), `name`, `eyebrow`, `description`, `image` and a list of `subcategories`. These drive the mega-menu, the mobile menu, the footer, the Home page collection cards and the collection pages. A new collection's `slug` should be its `name` in lowercase.

### Other placeholder content (frontend)

| What | Where |
| --- | --- |
| Email, phone, address, hours and social links | `frontend/src/data/site.js` |
| News posts | `frontend/src/data/news.js` |
| Hero text and images | `frontend/src/components/home/Hero.jsx` |
| Stats strip numbers | `frontend/src/components/home/StatsStrip.jsx` |
| Why HRR points | `frontend/src/components/home/WhyHRR.jsx` |
| Testimonials | `frontend/src/components/home/Testimonials.jsx` |
| About, Our Process and legal page copy | `frontend/src/pages/` |

## Form emails

The **Contact Us** form and the footer **newsletter** sign-up are both emailed to **shyamudhyog@gmail.com** (change it with `CONTACT_TO` in `backend/.env`). Contact emails have the visitor set as reply-to, so you can just press Reply.

Sending needs a Gmail account to send from. In `backend/.env`:

1. Set `SMTP_USER` to the Gmail address that will send the emails (it can be shyamudhyog@gmail.com itself).
2. On that account, turn on 2-Step Verification, then create an App Password at https://myaccount.google.com/apppasswords.
3. Paste the 16-character App Password into `SMTP_PASS`, without spaces, and restart the backend.

Until these are set, both forms show a "not available right now" message and nothing is sent.

> **Still to replace before launch:** the Home page stats (`StatsStrip.jsx`) and the testimonials (`Testimonials.jsx`) are placeholders. Put in HRR's real numbers and real customer reviews. The rest of the copy describes HRR's actual range, but check it reads true for your business.

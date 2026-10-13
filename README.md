# HRR — Brand Website

A brand site for **HRR**, a kidswear label for little ones from 18 months to 8 years. Visitors browse collections and products here. HRR does not sell on the site, so there is no cart, checkout, payment, login or database. Each product page has a **Buy** button that opens the selected colour's Amazon listing in a new tab.

```
├── frontend/   Vite + React + React Router, plain CSS
└── backend/    Node.js + Express API, data served from JSON files
```

## Requirements

- Node.js 18 or newer (20+ recommended)

## Running locally

Use two terminals, one for each app.

**1. Backend** (API on http://localhost:5000)

```bash
cd backend
npm install
cp .env.example .env    # optional: sets PORT=5000 (the default)
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

The backend reads `products.json` once at startup and reloads it whenever the file changes on disk, so product edits appear after you save and refresh the browser. If a save leaves the file as invalid JSON, the server keeps the last good version and logs an error. `categories.json` is read on every request. You don't need to restart the server. Keep the files valid JSON: double quotes, and no trailing commas.

### Products: `backend/src/data/products.json`

```json
{
  "id": "hrr-force",
  "slug": "force-tshirt-jeans-set",
  "name": "Force T-shirt & Jeans Set",
  "brand": "HRR",
  "collection": "Kids",
  "gender": "Boys",
  "category": "T-shirt & Jeans Sets",
  "price": 469,
  "mrp": 999,
  "description": "Short product description.",
  "featured": true,
  "colors": [
    {
      "name": "Beige",
      "hex": "#E1D0AA",
      "images": [
        "/assets/pics/force beige main.jpg",
        "/assets/pics/force beige side.jpg",
        "/assets/pics/force beige baclk.jpg"
      ],
      "sizes": ["18-24 months", "2-3 yrs", "3-4 yrs", "5-6 yrs", "6-7 yrs", "7-8 yrs"],
      "amazonUrl": ""
    }
  ]
}
```

| Field | Notes |
| --- | --- |
| `id` | Unique internal ID. `/api/products/<id>` also works |
| `slug` | Unique and URL-safe (lowercase words joined by hyphens). Used in the product link: `/product/<slug>` |
| `brand` | Brand name |
| `collection` | Product line, e.g. `Kids` |
| `gender` | Must match a collection `name` in `categories.json` (`Girls`, `Boys` or `Unisex`). The collection pages, the "Shop for" filter and the product page breadcrumb use it |
| `category` | Should match one of that collection's `subcategories`, so the mega-menu links find it. Related products are other products in the same category |
| `price` / `mrp` | Whole rupees. The discount % is calculated from these. Set `mrp` equal to `price` to hide the discount |
| `featured` | `true` to show the product in the Home page's Featured products row (the first 4 are shown) |
| `colors` | One entry per colour. The first colour and its first image are used on product cards |
| `colors[].hex` | Swatch colour |
| `colors[].images` | That colour's photos in `frontend/src/assets/pics/`, written as `/assets/pics/<file name>` (e.g. `/assets/pics/force beige main.jpg`). The file name must match exactly, apart from upper/lower case. The first is the main image and all of them appear as thumbnails. If an image fails to load, the site shows a soft "HRR" tile instead |
| `colors[].sizes` | Sizes available in that colour, by age: `"18-24 months"`, `"2-3 yrs"`, `"3-4 yrs"` … `"7-8 yrs"`, youngest first. The product page lists the selected colour's sizes, and cards show the overall range (e.g. "18 months–8 yrs"), so keep the `<from>-<to> months` / `<from>-<to> yrs` format |
| `colors[].amazonUrl` | The Amazon listing for that exact colour. The Buy button opens it in a new tab when that colour is selected. Leave it `""` to show a disabled "Coming soon" button |

### Adding a product

1. Put the photos in `frontend/src/assets/pics/` (`.jpg`, `.jpeg`, `.png` or `.webp`).
2. Add an entry to `backend/src/data/products.json` in the same shape as the existing ones, with a new unique `id` and `slug`. Reference each photo as `/assets/pics/<file name>`.
3. Paste the Amazon link for each colour into that colour's `amazonUrl` (for example `https://www.amazon.in/dp/B0XXXXXXX`).
4. Save the file and refresh the site. New photo files are bundled by Vite, so on a live site run `npm run build` in `frontend/` and redeploy.

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

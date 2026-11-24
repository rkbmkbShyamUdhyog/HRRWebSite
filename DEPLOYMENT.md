# Deploying HRR

The frontend runs on **Vercel**, and the backend (API) runs on **Render**'s free plan. Deploy the backend first, because the frontend needs its URL.

## Before you start

- Push the repo to GitHub.
- Have your Supabase project URL and secret key ready (Supabase → Project Settings → API Keys).
- Create a free account at https://resend.com and an API key at https://resend.com/api-keys (it starts with `re_`).
  Render's free plan blocks email over SMTP, so the backend sends form emails through Resend instead.
  With the default sender `onboarding@resend.dev`, Resend only delivers to **the email address you signed up to Resend with**. Use that address as `CONTACT_TO`. To send to any other address, verify your own domain in Resend → Domains, then set `EMAIL_FROM` to an address on that domain.

## 1. Backend on Render

1. https://dashboard.render.com → **New** → **Web Service** → connect your GitHub account and pick this repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
3. Under **Environment Variables**, add:

   | Key | Value |
   | --- | --- |
   | `SUPABASE_URL` | `https://<project>.supabase.co` |
   | `SUPABASE_SECRET_KEY` | your `sb_secret_...` key |
   | `EMAIL_PROVIDER` | `resend` |
   | `RESEND_API_KEY` | your `re_...` key |
   | `CONTACT_TO` | the email that receives form messages (see the Resend note above) |
   | `FRONTEND_URL` | `http://localhost:5173` for now; you'll change it in step 3 |
   | `EMAIL_FROM` | optional; only after verifying a domain in Resend, e.g. `HRR Website <hello@yourdomain.com>` |
   | `REPORT_SECRET` | a long random password for the daily visitor email (see step 4) |

   Don't add `PORT`, because Render sets it. You don't need `SMTP_*` on Render either.
4. Click **Create Web Service** and wait for "Live".
5. Test it: open `https://<your-backend>.onrender.com/api/health` in the browser. You should see `{"ok":true}`.
   `https://<your-backend>.onrender.com/api/products` should list the products.

## 2. Frontend on Vercel

1. https://vercel.com/new → **Add New… → Project** → import this repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Under **Environment Variables**, add `VITE_API_URL` = `https://<your-backend>.onrender.com`, with **no trailing slash**.
4. Click **Deploy**. Note the site URL, e.g. `https://hrr.vercel.app`.

`VITE_API_URL` is built into the site, so if you ever change it, redeploy on Vercel (Deployments → ⋯ → Redeploy).

## 3. Connect them

1. Render → your service → **Environment** → set `FRONTEND_URL` to your Vercel URL, e.g.
   `https://hrr.vercel.app,http://localhost:5173` (comma-separated, no trailing slashes; add any custom domain too).
   To also allow Vercel's per-deployment preview links, add an entry with `*`, e.g.
   `https://hrr-web-site-*-shyam-udhyog.vercel.app`.
2. **Save, rebuild, and deploy** (or Manual Deploy → Deploy latest commit).
3. Open the Vercel site and check the products, a product page, and the contact form.

The backend rejects requests from any website not listed in `FRONTEND_URL`. If the site shows "couldn't load products", check that the Vercel URL in `FRONTEND_URL` matches exactly.

## 4. Daily visitor email

The site counts page views in the Supabase table `site_visits`, and every morning at 9:00 India time an email arrives at `CONTACT_TO` with yesterday's visitors and page views, the last 7 and 30 days, and the most viewed pages.

1. Supabase → **SQL Editor**: run `backend/supabase/schema.sql` again. This adds the `site_visits` table and the `visit_stats` function (safe to re-run).
2. Make a random password, e.g. run `node -e "console.log(crypto.randomUUID())"`.
3. Render → your service → **Environment** → add `REPORT_SECRET` with that password, then save and deploy.
4. GitHub → this repo → **Settings → Secrets and variables → Actions → New repository secret**, add:
   - `BACKEND_URL` = `https://<your-backend>.onrender.com` (no trailing slash)
   - `REPORT_SECRET` = the same password
5. Test it: GitHub → **Actions → Daily visit report → Run workflow**. An email should arrive within a couple of minutes.

The schedule is in `.github/workflows/daily-visit-report.yml` (`cron` is in UTC). GitHub can run scheduled jobs up to ~15–30 minutes late, and it pauses schedules in repos with no commits for 60 days; if that happens, click **Enable workflow** in the Actions tab.

A "visitor" is one browser (a random ID kept in localStorage, no personal data), so one person on two devices counts twice, and visits while developing locally are counted too.

## Future updates

`git push` to `main` redeploys both automatically: Vercel rebuilds the frontend and Render rebuilds the backend.
Product changes in Supabase don't need a deploy; they appear within about a minute.

## Good to know

- **Slow first load:** the Render free service sleeps after 15 minutes without traffic and takes up to about a minute to wake up. The first page load after a quiet period can be slow, and later loads are fast.
- **Locally nothing changes:** run `npm run dev` in `backend/` and `frontend/` as before. Leave `VITE_API_URL` unset locally, and the Vite proxy sends `/api` to `http://localhost:5000`. Locally, `EMAIL_PROVIDER` can stay empty (Gmail SMTP).

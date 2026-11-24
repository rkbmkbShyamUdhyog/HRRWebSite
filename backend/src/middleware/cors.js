import cors from 'cors';

// Allowed browser origins come from FRONTEND_URL (comma-separated), e.g.
//   FRONTEND_URL=https://hrr.vercel.app,http://localhost:5173
// An entry may contain * to match one part of a host name, which covers Vercel's preview links:
//   https://hrr-web-site-*-shyam-udhyog.vercel.app
// When it is not set, only the local Vite dev server is allowed.
const DEFAULT_ORIGINS = 'http://localhost:5173';

const escapeRegex = (text) => text.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

const allowedOrigins = (process.env.FRONTEND_URL || DEFAULT_ORIGINS)
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean)
  .map((origin) =>
    origin.includes('*')
      ? new RegExp('^' + origin.split('*').map(escapeRegex).join('[a-z0-9-]+') + '$', 'i')
      : origin
  );

const isAllowed = (origin) =>
  allowedOrigins.some((allowed) => (typeof allowed === 'string' ? allowed === origin : allowed.test(origin)));

const corsHandler = cors({ origin: allowedOrigins, methods: ['GET', 'POST'] });

export default function corsAllowList(req, res, next) {
  const origin = req.headers.origin;
  // No Origin header: same-origin requests, health checks and tools like curl.
  if (origin && !isAllowed(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  return corsHandler(req, res, next);
}

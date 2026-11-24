import cors from 'cors';

// Allowed browser origins come from FRONTEND_URL (comma-separated), e.g.
//   FRONTEND_URL=https://hrr.vercel.app,http://localhost:5173
// When it is not set, only the local Vite dev server is allowed.
const DEFAULT_ORIGINS = 'http://localhost:5173';

const allowedOrigins = (process.env.FRONTEND_URL || DEFAULT_ORIGINS)
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const corsHandler = cors({ origin: allowedOrigins, methods: ['GET', 'POST'] });

export default function corsAllowList(req, res, next) {
  const origin = req.headers.origin;
  // No Origin header: same-origin requests, health checks and tools like curl.
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  return corsHandler(req, res, next);
}

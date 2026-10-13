// Small in-memory rate limiter: at most `max` successful requests per IP in each `windowMs`.
// Rejected requests (e.g. a typo in the email) don't count, so real visitors aren't locked out.
// Resets when the server restarts, which is fine for a low-traffic contact form.
export default function rateLimit({ windowMs, max }) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    let entry = hits.get(req.ip);

    if (!entry || now - entry.start > windowMs) {
      entry = { start: now, count: 0 };
      hits.set(req.ip, entry);
    }
    if (entry.count >= max) {
      return res.status(429).json({ error: 'Too many messages. Please try again a little later.' });
    }

    res.on('finish', () => {
      if (res.statusCode < 400) entry.count += 1;
    });
    next();
  };
}

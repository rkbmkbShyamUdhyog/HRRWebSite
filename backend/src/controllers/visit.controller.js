import crypto from 'node:crypto';
import * as visitService from '../services/visit.service.js';
import * as mailService from '../services/mail.service.js';

const VISITOR_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

// POST /api/visits { visitorId, path } — sent by the site on every page view.
export async function recordVisit(req, res) {
  const visitorId = typeof req.body?.visitorId === 'string' ? req.body.visitorId : '';
  const rawPath = typeof req.body?.path === 'string' ? req.body.path : '';
  const path = rawPath.split(/[?#]/)[0].slice(0, 200);

  if (!VISITOR_ID_RE.test(visitorId) || !path.startsWith('/')) {
    return res.status(400).json({ error: 'Invalid visit' });
  }

  try {
    await visitService.recordVisit({ visitorId, path });
  } catch (err) {
    // Counting visits must never break the site, so just log it.
    console.error(`Visits: could not record visit: ${err.message}`);
  }
  res.status(204).end();
}

function secretMatches(given) {
  const expected = process.env.REPORT_SECRET || '';
  if (!expected || typeof given !== 'string') return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// POST /api/visits/report with header "Authorization: Bearer <REPORT_SECRET>".
// Called once a day by the GitHub Actions workflow in .github/workflows/daily-visit-report.yml.
export async function sendReport(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!secretMatches(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!mailService.isMailConfigured()) {
      return res.status(503).json({ error: 'Email is not configured' });
    }

    const report = await visitService.getDailyReport();
    await mailService.sendVisitReport(report);
    res.json({ ok: true, date: report.dateLabel, visitors: report.day.visitors, pageViews: report.day.page_views });
  } catch (err) {
    next(err);
  }
}

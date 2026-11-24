import * as mailService from '../services/mail.service.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UNAVAILABLE = 'Sign-up is not available right now. Please try again later.';

export async function subscribe(req, res, next) {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.replace(/[\r\n]+/g, ' ').trim() : '';
    if (!EMAIL_RE.test(email) || email.length > 200) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!mailService.isMailConfigured()) {
      console.error('Newsletter: email settings are missing (see EMAIL_PROVIDER in .env.example)');
      return res.status(503).json({ error: UNAVAILABLE });
    }

    try {
      await mailService.sendNewsletterSignup(email);
    } catch (err) {
      console.error(`Newsletter: could not send email: ${err.message}`);
      return res.status(503).json({ error: UNAVAILABLE });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

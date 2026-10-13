import * as mailService from '../services/mail.service.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(req, res, next) {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.replace(/[\r\n]+/g, ' ').trim() : '';
    if (!EMAIL_RE.test(email) || email.length > 200) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!mailService.isMailConfigured()) {
      console.error('Newsletter: SMTP settings are missing from .env');
      return res.status(503).json({ error: 'Sign-up is not available right now. Please try again later.' });
    }

    await mailService.sendNewsletterSignup(email);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

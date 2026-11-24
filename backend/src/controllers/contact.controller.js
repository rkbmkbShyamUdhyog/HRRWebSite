import * as mailService from '../services/mail.service.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,19}$/;
const UNAVAILABLE = 'The contact form is not available right now. Please email or call us.';

// Single-line fields: trim and drop line breaks so they can't spill into email headers.
const line = (value) => (typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ').trim() : '');

function validate(body) {
  const name = line(body.name);
  const email = line(body.email);
  const phone = line(body.phone);
  const text = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length > 100) return { error: 'Please enter your name.' };
  if (!EMAIL_RE.test(email) || email.length > 200) return { error: 'Please enter a valid email address.' };
  if (phone && !PHONE_RE.test(phone)) return { error: 'Please enter a valid phone number.' };
  if (text.length < 10) return { error: 'Please write a message of at least 10 characters.' };
  if (text.length > 5000) return { error: 'Please keep your message under 5000 characters.' };

  return { message: { name, email, phone, text } };
}

export async function sendMessage(req, res, next) {
  try {
    // Hidden "website" field: people never see it, so only bots fill it in. Pretend it worked.
    if (req.body?.website) {
      return res.json({ ok: true });
    }

    const { error, message } = validate(req.body ?? {});
    if (error) {
      return res.status(400).json({ error });
    }

    if (!mailService.isMailConfigured()) {
      console.error('Contact form: email settings are missing (see EMAIL_PROVIDER in .env.example)');
      return res.status(503).json({ error: UNAVAILABLE });
    }

    try {
      await mailService.sendContactMessage(message);
    } catch (err) {
      console.error(`Contact form: could not send email: ${err.message}`);
      return res.status(503).json({ error: UNAVAILABLE });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

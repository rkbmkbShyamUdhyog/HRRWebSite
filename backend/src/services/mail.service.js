import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Every form on the site is delivered here unless CONTACT_TO in .env says otherwise.
const DEFAULT_TO = 'shyamudhyog@gmail.com';
const DEFAULT_RESEND_FROM = 'HRR Website <onboarding@resend.dev>';

// EMAIL_PROVIDER=smtp (Gmail SMTP, the default) or resend (HTTPS API, for hosts that block SMTP such as Render's free plan).
const provider = () => (process.env.EMAIL_PROVIDER || 'smtp').trim().toLowerCase();
const recipient = () => process.env.CONTACT_TO || DEFAULT_TO;

let transporter;
let resend;

export function isMailConfigured() {
  if (provider() === 'resend') return Boolean(process.env.RESEND_API_KEY);
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

// mail: { subject, text, replyTo?: { name?, address } }
async function send({ subject, text, replyTo }) {
  if (provider() === 'resend') {
    if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || DEFAULT_RESEND_FROM,
      to: recipient(),
      replyTo: replyTo && (replyTo.name ? `${replyTo.name} <${replyTo.address}>` : replyTo.address),
      subject,
      text,
    });
    // The Resend SDK returns errors instead of throwing them.
    if (error) throw new Error(`Resend: ${error.message ?? error.name ?? 'send failed'}`);
    return;
  }

  await getTransporter().sendMail({
    from: `"HRR website" <${process.env.SMTP_USER}>`,
    to: recipient(),
    replyTo: replyTo && (replyTo.name ? replyTo : replyTo.address),
    subject,
    text,
  });
}

// message: { name, email, phone, text }
export function sendContactMessage({ name, email, phone, text }) {
  const lines = [`Name: ${name}`, `Email: ${email}`, `Phone: ${phone || 'Not given'}`, '', text];

  return send({
    subject: `New enquiry from ${name}`,
    text: lines.join('\n'),
    replyTo: { name, address: email },
  });
}

export function sendNewsletterSignup(email) {
  return send({
    subject: `New newsletter sign-up: ${email}`,
    text: `Email: ${email}\n\nThis person signed up for the newsletter on the HRR website.`,
    replyTo: { address: email },
  });
}

// report: { dateLabel, day, week, month } where each period is { visitors, page_views, top_pages }
export function sendVisitReport({ dateLabel, day, week, month }) {
  const pages = day.top_pages.length
    ? day.top_pages.map((p) => `  ${p.views}  ${p.path}`).join('\n')
    : '  (no visits)';

  const lines = [
    `HRR website visitors for ${dateLabel}`,
    '',
    `Yesterday:     ${day.visitors} visitors, ${day.page_views} page views`,
    `Last 7 days:   ${week.visitors} visitors, ${week.page_views} page views`,
    `Last 30 days:  ${month.visitors} visitors, ${month.page_views} page views`,
    '',
    'Most viewed pages yesterday:',
    pages,
    '',
    'A visitor is one browser, so the same person on a phone and a laptop counts twice.',
  ];

  return send({
    subject: `HRR website: ${day.visitors} visitors on ${dateLabel}`,
    text: lines.join('\n'),
  });
}

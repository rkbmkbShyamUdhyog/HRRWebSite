import nodemailer from 'nodemailer';

// Every form on the site is delivered here unless CONTACT_TO in .env says otherwise.
const DEFAULT_TO = 'shyamudhyog@gmail.com';

let transporter;

const recipient = () => process.env.CONTACT_TO || DEFAULT_TO;

export function isMailConfigured() {
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

// message: { name, email, phone, text }
export function sendContactMessage({ name, email, phone, text }) {
  const lines = [`Name: ${name}`, `Email: ${email}`, `Phone: ${phone || 'Not given'}`, '', text];

  return getTransporter().sendMail({
    from: `"HRR website" <${process.env.SMTP_USER}>`,
    to: recipient(),
    replyTo: { name, address: email },
    subject: `New enquiry from ${name}`,
    text: lines.join('\n'),
  });
}

export function sendNewsletterSignup(email) {
  return getTransporter().sendMail({
    from: `"HRR website" <${process.env.SMTP_USER}>`,
    to: recipient(),
    replyTo: email,
    subject: `New newsletter sign-up: ${email}`,
    text: `Email: ${email}\n\nThis person signed up for the newsletter on the HRR website.`,
  });
}

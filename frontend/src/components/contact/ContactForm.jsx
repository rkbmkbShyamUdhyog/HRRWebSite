import { useState } from 'react';
import { sendContactMessage } from '../../services/api.js';

const EMPTY = { name: '', email: '', phone: '', message: '', website: '' };

export default function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const update = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await sendContactMessage(values);
      setValues(EMPTY);
      setStatus('sent');
    } catch (err) {
      setError(err.status ? err.message : 'We couldn’t send your message. Please check your connection and try again.');
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="contact-form contact-form--sent" role="status">
        <h3 className="contact-form__title">Thank you!</h3>
        <p>Your message is on its way. We’ll get back to you soon, usually within one working day.</p>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => setStatus('idle')}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-form__row">
        <div className="field">
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            value={values.name}
            onChange={update}
          />
        </div>
        <div className="field">
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
            value={values.email}
            onChange={update}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="contact-phone">
          Phone <span className="field__optional">(optional)</span>
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={20}
          value={values.phone}
          onChange={update}
        />
      </div>

      <div className="field">
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          minLength={10}
          maxLength={5000}
          value={values.message}
          onChange={update}
        />
      </div>

      {/* Spam trap: hidden from people, so only bots fill it in. */}
      <div className="contact-form__trap" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update} />
      </div>

      {status === 'error' && (
        <p className="contact-form__error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

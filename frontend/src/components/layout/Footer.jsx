import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import Icon from '../common/Icon.jsx';
import Wave from '../common/Wave.jsx';
import useCategories from '../../hooks/useCategories.js';
import { SITE } from '../../data/site.js';
import { collectionPath } from '../../utils/format.js';
import { subscribeNewsletter } from '../../services/api.js';

const USEFUL_LINKS = [
  { to: '/about', label: 'About Us' },
  { to: '/collections', label: 'Our Products' },
  { to: '/process', label: 'Our Process' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Contact Us' },
];

const SOCIALS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'pinterest', label: 'Pinterest' },
];

export default function Footer() {
  const categories = useCategories();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  // Emails the sign-up to HRR.
  const subscribe = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await subscribeNewsletter(email);
      setEmail('');
      setStatus('sent');
    } catch (err) {
      setError(err.status ? err.message : 'We couldn’t sign you up. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const NOTES = {
    idle: 'New arrivals and offers, once a month.',
    sending: 'Signing you up…',
    sent: 'Thanks for signing up! We’ll be in touch.',
    error,
  };

  return (
    <footer className="footer">
      <Wave color="var(--navy)" />
      <div className="footer__body">
        <div className="container footer__top">
          <div className="footer__brand">
            <Link to="/" className="logo" aria-label="HRR home">
              <Logo light />
            </Link>
            <p className="footer__tagline">{SITE.tagline} Comfortable, colourful clothing from 18 months to 8 years.</p>

            <form className="newsletter" onSubmit={subscribe}>
              <label htmlFor="newsletter-email" className="footer__heading">
                Sign up for our newsletter
              </label>
              <div className="newsletter__row">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="btn btn--accent btn--sm" disabled={status === 'sending'}>
                  Subscribe
                </button>
              </div>
              <p className="newsletter__note" role="status">
                {NOTES[status]}
              </p>
            </form>
          </div>

          <div className="footer__col">
            <h2 className="footer__heading">Useful Links</h2>
            <ul className="footer__links">
              {USEFUL_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h2 className="footer__heading">Collections</h2>
            <ul className="footer__links">
              {categories.map((collection) => (
                <li key={collection.slug}>
                  <Link to={collectionPath(collection.name)}>{collection.name}</Link>
                </li>
              ))}
              <li>
                <Link to="/collections">All collections</Link>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h2 className="footer__heading">Contact</h2>
            <ul className="footer__contact">
              {SITE.emails.map((email) => (
                <li key={email}>
                  <Icon name="mail" size={18} />
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              ))}
              {SITE.phones.map((phone) => (
                <li key={phone}>
                  <Icon name="phone" size={18} />
                  <a href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</a>
                </li>
              ))}
              {SITE.addresses.map((address) => (
                <li key={address}>
                  <Icon name="pin" size={18} />
                  <span>{address}</span>
                </li>
              ))}
            </ul>

            <h2 className="footer__heading footer__heading--spaced">Follow Us</h2>
            <ul className="socials">
              {SOCIALS.map(({ key, label }) => (
                <li key={key}>
                  <a href={SITE.social[key]} target="_blank" rel="noopener noreferrer" aria-label={label}>
                    <Icon name={key} size={20} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="container footer__bottom">
          <span>© {new Date().getFullYear()} HRR. All rights reserved.</span>
          <nav className="footer__legal" aria-label="Legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

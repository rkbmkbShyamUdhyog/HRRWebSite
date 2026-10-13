import PageBanner from '../components/common/PageBanner.jsx';
import Icon from '../components/common/Icon.jsx';
import ContactForm from '../components/contact/ContactForm.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import { SITE } from '../data/site.js';

const MAP_ADDRESS = SITE.addresses[0];
const mapQuery = encodeURIComponent(MAP_ADDRESS);
const MAP_EMBED = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

export default function Contact() {
  usePageTitle('Contact Us');

  const details = [
    {
      icon: 'mail',
      title: 'Email us',
      links: SITE.emails.map((email) => ({ label: email, href: `mailto:${email}` })),
      tone: 'pink',
    },
    {
      icon: 'phone',
      title: 'Call us',
      links: SITE.phones.map((phone) => ({ label: phone, href: `tel:${phone.replace(/\s+/g, '')}` })),
      tone: 'sky',
    },
    { icon: 'pin', title: 'Visit us', values: SITE.addresses, tone: 'mint' },
    { icon: 'clock', title: 'Working hours', value: SITE.hours, tone: 'sun' },
  ];

  return (
    <>
      <PageBanner
        tone="sky"
        eyebrow="Contact us"
        title="We’d love to hear from you"
        intro="Questions about sizes, fabrics or an outfit for a special day? Reach out and our team will help."
        crumbs={[{ label: 'Contact Us' }]}
      />

      <section className="section">
        <div className="container contact-grid">
          {details.map(({ icon, title, value, values, links, tone }) => (
            <div key={title} className={`contact-card contact-card--${tone}`}>
              <span className="contact-card__icon">
                <Icon name={icon} size={24} />
              </span>
              <h2 className="contact-card__title">{title}</h2>
              {links ? (
                links.map(({ label, href }) => (
                  <a key={href} href={href} className="contact-card__value contact-card__link">
                    {label}
                  </a>
                ))
              ) : (
                (values ?? [value]).map((text) => (
                  <p key={text} className="contact-card__value">
                    {text}
                  </p>
                ))
              )}
            </div>
          ))}
        </div>

        <div className="container contact-map">
          <div className="section__head section__head--center">
            <p className="eyebrow">Find us</p>
            <h2 className="section__title">Our location</h2>
            <p className="contact-map__address">{MAP_ADDRESS}</p>
          </div>
          <div className="contact-map__frame">
            <iframe
              title={`Map showing ${MAP_ADDRESS}`}
              src={MAP_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a href={MAP_LINK} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm contact-map__link">
              <Icon name="pin" size={18} />
              Open in Google Maps
            </a>
          </div>
        </div>

        <div className="container contact-form-wrap">
          <div className="section__head section__head--center">
            <p className="eyebrow">Send a message</p>
            <h2 className="section__title">Write to us</h2>
            <p className="contact-form-wrap__intro">Fill in the form and we’ll reply by email.</p>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}

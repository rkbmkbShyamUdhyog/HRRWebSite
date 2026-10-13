import { Link } from 'react-router-dom';

export default function CtaBand() {
  return (
    <section className="cta">
      <div className="container">
        <div className="cta__box">
          <span className="blob blob--sun cta__blob-1" aria-hidden="true" />
          <span className="blob blob--pink cta__blob-2" aria-hidden="true" />
          <div className="cta__text">
            <p className="eyebrow">Let’s get dressed for fun</p>
            <h2 className="cta__title">Explore our world together!</h2>
            <p>
              Browse our latest T-shirt and jeans sets, or get in touch. We’re always happy to help you find
              the right outfit and size.
            </p>
          </div>
          <div className="cta__actions">
            <Link to="/contact" className="btn btn--light">
              Contact Us
            </Link>
            <Link to="/collections" className="btn btn--accent">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import Wave from '../common/Wave.jsx';
import SafeImage from '../common/SafeImage.jsx';

const COLLAGE = [
  // One picture per collection: Boys, Girls, Unisex.
  { src: '/assets/pics/force gold main.jpg', className: 'hero__pic--1' },
  { src: '/assets/pics/CHASMA FRONT.jpeg', className: 'hero__pic--2' },
  { src: '/assets/pics/IMG-20261101-WA0025.jpg', className: 'hero__pic--3' },
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__content">
          <p className="eyebrow">Kidswear from 18 months to 8 years</p>
          <h1 className="hero__title">
            Happy dresses for <span className="highlight">little adventures</span>
          </h1>
          <p className="hero__text">
            Bold, colourful T-shirt and jeans sets made for running, climbing and every big day in
            between. Pick a style, choose a colour and find it on Amazon.
          </p>
          <div className="hero__actions">
            <Link to="/collections" className="btn btn--primary">
              Shop Now
            </Link>
            <Link to="/about" className="btn btn--outline">
              About Us
            </Link>
          </div>
        </div>

        <div className="hero__collage" aria-hidden="true">
          <span className="blob blob--sun" />
          <span className="blob blob--sky" />
          {COLLAGE.map(({ src, className }) => (
            <SafeImage key={src} src={src} alt="" className={`hero__pic ${className}`} />
          ))}
        </div>
      </div>
      <Wave color="var(--white)" />
    </section>
  );
}

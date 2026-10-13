import { Link } from 'react-router-dom';
import PageBanner from '../components/common/PageBanner.jsx';
import SafeImage from '../components/common/SafeImage.jsx';
import StatsStrip from '../components/home/StatsStrip.jsx';
import CtaBand from '../components/home/CtaBand.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

const VALUES = [
  {
    title: 'Comfort first',
    text: 'Soft T-shirts, easy necklines and jeans with room to move. If it isn’t comfortable for a child, it isn’t ready to wear.',
  },
  {
    title: 'Colour and joy',
    text: 'Bold graphics and bright shades, from cherry and gold to sky blue, that make getting dressed the fun part of the day.',
  },
  {
    title: 'Built to last',
    text: 'Neat stitching and sturdy denim made for climbing, running and rough play, wash after wash.',
  },
];

export default function About() {
  usePageTitle('About');

  return (
    <>
      <PageBanner
        tone="peach"
        eyebrow="About HRR"
        title="Made for the way kids really live"
        intro="A kidswear label from Kolkata, making easy, colourful outfits for little ones from 18 months to 8 years."
        image="/assets/pics/london blue main.jpeg"
        crumbs={[{ label: 'About' }]}
      />

      <section className="section">
        <div className="container split">
          <SafeImage src="/assets/pics/force beige main.jpg" alt="" className="split__img" loading="lazy" />
          <div className="split__text">
            <p className="eyebrow">Our journey</p>
            <h2 className="section__title">From one small idea to wardrobes across the country</h2>
            <p>
              HRR began in Howrah, West Bengal, with a simple belief: children’s clothes should be as
              comfortable as they are cheerful. We set out to make outfits kids actually want to wear, and
              that parents can trust to fit well and hold up to everyday play.
            </p>
            <p>
              Today our T-shirt and jeans sets reach families across India through Amazon. Every design comes
              in age-based sizes and a choice of colours, and we’re working on new styles for girls and for
              everyone, so there’s something for every little adventurer.
            </p>
            <Link to="/collections" className="btn btn--primary">
              See our collections
            </Link>
          </div>
        </div>
      </section>

      <StatsStrip />

      <section className="section">
        <div className="container">
          <div className="section__head section__head--center">
            <p className="eyebrow">What we believe</p>
            <h2 className="section__title">Our values</h2>
          </div>
          <div className="value-grid">
            {VALUES.map(({ title, text }) => (
              <div key={title} className="value-card">
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

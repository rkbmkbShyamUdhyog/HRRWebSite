import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';

export default function BrandIntro() {
  return (
    <section className="section intro">
      <div className="container intro__inner">
        <p className="eyebrow">Our story</p>
        <h2 className="section__title">HRR: dresses made for childhood</h2>
        <p className="intro__text">
          HRR started with a simple idea: kids’ dresses should be as comfortable as they are cheerful. From
          our factory in Kolkata, we design easy-wearing T-shirt and jeans sets in playful colours, so children
          can move freely and parents can shop with confidence.
        </p>
        <Link to="/about" className="text-link">
          Explore Our Journey <Icon name="arrow" size={18} />
        </Link>
      </div>
    </section>
  );
}

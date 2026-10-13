import Icon from '../common/Icon.jsx';

const REASONS = [
  {
    icon: 'leaf',
    title: 'Skin-friendly fabrics',
    text: 'Soft, breathable T-shirts that feel gentle on young skin, from the first wear to the last.',
  },
  {
    icon: 'heart',
    title: 'Made to move',
    text: 'Relaxed fits and comfortable denim, made for climbing, running and play.',
  },
  {
    icon: 'ruler',
    title: 'Sizes by age',
    text: 'Simple age-based sizes from 18 months to 8 years, so picking the right fit is easy.',
  },
  {
    icon: 'shield',
    title: 'Quality checked',
    text: 'Every piece is checked for stitching, finish and fit before it is packed.',
  },
];

export default function WhyHRR() {
  return (
    <section className="section section--sky why">
      <div className="container">
        <div className="section__head section__head--center">
          <p className="eyebrow">Why HRR</p>
          <h2 className="section__title">Your trusted partner in kidswear</h2>
        </div>
        <div className="why__grid">
          {REASONS.map(({ icon, title, text }) => (
            <div key={title} className="why__item">
              <span className="why__icon">
                <Icon name={icon} size={26} />
              </span>
              <h3 className="why__title">{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

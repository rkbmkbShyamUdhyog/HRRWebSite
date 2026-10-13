// Placeholder quotes: replace with real customer reviews.
const QUOTES = [
  {
    quote: 'Placeholder testimonial. The fabric is so soft and the frock still looks new after many washes.',
    name: 'Parent name',
    detail: 'Parent of a 4-year-old · City',
  },
  {
    quote: 'Placeholder testimonial. Finally a party outfit my son was happy to wear all evening.',
    name: 'Parent name',
    detail: 'Parent of a 7-year-old · City',
  },
  {
    quote: 'Placeholder testimonial. Age-based sizes made it easy to order the right fit first time.',
    name: 'Parent name',
    detail: 'Parent of a 3-year-old · City',
  },
];

export default function Testimonials() {
  return (
    <section className="section testimonials">
      <div className="container">
        <div className="section__head section__head--center">
          <p className="eyebrow">Happy families</p>
          <h2 className="section__title">What parents say</h2>
        </div>
        <div className="testimonials__grid">
          {QUOTES.map(({ quote, name, detail }, index) => (
            <figure key={index} className="quote">
              <span className="quote__mark" aria-hidden="true">
                “
              </span>
              <blockquote>{quote}</blockquote>
              <figcaption>
                <strong>{name}</strong>
                <span>{detail}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

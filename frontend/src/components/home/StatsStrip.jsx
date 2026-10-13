import useCountUp from '../../hooks/useCountUp.js';

// Placeholder figures: replace with HRR's real numbers.
const STATS = [
  { value: 10, suffix: '+', label: 'Years of craft' },
  { value: 500, suffix: '+', label: 'Designs every year' },
  { value: 50000, suffix: '+', label: 'Happy little customers' },
  { value: 25, suffix: '+', label: 'Cities we ship to' },
];

const numberFormat = new Intl.NumberFormat('en-IN');

function Stat({ value, suffix, label }) {
  const [ref, current] = useCountUp(value);
  return (
    <div className="stat" ref={ref}>
      <span className="stat__value">
        {numberFormat.format(Math.round(current))}
        {suffix}
      </span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

export default function StatsStrip() {
  return (
    <section className="stats" aria-label="HRR in numbers">
      <div className="container stats__grid">
        {STATS.map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}

import PageBanner from '../components/common/PageBanner.jsx';
import CtaBand from '../components/home/CtaBand.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

const STEPS = [
  { title: 'Design', text: 'Every outfit starts as a sketch: a bold graphic, a fun colour story and a shape that lets kids move.' },
  { title: 'Fabric selection', text: 'We choose soft T-shirt fabrics and sturdy denim that feel good on young skin and stand up to play.' },
  { title: 'Pattern & sampling', text: 'Samples are made and fitted across our age range, from 18 months to 8 years, so every size sits right.' },
  { title: 'Stitching', text: 'Each piece is cut and stitched with care, with strong seams where active kids need them most.' },
  { title: 'Quality checks', text: 'Finished pieces are checked for stitching, prints, finish and fit before they move on.' },
  { title: 'Packing & dispatch', text: 'Sets are folded, packed and sent out through Amazon, ready to reach your little one.' },
];

export default function Process() {
  usePageTitle('Our Process');

  return (
    <>
      <PageBanner
        tone="mint"
        eyebrow="Our process"
        title="How every HRR outfit comes to life"
        intro="From the first sketch to your doorstep, here’s what goes into each HRR piece."
        crumbs={[{ label: 'Our Process' }]}
      />

      <section className="section">
        <div className="container">
          <ol className="steps">
            {STEPS.map(({ title, text }, index) => (
              <li key={title} className="step">
                <span className="step__num">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="step__title">{title}</h2>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

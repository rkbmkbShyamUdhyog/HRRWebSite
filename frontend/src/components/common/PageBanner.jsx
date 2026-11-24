import { Link } from 'react-router-dom';
import { resolveImage } from '../../utils/images.js';

// The pastel banner at the top of inner pages: breadcrumb, eyebrow, title, intro and optional image.
export default function PageBanner({ eyebrow, title, intro, image, crumbs = [], tone = 'peach', children }) {
  return (
    <section className={`banner banner--${tone}`}>
      <div className={`container banner__inner ${image ? 'banner__inner--split' : ''}`}>
        <div className="banner__text">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Factory</Link>
            {crumbs.map(({ label, to }) => (
              <span key={label}>
                <span aria-hidden="true">/</span>
                {to ? <Link to={to}>{label}</Link> : <span aria-current="page">{label}</span>}
              </span>
            ))}
          </nav>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="banner__title">{title}</h1>
          {intro && <p className="banner__intro">{intro}</p>}
          {children}
        </div>
        {image && <img src={resolveImage(image)} alt="" className="banner__img" />}
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import SafeImage from '../common/SafeImage.jsx';
import Icon from '../common/Icon.jsx';
import Wave from '../common/Wave.jsx';
import useCategories from '../../hooks/useCategories.js';
import { collectionPath } from '../../utils/format.js';

export default function CollectionsGrid() {
  const categories = useCategories();

  return (
    <section className="section--tinted collections">
      <Wave color="var(--white)" top />
      <div className="container collections__inner">
        <div className="section__head section__head--center">
          <p className="eyebrow">Shop by collection</p>
          <h2 className="section__title">Our happy little collections</h2>
        </div>

        <div className="collection-grid">
          {categories.map((collection, index) => (
            <article key={collection.slug} className={`collection-card ${index % 2 ? 'is-reversed' : ''}`}>
              <Link to={collectionPath(collection.name)} className="collection-card__media" tabIndex={-1} aria-hidden="true">
                <SafeImage src={collection.image} alt="" className="collection-card__img" loading="lazy" />
              </Link>
              <div className="collection-card__body">
                <p className="eyebrow">{collection.eyebrow}</p>
                <h3 className="collection-card__title">{collection.name}</h3>
                <p className="collection-card__text">{collection.description}</p>
                <ul className="collection-card__tags">
                  {collection.subcategories.map((sub) => (
                    <li key={sub}>{sub}</li>
                  ))}
                </ul>
                <Link to={collectionPath(collection.name)} className="text-link">
                  View More <Icon name="arrow" size={18} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
      <Wave color="var(--white)" />
    </section>
  );
}

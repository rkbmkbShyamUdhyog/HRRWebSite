import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import SafeImage from '../common/SafeImage.jsx';
import { collectionPath } from '../../utils/format.js';

// Desktop "Our Products" panel: one column per collection (Boys, Girls, Unisex).
export default function MegaMenu({ id, categories, open }) {
  return (
    <div id={id} className={`mega ${open ? 'is-open' : ''}`}>
      <div className="container mega__inner">
        {categories.map((collection) => (
          <div key={collection.slug} className="mega__col">
            <Link to={collectionPath(collection.name)} className="mega__head">
              <SafeImage src={collection.image} alt="" className="mega__thumb" />
              <span>
                <span className="mega__title">{collection.name}</span>
                <span className="mega__eyebrow">{collection.eyebrow}</span>
              </span>
            </Link>
            <ul className="mega__list">
              <li>
                <Link to={collectionPath(collection.name)} className="mega__all">
                  All {collection.name.toLowerCase()} <Icon name="arrow" size={14} />
                </Link>
              </li>
            </ul>
          </div>
        ))}

        <Link to="/collections" className="mega__promo">
          <span className="eyebrow">New season</span>
          <span className="mega__promo-title">Explore every collection</span>
          <span className="mega__promo-cta">
            Shop now <Icon name="arrow" size={16} />
          </span>
        </Link>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import SafeImage from '../common/SafeImage.jsx';
import Icon from '../common/Icon.jsx';
import { allSizes, formatPrice, formatSizes, getDiscountPercent } from '../../utils/format.js';

export default function ProductCard({ product }) {
  const firstColor = product.colors[0];
  const discount = getDiscountPercent(product.price, product.mrp);
  const url = `/product/${product.slug}`;
  const sizes = allSizes(product);

  return (
    <article className="card">
      <Link
        to={url}
        className={`card__media ${product.imageFit === 'contain' ? 'is-contain' : ''}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        <SafeImage src={firstColor?.images[0]} alt="" className="card__img" loading="lazy" />
        {discount > 0 && <span className="badge">{discount}% off</span>}
      </Link>

      <div className="card__body">
        <p className="card__eyebrow">
          {product.gender} · {product.category}
        </p>
        <h3 className="card__name">
          <Link to={url}>{product.name}</Link>
        </h3>

        <dl className="card__attrs">
          <div>
            <dt>Colours</dt>
            <dd>{product.colors.length}</dd>
          </div>
          {sizes.length > 0 && (
            <div>
              <dt>Sizes</dt>
              <dd>{formatSizes(sizes)}</dd>
            </div>
          )}
        </dl>

        <div className="card__foot">
          <div className="price">
            {product.price == null ? (
              <span className="price__now">See price on Amazon</span>
            ) : (
              <>
                <span className="price__now">{formatPrice(product.price)}</span>
                {discount > 0 && <s className="price__mrp">{formatPrice(product.mrp)}</s>}
              </>
            )}
          </div>
          <ul className="dots" aria-label={`${product.colors.length} colours`}>
            {product.colors.map((color) => (
              <li key={color.name} className="dot" style={{ background: color.hex }} title={color.name} />
            ))}
          </ul>
        </div>

        <Link to={url} className="card__link">
          View details <Icon name="arrow" size={16} />
        </Link>
      </div>
    </article>
  );
}

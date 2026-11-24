import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/common/Icon.jsx';
import Gallery from '../components/product/Gallery.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import NotFound from './NotFound.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import { getProduct } from '../services/api.js';
import { seededProduct } from '../prerender/seed.js';
import { collectionPath, formatPrice, formatSizes, getDiscountPercent } from '../utils/format.js';

export default function ProductDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(() => seededProduct(slug));
  const [status, setStatus] = useState(data ? 'ready' : 'loading');
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    let ignore = false;
    // Prerendered product already on screen: refresh it without flashing "Loading…".
    const showing = data?.product && (data.product.slug === slug || data.product.id === slug);
    if (!showing) {
      setStatus('loading');
      setColorIndex(0);
    }
    getProduct(slug)
      .then((result) => {
        if (ignore) return;
        setData(result);
        setStatus('ready');
      })
      .catch((err) => !ignore && setStatus(err.status === 404 ? 'notfound' : 'error'));
    return () => {
      ignore = true;
    };
  }, [slug]);

  usePageTitle(status === 'ready' ? data.product.name : '');

  if (status === 'loading') return <p className="state container section">Loading…</p>;
  if (status === 'notfound') return <NotFound message="We couldn’t find that product." />;
  if (status === 'error') {
    return <p className="state container section">We couldn’t load this product. Please try again shortly.</p>;
  }

  const { product, related } = data;
  const color = product.colors[colorIndex] ?? product.colors[0];
  const discount = getDiscountPercent(product.price, product.mrp);
  const hasSizes = color.sizes.length > 0;

  return (
    <>
      <section className="section section--tight">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Factory</Link>
            <span aria-hidden="true">/</span>
            <Link to="/collections">Our Products</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{product.name}</span>
          </nav>

          <div className="pdp">
            <Gallery images={color.images} alt={`${product.name} in ${color.name}`} fit={product.imageFit} />

            <div className="pdp__info">
              <p className="pdp__cats">
                <Link to={collectionPath(product.gender)}>{product.gender}</Link>
                <span aria-hidden="true">,</span>
                <span>{product.category}</span>
              </p>
              <h1 className="pdp__name">{product.name}</h1>

              {product.price == null ? (
                <div className="price price--lg">
                  <span className="price__now">See price on Amazon</span>
                </div>
              ) : (
                <>
                  <div className="price price--lg">
                    <span className="price__now">{formatPrice(product.price)}</span>
                    {discount > 0 && (
                      <>
                        <s className="price__mrp">MRP {formatPrice(product.mrp)}</s>
                        <span className="price__off">{discount}% off</span>
                      </>
                    )}
                  </div>
                  <p className="pdp__tax">Inclusive of all taxes</p>
                </>
              )}

              <dl className="attrs">
                {hasSizes && (
                  <div className="attrs__item">
                    <dt>Sizes</dt>
                    <dd>{formatSizes(color.sizes)}</dd>
                  </div>
                )}
                <div className="attrs__item">
                  <dt>Colour</dt>
                  <dd>{color.name}</dd>
                </div>
              </dl>

              {product.colors.length > 1 && (
                <div className="option">
                  <p className="option__label">
                    Colour: <span>{color.name}</span>
                  </p>
                  <div className="swatches" role="radiogroup" aria-label="Colour">
                    {product.colors.map((c, index) => (
                      <button
                        key={c.name}
                        type="button"
                        role="radio"
                        aria-checked={index === colorIndex}
                        aria-label={c.name}
                        title={c.name}
                        className={`swatch ${index === colorIndex ? 'is-active' : ''}`}
                        onClick={() => setColorIndex(index)}
                      >
                        <span style={{ background: c.hex }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hasSizes && (
                <div className="option">
                  <p className="option__label">Available sizes</p>
                  <ul className="size-list">
                    {color.sizes.map((size) => (
                      <li key={size}>{size}</li>
                    ))}
                  </ul>
                </div>
              )}

              {color.amazonUrl ? (
                <a
                  className="btn btn--primary btn--block btn--buy"
                  href={color.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy
                </a>
              ) : (
                <button type="button" className="btn btn--primary btn--block btn--buy" disabled>
                  Coming soon
                </button>
              )}

              <ProductDetails details={product.details} />

              <div className="pdp__desc">
                <h2 className="option__label">Description</h2>
                <p>{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--tinted related">
          <div className="container">
            <div className="section__head">
              <h2 className="section__title">Related Products</h2>
            </div>
            <div className="product-grid">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

// "About this product": intro, highlights and a size & fit note. Hidden when the product has no details.
function ProductDetails({ details }) {
  if (!details) return null;
  const highlights = Array.isArray(details.highlights) ? details.highlights.filter(Boolean) : [];
  if (!details.intro && highlights.length === 0 && !details.sizeNote) return null;

  return (
    <section className="pdp-about" aria-labelledby="pdp-about-title">
      <h2 id="pdp-about-title" className="pdp-about__title">
        About this product
      </h2>
      {details.intro && <p className="pdp-about__intro">{details.intro}</p>}

      {highlights.length > 0 && (
        <>
          <h3 className="option__label pdp-about__label">Highlights</h3>
          <ul className="pdp-about__list">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {details.sizeNote && (
        <div className="pdp-about__fit">
          <Icon name="ruler" size={18} className="pdp-about__fit-icon" />
          <p>
            <strong>Size &amp; fit</strong>
            {details.sizeNote}
          </p>
        </div>
      )}
    </section>
  );
}

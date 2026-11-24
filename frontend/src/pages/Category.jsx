import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageBanner from '../components/common/PageBanner.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import NotFound from './NotFound.jsx';
import useProducts from '../hooks/useProducts.js';
import usePageTitle from '../hooks/usePageTitle.js';
import { getCategories } from '../services/api.js';
import { seededCategories } from '../prerender/seed.js';

const TONES = { girls: 'pink', boys: 'sky', unisex: 'mint' };

// One collection (e.g. /collections/girls): banner and product grid.
export default function Category() {
  const { collection: slug } = useParams();

  const [collection, setCollection] = useState(
    () => seededCategories()?.find((c) => c.slug === slug.toLowerCase()) ?? null
  );
  const [lookup, setLookup] = useState(collection ? 'ready' : 'loading');

  useEffect(() => {
    let ignore = false;
    if (collection?.slug !== slug.toLowerCase()) setLookup('loading');
    getCategories()
      .then((data) => {
        if (ignore) return;
        const found = data.find((c) => c.slug === slug.toLowerCase());
        setCollection(found ?? null);
        setLookup(found ? 'ready' : 'notfound');
      })
      .catch(() => !ignore && setLookup('error'));
    return () => {
      ignore = true;
    };
  }, [slug]);

  usePageTitle(collection ? collection.name : '');

  const { products, status } = useProducts({ collection: collection?.name }, Boolean(collection));

  if (lookup === 'notfound') return <NotFound message="We couldn’t find that collection." />;
  if (lookup === 'loading') return <p className="state container section">Loading…</p>;
  if (lookup === 'error') return <p className="state container section">We couldn’t load this collection.</p>;

  return (
    <>
      <PageBanner
        tone={TONES[collection.slug] ?? 'peach'}
        eyebrow={collection.eyebrow}
        title={`${collection.name} Collection`}
        intro={collection.description}
        image={collection.image}
        crumbs={[{ label: 'Our Products', to: '/collections' }, { label: collection.name }]}
      />

      <section className="section section--tight">
        <div className="container">
          <div className="results-bar">
            <p className="results-bar__count">
              {status === 'ready' && `${products.length} ${products.length === 1 ? 'product' : 'products'}`}
            </p>
          </div>

          <ProductGrid products={products} status={status} empty="Nothing here yet. New styles are on the way!" />
        </div>
      </section>
    </>
  );
}

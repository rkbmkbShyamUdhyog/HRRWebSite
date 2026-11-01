import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageBanner from '../components/common/PageBanner.jsx';
import Icon from '../components/common/Icon.jsx';
import ChipGroup from '../components/product/ChipGroup.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import useCategories from '../hooks/useCategories.js';
import useProducts from '../hooks/useProducts.js';
import usePageTitle from '../hooks/usePageTitle.js';

const SEARCH_DEBOUNCE_MS = 300;

// All products, with search plus a collection or gender filter kept in the URL.
export default function Collections() {
  usePageTitle('Our Products');
  const categories = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const collection = searchParams.get('collection') ?? '';
  const gender = searchParams.get('gender') ?? '';

  const [input, setInput] = useState(q);
  const { products, status } = useProducts({ q: q.trim(), collection, gender });

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setSearchParams(next, { replace: true });
  };

  // Keep the box in sync with the URL (header search, back/forward).
  useEffect(() => {
    setInput(q);
  }, [q]);

  // Push typed text into the URL after a short pause.
  useEffect(() => {
    if (input === q) return;
    const timer = setTimeout(() => updateParams({ q: input }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const hasFilters = Boolean(q.trim() || collection || gender);
  const clearFilters = () => setSearchParams({}, { replace: true });

  return (
    <>
      <PageBanner
        tone="peach"
        eyebrow="Our products"
        title="All collections"
        intro="Browse everything we make for little ones from 18 months to 8 years."
        crumbs={[{ label: 'Our Products' }]}
      />

      <section className="section section--tight">
        <div className="container">
          <div className="filters">
            <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
              <Icon name="search" size={20} className="search__icon" />
              <input
                type="search"
                className="search__input"
                placeholder="Search by name, category or colour"
                aria-label="Search products"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              {input && (
                <button type="button" className="search__clear" aria-label="Clear search" onClick={() => setInput('')}>
                  <Icon name="close" size={16} />
                </button>
              )}
            </form>

            <ChipGroup
              label="Shop for"
              options={categories.map((c) => c.name)}
              value={collection || gender}
              allLabel="Everyone"
              onChange={(value) => updateParams({ collection: value, gender: '' })}
            />
          </div>

          <div className="results-bar">
            <p className="results-bar__count">
              {status === 'ready' && `${products.length} ${products.length === 1 ? 'product' : 'products'}`}
            </p>
            {hasFilters && (
              <button type="button" className="text-link" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>

          <ProductGrid products={products} status={status} empty="No products match your search.">
            {hasFilters && (
              <button type="button" className="btn btn--outline" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </ProductGrid>
        </div>
      </section>
    </>
  );
}

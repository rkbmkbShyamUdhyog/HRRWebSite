import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import MegaMenu from './MegaMenu.jsx';
import Icon from '../common/Icon.jsx';
import useCategories from '../../hooks/useCategories.js';
import { categoryPath, collectionPath } from '../../utils/format.js';

const LINKS = [
  { to: '/process', label: 'Our Process' },
  { to: '/news', label: 'News' },
];

const GENDERS = ['Boys', 'Girls'];
const genderPath = (gender) => `/shop?gender=${gender}`;

export default function Header() {
  const categories = useCategories();
  const location = useLocation();
  const navigate = useNavigate();

  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [openCollection, setOpenCollection] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const headerRef = useRef(null);
  const searchInputRef = useRef(null);
  const closeTimer = useRef(null);

  const closeAll = () => {
    setMegaOpen(false);
    setMobileOpen(false);
    setSearchOpen(false);
  };

  // Close everything whenever the page changes.
  useEffect(closeAll, [location.pathname, location.search]);

  // Escape and clicks outside the header close any open panel.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeAll();
    const onClick = (e) => !headerRef.current?.contains(e.target) && closeAll();
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Lock page scroll behind the open mobile menu.
  useEffect(() => {
    document.body.classList.toggle('no-scroll', mobileOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [mobileOpen]);

  // Hover opens the mega-menu on desktop; a short delay stops it flickering when the pointer crosses the gap.
  const hoverOpen = () => {
    clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const hoverClose = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 150);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/collections?q=${encodeURIComponent(q)}` : '/collections');
    setQuery('');
  };

  const productsActive = location.pathname.startsWith('/collections') || location.pathname.startsWith('/product');
  // NavLink only compares paths, so check ?gender= to light up just the selected one.
  const genderActive = (gender) =>
    location.pathname === '/shop' &&
    new URLSearchParams(location.search).get('gender')?.toLowerCase() === gender.toLowerCase();

  return (
    <header className="header" ref={headerRef}>
      <div className="container header__inner">
        <Link to="/" className="logo" aria-label="HRR home">
          <Logo />
        </Link>

        <nav className="nav" aria-label="Main">
          <NavLink to="/about" className="nav__link">
            About
          </NavLink>
          <div className="nav__item" onMouseEnter={hoverOpen} onMouseLeave={hoverClose}>
            <button
              type="button"
              className={`nav__link nav__trigger ${productsActive ? 'active' : ''}`}
              aria-expanded={megaOpen}
              aria-controls="mega-menu"
              onClick={() => setMegaOpen((open) => !open)}
            >
              Our Products <Icon name="chevron" size={16} className={megaOpen ? 'is-flipped' : ''} />
            </button>
            <MegaMenu id="mega-menu" categories={categories} open={megaOpen} />
          </div>
          {GENDERS.map((gender) => (
            <Link key={gender} to={genderPath(gender)} className={`nav__link ${genderActive(gender) ? 'active' : ''}`}>
              {gender}
            </Link>
          ))}
          {LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className="nav__link">
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="header__actions">
          <button
            type="button"
            className="icon-btn"
            aria-label={searchOpen ? 'Close search' : 'Search products'}
            aria-expanded={searchOpen}
            aria-controls="site-search"
            onClick={() => {
              setSearchOpen((open) => !open);
              setMegaOpen(false);
              setMobileOpen(false);
            }}
          >
            <Icon name={searchOpen ? 'close' : 'search'} size={20} />
          </button>
          <Link to="/contact" className="btn btn--primary btn--sm header__cta">
            Contact Us
          </Link>
          <button
            type="button"
            className="icon-btn header__burger"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => {
              setMobileOpen((open) => !open);
              setSearchOpen(false);
            }}
          >
            <span className={`hamburger ${mobileOpen ? 'is-open' : ''}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div id="site-search" className={`search-panel ${searchOpen ? 'is-open' : ''}`}>
        <form className="container search-panel__form" role="search" onSubmit={submitSearch}>
          <Icon name="search" size={20} className="search-panel__icon" />
          <input
            ref={searchInputRef}
            type="search"
            className="search-panel__input"
            placeholder="Search T-shirt & jeans sets, colours…"
            aria-label="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            tabIndex={searchOpen ? 0 : -1}
          />
          <button type="submit" className="btn btn--primary btn--sm" tabIndex={searchOpen ? 0 : -1}>
            Search
          </button>
        </form>
      </div>

      <nav id="mobile-menu" className={`mobile-menu ${mobileOpen ? 'is-open' : ''}`} aria-label="Mobile">
        <ul className="mobile-menu__list">
          <li>
            <NavLink to="/about" className="mobile-menu__link">
              About
            </NavLink>
          </li>
          <li>
            <button
              type="button"
              className="mobile-menu__link mobile-menu__toggle"
              aria-expanded={mobileProductsOpen}
              onClick={() => setMobileProductsOpen((open) => !open)}
            >
              Our Products
              <Icon name="chevron" size={18} className={mobileProductsOpen ? 'is-flipped' : ''} />
            </button>
            <div className={`accordion ${mobileProductsOpen ? 'is-open' : ''}`}>
              <ul className="accordion__inner">
                <li>
                  <Link to="/collections" className="mobile-menu__sublink">
                    All collections
                  </Link>
                </li>
                {categories.map((collection) => {
                  const expanded = openCollection === collection.slug;
                  return (
                    <li key={collection.slug}>
                      <button
                        type="button"
                        className="mobile-menu__sublink mobile-menu__toggle"
                        aria-expanded={expanded}
                        onClick={() => setOpenCollection(expanded ? null : collection.slug)}
                      >
                        {collection.name}
                        <Icon name="chevron" size={16} className={expanded ? 'is-flipped' : ''} />
                      </button>
                      <div className={`accordion ${expanded ? 'is-open' : ''}`}>
                        <ul className="accordion__inner">
                          <li>
                            <Link to={collectionPath(collection.name)} className="mobile-menu__leaf">
                              All {collection.name.toLowerCase()}
                            </Link>
                          </li>
                          {collection.subcategories.map((sub) => (
                            <li key={sub}>
                              <Link to={categoryPath(collection.name, sub)} className="mobile-menu__leaf">
                                {sub}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
          {GENDERS.map((gender) => (
            <li key={gender}>
              <Link to={genderPath(gender)} className={`mobile-menu__link ${genderActive(gender) ? 'active' : ''}`}>
                {gender}
              </Link>
            </li>
          ))}
          {LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink to={to} className="mobile-menu__link">
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/contact" className="mobile-menu__link">
              Contact Us
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

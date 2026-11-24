import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle.js';

export default function NotFound({ message = 'The page you’re looking for doesn’t exist.' }) {
  usePageTitle('Page not found');

  return (
    <section className="section container not-found">
      <p className="eyebrow">Error 404</p>
      <h1 className="section__title">Oops! Page not found</h1>
      <p className="not-found__text">{message}</p>
      <div className="not-found__actions">
        <Link to="/" className="btn btn--primary">
          Back to factory
        </Link>
        <Link to="/collections" className="btn btn--outline">
          Shop all
        </Link>
      </div>
    </section>
  );
}

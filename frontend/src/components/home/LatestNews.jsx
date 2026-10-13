import { Link } from 'react-router-dom';
import NewsCard from '../common/NewsCard.jsx';
import Icon from '../common/Icon.jsx';
import { NEWS } from '../../data/news.js';

export default function LatestNews() {
  return (
    <section className="section section--lilac">
      <div className="container">
        <div className="section__head">
          <div>
            <p className="eyebrow">From the blog</p>
            <h2 className="section__title">Latest news</h2>
          </div>
          <Link to="/news" className="text-link">
            All news <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="news-grid">
          {NEWS.slice(0, 3).map((post) => (
            <NewsCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

import SafeImage from './SafeImage.jsx';
import { formatNewsDate } from '../../data/news.js';

export default function NewsCard({ post }) {
  return (
    <article className="news-card" id={post.slug}>
      <div className="news-card__media">
        <SafeImage src={post.image} alt="" className="news-card__img" loading="lazy" />
      </div>
      <div className="news-card__body">
        <time className="news-card__date" dateTime={post.date}>
          {formatNewsDate(post.date)}
        </time>
        <h3 className="news-card__title">{post.title}</h3>
        <p className="news-card__excerpt">{post.excerpt}</p>
      </div>
    </article>
  );
}

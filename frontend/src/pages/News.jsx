import PageBanner from '../components/common/PageBanner.jsx';
import NewsCard from '../components/common/NewsCard.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import { NEWS } from '../data/news.js';

export default function News() {
  usePageTitle('News');

  return (
    <>
      <PageBanner
        tone="lilac"
        eyebrow="News"
        title="Stories, tips and new arrivals"
        intro="New arrivals, size tips and simple style ideas for parents, from the HRR team."
        crumbs={[{ label: 'News' }]}
      />

      <section className="section">
        <div className="container news-grid">
          {NEWS.map((post) => (
            <NewsCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}

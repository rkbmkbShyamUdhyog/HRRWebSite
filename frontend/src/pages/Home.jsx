import Hero from '../components/home/Hero.jsx';
import StatsStrip from '../components/home/StatsStrip.jsx';
import BrandIntro from '../components/home/BrandIntro.jsx';
import CollectionsGrid from '../components/home/CollectionsGrid.jsx';
import FeaturedProducts from '../components/home/FeaturedProducts.jsx';
import WhyHRR from '../components/home/WhyHRR.jsx';
import Testimonials from '../components/home/Testimonials.jsx';
import LatestNews from '../components/home/LatestNews.jsx';
import CtaBand from '../components/home/CtaBand.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import { collectionPath } from '../utils/format.js';

// One product row per collection on the home page.
const ROWS = [
  { gender: 'Boys', eyebrow: 'For little explorers' },
  { gender: 'Girls', eyebrow: 'For little dreamers' },
  { gender: 'Unisex', eyebrow: 'For every kid' },
];

export default function Home() {
  usePageTitle();

  return (
    <>
      <Hero />
      <StatsStrip />
      <BrandIntro />
      <CollectionsGrid />
      {ROWS.map(({ gender, eyebrow }) => (
        <FeaturedProducts
          key={gender}
          filters={{ gender }}
          eyebrow={eyebrow}
          title={gender}
          to={collectionPath(gender)}
        />
      ))}
      <WhyHRR />
      <Testimonials />
      <LatestNews />
      <CtaBand />
    </>
  );
}

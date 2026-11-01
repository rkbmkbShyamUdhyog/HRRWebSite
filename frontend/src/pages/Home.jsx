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

export default function Home() {
  usePageTitle();

  return (
    <>
      <Hero />
      <StatsStrip />
      <BrandIntro />
      <CollectionsGrid />
      <FeaturedProducts />
      <FeaturedProducts
        filters={{ gender: 'Girls' }}
        eyebrow="For little dreamers"
        title="Girls"
        to="/shop?gender=Girls"
      />
      <WhyHRR />
      <Testimonials />
      <LatestNews />
      <CtaBand />
    </>
  );
}

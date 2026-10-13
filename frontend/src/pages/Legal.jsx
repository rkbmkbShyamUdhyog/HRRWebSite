import PageBanner from '../components/common/PageBanner.jsx';
import PrivacyPolicy from '../components/legal/PrivacyPolicy.jsx';
import TermsAndConditions from '../components/legal/TermsAndConditions.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

const PAGES = {
  privacy: { title: 'Privacy Policy', Body: PrivacyPolicy },
  terms: { title: 'Terms & Conditions', Body: TermsAndConditions },
};

// Legal pages: the Privacy Policy and Terms & Conditions.
export default function Legal({ kind }) {
  const { title, Body } = PAGES[kind];
  usePageTitle(title);

  return (
    <>
      <PageBanner tone="peach" title={title} crumbs={[{ label: title }]} />
      <section className="section">
        <div className="container prose">
          <Body />
        </div>
      </section>
    </>
  );
}

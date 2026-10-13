import logoUrl from '../../assets/hrr-logo.svg';

// The HRR logo. `light` sits it on a white badge for dark backgrounds.
export default function Logo({ light = false }) {
  return (
    <span className={`brand-logo ${light ? 'brand-logo--light' : ''}`}>
      <img src={logoUrl} alt="" className="brand-logo__img" />
    </span>
  );
}

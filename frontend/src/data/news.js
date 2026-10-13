// News posts shown on the Home and News pages.

export const NEWS = [
  {
    slug: 'new-tshirt-and-jeans-sets',
    title: 'Meet our new T-shirt & jeans sets',
    excerpt: 'Force, G Racing, Beach and London: four bold full-sleeve tees, each paired with blue jeans and ready to wear.',
    date: '2026-09-28',
    image: '',
  },
  {
    slug: 'how-to-pick-the-right-size',
    title: 'How to pick the right size for your child',
    excerpt: 'Our sizes go by age, from 18 months to 8 years. Pick your child’s age, or size up if they’re between ages.',
    date: '2026-09-12',
    image: '',
  },
  {
    slug: 'caring-for-kids-denim',
    title: 'Keeping kids’ denim looking new',
    excerpt: 'Wash jeans inside out in cold water and dry them in the shade to keep the colour bright for longer.',
    date: '2026-08-30',
    image: '',
  },
];

export function formatNewsDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

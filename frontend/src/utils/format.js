const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatPrice = (amount) => priceFormatter.format(amount);

// Percentage off MRP, rounded. Returns 0 when there is no discount.
export function getDiscountPercent(price, mrp) {
  if (!mrp || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

// Age range in months from a size label like "18-24 months" or "2-3 yrs", or null if it isn't one.
function parseAge(size) {
  const match = /^(\d+)\s*-\s*(\d+)\s*(months?|yrs?|years?)$/i.exec(String(size).trim());
  if (!match) return null;
  const unit = /^m/i.test(match[3]) ? 1 : 12;
  return { from: Number(match[1]) * unit, to: Number(match[2]) * unit };
}

const formatMonths = (months) => (months < 24 ? `${months} months` : `${months / 12} yrs`);

// "18 months–8 yrs" from sizes like "18-24 months" … "7-8 yrs". Falls back to the raw sizes.
export function formatSizes(sizes = []) {
  const ages = sizes.map(parseAge);
  if (!ages.length || ages.includes(null)) return sizes.join(', ');
  const min = Math.min(...ages.map((a) => a.from));
  const max = Math.max(...ages.map((a) => a.to));
  return min >= 24 ? `${min / 12}–${max / 12} yrs` : `${formatMonths(min)}–${formatMonths(max)}`;
}

// Every size offered in any colour, youngest first.
export const allSizes = (product) =>
  [...new Set(product.colors.flatMap((color) => color.sizes))].sort(
    (a, b) => (parseAge(a)?.from ?? 0) - (parseAge(b)?.from ?? 0)
  );

export const collectionPath = (collection) => `/collections/${String(collection).toLowerCase()}`;

export const categoryPath = (collection, category) =>
  `${collectionPath(collection)}?category=${encodeURIComponent(category)}`;

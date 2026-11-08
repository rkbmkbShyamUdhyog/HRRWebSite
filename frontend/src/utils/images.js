// Product photos live in src/assets/pics and are bundled by Vite.
// Data files refer to them as "/assets/pics/<file name>"; this maps that path to the bundled URL.
const PICS = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/pics/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, query: '?url', import: 'default' })
  ).map(([path, url]) => [path.split('/').pop().toLowerCase(), url])
);

// Returns the bundled URL for a "/assets/pics/..." path, or the src unchanged for anything else
// (such as a full Supabase Storage URL for a product photo).
export function resolveImage(src) {
  if (!src || !String(src).startsWith('/assets/pics/')) return src;
  const name = decodeURIComponent(String(src).split('/').pop()).toLowerCase();
  return PICS[name] ?? src;
}

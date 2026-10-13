// Product photos live in src/assets/pics and are bundled by Vite.
// Data files refer to them as "/assets/pics/<file name>"; this maps that path to the bundled URL.
const PICS = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/pics/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' })
  ).map(([path, url]) => [path.split('/').pop().toLowerCase(), url])
);

// Returns the bundled URL for a photo in src/assets/pics, or the path unchanged for anything else.
export function resolveImage(src) {
  if (!src) return src;
  const name = decodeURIComponent(String(src).split('/').pop()).toLowerCase();
  return PICS[name] ?? src;
}

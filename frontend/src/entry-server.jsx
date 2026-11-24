// Build-time only: renders one route to HTML for scripts/prerender.mjs. Not loaded in the browser.
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App.jsx';
import { setSeed } from './prerender/seed.js';

export function render(url, seed) {
  setSeed(seed);
  try {
    return renderToString(
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    );
  } finally {
    setSeed(null);
  }
}

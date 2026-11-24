// In production VITE_API_URL points at the backend (e.g. https://hrr-api.onrender.com).
// Locally it is empty, so requests go to /api and the Vite dev server proxies them to the backend.
const API_ORIGIN = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const BASE_URL = `${API_ORIGIN}/api`;

async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(data?.error || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}

// filters: { q, collection, gender, category, featured }
export function getProducts(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== false) params.set(key, value);
  });
  const query = params.toString();
  return request(`/products${query ? `?${query}` : ''}`);
}

// Returns { product, related }
export function getProduct(slug) {
  return request(`/products/${encodeURIComponent(slug)}`);
}

export function getCategories() {
  return request('/categories');
}

export function subscribeNewsletter(email) {
  return request('/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

// message: { name, email, phone, message, website }
export function sendContactMessage(message) {
  return request('/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
}

// Anonymous visit counting for the daily visitor email. Failures are ignored so they never affect the site.
export function recordVisit(visitorId, path) {
  fetch(`${BASE_URL}/visits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitorId, path }),
    keepalive: true,
  }).catch(() => {});
}

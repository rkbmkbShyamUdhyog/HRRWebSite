const BASE_URL = '/api';

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

// filters: { q, collection, category, featured }
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

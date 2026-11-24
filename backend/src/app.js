import express from 'express';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import contactRoutes from './routes/contact.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import visitRoutes from './routes/visit.routes.js';
import corsAllowList from './middleware/cors.js';

const app = express();

// Render (and most hosts) put a proxy in front of the app. Trust it so req.ip is the visitor's IP,
// which the contact/newsletter rate limiter relies on.
app.set('trust proxy', 1);

app.use(corsAllowList);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/visits', visitRoutes);

// Unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

export default app;

import * as productService from '../services/product.service.js';

export async function listProducts(req, res, next) {
  try {
    const { q, collection, gender, category, featured } = req.query;
    res.json(await productService.findProducts({ q, collection, gender, category, featured }));
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await productService.findProduct(req.params.idOrSlug);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product, related: await productService.findRelatedProducts(product) });
  } catch (err) {
    next(err);
  }
}

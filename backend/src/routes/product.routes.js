import { Router } from 'express';
import { listProducts, getProduct } from '../controllers/product.controller.js';

const router = Router();

router.get('/', listProducts);
router.get('/:idOrSlug', getProduct);

export default router;

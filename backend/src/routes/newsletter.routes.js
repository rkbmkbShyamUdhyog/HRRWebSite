import { Router } from 'express';
import { subscribe } from '../controllers/newsletter.controller.js';
import rateLimit from '../middleware/rateLimit.js';

const router = Router();

router.post('/', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), subscribe);

export default router;

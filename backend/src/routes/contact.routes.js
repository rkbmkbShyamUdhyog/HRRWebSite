import { Router } from 'express';
import { sendMessage } from '../controllers/contact.controller.js';
import rateLimit from '../middleware/rateLimit.js';

const router = Router();

router.post('/', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), sendMessage);

export default router;

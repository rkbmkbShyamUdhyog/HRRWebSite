import { Router } from 'express';
import { recordVisit, sendReport } from '../controllers/visit.controller.js';
import rateLimit from '../middleware/rateLimit.js';

const router = Router();

// Generous limit: a visitor clicking through the site sends one request per page.
router.post('/', rateLimit({ windowMs: 60 * 1000, max: 60 }), recordVisit);
router.post('/report', rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), sendReport);

export default router;

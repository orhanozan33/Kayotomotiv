import express from 'express';
import * as pageController from '../controllers/pageController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', pageController.getPages);
router.get('/:slug', pageController.getPageBySlug);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, pageController.getAllPages);
router.post('/', authenticate, requireAdmin, pageController.createPage);
router.put('/:id', authenticate, requireAdmin, pageController.updatePage);
router.delete('/:id', authenticate, requireAdmin, pageController.deletePage);

export default router;



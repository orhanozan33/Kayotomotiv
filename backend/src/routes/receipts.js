import express from 'express';
import * as receiptsController from '../controllers/receiptsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All receipt routes require authentication and admin role
router.post('/', authenticate, requireAdmin, receiptsController.createReceipt);
router.get('/', authenticate, requireAdmin, receiptsController.getReceipts);
router.get('/:id', authenticate, requireAdmin, receiptsController.getReceiptById);
router.delete('/:id', authenticate, requireAdmin, receiptsController.deleteReceipt);

export default router;


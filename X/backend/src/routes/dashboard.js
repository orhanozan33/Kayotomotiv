import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Allow both admin and regular users to access dashboard data
router.get('/revenue', authenticate, dashboardController.getRevenueStats);
router.get('/notifications', authenticate, dashboardController.getPendingNotifications);

export default router;



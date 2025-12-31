import express from 'express';
import * as settingsController from '../controllers/settingsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateSettingsSchema } from '../validators/settingsValidator.js';

const router = express.Router();

// Get all settings (admin only)
router.get('/', authenticate, requireAdmin, settingsController.getSettings);

// Update settings (admin only)
router.put('/', authenticate, requireAdmin, validate(updateSettingsSchema), settingsController.updateSettings);

// Get social media links (public endpoint)
router.get('/social-media', settingsController.getSocialMediaLinks);

// Get company info (public endpoint for printing)
router.get('/company-info', settingsController.getCompanyInfo);

// Get contact locations (public endpoint)
router.get('/contact-locations', settingsController.getContactLocations);

export default router;


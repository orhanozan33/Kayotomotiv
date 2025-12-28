import express from 'express';
import * as contactController from '../controllers/contactController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, validateMultiple } from '../middleware/validate.js';
import { createContactMessageSchema, updateContactMessageStatusSchema } from '../validators/contactValidator.js';
import Joi from 'joi';

const router = express.Router();

const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required()
});

// Create contact message (public endpoint)
router.post('/', validate(createContactMessageSchema), contactController.createContactMessage);

// Get all contact messages (admin only)
router.get('/', authenticate, requireAdmin, contactController.getContactMessages);

// Get contact message by ID (admin only)
router.get('/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema }), contactController.getContactMessageById);

// Update contact message status (admin only)
router.put('/:id/status', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema, body: updateContactMessageStatusSchema }), contactController.updateContactMessageStatus);

// Delete contact message (admin only)
router.delete('/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema }), contactController.deleteContactMessage);

export default router;


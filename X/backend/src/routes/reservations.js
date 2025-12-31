import express from 'express';
import * as reservationController from '../controllers/reservationController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, validateMultiple } from '../middleware/validate.js';
import { createReservationSchema, createTestDriveSchema, updateStatusSchema } from '../validators/reservationValidator.js';
import Joi from 'joi';

const router = express.Router();

const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required()
});

// Reservations
router.post('/', validate(createReservationSchema), reservationController.createReservation);
router.get('/', authenticate, reservationController.getReservations);
router.put('/:id/status', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema, body: updateStatusSchema }), reservationController.updateReservationStatus);
router.delete('/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema }), reservationController.deleteReservation);

// Test drive requests
router.post('/test-drive', validate(createTestDriveSchema), reservationController.createTestDriveRequest);
router.get('/test-drive', authenticate, reservationController.getTestDriveRequests);
router.put('/test-drive/:id/status', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema, body: updateStatusSchema }), reservationController.updateTestDriveRequestStatus);
router.delete('/test-drive/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema }), reservationController.deleteTestDriveRequest);

export default router;



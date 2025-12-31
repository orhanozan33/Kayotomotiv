import express from 'express';
import * as vehicleController from '../controllers/vehicleController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import upload from '../config/upload.js';
import { validate, validateMultiple } from '../middleware/validate.js';
import { createVehicleSchema, updateVehicleSchema } from '../validators/vehicleValidator.js';
import Joi from 'joi';

const router = express.Router();

const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required()
});

// Public routes
router.get('/', vehicleController.getVehicles);
router.get('/:id', validateMultiple({ params: uuidParamSchema }), vehicleController.getVehicleById);

// Admin routes
router.post('/', authenticate, requireAdmin, validate(createVehicleSchema), vehicleController.createVehicle);
router.put('/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema, body: updateVehicleSchema }), vehicleController.updateVehicle);
router.delete('/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema }), vehicleController.deleteVehicle);
router.post('/:id/images', authenticate, requireAdmin, upload.single('image'), vehicleController.addVehicleImage);
router.put('/images/:imageId', authenticate, requireAdmin, vehicleController.updateVehicleImage);
router.post('/images/update-order', authenticate, requireAdmin, vehicleController.updateImagesOrder);
router.delete('/images/:imageId', authenticate, requireAdmin, vehicleController.deleteVehicleImage);
router.post('/check-expired-reservations', authenticate, requireAdmin, vehicleController.checkExpiredReservations);

export default router;


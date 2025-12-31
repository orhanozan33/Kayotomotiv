import express from 'express';
import * as repairController from '../controllers/repairController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, validateMultiple } from '../middleware/validate.js';
import { createRepairQuoteSchema, updateRepairQuoteStatusSchema } from '../validators/repairValidator.js';
import Joi from 'joi';

const router = express.Router();

const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required()
});

// Services - public can view, admin can manage
router.get('/services', repairController.getServices);
router.post('/services', authenticate, requireAdmin, repairController.createService);
router.get('/services/all', authenticate, repairController.getAllServices); // Removed requireAdmin - allow all authenticated users to view all services
router.put('/services/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema }), repairController.updateService);
router.delete('/services/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema }), repairController.deleteService);

// Quotes (Real repair quotes, NOT vehicle records)
router.post('/quotes', validate(createRepairQuoteSchema), repairController.createQuote);
router.get('/quotes', authenticate, repairController.getQuotes);
router.put('/quotes/:id/status', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema, body: updateRepairQuoteStatusSchema }), repairController.updateQuoteStatus);
router.delete('/quotes/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema }), repairController.deleteQuote);

// Vehicle Records (Oto Yıkama Kayıt - created via "Araç Ekle" button)
router.get('/vehicle-records', authenticate, repairController.getVehicleRecords);
router.get('/vehicle-records/revenue', authenticate, repairController.getVehicleRecordsRevenue);
router.post('/vehicle-records', authenticate, requireAdmin, repairController.createVehicleRecord);
router.delete('/vehicle-records/cleanup', authenticate, requireAdmin, repairController.cleanupOldRecords);

// Appointments
router.post('/appointments', repairController.createAppointment);
router.get('/appointments', authenticate, repairController.getAppointments);
router.put('/appointments/:id/status', authenticate, requireAdmin, repairController.updateAppointmentStatus);

export default router;



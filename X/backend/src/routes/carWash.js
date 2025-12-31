import express from 'express';
import * as carWashController from '../controllers/carWashController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, validateMultiple } from '../middleware/validate.js';
import { 
  createCarWashAppointmentSchema, 
  createCarWashPackageSchema, 
  createCarWashAddonSchema, 
  updateCarWashStatusSchema 
} from '../validators/carWashValidator.js';
import Joi from 'joi';

const router = express.Router();

const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required()
});

// Packages
router.get('/packages', carWashController.getPackages);
router.get('/packages/all', authenticate, carWashController.getAllPackages);
router.post('/packages', authenticate, requireAdmin, validate(createCarWashPackageSchema), carWashController.createPackage);
router.put('/packages/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema, body: createCarWashPackageSchema }), carWashController.updatePackage);
router.delete('/packages/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema }), carWashController.deletePackage);

// Addons
router.get('/addons', carWashController.getAddons);
router.get('/addons/all', authenticate, carWashController.getAllAddons);
router.post('/addons', authenticate, requireAdmin, validate(createCarWashAddonSchema), carWashController.createAddon);
router.put('/addons/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema, body: createCarWashAddonSchema }), carWashController.updateAddon);
router.delete('/addons/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema }), carWashController.deleteAddon);

// Appointments
router.post('/appointments', validate(createCarWashAppointmentSchema), carWashController.createAppointment);
router.get('/appointments', authenticate, carWashController.getAppointments);
router.put('/appointments/:id/status', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema, body: updateCarWashStatusSchema }), carWashController.updateAppointmentStatus);
router.delete('/appointments/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema }), carWashController.deleteAppointment);

export default router;



import express from 'express';
import * as customerController from '../controllers/customerController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

// Customer vehicles
router.post('/:id/vehicles', customerController.addVehicle);

// Service records
router.post('/:id/service-records', customerController.addServiceRecord);
router.put('/:id/service-records/:serviceRecordId', customerController.updateServiceRecord);
router.delete('/:id/service-records/:serviceRecordId', customerController.deleteServiceRecord);

export default router;



import express from 'express';
import * as userController from '../controllers/userController.js';
import * as permissionController from '../controllers/permissionController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, validateMultiple } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '../validators/userValidator.js';
import Joi from 'joi';

const router = express.Router();

const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required()
});

// User management routes (admin only)
router.get('/', authenticate, requireAdmin, userController.getAllUsers);
router.get('/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema }), userController.getUserById);
router.post('/', authenticate, requireAdmin, validate(createUserSchema), userController.createUser);
router.put('/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema, body: updateUserSchema }), userController.updateUser);
router.delete('/:id', authenticate, requireAdmin, validateMultiple({ params: uuidParamSchema }), userController.deleteUser);

// Permission routes
// Allow users to view their own permissions, admin can view any user's permissions
router.get('/:userId/permissions', authenticate, async (req, res, next) => {
  // Allow if user is admin or viewing their own permissions
  if (req.user.role === 'admin' || req.user.id === req.params.userId) {
    return permissionController.getUserPermissions(req, res, next);
  }
  return res.status(403).json({ error: 'Yetkisiz erişim' });
});
router.put('/:userId/permissions', authenticate, requireAdmin, permissionController.updateUserPermissions);
router.post('/verify-permission-password', authenticate, permissionController.verifyPermissionPassword);

export default router;


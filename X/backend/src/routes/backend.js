import express from 'express';
import * as backendController from '../controllers/backendController.js';
import * as migrationController from '../controllers/migrationController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { backendPasswordLimiter, sqlExecutionLimiter } from '../middleware/rateLimiter.js';
import { validate, validateMultiple } from '../middleware/validate.js'; // validateMultiple for query params validation
import Joi from 'joi';

const router = express.Router();

const passwordSchema = Joi.object({
  password: Joi.string().required().messages({
    'any.required': 'Şifre gereklidir'
  })
});

const sqlQuerySchema = Joi.object({
  sql: Joi.string().required().min(1).max(10000).messages({
    'any.required': 'SQL sorgusu gereklidir',
    'string.min': 'SQL sorgusu boş olamaz',
    'string.max': 'SQL sorgusu çok uzun (max 10000 karakter)'
  })
});

const filePathSchema = Joi.object({
  filePath: Joi.string().required().messages({
    'any.required': 'Dosya yolu gereklidir'
  })
});

const fileWriteSchema = Joi.object({
  filePath: Joi.string().required().messages({
    'any.required': 'Dosya yolu gereklidir'
  }),
  content: Joi.string().required().messages({
    'any.required': 'İçerik gereklidir'
  })
});

// Şifre doğrulama - rate limiting ile korumalı (authentication'dan önce)
router.post('/verify-password', backendPasswordLimiter, validate(passwordSchema), backendController.verifyPassword);

// Tüm diğer backend endpoint'leri admin authentication gerektirir
router.use(authenticate);
router.use(requireAdmin);

// SQL çalıştırma - rate limiting ile korumalı
router.post('/execute-sql', sqlExecutionLimiter, validate(sqlQuerySchema), backendController.executeSQL);

// Dosya listesi
router.get('/files', backendController.getFiles);

// Dosya okuma
router.get('/file-content', validateMultiple({ query: filePathSchema }), backendController.readFile);

// Dosya yazma
router.post('/file-content', validate(fileWriteSchema), backendController.writeFile);

// Migration endpoint'leri (admin authentication gerektirir)
router.post('/run-migrations', migrationController.runMigrations);
router.get('/migration-status', migrationController.checkMigrationStatus);

export default router;


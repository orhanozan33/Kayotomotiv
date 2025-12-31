import Joi from 'joi';

const uuidSchema = Joi.string().uuid().messages({
  'string.guid': 'Geçerli bir UUID formatı gerekli'
});

const emailSchema = Joi.string()
  .email()
  .required()
  .messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz',
    'any.required': 'E-posta adresi gereklidir'
  });

const phoneSchema = Joi.string()
  .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
  .optional()
  .allow(null)
  .allow('')
  .messages({
    'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
  });

export const createReservationSchema = Joi.object({
  vehicle_id: uuidSchema.required().messages({
    'any.required': 'Araç ID gereklidir'
  }),
  customer_name: Joi.string()
    .max(200)
    .required()
    .messages({
      'any.required': 'Müşteri adı gereklidir',
      'string.max': 'Müşteri adı en fazla 200 karakter olabilir'
    }),
  customer_email: emailSchema,
  customer_phone: phoneSchema,
  message: Joi.string()
    .max(5000)
    .optional()
    .allow(null)
    .allow(''),
  preferred_date: Joi.date()
    .iso()
    .optional()
    .allow(null),
  preferred_time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .allow(null)
    .allow('')
    .messages({
      'string.pattern.base': 'Geçerli bir saat formatı giriniz (HH:MM)'
    })
});

export const createTestDriveSchema = Joi.object({
  vehicle_id: uuidSchema.optional(),
  customer_name: Joi.string().max(200).required().messages({
    'any.required': 'Müşteri adı gereklidir'
  }),
  customer_email: emailSchema,
  customer_phone: phoneSchema,
  preferred_date: Joi.date().iso().optional().allow(null),
  preferred_time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .allow(null)
    .allow('')
    .messages({
      'string.pattern.base': 'Geçerli bir saat formatı giriniz (HH:MM)'
    }),
  message: Joi.string().max(5000).optional().allow(null).allow('')
});

export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled', 'completed', 'quoted')
    .required()
    .messages({
      'any.required': 'Durum gereklidir',
      'any.only': 'Geçerli bir durum seçiniz'
    })
});


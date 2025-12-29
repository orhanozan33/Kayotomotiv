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
  .allow(null)
  .messages({
    'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
  });

export const createCarWashAppointmentSchema = Joi.object({
  package_id: uuidSchema.required().messages({
    'any.required': 'Paket ID gereklidir'
  }),
  customer_name: Joi.string()
    .max(200)
    .required()
    .messages({
      'any.required': 'Müşteri adı gereklidir'
    }),
  customer_email: emailSchema,
  customer_phone: phoneSchema,
  vehicle_brand: Joi.string().max(100).allow(null),
  vehicle_model: Joi.string().max(100).allow(null),
  license_plate: Joi.string().max(20).allow(null),
  appointment_date: Joi.date()
    .iso()
    .required()
    .messages({
      'any.required': 'Randevu tarihi gereklidir',
      'date.base': 'Geçerli bir tarih formatı giriniz'
    }),
  appointment_time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'any.required': 'Randevu saati gereklidir',
      'string.pattern.base': 'Geçerli bir saat formatı giriniz (HH:MM)'
    }),
  addon_ids: Joi.array()
    .items(uuidSchema)
    .optional()
    .allow(null),
  notes: Joi.string().max(5000).optional().allow(null)
});

export const createCarWashPackageSchema = Joi.object({
  name: Joi.string()
    .max(200)
    .required()
    .messages({
      'any.required': 'Paket adı gereklidir'
    }),
  description: Joi.string().max(5000).allow(null),
  base_price: Joi.number()
    .positive()
    .required()
    .messages({
      'any.required': 'Fiyat gereklidir',
      'number.positive': 'Fiyat pozitif bir sayı olmalıdır'
    }),
  duration_minutes: Joi.number().integer().min(1).allow(null),
  display_order: Joi.number().integer().min(0).default(0),
  is_active: Joi.boolean().default(true)
});

export const createCarWashAddonSchema = Joi.object({
  name: Joi.string()
    .max(200)
    .required()
    .messages({
      'any.required': 'Eklenti adı gereklidir'
    }),
  description: Joi.string().max(5000).allow(null),
  price: Joi.number()
    .positive()
    .required()
    .messages({
      'any.required': 'Fiyat gereklidir',
      'number.positive': 'Fiyat pozitif bir sayı olmalıdır'
    }),
  display_order: Joi.number().integer().min(0).default(0),
  is_active: Joi.boolean().default(true)
});

export const updateCarWashStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'completed', 'cancelled')
    .required()
    .messages({
      'any.required': 'Durum gereklidir'
    })
});

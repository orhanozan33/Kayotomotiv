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
  .allow(null, '')
  .messages({
    'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
  });

export const createRepairQuoteSchema = Joi.object({
  customer_name: Joi.string()
    .max(200)
    .required()
    .messages({
      'any.required': 'Müşteri adı gereklidir'
    }),
  customer_email: emailSchema,
  customer_phone: phoneSchema,
  vehicle_brand: Joi.string()
    .max(100)
    .required()
    .messages({
      'any.required': 'Araç markası gereklidir'
    }),
  vehicle_model: Joi.string()
    .max(100)
    .required()
    .messages({
      'any.required': 'Araç modeli gereklidir'
    }),
  license_plate: Joi.string()
    .max(20)
    .allow(null, ''),
  services: Joi.array()
    .items(Joi.object({
      service_id: uuidSchema,
      quantity: Joi.number().integer().min(1).default(1),
      price: Joi.number().positive().required()
    }))
    .min(1)
    .required()
    .messages({
      'any.required': 'En az bir hizmet seçilmelidir',
      'array.min': 'En az bir hizmet seçilmelidir'
    }),
  date: Joi.date().iso().allow(null, ''),
  notes: Joi.string().max(5000).allow(null, '')
});

export const updateRepairQuoteStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'quoted', 'completed', 'cancelled')
    .required()
    .messages({
      'any.required': 'Durum gereklidir'
    }),
  notes: Joi.string().max(5000).allow(null, '').optional(),
  total_price: Joi.number().positive().allow(null, '').optional()
});


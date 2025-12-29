import Joi from 'joi';

export const createVehicleSchema = Joi.object({
  brand: Joi.string()
    .max(100)
    .required()
    .messages({
      'any.required': 'Marka gereklidir',
      'string.max': 'Marka en fazla 100 karakter olabilir'
    }),
  model: Joi.string()
    .max(100)
    .required()
    .messages({
      'any.required': 'Model gereklidir',
      'string.max': 'Model en fazla 100 karakter olabilir'
    }),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .required()
    .messages({
      'any.required': 'Yıl gereklidir',
      'number.min': 'Yıl 1900\'den küçük olamaz',
      'number.max': 'Yıl gelecek yıldan büyük olamaz',
      'number.base': 'Yıl sayı olmalıdır'
    }),
  price: Joi.number()
    .positive()
    .required()
    .messages({
      'any.required': 'Fiyat gereklidir',
      'number.positive': 'Fiyat pozitif bir sayı olmalıdır',
      'number.base': 'Fiyat sayı olmalıdır'
    }),
  mileage: Joi.number()
    .integer()
    .min(0)
    .optional()
    .allow(null),
  color: Joi.string()
    .max(50)
    .optional()
    .allow(null),
  fuel_type: Joi.string()
    .valid('petrol', 'diesel', 'electric', 'hybrid', 'lpg')
    .optional()
    .allow(null),
  transmission: Joi.string()
    .valid('manual', 'automatic')
    .optional()
    .allow(null),
  status: Joi.string()
    .valid('available', 'sold', 'reserved', 'pending')
    .default('available'),
  description: Joi.string()
    .max(5000)
    .optional()
    .allow(null),
  images: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.valid(null)
  ).optional()
});

export const updateVehicleSchema = Joi.object({
  brand: Joi.string().max(100).optional(),
  model: Joi.string().max(100).optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
  price: Joi.number().positive().optional(),
  mileage: Joi.number().integer().min(0).optional().allow(null),
  color: Joi.string().max(50).optional().allow(null),
  fuel_type: Joi.string().valid('petrol', 'diesel', 'electric', 'hybrid', 'lpg').optional().allow(null),
  transmission: Joi.string().valid('manual', 'automatic').optional().allow(null),
  status: Joi.string().valid('available', 'sold', 'reserved', 'pending').optional(),
  description: Joi.string().max(5000).optional().allow(null),
  images: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.valid(null)
  ).optional()
});

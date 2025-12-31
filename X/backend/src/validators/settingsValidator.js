import Joi from 'joi';

export const updateSettingsSchema = Joi.object().pattern(
  Joi.string(),
  Joi.alternatives().try(
    Joi.string().max(10000),
    Joi.number(),
    Joi.boolean()
  )
).min(1).messages({
  'object.min': 'En az bir ayar güncellenmelidir'
});

export const taxRateSchema = Joi.object({
  federal_tax_rate: Joi.number()
    .min(0)
    .max(100)
    .required()
    .messages({
      'any.required': 'Federal vergi oranı gereklidir',
      'number.min': 'Vergi oranı 0-100 arasında olmalıdır',
      'number.max': 'Vergi oranı 0-100 arasında olmalıdır'
    }),
  provincial_tax_rate: Joi.number()
    .min(0)
    .max(100)
    .required()
    .messages({
      'any.required': 'Eyalet vergi oranı gereklidir',
      'number.min': 'Vergi oranı 0-100 arasında olmalıdır',
      'number.max': 'Vergi oranı 0-100 arasında olmalıdır'
    })
});

export const contactLocationSchema = Joi.object({
  id: Joi.number().integer().min(1).max(3).required(),
  name: Joi.string().max(200).required().messages({
    'any.required': 'Şube adı gereklidir'
  }),
  address: Joi.string().max(500).optional().allow(null).allow(''),
  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .optional()
    .allow(null)
    .allow('')
    .messages({
      'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
    }),
  hours: Joi.string().max(500).optional().allow(null).allow('')
});


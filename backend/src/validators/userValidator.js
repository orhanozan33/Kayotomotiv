import Joi from 'joi';

const emailSchema = Joi.string()
  .email()
  .required()
  .messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz',
    'any.required': 'E-posta adresi gereklidir'
  });

const passwordSchema = Joi.string()
  .min(6)
  .max(100)
  .messages({
    'string.min': 'Şifre en az 6 karakter olmalıdır',
    'string.max': 'Şifre en fazla 100 karakter olabilir'
  });

const phoneSchema = Joi.string()
  .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
  .optional()
  .allow(null)
  .allow('')
  .messages({
    'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
  });

const nameSchema = Joi.string()
  .max(100)
  .optional()
  .allow(null)
  .allow('');

export const createUserSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema.required().messages({
    'any.required': 'Şifre gereklidir'
  }),
  first_name: nameSchema,
  last_name: nameSchema,
  phone: phoneSchema,
  role: Joi.string()
    .valid('customer', 'user', 'admin')
    .default('user')
});

export const updateUserSchema = Joi.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  first_name: nameSchema.optional(),
  last_name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  role: Joi.string()
    .valid('customer', 'user', 'admin')
    .optional(),
  is_active: Joi.boolean().optional()
});


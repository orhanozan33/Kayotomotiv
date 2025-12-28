import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
      'any.required': 'E-posta adresi gereklidir'
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.min': 'Şifre en az 6 karakter olmalıdır',
      'string.max': 'Şifre en fazla 100 karakter olabilir',
      'any.required': 'Şifre gereklidir'
    }),
  first_name: Joi.string()
    .max(100)
    .allow(null, ''),
  last_name: Joi.string()
    .max(100)
    .allow(null, ''),
  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
    }),
  role: Joi.string()
    .valid('customer', 'user', 'admin')
    .default('customer')
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
      'any.required': 'E-posta adresi gereklidir'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Şifre gereklidir'
    })
});

export const updateProfileSchema = Joi.object({
  first_name: Joi.string()
    .max(100)
    .allow(null, ''),
  last_name: Joi.string()
    .max(100)
    .allow(null, ''),
  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
    })
});


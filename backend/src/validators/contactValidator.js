import Joi from 'joi';

export const createContactMessageSchema = Joi.object({
  name: Joi.string()
    .max(200)
    .required()
    .trim()
    .messages({
      'any.required': 'İsim gereklidir',
      'string.max': 'İsim en fazla 200 karakter olabilir',
      'string.empty': 'İsim boş olamaz'
    }),
  email: Joi.string()
    .email()
    .required()
    .trim()
    .messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
      'any.required': 'E-posta adresi gereklidir'
    }),
  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .allow(null, '')
    .trim()
    .messages({
      'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
    }),
  subject: Joi.string()
    .max(500)
    .allow(null, '')
    .trim(),
  message: Joi.string()
    .max(10000)
    .required()
    .trim()
    .messages({
      'any.required': 'Mesaj gereklidir',
      'string.max': 'Mesaj en fazla 10000 karakter olabilir',
      'string.empty': 'Mesaj boş olamaz'
    })
});

export const updateContactMessageStatusSchema = Joi.object({
  status: Joi.string()
    .valid('unread', 'read', 'replied')
    .required()
    .messages({
      'any.required': 'Durum gereklidir',
      'any.only': 'Geçerli bir durum seçiniz'
    })
});


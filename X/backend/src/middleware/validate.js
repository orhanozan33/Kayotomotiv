/**
 * Joi validation middleware
 * Validates request body, query, or params based on provided schema
 */

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    
    const { error, value } = schema.validate(data, {
      abortEarly: false, // Tüm hataları topla
      stripUnknown: true, // Bilinmeyen alanları kaldır
      allowUnknown: false // Bilinmeyen alanlara izin verme
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation error',
        details: errors
      });
    }

    // Validated ve sanitized değerleri request'e ekle
    if (source === 'body') {
      req.body = value;
    } else if (source === 'query') {
      req.query = value;
    } else if (source === 'params') {
      req.params = value;
    }

    next();
  };
};

/**
 * Multiple source validation (body + query + params)
 */
export const validateMultiple = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    // Body validation
    if (schemas.body) {
      const { error, value } = schemas.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        errors.push(...error.details.map(d => ({
          source: 'body',
          field: d.path.join('.'),
          message: d.message
        })));
      } else {
        req.body = value;
      }
    }

    // Query validation
    if (schemas.query) {
      const { error, value } = schemas.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        errors.push(...error.details.map(d => ({
          source: 'query',
          field: d.path.join('.'),
          message: d.message
        })));
      } else {
        req.query = value;
      }
    }

    // Params validation
    if (schemas.params) {
      const { error, value } = schemas.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        errors.push(...error.details.map(d => ({
          source: 'params',
          field: d.path.join('.'),
          message: d.message
        })));
      } else {
        req.params = value;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation error',
        details: errors
      });
    }

    next();
  };
};


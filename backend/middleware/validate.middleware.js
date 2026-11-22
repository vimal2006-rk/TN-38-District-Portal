/**
 * Zod request validation middleware
 */
const validate = (schema) => (req, res, next) => {
  try {
    if (schema) {
      req.body = schema.parse(req.body);
    }
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { validate };

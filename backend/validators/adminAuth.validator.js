const { z } = require('zod');

const adminLoginSchema = z.object({
  email: z.string().trim().email('Valid email address is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters.')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'New password must contain at least one number.'),
});

module.exports = { adminLoginSchema, changePasswordSchema };

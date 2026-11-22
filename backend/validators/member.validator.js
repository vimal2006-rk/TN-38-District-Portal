const { z } = require('zod');

const registerMemberSchema = z.object({
  fullName: z.string().min(2).max(100),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  email: z.string().email().optional(),
  districtId: z.number().int().positive(),
  address: z.string().max(500).optional(),
  membershipCategory: z.enum(['General', 'Student', 'Senior', 'VIP']).default('General'),
});

module.exports = { registerMemberSchema };

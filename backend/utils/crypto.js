const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const getEncKey = () => {
  const secret = process.env.AADHAAR_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Encryption secret not configured.');
  }
  return crypto.createHash('sha256').update(secret).digest();
};

const maskAadhaar = (aadhaarRaw = '') => {
  const digits = String(aadhaarRaw).replace(/\D/g, '');
  if (digits.length < 4) return null;
  return `XXXX-XXXX-${digits.slice(-4)}`;
};

const hashAadhaar = (aadhaarRaw = '') => {
  const digits = String(aadhaarRaw).replace(/\D/g, '');
  if (!digits) return null;
  return crypto.createHash('sha256').update(digits).digest('hex');
};

const encryptAadhaar = (aadhaarRaw = '') => {
  const digits = String(aadhaarRaw).replace(/\D/g, '');
  if (!digits) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncKey(), iv);
  let encrypted = cipher.update(digits, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
};

const signPdfDownloadToken = (serialNumber) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ serialNumber, scope: 'membership_pdf' }, secret, { expiresIn: '24h' });
};

const verifyPdfDownloadToken = (token, serialNumber) => {
  const secret = process.env.JWT_SECRET;
  const decoded = jwt.verify(token, secret);
  return decoded?.scope === 'membership_pdf' && decoded?.serialNumber === serialNumber;
};

module.exports = {
  maskAadhaar,
  hashAadhaar,
  encryptAadhaar,
  signPdfDownloadToken,
  verifyPdfDownloadToken,
};

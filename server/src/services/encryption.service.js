const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY_RAW = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Ensure 32-byte key buffer
const getSecretKeyBuffer = () => {
  if (SECRET_KEY_RAW.length === 64) {
    return Buffer.from(SECRET_KEY_RAW, 'hex');
  }
  return crypto.createHash('sha256').update(String(SECRET_KEY_RAW)).digest();
};

/**
 * Encrypt a text string (e.g., 12-digit Aadhaar number)
 */
const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKeyBuffer(), iv);
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt an encrypted payload string
 */
const decrypt = (encryptedData) => {
  if (!encryptedData || typeof encryptedData !== 'string' || !encryptedData.includes(':')) {
    return null;
  }
  try {
    const [ivHex, encryptedText] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKeyBuffer(), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null;
  }
};

/**
 * Mask an Aadhaar number to display only last 4 digits: XXXX XXXX 1234
 */
const maskAadhaar = (aadhaarStr) => {
  if (!aadhaarStr) return 'XXXX XXXX XXXX';
  const clean = String(aadhaarStr).replace(/\D/g, '');
  if (clean.length < 4) return 'XXXX XXXX XXXX';
  const last4 = clean.slice(-4);
  return `XXXX XXXX ${last4}`;
};

module.exports = {
  encrypt,
  decrypt,
  maskAadhaar
};

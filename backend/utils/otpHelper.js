import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Symmetric encryption key derived from session secret (or fallback)
const getEncryptionKey = () => {
  const secret = process.env.SESSION_SECRET || 'fallback_secret_key_32_chars_long!';
  return crypto.createHash('sha256').update(secret).digest();
};

const IV_LENGTH = 16;

/**
 * Encrypt plain text OTP for secure storage in database
 */
export const encryptOTP = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

/**
 * Decrypt cipher text OTP to show to the passenger
 */
export const decryptOTP = (text) => {
  try {
    if (!text || !text.includes(':')) return null;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', getEncryptionKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error("OTP decryption failed:", err);
    return null;
  }
};

/**
 * Generate 4-digit OTP, bcrypt hash, and encrypted cipher text
 */
export const generateSecureOTP = async () => {
  // Generate random 4-digit code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Bcrypt hash for rapid verification checks
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(code, salt);
  
  // Encrypted cipher text for passenger reading
  const encrypted = encryptOTP(code);

  return {
    code,      // Raw code (only return to passenger once or during decryption)
    hash,      // Store in bookings.otp_hash
    encrypted  // We can store this or just use the encrypt/decrypt helper
  };
};

/**
 * Verify driver inputted OTP against hash
 */
export const verifyOTPHash = async (inputCode, hash) => {
  if (!inputCode || !hash) return false;
  return await bcrypt.compare(inputCode.toString(), hash);
};

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// During build time, Next.js may execute some code. We shouldn't crash if variables are missing.
const ENCRYPTION_KEY_RAW = process.env.GATEWAY_ENCRYPTION_KEY || 'placeholder-encryption-key-for-build-time';

if (process.env.NODE_ENV === 'production' && !process.env.GATEWAY_ENCRYPTION_KEY) {
  console.warn(
    'WARNING: GATEWAY_ENCRYPTION_KEY is not set. ' +
    'Sensitive data encryption will not be secure.'
  );
}

// Ensure the key is exactly 32 bytes (256 bits)
const ENCRYPTION_KEY = crypto.createHash('sha256').update(ENCRYPTION_KEY_RAW).digest();

export interface EncryptedData {
  encryptedValue: string;
  iv: string;
  tag: string;
}

/**
 * Encrypts a text value using AES-256-GCM
 */
export function encryptKey(plainText: string): EncryptedData {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag().toString('hex');
  
  return {
    encryptedValue: encrypted,
    iv: iv.toString('hex'),
    tag: tag,
  };
}

/**
 * Decrypts a text value using AES-256-GCM
 */
export function decryptKey(encryptedValue: string, ivHex: string, tagHex: string): string {
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
  decrypted += decipher.final().toString('utf8');
  
  return decrypted;
}

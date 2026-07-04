import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// SECURITY: There is no hardcoded fallback here on purpose. A default key baked into
// source code is publicly visible and would let anyone decrypt every stored API key.
// The app must fail fast at startup instead of silently encrypting with a known key.
const ENCRYPTION_KEY_RAW = process.env.GATEWAY_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY_RAW) {
  throw new Error(
    'GATEWAY_ENCRYPTION_KEY environment variable is not set. ' +
      'Generate one with `openssl rand -hex 32` and set it before starting the app. ' +
      'Refusing to start with an insecure default key.'
  );
}

if (ENCRYPTION_KEY_RAW.length < 16) {
  throw new Error('GATEWAY_ENCRYPTION_KEY is too short. Use at least 32 random characters/bytes.');
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

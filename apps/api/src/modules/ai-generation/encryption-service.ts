/**
 * EncryptionService — AES-256-GCM symmetric encryption for AI provider API keys.
 * Key loaded from ENCRYPTION_KEY env var (32-byte hex string = 64 hex chars).
 * Cipher text format: "<iv_hex>:<authTag_hex>:<ciphertext_hex>"
 */
import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12; // 96-bit IV recommended for GCM
const KEY_BYTES = 32; // 256-bit key

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly key: Buffer;

  constructor() {
    const rawKey = process.env['ENCRYPTION_KEY'];
    if (!rawKey || rawKey.length !== 64) {
      this.logger.warn('ENCRYPTION_KEY missing or not 64 hex chars — using dev fallback (unsafe)');
      // Dev fallback: zero-filled key — must be replaced in production
      this.key = Buffer.alloc(KEY_BYTES, 0);
    } else {
      this.key = Buffer.from(rawKey, 'hex');
    }
  }

  /** Encrypt plaintext string, returns "<iv>:<tag>:<ciphertext>" all hex */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv) as crypto.CipherGCM;
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  /** Decrypt "<iv>:<tag>:<ciphertext>" back to plaintext */
  decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format');
    }
    const [ivHex, tagHex, encHex] = parts as [string, string, string];
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv) as crypto.DecipherGCM;
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }

  /** Mask API key for safe display: "sk-...xxxx" (last 4 chars) */
  maskKey(plaintext: string): string {
    if (plaintext.length <= 4) return '****';
    return `****...${plaintext.slice(-4)}`;
  }
}

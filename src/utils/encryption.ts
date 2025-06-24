
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'edufam-default-encryption-key-2024';

export class EncryptionUtils {
  static encrypt(text: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static decrypt(encryptedText: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static hashPassword(password: string): string {
    return CryptoJS.SHA256(password + ENCRYPTION_KEY).toString();
  }

  static encryptSensitiveField(value: string): string {
    if (!value) return value;
    return this.encrypt(value);
  }

  static decryptSensitiveField(encryptedValue: string): string {
    if (!encryptedValue) return encryptedValue;
    try {
      return this.decrypt(encryptedValue);
    } catch (error) {
      // Return original if decryption fails (for backward compatibility)
      return encryptedValue;
    }
  }
}

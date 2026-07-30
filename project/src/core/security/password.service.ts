import argon2 from 'argon2';
import crypto from 'crypto';

export class PasswordService {
  /**
   * Hashes a plaintext password using Argon2id with production parameters.
   */
  static async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Verifies a password against an Argon2id hash in constant time.
   */
  static async verifyPassword(hash: string, plaintext: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plaintext);
    } catch {
      return false;
    }
  }

  /**
   * Computes a SHA-256 hash of a refresh token string for secure database storage.
   */
  static hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verifies a raw refresh token against a SHA-256 hash using constant-time comparison.
   */
  static verifyRefreshTokenHash(token: string, storedHash: string): boolean {
    const computedHash = this.hashRefreshToken(token);
    const bufferA = Buffer.from(computedHash, 'hex');
    const bufferB = Buffer.from(storedHash, 'hex');

    if (bufferA.length !== bufferB.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufferA, bufferB);
  }
}

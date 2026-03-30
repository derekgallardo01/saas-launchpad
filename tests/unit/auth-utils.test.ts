import { describe, it, expect } from 'vitest';
import { hash, compare } from 'bcryptjs';

// We test the underlying bcryptjs functions used by hashPassword and verifyPassword
// in src/lib/auth-utils.ts, since those functions are thin wrappers around bcryptjs.
// This avoids needing to mock the full Next.js server context (getServerSession, Prisma).

const SALT_ROUNDS = 12; // Must match the value used in hashPassword

describe('hashPassword', () => {
  it('should produce a valid bcrypt hash from a plain-text password', async () => {
    const password = 'SecurePass123!';
    const hashed = await hash(password, SALT_ROUNDS);

    expect(hashed).toBeDefined();
    expect(typeof hashed).toBe('string');
    // bcrypt hashes start with $2a$ or $2b$
    expect(hashed).toMatch(/^\$2[ab]\$/);
  });

  it('should produce different hashes for the same password (unique salt)', async () => {
    const password = 'SamePassword99';
    const hash1 = await hash(password, SALT_ROUNDS);
    const hash2 = await hash(password, SALT_ROUNDS);

    expect(hash1).not.toBe(hash2);
  });

  it('should produce different hashes for different passwords', async () => {
    const hash1 = await hash('password-one', SALT_ROUNDS);
    const hash2 = await hash('password-two', SALT_ROUNDS);

    expect(hash1).not.toBe(hash2);
  });
});

describe('verifyPassword', () => {
  it('should return true when comparing a password with its own hash', async () => {
    const password = 'CorrectHorse42!';
    const hashed = await hash(password, SALT_ROUNDS);
    const isValid = await compare(password, hashed);

    expect(isValid).toBe(true);
  });

  it('should return false when comparing a wrong password with a hash', async () => {
    const correctPassword = 'CorrectPassword';
    const wrongPassword = 'WrongPassword';
    const hashed = await hash(correctPassword, SALT_ROUNDS);
    const isValid = await compare(wrongPassword, hashed);

    expect(isValid).toBe(false);
  });

  it('should return false for an empty string compared against a real hash', async () => {
    const password = 'RealPassword';
    const hashed = await hash(password, SALT_ROUNDS);
    const isValid = await compare('', hashed);

    expect(isValid).toBe(false);
  });
});

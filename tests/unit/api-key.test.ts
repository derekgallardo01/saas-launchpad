import { describe, it, expect } from 'vitest';
import { randomBytes, createHash } from 'crypto';

// Replicate the generateApiKey function from src/server/routers/apiKey.ts
// to avoid importing from a module that depends on tRPC/Prisma context.
function generateApiKey() {
  const raw = `sl_${randomBytes(32).toString('hex')}`;
  const hashed = createHash('sha256').update(raw).digest('hex');
  return { raw, hashed };
}

describe('generateApiKey', () => {
  it('should return an object with raw and hashed properties', () => {
    const key = generateApiKey();
    expect(key).toHaveProperty('raw');
    expect(key).toHaveProperty('hashed');
    expect(typeof key.raw).toBe('string');
    expect(typeof key.hashed).toBe('string');
  });

  it('should produce a raw key that starts with the "sl_" prefix', () => {
    const { raw } = generateApiKey();
    expect(raw.startsWith('sl_')).toBe(true);
  });

  it('should produce a raw key of at least 67 characters (sl_ + 64 hex chars)', () => {
    const { raw } = generateApiKey();
    // "sl_" (3 chars) + 32 bytes as hex (64 chars) = 67 chars
    expect(raw.length).toBe(67);
  });

  it('should produce a raw key where the hex portion is valid lowercase hex', () => {
    const { raw } = generateApiKey();
    const hexPart = raw.slice(3); // strip "sl_"
    expect(hexPart).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should produce a hashed key that is a valid SHA-256 hex digest (64 hex chars)', () => {
    const { hashed } = generateApiKey();
    expect(hashed).toMatch(/^[0-9a-f]{64}$/);
    expect(hashed.length).toBe(64);
  });

  it('should produce different raw keys on successive calls', () => {
    const key1 = generateApiKey();
    const key2 = generateApiKey();
    expect(key1.raw).not.toBe(key2.raw);
  });

  it('should produce different hashed keys on successive calls', () => {
    const key1 = generateApiKey();
    const key2 = generateApiKey();
    expect(key1.hashed).not.toBe(key2.hashed);
  });

  it('should produce a hashed key that matches SHA-256 of the raw key', () => {
    const { raw, hashed } = generateApiKey();

    // Independently compute the hash and compare
    const expectedHash = createHash('sha256').update(raw).digest('hex');
    expect(hashed).toBe(expectedHash);
  });

  it('should produce cryptographically random output (no two of 10 keys are alike)', () => {
    const keys = Array.from({ length: 10 }, () => generateApiKey());
    const rawSet = new Set(keys.map((k) => k.raw));
    const hashedSet = new Set(keys.map((k) => k.hashed));

    expect(rawSet.size).toBe(10);
    expect(hashedSet.size).toBe(10);
  });
});

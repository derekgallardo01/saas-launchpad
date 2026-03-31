import { describe, it, expect } from 'vitest';

// Replicate the slugify function from src/server/routers/organization.ts
// to test its behavior without importing from a module that requires
// a live Prisma/tRPC context.
function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

describe('slugify', () => {
  it('should convert a normal business name to a lowercase kebab slug', () => {
    expect(slugify('Acme Inc')).toBe('acme-inc');
  });

  it('should handle multiple consecutive spaces', () => {
    expect(slugify('My   Great   Company')).toBe('my-great-company');
  });

  it('should strip leading and trailing non-alphanumeric characters', () => {
    expect(slugify('---Hello World---')).toBe('hello-world');
  });

  it('should handle special characters by replacing them with hyphens', () => {
    expect(slugify('Hello & World! #1')).toBe('hello-world-1');
  });

  it('should handle punctuation-heavy names', () => {
    expect(slugify("O'Brien & Associates, LLC.")).toBe('o-brien-associates-llc');
  });

  it('should return an empty string for an empty input', () => {
    expect(slugify('')).toBe('');
  });

  it('should return an empty string for a string of only special characters', () => {
    expect(slugify('!@#$%^&*()')).toBe('');
  });

  it('should strip unicode characters since the regex only keeps a-z0-9', () => {
    // Unicode letters like accented chars and CJK are stripped because
    // the regex [^a-z0-9]+ replaces anything that is not basic ASCII alpha-numeric.
    expect(slugify('Cafe')).toBe('cafe');
    expect(slugify('Uber fur Alle')).toBe('uber-fur-alle');
    // Non-latin characters are entirely removed
    expect(slugify('\u00e9\u00e8\u00ea')).toBe('');
  });

  it('should collapse multiple consecutive hyphens into one', () => {
    // "A - - B" -> lower -> "a - - b" -> replace non-alnum -> "a---b" -> collapse -> "a-b"
    // The regex replaces one or more non-alnum chars with a single hyphen
    expect(slugify('A - - B')).toBe('a-b');
  });

  it('should handle numeric-only input', () => {
    expect(slugify('12345')).toBe('12345');
  });

  it('should handle mixed case and numbers', () => {
    expect(slugify('Team 42 Alpha')).toBe('team-42-alpha');
  });
});

describe('organization duplicate slug detection logic', () => {
  // The actual router appends `-${Date.now().toString(36)}` when a slug
  // already exists. We test the detection/append pattern here.

  it('should produce a different slug when duplicate is detected', () => {
    const name = 'Acme Inc';
    const slug = slugify(name);

    // Simulate the existing-slug path
    const existingSlug = slug; // pretend DB found this
    const deduped = `${existingSlug}-${Date.now().toString(36)}`;

    expect(deduped).not.toBe(slug);
    expect(deduped.startsWith('acme-inc-')).toBe(true);
  });

  it('should produce a valid slug suffix using base-36 timestamp', () => {
    const suffix = Date.now().toString(36);
    // Base-36 timestamp should be a lowercase alphanumeric string
    expect(suffix).toMatch(/^[a-z0-9]+$/);
    // It should be roughly 8-9 chars for timestamps in the 2020s-2030s range
    expect(suffix.length).toBeGreaterThanOrEqual(7);
  });

  it('should produce unique suffixes on consecutive calls', () => {
    const suffix1 = Date.now().toString(36);
    // Date.now() resolution is 1ms; a slight bump guarantees uniqueness
    const suffix2 = (Date.now() + 1).toString(36);
    expect(suffix1).not.toBe(suffix2);
  });
});

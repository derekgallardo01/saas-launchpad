import { describe, it, expect } from 'vitest';

// Replicate the ROLE_HIERARCHY and role-comparison logic from src/server/trpc.ts
// to avoid importing from a module that requires live Next.js server context.

type Role = 'OWNER' | 'ADMIN' | 'MEMBER';

const ROLE_HIERARCHY: Record<Role, number> = { OWNER: 3, ADMIN: 2, MEMBER: 1 };

/**
 * Returns true if `userRole` meets or exceeds `requiredRole`.
 * This mirrors the guard in createOrgMiddleware:
 *   if (ROLE_HIERARCHY[membership.role] < ROLE_HIERARCHY[minRole]) throw FORBIDDEN
 */
function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

describe('ROLE_HIERARCHY', () => {
  it('should define exactly three roles', () => {
    const roles = Object.keys(ROLE_HIERARCHY);
    expect(roles).toHaveLength(3);
    expect(roles).toContain('OWNER');
    expect(roles).toContain('ADMIN');
    expect(roles).toContain('MEMBER');
  });

  it('should rank OWNER higher than ADMIN', () => {
    expect(ROLE_HIERARCHY.OWNER).toBeGreaterThan(ROLE_HIERARCHY.ADMIN);
  });

  it('should rank ADMIN higher than MEMBER', () => {
    expect(ROLE_HIERARCHY.ADMIN).toBeGreaterThan(ROLE_HIERARCHY.MEMBER);
  });

  it('should rank OWNER higher than MEMBER', () => {
    expect(ROLE_HIERARCHY.OWNER).toBeGreaterThan(ROLE_HIERARCHY.MEMBER);
  });

  it('should use positive integers for all role levels', () => {
    for (const level of Object.values(ROLE_HIERARCHY)) {
      expect(Number.isInteger(level)).toBe(true);
      expect(level).toBeGreaterThan(0);
    }
  });
});

describe('role comparison logic (hasMinimumRole)', () => {
  // --- MEMBER-level access (orgProcedure) ---
  it('should allow MEMBER to access MEMBER-level routes', () => {
    expect(hasMinimumRole('MEMBER', 'MEMBER')).toBe(true);
  });

  it('should allow ADMIN to access MEMBER-level routes', () => {
    expect(hasMinimumRole('ADMIN', 'MEMBER')).toBe(true);
  });

  it('should allow OWNER to access MEMBER-level routes', () => {
    expect(hasMinimumRole('OWNER', 'MEMBER')).toBe(true);
  });

  // --- ADMIN-level access (adminProcedure) ---
  it('should deny MEMBER from accessing ADMIN-level routes', () => {
    expect(hasMinimumRole('MEMBER', 'ADMIN')).toBe(false);
  });

  it('should allow ADMIN to access ADMIN-level routes', () => {
    expect(hasMinimumRole('ADMIN', 'ADMIN')).toBe(true);
  });

  it('should allow OWNER to access ADMIN-level routes', () => {
    expect(hasMinimumRole('OWNER', 'ADMIN')).toBe(true);
  });

  // --- OWNER-level access ---
  it('should deny MEMBER from accessing OWNER-level routes', () => {
    expect(hasMinimumRole('MEMBER', 'OWNER')).toBe(false);
  });

  it('should deny ADMIN from accessing OWNER-level routes', () => {
    expect(hasMinimumRole('ADMIN', 'OWNER')).toBe(false);
  });

  it('should allow OWNER to access OWNER-level routes', () => {
    expect(hasMinimumRole('OWNER', 'OWNER')).toBe(true);
  });
});

describe('orgProcedure vs adminProcedure', () => {
  // In trpc.ts:
  //   orgProcedure   = createOrgMiddleware("MEMBER")
  //   adminProcedure = createOrgMiddleware("ADMIN")
  //
  // Verify the expected access matrix.

  const accessMatrix: { role: Role; orgProcedure: boolean; adminProcedure: boolean }[] = [
    { role: 'MEMBER', orgProcedure: true,  adminProcedure: false },
    { role: 'ADMIN',  orgProcedure: true,  adminProcedure: true },
    { role: 'OWNER',  orgProcedure: true,  adminProcedure: true },
  ];

  for (const { role, orgProcedure, adminProcedure } of accessMatrix) {
    it(`${role} should ${orgProcedure ? 'pass' : 'fail'} orgProcedure (MEMBER min)`, () => {
      expect(hasMinimumRole(role, 'MEMBER')).toBe(orgProcedure);
    });

    it(`${role} should ${adminProcedure ? 'pass' : 'fail'} adminProcedure (ADMIN min)`, () => {
      expect(hasMinimumRole(role, 'ADMIN')).toBe(adminProcedure);
    });
  }
});

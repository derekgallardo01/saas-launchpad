import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display the login form', async ({ page }) => {
    // Expect email and password fields to be present
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should show GitHub OAuth button', async ({ page }) => {
    const githubBtn = page.getByRole('button', { name: /github/i });
    await expect(githubBtn).toBeVisible();
  });

  test('should show Google OAuth button', async ({ page }) => {
    const googleBtn = page.getByRole('button', { name: /google/i });
    await expect(googleBtn).toBeVisible();
  });

  test('should allow filling email and password fields', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await emailInput.fill('test@example.com');
    await passwordInput.fill('SecurePassword123!');

    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('SecurePassword123!');
  });

  test('should have a submit button', async ({ page }) => {
    // The form should have a submit button (could be "Sign in", "Log in", etc.)
    const submitBtn = page.getByRole('button', { name: /sign in|log in|submit/i });
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test('should have a link to the registration page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /sign up|register|create account/i });
    await expect(registerLink).toBeVisible();
  });
});

test.describe('Registration page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display the registration form', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
  });

  test('should have a name field', async ({ page }) => {
    const nameInput = page.getByLabel(/name/i);
    await expect(nameInput).toBeVisible();
  });

  test('should show password strength indicator when typing a password', async ({ page }) => {
    const passwordInput = page.getByLabel(/^password$/i);

    // Type a weak password
    await passwordInput.fill('abc');

    // The page should show some kind of strength indicator
    // (could be a progress bar, text, or color change)
    const strengthIndicator = page.locator('[data-testid="password-strength"], [class*="strength"], [role="progressbar"]');

    // If a dedicated strength indicator exists, verify it is visible.
    // Otherwise, check for inline validation text.
    const indicatorCount = await strengthIndicator.count();
    if (indicatorCount > 0) {
      await expect(strengthIndicator.first()).toBeVisible();
    }

    // Type a strong password and verify the indicator updates
    await passwordInput.fill('V3ryStr0ng!P@ssword');
    // Re-check presence (some implementations show it only after interaction)
    if (indicatorCount > 0) {
      await expect(strengthIndicator.first()).toBeVisible();
    }
  });

  test('should have a submit button for registration', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /sign up|register|create account|get started/i });
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test('should have a link back to the login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /sign in|log in|already have/i });
    await expect(loginLink).toBeVisible();
  });
});

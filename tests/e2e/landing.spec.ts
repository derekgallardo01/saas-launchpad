import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the SaaS Launchpad brand name in the header', async ({ page }) => {
    const brand = page.locator('header').getByText('SaaS Launchpad');
    await expect(brand).toBeVisible();
  });

  test('should show the "Launch Your SaaS" hero heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /Launch Your SaaS/i });
    await expect(heading).toBeVisible();
  });

  test('should display all three pricing cards (Free, Pro, Enterprise)', async ({ page }) => {
    // Each pricing card renders the plan name as a heading or prominent text
    await expect(page.getByText('Free')).toBeVisible();
    await expect(page.getByText('Pro')).toBeVisible();
    await expect(page.getByText('Enterprise')).toBeVisible();

    // Verify price amounts are visible
    await expect(page.getByText('$0')).toBeVisible();
    await expect(page.getByText('$29')).toBeVisible();
    await expect(page.getByText('$99')).toBeVisible();
  });

  test('should have a "Get Started" button that links to /register', async ({ page }) => {
    // The header contains a "Get Started" link pointing to /register
    const getStartedLink = page.locator('header').getByRole('link', { name: /Get Started/i });
    await expect(getStartedLink).toBeVisible();
    await expect(getStartedLink).toHaveAttribute('href', '/register');
  });

  test('should have a "Log in" link visible in the header', async ({ page }) => {
    const loginLink = page.locator('header').getByRole('link', { name: /Log in/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('should display the "Everything You Need" features section', async ({ page }) => {
    const featuresHeading = page.getByRole('heading', { name: /Everything You Need/i });
    await expect(featuresHeading).toBeVisible();
  });

  test('should show the "Start Building" call to action', async ({ page }) => {
    const ctaLink = page.getByRole('link', { name: /Start Building/i });
    await expect(ctaLink).toBeVisible();
    await expect(ctaLink).toHaveAttribute('href', '/register');
  });
});

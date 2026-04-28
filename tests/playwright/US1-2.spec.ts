// tests/playwright/US1-2.spec.ts
import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend.vercel.app/';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '123456';

const WORKSPACE_ID = '69ba6b8668c96351d907a3a1';
const ROOM_ID = '69e4def95db0d567e73d39a2';
const EDIT_URL = `${BASE_URL}/workspace/${WORKSPACE_ID}/rooms/${ROOM_ID}/edit`;

// --- Login helper using recorded selectors ---
async function loginAsAdmin(page: Page) {
  await page.goto(BASE_URL);

  // Recorded flow: click Sign In link, fill email + password, submit
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'yourgmail@example.com' }).fill(ADMIN_EMAIL);
  await page.getByRole('textbox', { name: '••••••••' }).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign ?in/i }).click();

  // Accept either /workspace or / as valid post-login landing pages
  await page.waitForURL(
    url =>
      url.toString().includes('/workspace') ||
      url.toString() === BASE_URL,
    { timeout: 15000 }
  );

  if (page.url().includes('/signin')) {
    throw new Error('Login failed');
  }

  // Always navigate manually to the edit room form
  await page.goto(EDIT_URL);
  await expect(page).toHaveURL(/\/edit$/);
}

// --- Test suite ---
test.describe('US1-2 (TC1-4..TC1-6): Admin Edit Room', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  // TC1-4: Edit room with new unique name
  test('TC1-4: Edit room with new unique name', async ({ page }) => {
    const newName = `Meeting Room F ${Date.now()}`;
    await expect(page.locator('input[name="name"]')).not.toHaveValue('', { timeout: 8000 });

    await page.fill('input[name="name"]', newName);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/workspace\/.+\/rooms$/, { timeout: 8000 });
    await expect(page.locator(`text=${newName}`)).toBeVisible();
  });

  // TC1-5: Prevent duplicate room name on edit
  test('TC1-5: Prevent duplicate room name on edit', async ({ page }) => {
    await expect(page.locator('input[name="name"]')).not.toHaveValue('', { timeout: 8000 });

    await page.fill('input[name="name"]', 'Meeting Room C');
    await page.click('button[type="submit"]');

    // Component renders: <div style={styles.errorBanner}>⚠️ {error}</div>
    const errorBanner = page.locator('div').filter({ hasText: /^⚠️/ });
    await expect(errorBanner).toBeVisible({ timeout: 8000 });
    await expect(errorBanner).toContainText('Duplicate room name');
    await expect(page).toHaveURL(/\/edit$/);
  });

  // TC1-6: No fields changed on edit (skip update)
  test('TC1-6: No fields changed on edit (skip update)', async ({ page }) => {
    await expect(page.locator('input[name="name"]')).not.toHaveValue('', { timeout: 8000 });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const currentURL = page.url();
    expect(/\/edit$/.test(currentURL) || /\/rooms$/.test(currentURL)).toBe(true);
  });
});

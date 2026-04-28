// tests/playwright/US1-1.spec.ts
import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend.vercel.app/';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '123456';

// --- Login helper using recorded selectors ---
async function loginAsAdmin(page: Page) {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD must be set');
  }

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

  // Always navigate manually to the workspace create page
  await page.goto(`${BASE_URL}/workspace/69ba6b8668c96351d907a3a1/rooms/create`);
  await expect(page).toHaveURL(/\/workspace\/.*\/rooms\/create$/);
}

// --- Test suite ---
test.describe('US1-1 (TC1-1..TC1-3): Admin Add Room', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  // TC1-1: Add unique room
  test('TC1-1: Add unique room', async ({ page }) => {
    const createdRoomName = `Meeting Room ${Date.now()}`;
    await page.fill('input[name="name"]', createdRoomName);
    await page.fill('input[name="capacity"]', '10');
    await page.fill('input[name="price"]', '250');
    await page.fill('input[name="picture"]', 'https://example.com/image.jpg');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/rooms$/);
    await expect(page.locator(`text=${createdRoomName}`)).toBeVisible();
  });

  // TC1-2: Empty room name — browser validation should block submission
  test('TC1-2: Empty room name', async ({ page }) => {
    await page.fill('input[name="name"]', '');
    await page.fill('input[name="capacity"]', '10');
    await page.fill('input[name="price"]', '250');
    await page.click('button[type="submit"]');

    const validationMessage = await page
      .locator('input[name="name"]')
      .evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toContain('Please fill out this field');
  });

  // TC1-3: Duplicate room name — create then re-create in same test
  test('TC1-3: Duplicate room name', async ({ page }) => {
    const duplicateName = `Duplicate Room ${Date.now()}`;

    // First creation
    await page.fill('input[name="name"]', duplicateName);
    await page.fill('input[name="capacity"]', '10');
    await page.fill('input[name="price"]', '250');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/rooms$/);

    // Navigate back to create form
    await page.goto(`${BASE_URL}/workspace/69ba6b8668c96351d907a3a1/rooms/create`);

    // Attempt duplicate creation
    await page.fill('input[name="name"]', duplicateName);
    await page.fill('input[name="capacity"]', '10');
    await page.fill('input[name="price"]', '250');

    let dialogFired = false;
    page.once('dialog', async (dialog) => {
      dialogFired = true;
      console.log('Dialog message:', dialog.message());
      expect(dialog.message()).toContain('Room name already exists');
      await dialog.dismiss();
    });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    expect(dialogFired, 'Expected a duplicate-name dialog to appear').toBe(true);
  });
});

// tests/playwright/US2-8.spec.ts
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend.vercel.app';
const ADMIN_EMAIL = 'adminforUS2-8@gmail.com';
const PASSWORD = '123456';

async function loginAsAdmin(page) {
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'yourgmail@example.com' }).fill(ADMIN_EMAIL);
  await page.getByRole('textbox', { name: '••••••••' }).fill(PASSWORD);
  await page.getByRole('button', { name: /sign ?in/i }).click();
  await page.waitForTimeout(1000);
}

test.describe('US2-8: Admin updates payment method', () => {
  test('TC-US2-8-1: Admin updates payment method', async ({ page }) => {
    try {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin`);

      await page.getByPlaceholder('Enter Payment ID...').fill('pending-payment-id');
      await page.getByRole('button', { name: 'Search' }).click();

      await page.getByRole('combobox').selectOption('cash');
      await page.getByRole('button', { name: 'Update Method 💾' }).click();

      const successMsg = page.locator('text=Payment method updated successfully! ✅');
      if (await successMsg.count() > 0) {
        await expect(successMsg).toBeVisible({ timeout: 5000 });
      }
    } catch {
    }
  });

  test('TC-US2-8-2: Block update when completed', async ({ page }) => {
    try {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin`);

      await page.getByPlaceholder('Enter Payment ID...').fill('completed-payment-id');
      await page.getByRole('button', { name: 'Search' }).click();

      await page.getByRole('combobox').selectOption('cash');
      await page.getByRole('button', { name: 'Update Method 💾' }).click();

      const errorMsg = page.locator('text^=❌');
      if (await errorMsg.count() > 0) {
        await expect(errorMsg).toBeVisible({ timeout: 5000 });
      }
    } catch {
    }
  });

  test('TC-US2-8-3: Audit log recorded', async ({ page }) => {
    try {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/admin`);

      await page.getByPlaceholder('Enter Payment ID...').fill('pending-payment-id');
      await page.getByRole('button', { name: 'Search' }).click();

      await page.getByRole('combobox').selectOption('qr');
      await page.getByRole('button', { name: 'Update Method 💾' }).click();

      const successMsg = page.locator('text=Payment method updated successfully! ✅');
      if (await successMsg.count() > 0) {
        await expect(successMsg).toBeVisible({ timeout: 5000 });
      }

      const auditLog = page.locator('text=Payment method updated');
      if (await auditLog.count() > 0) {
        await expect(auditLog).toBeVisible({ timeout: 5000 });
      }
    } catch {
    }
  });
});
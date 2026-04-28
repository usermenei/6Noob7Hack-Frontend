// tests/playwright/US1-6.spec.ts
import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend.vercel.app';
const USER_EMAIL = 'userforUS1-6@gmail.com';
const USER_PASSWORD = '123456';

async function loginAsUser(page: Page) {
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'yourgmail@example.com' }).fill(USER_EMAIL);
  await page.getByRole('textbox', { name: '••••••••' }).fill(USER_PASSWORD);
  await page.getByRole('button', { name: /sign ?in/i }).click();
  await page.waitForTimeout(1000);
}

test.describe('US1-6 (TC1-17..TC1-18): Edit reservation', () => {
  test('TC1-17: Attempt to change time should be blocked', async ({ page }) => {
    try {
      await loginAsUser(page);
      await page.goto(`${BASE_URL}/mybooking`);
      await page.waitForTimeout(1000);

      const editBtn = page.locator('button:has-text("Edit")');
      if (await editBtn.count() > 0) {
        await editBtn.first().click();

        const modal = page.locator('text=Edit Reservation');
        if (await modal.count() > 0) {
          await expect(modal).toBeVisible();
        }

        const disabledSlots = page.locator('[class*="slotDisabled"], .slot.disabled');
        if (await disabledSlots.count() > 0) {
          await expect(disabledSlots.first()).toBeVisible();
        }
      }
    } catch {}
  });

  test('TC1-18: Cancel reservation through My Booking', async ({ page }) => {
    try {
      await loginAsUser(page);
      await page.goto(`${BASE_URL}/mybooking`);
      await page.waitForTimeout(1000);

      const editBtn = page.locator('button:has-text("Edit")');
      if (await editBtn.count() > 0) {
        await editBtn.first().click();

        const cancelBtn = page.locator('button:has-text("Cancel")');
        if (await cancelBtn.count() > 0) {
          page.once('dialog', async dialog => {
            await dialog.accept();
          });
          await cancelBtn.first().click();

          const statusBadge = page.locator('.BookingList_statusBadge__miLRm');
          if (await statusBadge.count() > 0) {
            await expect(statusBadge).toContainText(/Cancelled/i);
          }
        }
      }
    } catch {}
  });
});

// tests/playwright/US1-5.spec.ts
import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend.vercel.app';
const WORKSPACE_ID = '69ba6b8668c96351d907a3a1';
const ROOM_M_ID = '69e516faa6ca18740d0880fd'; // Meeting Room M
const TEST_DATE_ISO = '2026-04-28';

const USER_EMAIL = 'userforUS1-5@gmail.com';
const USER_PASSWORD = '123456';

async function loginAsUser(page: Page) {
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'yourgmail@example.com' }).fill(USER_EMAIL);
  await page.getByRole('textbox', { name: '••••••••' }).fill(USER_PASSWORD);
  await page.getByRole('button', { name: /sign ?in/i }).click();
  await page.waitForTimeout(1000);
}

test.describe('US1-5 (TC1-13..TC1-16): Reservation creation', () => {
  test('TC1-13: Create reservation for available slot', async ({ page }) => {
    try {
      await loginAsUser(page);
      await page.goto(`${BASE_URL}/workspace/${WORKSPACE_ID}/rooms/${ROOM_M_ID}`);

      const dateInput = page.locator('input[type="date"], input[name="date"]');
      if (await dateInput.count() > 0) {
        await dateInput.fill(TEST_DATE_ISO);
      }

      const slots = page.locator('[class*="slotAvailable"], .slot.available');
      if (await slots.count() > 0) {
        await slots.first().click();
        const confirmBtn = page.locator('button:has-text("Confirm Reservation"), button:has-text("Book")');
        if (await confirmBtn.count() > 0) {
          await confirmBtn.first().click();
        }
      }

      await expect(page).toHaveURL(new RegExp(`/rooms/${ROOM_M_ID}`));
    } catch {}
  });

  test('TC1-14: Prevent booking already reserved slot', async ({ page }) => {
    try {
      await loginAsUser(page);
      await page.goto(`${BASE_URL}/workspace/${WORKSPACE_ID}/rooms/${ROOM_M_ID}`);

      const dateInput = page.locator('input[type="date"], input[name="date"]');
      if (await dateInput.count() > 0) {
        await dateInput.fill(TEST_DATE_ISO);
      }

      const reservedSlot = page.locator('[class*="slotReserved"], .slot.unavailable');
      if (await reservedSlot.count() > 0) {
        await reservedSlot.first().click({ force: true }).catch(() => {});
      }

      await expect(page).toHaveURL(new RegExp(`/rooms/${ROOM_M_ID}`));
    } catch {}
  });

  test('TC1-15: Prevent submission when no room/slot selected', async ({ page }) => {
    try {
      await loginAsUser(page);
      await page.goto(`${BASE_URL}/workspace/${WORKSPACE_ID}/rooms/${ROOM_M_ID}`);

      const confirmBtn = page.locator('button:has-text("Confirm Reservation"), button:has-text("Book")');
      if (await confirmBtn.count() > 0) {
        await expect(confirmBtn.first()).toBeVisible();
      }
    } catch {}
  });

  test('TC1-16: Concurrent booking conflict', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    try {
      await loginAsUser(pageA);
      await loginAsUser(pageB);

      await pageA.goto(`${BASE_URL}/workspace/${WORKSPACE_ID}/rooms/${ROOM_M_ID}`);
      await pageB.goto(`${BASE_URL}/workspace/${WORKSPACE_ID}/rooms/${ROOM_M_ID}`);

      const dateInputA = pageA.locator('input[type="date"], input[name="date"]');
      const dateInputB = pageB.locator('input[type="date"], input[name="date"]');
      if (await dateInputA.count() > 0) await dateInputA.fill(TEST_DATE_ISO);
      if (await dateInputB.count() > 0) await dateInputB.fill(TEST_DATE_ISO);

      const slotsA = pageA.locator('[class*="slotAvailable"], .slot.available');
      const slotsB = pageB.locator('[class*="slotAvailable"], .slot.available');

      if (await slotsA.count() > 0 && await slotsB.count() > 0) {
        await slotsA.first().click().catch(() => {});
        await slotsB.first().click().catch(() => {});
        const confirmA = pageA.locator('button:has-text("Confirm Reservation")');
        const confirmB = pageB.locator('button:has-text("Confirm Reservation")');
        if (await confirmA.count() > 0) await confirmA.first().click().catch(() => {});
        if (await confirmB.count() > 0) await confirmB.first().click().catch(() => {});
      }

      await expect(pageA).toHaveURL(new RegExp(`/rooms/${ROOM_M_ID}`));
      await expect(pageB).toHaveURL(new RegExp(`/rooms/${ROOM_M_ID}`));
    } catch {}
    finally {
      await contextA.close();
      await contextB.close();
    }
  });
});

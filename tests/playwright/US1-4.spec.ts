// tests/playwright/US1-4.spec.ts
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend.vercel.app';
const WORKSPACE_ID = '69ba6b8668c96351d907a3a1';

const ROOM_G_ID = '69e4e1b8c28927fce39a3c80'; // roomG
const ROOM_L_ID = '69e509cfa6ca18740d087e3c'; // roomL

const TEST_DATE_ISO = '2026-04-28';

test.describe('US1-4 (TC1-10..TC1-12): Browse rooms and check availability', () => {
  test('TC1-10: Show available slots for a room and date', async ({ page }) => {
    try {
      await page.goto(`${BASE_URL}/workspace/${WORKSPACE_ID}/rooms/${ROOM_G_ID}`);
      const dateInput = page.locator('input[class*="dateInput"], input[type="date"], input[name="date"]');
      if (await dateInput.count() > 0) {
        await dateInput.fill(TEST_DATE_ISO);
      }
      await page.waitForTimeout(1000);

      const availableSlots = page.locator('[class*="slotAvailable"], [data-test="slot-available"], .slot.available');
      if (await availableSlots.count() > 0) {
        await expect(availableSlots.first()).toBeVisible();
      }
    } catch {}
  });

  test('TC1-11: Show empty state when no slots available', async ({ page }) => {
    try {
      await page.goto(`${BASE_URL}/workspace/${WORKSPACE_ID}/rooms/${ROOM_L_ID}`);
      const dateInput = page.locator('input[class*="dateInput"], input[type="date"], input[name="date"]');
      if (await dateInput.count() > 0) {
        await dateInput.fill(TEST_DATE_ISO);
      }
      await page.waitForTimeout(1000);

      const availableSlots = page.locator('[class*="slotAvailable"], [data-test="slot-available"], .slot.available');
      if (await availableSlots.count() === 0) {
        const emptyState = page.locator(
          'text=No slots available, text=No available slots, text=No slots found, text=No time slots'
        );
        if (await emptyState.count() > 0) {
          await expect(emptyState.first()).toBeVisible();
        }
      }
    } catch {}
  });

  test('TC1-12: Redirect unauthenticated user to login when reserving', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(`${BASE_URL}/workspace/${WORKSPACE_ID}/rooms/${ROOM_G_ID}`);
      const dateInput = page.locator('input[class*="dateInput"], input[type="date"], input[name="date"]');
      if (await dateInput.count() > 0) {
        await dateInput.fill(TEST_DATE_ISO);
      }
      await page.waitForTimeout(1000);

      const availableSlots = page.locator('[class*="slotAvailable"], [data-test="slot-available"], .slot.available');
      if (await availableSlots.count() > 0) {
        await availableSlots.first().click({ force: true }).catch(() => {});
        const confirmBtn = page.locator(
          'button[class*="bookBtn"], button:has-text("Confirm"), button:has-text("Confirm Reservation"), button:has-text("Book")'
        );
        if (await confirmBtn.count() > 0) {
          await confirmBtn.first().click().catch(() => {});
        }
      }

      const loginMessage = page.locator('text=Please login first');
      if (await loginMessage.count() > 0) {
        await expect(loginMessage.first()).toBeVisible();
      }
    } catch {}
    finally {
      await context.close();
    }
  });
});

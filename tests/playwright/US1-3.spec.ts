// tests/playwright/US1-3.spec.ts
import { test, Page } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend.vercel.app/';
const ROOM_WITH_RESERVATIONS = 'https://6-noob7-hack-frontend.vercel.app/workspace/69ba6b8668c96351d907a3a1/rooms/69f046f4ea7f4edb5de5aa56';

async function acceptNativeOrDomConfirm(page: Page, expectedText?: string, accept = true, timeout = 3000) {
  try {
    const dialog = await page.waitForEvent('dialog', { timeout });
    if (accept) await dialog.accept();
    else await dialog.dismiss();
    return;
  } catch {
    // DOM modal fallback
  }

  const modalTextLocator = expectedText ? page.locator(`text=${expectedText}`) : page.locator('text=Delete this room?');
  if (await modalTextLocator.count() > 0) {
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("OK"), button:has-text("Yes"), button:has-text("Accept"), button:has-text("Delete")').first();
    const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("No"), button:has-text("Dismiss")').first();

    if (accept && (await confirmButton.count() > 0)) {
      await confirmButton.click();
      return;
    }
    if (!accept && (await cancelButton.count() > 0)) {
      await cancelButton.click();
      return;
    }
  }

  throw new Error('No native dialog or DOM confirmation modal found');
}

test.describe('US1-3 (TC1-7..TC1-9): Admin Remove Room', () => {
  test('TC1-7: Delete room with no reservations', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.getByRole('textbox', { name: 'yourgmail@example.com' }).fill('admin@gmail.com');
    await page.getByRole('textbox', { name: '••••••••' }).fill('123456');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.getByRole('link', { name: 'Test create in frontend' }).click();
    await page.getByRole('link', { name: 'View Rooms →' }).click();
    await page.getByRole('link', { name: '➕ Add Room' }).click();

    const timestamp = Date.now();
    const roomName = `Meeting Room${timestamp}`;

    await page.getByRole('textbox', { name: 'e.g. Meeting Room A' }).fill(roomName);
    await page.getByPlaceholder('Number of people').fill('11');
    await page.getByPlaceholder('e.g. 200').fill('111');
    await page.getByRole('button', { name: 'Create Room →' }).click();

  });

  test ('TC1-8: Prevent delete when active reservations exist', async ({ page }) => {
  // Login as admin
  await page.goto('https://6-noob7-hack-frontend.vercel.app/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'yourgmail@example.com' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: '••••••••' }).fill('123456');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Navigate to workspace and rooms
  await page.getByRole('link', { name: 'Test create in frontend' }).click();
  await page.getByRole('link', { name: 'View Rooms →' }).click();

  // Attempt to delete a room with active reservations
  await page.getByRole('button', { name: '🗑 Delete' }).first().click();

  // Close the page after handling the popup
  await page.close();

});

  test('TC1-9: Duplicate delete request (copy of TC1-7)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.getByRole('textbox', { name: 'yourgmail@example.com' }).fill('admin@gmail.com');
    await page.getByRole('textbox', { name: '••••••••' }).fill('123456');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.getByRole('link', { name: 'Test create in frontend' }).click();
    await page.getByRole('link', { name: 'View Rooms →' }).click();
    await page.getByRole('link', { name: '➕ Add Room' }).click();

    const timestamp = Date.now();
    const roomName = `Meeting Room ${timestamp}`;

    await page.getByRole('textbox', { name: 'e.g. Meeting Room A' }).fill(roomName);
    await page.getByPlaceholder('Number of people').fill('11');
    await page.getByPlaceholder('e.g. 200').fill('111');
    await page.getByRole('button', { name: 'Create Room →' }).click();

  });
});

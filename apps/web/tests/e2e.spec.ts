import { test, expect } from '@playwright/test';

test('basic navigation and layout', async ({ page }) => {
  await page.goto('/');
  
  // Verify page title
  await expect(page).toHaveTitle(/SentinelAI/);
  
  // Check sidebar navigation
  await expect(page.locator('text=Dashboard')).toBeVisible();
  await expect(page.locator('text=Cameras')).toBeVisible();
  await expect(page.locator('text=Settings')).toBeVisible();
  
  // Navigate to cameras page
  await page.click('text=Cameras');
  await expect(page).toHaveURL(/.*cameras/);
  await expect(page.locator('h1:has-text("Cameras")')).toBeVisible();
  
  // Navigate to settings page
  await page.click('text=Settings');
  await expect(page).toHaveURL(/.*settings/);
  await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
  
  // Return to dashboard
  await page.click('text=Dashboard');
  await expect(page).toHaveURL(/.*\/$/);
  await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
});

test('alert workflow: API event to UI update', async ({ page }) => {
  // Start from dashboard
  await page.goto('/');
  
  // Get initial alert count
  const initialAlertCount = await page.locator('.space-y-3 > div').count();
  
  // Simulate a new alert by calling the sample event API
  const apiResponse = await page.request.get(process.env.NEXT_PUBLIC_API_URL + '/sample_event' || 'http://localhost:8000/sample_event');
  expect(apiResponse.ok()).toBeTruthy();
  
  // Give a moment for WebSocket to deliver the event
  await page.waitForTimeout(2000);
  
  // Check for toast notification
  await expect(page.locator('text=Alert:')).toBeVisible({ timeout: 5000 });
  
  // Check that a new alert is added to the list
  const newAlertCount = await page.locator('.space-y-3 > div').count();
  expect(newAlertCount).toBeGreaterThan(initialAlertCount);
});

test('camera switching', async ({ page }) => {
  await page.goto('/');
  
  // Check for camera selection buttons
  await expect(page.locator('button:has-text("Living Room")')).toBeVisible();
  await expect(page.locator('button:has-text("Bedroom")')).toBeVisible();
  
  // Click on a different camera
  await page.click('button:has-text("Bedroom")');
  
  // Verify the camera title changes
  await expect(page.locator('text="Bedroom"')).toBeVisible();
  
  // Switch back to the first camera
  await page.click('button:has-text("Living Room")');
  await expect(page.locator('text="Living Room"')).toBeVisible();
}); 
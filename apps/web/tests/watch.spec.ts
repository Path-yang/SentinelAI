import { test, expect } from '@playwright/test';

test.describe('Watch Page', () => {
  test('should render watch page with proper structure', async ({ page }) => {
    await page.goto('/watch');
    
    // Check page title and description
    await expect(page.getByRole('heading', { name: 'Live Stream' })).toBeVisible();
    await expect(page.getByText('Watch your live camera feed in real-time.')).toBeVisible();
  });

  test('should show empty state when no HLS URL is configured', async ({ page }) => {
    // Mock the environment variable to be undefined
    await page.addInitScript(() => {
      // @ts-ignore
      window.process = { env: { NEXT_PUBLIC_HLS_URL: undefined } };
    });
    
    await page.goto('/watch');
    
    // Check for empty state
    await expect(page.getByText('No Stream Configured')).toBeVisible();
    await expect(page.getByText('Please set up your live video stream to start watching.')).toBeVisible();
    
    // Check for setup instructions
    await expect(page.getByText('To get started:')).toBeVisible();
    await expect(page.getByText(/Create a .env.local file/)).toBeVisible();
  });

  test('should show video player when HLS URL is configured', async ({ page }) => {
    // Mock the environment variable
    await page.addInitScript(() => {
      // @ts-ignore
      window.process = { env: { NEXT_PUBLIC_HLS_URL: 'http://localhost:8084/mystream/index.m3u8' } };
    });
    
    await page.goto('/watch');
    
    // Check for video player
    await expect(page.locator('video')).toBeVisible();
    
    // Check for copy URL button
    await expect(page.getByRole('button', { name: /Copy URL/i })).toBeVisible();
    
    // Check for tips section
    await expect(page.getByText('Tips')).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto('/watch');
    
    // Check for proper ARIA labels
    const video = page.locator('video');
    await expect(video).toHaveAttribute('aria-label', 'Live video stream');
    
    // Check for proper heading structure
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should handle copy URL functionality', async ({ page }) => {
    // Mock the environment variable
    await page.addInitScript(() => {
      // @ts-ignore
      window.process = { env: { NEXT_PUBLIC_HLS_URL: 'http://localhost:8084/mystream/index.m3u8' } };
    });
    
    await page.goto('/watch');
    
    // Mock clipboard API
    await page.addInitScript(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: async (text: string) => {
            // Mock successful copy
            return Promise.resolve();
          }
        }
      });
    });
    
    // Click copy button
    await page.getByRole('button', { name: /Copy URL/i }).click();
    
    // Should show success toast (if toast system is working)
    // This test verifies the button is clickable and doesn't throw errors
  });
}); 
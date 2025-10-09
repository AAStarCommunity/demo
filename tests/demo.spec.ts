import { test, expect } from '@playwright/test';

test.describe('Demo End User Flow', () => {
  test('should load demo page successfully', async ({ page }) => {
    await page.goto('http://localhost:5174/');

    // Check title
    await expect(page).toHaveTitle(/SuperPaymaster Demo Playground/);

    // Check role selector
    await expect(page.getByRole('button', { name: 'End User' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Operator' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Developer' })).toBeVisible();

    // Check End User section is displayed by default
    await expect(page.getByRole('heading', { name: '🚀 End User Experience' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Connect MetaMask' })).toBeVisible();
  });

  test('should show wallet connection section', async ({ page }) => {
    await page.goto('http://localhost:5174/');

    const connectButton = page.getByRole('button', { name: 'Connect MetaMask' });
    await expect(connectButton).toBeVisible();
    await expect(connectButton).toBeEnabled();

    // Check section headers
    await expect(page.getByRole('heading', { name: '1. Connect Wallet' })).toBeVisible();
  });

  test('should switch between role tabs', async ({ page }) => {
    await page.goto('http://localhost:5174/');

    // Default: End User
    await expect(page.getByRole('heading', { name: '🚀 End User Experience' })).toBeVisible();

    // Switch to Operator
    await page.getByRole('button', { name: 'Operator' }).click();
    await expect(page.getByRole('heading', { name: 'Operator Demo' })).toBeVisible();

    // Switch to Developer
    await page.getByRole('button', { name: 'Developer' }).click();
    await expect(page.getByRole('heading', { name: 'Developer Demo' })).toBeVisible();

    // Switch back to End User
    await page.getByRole('button', { name: 'End User' }).click();
    await expect(page.getByRole('heading', { name: '🚀 End User Experience' })).toBeVisible();
  });

  test('should display all sections when wallet not connected', async ({ page }) => {
    await page.goto('http://localhost:5174/');

    // Section 1 should be visible
    await expect(page.getByRole('heading', { name: '1. Connect Wallet' })).toBeVisible();

    // Sections 2-4 should not be visible until wallet is connected
    await expect(page.getByRole('heading', { name: '2. Create AA Account' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: '3. Claim Test Tokens' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: '4. Send Gasless Transaction' })).not.toBeVisible();
  });
});

test.describe('Demo Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5174/');

    await expect(page.getByRole('heading', { name: 'SuperPaymaster Demo Playground' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Connect MetaMask' })).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:5174/');

    await expect(page.getByRole('heading', { name: 'SuperPaymaster Demo Playground' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Connect MetaMask' })).toBeVisible();
  });
});

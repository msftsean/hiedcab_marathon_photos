import { test, expect } from '@playwright/test';

test.describe('Bib Number Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('should display search input on page load', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: /bib number/i });
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /enter bib number/i);
  });

  test('should show validation error for invalid bib number', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: /bib number/i });
    await searchInput.fill('abc');
    await searchInput.press('Enter');

    const errorMessage = page.getByText(/please enter a valid bib number/i);
    await expect(errorMessage).toBeVisible();
  });

  test('should search and display watermarked results for valid bib', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: /bib number/i });
    await searchInput.fill('12345');
    await searchInput.press('Enter');

    // Wait for results to load
    await page.waitForSelector('[data-testid="photo-card"]', { timeout: 10000 });

    // Verify photos are displayed
    const photoCards = page.locator('[data-testid="photo-card"]');
    await expect(photoCards).toHaveCount(await photoCards.count());
    expect(await photoCards.count()).toBeGreaterThan(0);

    // Verify watermarked URLs are used (not original URLs)
    const firstPhoto = photoCards.first();
    const imgSrc = await firstPhoto.locator('img').getAttribute('src');
    expect(imgSrc).toContain('watermarked');
  });

  test('should display event information with search results', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: /bib number/i });
    await searchInput.fill('12345');
    await searchInput.press('Enter');

    await page.waitForSelector('[data-testid="photo-card"]');

    // Event name should be visible
    const eventName = page.getByText(/boston marathon|nyc half marathon/i);
    await expect(eventName.first()).toBeVisible();
  });

  test('should filter results by event', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: /bib number/i });
    await searchInput.fill('12345');
    await searchInput.press('Enter');

    await page.waitForSelector('[data-testid="photo-card"]');
    const initialCount = await page.locator('[data-testid="photo-card"]').count();

    // Select specific event filter
    const eventFilter = page.getByRole('combobox', { name: /filter by event/i });
    await eventFilter.selectOption({ label: /boston marathon/i });

    // Results should be filtered
    await page.waitForTimeout(500); // Wait for filter to apply
    const filteredCount = await page.locator('[data-testid="photo-card"]').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should show no results message for non-existent bib', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: /bib number/i });
    await searchInput.fill('99999999');
    await searchInput.press('Enter');

    const noResults = page.getByText(/no photos found/i);
    await expect(noResults).toBeVisible();
  });

  test('should show add to cart button on photo cards', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: /bib number/i });
    await searchInput.fill('12345');
    await searchInput.press('Enter');

    await page.waitForSelector('[data-testid="photo-card"]');

    const addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
    await expect(addToCartButton).toBeVisible();
  });

  test('should display photo price on cards', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: /bib number/i });
    await searchInput.fill('12345');
    await searchInput.press('Enter');

    await page.waitForSelector('[data-testid="photo-card"]');

    // Price should be displayed (e.g., "$1.00")
    const priceElement = page.getByText(/\$\d+\.\d{2}/).first();
    await expect(priceElement).toBeVisible();
  });

  test('should open photo preview modal on click', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: /bib number/i });
    await searchInput.fill('12345');
    await searchInput.press('Enter');

    await page.waitForSelector('[data-testid="photo-card"]');

    // Click on photo to open preview
    const firstPhoto = page.locator('[data-testid="photo-card"]').first();
    await firstPhoto.click();

    // Modal should appear
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Watermarked preview should be shown in modal
    const previewImage = modal.locator('img');
    await expect(previewImage).toBeVisible();
  });

  test('should be mobile responsive with touch-friendly targets', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/search');

    const searchInput = page.getByRole('textbox', { name: /bib number/i });
    await searchInput.fill('12345');
    await searchInput.press('Enter');

    await page.waitForSelector('[data-testid="photo-card"]');

    // Buttons should have minimum 44x44 touch targets
    const addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
    const buttonBox = await addToCartButton.boundingBox();

    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });
});

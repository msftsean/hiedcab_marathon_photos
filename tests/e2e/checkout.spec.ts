import { test, expect } from '@playwright/test';

test.describe('Guest Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Search for photos and add to cart
    await page.goto('/search');
    const searchInput = page.getByRole('textbox', { name: /bib number/i });
    await searchInput.fill('12345');
    await searchInput.press('Enter');

    await page.waitForSelector('[data-testid="photo-card"]');
  });

  test('should add photo to cart', async ({ page }) => {
    const addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
    await addToCartButton.click();

    // Cart badge should show count
    const cartBadge = page.getByTestId('cart-count');
    await expect(cartBadge).toHaveText('1');
  });

  test('should show cart summary with photos', async ({ page }) => {
    // Add photo to cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
    await addToCartButton.click();

    // Navigate to checkout
    await page.goto('/checkout');

    // Cart summary should display
    const cartSummary = page.getByTestId('cart-summary');
    await expect(cartSummary).toBeVisible();

    // Photo thumbnail should be visible
    const thumbnail = cartSummary.locator('img').first();
    await expect(thumbnail).toBeVisible();
  });

  test('should display bundle pricing for multiple photos', async ({ page }) => {
    // Add 5 photos to cart (to trigger bundle pricing)
    const addButtons = page.getByRole('button', { name: /add to cart/i });
    const count = await addButtons.count();

    for (let i = 0; i < Math.min(5, count); i++) {
      await addButtons.nth(i).click();
      await page.waitForTimeout(200); // Small delay between clicks
    }

    await page.goto('/checkout');

    // Should show bundle pricing ($4 for 5-pack)
    const bundlePrice = page.getByText(/\$4\.00/);
    await expect(bundlePrice).toBeVisible();

    // Should show savings
    const savings = page.getByText(/save \$/i);
    await expect(savings).toBeVisible();
  });

  test('should require email for guest checkout', async ({ page }) => {
    // Add photo to cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
    await addToCartButton.click();

    await page.goto('/checkout');

    // Email input should be required
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible();

    // Try to proceed without email
    const checkoutButton = page.getByRole('button', { name: /proceed to payment/i });
    await checkoutButton.click();

    // Should show validation error
    const errorMessage = page.getByText(/email is required/i);
    await expect(errorMessage).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Add photo to cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
    await addToCartButton.click();

    await page.goto('/checkout');

    // Enter invalid email
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.fill('invalid-email');

    const checkoutButton = page.getByRole('button', { name: /proceed to payment/i });
    await checkoutButton.click();

    // Should show validation error
    const errorMessage = page.getByText(/valid email/i);
    await expect(errorMessage).toBeVisible();
  });

  test('should redirect to Stripe Checkout with valid email', async ({ page }) => {
    // Add photo to cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
    await addToCartButton.click();

    await page.goto('/checkout');

    // Enter valid email
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.fill('test@example.com');

    const checkoutButton = page.getByRole('button', { name: /proceed to payment/i });

    // Set up listener for navigation
    const [response] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/checkout/session')),
      checkoutButton.click(),
    ]);

    // Should create checkout session
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.sessionId).toBeDefined();
  });

  test('should remove photo from cart', async ({ page }) => {
    // Add photo to cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
    await addToCartButton.click();

    await page.goto('/checkout');

    // Remove photo
    const removeButton = page.getByRole('button', { name: /remove/i }).first();
    await removeButton.click();

    // Cart should be empty
    const emptyMessage = page.getByText(/cart is empty/i);
    await expect(emptyMessage).toBeVisible();
  });

  test('should persist cart across page reloads', async ({ page }) => {
    // Add photo to cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
    await addToCartButton.click();

    // Reload page
    await page.reload();

    // Cart count should persist
    const cartBadge = page.getByTestId('cart-count');
    await expect(cartBadge).toHaveText('1');
  });

  test('should show order total with tax info', async ({ page }) => {
    // Add photo to cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
    await addToCartButton.click();

    await page.goto('/checkout');

    // Total should be displayed
    const total = page.getByTestId('order-total');
    await expect(total).toBeVisible();
    await expect(total).toContainText('$');
  });

  test('should handle Stripe test card payment', async ({ page }) => {
    // This test uses Stripe test mode
    // Add photo and proceed to checkout
    const addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
    await addToCartButton.click();

    await page.goto('/checkout');

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.fill('test@example.com');

    const checkoutButton = page.getByRole('button', { name: /proceed to payment/i });
    await checkoutButton.click();

    // Wait for redirect to Stripe (or embedded checkout)
    await page.waitForURL(/checkout\.stripe\.com|\/checkout\/payment/, { timeout: 10000 });

    // Stripe test card: 4242424242424242
    // This would be filled in the Stripe iframe
  });
});

test.describe('Checkout Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/checkout/session', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/search');
    const searchInput = page.getByRole('textbox', { name: /bib number/i });
    await searchInput.fill('12345');
    await searchInput.press('Enter');

    await page.waitForSelector('[data-testid="photo-card"]');
    await page.getByRole('button', { name: /add to cart/i }).first().click();

    await page.goto('/checkout');
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.fill('test@example.com');

    const checkoutButton = page.getByRole('button', { name: /proceed to payment/i });
    await checkoutButton.click();

    // Should show error message
    const errorToast = page.getByText(/something went wrong/i);
    await expect(errorToast).toBeVisible();
  });

  test('should handle network failures', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.getByRole('textbox', { name: /bib number/i });
    await searchInput.fill('12345');
    await searchInput.press('Enter');

    await page.waitForSelector('[data-testid="photo-card"]');
    await page.getByRole('button', { name: /add to cart/i }).first().click();

    // Go offline
    await page.context().setOffline(true);

    await page.goto('/checkout');
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.fill('test@example.com');

    const checkoutButton = page.getByRole('button', { name: /proceed to payment/i });
    await checkoutButton.click();

    // Should show offline message
    const offlineMessage = page.getByText(/check your connection/i);
    await expect(offlineMessage).toBeVisible();

    // Go back online
    await page.context().setOffline(false);
  });
});

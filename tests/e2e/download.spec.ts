import { test, expect } from '@playwright/test';

test.describe('Download Access After Payment', () => {
  // These tests simulate the post-payment flow
  // In production, these would use actual Stripe test webhooks

  test('should display success page after Stripe redirect', async ({ page }) => {
    // Simulate successful payment redirect with session ID
    const mockSessionId = 'cs_test_mock123';
    await page.goto(`/checkout/success?session_id=${mockSessionId}`);

    // Success message should appear
    const successHeading = page.getByRole('heading', { name: /thank you/i });
    await expect(successHeading).toBeVisible();

    // Order confirmation message
    const confirmationText = page.getByText(/order confirmed/i);
    await expect(confirmationText).toBeVisible();
  });

  test('should display purchased photos on success page', async ({ page }) => {
    const mockSessionId = 'cs_test_mock123';
    await page.goto(`/checkout/success?session_id=${mockSessionId}`);

    // Photos should be listed
    const photoList = page.getByTestId('purchased-photos');
    await expect(photoList).toBeVisible();

    // Download buttons should be present
    const downloadButtons = page.getByRole('button', { name: /download/i });
    expect(await downloadButtons.count()).toBeGreaterThan(0);
  });

  test('should provide download links for purchased photos', async ({ page }) => {
    const mockSessionId = 'cs_test_mock123';
    await page.goto(`/checkout/success?session_id=${mockSessionId}`);

    // Click download button
    const downloadButton = page.getByRole('button', { name: /download/i }).first();

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();

    // Should trigger download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.(jpg|jpeg|png)$/i);
  });

  test('should show original (non-watermarked) images after purchase', async ({ page }) => {
    const mockSessionId = 'cs_test_mock123';
    await page.goto(`/checkout/success?session_id=${mockSessionId}`);

    // Preview images on success page should use original URLs
    const photoImage = page.getByTestId('purchased-photos').locator('img').first();
    const imgSrc = await photoImage.getAttribute('src');

    // Should NOT contain watermark path
    expect(imgSrc).not.toContain('watermarked');
    // Should be a signed URL for original
    expect(imgSrc).toContain('original');
  });

  test('should send confirmation email notification', async ({ page }) => {
    const mockSessionId = 'cs_test_mock123';
    await page.goto(`/checkout/success?session_id=${mockSessionId}`);

    // Confirmation message should mention email
    const emailNotice = page.getByText(/sent.*email|email.*sent/i);
    await expect(emailNotice).toBeVisible();
  });

  test('should allow downloading multiple photos as zip', async ({ page }) => {
    const mockSessionId = 'cs_test_mock_bundle123';
    await page.goto(`/checkout/success?session_id=${mockSessionId}`);

    // "Download All" button should be available for bundles
    const downloadAllButton = page.getByRole('button', { name: /download all/i });
    await expect(downloadAllButton).toBeVisible();

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    await downloadAllButton.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.zip$/i);
  });

  test('should handle invalid session ID gracefully', async ({ page }) => {
    await page.goto('/checkout/success?session_id=invalid_session');

    // Should show error or redirect
    const errorMessage = page.getByText(/order not found|invalid session/i);
    const redirected = page.url().includes('/search');

    expect(await errorMessage.isVisible() || redirected).toBeTruthy();
  });

  test('should handle missing session ID', async ({ page }) => {
    await page.goto('/checkout/success');

    // Should redirect to home or show error
    const isRedirected = page.url().includes('/search') || page.url() === '/';
    const errorMessage = page.getByText(/session required/i);

    expect(isRedirected || (await errorMessage.isVisible())).toBeTruthy();
  });

  test('should prevent re-download without verification', async ({ page }) => {
    // Direct access to download endpoint without valid session
    const response = await page.goto('/api/downloads/fake-transaction-id');

    // Should require verification
    expect(response?.status()).toBe(401);
  });

  test('should verify email before allowing download access', async ({ page }) => {
    const mockTransactionId = 'txn_test_123';
    await page.goto(`/api/downloads/${mockTransactionId}`);

    // Should prompt for email verification
    const emailPrompt = page.getByText(/verify.*email|enter.*email/i);

    // Either redirects or shows verification prompt
    const isRedirected = page.url().includes('/verify');
    expect(isRedirected || (await emailPrompt.isVisible())).toBeTruthy();
  });

  test('should provide download links that expire', async ({ page }) => {
    const mockSessionId = 'cs_test_mock123';
    await page.goto(`/checkout/success?session_id=${mockSessionId}`);

    // Download URL should contain expiration indicator
    const downloadButton = page.getByRole('button', { name: /download/i }).first();
    await downloadButton.click();

    // Check that URL has signed parameters
    const response = await page.waitForResponse((resp) =>
      resp.url().includes('/api/downloads') || resp.url().includes('supabase')
    );

    expect(response.url()).toMatch(/token=|signature=|expires=/i);
  });
});

test.describe('Download Access Security', () => {
  test('should not expose original URLs before purchase', async ({ page }) => {
    // Go to search page
    await page.goto('/search');
    const searchInput = page.getByRole('textbox', { name: /bib number/i });
    await searchInput.fill('12345');
    await searchInput.press('Enter');

    await page.waitForSelector('[data-testid="photo-card"]');

    // Check that displayed images are watermarked
    const photoImages = page.locator('[data-testid="photo-card"] img');
    const count = await photoImages.count();

    for (let i = 0; i < count; i++) {
      const src = await photoImages.nth(i).getAttribute('src');
      expect(src).toContain('watermarked');
      expect(src).not.toContain('original');
    }
  });

  test('should reject download requests without valid purchase', async ({ page }) => {
    // Try to access download API directly
    const response = await page.request.get('/api/downloads/fake-id?email=test@test.com');

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });
});

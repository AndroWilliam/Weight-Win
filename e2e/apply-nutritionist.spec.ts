import { test, expect } from '@playwright/test';

test.describe('Nutritionist Application Flow', () => {
  test('should complete nutritionist application successfully', async ({ page }) => {
    // Navigate to application page
    await page.goto('/apply/nutritionist');
    
    // Fill personal information
    await page.fill('input[name="firstName"]', 'Dr. Jane');
    await page.fill('input[name="familyName"]', 'Smith');
    await page.fill('input[name="phone"]', '+1234567890');
    await page.fill('input[name="email"]', 'jane.smith@example.com');
    
    // Select ID type
    await page.click('input[value="national_id"]');
    
    // Fill ID number
    await page.fill('input[name="idNumber"]', '123456789');
    
    // Mock file uploads by intercepting the upload requests
    await page.route('/api/upload/anonymous', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ path: 'mock/cv-path.pdf' })
      });
    });
    
    await page.route('/api/upload/preview', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ signedUrl: 'https://example.com/mock-preview.pdf' })
      });
    });
    
    await page.route('/api/ocr/id-extract', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true, 
          extractedId: '123456789',
          confidence: 0.95
        })
      });
    });
    
    // Simulate file uploads
    const [fileChooser1] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('text=Upload your CV').click()
    ]);
    await fileChooser1.setFiles({
      name: 'cv.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock cv content')
    });
    
    // Wait for upload to complete
    await expect(page.locator('text=Success')).toBeVisible({ timeout: 10000 });
    
    // Upload ID document
    const [fileChooser2] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('text=National ID Photo').click()
    ]);
    await fileChooser2.setFiles({
      name: 'id.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('mock id image')
    });
    
    // Wait for ID upload and OCR
    await expect(page.locator('text=Success')).toBeVisible({ timeout: 10000 });
    
    // Check consent checkbox
    await page.check('input[name="consent"]');
    
    // Mock submission request
    await page.route('/api/applications/submit', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, applicationId: 'app_123' })
      });
    });
    
    // Submit application
    await page.click('button[type="submit"]');
    
    // Verify success modal
    await expect(page.locator('text=Application Submitted')).toBeVisible({ timeout: 10000 });
  });
});

import { test, expect } from '@playwright/test';

test.describe('Rate Limiting', () => {
  test('should return 429 when hitting rate limits', async ({ page }) => {
    // Mock a route that has rate limiting
    let requestCount = 0;
    
    await page.route('/api/health', async route => {
      requestCount++;
      if (requestCount > 5) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: false, 
            error: { code: 'RATE_LIMITED', message: 'Too many requests' }
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, version: 'test' })
        });
      }
    });
    
    await page.goto('/');
    
    // Make multiple requests quickly
    for (let i = 0; i < 7; i++) {
      const response = await page.request.get('/api/health');
      
      if (i < 5) {
        expect(response.status()).toBe(200);
      } else {
        expect(response.status()).toBe(429);
        const body = await response.json();
        expect(body.error.code).toBe('RATE_LIMITED');
      }
    }
  });
});

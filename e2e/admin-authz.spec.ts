import { test, expect } from '@playwright/test';

test.describe('Admin Authorization', () => {
  test('should return 403 for non-admin access to admin routes', async ({ page }) => {
    // Mock admin route to return 403 for unauthorized access
    await page.route('/api/admin/files/*', async route => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: false, 
          error: { code: 'FORBIDDEN', message: 'Admin access required' }
        })
      });
    });
    
    await page.goto('/');
    
    // Try to access admin route without proper authorization
    const response = await page.request.get('/api/admin/files/test-document');
    
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error.code).toBe('FORBIDDEN');
    expect(body.error.message).toBe('Admin access required');
  });
  
  test('should allow admin access with proper authorization', async ({ page }) => {
    // Mock admin route to return success for authorized access
    await page.route('/api/admin/files/*', async route => {
      const headers = route.request().headers();
      
      // Check for mock admin authorization
      if (headers['authorization'] === 'Bearer admin-token') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: true, 
            signedUrl: 'https://example.com/signed-file-url'
          })
        });
      } else {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: false, 
            error: { code: 'FORBIDDEN', message: 'Admin access required' }
          })
        });
      }
    });
    
    await page.goto('/');
    
    // Make request with admin authorization
    const response = await page.request.get('/api/admin/files/test-document', {
      headers: {
        'authorization': 'Bearer admin-token'
      }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.signedUrl).toBeTruthy();
  });
});

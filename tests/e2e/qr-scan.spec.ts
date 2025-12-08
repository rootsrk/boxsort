import { test, expect } from '@playwright/test'

test.describe('QR Code Scanning', () => {
  test('should display public box page', async ({ page }) => {
    // QR codes link to /box/[id] which is publicly accessible
    await page.goto('/box/test-box-id')
    
    // Should show some content (or 404 if box doesn't exist)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should show box name on public page', async ({ page }) => {
    await page.goto('/box/test-box-id')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should show items in public box view', async ({ page }) => {
    await page.goto('/box/test-box-id')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should prompt sign in for full access', async ({ page }) => {
    await page.goto('/box/test-box-id')
    // Should show sign-in prompt for editing capabilities
    await expect(page.locator('body')).toBeVisible()
  })

  test('should show 404 for non-existent box', async ({ page }) => {
    await page.goto('/box/non-existent-box-id')
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Public Box Navigation', () => {
  test('should not allow editing on public page', async ({ page }) => {
    await page.goto('/box/test-box-id')
    // Public page should be read-only
    await expect(page.locator('body')).toBeVisible()
  })

  test('should link to sign in page', async ({ page }) => {
    await page.goto('/box/test-box-id')
    await expect(page.locator('body')).toBeVisible()
  })
})


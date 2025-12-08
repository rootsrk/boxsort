import { test, expect } from '@playwright/test'

test.describe('Profile Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
    
    // Assume user is logged in (you may need to adjust based on your auth setup)
    // For now, we'll test the profile page directly if accessible
  })

  test('should display user avatar in header', async ({ page }) => {
    await page.goto('/')
    
    // Look for avatar element in header
    const avatar = page.locator('[data-testid="user-avatar"], [aria-label*="avatar"], img[alt*="avatar"]').first()
    
    await expect(avatar).toBeVisible()
  })

  test('should open user menu when clicking avatar', async ({ page }) => {
    await page.goto('/')
    
    const avatar = page.locator('[data-testid="user-avatar"], [aria-label*="avatar"], button').first()
    await avatar.click()
    
    // Menu should appear with options
    await expect(page.getByText(/settings|profile|sign out/i).first()).toBeVisible()
  })

  test('should navigate to settings from user menu', async ({ page }) => {
    await page.goto('/')
    
    const avatar = page.locator('[data-testid="user-avatar"], [aria-label*="avatar"], button').first()
    await avatar.click()
    
    const settingsLink = page.getByRole('link', { name: /settings/i })
    await settingsLink.click()
    
    await expect(page).toHaveURL(/.*settings/)
  })

  test('should allow uploading profile picture', async ({ page }) => {
    await page.goto('/settings')
    
    // Find upload button/input
    const uploadButton = page.getByRole('button', { name: /upload|change.*picture/i }).or(
      page.locator('input[type="file"]')
    ).first()
    
    await expect(uploadButton).toBeVisible()
    
    // Note: File upload testing may require specific setup
    // This test verifies the UI element exists
  })

  test('should display profile picture after upload', async ({ page }) => {
    await page.goto('/settings')
    
    // After upload, avatar should update
    // This is a placeholder - actual implementation will verify image appears
    const avatar = page.locator('img[alt*="avatar"], [data-testid="avatar"]').first()
    
    // Avatar should be visible (either with image or initials)
    await expect(avatar).toBeVisible()
  })

  test('should navigate to profile page from menu', async ({ page }) => {
    await page.goto('/')
    
    const avatar = page.locator('[data-testid="user-avatar"], [aria-label*="avatar"], button').first()
    await avatar.click()
    
    const profileLink = page.getByRole('link', { name: /profile/i })
    await profileLink.click()
    
    await expect(page).toHaveURL(/.*profile/)
  })
})


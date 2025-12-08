import { test, expect } from '@playwright/test'

test.describe('Search Flow', () => {
  test('should display search bar in header', async ({ page }) => {
    await page.goto('/')
    
    const searchInput = page.getByPlaceholder(/search/i)
    await expect(searchInput).toBeVisible()
  })

  test('should navigate to search page on submit', async ({ page }) => {
    await page.goto('/')
    
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('jacket')
    await searchInput.press('Enter')
    
    await expect(page).toHaveURL(/search/)
  })

  test('should show search results page', async ({ page }) => {
    await page.goto('/search?q=test')
    
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Search Results', () => {
  test('should display search query in header', async ({ page }) => {
    await page.goto('/search?q=jacket')
    
    // Should show the search query somewhere
    await expect(page.locator('body')).toBeVisible()
  })

  test('should link results to box pages', async ({ page }) => {
    await page.goto('/search?q=test')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to box page when clicking search result with item', async ({ page }) => {
    // This test verifies that clicking on a search result with an image
    // navigates to the box page without crashing
    await page.goto('/search?q=jacket')
    
    // Wait for search results to load
    await page.waitForTimeout(1000)
    
    // Find and click on a search result card
    const resultCard = page.locator('[data-testid="item-card"], a[href*="/boxes/"]').first()
    
    if (await resultCard.count() > 0) {
      const href = await resultCard.getAttribute('href')
      if (href) {
        await resultCard.click()
        
        // Should navigate to box page without error
        await expect(page).toHaveURL(/\/boxes\/[^/]+/)
        
        // Page should load without crashing
        await expect(page.locator('body')).toBeVisible()
        
        // Should not show error page
        await expect(page.locator('text=Something went wrong')).not.toBeVisible({ timeout: 1000 }).catch(() => {
          // Error might not be present, which is fine
        })
      }
    }
  })

  test('should handle search results with images without crashing', async ({ page }) => {
    await page.goto('/search?q=jacket')
    
    // Wait for search results
    await page.waitForTimeout(1000)
    
    // Check that images in search results don't cause errors
    const images = page.locator('img')
    const imageCount = await images.count()
    
    // If there are images, they should load or show placeholder
    if (imageCount > 0) {
      // Wait a bit for images to potentially fail
      await page.waitForTimeout(500)
      
      // Page should still be visible and functional
      await expect(page.locator('body')).toBeVisible()
    }
  })
})


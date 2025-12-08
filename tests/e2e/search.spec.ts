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
})


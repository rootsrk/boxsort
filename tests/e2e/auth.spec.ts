import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should show signup page', async ({ page }) => {
    await page.goto('/signup')
    
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible()
  })

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('link', { name: /sign up/i }).click()
    await expect(page).toHaveURL(/\/signup/)
    
    await page.getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toHaveAttribute('required')
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/settings')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Join Household Flow', () => {
  test('should show join page with invite code', async ({ page }) => {
    await page.goto('/join/testcode')
    
    await expect(page.getByText(/join/i)).toBeVisible()
  })
})


// @ts-check
import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await expect(page).toHaveTitle(/Ceshire Cat/)
  await page.getByText('Memory').click();
  await page.getByText('Plugins').click();
})
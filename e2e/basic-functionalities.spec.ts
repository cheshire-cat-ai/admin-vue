// @ts-check
import { test, expect } from '@playwright/test'

test('chat', async ({ page }) => {
  var chatTextfield = "xpath=/html//div[@id='app']/div//textarea[@placeholder='Ask the Cheshire Cat...']"
  var sendButton = "xpath=/html//div[@id='app']/div/div[3]//div[@class='relative w-full']/div/button"
  await page.goto('http://localhost:3000')
  await page.getByText('Home').click()
  await page.locator(chatTextfield).fill('who are you?')
  await page.locator(sendButton).click()
  page.getByText('who are you?')
})

test('menu navigation', async ({ page }) => {
  var settings = "xpath=/html//div[@id='app']//div[@class='navbar-center']/ul//a[@href='/settings']"
  await page.goto('http://localhost:3000')
  await page.getByText('Home').click()
  await page.getByText('Memory').click()
  await page.getByText('Plugins').click()
  await page.locator(settings).click()
  await page.getByText('Docs').click()
})
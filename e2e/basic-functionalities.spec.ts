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

test('menu navigation', async ({ page, context }) => {
  var settings = "xpath=/html//div[@id='app']//div[@class='navbar-center']/ul//a[@href='/settings']"
  var micButton = "xpath=/html//div[@id='app']/div/div[3]/div[2]/div/button"

  await page.goto('http://localhost:3000')

  await page.getByText('Home').click()
  page.locator(micButton)

  await page.getByText('Memory').click()
  page.getByText('Recall text')

  await page.getByText('Plugins').click()
  page.getByText('Search for a plugin')

  await page.locator(settings).click()
  page.getByText('Set up your Cat')

  const pagePromise = context.waitForEvent('page');
  await page.getByText('Docs').click()
  const newPage = await pagePromise;
  await newPage.waitForLoadState();
  await newPage.waitForURL('https://cheshire-cat-ai.github.io/docs/')
})
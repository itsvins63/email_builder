import { test } from '@playwright/test'

test('screens: home + login', async ({ page }) => {
  await page.goto('/')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'playwright-artifacts/home.png', fullPage: true })

  await page.goto('/login')
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'playwright-artifacts/login.png', fullPage: true })
})

test('screen: demo editor', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/demo/editor')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'playwright-artifacts/demo-editor-desktop.png', fullPage: true })

  // Mobile viewport
  await page.setViewportSize({ width: 430, height: 900 })
  await page.goto('/demo/editor')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'playwright-artifacts/demo-editor-mobile.png', fullPage: true })
})

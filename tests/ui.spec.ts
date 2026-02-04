import { test } from '@playwright/test'

async function snap(
  page: import('@playwright/test').Page,
  path: string,
  url: string,
  width: number,
  height: number,
) {
  await page.setViewportSize({ width, height })
  await page.goto(url)
  await page.waitForTimeout(1500)
  await page.screenshot({ path, fullPage: true })
}

test('screens: all key routes', async ({ page }) => {
  await snap(page, 'playwright-artifacts/01-home-desktop.png', '/', 1440, 900)
  await snap(page, 'playwright-artifacts/02-login-desktop.png', '/login', 1440, 900)
  await snap(page, 'playwright-artifacts/03-templates-desktop.png', '/templates', 1440, 900)
  await snap(page, 'playwright-artifacts/04-demo-editor-desktop.png', '/demo/editor', 1440, 900)

  // Mobile
  await snap(page, 'playwright-artifacts/11-home-mobile.png', '/', 430, 900)
  await snap(page, 'playwright-artifacts/12-login-mobile.png', '/login', 430, 900)
  await snap(page, 'playwright-artifacts/13-templates-mobile.png', '/templates', 430, 900)
  await snap(page, 'playwright-artifacts/14-demo-editor-mobile.png', '/demo/editor', 430, 900)
})

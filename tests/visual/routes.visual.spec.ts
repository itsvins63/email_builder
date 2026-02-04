import { expect, test } from '@playwright/test'

async function gotoStable(page: import('@playwright/test').Page, url: string) {
  await page.goto(url)
  // Let fonts/layout settle; keep short to reduce CI time.
  await page.waitForTimeout(250)
}

test.describe('visual: key routes', () => {
  test('home', async ({ page }) => {
    await gotoStable(page, '/')
    await expect(page).toHaveScreenshot('home.png', { fullPage: true })
  })

  test('login', async ({ page }) => {
    await gotoStable(page, '/login')
    await expect(page).toHaveScreenshot('login.png', { fullPage: true })
  })

  test('demo editor', async ({ page }) => {
    await gotoStable(page, '/demo/editor')
    // Wait for editor to be ready so the screenshot is meaningful.
    await expect(page.getByRole('button', { name: 'Preview' })).toBeEnabled({
      timeout: 30_000,
    })
    await expect(page).toHaveScreenshot('demo-editor.png', { fullPage: true })
  })
})

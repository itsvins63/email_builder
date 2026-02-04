import { expect, test } from '@playwright/test'

test('demo editor loads and toolbar buttons become enabled', async ({ page }) => {
  await page.goto('/demo/editor')
  await expect(page.getByRole('heading', { name: 'Demo Editor' })).toBeVisible()

  const previewBtn = page.getByRole('button', { name: 'Preview' })

  // GrapesJS initialization can take a moment; wait until the UI is ready.
  await expect(previewBtn).toBeEnabled({ timeout: 30_000 })

  await previewBtn.click()
  // Preview mode toggles canvas; no perfect assertion, but should not navigate.
  await expect(page).toHaveURL(/\/demo\/editor/)
})

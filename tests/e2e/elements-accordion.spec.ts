import { test, expect } from '@playwright/test'

async function ensureExpanded(
  title: import('@playwright/test').Locator,
  category: import('@playwright/test').Locator,
) {
  // If collapsed, click until expanded (max 3 tries)
  for (let i = 0; i < 3; i++) {
    const collapsed = await category.evaluate((el) =>
      el.classList.contains('oc-cat-collapsed'),
    )
    if (!collapsed) return
    await title.click()
    await title.page().waitForTimeout(200)
  }
}

test('elements panel: categories render and can be expanded/collapsed', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/demo/editor')

  const left = page.locator('.gjs-left-blocks')
  await expect(left).toBeVisible()

  const basicTitle = left.locator('text=Basic').first()
  await expect(basicTitle).toBeVisible({ timeout: 30_000 })

  // Find category container
  const basicCat = basicTitle.locator('xpath=ancestor::*[contains(@class,"gjs-block-category")][1]')
  await ensureExpanded(basicTitle, basicCat)

  // Expand and check blocks exist
  await expect(left.locator('text=Heading')).toBeVisible({ timeout: 30_000 })

  // Collapse and ensure blocks hidden
  await basicTitle.click()
  await expect(left.locator('text=Heading')).not.toBeVisible()

  // Expand again
  await basicTitle.click()
  await expect(left.locator('text=Heading')).toBeVisible({ timeout: 30_000 })
})

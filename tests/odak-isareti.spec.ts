import { expect, test, type Page } from '@playwright/test'

/**
 * Odak işareti kırpılmaz. Taşmayı gizleyen kap içindeki başlıkta işaret kabın içinde çizilir.
 * İnceleme bulgusu: "Bu adım" açılır bölümünde işaret kabın 10 piksel dışında kalıyordu.
 */

async function openDemo(page: Page) {
  await page.goto('/')
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Kafe örneğini aç').first().click({ timeout: 2000 })
    await expect(page).toHaveURL(/#\/ozet/, { timeout: 2000 })
  }).toPass()
}

test('açılır bölüm başlığındaki odak işareti kabın içinde görünür', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/1/adim/00')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Adım 00')
  const header = page.locator('.aside-collapse:not(.foundation-collapse) .ant-collapse-header').first()
  test.skip(!(await header.isVisible().catch(() => false)), 'Bu genişlikte açılır bölüm yerine yan sütun görünür')

  await page.keyboard.press('Tab')
  await expect(page.locator('html')).toHaveAttribute('data-focus-mode', 'keyboard')
  await header.focus()
  await expect(header).toBeFocused()

  const result = await header.evaluate((el) => {
    const marker = getComputedStyle(el, '::before')
    const box = el.getBoundingClientRect()
    let clip: DOMRect | null = null
    for (let node = el.parentElement; node; node = node.parentElement) {
      if (/hidden|clip/.test(getComputedStyle(node).overflowX)) { clip = node.getBoundingClientRect(); break }
    }
    const left = box.left + parseFloat(marker.left)
    return {
      content: marker.content, display: marker.display, width: parseFloat(marker.width),
      background: marker.backgroundColor, left, right: left + parseFloat(marker.width),
      clipLeft: clip?.left ?? -Infinity, clipRight: clip?.right ?? Infinity,
      outline: getComputedStyle(el).outlineStyle, shadow: getComputedStyle(el).boxShadow,
    }
  })
  expect(result.content).not.toBe('none')
  expect(result.display).not.toBe('none')
  expect(result.width).toBeGreaterThanOrEqual(2)
  expect(result.background).not.toBe('rgba(0, 0, 0, 0)')
  // Ölçüm gerçek bir kırpan kap bulmalı. Yoksa test boşa geçer.
  expect(Number.isFinite(result.clipLeft)).toBe(true)
  // İşaret kırpan kabın içinde kalır.
  expect(result.left).toBeGreaterThanOrEqual(result.clipLeft)
  expect(result.right).toBeLessThanOrEqual(result.clipRight)
  // Çevreleyen halka yoktur.
  expect(result.outline).toBe('none')
  expect(result.shadow).toBe('none')
})

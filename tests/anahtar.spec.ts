import { expect, test, type Locator, type Page } from '@playwright/test'

/*
 * Anahtar görünüşte hap biçimli küçük bir iz olarak kalır.
 * Basma alanı görünmez katmanla en az 44 CSS piksel olur.
 * Saydam kenarla büyütülen iz, köşeleri basık oval çizer. Bu test o hatayı yakalar.
 */

async function openDemo(page: Page) {
  await page.goto('/')
  await page.getByText('Örnek planı aç', { exact: true }).first().click()
  await expect(page).toHaveURL(/#\/ozet/)
}

async function shape(toggle: Locator) {
  return toggle.evaluate((el) => {
    const cs = getComputedStyle(el)
    const box = el.getBoundingClientRect()
    return {
      height: box.height,
      borderTop: parseFloat(cs.borderTopWidth),
      borderBottom: parseFloat(cs.borderBottomWidth),
    }
  })
}

async function hitArea(toggle: Locator) {
  return toggle.evaluate((el) => {
    const box = el.getBoundingClientRect()
    const cx = box.left + box.width / 2
    const cy = box.top + box.height / 2
    const points: [number, number][] = [
      [cx, cy],
      [cx, cy - 21],
      [cx, cy + 21],
      [box.left + 1, cy],
      [box.right - 1, cy],
    ]
    return points.map(([x, y]) => document.elementFromPoint(x, y)?.closest('[role="switch"]') === el)
  })
}

/* Devralma sayfası "Evet" ve "Hayır" yazan büyük anahtarı bilerek kullanır. İzi 44 piksel yüksekliktedir. */
const pages = [
  { route: '/#/ozet', name: 'Plan özeti', maxTrack: 28 },
  { route: '/#/devralma', name: 'Devralma', maxTrack: 44 },
]

for (const { route, name, maxTrack } of pages) {
  test(`${name}: anahtar hap biçimli kalır ve basma alanı 44 pikseldir`, async ({ page }) => {
    await openDemo(page)
    await page.goto(route)
    const toggles = page.getByRole('switch')
    await expect(toggles.first()).toBeVisible()
    const count = await toggles.count()
    for (let i = 0; i < count; i++) {
      const toggle = toggles.nth(i)
      await toggle.scrollIntoViewIfNeeded()
      const s = await shape(toggle)
      expect(s.borderTop, `${name} anahtar ${i}: üst kenar`).toBe(0)
      expect(s.borderBottom, `${name} anahtar ${i}: alt kenar`).toBe(0)
      expect(s.height, `${name} anahtar ${i}: görünen iz yüksekliği`).toBeLessThanOrEqual(maxTrack)
      expect(await hitArea(toggle), `${name} anahtar ${i}: basma alanı`).toEqual([true, true, true, true, true])
    }
  })
}

test('Plan özeti: kısa yol anahtarı dokunmayla açılır ve kapanır', async ({ page }) => {
  await openDemo(page)
  const toggle = page.getByRole('switch', { name: /kısa yol/i })
  await toggle.scrollIntoViewIfNeeded()
  const start = (await toggle.getAttribute('aria-checked')) === 'true'
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', String(!start))
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', String(start))
  const s = await shape(toggle)
  expect(s.height).toBeLessThanOrEqual(28)
})

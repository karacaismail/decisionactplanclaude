import { expect, test } from '@playwright/test'
import { installProbe, measurePage, measureTarget, measureTargets } from './audit'

test('Saydam alan ipucu küçük yazı bulgusu üretmez', async ({ page }) => {
  await page.setContent('<style>input{font-size:16px}input::placeholder{font-size:13px;opacity:0}</style><input placeholder="Plan adı">')
  expect((await measurePage(page)).findings.filter((finding) => finding.rule === 'yazi')).toEqual([])
  await page.addStyleTag({ content: 'input::placeholder{opacity:1}' })
  expect((await measurePage(page)).findings.filter((finding) => finding.rule === 'yazi')).toHaveLength(1)
})

test('Kartı kaplayan bağlantının ek basma alanı ölçülür', async ({ page, hasTouch }) => {
  await page.setContent(`<style>
    article{position:relative;margin:40px;border:4px solid transparent;width:120px;height:100px}
    a{position:static;display:inline-block;margin:20px;font-size:16px;height:24px}
    a::after{content:'';position:absolute;inset:0}
  </style><article><a href="#ac" id="bag">Aç</a></article>`)
  await installProbe(page)
  const box = await page.locator('article').boundingBox()
  if (!box) throw new Error('Kartın kutusu bulunamadı.')
  if (hasTouch) await page.touchscreen.tap(box.x + 8, box.y + 8)
  else await page.mouse.click(box.x + 8, box.y + 8)
  await expect(page).toHaveURL(/#ac$/)
  expect(await measureTarget(page, '#bag')).toBeNull()
  expect(await measureTargets(page, ['#bag'])).toEqual([])
})

test('Toplu ölçüm tekli ölçümle aynı küçük kontrolü bulur', async ({ page }) => {
  // Sayfa uygulamanın viewport etiketini taşır. Etiket yoksa mobil WebKit sayfayı küçültür.
  // Küçültülen sayfada 44 piksellik kutu 43,99 piksel ölçülür.
  await page.setContent('<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><button id="kucuk" style="width:24px;height:24px">A</button><button id="buyuk" style="width:44px;height:44px">B</button>')
  expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(1)
  await installProbe(page)
  const expected = await measureTarget(page, '#kucuk')
  expect(expected).toMatchObject({ rule: 'dokunma', measured: '24.00 × 24.00 CSS px' })
  expect(await measureTargets(page, ['#kucuk', '#buyuk'])).toEqual([expected])
})

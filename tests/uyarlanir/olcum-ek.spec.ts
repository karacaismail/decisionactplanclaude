import { expect, test } from '@playwright/test'
import { installProbe, measurePage, measureTarget, measureTargets } from './audit'
import { captureFocus, settleFocusAnimations } from './focus-audit'

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

// Odak yardımcısının öz denetimi. Native giriş ::before çizemez. İşaret alan kabında aranır.
const odakSayfasi = (govde: string, ek = '') => `<meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; background: #fff; font: 16px sans-serif; }
    *:focus, *:focus-visible { outline: none; }
    .kap { position: relative; display: block; margin: 40px; width: 220px; }
    .kap input { display: block; width: 200px; height: 44px; margin: 0; border: 1px solid #555; }
    html[data-focus-mode='keyboard'] .kap:has(input:focus-visible)::before {
      content: ''; position: absolute; left: -8px; top: 4px; bottom: 4px; width: 3px; background: #8f2812; pointer-events: none;
    }
    ${ek}
  </style>${govde}`

async function klavyeOdagi(page: import('@playwright/test').Page, govde: string, ek = '') {
  await page.setContent(odakSayfasi(govde, ek))
  await installProbe(page)
  await page.evaluate(() => document.documentElement.setAttribute('data-focus-mode', 'keyboard'))
  await page.keyboard.press('Tab')
  await expect(page.locator('#hedef')).toBeFocused()
  const { capture, stableCapture } = await captureFocus(page)
  expect(stableCapture).toBe(true)
  return capture.reading
}

test('Odak yardımcısı native girişin alan kabındaki tek işareti kabul eder', async ({ page }) => {
  const reading = await klavyeOdagi(page, '<label class="kap">Ad <input id="hedef"></label>')
  expect(reading.issues).toEqual([])
  expect(reading.measurementIssues).toEqual([])
  expect((reading.pseudos ?? []).filter((p) => p.visible)).toHaveLength(1)
})

test('Odak yardımcısı iki kontrol taşıyan kaptaki işareti kabul etmez', async ({ page }) => {
  const reading = await klavyeOdagi(page, '<div class="kap field"><input id="hedef"><input aria-label="İkinci"></div>')
  expect(reading.issues).toContain('Görünür, çevrelemeyen odak işareti yok.')
  expect(reading.issues).toContain('Odak işareti birden fazla kontrol taşıyan kapta çiziliyor.')
})

test('Odak yardımcısı iki odak işaretini kabul etmez', async ({ page }) => {
  const reading = await klavyeOdagi(page, '<div class="field" style="position:relative;margin:40px;padding-left:16px"><label class="kap" style="margin:0">Ad <input id="hedef"></label></div>',
    `html[data-focus-mode='keyboard'] .field:has(input:focus-visible)::before {
      content: ''; position: absolute; left: 2px; top: 4px; bottom: 4px; width: 3px; background: #8f2812; pointer-events: none; }`)
  expect(reading.issues).toContain('Kontrol birden fazla odak işareti gösteriyor.')
})

test('Odak yardımcısı alan kabındaki çevreleyen halkayı kabul etmez', async ({ page }) => {
  const golge = await klavyeOdagi(page, '<label class="kap">Ad <input id="hedef"></label>',
    "html[data-focus-mode='keyboard'] .kap:has(input:focus-visible) { box-shadow: 0 0 0 2px #8f2812; }")
  expect(golge.issues).toContain('Odak çevresinde outline veya gölge halkası var.')
  const cizgi = await klavyeOdagi(page, '<label class="kap">Ad <input id="hedef"></label>',
    "html[data-focus-mode='keyboard'] .kap input:focus-visible { outline: 2px solid #8f2812; }")
  expect(cizgi.issues).toContain('Odak çevresinde outline veya gölge halkası var.')
})

test('Odak yardımcısı alan kabının geçişi bitince ölçer', async ({ page }) => {
  const reading = await klavyeOdagi(page, '<label class="kap">Ad <input id="hedef"></label>',
    `.kap::before { opacity: 0; transition: opacity 400ms linear; }
     html[data-focus-mode='keyboard'] .kap:has(input:focus-visible)::before { opacity: 1; }`)
  expect(reading.issues).toEqual([])
  expect(reading.measurementIssues).toEqual([])
})

test('Odak yardımcısı süre sınırında bitmeyen animasyonda açık hata verir', async ({ page }) => {
  await page.setContent(odakSayfasi('<label class="kap">Ad <input id="hedef"></label>',
    '@keyframes uzun { from { opacity: .5 } to { opacity: 1 } } .kap { animation: uzun 10s linear; }'))
  await installProbe(page)
  await page.keyboard.press('Tab')
  await expect(settleFocusAnimations(page, 200)).rejects.toThrow(/200 ms içinde bitmedi: label uzun/)
})

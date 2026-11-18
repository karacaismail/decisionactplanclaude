import { expect, test, type Page } from '@playwright/test'
import { installProbe, measurePage, measureTarget } from './audit'

// Kasıtlı küçük ölçüler, denetimin hatayı bulduğunu sınar. Ürün stili değildir.
async function fixture(page: Page, body: string, css = '') {
  await page.setContent(`<!doctype html>
    <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; font: 16px/1.5 Outfit, sans-serif; }
          button, input, textarea { font: inherit; }
          p { margin: 0; }
          ${css}
        </style>
      </head>
      <body>${body}</body>
    </html>`)
}

test('13 piksel yazı bulunur, 14 piksel yazı kabul edilir', async ({ page }) => {
  await fixture(page, `
    <p id="kucuk">Küçük yazı</p>
    <p id="sinir">Sınırdaki yazı</p>
    <p id="gorunur" aria-hidden="true">Görünen yazı</p>
  `, '#kucuk, #gorunur { font-size: 13px; } #sinir { font-size: 14px; }')

  const result = await measurePage(page)
  expect(result.findings.filter((finding) => finding.rule === 'yazi')).toEqual([
    expect.objectContaining({ selector: '#kucuk', measured: '13 CSS px' }),
    expect.objectContaining({ selector: '#gorunur', measured: '13 CSS px' }),
  ])
})

test('Gizli yazılar görünür yazı sayısını artırmaz', async ({ page }) => {
  await fixture(page, `
    <p id="acik">Görünen açıklama</p>
    <p hidden>Gizli açıklama</p>
    <div style="display: none"><p>Kapalı bölüm</p></div>
    <div style="visibility: hidden"><p>Görünmeyen bölüm</p></div>
    <div style="opacity: 0"><p>Saydam bölüm</p></div>
    <p class="okuyucu">Ekran okuyucu açıklaması</p>
    <input type="hidden" value="Gizli değer">
  `, `
    p { font-size: 13px; }
    #acik { font-size: 14px; }
    .okuyucu { position: absolute; width: 1px; height: 1px; clip-path: inset(50%); }
  `)

  const result = await measurePage(page)
  expect(result.findings).toEqual([])
  expect(result.textCount).toBe(1)
})

test('Yatayda tamamen kırpılan yazı görünür sayılmaz', async ({ page }) => {
  await fixture(page, `
    <p>Görünen açıklama</p>
    <div id="kirpan"><p id="kirpilan">Gizli yazı</p></div>
  `, `
    #kirpan { position: relative; width: 80px; height: 40px; overflow: hidden; }
    #kirpilan { position: absolute; left: 120px; top: 0; width: 80px; font-size: 13px; }
  `)

  const result = await measurePage(page)
  expect(result.findings).toEqual([])
  expect(result.textCount).toBe(1)
})

test('Form değerleri, ipuçları ve kapalı düğmenin yazısı ölçülür', async ({ page }) => {
  await fixture(page, `
    <input id="deger" aria-label="Plan adı" value="Yeni plan">
    <input id="ipucu" aria-label="Not" placeholder="Not yazın">
    <textarea id="not" aria-label="Açıklama">Plan açıklaması</textarea>
    <button id="kapali" disabled>Kaydet</button>
    <input id="sinir" aria-label="Başlık" value="Başlık" style="font-size: 14px">
  `, 'input, textarea, button { display: block; width: 160px; height: 44px; font-size: 13px; }')

  const result = await measurePage(page)
  expect(result.findings.filter((finding) => finding.rule === 'yazi').map((finding) => finding.selector))
    .toEqual(['#deger', '#ipucu', '#not', '#kapali'])
})

test('Alan yazısı büyük olsa da 13 piksel ipucu bulunur', async ({ page }) => {
  await fixture(page, `
    <input id="kucuk-ipucu" aria-label="Plan adı" placeholder="Ad yazın">
    <input id="sinir-ipucu" aria-label="Not" placeholder="Not yazın">
  `, `
    input { display: block; width: 160px; height: 44px; font-size: 16px; }
    #kucuk-ipucu::placeholder { font-size: 13px; opacity: 1; }
    #sinir-ipucu::placeholder { font-size: 14px; opacity: 1; }
  `)

  const result = await measurePage(page)
  const findings = result.findings.filter((finding) => finding.rule === 'yazi')
  expect(findings).toHaveLength(1)
  expect(findings[0]).toMatchObject({ measured: '13 CSS px', text: 'Ad yazın' })
  expect(findings[0].selector).toMatch(/^#kucuk-ipucu(?:::placeholder)?$/)
})

test('Sayfanın yatay taşması bulunur', async ({ page }) => {
  const viewport = page.viewportSize()
  if (!viewport) throw new Error('Bu test sabit ekran genişliği gerektirir.')
  await fixture(page, '<div id="tasan">Geniş içerik</div>', `#tasan { width: ${viewport.width + 80}px; }`)

  const dimensions = await page.evaluate(() => ({
    page: document.scrollingElement!.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }))
  expect(dimensions.page).toBeGreaterThan(dimensions.viewport)
  const result = await measurePage(page)
  expect(result.findings.filter((finding) => finding.rule === 'tas-ma')).toEqual([
    expect.objectContaining({ selector: 'document.scrollingElement' }),
  ])
})

test('B4: Sayfa genişlemeden sola taşan görünür içerik bulunur', async ({ page }) => {
  await fixture(page, '<p id="sola-tasan">Sola taşan içerik</p>', `
    html { direction: ltr; }
    #sola-tasan { position: relative; left: -20px; width: 160px; }
  `)

  await expect(page.locator('#sola-tasan')).toBeVisible()
  const dimensions = await page.locator('#sola-tasan').evaluate((el) => {
    const box = el.getBoundingClientRect()
    return {
      direction: getComputedStyle(document.documentElement).direction,
      left: box.left,
      right: box.right,
      page: document.scrollingElement!.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }
  })
  expect(dimensions.direction).toBe('ltr')
  expect(dimensions.left).toBe(-20)
  expect(dimensions.right).toBeGreaterThan(0)
  expect(dimensions.page).toBe(dimensions.viewport)

  const result = await measurePage(page)
  expect(result.findings).toEqual(expect.arrayContaining([
    expect.objectContaining({ rule: 'tas-ma' }),
  ]))
})

test('Kendi alanında kayan tablo sayfa taşması sayılmaz', async ({ page }) => {
  await fixture(page, `
    <div id="tablo-alani" tabindex="0" role="region" aria-label="Model karşılaştırması">
      <table>
        <thead><tr><th>Model adı</th><th>Açıklama</th></tr></thead>
        <tbody><tr>
          <td>Uzun Vadeli Stratejik Karar Karşılaştırma Modeli</td>
          <td>DocType Template Proposal kayıtları aynı tabloda karşılaştırılır.</td>
        </tr></tbody>
      </table>
    </div>
  `, `
    #tablo-alani { width: 100%; overflow-x: auto; }
    table { width: calc(100vw + 240px); table-layout: fixed; border-collapse: collapse; }
    th, td { padding: 8px; font-size: 14px; word-break: normal; overflow-wrap: normal; }
  `)

  const dimensions = await page.locator('#tablo-alani').evaluate((el) => {
    el.scrollLeft = 80
    return { content: el.scrollWidth, width: el.clientWidth, scrolled: el.scrollLeft }
  })
  expect(dimensions.content).toBeGreaterThan(dimensions.width)
  expect(dimensions.scrolled).toBeGreaterThan(0)
  const result = await measurePage(page)
  expect(result.findings).toEqual([])
})

test('Küçük form alanları ve kapalı kontroller dokunma listesine alınır', async ({ page, hasTouch }) => {
  test.skip(!hasTouch, 'Aday listesi dokunma desteği açık projelerde sınanır.')
  await fixture(page, `
    <input id="girdi" aria-label="Plan adı" value="Ad">
    <textarea id="metin" aria-label="Not">Not</textarea>
    <input id="secim" type="checkbox" aria-label="Seç">
    <button id="kapali" disabled>Aç</button>
    <span id="devre-disi" role="button" aria-disabled="true">Sil</span>
    <input type="hidden" value="Gizli değer">
  `, `
    input, textarea, button, [role="button"] {
      appearance: none; display: block; width: 24px; height: 24px; padding: 0; border: 0;
    }
  `)

  const result = await measurePage(page)
  expect(result.coarse).toBe(true)
  expect(result.smallTargets.map((target) => target.selector).sort()).toEqual([
    '#devre-disi', '#girdi', '#kapali', '#metin', '#secim',
  ])
})

test('44 piksel sınırı iki yönde korunur ve kapalı düğme ölçülür', async ({ page }) => {
  await fixture(page, `
    <button id="sinir">Aç</button>
    <button id="dar">Aç</button>
    <button id="kisa">Aç</button>
    <button id="kapali" disabled data-clicks="0">Sil</button>
  `, `
    button { display: block; width: 44px; height: 44px; padding: 0; border: 0; }
    #dar { width: 43px; }
    #kisa { height: 43px; }
    #kapali { width: 24px; height: 24px; }
  `)
  await page.locator('#kapali').evaluate((el) => {
    el.addEventListener('click', () => el.setAttribute('data-clicks', '1'))
  })
  await installProbe(page)

  expect(await measureTarget(page, '#sinir')).toBeNull()
  for (const selector of ['#dar', '#kisa', '#kapali']) {
    expect(await measureTarget(page, selector)).toMatchObject({ rule: 'dokunma', selector })
  }
  await expect(page.locator('#kapali')).toBeDisabled()
  await expect(page.locator('#kapali')).toHaveAttribute('data-clicks', '0')
})

for (const example of [
  { title: 'Ek alan 24 piksel düğmenin dokunma alanını genişletir', pseudo: 'before', border: 0 },
  { title: 'Kenarlıklı düğmenin ek dokunma alanı doğru ölçülür', pseudo: 'after', border: 4 },
]) {
  test(example.title, async ({ page, hasTouch }) => {
    await fixture(page, '<button id="eylem" aria-label="Kaydı aç" data-clicks="0"></button>', `
      #eylem {
        position: relative; display: block; margin: 40px; width: 24px; height: 24px;
        padding: 0; border: ${example.border}px solid transparent; border-radius: 0; overflow: visible;
        touch-action: manipulation;
      }
      #eylem::${example.pseudo} {
        content: ''; position: absolute; left: -${10 + example.border}px; top: -${10 + example.border}px;
        width: 44px; height: 44px; pointer-events: auto;
      }
    `)
    const target = page.locator('#eylem')
    await target.evaluate((el) => {
      el.addEventListener('click', () => {
        el.setAttribute('data-clicks', String(Number(el.getAttribute('data-clicks')) + 1))
      })
    })
    const box = await target.boundingBox()
    if (!box) throw new Error('Deneme düğmesinin görünür kutusu bulunamadı.')
    expect(box.width).toBe(24)
    expect(box.height).toBe(24)

    // Dört nokta görünür kutunun dışında, beklenen 44 piksel alanın içindedir.
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    for (const [dx, dy] of [[-21, 0], [21, 0], [0, -21], [0, 21]]) {
      if (hasTouch) await page.touchscreen.tap(center.x + dx, center.y + dy)
      else await page.mouse.click(center.x + dx, center.y + dy)
    }
    await expect(target).toHaveAttribute('data-clicks', '4')
    await installProbe(page)
    expect(await measureTarget(page, '#eylem')).toBeNull()
  })
}

test('Basılmayan veya kırpılan ek alan yeterli dokunma alanı sayılmaz', async ({ page }) => {
  await fixture(page, `
    <button id="etkisiz" aria-label="Kaydı aç"></button>
    <div id="kirpan"><button id="kirpilan" aria-label="Kaydı sil"></button></div>
  `, `
    button { position: relative; display: block; width: 24px; height: 24px; padding: 0; border: 0; }
    button::before { content: ''; position: absolute; inset: -10px; }
    #etkisiz { margin: 40px; }
    #etkisiz::before { pointer-events: none; }
    #kirpan { margin: 40px; width: 24px; height: 24px; overflow: hidden; }
  `)
  await installProbe(page)

  for (const selector of ['#etkisiz', '#kirpilan']) {
    expect(await measureTarget(page, selector)).toMatchObject({ rule: 'dokunma', selector })
  }
})

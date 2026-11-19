import { expect, test, type Page } from '@playwright/test'

/**
 * Temel sorular ve varsayım panosu (docs/uygulama-plani-on-yuz.md, Adım 4).
 * Örnek plan açılır. Taş kartları, süzgeç, adım bağlantısı ve varsayım durumu sınanır.
 */

async function openDemo(page: Page) {
  await page.goto('/')
  /* Yük altında ilk tıklama kaçabilir. Yardımcı, adres değişene kadar yeniden dener. */
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Kafe örneğini aç').first().click({ timeout: 2000 })
    await expect(page).toHaveURL(/#\/ozet/, { timeout: 2000 })
  }).toPass()
}

async function noHorizontalOverflow(page: Page, label: string) {
  const r = await page.evaluate(() => {
    const wide = [...document.querySelectorAll('main *')]
      .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1)
      .slice(0, 5)
      .map((e) => e.tagName + '.' + (e as HTMLElement).className.toString().slice(0, 60))
    return { sw: document.documentElement.scrollWidth, iw: window.innerWidth, wide }
  })
  expect(r.sw, `${label}: sayfa yatay taşmamalı ${r.wide.join(' | ')}`).toBeLessThanOrEqual(r.iw)
}

async function smallText(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('main *')]
      .filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()))
      .filter((e) => getComputedStyle(e).visibility !== 'hidden' && (e as HTMLElement).offsetParent !== null)
      .filter((e) => Number.parseFloat(getComputedStyle(e).fontSize) < 14)
      .map((e) => e.tagName + '.' + (e as HTMLElement).className + ' ' + getComputedStyle(e).fontSize)
      .slice(0, 5),
  )
}

test('temel sorular: 20 kart görünür, süzgeç daraltır, kart adımı açar', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/temel')
  await expect(page.getByRole('heading', { level: 1, name: 'Strateji öncesi 20 temel soru' })).toBeVisible()
  const cards = page.locator('.stone-card')
  await expect(cards).toHaveCount(20)
  await expect(page.getByText('Var ama dayanağı zayıf.')).toBeVisible()
  await noHorizontalOverflow(page, 'temel')
  expect(await smallText(page), '14 px altı metin').toEqual([])
  expect(await page.locator('.ant-card .ant-card').count(), 'kart içinde kart').toBe(0)
  expect(await page.locator('main .ant-alert').count(), 'ant-alert').toBe(0)
  expect(await page.locator('main .ant-btn-primary').count(), 'dolu düğme').toBe(0)

  await page.locator('.temel-filter .ant-segmented').getByText('Eksik', { exact: true }).click()
  await expect(page.locator('.temel-filter-count')).not.toHaveText('20 soru gösteriliyor.')
  const missing = await cards.count()
  expect(missing).toBeLessThan(20)
  expect(await page.locator('.stone-card:not(.is-eksik)').count(), 'süzgeçte yalnız eksik taş').toBe(0)
  await noHorizontalOverflow(page, 'temel, eksik süzgeci')

  await page.locator('.temel-filter .ant-segmented').getByText('Hepsi', { exact: true }).click()
  await expect(cards).toHaveCount(20)
  await cards.first().click()
  await expect(page).toHaveURL(/#\/karar\/\d+\/adim\/\d+/)
})

test('temel sorular: kart klavyeyle açılır ve çevreleyen halka çizilmez', async ({ page, browserName, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1024, 'Klavye yolu masaüstünde sınanır')
  await openDemo(page)
  await page.goto('/#/temel')
  const link = page.locator('.stone-card .stone-link').first()
  await expect(link).toBeVisible()
  // Odak modu yalnız Tab ile açılır. Safari ailesi bağlantıya Option+Tab ile gider.
  const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
  await page.locator('.temel-filter .ant-segmented-item-input').last().focus()
  await page.keyboard.press(tab)
  await expect(link).toBeFocused()
  const focus = await link.evaluate((el) => {
    const s = getComputedStyle(el)
    return { mode: document.documentElement.getAttribute('data-focus-mode'), outline: s.outlineStyle, shadow: s.boxShadow, marker: getComputedStyle(el, '::before').width }
  })
  expect(focus.mode).toBe('keyboard')
  expect(focus.outline, 'çevreleyen halka yok').toBe('none')
  expect(focus.shadow, 'gölge halkası yok').toBe('none')
  expect(focus.marker, 'görünür odak işareti').toBe('3px')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#\/karar\/1\/adim\/01/)
})

test('varsayım panosu: kart görünür, "Çürüdü" seçilince uyarı çıkar ve Adım 10 güncellenir', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/varsayimlar')
  await expect(page.getByRole('heading', { level: 1, name: 'Varsayımlar' })).toBeVisible()
  const cards = page.locator('.assumption-card')
  await expect(cards.first()).toBeVisible()
  expect(await cards.count()).toBeGreaterThanOrEqual(1)
  const warning = page.getByText('Çürüyen varsayım var. Hazırlık kontrolünde bunu not edin.')
  await expect(warning).toHaveCount(0)
  await noHorizontalOverflow(page, 'varsayımlar')
  expect(await smallText(page), '14 px altı metin').toEqual([])
  expect(await page.locator('.ant-card .ant-card').count(), 'kart içinde kart').toBe(0)
  expect(await page.locator('main .ant-alert').count(), 'ant-alert').toBe(0)
  expect(await page.locator('main .ant-btn-primary').count(), 'dolu düğme').toBe(0)

  // Dar ekranda pano sekmelidir. Üç sekme de görünür olmalı, hiçbiri menüye saklanmamalı.
  const tabs = page.locator('.assumption-board .ant-tabs-tab')
  if ((await tabs.count()) > 0) {
    await expect(tabs).toHaveCount(3)
    const clipped = await tabs.evaluateAll((els) => {
      const wrap = els[0].closest('.ant-tabs-nav-wrap')!.getBoundingClientRect()
      return els.filter((e) => { const r = e.getBoundingClientRect(); return r.left < wrap.left - 1 || r.right > wrap.right + 1 }).map((e) => e.textContent)
    })
    expect(clipped, 'kırpılan sekme').toEqual([])
    await expect(page.locator('.assumption-board .ant-tabs-nav-operations')).toHaveClass(/ant-tabs-nav-operations-hidden/)
  }

  const first = cards.first()
  const sentence = (await first.locator('.assumption-text').innerText()).trim()
  await first.locator('.ant-select').click()
  await page.locator('.ant-select-dropdown:visible').getByText('Çürüdü', { exact: true }).click()
  await expect(warning).toBeVisible()
  await noHorizontalOverflow(page, 'varsayımlar, uyarı açık')

  // Sonuç notu alandan çıkınca kaydedilir.
  const moved = page.locator('.assumption-card', { hasText: sentence })
  await expect(moved).toBeVisible()
  await moved.getByLabel('Sonuç ne oldu?').fill('30 kişiden 4 kişi aldı.')
  await moved.getByLabel('Sonuç ne oldu?').blur()

  // Değişiklik Adım 10 verisine yazılır ve sayfa yenilenince kalır.
  await expect
    .poll(() =>
      page.evaluate((s) => {
        const hit = Object.values(localStorage).find((raw) => raw.includes(s))
        if (!hit) return null
        const find = (x: unknown): Record<string, unknown> | null => {
          if (!x || typeof x !== 'object') return null
          const o = x as Record<string, unknown>
          if (o.assumption === s) return o
          for (const v of Object.values(o)) { const f = find(v); if (f) return f }
          return null
        }
        const row = find(JSON.parse(hit))
        return row ? `${row.status}|${row.resultNote}` : null
      }, sentence),
    )
    .toBe('curudu|30 kişiden 4 kişi aldı.')
  await page.reload()
  await expect(warning).toBeVisible()
})

test('varsayım panosu: varsayım yoksa boş durum Adım 10 bağlantısı verir', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Yeni plan' }).click()
  await page.getByPlaceholder('Örneğin Mahalle kafesi').fill('Boş plan')
  await page.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page).toHaveURL(/#\/baslangic/)
  await page.goto('/#/varsayimlar')
  await expect(page.locator('.assumption-card')).toHaveCount(0)
  await expect(page.getByText('Henüz varsayım yok')).toBeVisible()
  await noHorizontalOverflow(page, 'varsayımlar, boş')
  await page.getByRole('link', { name: "Adım 10'u aç" }).click()
  await expect(page).toHaveURL(/#\/karar\/3\/adim\/10/)
  await page.goto('/#/temel')
  await expect(page.locator('.stone-card')).toHaveCount(20)
  await noHorizontalOverflow(page, 'temel, boş plan')
})

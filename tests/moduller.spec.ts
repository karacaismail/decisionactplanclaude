import { expect, test, type Page } from '@playwright/test'
import { openDemo, ready } from './uyarlanir/audit'

/* Proje ve destek modülleri numaralı aşamaların dışındadır. Bu test kabuğu, rotaları ve depoyu sınar. */

const MODULE_PAGES = [
  { path: '/projeler', heading: 'Projeler' },
  { path: '/projeler/ornek-proje', heading: 'Proje' },
  { path: '/projeler/ornek-proje/is/ornek-is', heading: 'Proje işi' },
  { path: '/destek', heading: 'Destek ve teşvik programları' },
  { path: '/destek/ornek-program', heading: 'Destek programı' },
  { path: '/destek/eslesme', heading: 'Size uygun destekler' },
  { path: '/destek/basvurular', heading: 'Başvurularım' },
]

async function noHorizontalOverflow(page: Page, label: string) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  expect(r.sw, `Sayfa yatay taşmamalı: ${label}`).toBeLessThanOrEqual(r.iw + 1)
}

async function expectTargets(page: Page, selector: string) {
  const boxes = await page.locator(selector).evaluateAll((els) => els.filter((e) => e.getClientRects().length).map((e) => {
    const b = e.getBoundingClientRect()
    return { text: (e.textContent ?? '').trim(), w: b.width, h: b.height }
  }))
  expect(boxes.length).toBeGreaterThan(0)
  for (const b of boxes) {
    expect(b.w, `${b.text} genişliği`).toBeGreaterThanOrEqual(44)
    expect(b.h, `${b.text} yüksekliği`).toBeGreaterThanOrEqual(44)
  }
}

test('plan açıkken gezinmede Projeler görünür ve sıra doğrudur', async ({ page, hasTouch }) => {
  await openDemo(page, hasTouch)
  const bottom = page.locator('.bottom-nav')
  if (await bottom.isVisible()) {
    const items = bottom.locator(':scope > a, :scope > button')
    await expect(items).toHaveText(['Planlar', 'Pano', 'Yol', 'Projeler', 'Menü'])
    await expectTargets(page, '.bottom-nav > a, .bottom-nav > button')
    await bottom.getByRole('link', { name: 'Projeler', exact: true }).tap()
  } else {
    const nav = page.locator('.product-nav')
    await expect(nav.getByRole('link', { name: 'Projeler', exact: true })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Destek ve teşvik', exact: true })).toBeVisible()
    await nav.getByRole('link', { name: 'Projeler', exact: true }).click()
  }
  await expect(page).toHaveURL(/#\/projeler$/)
  await ready(page)
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText('Projeler')
  await expect(page.locator('main')).toContainText(/Projeler burada görünecek|Henüz proje yok/)
  await noHorizontalOverflow(page, '/projeler')
})

test('menüde destek grubu üç aşamanın altında ve numarasızdır', async ({ page, hasTouch }) => {
  await openDemo(page, hasTouch)
  const menuButton = page.locator('.bottom-nav').getByRole('button', { name: 'Menü', exact: true })
  test.skip(!(await menuButton.isVisible()), 'Çekirdek menü yalnız telefonda alt menüden açılır.')
  await menuButton.tap()
  const drawer = page.locator('.shell-drawer .ant-drawer-body')
  await expect(drawer).toBeVisible()
  const groups = await drawer.locator('.ant-menu-item-group-title').allTextContents()
  const stage3 = groups.indexOf('3. Strateji uygulama')
  const destek = groups.indexOf('Destek ve teşvik')
  expect(stage3).toBeGreaterThanOrEqual(0)
  expect(destek).toBeGreaterThan(stage3)
  await drawer.getByRole('link', { name: 'Destek programları' }).tap()
  await expect(page).toHaveURL(/#\/destek$/)
  await expect(drawer).toBeHidden()
})

test('modül ekranları açılır, taşmaz ve başlığını gösterir', async ({ page, hasTouch }) => {
  await openDemo(page, hasTouch)
  for (const { path, heading } of MODULE_PAGES) {
    await page.goto(`/#${path}`)
    await expect(page).toHaveURL(new RegExp(`#${path}$`))
    await ready(page)
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText(heading)
    await expect(page.getByRole('main').getByRole('status')).toBeVisible()
    await noHorizontalOverflow(page, path)
    const buttons = page.locator('main .empty-actions button')
    if (await buttons.count()) await expectTargets(page, 'main .empty-actions button')
  }
})

test('plan yokken destek listesi açılır, proje ekranı Planlar ekranına döner', async ({ page }) => {
  await page.goto('/#/destek')
  await ready(page)
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText('Destek ve teşvik programları')
  await page.goto('/#/projeler')
  await expect(page).toHaveURL(/#\/$/)
  const bottom = page.locator('.bottom-nav')
  if (await bottom.isVisible()) await expect(bottom.getByRole('link', { name: 'Projeler' })).toHaveCount(0)
})

test('modül deposu gerçek IndexedDB ile yazar, okur ve siler', async ({ page }) => {
  await page.goto('/')
  await ready(page)
  const result = await page.evaluate(async () => {
    const kv = await import('/src/platform/kv.ts' as string)
    const store = kv.createIndexedDbKvStore(indexedDB, 'decisionactplan-modules-test')
    await store.set('proje/p1/a', { ad: 'Tezgâh' })
    await store.set('proje/p1/b', 2)
    await store.set('proje/p10/a', 3)
    const read = await store.get('proje/p1/a')
    const keys = await store.keys('proje/p1/')
    const removed = await store.deletePrefix('proje/p1/')
    const left = await store.keys()
    return { read, keys, removed, left, persistent: store.persistent }
  })
  expect(result).toEqual({ read: { ad: 'Tezgâh' }, keys: ['proje/p1/a', 'proje/p1/b'], removed: 2, left: ['proje/p10/a'], persistent: true })
})

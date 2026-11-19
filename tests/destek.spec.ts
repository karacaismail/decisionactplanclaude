import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { openDemo, ready } from './uyarlanir/audit'

/*
 * Destek ve teşvik modülü. Bugün 19 Kasım 2026 Perşembe günü olarak sabitlenir.
 * Katalog 12 Ağustos 2026 günü kontrol edildi. Bu yüzden bütün bilgi eskidir. Bu doğru ve dürüst davranıştır.
 */

const BUGUN = new Date('2026-11-19T10:00:00')
const SON_KONTROL = 'Son kontrol: 12 Ağustos 2026 Çarşamba'
const UYARI = 'Bu bilgi resmî kaynak değildir. Tutar ve tarih değişebilir. Başvurmadan önce kurumun sayfasını okuyun. Bu uygulama destek vermez ve söz vermez.'
const PLAN_KEY = 'decisionactplan-v1'
const DEMO_ID = 'ornek-mahalle-kafesi'
const KANIT = process.env.DESTEK_KANIT_DIR

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(BUGUN)
})

async function kanit(page: Page, info: TestInfo, ad: string) {
  if (!KANIT) return
  await mkdir(KANIT, { recursive: true })
  await page.screenshot({ path: `${KANIT}/${ad}-${info.project.name}.png`, fullPage: true })
}

async function tasmaYok(page: Page, label: string) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  expect(r.sw, `Sayfa yatay taşmamalı: ${label}`).toBeLessThanOrEqual(r.iw + 1)
}

/** Ana alandaki görünür düğme, bağlantı ve seçim kutuları en az 44 piksel olmalı. */
async function dokunmaAlani(page: Page, label: string) {
  const kucuk = await page.locator('main').evaluate((main) => {
    const sel = 'a[href], button, .ant-select, .ant-checkbox-wrapper, .ant-radio-wrapper, summary, input.ant-input, .ant-input-number, .ant-picker'
    return [...main.querySelectorAll(sel)].filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden').map((e) => {
      const b = e.getBoundingClientRect()
      return { text: (e.textContent ?? e.getAttribute('aria-label') ?? '').trim().slice(0, 40), w: Math.round(b.width), h: Math.round(b.height) }
    }).filter((b) => b.w < 44 || b.h < 44)
  })
  expect(kucuk, `44 pikselden küçük hedef: ${label}`).toEqual([])
}

/** Ana alandaki görünür metin en az 14 piksel olmalı. */
async function yaziBoyutu(page: Page, label: string) {
  const kucuk = await page.locator('main').evaluate((main) => {
    const out: string[] = []
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement
      if (!el || !n.textContent?.trim() || !el.getClientRects().length) continue
      const size = parseFloat(getComputedStyle(el).fontSize)
      if (size < 14) out.push(`${size}px: ${n.textContent.trim().slice(0, 30)}`)
    }
    return out
  })
  expect(kucuk, `14 pikselden küçük yazı: ${label}`).toEqual([])
}

async function denetle(page: Page, label: string) {
  await tasmaYok(page, label)
  await dokunmaAlani(page, label)
  await yaziBoyutu(page, label)
}

async function planOku(page: Page) {
  return page.evaluate(([key, id]) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? '{}')
    const plan = raw.state?.plans?.[id]
    if (!plan) return null
    const steps = Object.fromEntries(Object.entries(plan.steps ?? {}).map(([k, v]) => [k, { stale: (v as { stale?: boolean }).stale ?? false, revision: (v as { revision?: number }).revision }]))
    return { revision: plan.revision, updatedAt: plan.updatedAt, steps, profile: plan.profile, limits: plan.limits, decisions: plan.decisions?.length, revisions: plan.revisions?.length }
  }, [PLAN_KEY, DEMO_ID] as const)
}

test('program listesi plan olmadan açılır ve katalog ilk açılışta inmez', async ({ page }, info) => {
  const istekler: string[] = []
  page.on('request', (r) => istekler.push(r.url()))
  await page.goto('/')
  await ready(page)
  expect(istekler.filter((u) => /modules\/destek\/(data|screens|motor)\//.test(u)), 'katalog ilk açılışta inmemeli').toEqual([])

  await page.goto('/#/destek')
  await ready(page)
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Destek ve teşvik programları')
  await expect(main.getByText(UYARI)).toBeVisible()
  await expect(main.getByRole('status')).toHaveText('46 programdan 46 tanesi görünüyor.')
  await expect(main.locator('.dt-program-karti')).toHaveCount(46)
  await expect(main.getByText(SON_KONTROL)).toHaveCount(46)
  await expect(main.getByRole('heading', { name: 'Eski bilgi' })).toBeVisible()
  expect(istekler.some((u) => u.includes('modules/destek/data/programlar'))).toBe(true)
  await denetle(page, '/destek')
  await kanit(page, info, 'katalog')
})

test('arama ve süzme çalışır, seçim kutusu markalı bileşendir', async ({ page }) => {
  await page.goto('/#/destek')
  await ready(page)
  const main = page.getByRole('main')
  await expect(main.locator('select')).toHaveCount(0)
  await main.getByLabel('Programlarda arayın').fill('kosgeb')
  await expect(main.getByRole('status')).toHaveText('46 programdan 9 tanesi görünüyor.')
  await main.getByLabel('Programlarda arayın').fill('')
  await main.locator('.dt-programlar-filtre .ant-select').filter({ has: page.locator('#dt-durum') }).click()
  await page.locator('.ant-select-dropdown:visible').getByText('Kapandı', { exact: true }).click()
  await expect(main.locator('.dt-program-karti', { hasText: '1501 Sanayi Ar-Ge Destek Programı' })).toBeVisible()
  await expect(main.locator('.dt-program-karti', { hasText: 'Kredi Garanti Fonu kefaleti' })).toHaveCount(0)
  await main.getByRole('button', { name: 'Süzmeyi temizleyin' }).click()
  await expect(main.getByRole('status')).toHaveText('46 programdan 46 tanesi görünüyor.')
})

test('program kartı numaralı bölümleri gösterir, eski tutarı gizler ve resmî sayfayı yeni sekmede açar', async ({ page }, info) => {
  await page.goto('/#/destek/tubitak1501')
  await ready(page)
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('1501 Sanayi Ar-Ge Destek Programı')
  await expect(main.getByRole('heading', { level: 2 }).filter({ hasText: /^\d\. / })).toHaveText([
    '1. Kim alabilir?', '2. Neyi öder?', '3. Ne kadar?', '4. Son tarih ne zaman?', '5. Resmî sayfa nerede?', '6. Hangi belgeler gerekir?',
  ])
  await expect(main.getByText(SON_KONTROL)).toBeVisible()
  const tutar = main.locator('section', { has: page.getByRole('heading', { name: '3. Ne kadar?' }) })
  await expect(tutar.getByText('Tutarı kurumun sayfasında okuyun.', { exact: true })).toBeVisible()
  await expect(main).not.toContainText('20.000.000')
  await expect(main.getByText('Kapandı').first()).toBeVisible()
  await expect(main.getByText(UYARI)).toBeVisible()
  const link = main.getByRole('link', { name: /Kurumun sayfasını açın/ })
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link).toHaveAttribute('rel', /noopener/)
  await expect(link).toHaveAttribute('href', /^https:\/\/tubitak\.gov\.tr\//)
  await expect(main.getByText('Başvuru listesi bir plana bağlıdır. Önce bir plan açın.')).toBeVisible()
  await denetle(page, '/destek/tubitak1501')
  await kanit(page, info, 'program-karti')
})

test('sihirbazda hep Bilmiyorum diyen kişi Uygun sonucu almaz', async ({ page }, info) => {
  await page.goto('/#/destek/eslesme')
  await ready(page)
  const main = page.getByRole('main')
  for (let i = 1; i <= 5; i++) {
    await expect(main.getByRole('status')).toHaveText(`Soru ${i}. Toplam 5 soru var.`)
    if (i === 1) {
      await denetle(page, 'sihirbaz')
      await kanit(page, info, 'sihirbaz')
    }
    await main.getByRole('button', { name: 'Bilmiyorum', exact: true }).click()
  }
  await expect(main.getByRole('heading', { level: 2, name: 'Uygun (0)' })).toBeVisible()
  await expect(main.getByRole('heading', { level: 2, name: 'Belki (46)' })).toBeVisible()
  await expect(main.getByRole('heading', { level: 2, name: 'Uygun değil (0)' })).toBeVisible()
  // Son cevaptan sonra odak sonuç başlığına geçer. Durum satırı sayıları söyler.
  await expect(main.getByRole('heading', { level: 2, name: 'Sonuçlar' })).toBeFocused()
  await expect(main.getByRole('status')).toHaveText('Uygun: 0. Belki: 46. Uygun değil: 0.')
  await denetle(page, 'sonuç')
  await kanit(page, info, 'sonuc-bilmiyorum')
})

test('1 yaşında 3 kişilik kafede KOSGEB Küresel Rekabetçilik uygun değildir', async ({ page }, info) => {
  await page.goto('/#/destek/eslesme')
  await ready(page)
  const main = page.getByRole('main')
  const sec = async (id: string, metin: string) => {
    await main.locator('.ant-select').filter({ has: page.locator(`#${id}`) }).click()
    await page.locator('.ant-select-dropdown:visible .ant-select-item-option').filter({ hasText: new RegExp(`^${metin}$`) }).click()
  }
  const devam = () => main.getByRole('button', { name: /^(Devam|Sonucu gösterin)$/ }).click()
  await sec('dt-soru-yil', '2025')
  await sec('dt-soru-ay', 'Kasım')
  await devam()
  await main.getByLabel('Sigortalı çalışan sayısı').fill('3')
  await devam()
  await sec('dt-soru-faaliyet', 'I. Konaklama ve yiyecek hizmeti')
  await page.keyboard.press('Escape')
  await devam()
  await expect(main.getByRole('heading', { level: 2, name: 'Yurt dışına satış yapıyor musunuz?' })).toBeFocused()
  await denetle(page, 'seçenekli soru')
  await main.getByText('İhracat yok', { exact: true }).click()
  await devam()
  await main.getByText('Hayır', { exact: true }).click()
  await devam()
  const ret = main.locator('section.dt-sonuc-uygun-degil')
  await expect(ret.getByRole('heading', { level: 2 })).toHaveText(/^Uygun değil \(\d+\)$/)
  await expect(ret.locator('li', { hasText: 'KOSGEB Girişimci Destek Programı, İş Geliştirme Desteği' })).toContainText('Sizin iş kolunuz bunlardan biri değil.')
  // Kurumun sayfasına göre ihracatsız işletmeye açık iki yol daha var. Bu yüzden Küresel Rekabetçilik "Belki" olur ve neden yazar.
  const kuresel = main.locator('section.dt-sonuc-belki li', { hasText: 'KOSGEB Küresel Rekabetçilik Destek Programı' })
  await expect(kuresel).toBeVisible()
  await expect(kuresel).toContainText('Sizin ihracatınız ve Ar-Ge çalışmanız yok.')
  // Yalnız yaşı ya da çalışan sayısı tutan program "Uygun" sayılmaz. Öteki koşullar denetlenmedi.
  await expect(main.getByRole('heading', { level: 2, name: 'Uygun (0)' })).toBeVisible()
  await expect(main.locator('section.dt-sonuc-belki li', { hasText: 'Bireysel Katılım Sermayesi' })).toContainText('Tutan koşullar:')
  await denetle(page, 'kafe sonucu')
  await kanit(page, info, 'sonuc-kafe')

  // Cevaplar sayfa yenilenince kalır. Plan olmadan da saklanır.
  await page.reload()
  await ready(page)
  await expect(main.locator('section.dt-sonuc-belki li', { hasText: 'KOSGEB Küresel Rekabetçilik Destek Programı' })).toContainText('Sizin ihracatınız')

  // Bir cevabı değiştirmek tek soruluk sihirbazı açar ve odağı soruya taşır.
  await main.getByRole('button', { name: 'İhracat cevabını değiştirin' }).click()
  await expect(main.getByRole('heading', { level: 2, name: 'Yurt dışına satış yapıyor musunuz?' })).toBeFocused()
  await expect(main.getByRole('status')).toHaveText('Soru 1. Toplam 1 soru var.')
  await main.getByText('Düzenli ihracat yapıyoruz', { exact: true }).click()
  await main.getByRole('button', { name: 'Sonucu gösterin' }).click()
  await expect(main.locator('section.dt-sonuc-belki li', { hasText: 'KOSGEB Küresel Rekabetçilik Destek Programı' })).toContainText('Tutan koşullar:')
})

test('başvuru belge listesiyle eklenir, yenilemede kalır ve planı değiştirmez', async ({ page, hasTouch }, info) => {
  await openDemo(page, hasTouch)
  const once = await planOku(page)
  expect(once).not.toBeNull()

  await page.goto('/#/destek/kosgebIsletmeGelistirme')
  await ready(page)
  const main = page.getByRole('main')
  await main.getByRole('button', { name: 'Başvuru listeme ekle' }).click()
  await expect(main.getByRole('heading', { name: 'Bu işi destek olmadan da yapar mıydık?' })).toBeFocused()
  await main.getByRole('button', { name: 'Hayır', exact: true }).click()
  await expect(main.getByText('Program başvuru listenize eklendi.')).toBeVisible()
  await main.getByRole('link', { name: 'Başvurularıma gidin' }).click()
  await expect(page).toHaveURL(/#\/destek\/basvurular$/)
  await ready(page)

  const kart = main.locator('.dt-basvuru', { hasText: 'KOSGEB İşletme Geliştirme Destek Programı' })
  await expect(kart).toBeVisible()
  await expect(main.getByRole('status')).toHaveText('1 başvuru var. 1 tanesi hazırlanıyor.')
  await expect(kart).toContainText('Cevabınız: Hayır.')
  const belgeler = kart.locator('.ant-checkbox-wrapper')
  await expect(belgeler).toHaveCount(4)
  await belgeler.first().click()
  await expect(kart.getByText('4 belgeden 1 tanesi hazır.')).toBeVisible()
  await belgeler.nth(1).click()
  await belgeler.nth(1).click()
  await expect(kart.getByText('4 belgeden 1 tanesi hazır.')).toBeVisible()
  await kart.locator('.ant-select').click()
  await page.locator('.ant-select-dropdown:visible').getByText('Başvuruldu', { exact: true }).click()
  await expect(main.getByRole('status')).toHaveText('1 başvuru var. 0 tanesi hazırlanıyor.')
  await denetle(page, '/destek/basvurular')
  await kanit(page, info, 'basvurular')

  await page.reload()
  await ready(page)
  await expect(kart.locator('.ant-checkbox-wrapper').first().locator('input')).toBeChecked()
  await expect(kart.locator('.ant-select')).toContainText('Başvuruldu')

  // Profil yazmak da planı değiştirmez.
  await page.goto('/#/destek/eslesme')
  await ready(page)
  await main.getByRole('button', { name: 'Bilmiyorum', exact: true }).click()
  await expect(main.getByRole('status')).toHaveText('Soru 2. Toplam 5 soru var.')

  expect(await planOku(page)).toEqual(once)
  const ozet = await page.evaluate(() => JSON.parse(localStorage.getItem('decisionactplan-rollups-v1') ?? '{}').data?.destek?.['ornek-mahalle-kafesi'])
  expect(ozet).toMatchObject({ toplam: 1, durumlar: { basvuruldu: 1, hazirlaniyor: 0 } })

  // Başvuru listeden çıkarılınca özet de sıfırlanır. Odak liste başlığına geçer.
  await page.goto('/#/destek/basvurular')
  await ready(page)
  await main.getByRole('button', { name: 'Listeden çıkarın' }).click()
  await page.locator('.ant-popover:visible').getByRole('button', { name: 'Çıkarın' }).click()
  await expect(main.getByRole('heading', { level: 2, name: 'Başvuru listesi' })).toBeFocused()
  await expect(main.getByRole('status')).toContainText('Henüz başvuru yok.')
  const sonOzet = await page.evaluate(() => JSON.parse(localStorage.getItem('decisionactplan-rollups-v1') ?? '{}').data?.destek?.['ornek-mahalle-kafesi'])
  expect(sonOzet).toMatchObject({ toplam: 0 })
  expect(await planOku(page)).toEqual(once)
})

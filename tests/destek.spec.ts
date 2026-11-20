import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { activate, openDemo, ready } from './uyarlanir/audit'

/*
 * Destek ve teşvik modülü. Bugün 19 Kasım 2026 Perşembe günü olarak sabitlenir.
 * Katalog 12 Ağustos 2026 günü kontrol edildi. Bu yüzden bütün bilgi eskidir. Bu doğru ve dürüst davranıştır.
 */

const BUGUN = new Date('2026-11-19T10:00:00')
const SON_KONTROL = 'Son kontrol: 12 Ağustos 2026 Çarşamba'
const UYARI = 'Bu bilgi resmî kaynak değildir. Tutar ve tarih değişebilir. Başvurmadan önce kurumun sayfasını okuyun. Bu uygulama destek vermez ve söz vermez.'
const PLAN_KEY = 'decisionactplan-v1'
const DEMO_ID = 'ornek-mahalle-kafesi'
const DEMO_ADI = 'Örnek: Mahalle kafesi'
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
  await expect(main.locator('.dt-program-karti').first()).toContainText('Bilinmiyor. Bilgi eski.')
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

test('program kartı numaralı bölümleri gösterir, eski tutar ve tarih yerine bilgi verir ve resmî sayfayı yeni sekmede açar', async ({ page }, info) => {
  await page.goto('/#/destek/tubitak1501')
  await ready(page)
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('1501 Sanayi Ar-Ge Destek Programı')
  await expect(main.getByRole('heading', { level: 2 }).filter({ hasText: /^\d\. / })).toHaveText([
    '1. Kim alabilir?', '2. Neyi öder?', '3. Ne kadar?', '4. Son tarih ne zaman?', '5. Resmî sayfa nerede?', '6. Hangi belgeler gerekir?', '7. Bu programla birlikte kullanma',
  ])
  await expect(main.getByText(SON_KONTROL)).toBeVisible()
  const tutar = main.locator('section', { has: page.getByRole('heading', { name: '3. Ne kadar?' }) })
  await expect(tutar.getByText('Bilinmiyor. Bilgi eski.', { exact: true }).first()).toBeVisible()
  const tarih = main.locator('section', { has: page.getByRole('heading', { name: '4. Son tarih ne zaman?' }) })
  await expect(tarih.getByText('Bilinmiyor. Bilgi eski.').first()).toBeVisible()
  await expect(tarih.getByText('Süre bilinmiyor. Kuruma sorun.')).toBeVisible()
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
  // Temel akış en çok 5 sorudur. Kuruluş durumu bilinmezse kuruluş tarihi sorulmaz. Bu yüzden toplam 4 soruya iner.
  await expect(main.getByRole('status')).toHaveText('Soru 1. Toplam 5 soru var.')
  await expect(main.getByRole('heading', { level: 2, name: 'İşletmeniz kuruldu mu?' })).toBeVisible()
  await denetle(page, 'sihirbaz')
  await kanit(page, info, 'sihirbaz')
  await main.getByRole('button', { name: 'Bilmiyorum', exact: true }).click()
  for (let i = 2; i <= 4; i++) {
    await expect(main.getByRole('status')).toHaveText(`Soru ${i}. Toplam 4 soru var.`)
    await main.getByRole('button', { name: 'Bilmiyorum', exact: true }).click()
  }
  await expect(main.getByRole('heading', { level: 2, name: 'Uygun (0)' })).toBeVisible()
  await expect(main.getByRole('heading', { level: 2, name: 'Belki (46)' })).toBeVisible()
  await expect(main.getByRole('heading', { level: 2, name: 'Uygun değil (0)' })).toBeVisible()
  // Son cevaptan sonra odak sonuç başlığına geçer. Durum satırı sayıları söyler.
  await expect(main.getByRole('heading', { level: 2, name: 'Sonuçlar' })).toBeFocused()
  await expect(main.getByRole('status')).toHaveText('Uygun: 0. Belki: 46. Uygun değil: 0.')
  // İş kolu seçilmedi. Bu yüzden "işe özel program yok" notu görünmez.
  await expect(main.getByText('Katalogda işinize özel program yok.', { exact: false })).toHaveCount(0)
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
  const bilmiyorum = () => main.getByRole('button', { name: 'Bilmiyorum', exact: true }).click()

  // Temel akış: kuruluş durumu, kuruluş tarihi, ölçek, işletme türü ve iş kolu.
  await main.getByText('Kuruldu', { exact: true }).click()
  await devam()
  await sec('dt-soru-yil', '2025')
  await sec('dt-soru-ay', 'Kasım')
  await devam()
  await expect(main.getByRole('heading', { level: 2, name: 'İşletmeniz hangi ölçekte?' })).toBeFocused()
  await main.getByText('Mikro', { exact: true }).click()
  await devam()
  await expect(main.getByRole('heading', { level: 2, name: 'İşletmenizin türü ne?' })).toBeFocused()
  await denetle(page, 'seçenekli soru')
  await kanit(page, info, 'isletme-turu')
  await main.getByText('Şahıs ya da esnaf işletmesi', { exact: true }).click()
  await devam()
  await sec('dt-soru-faaliyet', 'I. Konaklama ve yiyecek hizmeti')
  await page.keyboard.press('Escape')
  await expect(main.getByRole('status')).toHaveText('Soru 5. Toplam 5 soru var.')
  await devam()

  // Katalogda kafeye özel program yok. Liste genel programları gösterir.
  await expect(main.getByText('Katalogda işinize özel program yok. Listede genel programlar var.')).toBeVisible()
  // Şahıs işletmesi sermaye şirketi değildir. Katalog 1501 için sermaye şirketi ister.
  const ret = main.locator('section.dt-sonuc-uygun-degil')
  await expect(ret.locator('li', { hasText: '1501 Sanayi Ar-Ge Destek Programı' })).toContainText('Şahıs ya da esnaf işletmesi başvuramaz.')

  // İkinci katman yalnız "Belki" sonucunu netleştiren soruları ister. Cevaplanan soru yeniden sorulmaz.
  const netlestir = main.locator('section.dt-sonuc-netlestir')
  await expect(netlestir).toContainText('İhracat')
  await expect(netlestir).not.toContainText('İş kolu')
  await netlestir.getByRole('button', { name: 'Bu soruları cevaplayın' }).click()
  await expect(main.getByRole('heading', { level: 2, name: 'Kaç sigortalı çalışanınız var?' })).toBeFocused()
  await main.getByLabel('Sigortalı çalışan sayısı').fill('3')
  await devam()
  await expect(main.getByRole('heading', { level: 2, name: 'Yurt dışına satış yapıyor musunuz?' })).toBeFocused()
  await main.getByText('İhracat yok', { exact: true }).click()
  await devam()
  await bilmiyorum()
  await bilmiyorum()
  await bilmiyorum()
  // İhracat yoksa Küresel Rekabetçilik Ar-Ge sorusunu ister.
  await expect(netlestir).toContainText('Ar-Ge çalışması')
  await netlestir.getByRole('button', { name: 'Bu soruları cevaplayın' }).click()
  await main.getByText('Hayır', { exact: true }).click()
  await devam()

  await expect(ret.getByRole('heading', { level: 2 })).toHaveText(/^Uygun değil \(\d+\)$/)
  await expect(ret.locator('li', { hasText: 'KOSGEB Girişimci Destek Programı, İş Geliştirme Desteği' })).toContainText('Sizin iş kolunuz bunlardan biri değil.')
  // Kurumun sayfasına göre ihracatsız işletmeye açık iki yol daha var. Bu yüzden Küresel Rekabetçilik "Belki" olur ve neden yazar.
  const kuresel = main.locator('section.dt-sonuc-belki li', { hasText: 'KOSGEB Küresel Rekabetçilik Destek Programı' })
  await expect(kuresel).toBeVisible()
  await expect(kuresel).toContainText('Sizin ihracatınız ve Ar-Ge çalışmanız yok.')
  // Yalnız sorulan koşulları tutan program "Uygun" sayılmaz. Öteki koşullar denetlenmedi.
  await expect(main.getByRole('heading', { level: 2, name: 'Uygun (0)' })).toBeVisible()
  await expect(main.locator('section.dt-sonuc-belki li', { hasText: 'Teknogirişim Rozeti' })).toContainText('Tutan koşullar:')
  await denetle(page, 'kafe sonucu')
  await kanit(page, info, 'sonuc-kafe')

  // Tercih süzgeci programı gruptan çıkarmaz. Yalnız etiket ekler ve sona taşır.
  const belkiSayisi = await main.locator('#dt-sonuc-belki-baslik').textContent()
  await main.getByText('Kredi ya da geri ödemeli destek istemiyorum', { exact: true }).click()
  await expect(kuresel).toContainText('Tercihinize uymuyor')
  await expect(main.locator('#dt-sonuc-belki-baslik')).toHaveText(belkiSayisi ?? '')
  await denetle(page, 'tercih')

  // Cevaplar ve tercih sayfa yenilenince kalır. Plan olmadan da saklanır.
  await page.reload()
  await ready(page)
  await expect(kuresel).toContainText('Sizin ihracatınız')
  await expect(kuresel).toContainText('Tercihinize uymuyor')

  // Bir cevabı değiştirmek tek soruluk sihirbazı açar ve odağı soruya taşır.
  await main.getByRole('button', { name: 'İhracat cevabını değiştirin' }).click()
  await expect(main.getByRole('heading', { level: 2, name: 'Yurt dışına satış yapıyor musunuz?' })).toBeFocused()
  await expect(main.getByRole('status')).toHaveText('Soru 1. Toplam 1 soru var.')
  await main.getByText('Düzenli ihracat yapıyoruz', { exact: true }).click()
  await main.getByRole('button', { name: 'Sonucu gösterin' }).click()
  await expect(main.locator('section.dt-sonuc-belki li', { hasText: 'KOSGEB Küresel Rekabetçilik Destek Programı' })).toContainText('Tutan koşullar:')
})

test('henüz kurulmamış girişimde kuruluş tarihi sorulmaz', async ({ page }) => {
  await page.goto('/#/destek/eslesme')
  await ready(page)
  const main = page.getByRole('main')
  await main.getByText('Henüz kurulmadı', { exact: true }).click()
  await main.getByRole('button', { name: 'Devam' }).click()
  await expect(main.getByRole('status')).toHaveText('Soru 2. Toplam 4 soru var.')
  await expect(main.getByRole('heading', { level: 2, name: 'İşletmeniz hangi ölçekte?' })).toBeFocused()
  await main.getByRole('button', { name: 'Bilmiyorum', exact: true }).click()
  await main.getByText('Henüz seçilmedi', { exact: true }).click()
  await main.getByRole('button', { name: 'Devam' }).click()
  await main.getByRole('button', { name: 'Bilmiyorum', exact: true }).click()
  await expect(main.getByRole('heading', { level: 2, name: 'Sonuçlar' })).toBeFocused()
  const ret = main.locator('section.dt-sonuc-uygun-degil')
  await expect(ret.locator('li', { hasText: 'Markalaşma Programı' })).toContainText('Sizin işletmeniz henüz kurulmadı.')
  await expect(main.locator('.dt-sonuc-cevap dt', { hasText: /^Kuruluş tarihi$/ })).toHaveCount(0)
  await expect(main.locator('.dt-sonuc-cevap', { hasText: 'İşletme türü' })).toContainText('Henüz seçilmedi.')
  await denetle(page, 'kurulmamış girişim')
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
  const durumKutusu = kart.locator('.ant-select').filter({ has: page.locator('[id$="-durum"]') })
  await durumKutusu.click()
  await page.locator('.ant-select-dropdown:visible').getByText('Başvuruldu', { exact: true }).click()
  await expect(main.getByRole('status')).toHaveText('1 başvuru var. 0 tanesi hazırlanıyor.')
  await denetle(page, '/destek/basvurular')
  await kanit(page, info, 'basvurular')

  await page.reload()
  await ready(page)
  await expect(kart.locator('.ant-checkbox-wrapper').first().locator('input')).toBeChecked()
  await expect(durumKutusu).toContainText('Başvuruldu')

  // Profil yazmak da planı değiştirmez.
  await page.goto('/#/destek/eslesme')
  await ready(page)
  await main.getByRole('button', { name: 'Bilmiyorum', exact: true }).click()
  await expect(main.getByRole('status')).toHaveText('Soru 2. Toplam 4 soru var.')

  expect(await planOku(page)).toEqual(once)
  const ozet = await page.evaluate(() => JSON.parse(localStorage.getItem('decisionactplan-rollups-v1') ?? '{}').data?.destek?.['ornek-mahalle-kafesi'])
  expect(ozet).toMatchObject({ toplam: 1, durumlar: { basvuruldu: 1, hazirlaniyor: 0 } })

  // Başvuru listeden çıkarılınca özet de sıfırlanır. Odak liste başlığına geçer.
  await page.goto('/#/destek/basvurular')
  await ready(page)
  await main.getByRole('button', { name: 'Listeden çıkarın' }).click()
  await page.locator('.ant-popover:visible').getByRole('button', { name: 'Çıkarın' }).click()
  await expect(main.getByRole('heading', { level: 2, name: 'Başvuru listesi' })).toBeFocused()
  await expect(main.getByRole('status')).toContainText('Henüz başvuru yok')
  const sonOzet = await page.evaluate(() => JSON.parse(localStorage.getItem('decisionactplan-rollups-v1') ?? '{}').data?.destek?.['ornek-mahalle-kafesi'])
  expect(sonOzet).toMatchObject({ toplam: 0 })
  expect(await planOku(page)).toEqual(once)
})

/** Metni düzenli ifadede düz metin olarak kullanır. */

/** Markalı seçim kutusunda bir seçenek seçer. Yerel açılır menü kullanılmaz. */
async function secenekSec(page: Page, kutu: ReturnType<Page['locator']>, metin: string) {
  await kutu.click()
  await page.locator('.ant-select-dropdown:visible .ant-select-item-option').filter({ hasText: new RegExp(`^${metin}$`) }).click()
  await expect(page.locator('.ant-select-dropdown:visible')).toHaveCount(0)
}

test('belge ve kanıt listesi numaralı gruplarla açılır ve terim sözlüğe bağlanır', async ({ page }, info) => {
  await page.goto('/#/destek/belgeler')
  await ready(page)
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Belge ve kanıt listesi')
  await expect(main.getByText(UYARI)).toBeVisible()
  await expect(main.getByText('Son kontrol: 12 Ağustos 2026 Çarşamba.', { exact: false })).toBeVisible()
  const gruplar = main.getByRole('heading', { level: 2 }).filter({ hasText: /^\d\. / })
  await expect(gruplar).toHaveCount(9)
  await expect(gruplar.first()).toHaveText('1. Şirketin kuruluş ve kimlik belgeleri')
  await expect(main.getByText('9 grupta 36 belge var.')).toBeVisible()
  await expect(main.getByText('Şirket adına kimin imza atabileceğini gösterir.')).toBeVisible()
  await expect(main).not.toContainText(/TTBS|taşınmaz|kadastro/)
  await expect(main.locator('select')).toHaveCount(0)
  await denetle(page, '/destek/belgeler')
  await kanit(page, info, 'belgeler')

  await main.getByRole('link', { name: '“NACE kodu” ne demek?' }).click()
  await expect(page).toHaveURL(/#\/destek\/sozluk\?terim=naceKodu$/)
  await ready(page)
  await expect(main.locator('#dt-terim-naceKodu')).toBeFocused()
  await expect(main.locator('.dt-sozluk-secili')).toContainText('İşletmenin faaliyet alanını gösteren resmî koddur.')
})

test('gider rehberi giderden programa götürür ve seçimi yenilemede korur', async ({ page }, info) => {
  await page.goto('/#/destek/giderler')
  await ready(page)
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Gider rehberi')
  await expect(main.getByRole('heading', { name: 'Bu liste ilk rehberdir' })).toBeVisible()
  await expect(main.getByText('Bu liste söz değildir.', { exact: false })).toBeVisible()
  await expect(main.getByRole('heading', { name: 'Henüz gider seçmediniz' })).toBeVisible()
  await expect(main.locator('select')).toHaveCount(0)
  await denetle(page, '/destek/giderler boş')

  await secenekSec(page, main.locator('.dt-giderler-alan .ant-select'), 'Yazılım lisansları')
  await expect(page).toHaveURL(/kalem=yazilimLisansi/)
  await expect(main.getByRole('heading', { level: 2, name: 'Yazılım lisansları' })).toBeVisible()
  // Programlar katalogdaki gider metnine dayanır. Ekran bu metni de gösterir.
  await expect(main.getByText('Bu gider için 5 program bulundu. Programlar aşağıda.')).toBeVisible()
  await expect(main.getByText('Aynı faturayı iki programa yazmayın.')).toBeVisible()
  await expect(main.getByRole('heading', { level: 3 })).toHaveText('Bu gideri ödeyebilecek programlar (5)')
  await expect(main.locator('.dt-giderler-program')).toHaveCount(5)
  await expect(main.getByText('Katalogdaki gider: “Proje ekipmanı ve yazılım”').first()).toBeVisible()
  await expect(main.getByRole('link', { name: '“Çift finansman” ne demek?' })).toBeVisible()
  await denetle(page, '/destek/giderler seçili')
  await kanit(page, info, 'giderler')

  await page.reload()
  await ready(page)
  await expect(main.getByRole('heading', { level: 2, name: 'Yazılım lisansları' })).toBeVisible()
  await main.getByRole('link', { name: '1501 Sanayi Ar-Ge Destek Programı' }).click()
  await expect(page).toHaveURL(/#\/destek\/tubitak1501$/)
})

test('gider rehberi katalogda karşılığı olmayan gideri söyler ve hariç tutan programı aday yapmaz', async ({ page }, info) => {
  await page.goto('/#/destek/giderler?kalem=kira')
  await ready(page)
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 2, name: 'İşyeri kirası' })).toBeVisible()
  await expect(main.getByRole('heading', { level: 3, name: 'Bu gideri ödeyebilecek programlar (0)' })).toBeVisible()
  await expect(main.locator('.dt-giderler-yok')).toContainText('Katalogda bu gideri karşılayan program bulunmadı. Kuruma sorun.')
  await expect(main.locator('.dt-giderler-durum')).toHaveText('Katalogda bu gideri karşılayan program bulunmadı. Kuruma sorun.')
  await denetle(page, '/destek/giderler karşılıksız')
  await kanit(page, info, 'giderler-kira')

  await secenekSec(page, main.locator('.dt-giderler-alan .ant-select'), 'Yurt içinde internetten pazarlama')
  const haric = main.getByRole('heading', { level: 3, name: /^Bu gideri ödemeyen programlar/ })
  await expect(haric).toBeVisible()
  const adaylar = main.locator('.dt-giderler-liste').first()
  await expect(adaylar.getByRole('link', { name: 'Hizmet Sektörleri Atılım Programı (10962 sayılı Karar)' })).toHaveCount(0)
  await expect(main.locator('.dt-giderler-liste').last()).toContainText('Türkiye\'deki pazarlama giderleri')
  await denetle(page, '/destek/giderler hariç')
})

test('destek sözlüğü Türkçe abece sırasıyla dizilir', async ({ page }, info) => {
  await page.goto('/#/destek/sozluk')
  await ready(page)
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Destek sözlüğü')
  await expect(main.getByText('Sözlükte 26 terim var.')).toBeVisible()
  const harfler = await main.getByRole('heading', { level: 2 }).allTextContents()
  expect(harfler).toEqual(['A', 'Ç', 'D', 'E', 'F', 'G', 'H', 'İ', 'K', 'N', 'O', 'Ö', 'P', 'S', 'T', 'Y'])
  const terimler = await main.locator('dt').allTextContents()
  expect(terimler).toHaveLength(26)
  expect(terimler.slice(0, 3)).toEqual(['Ar-Ge', 'Çağrı', 'Çift finansman'])
  expect(terimler.indexOf('İşbirliği kuruluşu')).toBeGreaterThan(terimler.indexOf('Hibe'))
  expect(terimler.indexOf('Ön eşleşme')).toBeGreaterThan(terimler.indexOf('Ortaklık yatırımı'))
  await denetle(page, '/destek/sozluk')
  await kanit(page, info, 'sozluk')
})

test('program kartı her çiftin bilgisini bilinmiyor olarak gösterir', async ({ page }, info) => {
  await page.goto('/#/destek/kosgebGirisimciA')
  await ready(page)
  const main = page.getByRole('main')
  const bolum = main.locator('section', { has: page.getByRole('heading', { name: '7. Bu programla birlikte kullanma' }) })
  await bolum.locator('summary').click()
  await expect(bolum.locator('li')).toHaveCount(45)
  await expect(bolum.getByText('Bilinmiyor. Kuruma sorun.', { exact: true })).toHaveCount(45)
  await expect(bolum.getByRole('link', { name: 'Bireysel Katılım Sermayesi', exact: true })).toBeVisible()
  await expect(bolum.getByText('Birlikte kullanılamaz', { exact: false })).toHaveCount(0)
  await denetle(page, 'birlikte kullanma')
  await kanit(page, info, 'program-birlikte')
})

test('fayda süzgeci ve karttaki sözlük tanımı dokunma ve klavyeyle çalışır', async ({ page, hasTouch }) => {
  await page.goto('/#/destek')
  await ready(page)
  const main = page.getByRole('main')
  await secenekSec(page, main.locator('.ant-select').filter({ has: page.locator('#dt-fayda') }), 'Kefalet')
  await expect(main.locator('.dt-program-karti')).toHaveCount(1)
  const terim = main.locator('.dt-program-karti summary')
  if (hasTouch) await terim.tap()
  else {
    await terim.focus()
    await page.keyboard.press('Enter')
  }
  const tanim = await main.locator('.dt-fayda-terim p').innerText()
  await expect(main.locator('.dt-fayda-terim').getByText(tanim, { exact: true })).toBeVisible()
  await page.goto('/#/destek/sozluk')
  await ready(page)
  await expect(main.locator('dd').filter({ hasText: tanim })).toBeVisible()
  await main.getByLabel('Sözlükte arayın').fill('CAPEX')
  await expect(main.locator('dt')).toHaveText('Sabit yatırım')
})

test('kurum soruları plan olmadan açılır ve kopyalama sonucu gösterilir', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: {
      writeText: async (text: string) => { sessionStorage.setItem('destek-kopya', text) },
    } })
  })
  for (const yer of ['tubitak1501', 'basvurular']) {
    await page.goto(`/#/destek/${yer}`)
    await ready(page)
    const sorular = page.getByRole('region', { name: 'Kuruma sorulacak sorular' })
    await expect(sorular.locator('details')).toHaveCount(6)
    await expect(sorular.locator('details[open]')).toHaveCount(0)
    await sorular.getByText('Ödeme ve süre', { exact: true }).click()
    await sorular.getByRole('button', { name: 'Soruları kopyalayın' }).click()
    await expect(sorular.getByText('Ödeme ve süre soruları kopyalandı.')).toBeVisible()
    expect(await page.evaluate(() => sessionStorage.getItem('destek-kopya'))).toContain('Değerlendirme ve ilk ödeme süresi hangi olayla başlıyor?')
  }
})

test('başvuruya belge eklenir, birlikte kullanma uyarısı çıkar, yenileme ve dışa aktarmada kalır', async ({ page, hasTouch }, info) => {
  await openDemo(page, hasTouch)
  const once = await planOku(page)
  const main = page.getByRole('main')
  for (const id of ['bigg1812', 'kosgebGirisimciA', 'kgf']) {
    await page.goto(`/#/destek/${id}`)
    await ready(page)
    await main.getByRole('button', { name: 'Başvuru listeme ekle' }).click()
    await main.getByRole('button', { name: 'Evet', exact: true }).click()
    await expect(main.getByText('Program başvuru listenize eklendi.')).toBeVisible()
  }

  await page.goto('/#/destek/basvurular')
  await ready(page)
  const birlikte = main.locator('section.dt-basvurular-birlikte')
  await expect(birlikte.getByRole('heading', { level: 2 })).toHaveText('Programları birlikte kullanma')
  await expect(birlikte.getByText('Aynı gideri iki programa yazmadan önce iki kuruma da sorun.')).toBeVisible()
  const cift = birlikte.locator('li.dt-cift')
  const ciftler = birlikte.locator('summary')
  await expect(ciftler).toHaveText('Program çiftleri (3)')
  await ciftler.click()
  await expect(cift).toHaveCount(3)
  await expect(cift.locator('.dt-cift-ad + .dt-cift-durum')).toHaveText(Array(3).fill('Bilinmiyor. Kuruma sorun.'))
  await expect(cift.filter({ hasText: 'BiGG Yatırım' }).filter({ hasText: 'İş Geliştirme Desteği' })).toHaveCount(1)

  const kart = main.locator('.dt-basvuru', { hasText: 'KOSGEB Girişimci Destek Programı, İş Geliştirme Desteği' })
  const diger = main.locator('.dt-basvuru', { hasText: 'BiGG Yatırım' })
  for (const basvuru of [kart, diger]) {
    await basvuru.getByText('Gider kodları', { exact: true }).click()
    await basvuru.getByLabel('Fatura veya çalışan gideri için kod').fill('Fatura23')
    await basvuru.getByRole('button', { name: 'Gider kodlarını kaydedin' }).click()
    await expect(basvuru.getByText('Gider kodları kaydedildi.')).toBeVisible()
    await basvuru.getByText('Gider kodları', { exact: true }).click()
  }
  await expect(birlikte.getByText('Bu gider iki başvuruda da yer alıyor. Birlikte kullanımı kurumlara sorun.')).toBeVisible()
  const belgeler = kart.locator('.dt-basvuru-belgeler .ant-checkbox-wrapper')
  await expect(belgeler).toHaveCount(5)
  // Düğme kapanmaz. Seçim yoksa ekran nedenini söyler. Odak düğmede kalır.
  const ekleDugmesi = kart.getByRole('button', { name: 'Belgeyi ekleyin' })
  await ekleDugmesi.focus()
  await page.keyboard.press('Enter')
  await expect(kart.getByText('Önce listeden bir belge seçin.')).toBeVisible()
  await expect(ekleDugmesi).toBeFocused()
  await kart.locator('.dt-basvuru-ekle-belge .ant-select').click()
  const acilir = page.locator('.ant-select-dropdown:visible')
  await expect(acilir.locator('.ant-select-item-option-disabled', { hasText: 'Ticaret Sicil Gazetesi (listede var)' })).toBeVisible()
  await acilir.locator('.ant-select-item-option').filter({ hasText: /^İmza sirküleri$/ }).click()
  await expect(acilir).toHaveCount(0)
  await ekleDugmesi.focus()
  await page.keyboard.press('Enter')
  await expect(kart.getByText('“İmza sirküleri” belge listesine eklendi.')).toBeVisible()
  await expect(ekleDugmesi).toBeFocused()
  await expect(belgeler).toHaveCount(6)
  await expect(kart.getByText('6 belgeden 0 tanesi hazır.')).toBeVisible()
  await belgeler.last().click()
  await expect(kart.getByText('6 belgeden 1 tanesi hazır.')).toBeVisible()
  await denetle(page, 'başvuru belge ekleme')
  await kanit(page, info, 'basvuru-belge-birlikte')

  await page.reload()
  await ready(page)
  await expect(belgeler).toHaveCount(6)
  await expect(belgeler.last()).toContainText('İmza sirküleri')
  await expect(belgeler.last().locator('input')).toBeChecked()
  await ciftler.click()
  await expect(cift.locator('.dt-cift-ad + .dt-cift-durum')).toHaveText(Array(3).fill('Bilinmiyor. Kuruma sorun.'))
  await expect(birlikte.getByText('Bu gider iki başvuruda da yer alıyor. Birlikte kullanımı kurumlara sorun.')).toBeVisible()
  expect(await planOku(page)).toEqual(once)

  // Dışa aktarma eklenen belgeyi taşır. Plan silinip dosya içe alınınca belge geri gelir.
  await page.goto('/#/')
  await ready(page)
  const indirme = page.waitForEvent('download')
  await activate(page, page.getByRole('button', { name: `JSON indir: ${DEMO_ADI}` }), hasTouch)
  const dosya = info.outputPath('plan.json')
  await (await indirme).saveAs(dosya)
  const paket = JSON.parse(readFileSync(dosya, 'utf8'))
  expect(paket.kind).toBe('decisionactplan-bundle')
  const kayitlar = (paket.modules.destek.entries as [string, { belgeler?: { ad: string; kanit?: string }[] }][]).flatMap(([, v]) => v.belgeler ?? [])
  expect(kayitlar).toContainEqual({ ad: 'İmza sirküleri', hazir: true, kanit: 'k4' })
  await activate(page, page.getByRole('button', { name: `Sil: ${DEMO_ADI}` }), hasTouch)
  await activate(page, page.locator('.ant-popconfirm').getByRole('button', { name: 'Sil' }), hasTouch)
  await expect(page.getByRole('button', { name: `Sil: ${DEMO_ADI}` })).toHaveCount(0)
  await page.locator('input[type="file"][aria-label="JSON dosyası seç"]').setInputFiles(dosya)
  await expect(page.getByText('Plan içe alındı.')).toBeVisible()
  await page.goto('/#/destek/basvurular')
  await ready(page)
  await expect(belgeler).toHaveCount(6)
  await expect(belgeler.last()).toContainText('İmza sirküleri')
  await expect(belgeler.last().locator('input')).toBeChecked()

  // Eklenen belge çıkarılabilir. Programın kendi belgesinde çıkarma düğmesi yoktur.
  await expect(kart.getByRole('button', { name: /belgesini listeden çıkarın$/ })).toHaveCount(1)
  // Klavyeyle çıkarınca odak kaybolmaz. Odak belge başlığına geçer ve ekran sonucu söyler.
  await kart.getByRole('button', { name: '“İmza sirküleri” belgesini listeden çıkarın' }).focus()
  await page.keyboard.press('Enter')
  await expect(belgeler).toHaveCount(5)
  await expect(kart.getByRole('heading', { level: 4, name: 'Belgeler' })).toBeFocused()
  await expect(kart.getByText('“İmza sirküleri” listeden çıkarıldı.')).toBeVisible()
})

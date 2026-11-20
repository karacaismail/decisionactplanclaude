import { expect, test, type Page } from '@playwright/test'
import { auditFocus, type Audit } from './uyarlanir/focus-audit'
import { mkdir } from 'node:fs/promises'
import { installProbe, openDemo, ready } from './uyarlanir/audit'

/*
 * Finansman görünümü. Bugün 19 Kasım 2026 Perşembe günü olarak sabitlenir.
 * Ekran planı yalnız okur. Gider bağı destek deposuna yazılır. Destek çubuğa girmez.
 */

const BUGUN = new Date('2026-11-19T10:00:00')
const PLAN_KEY = 'decisionactplan-v1'
const DEMO_ID = 'ornek-mahalle-kafesi'
const UYARI = 'Bu gider iki başvuruda da yer alıyor. Birlikte kullanımı kurumlara sorun.'
const KANIT = process.env.DESTEK_KANIT_DIR

const KAYNAKLAR = [
  { _id: 'satir-tezgah', item: 'Tezgâh ve raf', budgetKurus: 4_500_000 },
  { _id: 'satir-makine', item: 'Espresso makinesi ve kahve değirmeni', budgetKurus: 12_000_000 },
  { _id: 'satir-usta', item: 'Usta eğitimi', people: 'Ayşe' },
]

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(BUGUN)
})

/** Kafe örneğine 3.3 kaynak satırlarını yazar. Bu yazma testin hazırlığıdır. */
async function kaynakYaz(page: Page) {
  await page.evaluate(([key, id, rows]) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? '{}')
    const plan = raw.state.plans[id]
    plan.steps.U33 = { values: { resources: rows }, status: 'taslak', updatedAt: plan.updatedAt }
    localStorage.setItem(key, JSON.stringify(raw))
  }, [PLAN_KEY, DEMO_ID, KAYNAKLAR] as const)
  await page.reload()
  await ready(page)
}

/** Planın karar, revizyon ve bütçe bilgisi. Görünüm bunlardan hiçbirini değiştirmemeli. */
async function planOku(page: Page) {
  return page.evaluate(([key, id]) => {
    const plan = JSON.parse(localStorage.getItem(key) ?? '{}').state?.plans?.[id]
    if (!plan) return null
    const steps = Object.fromEntries(Object.entries(plan.steps ?? {}).map(([k, v]) => [k, { stale: (v as { stale?: boolean }).stale ?? false, revision: (v as { revision?: number }).revision, status: (v as { status?: string }).status }]))
    return { revision: plan.revision, updatedAt: plan.updatedAt, steps, limits: plan.limits, decisions: JSON.stringify(plan.decisions ?? []), revisions: plan.revisions?.length, butce: JSON.stringify(plan.steps?.U33?.values ?? null) }
  }, [PLAN_KEY, DEMO_ID] as const)
}

async function tasmaYok(page: Page, label: string) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  expect(r.sw, `Sayfa yatay taşmamalı: ${label}`).toBeLessThanOrEqual(r.iw + 1)
}

async function olcuDenetle(page: Page, label: string) {
  await tasmaYok(page, label)
  const sorun = await page.locator('main').evaluate((main) => {
    const out: string[] = []
    const sel = 'a[href], button, .ant-checkbox-wrapper'
    for (const e of main.querySelectorAll(sel)) {
      if (!e.getClientRects().length) continue
      const b = e.getBoundingClientRect()
      if (b.width < 44 || b.height < 44) out.push(`hedef ${Math.round(b.width)}x${Math.round(b.height)}: ${(e.textContent ?? '').trim().slice(0, 30)}`)
    }
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement
      if (!el || !n.textContent?.trim() || !el.getClientRects().length) continue
      const size = parseFloat(getComputedStyle(el).fontSize)
      if (size < 14) out.push(`${size}px: ${n.textContent.trim().slice(0, 30)}`)
    }
    return out
  })
  expect(sorun, label).toEqual([])
}

async function basvuruEkle(page: Page, programId: string) {
  const main = page.getByRole('main')
  await page.goto(`/#/destek/${programId}`)
  await ready(page)
  await main.getByRole('button', { name: 'Başvuru listeme ekle' }).click()
  await main.getByRole('button', { name: 'Evet', exact: true }).click()
  await expect(main.getByText('Program başvuru listenize eklendi.')).toBeVisible()
}

test('finansman görünümü planı plan olmadan açılmaz', async ({ page }) => {
  await page.goto('/#/destek/finansman')
  await expect(page).not.toHaveURL(/#\/destek\/finansman$/)
})

test('kaynaklar çubukta ve tabloda görünür, destek ayrı durur, uyarı çıkar ve plan değişmez', async ({ page, hasTouch }, info) => {
  await openDemo(page, hasTouch)
  await kaynakYaz(page)
  const once = await planOku(page)
  expect(once?.butce).toContain('Tezgâh ve raf')
  await basvuruEkle(page, 'bigg1812')
  await basvuruEkle(page, 'kosgebGirisimciA')
  expect(await planOku(page)).toEqual(once)

  await page.goto('/#/destek/finansman')
  await ready(page)
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Finansman görünümü')

  // Çubuk ve tablo aynı satırları ve kişinin yazdığı tutarları gösterir.
  const cubuklar = main.locator('.dt-finansman-cubuk-satir')
  await expect(cubuklar).toHaveCount(3)
  await expect(cubuklar.locator('.dt-finansman-tutar')).toHaveText(['45.000,00 TL', '120.000,00 TL', 'Bilinmiyor'])
  await expect(cubuklar.nth(2).locator('.dt-finansman-cubuk-dolu')).toHaveCount(0)
  const genislik = await cubuklar.locator('.dt-finansman-cubuk-dolu').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width / e.parentElement!.getBoundingClientRect().width))
  expect(genislik[1]).toBeCloseTo(1, 2)
  expect(genislik[0]).toBeCloseTo(0.375, 2)
  const tablo = main.getByRole('table', { name: 'Kaynak tablosu' })
  await expect(tablo.locator('tbody tr')).toHaveCount(3)
  await expect(tablo.locator('tbody td')).toHaveText(['45.000,00 TL', '120.000,00 TL', 'Bilinmiyor'])
  // Uygulama toplam almaz. 165.000 TL ekranda hiç yazmaz.
  await expect(main).not.toContainText('165.000')

  // Plan sınırları kişinin yazdığı gibi okunur.
  const sinirlar = main.locator('.dt-finansman-sinirlar dd')
  await expect(sinirlar).toHaveText(['150.000,00 TL', '240.000,00 TL', '30.000,00 TL'])

  // Beklenen destekler ayrı kutuda durur ve tutar taşımaz.
  const beklenen = main.locator('section.dt-finansman-beklenen')
  await expect(beklenen.getByRole('heading', { level: 2 })).toHaveText('Beklenen, kesin değil')
  await expect(beklenen.locator('.dt-finansman-beklenen-liste li')).toHaveCount(2)
  await expect(beklenen).not.toContainText('TL')
  await expect(main.locator('.dt-finansman-cubuklar')).not.toContainText('BiGG')

  // Aynı gidere iki başvuru bağlanınca yumuşak uyarı çıkar.
  const makine = main.locator('fieldset.dt-finansman-bag', { hasText: 'Espresso makinesi' })
  const kutular = makine.locator('.ant-checkbox-wrapper')
  await expect(kutular).toHaveCount(2)
  await kutular.nth(0).click()
  await expect(main.locator('.dt-finansman-durum')).toContainText('başvurusuna bağlandı.')
  await expect(makine.getByText(UYARI)).toHaveCount(0)
  await kutular.nth(1).click()
  await expect(makine.getByText(UYARI)).toBeVisible()
  await expect(main.getByText(UYARI)).toHaveCount(1)
  await olcuDenetle(page, '/destek/finansman')
  if (KANIT) {
    await mkdir(KANIT, { recursive: true })
    await page.screenshot({ path: `${KANIT}/finansman-${info.project.name}.png`, fullPage: true })
  }

  // Bağ yenilemede kalır. Plan, kararlar, revizyon ve bütçe değişmez.
  await page.reload()
  await ready(page)
  await expect(kutular.nth(0).locator('input')).toBeChecked()
  await expect(kutular.nth(1).locator('input')).toBeChecked()
  await expect(makine.getByText(UYARI)).toBeVisible()
  expect(await planOku(page)).toEqual(once)

  // Bir bağ kalkınca uyarı da kalkar.
  await kutular.nth(1).click()
  await expect(makine.getByText(UYARI)).toHaveCount(0)
  await expect(main.locator('.dt-finansman-durum')).toContainText('bağı kaldırıldı.')
  expect(await planOku(page)).toEqual(once)
})

test('kaynak yazılmayan planda ekran nedenini söyler ve taşmaz', async ({ page, hasTouch }) => {
  await openDemo(page, hasTouch)
  await page.goto('/#/destek/finansman')
  await ready(page)
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { name: 'Henüz kaynak yazılmadı' })).toBeVisible()
  await expect(main.locator('section.dt-finansman-beklenen')).toContainText('Beklenen destek yok.')
  await olcuDenetle(page, 'boş finansman')
})

test('tablo kutusu ve bağ kutuları klavyeyle çalışır, odakta halka yoktur', async ({ page, hasTouch, browserName }, info) => {
  const audit: Audit = { findings: [], samples: [], dialogName: 'not_run' }
  await openDemo(page, hasTouch)
  await kaynakYaz(page)
  await basvuruEkle(page, 'bigg1812')
  await page.goto('/#/destek/finansman')
  await ready(page)
  await installProbe(page)
  const main = page.getByRole('main')
  const tus = `${browserName === 'webkit' ? 'Alt+' : ''}Tab`
  // Görünür odak modunu yalnız Tab açar.
  await page.keyboard.press(tus)
  await expect(page.locator('html')).toHaveAttribute('data-focus-mode', 'keyboard')

  const kutu = main.getByRole('region', { name: 'Kaynak tablosu' })
  await kutu.focus()
  await expect(kutu).toBeFocused()
  await auditFocus(page, info, audit, 'Kaynak tablosu kutusu')

  const ilk = main.locator('fieldset.dt-finansman-bag').first().getByRole('checkbox')
  await ilk.focus()
  await auditFocus(page, info, audit, 'İlk bağ kutusu')
  await page.keyboard.press('Space')
  await expect(ilk).toBeChecked()
  await expect(main.locator('.dt-finansman-durum')).toContainText('başvurusuna bağlandı.')
  await expect(ilk).toBeFocused()
  expect(audit.findings).toEqual([])
})

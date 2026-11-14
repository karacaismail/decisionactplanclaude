import { expect, test, type Page } from '@playwright/test'

/**
 * Süreç sırası tek bir kuraldan gelir. Kural docs/surec-haritasi.md dosyasındadır.
 * Sıra: temel (Karar 1-5), geçiş kapısı, strateji çalışması (Adım 19-20), uygulama (Karar 6-8).
 * Bu dosya kilitlerin, panonun ve yol dizininin aynı sırayı gösterdiğini sınar.
 */

const STORAGE_KEY = 'decisionactplan-v1'

async function openDemo(page: Page) {
  await page.goto('/')
  /* Yük altında ilk tıklama kaçabilir. Yardımcı, adres değişene kadar yeniden dener. */
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Örnek planı aç').first().click({ timeout: 2000 })
    await expect(page).toHaveURL(/#\/ozet/, { timeout: 2000 })
  }).toPass()
}

/** Kayıtlı planı yerinde değiştirir ve sayfayı yeniden yükler. */
async function patchPlan(page: Page, patch: string) {
  await page.evaluate(
    ([key, body]) => {
      const raw = JSON.parse(localStorage.getItem(key) ?? '{}')
      const plan = raw.state.plans[raw.state.currentId]
      new Function('plan', body)(plan)
      localStorage.setItem(key, JSON.stringify(raw))
    },
    [STORAGE_KEY, patch],
  )
  await page.reload()
}

const TRANSITION = `plan.transitions = [{ id: 'gecis-deneme', outcome: 'hazir', suggested: 'hazir', reason: 'Dayanaklar incelendi.', decidedBy: 'Kurucu', decidedAt: new Date().toISOString(), reviewed: true, mandatoryMet: 9, mandatoryTotal: 9, supportingMet: 5, supportingTotal: 7, level: 5, revision: plan.revision }]`
const STRATEGY_DONE = `
  plan.steps['19'] = { values: { chosenPath: 'Durakta satış', choiceReason: 'En güçlü kanıt burada.', givenUp: 'Öğle satışı' }, status: 'tamam', updatedAt: new Date().toISOString() }
  plan.steps['20'] = { values: { qualityCheck: ['a', 'b', 'c', 'd', 'e'] }, status: 'tamam', updatedAt: new Date().toISOString() }`
const STRATEGY_HALF = `
  plan.steps['19'] = { values: { chosenPath: '', choiceReason: '', givenUp: '' }, status: 'tamam', updatedAt: new Date().toISOString() }
  plan.steps['20'] = { values: { qualityCheck: ['a', 'b', 'c', 'd', 'e'] }, status: 'tamam', updatedAt: new Date().toISOString() }`

const lock = (page: Page) => page.getByRole('alert').filter({ hasText: 'Bu karar kilitli' })

async function noHorizontalOverflow(page: Page, label: string) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  expect(r.sw, `Sayfa yatay taşmamalı: ${label}`).toBeLessThanOrEqual(r.iw + 1)
}

test('geçiş kararı yokken Karar 6 ve Karar 7 geçiş kapısını bekler', async ({ page }) => {
  await openDemo(page)
  for (const n of [6, 7]) {
    await page.goto(`/#/karar/${n}`)
    await expect(lock(page)).toContainText('Geçiş kapısında "Planlamaya hazır" ya da "Koşullu hazır" kararı yok.')
    await expect(page.getByRole('button', { name: 'Geçiş kapısına git' })).toBeVisible()
    await noHorizontalOverflow(page, `karar ${n} kilitli`)
  }
  await page.getByRole('button', { name: 'Geçiş kapısına git' }).click()
  await expect(page).toHaveURL(/#\/gecis/)
})

test('geçiş kararından sonra Karar 6 strateji çalışmasını bekler', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, TRANSITION)
  // Pano sıradaki işi strateji çalışması olarak gösterir.
  await expect(page.getByRole('button', { name: 'Strateji çalışmasını aç' })).toBeVisible()
  await page.goto('/#/karar/6')
  await expect(lock(page)).toContainText('Strateji çalışması bitmedi. Adım 19 ve Adım 20 tamamlanmalı.')
  await expect(lock(page).getByRole('link', { name: 'Strateji çalışmasını açın.' })).toBeVisible()
  await noHorizontalOverflow(page, 'karar 6 strateji bekliyor')
  await page.getByRole('button', { name: 'Strateji çalışmasına git' }).click()
  await expect(page).toHaveURL(/#\/strateji/)
  await expect(page.getByText('Strateji çalışması tamam', { exact: true })).toHaveCount(0)
})

test('adımlar tamam görünse de seçim boşsa strateji çalışması bitmiş sayılmaz', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `${TRANSITION}\n${STRATEGY_HALF}`)
  await page.goto('/#/strateji')
  await expect(page.getByRole('alert').filter({ hasText: 'Strateji çalışması henüz bitmedi' })).toContainText('Yol seçildi. Gerekçe ve vazgeçilenler yazıldı.')
  await expect(page.getByText('Strateji çalışması tamam', { exact: true })).toHaveCount(0)
  await noHorizontalOverflow(page, 'strateji yarım')
  await page.goto('/#/karar/6')
  await expect(lock(page)).toContainText('Strateji çalışması bitmedi.')
})

test('strateji çalışması bitince Karar 6 açılır, Karar 7 Kapı 6\'yı bekler', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `${TRANSITION}\n${STRATEGY_DONE}`)
  await page.goto('/#/strateji')
  await expect(page.getByText('Strateji çalışması tamam', { exact: true })).toBeVisible()
  if ((page.viewportSize()?.width ?? 0) >= 1200) {
    await expect(page.locator('.journey-rail a[aria-label="Strateji çalışması, Tamam"]')).toHaveCount(1)
  }
  await page.getByRole('button', { name: 'Uygulama aşamasına geç' }).click()
  await expect(page).toHaveURL(/#\/karar\/6/)
  await expect(lock(page)).toHaveCount(0)
  await page.goto('/#/karar/7')
  await expect(lock(page)).toContainText('Kapı 6 henüz geçilmedi.')
  await expect(page.getByRole('button', { name: 'Önceki kapıya git' })).toBeVisible()
  // Pano sıradaki işi Karar 6 olarak gösterir.
  await page.goto('/#/ozet')
  await expect(page.locator('.hero')).toContainText('Karar 6')
})

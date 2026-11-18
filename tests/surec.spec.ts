import { expect, test, type Page } from '@playwright/test'

/**
 * Süreç sırası tek bir kuraldan gelir. Kural docs/surec-haritasi.md dosyasındadır.
 * Sıra: temel (Karar 1-5), hazırlık kontrolü, strateji oluşturma (2.1-2.5 ve strateji belgesi), strateji uygulama (Karar 6-8).
 * Bu dosya kilitlerin, panonun ve yol dizininin aynı sırayı gösterdiğini sınar.
 */

const STORAGE_KEY = 'decisionactplan-v1'

async function openDemo(page: Page) {
  await page.goto('/')
  /* Yük altında ilk tıklama kaçabilir. Yardımcı, adres değişene kadar yeniden dener. */
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Kafe örneğini aç').first().click({ timeout: 2000 })
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
const STRATEGY_BASE = `
  const done = (values) => ({ values, status: 'tamam', updatedAt: new Date().toISOString() })
  plan.steps['S21'] = done({ diagnosis: 'Öğleden sonra dükkân boş kalıyor.', diagnosisWhy: 'Satışın çoğu sabah geliyor.' })
  plan.steps['S22'] = done({ options: [{ _id: 'o1', name: 'Durakta satış' }, { _id: 'o2', name: 'Öğle menüsü' }] })
  plan.steps['S23'] = done({ tests: [{ _id: 't1', option: 'Durakta satış', mustBeTrue: 'Yolcu durur.', weakest: 'Yolcu beklemez.' }, { _id: 't2', option: 'Öğle menüsü', mustBeTrue: 'Çalışan öğlen çıkar.', weakest: 'Fiyat yüksek kalır.' }] })
  plan.steps['S25'] = done({ moves: [{ _id: 'm1', move: 'Durağa tezgâh kur', capability: 'Hızlı servis' }] })
  plan.steps['20'] = done({ dossier1: 'Profil', dossier2: 'Problem', dossier3: 'Talep', dossier4: 'Yol', dossier5: 'Para', dossier6: 'Varsayım', dossier7: 'Risk', dossier8: 'Durdurma', dossier9: 'Teşhis', dossier11: 'İlk teslim', counterView: 'Yolcu durmayabilir.', qualityCheck: ['q1', 'q2', 'q3', 'q4', 'q5'], approvedBy: 'Kurucu' })`
const STRATEGY_DONE = `${STRATEGY_BASE}
  plan.steps['19'] = done({ chosenPath: 'Durakta satış', choiceReason: 'En güçlü kanıt burada.', givenUp: 'Öğle satışı' })`
const STRATEGY_HALF = `${STRATEGY_BASE}
  plan.steps['19'] = done({ chosenPath: '', choiceReason: '', givenUp: '' })`

const lock = (page: Page) => page.getByRole('alert').filter({ hasText: 'Bu karar kilitli' })

async function noHorizontalOverflow(page: Page, label: string) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  expect(r.sw, `Sayfa yatay taşmamalı: ${label}`).toBeLessThanOrEqual(r.iw + 1)
}

test('hazırlık kararı yokken Karar 6 ve Karar 7 hazırlık kontrolünü bekler', async ({ page }) => {
  await openDemo(page)
  for (const n of [6, 7]) {
    await page.goto(`/#/karar/${n}`)
    await expect(lock(page)).toContainText('Hazırlık kontrolünde "Planlamaya hazır" ya da "Koşullu hazır" kararı yok.')
    await expect(page.getByRole('button', { name: 'Hazırlık kontrolüne git' })).toBeVisible()
    await noHorizontalOverflow(page, `karar ${n} kilitli`)
  }
  await page.getByRole('button', { name: 'Hazırlık kontrolüne git' }).click()
  await expect(page).toHaveURL(/#\/gecis/)
})

test('hazırlık kararından sonra Karar 6 strateji oluşturmayı bekler', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, TRANSITION)
  // Pano sıradaki işi strateji oluşturma olarak gösterir.
  await expect(page.getByRole('button', { name: 'Strateji oluşturmayı aç' })).toBeVisible()
  await page.goto('/#/karar/6')
  await expect(lock(page)).toContainText('Strateji oluşturma bitmedi. Beş alt aşama tamamlanmalı ve karar sahibi strateji belgesini onaylamalı.')
  await expect(lock(page).getByRole('link', { name: 'Strateji oluşturmayı açın.' })).toBeVisible()
  await noHorizontalOverflow(page, 'karar 6 strateji bekliyor')
  await page.getByRole('button', { name: 'Strateji oluşturmaya git' }).click()
  await expect(page).toHaveURL(/#\/strateji/)
  await expect(page.getByText('Strateji oluşturma tamam', { exact: true })).toHaveCount(0)
})

test('adımlar tamam görünse de seçim boşsa strateji oluşturma bitmiş sayılmaz', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `${TRANSITION}\n${STRATEGY_HALF}`)
  await page.goto('/#/strateji')
  await expect(page.getByRole('alert').filter({ hasText: 'Strateji oluşturma henüz bitmedi' })).toContainText('Yol seçildi. Gerekçe ve vazgeçilenler yazıldı.')
  await expect(page.getByText('Strateji oluşturma tamam', { exact: true })).toHaveCount(0)
  await noHorizontalOverflow(page, 'strateji yarım')
  await page.goto('/#/karar/6')
  await expect(lock(page)).toContainText('Strateji oluşturma bitmedi.')
})

test('strateji oluşturma bitince Karar 6 açılır, Karar 7 Kontrol 6\'yı bekler', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `${TRANSITION}\n${STRATEGY_DONE}`)
  await page.goto('/#/strateji')
  await expect(page.getByText('Strateji oluşturma tamam', { exact: true })).toBeVisible()
  if ((page.viewportSize()?.width ?? 0) >= 1200) {
    // Yeni sayfa etiketi süresince ad ", yeni" ile biter. Durum kısmı yine tam eşleşir.
    await expect(page.locator('.journey-rail').getByRole('link', { name: /^Strateji oluşturma, Tamam(?:, yeni)?$/ })).toHaveCount(1)
  }
  await page.getByRole('button', { name: 'Strateji uygulamaya geç' }).click()
  await expect(page).toHaveURL(/#\/uygulama/)
  await page.goto('/#/karar/6')
  await expect(lock(page)).toHaveCount(0)
  await page.goto('/#/karar/7')
  await expect(lock(page)).toContainText('Kontrol 6 henüz geçilmedi.')
  await expect(page.getByRole('button', { name: 'Önceki kontrole git' })).toBeVisible()
  // Pano sıradaki işi Karar 6 olarak gösterir.
  await page.goto('/#/ozet')
  await expect(page.locator('.hero')).toContainText('Karar 6')
})

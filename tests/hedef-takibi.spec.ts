import { expect, test, type Page } from '@playwright/test'

/**
 * Hedef takibi. İsteğe bağlı katmandır. İngilizce adı OKR'dir.
 * Kurallar docs/okr-arastirma-raporu.md dosyasının 6. ve 9. bölümlerindedir.
 * Anahtar kapalıyken ekran bugünkü gibi kalır. Anahtar karar sürümünü ve kontrolleri değiştirmez.
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

async function patchPlan(page: Page, patch: string) {
  await page.evaluate(
    ([key, body]) => {
      const raw = JSON.parse(localStorage.getItem(key) ?? '{}')
      new Function('plan', body)(raw.state.plans[raw.state.currentId])
      localStorage.setItem(key, JSON.stringify(raw))
    },
    [STORAGE_KEY, patch],
  )
  await page.reload()
}

const stored = (page: Page, pick: string) =>
  page.evaluate(([key, body]) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? '{}')
    return new Function('plan', `return ${body}`)(raw.state.plans[raw.state.currentId])
  }, [STORAGE_KEY, pick])

const UNLOCK = `
  plan.transitions = [{ id: 'gecis-deneme', outcome: 'hazir', suggested: 'hazir', reason: 'Dayanaklar incelendi.', decidedBy: 'Kurucu', decidedAt: new Date().toISOString(), reviewed: true, mandatoryMet: 9, mandatoryTotal: 9, supportingMet: 5, supportingTotal: 7, level: 3, revision: plan.revision }]
  const done = (values) => ({ values, status: 'tamam', updatedAt: new Date().toISOString() })
  plan.steps['S21'] = done({ diagnosis: 'Öğleden sonra dükkân boş kalıyor.', diagnosisWhy: 'Satışın çoğu sabah geliyor.' })
  plan.steps['S22'] = done({ options: [{ _id: 'o1', name: 'Durakta satış', source: 'hazirlik' }, { _id: 'o2', name: 'Öğle menüsü', source: 'yeni' }] })
  plan.steps['S23'] = done({ tests: [{ _id: 't1', option: 'Durakta satış', mustBeTrue: 'Yolcu durur.', weakest: 'Yolcu beklemez.', result: 'destek' }, { _id: 't2', option: 'Öğle menüsü', mustBeTrue: 'Çalışan öğlen çıkar.', weakest: 'Fiyat yüksek kalır.', result: 'karsi' }] })
  plan.steps['19'] = done({ chosenPath: 'Durakta satış', choiceReason: 'En güçlü kanıt burada.', winningAim: 'Sabah kahvesinde ilk tercih olmak.', playField: 'Durak çevresi.', givenUp: 'Öğle satışı' })
  plan.steps['S25'] = done({ moves: [{ _id: 'm1', move: 'Durağa tezgâh kur', serves: 'Yolcuya ulaşır.', capability: 'Hızlı servis', have: 'kurulacak' }] })
  plan.steps['20'] = done({ dossier1: 'Profil', dossier2: 'Problem', dossier3: 'Talep', dossier4: 'Yol', dossier5: 'Para', dossier6: 'Varsayım', dossier7: 'Risk', dossier8: 'Durdurma', dossier9: 'Teşhis', dossier11: 'İlk teslim', counterView: 'Yolcu durmayabilir.', qualityCheck: ['q1', 'q2', 'q3', 'q4', 'q5'], approvedBy: 'Kurucu' })
  plan.steps['U32'] = done({ now: [{ _id: 'is1', action: 'Tezgâhı kur', owner: 'Kurucu', dueDate: '2027-01-10' }] })`

/** Taşma yok, küçük yazı yok, renkli uyarı kutusu yok, kart içinde kart yok, en çok bir dolu düğme. */
async function designRules(page: Page, label: string) {
  const r = await page.evaluate(() => {
    const visible = (e: Element) => (e as HTMLElement).offsetParent !== null && getComputedStyle(e).visibility !== 'hidden'
    const small = [...document.querySelectorAll('main *')]
      .filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()))
      .filter((e) => visible(e) && Number.parseFloat(getComputedStyle(e).fontSize) < 14)
      .map((e) => `${e.tagName}.${(e as HTMLElement).className} ${getComputedStyle(e).fontSize}`)
    const filled = [...document.querySelectorAll('main .ant-btn-primary:not(.ant-btn-text):not(.ant-btn-link), main .hero-button')].filter(visible).length
    return { sw: document.documentElement.scrollWidth, iw: window.innerWidth, small, filled, nested: document.querySelectorAll('.ant-card .ant-card').length, alerts: document.querySelectorAll('.ant-alert').length }
  })
  expect(r.sw, `${label}: sayfa yatay taşmamalı`).toBeLessThanOrEqual(r.iw + 1)
  expect(r.small, `${label}: yazı en az 14 piksel olmalı`).toEqual([])
  expect(r.filled, `${label}: en çok bir dolu düğme`).toBeLessThanOrEqual(1)
  expect(r.nested, `${label}: kart içinde kart olmamalı`).toBe(0)
  expect(r.alerts, `${label}: renkli uyarı kutusu olmamalı`).toBe(0)
}

const card = (page: Page) => page.locator('.okr-switch-card')
const toggle = (page: Page) => page.getByRole('switch', { name: 'Hedef takibini aç' })
const panel = (page: Page) => page.getByRole('region', { name: 'Hedef takibi kayıtları' })

test('strateji uygulama kilitliyken hedef takibi kartı görünmez', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/uygulama')
  await expect(page.getByRole('heading', { name: 'Beş zorunlu alt aşama' })).toBeVisible()
  await expect(card(page)).toHaveCount(0)
  await expect(toggle(page)).toHaveCount(0)
})

test('anahtar kapalıyken kart açıklamayı gösterir, panel çizilmez', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, UNLOCK)
  await page.goto('/#/uygulama')
  await expect(card(page)).toBeVisible()
  /* Kart "Beş zorunlu alt aşama" kartından hemen sonra gelir. */
  const order = await page.locator('.strateji-main > *').evaluateAll((els) => els.map((e) => e.querySelector('.card-heading')?.textContent ?? ''))
  expect(order.indexOf('Hedef takibi')).toBe(order.indexOf('Beş zorunlu alt aşama') + 1)
  await expect(toggle(page)).not.toBeChecked()
  await expect(card(page)).toContainText('Her 3 ayda bir hedef koyarsınız. Her hafta göstergelerin sayısını yazarsınız. Bu yöntemin İngilizce adı OKR\'dir. İsteğe bağlıdır.')
  await expect(card(page)).toContainText('OKR olmadan da strateji tamamdır.')
  await expect(card(page)).toContainText('Hedefler maaşa bağlanmaz.')
  await expect(card(page)).toContainText('Plan dosyasını indirince hedef takibi kayıtları da dosyaya girer.')
  await expect(panel(page)).toHaveCount(0)
  /* "OKR" kelimesi yalnız kartın açıklamasında geçer. */
  const okrOutside = await page.locator('main').evaluate((main) => {
    const clone = main.cloneNode(true) as HTMLElement
    clone.querySelector('.okr-switch-help')?.remove()
    return /OKR/.test(clone.textContent ?? '')
  })
  expect(okrOutside).toBe(false)
  await designRules(page, 'anahtar kapalı')
})

test('anahtar açılınca panel gelir, kapanınca kayıt silinmez, sürüm ve kontroller değişmez', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, UNLOCK)
  await page.goto('/#/uygulama')
  const before = await stored(page, 'JSON.stringify({ revision: plan.revision, decisions: plan.decisions, changes: plan.changes, transitions: plan.transitions, profile: plan.profile, limits: plan.limits })')
  await toggle(page).click()
  await expect(toggle(page)).toBeChecked()
  await expect(panel(page)).toBeVisible()
  await expect(panel(page)).toContainText('Bu dönem')
  expect(await stored(page, 'plan.okr.enabled')).toBe(true)
  expect(await stored(page, 'plan.okr.periods.length')).toBe(1)

  /* Hamleden hedef önerisi. Yazılım hedefi kendisi yazmaz, düğmeyle yazılır. */
  await expect(panel(page).getByText('Durağa tezgâh kur').first()).toBeVisible()
  await panel(page).getByRole('button', { name: 'Bu hamleden hedef yaz: Durağa tezgâh kur' }).click()
  await expect(panel(page).getByLabel('Hedef 1')).toHaveValue('Durağa tezgâh kur')
  await expect(panel(page).getByRole('button', { name: 'Bu hamleden hedef yaz: Durağa tezgâh kur' })).toHaveCount(0)

  expect(await stored(page, 'JSON.stringify({ revision: plan.revision, decisions: plan.decisions, changes: plan.changes, transitions: plan.transitions, profile: plan.profile, limits: plan.limits })')).toBe(before)

  await toggle(page).click()
  await expect(toggle(page)).not.toBeChecked()
  await expect(panel(page)).toHaveCount(0)
  expect(await stored(page, 'plan.okr.periods[0].objectives[0].title')).toBe('Durağa tezgâh kur')
  await toggle(page).click()
  await expect(panel(page).getByLabel('Hedef 1')).toHaveValue('Durağa tezgâh kur')
  expect(await stored(page, 'plan.revision')).toBe(JSON.parse(before).revision)
})

test('gösterge, haftalık durum, puan ve uyarılar', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, UNLOCK)
  await page.goto('/#/uygulama')
  await toggle(page).click()
  const p = panel(page)
  await p.getByRole('button', { name: 'Hedef ekle' }).click()
  await p.getByLabel('Hedef 1').fill('Aylık kartla düzenli müşteri kazanmak')
  await p.getByRole('radio', { name: /Zorlu hedef/ }).check()
  await p.getByRole('button', { name: 'Gösterge ekle' }).click()
  await p.getByLabel('Gösterge 1', { exact: true }).fill('Ödenen aylık kart sayısı')
  await p.getByLabel('Gösterge 1 başlangıç değeri').fill('7')
  await p.getByLabel('Gösterge 1 varılacak sayı').fill('30')
  await expect(p.getByText('Puan henüz hesaplanmadı.').first()).toBeVisible()

  /* İş gibi yazılan gösterge uyarı alır. */
  await p.getByRole('button', { name: 'Gösterge ekle' }).click()
  await p.getByLabel('Gösterge 2', { exact: true }).fill('Yeni site kurmak')
  await expect(p.getByText('Bu bir iş gibi görünüyor.')).toBeVisible()

  /* Dördüncü göstergede yumuşak uyarı çıkar, beşinciden sonra ekleme kapanır. */
  await expect(p.getByText('Üçten çok gösterge takibi zorlaştırır.')).toHaveCount(0)
  await p.getByRole('button', { name: 'Gösterge ekle' }).click()
  await p.getByRole('button', { name: 'Gösterge ekle' }).click()
  await expect(p.getByText('Üçten çok gösterge takibi zorlaştırır.')).toBeVisible()
  await p.getByRole('button', { name: 'Gösterge ekle' }).click()
  await expect(p.getByRole('button', { name: 'Gösterge ekle' })).toBeDisabled()
  expect(await stored(page, 'plan.okr.periods[0].objectives[0].indicators.length')).toBe(5)
  /* Silme onay ister. Vazgeçince gösterge kalır. */
  await p.getByRole('button', { name: 'Gösterge 5 sil' }).click()
  await page.getByRole('button', { name: 'Vazgeç' }).click()
  expect(await stored(page, 'plan.okr.periods[0].objectives[0].indicators.length')).toBe(5)
  for (const n of [5, 4, 3, 2]) {
    await p.getByRole('button', { name: `Gösterge ${n} sil` }).click()
    await page.getByRole('tooltip').getByRole('button', { name: 'Sil', exact: true }).click()
    await expect(p.getByRole('button', { name: `Gösterge ${n} sil` })).toHaveCount(0)
  }
  await expect(p.getByText('Üçten çok gösterge takibi zorlaştırır.')).toHaveCount(0)

  /* Haftalık durum: bugünkü sayı, tahmin ve isteğe bağlı not. */
  const week = page.getByRole('group', { name: 'Haftalık durum: Ödenen aylık kart sayısı' })
  await week.getByLabel('Bugünkü sayı').fill('14')
  await week.getByRole('radio', { name: 'Belki' }).check()
  await week.getByLabel('Engel ne? İsteğe bağlı.').fill('Yağmurlu günlerde az kişi geldi.')
  await p.getByRole('button', { name: 'Haftalık durumu kaydet' }).click()
  await expect(p.getByText('Yüzde 30 ilerledi.').first()).toBeVisible()
  await expect(p.getByText('Zorlu hedefte yüzde 70 iyi bir sonuçtur.').first()).toBeVisible()
  expect(await stored(page, 'plan.okr.periods[0].objectives[0].indicators[0].checkIns[0].value')).toBe(14)
  expect(await stored(page, 'plan.okr.periods[0].objectives[0].indicators[0].checkIns[0].confidence')).toBe('belki')

  /* İş bağlantısı: 3.2'deki iş bir göstergeye bağlanır. */
  const link = page.getByRole('group', { name: 'İş: Tezgâhı kur' })
  await link.getByRole('radio', { name: 'Ödenen aylık kart sayısı' }).check()
  expect(await stored(page, "plan.okr.periods[0].taskLinks['is1'] === plan.okr.periods[0].objectives[0].indicators[0].id")).toBe(true)
  await designRules(page, 'hedef takibi açık')
})

test('son 2 haftada sayı yazılmayan gösterge işaret alır', async ({ page }) => {
  await openDemo(page)
  await patchPlan(
    page,
    `${UNLOCK}
     const start = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
     plan.okr = { enabled: true, changedAt: new Date().toISOString(), periods: [{ id: 'd1', startsAt: start, endsAt: '2099-01-01', objectives: [{ id: 'h1', title: 'Hedef', indicators: [{ id: 'g1', name: 'Ödenen aylık kart sayısı', baseline: 7, target: 30, checkIns: [] }] }] }] }`,
  )
  await page.goto('/#/uygulama')
  await expect(panel(page).getByText('Son 2 haftada sayı yazılmadı.')).toBeVisible()
})

test('dönem kapanışı sonucu gösterir, öğrenileni sorar, kararı karar sahibine bırakır', async ({ page }) => {
  await openDemo(page)
  await patchPlan(
    page,
    `${UNLOCK}
     plan.okr = { enabled: true, changedAt: new Date().toISOString(), periods: [{ id: 'd1', startsAt: '2026-11-01', endsAt: '2099-01-01', objectives: [{ id: 'h1', title: 'Aylık kartla düzenli müşteri kazanmak', indicators: [{ id: 'g1', name: 'Ödenen aylık kart sayısı', baseline: 7, target: 30, checkIns: [{ at: new Date().toISOString(), value: 14, confidence: 'belki' }] }] }] }] }`,
  )
  await page.goto('/#/uygulama')
  const p = panel(page)
  await p.getByRole('button', { name: 'Dönemi kapat' }).click()
  const close = page.getByRole('group', { name: 'Dönem sonu' })
  await expect(close).toContainText('Aylık kartla düzenli müşteri kazanmak: yüzde 30 ilerledi.')
  await close.getByRole('button', { name: 'Kapat ve kaydet' }).click()
  await expect(close).toContainText('"Bu dönemde ne öğrendiniz?" sorusunu cevaplayın.')
  await close.getByLabel('Bu dönemde ne öğrendiniz?').fill('Kart satışı yağmurlu günde düşüyor.')
  await close.getByRole('button', { name: 'Kapat ve kaydet' }).click()
  await expect(p.getByText('Dönem kapandı.')).toBeVisible()
  expect(await stored(page, 'plan.okr.periods[0].learned')).toBe('Kart satışı yağmurlu günde düşüyor.')
  /* Yazılım karar vermez. Karar sahibi 3.5'te karar verir. */
  expect(await stored(page, '(plan.strategyReviews ?? []).length')).toBe(0)
  await p.getByRole('button', { name: 'Puan özetini dayanak alanına yaz' }).click()
  await expect(page.locator('#yenileme-kanit')).toHaveValue('Aylık kartla düzenli müşteri kazanmak: yüzde 30 ilerledi.')
  await expect(page).toHaveURL(/#\/uygulama#yenileme|#yenileme/)
  await p.getByRole('button', { name: 'Yeni dönem başlat' }).click()
  expect(await stored(page, 'plan.okr.periods.length')).toBe(2)
  await expect(p.getByText('Bu dönem')).toBeVisible()
})

test('anahtar klavyeyle açılır', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, UNLOCK)
  await page.goto('/#/uygulama')
  await toggle(page).focus()
  await page.keyboard.press('Space')
  await expect(toggle(page)).toBeChecked()
  await expect(panel(page)).toBeVisible()
})

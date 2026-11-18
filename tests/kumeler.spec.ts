import { expect, test, type Page } from '@playwright/test'

/**
 * Üç ana küme ve zorunlu alt aşamalar.
 * Kural docs/sonraki-ana-asamalar-plani.md ve docs/surec-haritasi.md dosyalarındadır.
 * Kümeler: strateji öncesi hazırlık, strateji oluşturma (2.1-2.5), strateji uygulama (3.1-3.5).
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
  page.evaluate(([key, body]) => new Function('plan', `return ${body}`)(JSON.parse(localStorage.getItem(key) ?? '{}').state.plans[JSON.parse(localStorage.getItem(key) ?? '{}').state.currentId]), [STORAGE_KEY, pick])

async function designRules(page: Page, scope: string, label: string) {
  const r = await page.evaluate((sel) => {
    const small = [...document.querySelectorAll(`${sel} *`)]
      .filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()))
      .filter((e) => (e as HTMLElement).offsetParent !== null && Number.parseFloat(getComputedStyle(e).fontSize) < 14)
      .map((e) => `${e.tagName}.${(e as HTMLElement).className} ${getComputedStyle(e).fontSize}`)
    return { sw: document.documentElement.scrollWidth, iw: window.innerWidth, small }
  }, scope)
  expect(r.sw, `Sayfa yatay taşmamalı: ${label}`).toBeLessThanOrEqual(r.iw + 1)
  expect(r.small, `Yazı en az 14 piksel olmalı: ${label}`).toEqual([])
}

const TRANSITION = `plan.transitions = [{ id: 'gecis-deneme', outcome: 'hazir', suggested: 'hazir', reason: 'Dayanaklar incelendi.', decidedBy: 'Kurucu', decidedAt: new Date().toISOString(), reviewed: true, mandatoryMet: 9, mandatoryTotal: 9, supportingMet: 5, supportingTotal: 7, level: 3, revision: plan.revision }]`
const STRATEGY_DONE = `
  const done = (values) => ({ values, status: 'tamam', updatedAt: new Date().toISOString() })
  plan.steps['S21'] = done({ diagnosis: 'Öğleden sonra dükkân boş kalıyor.', diagnosisWhy: 'Satışın çoğu sabah geliyor.' })
  plan.steps['S22'] = done({ options: [{ _id: 'o1', name: 'Durakta satış', source: 'hazirlik' }, { _id: 'o2', name: 'Öğle menüsü', source: 'yeni' }] })
  plan.steps['S23'] = done({ tests: [{ _id: 't1', option: 'Durakta satış', mustBeTrue: 'Yolcu durur.', weakest: 'Yolcu beklemez.', result: 'destek' }, { _id: 't2', option: 'Öğle menüsü', mustBeTrue: 'Çalışan öğlen çıkar.', weakest: 'Fiyat yüksek kalır.', result: 'karsi' }] })
  plan.steps['19'] = done({ chosenPath: 'Durakta satış', choiceReason: 'En güçlü kanıt burada.', winningAim: 'Sabah kahvesinde ilk tercih olmak.', playField: 'Durak çevresi.', givenUp: 'Öğle satışı' })
  plan.steps['S25'] = done({ moves: [{ _id: 'm1', move: 'Durağa tezgâh kur', serves: 'Yolcuya ulaşır.', capability: 'Hızlı servis', have: 'kurulacak' }] })
  plan.steps['20'] = done({ dossier1: 'Profil', dossier2: 'Problem', dossier3: 'Talep', dossier4: 'Yol', dossier5: 'Para', dossier6: 'Varsayım', dossier7: 'Risk', dossier8: 'Durdurma', dossier9: 'Teşhis', dossier11: 'İlk teslim', counterView: 'Yolcu durmayabilir.', qualityCheck: ['q1', 'q2', 'q3', 'q4', 'q5'], approvedBy: 'Kurucu' })`

const substages = (page: Page) => page.locator('.substage')

test('pano karar rotasını üç ana kümeye göre gösterir', async ({ page }) => {
  await openDemo(page)
  const main = page.locator('main')
  for (const title of ['1. Strateji öncesi hazırlık', '2. Strateji oluşturma', '3. Strateji uygulama']) await expect(main.getByText(title, { exact: true }).first()).toBeAttached()
  await designRules(page, 'main', 'pano üç küme')
})

test('strateji oluşturma beş zorunlu alt aşamayı ve çıkış kapısını gösterir, geçiş kararı yokken kilitlidir', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/strateji')
  await expect(page.getByRole('alert').filter({ hasText: 'Strateji oluşturma kilitli' })).toBeVisible()
  await expect(substages(page)).toHaveCount(5)
  await expect(page.locator('.substage-code')).toHaveText(['2.1', '2.2', '2.3', '2.4', '2.5'])
  await expect(page.locator('.substage-title')).toContainText(['Teşhis', 'Seçenekler', 'Sınama', 'Seçim ve vazgeçiş', 'Ana hamleler ve gerekli yetkinlikler'])
  await expect(substages(page).first()).toContainText('Neden zorunlu?')
  await expect(substages(page).first()).toContainText('Dayanak: Rumelt')
  await expect(page.locator('.criteria-list > li')).toHaveCount(6)
  // Kilitliyken dolu düğme yoktur.
  await expect(page.locator('main .ant-btn-primary')).toHaveCount(0)
  await designRules(page, 'main', 'strateji oluşturma kilitli')
})

test('2.1 Teşhis adımı kilitliyken okunur ama doldurulmaz', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/9/adim/S21')
  await expect(page.getByRole('heading', { name: '2.1. Teşhis' })).toBeVisible()
  await expect(page.getByRole('alert').filter({ hasText: 'Bu adım kilitli' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Adımı tamamla' })).toBeDisabled()
  await expect(page.locator('#aS21-diagnosis')).toBeDisabled()
})

test('2.1 Teşhis: hazırlıktaki aday öneri olarak gelir, yazılım alanı kendisi doldurmaz', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, TRANSITION)
  await page.goto('/#/karar/9/adim/S21')
  await expect(page.getByRole('note').filter({ hasText: 'Alt aşama 2.1. Teşhis' })).toBeVisible()
  const field = page.locator('#aS21-diagnosis')
  await expect(field).toHaveValue('')
  await expect(page.getByText('Önceki adımlardan öneriler')).toBeVisible()
  await page.getByRole('button', { name: 'Alana yaz: Asıl güçlük' }).click()
  await expect(field).toHaveValue('Aylık kart ilgisi, gideri karşılayan günlük satışa dönüşecek mi?')
  // Dayanak yazılmadan adım tamamlanmaz.
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page.locator('.ant-message')).toContainText('Eksik alan var')
  await page.locator('#aS21-diagnosisWhy').fill('Yedi kişi kart aldı ama günlük satış gideri karşılamıyor.')
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page).toHaveURL(/#\/karar\/9\/adim\/S22/)
  await expect(page.getByRole('heading', { name: '2.2. Seçenekler' })).toBeVisible()
  await designRules(page, 'main', '2.2 seçenekler')
})

test('2.2 Seçenekler: tek yol seçim sayılmaz', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `${TRANSITION}; plan.steps['S22'] = { values: { options: [{ _id: 'o1', name: 'Küçük kafe' }] }, status: 'taslak', updatedAt: '' }`)
  await page.goto('/#/karar/9/adim/S22')
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page.locator('.ant-message')).toContainText('En az iki farklı yol yazın. Tek seçenek bir seçim değildir.')
  await expect(page).toHaveURL(/#\/karar\/9\/adim\/S22/)
})

test('2.3 Sınama: sınaması eksik yolu adıyla söyler ve koşulu tutmayan yolu elemez', async ({ page }) => {
  await openDemo(page)
  await patchPlan(
    page,
    `${TRANSITION}
     plan.steps['S22'] = { values: { options: [{ _id: 'o1', name: 'Küçük kafe' }, { _id: 'o2', name: 'Seyyar tezgâh' }] }, status: 'tamam', updatedAt: '' }
     plan.steps['S23'] = { values: { tests: [{ _id: 't1', option: 'Küçük kafe', mustBeTrue: 'Günde 60 sipariş gelir.', weakest: 'Sabah 7 talebi.', result: 'karsi' }, { _id: 't2', option: 'Başka yol', mustBeTrue: 'x', weakest: 'y', result: 'sinanmadi' }] }, status: 'taslak', updatedAt: '' }`,
  )
  await page.goto('/#/karar/9/adim/S23')
  const summary = page.locator('.calc-box').first()
  await expect(summary).toContainText('1 / 2 yol sınandı')
  await expect(summary).toContainText('Koşulu tutmayan yol: Küçük kafe.')
  await expect(summary).toContainText('Yazılım yol elemez.')
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page.locator('.ant-message')).toContainText('Şu yolun sınaması eksik: Seyyar tezgâh.')
  await designRules(page, 'main', '2.3 sınama')
})

test('2.4 Seçim ve vazgeçiş: yazılım seçim için öneri üretmez, beş alanı ister', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, TRANSITION)
  await page.goto('/#/karar/9/adim/19')
  await expect(page.getByRole('heading', { name: '2.4. Seçim ve vazgeçiş' })).toBeVisible()
  for (const name of ['Seçilen yol', 'Seçimin gerekçesi', 'Vazgeçilenler', 'Kazanma hedefi', 'Saha']) await expect(page.getByRole('button', { name: `Alana yaz: ${name}` })).toHaveCount(0)
  for (const key of ['chosenPath', 'choiceReason', 'winningAim', 'playField', 'givenUp']) await expect(page.locator(`#a19-${key}`)).toHaveValue('')
  // Hedef ve iş alanları bu adımda yoktur. Onlar strateji uygulamadadır.
  await expect(page.locator('#a19-objective')).toHaveCount(0)
  await designRules(page, 'main', '2.4 seçim')
})

test('strateji belgesi onaylanınca strateji oluşturma biter ve strateji uygulama açılır', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `${TRANSITION}${STRATEGY_DONE}; plan.steps['20'].values.approvedBy = ''`)
  await page.goto('/#/strateji')
  await expect(page.locator('.criteria-list > li').last()).toContainText('Henüz karşılanmadı.')
  await page.goto('/#/uygulama')
  await expect(page.getByRole('alert').filter({ hasText: 'Strateji uygulama kilitli' })).toContainText('karar sahibi strateji belgesini onaylamalı')
  await page.goto('/#/karar/6/adim/U31')
  await expect(page.getByRole('button', { name: 'Adımı tamamla' })).toBeDisabled()

  await patchPlan(page, `plan.steps['20'].values.approvedBy = 'Kurucu'`)
  await page.goto('/#/strateji')
  await expect(page.locator('main')).toContainText('Strateji oluşturma tamam')
  await expect(page.locator('.substage .ant-tag')).toHaveText(['Tamam', 'Tamam', 'Tamam', 'Tamam', 'Tamam'])
  await page.getByRole('button', { name: 'Strateji uygulamaya geç' }).click()
  await expect(page).toHaveURL(/#\/uygulama/)
  await expect(page.getByRole('alert').filter({ hasText: 'Strateji uygulama kilitli' })).toHaveCount(0)
})

test('strateji uygulama beş zorunlu alt aşamayı gösterir ve sıradaki adımı açar', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `${TRANSITION}${STRATEGY_DONE}`)
  await page.goto('/#/uygulama')
  await expect(substages(page)).toHaveCount(5)
  await expect(page.locator('.substage-code')).toHaveText(['3.1', '3.2', '3.3', '3.4', '3.5'])
  await expect(page.locator('main .ant-btn-primary')).toHaveCount(1)
  await designRules(page, 'main', 'strateji uygulama')
  await page.getByRole('button', { name: /Sıradaki adım: 3\.1\. Hedef ve gösterge/ }).click()
  await expect(page).toHaveURL(/#\/karar\/6\/adim\/U31/)
  await expect(page.getByRole('heading', { name: '3.1. Hedef ve gösterge' })).toBeVisible()
  // Hedef önerisi Adım 02'deki başarı cümlesinden gelir.
  await page.getByRole('button', { name: 'Alana yaz: Hedef' }).click()
  await expect(page.locator('#aU31-objective')).not.toHaveValue('')
})

test('3.2 her işe sorumlu ve tarih ister, 3.3 bağlanan parayı bütçeyle karşılaştırır', async ({ page }) => {
  await openDemo(page)
  await patchPlan(
    page,
    `${TRANSITION}${STRATEGY_DONE}
     plan.steps['U32'] = { values: { now: [{ _id: 'i1', action: 'Tezgâhı kur', owner: 'Ali' }] }, status: 'taslak', updatedAt: '' }
     plan.steps['U33'] = { values: { resources: [{ _id: 'k1', item: 'Tezgâh', budgetKurus: 99000000 }], resourceOwner: 'Kurucu' }, status: 'taslak', updatedAt: '' }`,
  )
  await page.goto('/#/karar/6/adim/U32')
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page.locator('.ant-message')).toContainText('"Tezgâhı kur" işi için sorumlu ve bitiş tarihi yazın.')
  await page.goto('/#/karar/6/adim/U33')
  const total = page.locator('.calc-box').first()
  await expect(total).toContainText('1 iş için kaynak yazıldı.')
  await expect(total).toContainText('aşıyor')
  await designRules(page, 'main', '3.3 kaynak')
})

test('3.5 gözden geçirme: eksik karar kaydedilmez, "düzelt" kararı kayda geçer', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `${TRANSITION}${STRATEGY_DONE}`)
  await page.goto('/#/uygulama')
  const card = page.locator('#yenileme')
  await expect(card).toContainText('Uyguladığımız plan hâlâ doğru plan mı?')
  await expect(card).toContainText('Bugünkü seçim: Durakta satış')
  await card.getByRole('button', { name: 'Kararı kaydet' }).click()
  await expect(card.locator('.renewal-errors li')).toHaveCount(4)
  expect(await stored(page, '(plan.strategyReviews ?? []).length')).toBe(0)

  await card.getByRole('radio', { name: 'Kısmen doğru' }).check()
  await card.getByRole('radio', { name: /^Düzelt\./ }).check()
  await card.getByLabel('Gerekçe').fill('Sabah satışı tuttu ama öğle satışı tutmadı.')
  await card.getByLabel('Karar sahibi').fill('Kurucu')
  await card.getByRole('button', { name: 'Kararı kaydet' }).click()
  await expect(card.locator('.renewal-item')).toHaveCount(1)
  await expect(card.locator('.renewal-item')).toContainText('Düzelt')
  expect(await stored(page, 'plan.strategyReviews[0].decision')).toBe('duzelt')
  expect(await stored(page, `plan.steps['20'].status`)).toBe('tamam')
  await designRules(page, 'main', 'gözden geçirme kaydı')
})

test('cevap ile karar çelişirse kayıt yapılmaz', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `${TRANSITION}${STRATEGY_DONE}`)
  await page.goto('/#/uygulama')
  const card = page.locator('#yenileme')
  await card.getByRole('radio', { name: 'Hayır, seçim artık doğru değil' }).check()
  await card.getByRole('radio', { name: /^Sürdür\./ }).check()
  await card.getByLabel('Gerekçe').fill('Müşteri üç aydır gelmiyor, seçim tutmadı.')
  await card.getByLabel('Karar sahibi').fill('Kurucu')
  await card.getByRole('button', { name: 'Kararı kaydet' }).click()
  await expect(card.locator('.renewal-errors')).toContainText('Seçim artık doğru değilse "Sürdür" kararı verilemez.')
  expect(await stored(page, '(plan.strategyReviews ?? []).length')).toBe(0)
})

test('"yeniden aç" kararı işi strateji oluşturmaya götürür ama uygulamayı kilitlemez', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `${TRANSITION}${STRATEGY_DONE}`)
  await page.goto('/#/uygulama')
  const card = page.locator('#yenileme')
  await card.getByRole('radio', { name: 'Hayır, seçim artık doğru değil' }).check()
  await card.getByRole('radio', { name: /^Yeniden aç\./ }).check()
  await card.getByLabel('Gerekçe').fill('Müşteri üç aydır gelmiyor, seçim tutmadı.')
  await card.getByLabel('Karar sahibi').fill('Kurucu')
  await card.getByRole('button', { name: 'Kararı kaydet' }).click()
  await expect(page).toHaveURL(/#\/strateji/)
  await expect(page.locator('main').getByRole('alert').filter({ hasText: 'Strateji yeniden açıldı' })).toContainText('Müşteri üç aydır gelmiyor')
  await expect(page.locator('main')).not.toContainText('Strateji oluşturma tamam')
  expect(await stored(page, `plan.steps['20'].status`)).toBe('taslak')
  // Uygulama kilitlenmez. Karar 6 açık kalır.
  await page.goto('/#/karar/6')
  await expect(page.getByRole('alert').filter({ hasText: 'Bu karar kilitli' })).toHaveCount(0)
  await page.goto('/#/uygulama')
  await expect(page.getByRole('alert').filter({ hasText: 'Strateji uygulama kilitli' })).toHaveCount(0)
  await expect(page.locator('main').getByRole('alert').filter({ hasText: 'Strateji yeniden açıldı' })).toBeVisible()
  // Onay silindi. Strateji belgesi yeniden onaylanınca strateji kapanır.
  expect(await stored(page, `plan.steps['20'].values.approvedBy`)).toBe('')
  await patchPlan(page, `plan.steps['20'].status = 'tamam'; plan.steps['20'].values.approvedBy = 'Kurucu'; plan.steps['20'].updatedAt = new Date(Date.now() + 1000).toISOString()`)
  await page.goto('/#/strateji')
  await expect(page.locator('main').getByRole('alert').filter({ hasText: 'Strateji yeniden açıldı' })).toHaveCount(0)
  await expect(page.locator('main')).toContainText('Strateji oluşturma tamam')
})

test('eski sürümün hedef ve iş alanları yeni adımlara taşınır', async ({ page }) => {
  await openDemo(page)
  await page.evaluate((key) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? '{}')
    const plan = raw.state.plans[raw.state.currentId]
    plan.steps['19'] = { values: { chosenPath: 'Durakta satış', objective: 'İlk 10 müşteri', keyResults: [{ _id: 'a', kr: 'Müşteri', target: '10' }], now: [{ _id: 'b', action: 'Tezgâhı kur', owner: 'Ali', dueDate: '2026-12-01' }] }, status: 'tamam', updatedAt: '' }
    raw.version = 2
    localStorage.setItem(key, JSON.stringify(raw))
  }, STORAGE_KEY)
  await page.reload()
  await expect.poll(() => stored(page, `plan.steps['U31']?.values?.objective ?? null`)).toBe('İlk 10 müşteri')
  expect(await stored(page, `plan.steps['U32'].values.now[0].action`)).toBe('Tezgâhı kur')
  expect(await stored(page, `Object.keys(plan.steps['19'].values)`)).toEqual(['chosenPath'])
})

test('kısa yol strateji oluşturma ve uygulama planı adımlarını gizlemez', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `${TRANSITION}${STRATEGY_DONE}; plan.shortPath = true`)
  await page.goto('/#/strateji')
  await expect(substages(page)).toHaveCount(5)
  await page.goto('/#/karar/6')
  for (const title of ['Hedef ve gösterge', 'Ana işler ve sorumlular', 'Kaynak ve bütçe']) await expect(page.locator('main').getByText(title).first()).toBeAttached()
})

test('okunamayan kayıt boş durumla ezilmez, yeni plan açılmaz, ham kayıt indirilir', async ({ page }) => {
  await openDemo(page)
  await page.evaluate((key) => localStorage.setItem(key, '{bozuk'), STORAGE_KEY)
  await page.reload()
  const alert = page.getByRole('alert').filter({ hasText: 'Kayıtlı planlar okunamadı' })
  await expect(alert).toBeVisible()
  await page.goto('/#/')
  await expect(page.getByRole('button', { name: 'Yeni plan' })).toBeDisabled()
  await expect(page.locator('main').getByRole('button', { name: 'Ayakkabı örneğini aç' })).toBeDisabled()
  await expect(page.locator('main').getByRole('button', { name: 'Kafe örneğini aç' })).toBeDisabled()
  const download = page.waitForEvent('download')
  await alert.getByRole('button', { name: 'Ham kaydı indir' }).click()
  expect((await download).suggestedFilename()).toBe('okunamayan-kayit.txt')
  // Hata durumu depoya yazılmaz. Kullanıcının kaydı olduğu gibi durur.
  await page.waitForTimeout(600)
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe('{bozuk')
})

test('eski sürümde tamamlanan strateji uygulamayı kilitlemez ve açıklama gösterir', async ({ page }) => {
  await openDemo(page)
  await page.evaluate(([key, transition]) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? '{}')
    const plan = raw.state.plans[raw.state.currentId]
    new Function('plan', transition)(plan)
    plan.steps['19'] = { values: { chosenPath: 'Durakta satış', choiceReason: 'Kanıt burada.', givenUp: 'Öğle satışı', objective: 'İlk 10 müşteri', keyResults: [{ _id: 'a', kr: 'Müşteri', target: '10' }], now: [{ _id: 'b', action: 'Tezgâhı kur', owner: 'Ali', dueDate: '2026-12-01' }] }, status: 'tamam', updatedAt: '2026-11-01T00:00:00.000Z' }
    plan.steps['20'] = { values: { qualityCheck: ['q1', 'q2', 'q3', 'q4', 'q5'] }, status: 'tamam', updatedAt: '2026-11-01T00:00:00.000Z' }
    raw.version = 2
    localStorage.setItem(key, JSON.stringify(raw))
  }, [STORAGE_KEY, TRANSITION])
  await page.reload()
  await expect.poll(() => stored(page, 'Boolean(plan.legacyStrategy)')).toBe(true)
  await page.goto('/#/strateji')
  await expect(page.getByRole('note').filter({ hasText: 'Bu plan eski sürümde tamamlandı' })).toBeVisible()
  await page.goto('/#/karar/6')
  await expect(page.getByRole('alert').filter({ hasText: 'Bu karar kilitli' })).toHaveCount(0)
  await page.goto('/#/karar/6/adim/U32')
  await expect(page.getByRole('button', { name: 'Adımı tamamla' })).toBeEnabled()
})

test('Karar 6 kilitliyken uygulama adımı doldurulmaz', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/6/adim/21')
  await expect(page.getByRole('alert').filter({ hasText: 'Bu adım kilitli' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Adımı tamamla' })).toBeDisabled()
  await page.goto('/#/karar/7/adim/28')
  await expect(page.getByRole('button', { name: 'Adımı tamamla' })).toBeDisabled()
})

test('3.5 bağlantısı gözden geçirme kartına gider ve odağı oraya taşır', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `${TRANSITION}${STRATEGY_DONE}`)
  await page.goto('/#/uygulama')
  await expect(page.locator('.karar-step-count').first()).toHaveText('0 / 4 tamam')
  await page.getByRole('link', { name: 'Gözden geçirme kaydını aç' }).click()
  await expect(page.locator('#yenileme h2')).toBeFocused()
})

test('3.1 adımını değiştirmek uygulama kapılarının kararlarını eskitmez', async ({ page }) => {
  await openDemo(page)
  await patchPlan(
    page,
    `${TRANSITION}${STRATEGY_DONE}
     plan.decisions.push({ id: 'k6', gate: 6, scope: '', criteria: [], suggested: 'ilerle', chosen: 'ilerle', reason: 'Ölçüler geçti.', retriesLeft: 1, decidedBy: 'Kurucu', decidedAt: new Date().toISOString(), revision: plan.revision })
     plan.steps['U31'] = { values: { objective: 'İlk 10 müşteri', keyResults: [{ _id: 'g1', kr: 'Müşteri', baseline: '0', target: '10' }] }, status: 'tamam', updatedAt: new Date().toISOString() }`,
  )
  await page.goto('/#/karar/6/adim/U31')
  await page.locator('#aU31-objective').fill('İlk 12 müşteri')
  await expect.poll(() => stored(page, `plan.steps['U31'].values.objective`)).toBe('İlk 12 müşteri')
  expect(await stored(page, `plan.decisions.find((d) => d.gate === 6).stale ?? false`)).toBe(false)
  // Karar 7 açık kalır. Kapı 6 kararı geçerlidir.
  await page.goto('/#/karar/7')
  await expect(page.getByRole('alert').filter({ hasText: 'Bu karar kilitli' })).toHaveCount(0)
})

import { expect, test, type Locator, type Page } from '@playwright/test'
import { mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { activate, ready } from './uyarlanir/audit'

/**
 * Proje modülü ile çekirdeğin birlikte çalışması.
 * Akış: onaylı strateji, satır etiketinden proje, görev, gecikme, uygulama kartı,
 * kanıt taslağı, 3.5 bölümünde kayıt, dışa ve içe aktarma.
 * Modül verisi planı değiştirmez. Plan yalnız kişi taslağı kaydedince değişir.
 */

const STORAGE_KEY = 'decisionactplan-v1'
const PLAN_ID = 'ornek-ayakkabi-sirketi'
const PLAN_NAME = 'Örnek: Ayakkabı şirketi'
const HAMLE = 'Amazon ABD satışını büyüt'
const SIMDI = 'Amazon ürün fotoğraflarını yenile'
const GOREV = 'Fotoğrafçıyla görüşün'
const KANIT = process.env.BUTUNLESIK_KANIT_DIR

const APPROVE = `
  const now = new Date().toISOString()
  plan.transitions = [{ id: 'gecis-deneme', outcome: 'hazir', suggested: 'hazir', reason: 'Dayanaklar incelendi.', decidedBy: 'Patron', decidedAt: now, reviewed: true, mandatoryMet: 9, mandatoryTotal: 9, supportingMet: 5, supportingTotal: 7, level: 3, revision: plan.revision }]
  const done = (values) => ({ values, status: 'tamam', updatedAt: now })
  plan.steps['S21'] = done({ diagnosis: 'Tek tek satış az büyüyor.', diagnosisWhy: 'Amazon ilanları eski.' })
  plan.steps['S22'] = done({ options: [{ _id: 'o1', name: 'Amazon ABD', source: 'hazirlik' }, { _id: 'o2', name: 'Toptan ihracat', source: 'yeni' }] })
  plan.steps['S23'] = done({ tests: [{ _id: 't1', option: 'Amazon ABD', mustBeTrue: 'Alıcı yeni ilana tıklar.', weakest: 'Fiyat yüksek kalır.', result: 'destek' }, { _id: 't2', option: 'Toptan ihracat', mustBeTrue: 'Alıcı büyük sipariş verir.', weakest: 'Ödeme gecikir.', result: 'karsi' }] })
  plan.steps['19'] = done({ chosenPath: 'Amazon ABD', choiceReason: 'En güçlü kanıt burada.', winningAim: 'Amazon ABD alıcısının ilk tercihi olmak.', playField: 'Amazon ABD mağazası.', givenUp: 'Yeni toptan alıcı' })
  plan.steps['S25'] = done({ moves: [
    { _id: 'm-amazon', move: '${HAMLE}', serves: 'Tek tek satışı artırır.', capability: 'İlan ve fotoğraf yönetimi', have: 'kurulacak' },
    { _id: 'm-yunan', move: 'Yunanistan mağazalarıyla ilişkiyi güçlendir', serves: 'Toptan satışı korur.', capability: 'İhracat ekibi', have: 'var' },
  ] })
  plan.steps['20'] = done({ dossier1: 'Profil', dossier2: 'Problem', dossier3: 'Talep', dossier4: 'Yol', dossier5: 'Para', dossier6: 'Varsayım', dossier7: 'Risk', dossier8: 'Durdurma', dossier9: 'Teşhis', dossier11: 'İlk teslim', counterView: 'Alıcı fiyatı yüksek bulabilir.', qualityCheck: ['q1', 'q2', 'q3', 'q4', 'q5'], approvedBy: 'Patron' })
  plan.steps['U32'] = done({ now: [{ _id: 'u-foto', action: '${SIMDI}', owner: 'Dijital ekip', dueDate: '2099-01-15' }] })
  plan.steps['U33'] = done({ resources: [{ _id: 'k-foto', item: 'Fotoğraf çekimi', budgetKurus: 500000, people: 'Dijital ekip, haftada 10 saat' }], resourceOwner: 'Patron' })
  plan.profile.funding = 'dis'`

async function openShoeDemo(page: Page, touch: boolean) {
  await page.goto('/')
  await ready(page)
  await activate(page, page.getByRole('button', { name: 'Ayakkabı örneğini aç', exact: true }).first(), touch)
  await expect(page).toHaveURL(/#\/ozet$/)
  await ready(page)
}

async function approveStrategy(page: Page) {
  await page.evaluate(([key, body]) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? '{}')
    new Function('plan', body)(raw.state.plans[raw.state.currentId])
    localStorage.setItem(key, JSON.stringify(raw))
  }, [STORAGE_KEY, APPROVE])
  await page.reload()
  await ready(page)
}

/**
 * Kayıtlı planın içeriği. Çekirdek ekranları gezmek son konumu ve değişiklik saatini yazar.
 * Bu iki alan gezinmeyi gösterir. Planın içeriği değildir. Bu yüzden karşılaştırmaya girmez.
 */
const storedPlan = (page: Page) => page.evaluate(([key, id]) => {
  const plan = JSON.parse(localStorage.getItem(key) ?? '{}').state?.plans?.[id] ?? null
  if (plan) {
    delete plan.lastLocation
    delete plan.updatedAt
  }
  return JSON.stringify(plan)
}, [STORAGE_KEY, PLAN_ID])

async function go(page: Page, path: string) {
  await page.goto(`/#${path}`)
  await ready(page)
}

/** "Uygulama" ekranındaki karar etiketleri. Kontrollerin durumunu gösterir. */
async function gateTags(page: Page): Promise<string[]> {
  await go(page, '/uygulama')
  const links = page.locator('.decision-links li')
  await expect(links.first()).toBeVisible()
  return links.allInnerTexts()
}

async function noPageOverflow(page: Page, label: string) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  expect(r.sw, `Sayfa yatay taşmamalı: ${label}`).toBeLessThanOrEqual(r.iw + 1)
}

/** Öğenin içindeki bağlantı ve düğmeler en az 44 piksel, yazılar en az 14 pikseldir. */
async function readable(area: Locator, label: string) {
  const r = await area.evaluate((root) => {
    const visible = (e: Element) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'
    const small = [...root.querySelectorAll('*')]
      .filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()))
      .filter((e) => visible(e) && Number.parseFloat(getComputedStyle(e).fontSize) < 14)
      .map((e) => `${e.tagName} ${getComputedStyle(e).fontSize}`)
    const targets = [...root.querySelectorAll('a[href], button')].filter(visible).map((e) => e.getBoundingClientRect()).filter((b) => b.width < 44 || b.height < 44).map((b) => `${Math.round(b.width)}x${Math.round(b.height)}`)
    return { small, targets }
  })
  expect(r.small, `${label}: yazı en az 14 piksel`).toEqual([])
  expect(r.targets, `${label}: dokunma alanı en az 44 piksel`).toEqual([])
}

async function shot(page: Page, name: string) {
  if (!KANIT) return
  mkdirSync(KANIT, { recursive: true })
  await page.screenshot({ path: join(KANIT, `${name}.png`), fullPage: true })
}

test('satır etiketinden proje, görev, gecikme, kanıt taslağı ve paket dosyası birlikte çalışır', async ({ page, hasTouch }, info) => {
  test.setTimeout(120_000)
  const name = info.project.name
  await openShoeDemo(page, hasTouch)
  await approveStrategy(page)
  const tagsBefore = await gateTags(page)
  /* Proje yokken "Projeler" kartı görünmez. */
  await expect(page.getByRole('heading', { name: 'Projeler', level: 2 })).toHaveCount(0)
  const before = await storedPlan(page)

  /* 3.2 adımındaki "Şimdi" satırının etiketi Projeler ekranını bu satır seçili açar. */
  await go(page, '/karar/6/adim/U32')
  const openLink = page.getByRole('link', { name: `Proje aç: ${SIMDI}` })
  await expect(openLink).toBeVisible()
  await activate(page, openLink, hasTouch)
  await expect(page).toHaveURL(/#\/projeler\?satir=u-foto$/)
  await ready(page)
  const source = page.locator('[data-satir="u-foto"]')
  await expect(source).toContainText('Bu satırdan geldiniz.')
  const fromRow = page.getByRole('button', { name: `Bu işten proje aç: ${SIMDI}` })
  await expect(fromRow).toBeFocused()
  await expect(source).toBeInViewport()
  await noPageOverflow(page, 'seçili satır')
  await shot(page, `${name}-projeler-secili-satir`)
  await activate(page, fromRow, hasTouch)
  await expect(page).toHaveURL(/#\/projeler\/[^/?]+$/)
  await ready(page)

  /* Görev eklenir. Son tarihi geçmiş görev gecikir. */
  const input = page.getByLabel('Yeni görev', { exact: true })
  await input.fill(GOREV)
  await input.press('Enter')
  await activate(page, page.getByRole('link', { name: GOREV, exact: true }), hasTouch)
  await ready(page)
  await page.getByLabel('Son tarih', { exact: true }).fill('2026-01-05')
  await activate(page, page.getByRole('button', { name: 'Kaydet' }), hasTouch)
  await expect(page.locator('.pj-is-uyari')).toContainText('Gecikti')

  /* Satır etiketi sayıları gösterir. Gecikme metin ve ikonla görünür. */
  await go(page, '/karar/6/adim/U32')
  const badge = page.locator('.project-row-badge').filter({ has: page.getByRole('link', { name: `Projeyi aç: ${SIMDI}` }) })
  await expect(badge).toContainText('Projede 1 görev açık.')
  await expect(badge.locator('.project-row-badge-late')).toHaveText('1 görev gecikti.')
  await expect(badge.locator('.project-row-badge-late svg')).toHaveCount(1)
  await readable(badge, 'satır etiketi')
  await noPageOverflow(page, '3.2 adımı')
  await badge.scrollIntoViewIfNeeded()
  await shot(page, `${name}-u32-etiket`)

  /* 2.5 adımındaki hamlenin projesi yok. Etiket yalnız açma bağlantısı verir. */
  await go(page, '/karar/9/adim/S25')
  await expect(page.getByRole('link', { name: `Proje aç: ${HAMLE}` })).toBeVisible()

  /* "Uygulama" ekranındaki kart sayıları gösterir. Kontroller değişmez. */
  expect(await gateTags(page)).toEqual(tagsBefore)
  const card = page.locator('.projects-summary')
  await expect(card).toContainText('1 proje var.')
  await expect(card).toContainText('1 görev açık.')
  await expect(card.locator('.projects-summary-late')).toHaveText('1 görev gecikti.')
  await expect(card.locator('.projects-summary-late svg')).toHaveCount(1)
  await expect(card.getByRole('link', { name: 'Projelere git' })).toHaveAttribute('href', '#/projeler')
  await readable(card, 'Projeler kartı')
  await noPageOverflow(page, 'uygulama')
  await card.scrollIntoViewIfNeeded()
  await shot(page, `${name}-uygulama-kart`)

  /* Kaynak sınırı adımı "Dış para" seçilince olası desteklere bağlanır. */
  await go(page, '/karar/1/adim/02')
  const hint = page.locator('.support-links')
  await expect(hint).toContainText('Destek parası kesin para sayılmaz.')
  await expect(hint.getByRole('link', { name: 'Olası destekler' })).toHaveAttribute('href', '#/destek/eslesme')
  await readable(hint, 'destek bağlantısı')

  /* Destek başvurusu 3.3 adımında beklenen para olarak görünür. Bağlanan toplam para değişmez. */
  await go(page, '/karar/6/adim/U33')
  const total = page.locator('.field-cell').filter({ hasText: 'Bağlanan toplam para' })
  await expect(total).toBeVisible()
  const totalBefore = await total.innerText()
  expect(totalBefore).toContain('Bağlanan toplam para 5.000,00 TL.')
  await expect(page.locator('.support-links')).toHaveCount(0)
  await go(page, '/destek/kosgebIsletmeGelistirme')
  await activate(page, page.getByRole('main').getByRole('button', { name: 'Başvuru listeme ekle' }), hasTouch)
  await activate(page, page.getByRole('main').getByRole('button', { name: 'Hayır', exact: true }), hasTouch)
  await expect(page.getByRole('main').getByText('Program başvuru listenize eklendi.')).toBeVisible()
  await go(page, '/karar/6/adim/U33')
  const support = page.locator('.support-links')
  await expect(support.getByRole('heading', { name: 'Destek başvuruları: 1' })).toBeVisible()
  await expect(support).toContainText('1 başvuru hazırlanıyor.')
  await expect(support.locator('.support-links-label')).toHaveText('Beklenen, kesin değil')
  await expect(support).toContainText('Bağlanan toplam paraya eklenmez.')
  expect(await total.innerText()).toBe(totalBefore)
  await readable(support, 'destek satırı')
  await noPageOverflow(page, '3.3 adımı')
  await support.scrollIntoViewIfNeeded()
  await shot(page, `${name}-u33-destek`)

  /* Modül verisi planı değiştirmez. */
  expect(await storedPlan(page)).toBe(before)

  /* Kanıt taslağı hazırlanır. Aynı metin ikinci kez taslak olmaz. Plan değişmez. */
  await go(page, '/projeler')
  await activate(page, page.getByRole('link', { name: SIMDI, exact: true }), hasTouch)
  await ready(page)
  await activate(page, page.getByRole('button', { name: 'Kanıt taslağı hazırla' }), hasTouch)
  const status = page.locator('.pj-proje-kanit-durum')
  await expect(status).toContainText('Kanıt taslağı hazırlandı. Plan değişmedi.')
  await activate(page, page.getByRole('button', { name: 'Kanıt taslağı hazırla' }), hasTouch)
  await expect(status).toContainText('Bu kanıt taslağı zaten bekliyor.')
  await readable(page.locator('.pj-proje-kanit-durum'), 'kanıt durumu')
  expect(await storedPlan(page)).toBe(before)

  /* Taslak 3.5 bölümünde görünür. Plan yalnız "Kaydet" ile değişir. */
  await activate(page, status.getByRole('link', { name: '3.5 bölümünü açın.' }), hasTouch)
  await expect(page).toHaveURL(/#\/uygulama#yenileme$/)
  await ready(page)
  const review = page.locator('.draft-review')
  await expect(review.getByRole('heading', { name: 'Taslak var' })).toBeVisible()
  await expect(review.locator('.draft-review-item')).toHaveCount(1)
  await expect(review).toContainText(`Proje: ${SIMDI}.`)
  await expect(review).toContainText('Projede 1 görev var. 0 görev bitti. 1 görev açık.')
  await readable(review, 'taslak incelemesi')
  await noPageOverflow(page, 'taslak incelemesi')
  await review.scrollIntoViewIfNeeded()
  await shot(page, `${name}-taslak-var`)
  expect(await storedPlan(page)).toBe(before)
  await activate(page, review.getByRole('button', { name: 'Kaydet' }), hasTouch)
  await expect(page.getByText('Kanıt kaydedildi. Kanıt defterine eklendi.')).toBeVisible()
  await expect(page.locator('.draft-review')).toHaveCount(0)
  const accepted = JSON.parse(await storedPlan(page))
  const previous = JSON.parse(before)
  expect(accepted.evidence.length).toBe(previous.evidence.length + 1)
  expect(accepted.evidence.at(-1).title).toContain(`Proje: ${SIMDI}.`)
  /* Kanıt kaydı karar sürümünü ve kontrolleri değiştirmez. */
  expect(accepted.revision).toBe(previous.revision)
  expect(accepted.decisions).toEqual(previous.decisions)
  expect(accepted.transitions).toEqual(previous.transitions)
  expect(await gateTags(page)).toEqual(tagsBefore)

  /* Kaydedilen kanıt yeniden taslak olmaz. */
  await go(page, '/projeler')
  await activate(page, page.getByRole('link', { name: SIMDI, exact: true }), hasTouch)
  await ready(page)
  await activate(page, page.getByRole('button', { name: 'Kanıt taslağı hazırla' }), hasTouch)
  await expect(page.locator('.pj-proje-kanit-durum')).toContainText('Bu kanıt zaten kanıt defterinde.')

  /* Dışa aktarma paket yazar. Paket planı, kanıtı ve proje verisini taşır. */
  await go(page, '/')
  const downloading = page.waitForEvent('download')
  await activate(page, page.getByRole('button', { name: `JSON indir: ${PLAN_NAME}` }), hasTouch)
  const file = info.outputPath('plan.json')
  await (await downloading).saveAs(file)
  const bundle = JSON.parse(readFileSync(file, 'utf8'))
  expect(bundle.kind).toBe('decisionactplan-bundle')
  expect(bundle.plan.evidence.at(-1).title).toContain(`Proje: ${SIMDI}.`)
  expect(bundle.modules.proje.entries.map((e: [string, unknown]) => e[0].split('/')[0]).sort()).toEqual(['is', 'proje'])
  expect(JSON.stringify(bundle.modules.destek)).toContain('kosgebIsletmeGelistirme')

  /* Plan silme onayı modül verisinin de silineceğini söyler. */
  await activate(page, page.getByRole('button', { name: `Sil: ${PLAN_NAME}` }), hasTouch)
  await expect(page.locator('.ant-popconfirm')).toContainText('Planın projeleri ve destek başvuruları da silinir.')
  await activate(page, page.locator('.ant-popconfirm').getByRole('button', { name: 'Sil' }), hasTouch)
  await expect(page.getByRole('button', { name: `Sil: ${PLAN_NAME}` })).toHaveCount(0)

  /* İçe alma her şeyi geri getirir. Özet yeniden hesaplanır. */
  await page.locator('input[type="file"][aria-label="JSON dosyası seç"]').setInputFiles(file)
  await expect(page.getByText('Plan içe alındı.')).toBeVisible()
  const restored = JSON.parse(await storedPlan(page))
  expect(restored.evidence.length).toBe(accepted.evidence.length)
  await expect.poll(async () => (await gateTags(page)).join('|')).toBe(tagsBefore.join('|'))
  await expect(page.locator('.projects-summary')).toContainText('1 proje var.')
  await expect(page.locator('.projects-summary')).toContainText('1 görev gecikti.')
  await go(page, '/karar/6/adim/U32')
  await expect(page.locator('.project-row-badge').filter({ hasText: 'Projede 1 görev açık.' })).toBeVisible()
  await go(page, '/karar/6/adim/U33')
  await expect(page.locator('.support-links').getByRole('heading', { name: 'Destek başvuruları: 1' })).toBeVisible()
  expect(await page.locator('.field-cell').filter({ hasText: 'Bağlanan toplam para' }).innerText()).toBe(totalBefore)

  /* Aynı örnek dosyası yeniden alınırsa ekran sorar. Şimdiki proje ve destek verisi korunur. Dosyadaki modül verisi alınmaz. */
  await go(page, '/')
  await page.locator('input[type="file"][aria-label="JSON dosyası seç"]').setInputFiles(file)
  const dialog = page.getByRole('dialog').filter({ hasText: 'Örnek plan yeniden açılsın mı?' })
  await expect(dialog).toContainText('Bu örneğe bağlı projeler ve destek başvuruları silinmez.')
  await expect(dialog).toContainText('Dosyadaki proje ve destek verisi alınmaz.')
  await shot(page, `${name}-ornek-sorusu`)
  await activate(page, dialog.getByRole('button', { name: 'Örneği yeniden aç' }), hasTouch)
  await expect(page.getByText('Plan içe alındı.').first()).toBeVisible()
  await expect(page.getByText('Dosyadaki proje ve destek verisi alınmadı.')).toBeVisible()
  await go(page, '/projeler')
  await expect(page.locator('.pj-projeler-kart')).toHaveCount(1)
  await expect(page.locator('.pj-projeler-kart')).toContainText('1 görevin son tarihi geçti.')

  /* Menüden örneği yeniden açmak da aynı soruyu sorar. Vazgeçince hiçbir şey değişmez. */
  const snapshot = await storedPlan(page)
  await go(page, '/')
  await activate(page, page.getByRole('button', { name: 'Daha fazla', exact: true }), hasTouch)
  await activate(page, page.getByRole('menuitem', { name: 'Ayakkabı örneğini aç' }), hasTouch)
  const again = page.getByRole('dialog').filter({ hasText: 'Örnek plan yeniden açılsın mı?' })
  await activate(page, again.getByRole('button', { name: 'Vazgeç' }), hasTouch)
  await expect(again).toHaveCount(0)
  expect(await storedPlan(page)).toBe(snapshot)

  /* Onaylanınca örnek yenilenir. Proje ve destek verisi kalır. */
  await activate(page, page.getByRole('button', { name: 'Daha fazla', exact: true }), hasTouch)
  await activate(page, page.getByRole('menuitem', { name: 'Ayakkabı örneğini aç' }), hasTouch)
  await activate(page, page.getByRole('dialog').getByRole('button', { name: 'Örneği yeniden aç' }), hasTouch)
  await expect(page).toHaveURL(/#\/ozet$/)
  await approveStrategy(page)
  await go(page, '/projeler')
  await expect(page.locator('.pj-projeler-kart')).toHaveCount(1)
  await go(page, '/karar/6/adim/U33')
  await expect(page.locator('.support-links').getByRole('heading', { name: 'Destek başvuruları: 1' })).toBeVisible()

  /* Strateji yeniden açılırsa Projeler ekranı proje göstermez. Etiket ve kart bağlantı vermez. */
  await go(page, '/uygulama')
  await page.getByRole('radio', { name: 'Hayır, seçim artık doğru değil' }).check()
  await page.getByRole('radio', { name: /^Yeniden aç\./ }).check()
  await page.getByLabel('Gerekçe').fill('Amazon satışı üç ay boyunca hiç büyümedi.')
  await page.getByLabel('Karar sahibi').fill('Patron')
  await activate(page, page.getByRole('button', { name: 'Kararı kaydet' }), hasTouch)
  await expect(page).toHaveURL(/#\/strateji$/)
  await go(page, '/karar/6/adim/U32')
  const closed = page.locator('.project-row-badge')
  await expect(closed).toContainText('Projede 1 görev açık.')
  await expect(closed.getByRole('link')).toHaveCount(0)
  await go(page, '/uygulama')
  await expect(page.locator('.projects-summary')).toContainText('Strateji yeniden onaylanınca projeleri açabilirsiniz.')
  await expect(page.locator('.projects-summary').getByRole('link')).toHaveCount(0)
})

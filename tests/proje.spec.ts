import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { activate, ready } from './uyarlanir/audit'

/**
 * Proje yönetimi modülü. Proje verisi plana yazılmaz. Modül deposunda durur.
 * Asıl örnek ayakkabı şirketidir. Örnekte strateji onaylı değildir.
 * Bu yüzden test örneğe onaylı bir strateji yazar. Veri sözleşmenin okuduğu alanlardır.
 */

const STORAGE_KEY = 'decisionactplan-v1'
const ROLLUP_KEY = 'decisionactplan-rollups-v1'
const PLAN_ID = 'ornek-ayakkabi-sirketi'
const PLAN_NAME = 'Örnek: Ayakkabı şirketi'
const HAMLE = 'Amazon ABD satışını büyüt'
const KANIT = process.env.PROJE_KANIT_DIR

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
  plan.steps['U32'] = done({ now: [{ _id: 'u-foto', action: 'Amazon ürün fotoğraflarını yenile', owner: 'Dijital ekip', dueDate: '2099-01-15' }] })`

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

const storedPlan = (page: Page) => page.evaluate(([key, id]) => JSON.stringify(JSON.parse(localStorage.getItem(key) ?? '{}').state?.plans?.[id] ?? null), [STORAGE_KEY, PLAN_ID])

const moduleKeys = (page: Page, prefix: string) => page.evaluate((p) => new Promise<string[]>((resolve, reject) => {
  const req = indexedDB.open('decisionactplan-modules')
  req.onerror = () => reject(req.error)
  req.onsuccess = () => {
    const db = req.result
    if (!db.objectStoreNames.contains('kv')) return resolve([])
    const all = db.transaction('kv').objectStore('kv').getAllKeys()
    all.onsuccess = () => resolve(all.result.map(String).filter((k) => k.startsWith(p)))
    all.onerror = () => reject(all.error)
  }
}), prefix)

async function gotoProjects(page: Page) {
  await page.goto('/#/projeler')
  await expect(page).toHaveURL(/#\/projeler$/)
  await ready(page)
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText('Projeler')
}

async function openProjectFromMove(page: Page, touch: boolean) {
  await gotoProjects(page)
  await activate(page, page.getByRole('button', { name: `Bu hamleden proje aç: ${HAMLE}` }), touch)
  await expect(page).toHaveURL(/#\/projeler\/[^/?]+$/)
  await ready(page)
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText(HAMLE)
}

async function addTask(page: Page, title: string, how: 'enter' | 'button', touch: boolean) {
  const input = page.getByLabel('Yeni iş', { exact: true })
  await input.fill(title)
  if (how === 'enter') await input.press('Enter')
  else await activate(page, page.getByRole('button', { name: 'İş ekle' }), touch)
  await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible()
  await expect(input).toHaveValue('')
}

const statusBox = (page: Page, title: string) => page.getByRole('combobox', { name: `Durum: ${title}` })
/** Durum düğmesinin görünen kutusu. Seçili durum bu kutuda yazılıdır. */
const statusRoot = (page: Page, title: string) => page.locator('.pj-durum-secici').filter({ has: statusBox(page, title) })
const statusText = (page: Page, title: string) => statusRoot(page, title).locator('.ant-select-content, .ant-select-selection-item').first()

async function noPageOverflow(page: Page, label: string) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  expect(r.sw, `Sayfa yatay taşmamalı: ${label}`).toBeLessThanOrEqual(r.iw + 1)
}

/** Görünen her düğme, bağlantı ve seçici en az 44 × 44 piksel olmalı. */
async function targets44(page: Page, label: string) {
  const small = await page.locator('main').evaluate((main) => {
    const sel = 'button, a[href], .ant-select, .ant-segmented-item, input:not([type="hidden"]):not([type="search"]), textarea'
    /* Boyutsuz öğe görünmez. Örneğin seçim kutusunun gizli radyo düğmesi. */
    return [...main.querySelectorAll(sel)].filter((e) => {
      const b = e.getBoundingClientRect()
      return b.width > 0 && b.height > 0 && !e.parentElement?.closest('.pj-durum-secici')
    }).map((e) => {
      const b = e.getBoundingClientRect()
      return { t: (e.getAttribute('aria-label') ?? e.textContent ?? '').trim().slice(0, 60), w: Math.round(b.width), h: Math.round(b.height) }
    }).filter((b) => b.w < 44 || b.h < 44)
  })
  expect(small, `${label}: dokunma alanı en az 44 piksel olmalı`).toEqual([])
}

/** Yazı en az 14 piksel. Ana alanda en çok bir dolu düğme var. */
async function designRules(page: Page, label: string) {
  const r = await page.locator('main').evaluate((main) => {
    const visible = (e: Element) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'
    const small = [...main.querySelectorAll('*')]
      .filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()))
      .filter((e) => visible(e) && Number.parseFloat(getComputedStyle(e).fontSize) < 14)
      .map((e) => `${e.tagName}.${(e as HTMLElement).className} ${getComputedStyle(e).fontSize}`)
    const filled = [...main.querySelectorAll('.ant-btn-primary:not(.ant-btn-text):not(.ant-btn-link)')].filter(visible).length
    return { small, filled }
  })
  expect(r.small, `${label}: yazı en az 14 piksel olmalı`).toEqual([])
  expect(r.filled, `${label}: en çok bir dolu düğme`).toBeLessThanOrEqual(1)
}

async function shot(page: Page, name: string) {
  if (!KANIT) return
  mkdirSync(KANIT, { recursive: true })
  await page.screenshot({ path: join(KANIT, `${name}.png`), fullPage: true })
}

test('strateji onaylı değilken ekran nedenini söyler', async ({ page, hasTouch }) => {
  await openShoeDemo(page, hasTouch)
  await gotoProjects(page)
  await expect(page.getByRole('main')).toContainText('Projeler burada görünecek.')
  await expect(page.getByRole('main')).toContainText('Önce strateji belgesini onaylayın.')
  await expect(page.getByRole('button', { name: /Bu hamleden proje aç/ })).toHaveCount(0)
  await noPageOverflow(page, 'onaysız')
})

test('ana hamleden proje açılır, iş eklenir, durum klavyeyle ve dokunarak değişir, plan değişmez', async ({ page, hasTouch }, info) => {
  await openShoeDemo(page, hasTouch)
  await approveStrategy(page)
  await gotoProjects(page)
  await expect(page.getByRole('main')).toContainText('Henüz proje yok.')
  await expect(page.getByRole('main')).toContainText('Amazon ürün fotoğraflarını yenile')
  await designRules(page, 'liste boş')
  await targets44(page, 'liste boş')
  await shot(page, `${info.project.name}-projeler-bos`)
  const before = await storedPlan(page)

  await openProjectFromMove(page, hasTouch)
  await expect(page.getByRole('main')).toContainText(`Bu proje şu ana hamleye bağlı: ${HAMLE}`)
  await addTask(page, 'Ürün fotoğraflarını yenileyin', 'enter', hasTouch)
  await addTask(page, 'İlan metnini İngilizce yazın', 'button', hasTouch)
  await expect(page.getByRole('status').filter({ hasText: 'işi eklendi' })).toContainText('"İlan metnini İngilizce yazın" işi eklendi.')

  /* Klavye: odak durum düğmesine gelir. Aşağı ok listeyi açar ve sonraki durumu seçer. Enter kaydeder. */
  const first = statusBox(page, 'Ürün fotoğraflarını yenileyin')
  await expect(statusText(page, 'Ürün fotoğraflarını yenileyin')).toHaveText('Durum: Yapılacak')
  await first.focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.locator('.pj-durum-popup').filter({ visible: true })).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(statusText(page, 'Ürün fotoğraflarını yenileyin')).toHaveText('Durum: Yapılıyor')
  await expect(page.getByRole('status').filter({ hasText: 'durumu' })).toContainText('"Yapılıyor" oldu.')

  /* Seçimden sonra liste kapanır. */
  await expect(page.locator('.pj-durum-popup').filter({ visible: true })).toHaveCount(0)

  /* Dokunma ya da fare: düğmeye basılır. Açılan listeden "Bitti" seçilir. */
  await activate(page, statusRoot(page, 'İlan metnini İngilizce yazın'), hasTouch)
  const option = page.locator('.pj-durum-popup .ant-select-item-option[title="Bitti"]').filter({ visible: true })
  await expect(option).toBeVisible()
  /* Liste açılırken büyür. Bu yüzden ölçüm açılış bitene kadar beklenir. */
  await expect.poll(async () => (await option.boundingBox())?.height ?? 0, { message: 'Listedeki durum en az 44 piksel olmalı' }).toBeGreaterThanOrEqual(44)
  await activate(page, option, hasTouch)
  await expect(statusText(page, 'İlan metnini İngilizce yazın')).toHaveText('Durum: Bitti')
  await expect(page.locator('.pj-proje-ozet')).toContainText('1 açık, 1 bitti')
  await designRules(page, 'proje listesi')
  await targets44(page, 'proje listesi')
  await noPageOverflow(page, 'proje listesi')
  await shot(page, `${info.project.name}-proje-liste`)

  /* Kanıt taslağı plana yazılmaz. Taslak ayrı anahtarda durur. */
  await activate(page, page.getByRole('button', { name: 'Kanıt taslağı hazırla' }), hasTouch)
  await expect(page.getByRole('status').filter({ hasText: 'Kanıt taslağı' })).toContainText('Plan değişmedi.')
  const drafts = await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('decisionactplan-drafts-v1') ?? '{}')))
  expect(drafts).toContain(`Proje: ${HAMLE}.`)
  expect(drafts).toContain('Projede 2 iş var. 1 iş bitti. 1 iş açık.')

  /* Proje ve iş verisi planı değiştirmez. Sürüm, kararlar ve eskime işaretleri aynı kalır. */
  expect(await storedPlan(page)).toBe(before)

  /* Özet küçük dosyaya yazılır. Çekirdek bu özeti sonra rozet için okur. */
  const rollup = await page.evaluate(([key, id]) => JSON.parse(localStorage.getItem(key) ?? '{}').data?.proje?.[id], [ROLLUP_KEY, PLAN_ID])
  expect(rollup).toMatchObject({ projeSayisi: 1, acik: 1, biten: 1, hamleler: { 'm-amazon': { proje: 1, acik: 1, biten: 1 } } })

  /* Geciken iş metin ve ikonla görünür. */
  await activate(page, page.getByRole('link', { name: 'Ürün fotoğraflarını yenileyin', exact: true }), hasTouch)
  await expect(page).toHaveURL(/#\/projeler\/[^/]+\/is\/[^/]+$/)
  await ready(page)
  await page.getByLabel('Sorumlu kişi').fill('Dijital ekip')
  await page.getByLabel('Son tarih', { exact: true }).fill('2026-01-05')
  await expect(page.getByText('Seçilen gün: 5 Ocak 2026 Pazartesi.')).toBeVisible()
  await activate(page, page.getByRole('button', { name: 'Kaydet' }), hasTouch)
  await expect(page.locator('.pj-is-uyari')).toContainText('Gecikti')
  await expect(page.locator('.pj-is-uyari svg')).toHaveCount(1)
  await designRules(page, 'iş ekranı')
  await targets44(page, 'iş ekranı')
  await noPageOverflow(page, 'iş ekranı')
  await shot(page, `${info.project.name}-is`)
  await activate(page, page.getByRole('button', { name: 'Projeye dön' }), hasTouch)
  const card = page.locator('.pj-is-karti').filter({ hasText: 'Ürün fotoğraflarını yenileyin' })
  await expect(card).toContainText('Gecikti')
  await expect(card).toContainText('Son tarih: 5 Ocak 2026 Pazartesi')
  await expect(card).toContainText('Sorumlu: Dijital ekip')

  /* Yeniden yüklenince veri kalır. */
  await page.reload()
  await ready(page)
  await expect(statusText(page, 'Ürün fotoğraflarını yenileyin')).toHaveText('Durum: Yapılıyor')
  await expect(statusText(page, 'İlan metnini İngilizce yazın')).toHaveText('Durum: Bitti')
  expect(await storedPlan(page)).toBe(before)

  /* Projeler listesi hamleye bağlı projeyi gösterir. */
  await gotoProjects(page)
  await expect(page.getByRole('link', { name: HAMLE, exact: true })).toBeVisible()
  await expect(page.getByRole('main')).toContainText('Bu hamleye bağlı 1 proje var.')
  await expect(page.locator('.pj-projeler-kart')).toContainText('1 işin son tarihi geçti.')
  await shot(page, `${info.project.name}-projeler`)
})

test('pano beş sütundur, kendi kutusunda kayar ve sayfa kaymaz', async ({ page, hasTouch }, info) => {
  await openShoeDemo(page, hasTouch)
  await approveStrategy(page)
  await openProjectFromMove(page, hasTouch)
  await addTask(page, 'Ürün fotoğraflarını yenileyin', 'enter', hasTouch)
  /* Görünüm adreste durur. Pano, liste ve yeniden pano seçilir. Seçili değere basmak adresi değiştirmez. */
  const segment = (name: string) => page.getByRole('radio', { name }).locator('xpath=ancestor::label[1]')
  await activate(page, segment('Pano'), hasTouch)
  await activate(page, segment('Liste'), hasTouch)
  await expect(page).toHaveURL(/gorunum=liste/)
  await expect(page.getByRole('list', { name: 'İş listesi' })).toBeVisible()
  await activate(page, segment('Pano'), hasTouch)
  await expect(page).toHaveURL(/gorunum=pano/)
  const board = page.getByRole('region', { name: /İş panosu/ })
  await expect(board).toBeVisible()
  await expect(board.getByRole('heading', { level: 3 })).toHaveText(['Yapılacak 1 iş', 'Yapılıyor 0 iş', 'Takıldı 0 iş', 'Bitti 0 iş', 'İptal 0 iş'])
  await noPageOverflow(page, 'pano')
  await designRules(page, 'pano')
  const scroll = await board.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth, ox: getComputedStyle(el).overflowX }))
  expect(scroll.ox).toBe('auto')
  if (info.project.name.includes('320')) expect(scroll.sw, '320 pikselde pano yana kaymalı').toBeGreaterThan(scroll.cw)

  /* Pano klavyeyle de kayar. Kutu odak alır. Sağ ok kutuyu kaydırır. */
  if (scroll.sw > scroll.cw) {
    await board.focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => board.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
    await noPageOverflow(page, 'pano kaydırıldı')
  }
  await board.evaluate((el) => { el.scrollLeft = 0 })
  await targets44(page, 'pano')
  await shot(page, `${info.project.name}-pano`)

  /* Panoda durum değişince kart doğru sütuna geçer. */
  const box = statusBox(page, 'Ürün fotoğraflarını yenileyin')
  await box.focus()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(board.locator('.pj-pano-sutun').nth(2)).toContainText('Ürün fotoğraflarını yenileyin')
  await expect(board.getByRole('heading', { level: 3 }).nth(2)).toHaveText('Takıldı 1 iş')
})

test('başka sekmedeki değişiklik listeyi yeniler', async ({ page, context, hasTouch }) => {
  await openShoeDemo(page, hasTouch)
  await approveStrategy(page)
  await openProjectFromMove(page, hasTouch)
  const url = page.url()
  const other = await context.newPage()
  await other.goto(url)
  await ready(other)
  await expect(other.getByRole('main')).toContainText('Henüz iş yok.')
  await addTask(page, 'Fiyatı gözden geçirin', 'enter', hasTouch)
  await expect(other.getByRole('link', { name: 'Fiyatı gözden geçirin', exact: true })).toBeVisible()
  await other.close()
})

test('silme onay ister, dışa ve içe aktarma projeleri korur, plan silinince projeler silinir', async ({ page, hasTouch }, info) => {
  await openShoeDemo(page, hasTouch)
  await approveStrategy(page)
  await openProjectFromMove(page, hasTouch)
  await addTask(page, 'Ürün fotoğraflarını yenileyin', 'enter', hasTouch)
  await addTask(page, 'Silinecek iş', 'enter', hasTouch)

  /* İş silme onay ister. Vazgeçince iş kalır. */
  await activate(page, page.getByRole('link', { name: 'Silinecek iş', exact: true }), hasTouch)
  await ready(page)
  await activate(page, page.getByRole('button', { name: 'İşi sil' }), hasTouch)
  await expect(page.getByText('İş silinsin mi?')).toBeVisible()
  await activate(page, page.getByRole('button', { name: 'Vazgeç' }), hasTouch)
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText('Silinecek iş')
  await activate(page, page.getByRole('button', { name: 'İşi sil' }), hasTouch)
  await activate(page, page.locator('.ant-popconfirm').getByRole('button', { name: 'Sil' }), hasTouch)
  await expect(page).toHaveURL(/#\/projeler\/[^/]+$/)
  await expect(page.getByRole('link', { name: 'Silinecek iş', exact: true })).toHaveCount(0)
  await expect.poll(() => moduleKeys(page, `proje/${PLAN_ID}/`)).toHaveLength(2)

  /* Dışa aktarma paket dosyası yazar. Paket proje verisini taşır. */
  await page.goto('/#/')
  await ready(page)
  const downloading = page.waitForEvent('download')
  await activate(page, page.getByRole('button', { name: `JSON indir: ${PLAN_NAME}` }), hasTouch)
  const file = info.outputPath('plan.json')
  await (await downloading).saveAs(file)
  const bundle = JSON.parse(readFileSync(file, 'utf8'))
  expect(bundle.kind).toBe('decisionactplan-bundle')
  expect(bundle.modules.proje.entries.map((e: [string, unknown]) => e[0].split('/')[0]).sort()).toEqual(['is', 'proje'])

  /* Plan silinince proje verisi ve özet silinir. */
  await activate(page, page.getByRole('button', { name: `Sil: ${PLAN_NAME}` }), hasTouch)
  await activate(page, page.locator('.ant-popconfirm').getByRole('button', { name: 'Sil' }), hasTouch)
  await expect(page.getByRole('button', { name: `Sil: ${PLAN_NAME}` })).toHaveCount(0)
  await expect.poll(() => moduleKeys(page, `proje/${PLAN_ID}/`)).toEqual([])
  expect(await page.evaluate(([key, id]) => JSON.parse(localStorage.getItem(key) ?? '{}').data?.proje?.[id], [ROLLUP_KEY, PLAN_ID])).toBeUndefined()

  /* İçe alınca projeler ve işler geri gelir. */
  await page.locator('input[type="file"][aria-label="JSON dosyası seç"]').setInputFiles(file)
  await expect(page.getByText('Plan içe alındı.')).toBeVisible()
  await expect.poll(() => moduleKeys(page, `proje/${PLAN_ID}/`)).toHaveLength(2)
  await gotoProjects(page)
  await activate(page, page.getByRole('link', { name: HAMLE, exact: true }), hasTouch)
  await ready(page)
  await expect(page.getByRole('link', { name: 'Ürün fotoğraflarını yenileyin', exact: true })).toBeVisible()

  /* Proje silme onay ister. Silinince listede proje kalmaz. */
  await activate(page, page.getByRole('button', { name: 'Projeyi sil' }), hasTouch)
  await expect(page.getByText('Projenin bütün işleri de silinir. Bu işlem geri alınamaz.')).toBeVisible()
  await activate(page, page.locator('.ant-popconfirm').getByRole('button', { name: 'Sil' }), hasTouch)
  await expect(page).toHaveURL(/#\/projeler$/)
  await expect(page.getByRole('main')).toContainText('Henüz proje yok.')
  await expect.poll(() => moduleKeys(page, `proje/${PLAN_ID}/`)).toEqual([])
})

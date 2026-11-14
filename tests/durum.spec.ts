import { expect, test, type Page } from '@playwright/test'

/**
 * Durum özeti ve çapraz sorular (Adım 18) ile devir raporundaki karşılığı.
 * Kural docs/karar-kitabi-firsatlari-plani.md dosyasının Faz C bölümündedir.
 * Yazılım listeyi toplar ve soruyu sorar. Yol önermez ve yol seçmez.
 */

const STORAGE_KEY = 'decisionactplan-v1'
const TITLES = ['Güçlü yönler', 'Zayıf yönler', 'Fırsatlar', 'Tehditler']
const QUESTIONS = [
  'Hangi güçlü yönle hangi fırsatı yakalarsınız?',
  'Hangi zayıf yön bir fırsatı kaçırtıyor? Bu zayıf yönü nasıl kapatırsınız?',
  'Hangi güçlü yön bir tehdidi önler?',
  'Zayıf yön ile tehdit nerede üst üste biniyor? Oradan nasıl kaçınırsınız?',
]

async function openDemo(page: Page) {
  await page.goto('/')
  await page.getByText('Örnek planı aç').first().click()
  await expect(page).toHaveURL(/#\/ozet/)
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

test('Adım 18 dört listeyi önceki adımlardan toplar', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/adim/18')
  const blocks = page.locator('.durum-block')
  await expect(blocks).toHaveCount(4)
  await expect(page.locator('.durum-title > span:first-of-type')).toHaveText(TITLES)
  await expect(page.locator('.durum-count')).toHaveText(['2', '2', '2', '4'])
  await expect(blocks.nth(0)).toContainText('Durağa 40 metre uzaklık')
  await expect(blocks.nth(0)).not.toContainText('Güler yüzlü hizmet')
  await expect(blocks.nth(1)).toContainText('Ön muhasebe ve fatura')
  await expect(blocks.nth(2)).toContainText('Evden çalışan sayısı artıyor.')
  await expect(blocks.nth(3)).toContainText('Kahve çekirdeği fiyatı yılda yüzde 40 arttı.')
  // Özet salt okunurdur. İçinde giriş alanı ve düğme yoktur.
  await expect(page.locator('.durum input, .durum textarea, .durum button')).toHaveCount(0)

  // Telefonda listeler alt alta, geniş ekranda ikişerli durur.
  const boxes = await blocks.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((b) => ({ x: Math.round(b.x), y: Math.round(b.y) })))
  const wide = (page.viewportSize()?.width ?? 0) >= 768
  if (wide) expect(boxes[1].y, 'geniş ekranda ilk iki liste yan yana').toBe(boxes[0].y)
  else expect(boxes.every((b) => b.x === boxes[0].x), 'telefonda listeler alt alta').toBe(true)

  await page.locator('.durum').scrollIntoViewIfNeeded()
  await designRules(page, '.durum', 'durum özeti')

  // Madde kaynak adımına götürür.
  await blocks.nth(0).getByRole('link').first().click()
  await expect(page).toHaveURL(/#\/karar\/3\/adim\/12/)
})

test('boş planda her liste doldurulacak adımı gösterir', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Yeni plan' }).first().click()
  await page.getByPlaceholder('Örneğin Mahalle kafesi').fill('Boş deneme')
  await page.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page).toHaveURL(/#\/baslangic/)
  await page.goto('/#/karar/5/adim/18')
  await expect(page.locator('.durum-count')).toHaveText(['0', '0', '0', '0'])
  await expect(page.locator('.durum-empty')).toHaveCount(4)
  await expect(page.locator('.durum-empty').nth(0)).toContainText("Adım 12'de güçlerinizi yazın ve dört soruyla sınayın.")
  await designRules(page, '.durum', 'boş durum özeti')
  await page.locator('.durum-empty').nth(2).getByRole('link').click()
  await expect(page).toHaveURL(/#\/karar\/3\/adim\/09/)
})

test('sınıflanmamış dış etken için uyarı görünür', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `delete plan.steps['04'].values.factorNotes[0].effect`)
  await page.goto('/#/karar/5/adim/18')
  await expect(page.locator('.durum-hint')).toContainText('1 dış etken henüz sınıflanmadı.')
  await expect(page.locator('.durum-count')).toHaveText(['2', '2', '2', '3'])
})

test('dört çapraz soru isteğe bağlıdır ve yol kaynağı seçilir', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/adim/18')
  const card = page.locator('.form-section').filter({ has: page.locator('.ant-card-head-title', { hasText: 'Çapraz sorular' }) })
  await expect(card.locator('textarea')).toHaveCount(4)
  for (const q of QUESTIONS) await expect(card.getByText(q, { exact: true })).toBeVisible()
  await expect(card.locator('textarea').first()).toHaveValue('Barista deneyimi ve durağa yakınlıkla sabah 7 boşluğunu doldururuz.')

  // Çapraz sorular boşken de adım tamamlanır. Kapı 5'in ölçütü değişmez.
  await patchPlan(page, `for (const k of ['crossSO','crossWO','crossST','crossWT']) plan.steps['18'].values[k] = ''`)
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page.locator('.ant-message')).toContainText('Adım tamamlandı.')
})

test('devir raporu yolun hangi sorudan çıktığını gösterir ama yol seçmez', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/devir')
  const block = page.locator('.devir-block').filter({ hasText: 'Yollar hangi sorulardan çıktı?' })
  await expect(block).toContainText(QUESTIONS[0])
  await expect(block).toContainText('Durağa yakınlık, zincir kafenin indirimine karşı bizi korur.')
  await expect(page.getByText('Hangi sorudan çıktı?').first()).toBeVisible()
  await expect(page.getByText('Güçlü yön ve fırsat').first()).toBeVisible()
  await expect(page.getByText('Seçilen yol')).toHaveCount(0)
  await designRules(page, 'main', 'devir çapraz sorular')
})

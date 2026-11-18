import { expect, test, type Page } from '@playwright/test'

/**
 * Dört soruluk güç süzgeci (Adım 12), Adım 16'daki güç listesi ve teslim raporundaki "Güçlü yönler" grubu.
 * Kural docs/karar-kitabi-firsatlari-plani.md dosyasının Faz B bölümündedir.
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

const section = (page: Page) => page.locator('.form-section').filter({ has: page.locator('.ant-card-head-title', { hasText: 'Güçlü yönler' }) })

test('Adım 12 her gücü dört soruyla sınar ve sonucu yazar', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/3/adim/12')
  const card = section(page)
  await expect(card).toBeVisible()
  for (const q of ['İşe yarıyor mu?', 'Rakiplerin çoğunda yok mu?', 'Rakip zor mu kopyalar?', 'Kullanacak düzeniniz var mı?', 'Dayanak']) {
    await expect(card.getByText(q, { exact: true }).first(), q).toBeVisible()
  }
  const result = card.locator('.calc-box')
  await expect(result).toContainText('3 güçten 2 tanesi avantaj')
  await expect(result).toContainText('8 yıllık barista deneyimi: Kullanılmayan avantaj.')
  await expect(result).toContainText('Durağa 40 metre uzaklık: Geçici avantaj.')
  await expect(result).toContainText('Güler yüzlü hizmet: Eşitlik. Rakiplerin çoğunda da var. Fark yaratmaz.')
  await card.scrollIntoViewIfNeeded()
  await designRules(page, '.form-section', 'adım 12 güçlü yönler')
})

test('nadir denen güç dayanaksızsa adım tamamlanmaz', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `plan.steps['12'].values.strengths[1].basis = ''`)
  await page.goto('/#/karar/3/adim/12')
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page.locator('.ant-message')).toContainText('"Durağa 40 metre uzaklık" için dayanak yazın.')
  await expect(page).toHaveURL(/#\/karar\/3\/adim\/12/)
})

test('ağır yatırımda güç yazılmadan Adım 12 tamamlanmaz, küçük işte tamamlanır', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `plan.steps['12'].values.strengths = []`)
  await page.goto('/#/karar/3/adim/12')
  await expect(section(page).locator('.calc-box')).toContainText('Bir güç yazınca sonuç burada görünür.')
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page.locator('.ant-message')).toContainText('Ağır yatırımda en az bir güçlü yön yazın.')
  await expect(page).toHaveURL(/#\/karar\/3\/adim\/12/)

  await patchPlan(page, `plan.profile.smallReversible = true`)
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page.locator('.ant-message')).toContainText('Adım tamamlandı.')
})

test('Adım 16 sınanmış güçleri gösterir ama kutuyu kendisi doldurmaz', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `plan.steps['16'].values.unfairAdvantage = ''`)
  await page.goto('/#/karar/5/adim/16')
  const hint = page.locator('.calc-box').filter({ hasText: "Adım 12'de sınadığınız güçler" })
  await expect(hint).toContainText('2 avantaj')
  await expect(hint).toContainText('Güler yüzlü hizmet: Eşitlik.')
  await expect(hint.getByRole('button')).toHaveCount(0)
  await expect(page.getByLabel('Haksız avantaj')).toHaveValue('')
})

test('teslim raporu güçleri dayanağıyla gösterir', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/devir')
  const group = page.locator('.devir-group, section').filter({ hasText: 'Hangi güce yaslanırız? Hangi güç fark yaratmaz?' }).last()
  await expect(group).toContainText('Durağa 40 metre uzaklık: Geçici avantaj.')
  await expect(group).toContainText('Sabah sayımı.')
  await designRules(page, 'main', 'devir güçlü yönler')
})

import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import { STORAGE_KEY } from '../../src/engine/sync'
import { activate, openDemo, ready, saveEvidence } from './audit'

const phoneWidths = [320, 360, 375, 390]
const workPath = '/#/karar/1/adim/02'

test.beforeEach(async ({ page, hasTouch }) => {
  const viewport = page.viewportSize()
  test.skip(!viewport || !phoneWidths.includes(viewport.width) || viewport.height <= viewport.width,
    'Bu test yalnız dört dikey telefon görünümünde çalışır.')
  expect(hasTouch, 'Telefon görünümü dokunmayı desteklemeli.').toBe(true)
  await openDemo(page, hasTouch)
  await page.goto(workPath)
  await ready(page)
})

test.afterEach(async ({ page }, info) => {
  if (info.status === 'skipped') return
  await saveEvidence(page, info, {
    scope: 'Dikeyden yataya ve yeniden dikeye dönüş',
    method: 'setViewportSize',
    physicalDevice: false,
    status: info.status,
    reloadBoundary: 'Kayıtlı form değeri korunur. Gönderilmemiş panel metni kalıcı değildir.',
  }, info.errors.map((error) => ({
    rule: 'durum-koruma',
    selector: '#a02-successSentence veya #atlama-nedeni',
    measured: error.message ?? 'Test tamamlanamadı.',
    expected: 'Test adımındaki değer, odak ve panel koşulları sağlanmalı.',
    owner: 'İş 4',
  })))
})

async function checkRotation(page: Page, info: TestInfo, field: Locator, value: string, panel?: Locator) {
  const portrait = page.viewportSize()
  if (!portrait) throw new Error('Dikey görünümün boyutu bulunamadı.')
  const stages = [
    { name: 'İlk dikey görünüm', viewport: portrait },
    { name: 'Yatay görünüm', viewport: { width: portrait.height, height: portrait.width } },
    { name: 'Yeniden dikey görünüm', viewport: portrait },
  ]

  for (const [index, stage] of stages.entries()) {
    await test.step(stage.name, async () => {
      // Dönüşten sonra alanı yeniden doldurmak veya odaklamak hatayı gizler.
      if (index > 0) {
        await page.setViewportSize(stage.viewport)
        await ready(page)
      }
      await expect.soft(page).toHaveURL(/#\/karar\/1\/adim\/02$/)
      await expect.soft(field, 'Metin alanı görünür kalmalı.').toBeVisible()
      await expect.soft(field, 'Yazılan metin korunmalı.').toHaveValue(value)
      await expect.soft(field, 'Odak aynı metin alanında kalmalı.').toBeFocused()
      if (panel) await expect.soft(panel, 'Açık panel kapanmamalı.').toBeVisible()
      await info.attach(stage.name, { body: await page.screenshot(), contentType: 'image/png' })
    })
  }
}

async function openSkipPanel(page: Page, touch: boolean) {
  await activate(page, page.getByRole('button', { name: 'Daha fazla', exact: true }), touch)
  await activate(page, page.getByRole('menuitem', { name: 'Bu adımı atla', exact: true }), touch)
  const panel = page.getByRole('dialog', { name: 'Bu adımı atla', exact: true })
  await expect(panel).toBeVisible()
  return panel
}

test('Telefon dönünce form değeri ve odak korunur', async ({ page, hasTouch }, info) => {
  const field = page.getByRole('textbox', { name: 'Başarı cümlesi', exact: false })
  const value = '12 ay içinde ödeyen 37 müşteriye ulaşacağım.'
  await activate(page, field, hasTouch)
  await field.fill(value)
  await expect(field).toHaveValue(value)
  await expect(field).toBeFocused()

  await checkRotation(page, info, field, value)

  await test.step('Kayıt tamamlandıktan sonra sayfa yenilenir', async () => {
    // Görünür kayıt mesajı önceki yazmayı gösterebilir. Alanın gerçek kaydını bekle.
    await expect.poll(() => page.evaluate((key) => {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      const saved = JSON.parse(raw) as {
        state?: {
          currentId?: string
          plans?: Record<string, { steps?: Record<string, { values?: Record<string, unknown> }> }>
        }
      }
      const state = saved.state
      return state?.currentId ? state.plans?.[state.currentId]?.steps?.['02']?.values?.successSentence : null
    }, STORAGE_KEY), { message: 'Başarı cümlesi tarayıcıya kaydedilmeli.' }).toBe(value)

    await page.reload()
    await ready(page)
    await expect(field).toHaveValue(value)
    // Yenilemeden sonra odağın geri gelmesi dönüş kabulünün parçası değildir.
  })
})

test('Telefon dönünce açık panel, metin ve odak korunur', async ({ page, hasTouch }, info) => {
  const panel = await openSkipPanel(page, hasTouch)
  const field = panel.getByRole('textbox', { name: 'Neden atlıyorsunuz? Neden rapora yazılır.', exact: true })
  const value = 'Eksik bilgiyi toplantıdan sonra tamamlayacağım.'
  await activate(page, field, hasTouch)
  await field.fill(value)
  await expect(field).toHaveValue(value)
  await expect(field).toBeFocused()

  await checkRotation(page, info, field, value, panel)

  await test.step('Yenileme gönderilmemiş panel metnini geri getirmez', async () => {
    // "Atla" düğmesine basılmadı. Bu metin plan kaydına eklenmedi.
    await page.reload()
    await ready(page)
    await expect(panel).toBeHidden()
    await openSkipPanel(page, hasTouch)
    await expect(field).toHaveValue('')
  })
})

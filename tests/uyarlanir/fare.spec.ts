import { expect, test } from '@playwright/test'
import { ready, saveEvidence } from './audit'

const choices = ['Tüketici', 'Hizmet', 'Düşük', 'Tek kurucu', 'Kendi param', 'Var olan pazar', 'Sıfırdan']

test('fareyle plan oluşturulur, Adım 00 tamamlanır ve seçimler korunur', async ({ page, hasTouch }, info) => {
  test.skip(hasTouch, 'Bu test fare içindir. Dokunma projelerinde çalışmaz.')

  await test.step('Fareyle yeni plan oluşturulur', async () => {
    await page.goto('/')
    await ready(page)
    const newPlan = page.getByRole('button', { name: 'Yeni plan', exact: true })
    await newPlan.hover()
    await expect(page.getByRole('dialog', { name: 'Yeni plan', exact: true })).not.toBeVisible()
    await newPlan.click()

    const dialog = page.getByRole('dialog', { name: 'Yeni plan', exact: true })
    await expect(dialog).toBeVisible()
    const create = dialog.getByRole('button', { name: 'Oluştur', exact: true })
    await expect(create).toBeDisabled()
    const name = dialog.getByPlaceholder('Örneğin Mahalle kafesi')
    await name.click()
    await name.fill('Fare deneme planı')
    await expect(create).toBeEnabled()
    await create.click()
    await expect(dialog).not.toBeVisible()
    await expect(page).toHaveURL(/#\/baslangic$/)
    await ready(page)
    await expect(page.getByRole('heading', { name: 'Bugün nereden başlayacaksınız?', exact: true })).toBeVisible()
  })

  await test.step('Başlangıç yolu tıklamayla seçilir', async () => {
    const start = page.getByRole('radiogroup', { name: 'Başlangıç yolu', exact: true })
      .getByRole('radio', { name: /Yeni bir fikrim var/ })
    const proceed = page.getByRole('button', { name: 'Devam et', exact: true })
    await expect(start).toHaveAttribute('aria-checked', 'false')
    await expect(proceed).toBeDisabled()
    await start.hover()
    await expect(start).toHaveAttribute('aria-checked', 'false')
    await expect(proceed).toBeDisabled()
    await start.click()
    await expect(start).toHaveAttribute('aria-checked', 'true')
    await expect(proceed).toBeEnabled()
    await proceed.click()
    await expect(page).toHaveURL(/#\/karar\/1\/adim\/00$/)
    await ready(page)
  })

  await test.step('Yedi seçenek fareyle seçilir ve adım tamamlanır', async () => {
    const main = page.getByRole('main')
    await expect(main.getByRole('heading', { level: 1 })).toContainText('Adım 00.')
    for (const label of choices) {
      const option = main.getByRole('radio', { name: label, exact: true })
      // Ant Design input'u gizler. Fare, input'u saran görünür etiketi kullanır.
      const optionLabel = main.locator('label').filter({
        has: page.getByRole('radio', { name: label, exact: true }),
      })
      await expect(optionLabel).toHaveCount(1)
      await expect(optionLabel).toBeVisible()
      await expect(option).toBeEnabled()
      await expect(option).not.toBeChecked()
      await optionLabel.hover()
      await expect(option).not.toBeChecked()
      await optionLabel.click()
      await expect(option).toBeChecked()
    }
    const complete = main.getByRole('button', { name: 'Adımı tamamla', exact: true })
    await expect(complete).toBeEnabled()
    await complete.hover()
    await complete.click()
    await expect(page).toHaveURL(/#\/karar\/1\/adim\/01$/)
    await ready(page)
    await expect(main.getByRole('heading', { level: 1 })).toContainText('Adım 01.')
    await expect(page.getByRole('status').filter({ hasText: /^Kaydedildi$/ })).toBeVisible()
  })

  await test.step('Sayfa yenilenince seçimler korunur', async () => {
    await page.reload()
    await ready(page)
    await expect(page).toHaveURL(/#\/karar\/1\/adim\/01$/)
    const main = page.getByRole('main')
    await expect(main.getByRole('heading', { level: 1 })).toContainText('Adım 01.')
    await main.getByRole('link', { name: 'Geri', exact: true }).click()
    await expect(page).toHaveURL(/#\/karar\/1\/adim\/00$/)
    await ready(page)
    await expect(main.getByRole('heading', { level: 1 })).toContainText('Adım 00.')
    for (const label of choices) {
      await expect(main.getByRole('radio', { name: label, exact: true })).toBeChecked()
    }
  })

  await saveEvidence(page, info, {
    input: 'mouse',
    journey: 'Plan oluşturma, başlangıç seçimi, Adım 00, Adım 01, yenileme ve geri dönüş',
    checks: { click: 'pass', hoverWithoutSelection: 'pass', completionNavigation: 'pass', persistedChoices: 'pass' },
    choices,
  }, [])
})

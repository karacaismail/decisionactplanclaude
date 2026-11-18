import { expect, test, type Locator } from '@playwright/test'
import { ready, saveEvidence } from './audit'

async function tap(target: Locator) {
  await target.scrollIntoViewIfNeeded()
  await target.tap()
}

test('Dokunmayla plan oluşturulur, Adım 00 tamamlanır ve Adım 01 açılır', async ({ page, hasTouch }, info) => {
  test.skip(!hasTouch, 'Bu test dokunma desteği açık projelerde çalışır.')

  await test.step('Yeni plan oluşturulur', async () => {
    await page.goto('/')
    await ready(page)
    await tap(page.getByRole('button', { name: 'Yeni plan', exact: true }))

    const dialog = page.getByRole('dialog', { name: 'Yeni plan', exact: true })
    await expect(dialog).toBeVisible()
    const create = dialog.getByRole('button', { name: 'Oluştur', exact: true })
    await expect(create).toBeDisabled()
    const name = dialog.getByRole('textbox', { name: 'Planın adı', exact: true })
    await tap(name)
    await name.fill('Dokunma deneme planı')
    await expect(name).toHaveValue('Dokunma deneme planı')
    await expect(create).toBeEnabled()
    await tap(create)

    await expect(page).toHaveURL(/#\/baslangic$/)
    await expect(dialog).not.toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: 'Bugün nereden başlayacaksınız?', exact: true })).toBeVisible()
  })

  await test.step('Yeni fikir yolu seçilir ve Adım 00 açılır', async () => {
    const entry = page.getByRole('radiogroup', { name: 'Başlangıç yolu', exact: true })
      .getByRole('radio', { name: /^Yeni bir fikrim var/ })
    await tap(entry)
    await expect(entry).toHaveAttribute('aria-checked', 'true')
    await tap(page.getByRole('button', { name: 'Devam et', exact: true }))

    await expect(page).toHaveURL(/#\/karar\/1\/adim\/00$/)
    await ready(page)
    await expect(page.getByRole('heading', { level: 1, name: /^Adım 00\./ })).toBeVisible()
  })

  await test.step('Yedi zorunlu cevap dokunmayla seçilir', async () => {
    const form = page.locator('main')
    for (const answer of ['Tüketici', 'Hizmet', 'Düşük', 'Tek kurucu', 'Kendi param', 'Var olan pazar', 'Sıfırdan']) {
      const label = form.locator('label').filter({
        has: page.getByRole('radio', { name: answer, exact: true }),
      })
      const option = label.getByRole('radio', { name: answer, exact: true })
      await tap(label)
      await expect(option).toBeChecked()
    }
  })

  await test.step('Adım 00 tamamlanır ve Adım 01 açılır', async () => {
    await tap(page.getByRole('button', { name: 'Adımı tamamla', exact: true }))
    await expect(page).toHaveURL(/#\/karar\/1\/adim\/01$/)
    await ready(page)
    await expect(page.getByRole('heading', { level: 1, name: /^Adım 01\. Kurucu niyeti ve çıkış yönü$/ })).toBeVisible()
  })

  await saveEvidence(page, info, {
    journey: 'Plan oluşturma ve Adım 00 tamamlama',
    input: 'touch',
    route: '/karar/1/adim/01',
    checks: { journey: 'pass' },
  }, [])
})

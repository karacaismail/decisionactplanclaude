import { expect, test, type Locator, type Page } from '@playwright/test'
import { installProbe, ready, saveEvidence, type Finding } from './audit'
import { auditFocus, type Audit } from './focus-audit'

async function tabTo(page: Page, target: Locator, key: string) {
  await expect(target).toHaveCount(1)
  for (let count = 0; count < 80; count++) {
    if (await target.evaluate((element) => element === document.activeElement)) return
    await page.keyboard.press(key)
  }
  await expect(target, 'Kontrole yalnız klavyeyle ulaşılmalı.').toBeFocused()
}

test('Klavye ile yeni plan oluşturulur ve Adım 00 tamamlanır', async ({ page, browserName }, info) => {
  const key = browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
  const findings: Finding[] = []
  const audit: Audit = { findings, samples: [], dialogName: 'not_run' }
  let complete = false
  try {
    await page.goto('/')
    await ready(page)
    await installProbe(page)
    await tabTo(page, page.getByRole('button', { name: 'Yeni plan', exact: true }), key)
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'Yeni plan', exact: true })
    await expect(dialog).toBeVisible()
    const name = dialog.getByRole('textbox', { name: 'Planın adı', exact: true })
    await tabTo(page, name, key)
    await auditFocus(page, info, audit, 'Plan adı alanı', 'İş 3')
    await page.keyboard.type('Klavye deneme plani')
    await expect(name).toHaveValue('Klavye deneme plani')
    await tabTo(page, dialog.getByRole('button', { name: 'Oluştur', exact: true }), key)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#\/baslangic$/)
    await ready(page)

    const entry = page.getByRole('radiogroup', { name: 'Başlangıç yolu' })
      .getByRole('radio', { name: /^Yeni bir fikrim var/ })
    await tabTo(page, entry, key)
    await auditFocus(page, info, audit, 'Başlangıç yolu', 'İş 4')
    await page.keyboard.press('Space')
    await expect(entry).toHaveAttribute('aria-checked', 'true')
    await tabTo(page, page.getByRole('button', { name: 'Devam et', exact: true }), key)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#\/karar\/1\/adim\/00$/)
    await ready(page)

    for (const answer of ['Tüketici', 'Hizmet', 'Düşük', 'Tek kurucu', 'Kendi param', 'Var olan pazar', 'Sıfırdan']) {
      const option = page.getByRole('main').getByRole('radio', { name: answer, exact: true })
      const group = option.locator('xpath=ancestor::*[@role="radiogroup"][1]')
      await tabTo(page, group.getByRole('radio').first(), key)
      const count = await group.getByRole('radio').count()
      for (let index = 0; index < count; index++) {
        if (await option.evaluate((element) => element === document.activeElement)) break
        await page.keyboard.press('ArrowRight')
      }
      await expect(option).toBeFocused()
      await auditFocus(page, info, audit, `Adım 00 seçeneği: ${answer}`, 'İş 4')
      await page.keyboard.press('Space')
      await expect(option).toBeChecked()
    }

    await tabTo(page, page.getByRole('button', { name: 'Adımı tamamla', exact: true }), key)
    await expect(page.locator('html')).toHaveAttribute('data-focus-mode', 'keyboard')
    await auditFocus(page, info, audit, 'Adımı tamamla düğmesi', 'İş 4')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#\/karar\/1\/adim\/01$/)
    await ready(page)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Adım 01.')
    await expect.poll(() => page.getByRole('status').evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('aria-label') || element.textContent?.trim()),
    )).toContain('Kaydedildi')
    await page.reload()
    await ready(page)
    await tabTo(page, page.getByRole('main').getByRole('link', { name: 'Geri', exact: true }), key)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#\/karar\/1\/adim\/00$/)
    await ready(page)
    for (const answer of ['Tüketici', 'Hizmet', 'Düşük', 'Tek kurucu', 'Kendi param', 'Var olan pazar', 'Sıfırdan']) {
      await expect(page.getByRole('main').getByRole('radio', { name: answer, exact: true })).toBeChecked()
    }
    complete = true
  } catch (error) {
    findings.push({ rule: 'klavye-akis', selector: 'main', measured: String(error), expected: 'Plan oluşturulur. Adım 00 cevapları yenilemeden sonra korunur.', owner: 'İş 4' })
    throw error
  } finally {
    await saveEvidence(page, info, {
      input: 'keyboard', tabKey: key, samples: audit.samples,
      checks: {
        journey: complete ? 'pass' : 'fail',
        focus: findings.some((finding) => finding.rule === 'klavye-odak') ? 'fail'
          : findings.some((finding) => finding.rule === 'klavye-olcum') || audit.samples.length === 0 ? 'not_run' : 'pass',
      },
    }, findings)
  }
})

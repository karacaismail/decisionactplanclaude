import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import { installProbe, ready, saveEvidence } from './audit'
import { auditFocus, type Audit } from './focus-audit'

test.use({ forcedColors: 'none' })

// WebKit, bağlantılara ve düğmelere Option+Tab ile ilerler.
function tabKey(browserName: string, backwards = false) {
  return `${browserName === 'webkit' ? 'Alt+' : ''}${backwards ? 'Shift+' : ''}Tab`
}

async function tabTo(page: Page, target: Locator, key: string, info: TestInfo, audit: Audit) {
  await expect(target).toBeVisible()
  for (let count = 0; count < 40; count++) {
    if (await target.evaluate((el) => el === document.activeElement)) return
    await page.keyboard.press(key)
    // Tarayıcı çubuğuna geçişte body odaklanabilir. Hedef yine tuşla bulunmalıdır.
    const hasControl = await page.evaluate(() => document.activeElement !== document.body)
    if (hasControl) await auditFocus(page, info, audit, `${key}, ${count + 1}. basış`)
  }
  await expect(target, 'Hedefe 40 Tab basışı içinde ulaşılmalı.').toBeFocused()
}

async function finish(page: Page, info: TestInfo, audit: Audit, journeyComplete: boolean, key: string) {
  await saveEvidence(page, info, {
    input: 'keyboard', tabKey: key, route: page.url(), samples: audit.samples,
    checks: {
      journey: journeyComplete ? 'pass' : 'fail', dialogName: audit.dialogName,
      measurement: audit.samples.length === 0 ? 'not_run' : audit.findings.some((finding) => finding.rule === 'klavye-olcum') ? 'fail' : 'pass',
      focus: audit.samples.length === 0 ? 'not_run'
        : audit.findings.some((finding) => finding.rule === 'klavye-odak') ? 'fail'
          : audit.findings.some((finding) => finding.rule === 'klavye-olcum') ? 'not_run' : 'pass',
    },
  }, audit.findings)
}

test('Tab ve Shift+Tab ile örnek plana ulaşılır, Enter planı açar', async ({ page, browserName }, info) => {
  const audit: Audit = { findings: [], samples: [], dialogName: 'not_run' }
  const key = tabKey(browserName)
  let journeyComplete = false
  try {
    await page.goto('/')
    await ready(page)
    await installProbe(page)
    const root = page.locator('html')
    await expect(root).not.toHaveAttribute('data-focus-mode', 'keyboard')
    for (const otherKey of ['ArrowDown', 'Escape', 'a']) {
      await page.keyboard.press(otherKey)
      await expect(root, `${otherKey} klavye odak modunu açmamalı.`).not.toHaveAttribute('data-focus-mode', 'keyboard')
    }
    const demo = page.getByRole('button', { name: 'Örnek planı aç', exact: true }).first()
    await tabTo(page, demo, key, info, audit)
    await expect(demo).toBeFocused()
    await page.keyboard.press(tabKey(browserName, true))
    await expect(demo).not.toBeFocused()
    await auditFocus(page, info, audit, 'Shift+Tab ile önceki kontrol')
    await page.keyboard.press(key)
    await expect(demo).toBeFocused()
    await auditFocus(page, info, audit, 'Tab ile örnek plana dönüş')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#\/ozet$/)
    await ready(page)
    journeyComplete = true
  } finally {
    await finish(page, info, audit, journeyComplete, key)
  }
})

test('Space aramayı açar, oklar seçimi taşır, Escape odağı geri verir', async ({ page, browserName }, info) => {
  const audit: Audit = { findings: [], samples: [], dialogName: 'not_run' }
  const key = tabKey(browserName)
  let journeyComplete = false
  try {
    await page.goto('/')
    await ready(page)
    await installProbe(page)
    const search = page.getByRole('button', { name: /^Ara\. Kısayol / })
    await tabTo(page, search, key, info, audit)
    await expect(search).toBeFocused()
    await page.keyboard.press('Space')
    const dialog = page.getByRole('dialog')
    const input = dialog.getByRole('combobox')
    await expect(dialog).toBeVisible()
    const errorsBeforeName = info.errors.length
    await expect.soft(dialog).toHaveAccessibleName('Komut paleti')
    audit.dialogName = info.errors.length > errorsBeforeName ? 'fail' : 'pass'
    if (audit.dialogName === 'fail') {
      const screenshot = info.outputPath('palet-adi.png')
      await page.screenshot({ path: screenshot })
      await info.attach('palet-adi', { path: screenshot, contentType: 'image/png' })
      audit.findings.push({
        rule: 'erisilebilir-ad', selector: '[role="dialog"]', measured: 'Pencerenin erişilebilir adı beklenen adla eşleşmiyor.',
        expected: 'Komut paleti', owner: 'İş 2', screenshot,
      })
    }
    await expect(input).toBeFocused()
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await auditFocus(page, info, audit, 'Arama alanının odağı')
    const options = dialog.getByRole('option')
    const firstId = await options.nth(0).getAttribute('id')
    const secondId = await options.nth(1).getAttribute('id')
    expect(firstId).toBeTruthy()
    expect(secondId).toBeTruthy()
    await expect(input).toHaveAttribute('aria-activedescendant', firstId!)
    await page.keyboard.press('ArrowDown')
    await expect(input).toBeFocused()
    await expect(input).toHaveAttribute('aria-activedescendant', secondId!)
    await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(options.nth(0)).toHaveAttribute('aria-selected', 'false')
    await auditFocus(page, info, audit, 'Aşağı ok ile ikinci sonuç')
    await page.keyboard.press('ArrowUp')
    await expect(input).toHaveAttribute('aria-activedescendant', firstId!)
    await expect(options.nth(0)).toHaveAttribute('aria-selected', 'true')
    await expect(options.nth(1)).toHaveAttribute('aria-selected', 'false')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(search).toBeFocused()
    await auditFocus(page, info, audit, 'Escape sonrası arama düğmesi')
    await page.keyboard.press('Space')
    await expect(input).toBeFocused()
    await page.keyboard.type('Karar Kitabı')
    await expect(input).toHaveValue('Karar Kitabı')
    await expect(options).toHaveCount(1)
    await expect(options.first()).toContainText('Karar Kitabı')
    await page.keyboard.press('Enter')
    await expect(dialog).toBeHidden()
    await expect(page).toHaveURL(/#\/yontemler$/)
    await ready(page)
    journeyComplete = true
  } finally {
    await finish(page, info, audit, journeyComplete, key)
  }
})

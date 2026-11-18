import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { activate, measurePage, ready, saveEvidence } from './audit'

async function auditOpenPanel(page: Page, info: TestInfo, panel: string) {
  await ready(page)
  const result = await measurePage(page)
  await saveEvidence(page, info, {
    route: '/',
    panel,
    state: 'open',
    checks: { overflow: 'run', typography: 'run' },
    counts: { text: result.textCount, targets: result.targetCount },
  }, result.findings)

  expect(result.textCount, 'Açık pencerede ölçülecek yazı bulunmalı.').toBeGreaterThan(0)
  expect.soft(result.findings.filter((finding) => finding.rule === 'yazi'),
    `${panel}: görünen yazılar en az 14 CSS px olmalı. Ayrıntılar olcum.json dosyasında.`).toEqual([])
  expect.soft(result.findings.filter((finding) => finding.rule === 'tas-ma'),
    `${panel}: sayfa yana taşmamalı. Ayrıntılar olcum.json dosyasında.`).toEqual([])
}

test('Yeni plan penceresinde yazılar okunur ve sayfa yana taşmaz', async ({ page, hasTouch }, info) => {
  await page.goto('/')
  await ready(page)
  await activate(page, page.getByRole('button', { name: 'Yeni plan', exact: true }), hasTouch)

  const dialog = page.getByRole('dialog', { name: 'Yeni plan', exact: true })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Planın adı', { exact: true })).toBeVisible()
  const name = dialog.getByPlaceholder('Örneğin Mahalle kafesi', { exact: true })
  await expect(name).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Oluştur', exact: true })).toBeDisabled()
  await expect(dialog.getByRole('button', { name: 'Vazgeç', exact: true })).toBeVisible()
  // Tıklama veya dokunma, alanın açılış hareketinin bitmesini de bekler.
  await activate(page, name, hasTouch)

  await auditOpenPanel(page, info, 'Yeni plan')
})

test('Komut paletinde yazılar okunur ve sayfa yana taşmaz', async ({ page, hasTouch }, info) => {
  await page.goto('/')
  await ready(page)
  await activate(page, page.getByRole('button', { name: /^Ara\. Kısayol / }), hasTouch)

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  // Eksik ad testi başarısız yapar. Yazı ve taşma ölçümü sürer.
  await expect.soft(dialog).toHaveAccessibleName('Komut paleti')
  const search = dialog.getByRole('combobox')
  await expect(search).toBeVisible()
  await expect(search).toHaveAttribute('aria-expanded', 'true')
  const results = dialog.getByRole('listbox', { name: 'Sonuçlar', exact: true })
  await expect(results).toBeVisible()
  await expect(results.getByRole('option').first()).toBeVisible()
  await expect(results.getByRole('option').first()).toContainText('Karar')
  await activate(page, search, hasTouch)

  await auditOpenPanel(page, info, 'Komut paleti')
})

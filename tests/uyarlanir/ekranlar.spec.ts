import { expect, test } from '@playwright/test'
import { auditRoutes, expectedHeading } from './routes'
import { measurePage, measureTargets, openDemo, ready, saveEvidence } from './audit'

// Başarısız rota ötekileri durdurmaz. Her rota bağımsız tarayıcı deposuyla açılır.
test.describe.configure({ mode: 'parallel' })
for (const route of auditRoutes) {
  test(`ekran ${route.path}`, async ({ page, hasTouch }, info) => {
    await openDemo(page, hasTouch)
    await page.goto(`/#${route.path}`)
    await expect(page).toHaveURL(new RegExp(`#${route.destination.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`))
    await ready(page)
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText(expectedHeading(route))
    const result = await measurePage(page)
    expect(result.textCount, 'Boş ekran yazı denetiminden geçemez.').toBeGreaterThan(0)
    expect(result.coarse, 'Dokunma yeteneği beklenen projeyle uyuşmalı.').toBe(hasTouch)
    result.findings.push(...await measureTargets(page, result.smallTargets.map((candidate) => candidate.selector)))
    await page.evaluate(() => window.scrollTo(0, 0))
    const state = (rule: string) => result.findings.some((finding) => finding.rule === rule) ? 'fail' : 'pass'
    await saveEvidence(page, info, {
      route,
      checks: { overflow: state('tas-ma'), typography: state('yazi'), touch: result.coarse ? state('dokunma') : 'not_applicable', canvasTypography: result.canvasCount ? 'not_run' : 'not_applicable' },
      counts: { text: result.textCount, targets: result.targetCount, canvas: result.canvasCount },
      touchCoverage: 'Görünen kontrol kutuları ve küçük kontrollerin ek basma alanları ölçüldü. Her noktanın erişimi kanıtlanmadı.',
    }, result.findings)
    expect(result.findings.length, `Ölçüm hataları olcum.json dosyasında: ${route.path}`).toBe(0)
  })
}

import { expect, test, type Page } from '@playwright/test'

/**
 * Hareket kabulü (UX turu 9). Açılış ve kapanış aynı eğri ve pozitif süreyle çalışır.
 * Anlamsal durum, örneğin aria-expanded, animasyon bitmeden güncellenir.
 */
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)'

async function openDemo(page: Page) {
  await page.goto('/')
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Kafe örneğini aç').first().click({ timeout: 2000 })
    await expect(page).toHaveURL(/#\/ozet/, { timeout: 2000 })
  }).toPass()
}

type Motion = { prop: string; easing: string; duration: number; running: boolean }

function drawerMotion(page: Page): Promise<Motion[]> {
  return page.evaluate(() => document.getAnimations()
    .filter((a) => a instanceof CSSTransition && (a.effect as KeyframeEffect).target instanceof Element
      && ((a.effect as KeyframeEffect).target as Element).matches('.shell-drawer .ant-drawer-content-wrapper, .shell-drawer .ant-drawer-mask'))
    .map((a) => {
      const t = a.effect!.getComputedTiming()
      return { prop: (a as CSSTransition).transitionProperty, easing: String(t.easing), duration: Number(t.duration), running: a.playState === 'running' }
    }))
}

test('menü çekmecesi iki yönde aynı eğri ve süreyle hareket eder', async ({ page }) => {
  await openDemo(page)
  const toggle = page.locator('.shell-menu-toggle').first()
  test.skip(!(await toggle.isVisible()), 'Bu genişlikte çekmece düğmesi yok')

  await toggle.click()
  // Anlamsal durum hemen güncellenir. Hareket o sırada sürer.
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  let opening: Motion[] = []
  await expect.poll(async () => (opening = await drawerMotion(page)).map((m) => m.prop).sort(), { intervals: [16] }).toEqual(['opacity', 'transform'])
  for (const m of opening) {
    expect(m.easing).toBe(EASE)
    expect(m.duration).toBeGreaterThan(0)
  }
  await expect(page.locator('.shell-drawer .ant-drawer-content-wrapper')).toBeVisible()
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || !(a instanceof CSSTransition)))

  await page.keyboard.press('Escape')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  let closing: Motion[] = []
  await expect.poll(async () => (closing = await drawerMotion(page)).map((m) => m.prop).sort(), { intervals: [16] }).toEqual(['opacity', 'transform'])
  for (const m of closing) {
    expect(m.easing).toBe(EASE)
    expect(m.duration).toBeGreaterThan(0)
  }
})

test.describe('azaltılmış hareket', () => {
  test.use({ reducedMotion: 'reduce' })
  test('çekmece hareketi 0,01 milisaniyeye iner', async ({ page }) => {
    await openDemo(page)
    const toggle = page.locator('.shell-menu-toggle').first()
    test.skip(!(await toggle.isVisible()), 'Bu genişlikte çekmece düğmesi yok')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const durations = await page.evaluate(() => [...document.querySelectorAll('.shell-drawer .ant-drawer-content-wrapper, .shell-drawer .ant-drawer-mask')]
      .map((el) => getComputedStyle(el).transitionDuration.split(',').map((v) => parseFloat(v) * (v.trim().endsWith('ms') ? 1 : 1000))).flat())
    expect(durations.length).toBeGreaterThan(0)
    for (const d of durations) expect(d).toBeLessThanOrEqual(0.01)
  })
})

test('kart kalkışı yalnız farede çalışır', async ({ page }, info) => {
  await openDemo(page)
  await page.goto('/#/yontemler')
  const card = page.locator('.page-rapor .method-card.ant-card').first()
  await expect(card).toBeVisible()
  const fine = await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)
  await card.hover()
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || !(a instanceof CSSTransition)))
  const lifted = await card.evaluate((el) => getComputedStyle(el).transform)
  if (fine) {
    expect(lifted, info.project.name).not.toBe('none')
    await page.mouse.move(0, 0)
    // Kalkış geri dönerken de geçiş çalışır.
    const back = await card.evaluate((el) => document.getAnimations().filter((a) => (a.effect as KeyframeEffect).target === el && a instanceof CSSTransition).map((a) => (a as CSSTransition).transitionProperty))
    expect(back).toContain('transform')
  } else {
    // Dokunmatik ekranda dokunuştan sonra kart yerinde kalır.
    expect(lifted, info.project.name).toBe('none')
  }
})

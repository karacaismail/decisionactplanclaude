// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { dark, light } from '@/theme/tokens'
import { BRAND_GLYPH } from '@/components/BrandMark'

/**
 * Ürün işareti tek kaynaktan gelir: src/assets/brand/mark.svg.
 * İşaret ürünün amacından türer: kapıya çıkan karar basamakları.
 * public klasöründeki simgeler scripts/build-icons.mjs ile bu dosyadan üretilir.
 */
const root = new URL('../../../', import.meta.url).pathname
const read = (path: string) => readFileSync(join(root, path), 'utf8')
const mark = existsSync(join(root, 'src/assets/brand/mark.svg')) ? read('src/assets/brand/mark.svg') : ''

/** PNG başlığından genişlik ve yüksekliği okur. */
function pngSize(bytes: Buffer): [number, number] {
  expect(bytes.subarray(1, 4).toString()).toBe('PNG')
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)]
}

describe('ürün işareti', () => {
  it('24 birimlik ızgarada çizilir', () => {
    expect(mark).toMatch(/viewBox="0 0 24 24"/)
  })

  it('yalnız iki token rengi kullanır', () => {
    const colors = new Set([...mark.matchAll(/(?:fill|stroke)="(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1].toUpperCase()))
    expect([...colors].sort()).toEqual([light.actionPrimary, light.onAction].map((c) => c.toUpperCase()).sort())
  })

  it('çizgiler 16 pikselde okunacak kalınlıktadır', () => {
    const widths = [...mark.matchAll(/stroke-width="([\d.]+)"/g)].map((m) => Number(m[1]))
    expect(widths.length).toBeGreaterThan(0)
    for (const w of widths) expect(w).toBeGreaterThanOrEqual(2)
  })

  it('uygulamadaki işaret aynı çizimi kullanır', () => {
    expect(mark).toContain(`d="${BRAND_GLYPH}"`)
  })
})

describe('tarayıcı simgeleri', () => {
  it('favicon.svg kaynak işaretle aynıdır', () => {
    expect(read('public/favicon.svg')).toBe(mark)
  })

  it.each([
    ['public/apple-touch-icon.png', 180],
    ['public/icon-192.png', 192],
    ['public/icon-512.png', 512],
    ['public/icon-maskable-512.png', 512],
  ])('%s %i piksel karedir', (path, size) => {
    expect(pngSize(readFileSync(join(root, path)))).toEqual([size, size])
  })

  it('favicon.ico 32 piksellik PNG taşır', () => {
    const ico = readFileSync(join(root, 'public/favicon.ico'))
    expect(ico.readUInt16LE(2)).toBe(1)
    expect(ico.readUInt16LE(4)).toBe(1)
    expect(ico[6]).toBe(32)
    const offset = ico.readUInt32LE(18)
    expect(pngSize(ico.subarray(offset))).toEqual([32, 32])
  })

  it('bildirim dosyası ad, kısa ad ve simgeleri taşır, yolları göreli verir', () => {
    const manifest = JSON.parse(read('public/manifest.webmanifest'))
    expect(manifest.name).toBe('Girişimci Aksiyon Planı')
    expect(manifest.short_name.length).toBeLessThanOrEqual(12)
    expect(manifest.display).toBe('browser')
    expect(manifest.start_url).toBe('./')
    expect(manifest.scope).toBe('./')
    expect(manifest.theme_color).toBe(light.heroSurface)
    expect(manifest.background_color).toBe(light.surfacePage)
    const sizes = manifest.icons.map((i: { sizes: string; purpose?: string }) => `${i.sizes}:${i.purpose ?? 'any'}`)
    expect(sizes).toEqual(expect.arrayContaining(['192x192:any', '512x512:any', '512x512:maskable']))
    // GitHub Pages alt yolu korunur. Mutlak yol kullanılmaz.
    for (const icon of manifest.icons) {
      expect(icon.src).not.toMatch(/^\//)
      expect(existsSync(join(root, 'public', icon.src))).toBe(true)
    }
  })

  it('index.html simgeleri, bildirimi ve iki tema rengini bağlar', () => {
    const html = read('index.html')
    expect(html).toMatch(/<link rel="icon" href="\/favicon\.ico" sizes="32x32" \/>/)
    expect(html).toMatch(/<link rel="icon" href="\/favicon\.svg" type="image\/svg\+xml" \/>/)
    expect(html).toMatch(/<link rel="apple-touch-icon" href="\/apple-touch-icon\.png" \/>/)
    expect(html).toMatch(/<link rel="manifest" href="\/manifest\.webmanifest" \/>/)
    expect(html).toContain(`<meta name="theme-color" content="${light.heroSurface}" media="(prefers-color-scheme: light)" />`)
    expect(html).toContain(`<meta name="theme-color" content="${dark.heroSurface}" media="(prefers-color-scheme: dark)" />`)
  })

  it('uygulama service worker kaydetmez', () => {
    const walk = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
      const full = join(dir, name)
      return statSync(full).isDirectory() ? walk(full) : /\.(ts|tsx)$/.test(name) && !/\.test\./.test(name) ? [full] : []
    })
    for (const file of walk(join(root, 'src'))) expect(readFileSync(file, 'utf8'), file).not.toMatch(/serviceWorker\.register/)
  })
})

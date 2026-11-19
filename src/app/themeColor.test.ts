import { beforeEach, describe, expect, it } from 'vitest'
import { dark, light } from '@/theme/tokens'
import { syncThemeColor } from './themeColor'

describe('tarayıcı çubuğu rengi', () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <meta name="theme-color" content="${light.heroSurface}" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="${dark.heroSurface}" media="(prefers-color-scheme: dark)" />`
  })
  const contents = () => [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map((m) => m.content)

  it('elle seçilen koyu tema iki etiketi de koyu üst şerit rengine çevirir', () => {
    syncThemeColor('dark')
    expect(contents()).toEqual([dark.heroSurface, dark.heroSurface])
  })

  it('elle seçilen açık tema iki etiketi de açık üst şerit rengine çevirir', () => {
    syncThemeColor('light')
    expect(contents()).toEqual([light.heroSurface, light.heroSurface])
  })

  it('sistem seçimi her etikete kendi sorgusunun rengini geri verir', () => {
    syncThemeColor('dark')
    syncThemeColor('system')
    expect(contents()).toEqual([light.heroSurface, dark.heroSurface])
  })
})

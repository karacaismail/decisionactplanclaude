import { palette, type ThemeMode } from '@/theme/tokens'

/**
 * Tarayıcı çubuğunun rengi üst şeridin rengiyle aynı olur.
 * index.html iki etiket taşır: biri açık, biri koyu sistem teması içindir.
 * Kullanıcı temayı elle seçerse iki etiket de seçilen temanın rengini alır.
 */
export function syncThemeColor(pref: ThemeMode | 'system') {
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const own: ThemeMode = /dark/.test(meta.getAttribute('media') ?? '') ? 'dark' : 'light'
    meta.content = palette(pref === 'system' ? own : pref).heroSurface
  }
}

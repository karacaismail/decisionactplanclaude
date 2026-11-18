/**
 * Semantik tasarım tokenları. Bileşen içine sabit değer yazılmaz.
 *
 * Kimlik: sıcak kırık beyaz yüzeyler, derin lacivert-yeşil "hero" paneli,
 * turuncu-kızıl eylem rengi. Ayrım kenarlıkla değil boşluk ve yüzey tonuyla kurulur.
 */
export const light = {
  surfacePage: '#F5F6FA',
  surfaceWork: '#FFFFFF',
  surfaceContext: '#F0F2F8',
  surfaceSunken: '#E3E6F0',
  textPrimary: '#0F1729',
  textSecondary: '#4A5468',
  actionPrimary: '#2F5BEA',
  actionHover: '#2448C4',
  brandAccent: '#2F5BEA',
  statusOk: '#0B7A56',
  statusHold: '#A85B00',
  statusHarm: '#C0271D',
  statusInfo: '#2448C4',
  statusOkBg: '#E6F6EF',
  statusHoldBg: '#FFF4E0',
  statusHarmBg: '#FDECEA',
  statusInfoBg: '#EBF0FF',
  border: '#E1E4EE',
  borderStrong: '#C9CEDD',
  selectedBg: '#EBF0FF',
  onAction: '#FFFFFF',
  /* Üst şerit ve giriş bloğu: derin mürekkep. */
  heroSurface: '#0F1729',
  heroSurfaceAlt: '#1B2540',
  heroText: '#F7F8FC',
  heroMuted: '#A7B0C8',
  heroLine: '#2B3655',
  heroAction: '#FFFFFF',
  heroActionHover: '#EBF0FF',
  heroActionText: '#0F1729',
  toneTeal: '#0B7A56',
  toneTealBg: '#E6F6EF',
  tonePurple: '#6D3FE0',
  tonePurpleBg: '#F0EBFF',
  toneOrange: '#C96A00',
  toneOrangeBg: '#FFF4E0',
  toneNavy: '#2448C4',
  toneNavyBg: '#EBF0FF',
  shadow: 'rgba(15, 23, 41, 0.08)',
} as const

export const dark = {
  surfacePage: '#0B0F1A',
  surfaceWork: '#171D2E',
  surfaceContext: '#252D44',
  surfaceSunken: '#333C58',
  textPrimary: '#F2F4FA',
  textSecondary: '#AEB7CC',
  actionPrimary: '#4F78FF',
  actionHover: '#6C8EFF',
  brandAccent: '#7C9BFF',
  statusOk: '#4ADE9F',
  statusHold: '#FFB84D',
  statusHarm: '#FF8A80',
  statusInfo: '#8FAAFF',
  statusOkBg: '#11352A',
  statusHoldBg: '#3D2C0C',
  statusHarmBg: '#42201D',
  statusInfoBg: '#1C2A55',
  border: '#2A3350',
  borderStrong: '#404B6E',
  selectedBg: '#1C2A55',
  onAction: '#FFFFFF',
  heroSurface: '#131A2E',
  heroSurfaceAlt: '#1F2947',
  heroText: '#F7F8FC',
  heroMuted: '#A7B0C8',
  heroLine: '#34406A',
  heroAction: '#FFFFFF',
  heroActionHover: '#EBF0FF',
  heroActionText: '#0F1729',
  toneTeal: '#4ADE9F',
  toneTealBg: '#11352A',
  tonePurple: '#C2A8FF',
  tonePurpleBg: '#2C2352',
  toneOrange: '#FFB84D',
  toneOrangeBg: '#3D2C0C',
  toneNavy: '#8FAAFF',
  toneNavyBg: '#1C2A55',
  shadow: 'rgba(0, 0, 0, 0.5)',
} as const

export type Palette = { [K in keyof typeof light]: string }
export type ThemeMode = 'light' | 'dark'

export function palette(mode: ThemeMode): Palette {
  return (mode === 'dark' ? dark : light) as unknown as Palette
}

/** Altı karar sonucunun rengi. Başka yerde kullanılmaz. */
export const decisionColors = {
  light: { proceed: '#1D6B4F', conditional: '#5C7A1F', retry: '#2E5A74', pivot: '#5A4A82', hold: '#53636B', stop: '#A3302F' },
  dark: { proceed: '#5FD3A6', conditional: '#B5D06A', retry: '#8CC3E8', pivot: '#CDBDE6', hold: '#AEB9C0', stop: '#FF8A8E' },
} as const

export const motion = {
  ease: 'cubic-bezier(0.65, 0, 0.35, 1)',
  micro: 120,
  small: 160,
  panel: 220,
  page: 320,
} as const

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, section: 48 } as const
export const radius = { control: 6, panel: 10, hero: 10 } as const
/** Görsel gövde ve gerçek etkileşim alanı birbirinden bağımsızdır. */
export const control = {
  visual: { comfortable: 44, compact: 36, dense: 32 },
  hitArea: 44,
  // Mevcut tüketicilerin adları korunur. dense yalnız görsel gövdedir.
  height: 44,
  dense: 32,
  touch: 44,
} as const

export const density = {
  comfortable: { paddingBlock: 10, paddingInline: 12, paddingPanel: 16, gapControl: 8, gapContent: 16, gapSection: 32 },
  compact: { paddingBlock: 8, paddingInline: 10, paddingPanel: 12, gapControl: 6, gapContent: 12, gapSection: 24 },
  dense: { paddingBlock: 6, paddingInline: 8, paddingPanel: 8, gapControl: 4, gapContent: 8, gapSection: 16 },
} as const
export type Density = keyof typeof density

/** Kenar boşluğu yoğunluktan bağımsızdır. */
export const gutter = { page: 16, precision: 20 } as const
export const font = {
  family: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  body: 16,
  helper: 14,
  h3: 20,
  h2: 24,
  h1: 32,
  display: 40,
  report: 40,
} as const

/** Paleti CSS değişkenlerine çevirir. global.css yalnız bu değişkenleri okur. */
export function cssVariables(mode: ThemeMode): Record<string, string> {
  const p = palette(mode)
  const kebab = (k: string) => k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
  const vars: Record<string, string> = {}
  for (const [k, v] of Object.entries(p)) vars[`--color-${kebab(k)}`] = v
  vars['--radius-control'] = `${radius.control}px`
  vars['--radius-panel'] = `${radius.panel}px`
  vars['--radius-hero'] = `${radius.hero}px`
  vars['--focus-marker'] = p.actionPrimary
  return vars
}

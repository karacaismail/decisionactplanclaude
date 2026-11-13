/**
 * Semantik tasarım tokenları. Bileşen içine sabit değer yazılmaz.
 *
 * Kimlik: sıcak kırık beyaz yüzeyler, derin lacivert-yeşil "hero" paneli,
 * turuncu-kızıl eylem rengi. Ayrım kenarlıkla değil boşluk ve yüzey tonuyla kurulur.
 */
export const light = {
  surfacePage: '#F6F3EE',
  surfaceWork: '#FFFDF9',
  surfaceContext: '#EEE9E1',
  surfaceSunken: '#E7E1D7',
  textPrimary: '#1B2A31',
  textSecondary: '#53636B',
  actionPrimary: '#B8441C',
  actionHover: '#99370F',
  brandAccent: '#E8632B',
  statusOk: '#1D6B4F',
  statusHold: '#7A5410',
  statusHarm: '#A3302F',
  statusInfo: '#2E5A74',
  statusOkBg: '#DDEFE6',
  statusHoldBg: '#F6EBD3',
  statusHarmBg: '#F8E1DF',
  statusInfoBg: '#DFE9F0',
  border: '#E3DDD3',
  borderStrong: '#C9C1B4',
  /* Seçili durum: eylem renginin yüzde 12 saydam katmanı. Kahverengi ton yoktur. */
  selectedBg: 'rgba(184, 68, 28, 0.12)',
  onAction: '#FFFFFF',
  /* Hero paneli: derin lacivert-yeşil zemin, sıcak krem metin. */
  heroSurface: '#1B2A31',
  heroSurfaceAlt: '#27393F',
  heroText: '#F8EFE2',
  heroMuted: '#A9C3BB',
  heroLine: '#9BB8AF',
  heroAction: '#F2A66B',
  heroActionHover: '#F7BC8C',
  heroActionText: '#2A1A0E',
  /* Ton yüzeyleri: ikon kutuları ve küçük vurgular. */
  toneTeal: '#1E6B5E',
  toneTealBg: '#DCEDE6',
  tonePurple: '#5A4A82',
  tonePurpleBg: '#E9E4F1',
  toneOrange: '#B8441C',
  toneOrangeBg: '#F9E6DA',
  toneNavy: '#2E4F62',
  toneNavyBg: '#DFE8EE',
  shadow: 'rgba(27, 42, 49, 0.10)',
} as const

export const dark = {
  /* surfacePage değeri başka bileşenlerce tema algısında kullanılır; değiştirmeyin. */
  surfacePage: '#16191D',
  surfaceWork: '#242A31',
  surfaceContext: '#333B44',
  surfaceSunken: '#424B55',
  textPrimary: '#F1F3F4',
  textSecondary: '#B9C3C9',
  actionPrimary: '#D4582F',
  actionHover: '#E3673D',
  brandAccent: '#F07A4F',
  statusOk: '#5FD3A6',
  statusHold: '#E0B35A',
  statusHarm: '#FF8A8E',
  statusInfo: '#8CC3E8',
  statusOkBg: '#1F3B33',
  statusHoldBg: '#3F3520',
  statusHarmBg: '#452A2C',
  statusInfoBg: '#243744',
  border: '#343C44',
  borderStrong: '#4C565F',
  selectedBg: 'rgba(212, 88, 47, 0.16)',
  onAction: '#FFFFFF',
  heroSurface: '#2A3640',
  heroSurfaceAlt: '#36444F',
  heroText: '#F3EBDE',
  heroMuted: '#9DB8B0',
  heroLine: '#7E9B93',
  heroAction: '#F2A66B',
  heroActionHover: '#F7BC8C',
  heroActionText: '#2A1A0E',
  toneTeal: '#9FD3C2',
  toneTealBg: '#23403A',
  tonePurple: '#CDBDE6',
  tonePurpleBg: '#3A334D',
  toneOrange: '#F5B48C',
  toneOrangeBg: '#4A3023',
  toneNavy: '#9FC2D6',
  toneNavyBg: '#263A47',
  shadow: 'rgba(0, 0, 0, 0.35)',
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
export const radius = { control: 6, panel: 8, hero: 8 } as const
export const control = { height: 40, dense: 32, touch: 44 } as const
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

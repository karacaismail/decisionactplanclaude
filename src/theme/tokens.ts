/**
 * Semantik tasarım tokenları. Bileşen içine sabit değer yazılmaz.
 *
 * Kimlik: sıcak kırık beyaz yüzeyler, derin lacivert-yeşil "hero" paneli,
 * turuncu-kızıl eylem rengi. Ayrım kenarlıkla değil boşluk ve yüzey tonuyla kurulur.
 */
export const light = {
  surfacePage: '#F3F5F8',
  surfaceWork: '#FFFFFF',
  surfaceContext: '#F0F2F5',
  surfaceSunken: '#E4E8EE',
  textPrimary: '#101828',
  textSecondary: '#475467',
  actionPrimary: '#C2410C',
  actionHover: '#9A3412',
  brandAccent: '#F97316',
  statusOk: '#027A48',
  statusHold: '#B54708',
  statusHarm: '#B42318',
  statusInfo: '#175CD3',
  statusOkBg: '#ECFDF3',
  statusHoldBg: '#FFFAEB',
  statusHarmBg: '#FEF3F2',
  statusInfoBg: '#EFF8FF',
  border: '#E4E7EC',
  borderStrong: '#D0D5DD',
  selectedBg: 'rgba(194, 65, 12, 0.10)',
  onAction: '#FFFFFF',
  /* Hero ve yan menü: derin lacivert. */
  heroSurface: '#0F172A',
  heroSurfaceAlt: '#1E293B',
  heroText: '#F8FAFC',
  heroMuted: '#94A3B8',
  heroLine: '#334155',
  heroAction: '#F97316',
  heroActionHover: '#FB923C',
  heroActionText: '#FFFFFF',
  toneTeal: '#0E9384',
  toneTealBg: '#E0F5F2',
  tonePurple: '#6938EF',
  tonePurpleBg: '#EFEBFF',
  toneOrange: '#C2410C',
  toneOrangeBg: '#FFF1E8',
  toneNavy: '#1E3A8A',
  toneNavyBg: '#E8EEFF',
  shadow: 'rgba(16, 24, 40, 0.08)',
} as const

export const dark = {
  /* surfacePage değeri başka bileşenlerce tema algısında kullanılır; değiştirmeyin. */
  surfacePage: '#16191D',
  surfaceWork: '#212833',
  surfaceContext: '#2E3744',
  surfaceSunken: '#3B4554',
  textPrimary: '#F2F4F7',
  textSecondary: '#B0B9C6',
  actionPrimary: '#EA580C',
  actionHover: '#F97316',
  brandAccent: '#FB923C',
  statusOk: '#4ADE80',
  statusHold: '#FBBF24',
  statusHarm: '#F87171',
  statusInfo: '#60A5FA',
  statusOkBg: '#14322A',
  statusHoldBg: '#3A2E12',
  statusHarmBg: '#3F1F1F',
  statusInfoBg: '#1B2E4B',
  border: '#2F3844',
  borderStrong: '#46505E',
  selectedBg: 'rgba(249, 115, 22, 0.16)',
  onAction: '#FFFFFF',
  heroSurface: '#0F172A',
  heroSurfaceAlt: '#1E293B',
  heroText: '#F8FAFC',
  heroMuted: '#94A3B8',
  heroLine: '#334155',
  heroAction: '#F97316',
  heroActionHover: '#FB923C',
  heroActionText: '#FFFFFF',
  toneTeal: '#5EEAD4',
  toneTealBg: '#133A36',
  tonePurple: '#C4B5FD',
  tonePurpleBg: '#2E2650',
  toneOrange: '#FDBA74',
  toneOrangeBg: '#3F2A1C',
  toneNavy: '#93C5FD',
  toneNavyBg: '#1E2A47',
  shadow: 'rgba(0, 0, 0, 0.45)',
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
export const radius = { control: 8, panel: 12, hero: 16 } as const
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

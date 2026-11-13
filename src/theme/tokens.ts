/** Semantik tasarım tokenları. Bileşen içine sabit değer yazılmaz. */
export const light = {
  surfacePage: '#F8F7F4',
  surfaceWork: '#FFFFFF',
  surfaceContext: '#F1F3F4',
  textPrimary: '#20282F',
  textSecondary: '#495761',
  actionPrimary: '#8F2812',
  actionHover: '#B52F0F',
  brandAccent: '#F95428',
  statusOk: '#17634C',
  statusHold: '#79520F',
  statusHarm: '#A02F34',
  statusInfo: '#315A75',
  border: '#D3D9DD',
} as const

export const dark = {
  surfacePage: '#16191D',
  surfaceWork: '#1F2429',
  surfaceContext: '#262C33',
  textPrimary: '#ECEEF0',
  textSecondary: '#AEB9C0',
  actionPrimary: '#FF9A7D',
  actionHover: '#FFC0AD',
  brandAccent: '#FF6F4D',
  statusOk: '#5FD3A6',
  statusHold: '#E0B35A',
  statusHarm: '#FF8A8E',
  statusInfo: '#8CC3E8',
  border: '#39424A',
} as const

export type Palette = { [K in keyof typeof light]: string }

/** Altı karar sonucunun rengi. Başka yerde kullanılmaz. */
export const decisionColors = {
  light: { proceed: '#17634C', conditional: '#5C7A1F', retry: '#315A75', pivot: '#5B3D8F', hold: '#4F5E6A', stop: '#A02F34' },
  dark: { proceed: '#5FD3A6', conditional: '#B5D06A', retry: '#8CC3E8', pivot: '#C4A9F0', hold: '#AEB9C0', stop: '#FF8A8E' },
} as const

export const motion = {
  ease: 'cubic-bezier(0.65, 0, 0.35, 1)',
  micro: 120,
  small: 160,
  panel: 220,
  page: 320,
} as const

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, section: 48 } as const
export const radius = { control: 6, panel: 12 } as const
export const control = { height: 44, dense: 32, touch: 44 } as const
export const font = {
  family: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  body: 16,
  helper: 14,
  h3: 20,
  h2: 24,
  h1: 32,
  report: 40,
} as const

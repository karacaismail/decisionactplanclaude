/**
 * Semantik tasarım tokenları. Bileşen içine sabit değer yazılmaz.
 *
 * Kimlik: soğuk gri yüzeyler, derin lacivert üst şerit ve mavi eylem rengi.
 * Ayrım kenarlıkla değil boşluk, yüzey tonu ve gölgeyle kurulur.
 *
 * Karşıtlık sözleşmesi `contrast.test.ts` içinde iki tema için denetlenir.
 * actionPrimary dolgudur. Üstündeki yazı onAction'dır.
 * Eylem rengindeki yazı, bağlantı ve seçili gezinme metni actionText kullanır.
 * borderInput, giriş kontrolünün kenarıdır ve zemine karşı en az 3:1 olur.
 * border yalnız süs ve ayırıcıdır. Kontrol sınırı için kullanılmaz.
 */
export const light = {
  surfacePage: '#ECEEF4',
  surfaceWork: '#FFFFFF',
  surfaceContext: '#E3E6EF',
  surfaceSunken: '#D9DDE8',
  textPrimary: '#0F1729',
  textSecondary: '#4A5468',
  actionPrimary: '#2F5BEA',
  actionHover: '#2448C4',
  actionText: '#2448C4',
  brandAccent: '#2F5BEA',
  statusOk: '#0A6E4D',
  statusHold: '#9A5300',
  statusHarm: '#C0271D',
  statusInfo: '#2448C4',
  statusOkBg: '#E6F6EF',
  statusHoldBg: '#FFF4E0',
  statusHarmBg: '#FDECEA',
  statusInfoBg: '#EBF0FF',
  border: '#E1E4EE',
  borderStrong: '#C9CEDD',
  borderInput: '#737D93',
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
  actionPrimary: '#3360F5',
  actionHover: '#2D55E0',
  actionText: '#9DB4FF',
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
  borderInput: '#7A84A0',
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

/**
 * Yükselti. card kartı zeminden ayırır. float açılan katmanı ayırır.
 * bar, ekranın altına sabitlenen şeridi yukarı doğru ayırır.
 * Koyu temada gölge görünmez. Kartı yüzey tonu ve 1 piksellik kenar tokenı ayırır.
 * Bu çizgi dört kenarı da sarar. Tek kenarlı renkli vurgu değildir.
 */
export const elevation = {
  light: {
    card: '0 1px 2px rgba(15, 23, 41, 0.06), 0 1px 3px rgba(15, 23, 41, 0.10)',
    float: '0 8px 24px rgba(15, 23, 41, 0.12), 0 2px 6px rgba(15, 23, 41, 0.08)',
    bar: '0 -1px 0 rgba(15, 23, 41, 0.08), 0 -4px 12px rgba(15, 23, 41, 0.08)',
  },
  dark: {
    card: `0 0 0 1px ${dark.border}`,
    float: `0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px ${dark.border}`,
    bar: `0 -1px 0 ${dark.border}, 0 -4px 12px rgba(0, 0, 0, 0.4)`,
  },
} as const

/**
 * Grafik renkleri. İki parlaklık bandı vardır: güçlü ve orta.
 * Komşu seriler ve dilimler bantları sırayla kullanır. Böylece iki komşu renk en az 3:1 ayrışır.
 * Her renk çalışma yüzeyinden de en az 3:1 ayrışır. Dilim içindeki yazı bandın yazı rengini kullanır.
 * Örneğin açık temada güçlü dilimde beyaz, orta dilimde koyu mürekkep yazı vardır.
 * rest, "kalan" gibi ikincil seridir. Bu renk orta banttaki gridir.
 */
export const chartColors = {
  light: {
    strong: ['#172A6E', '#033A28', '#371E7A', '#512800'],
    mid: ['#C9761A', '#5B7FE8', '#2E9A72', '#858EA3'],
    onStrong: '#FFFFFF',
    onMid: '#0F1729',
  },
  dark: {
    strong: ['#BFD0FF', '#8EE8C4', '#D9C9FF', '#FFD08A'],
    mid: ['#A1601C', '#4766C8', '#227A65', '#646E8A'],
    onStrong: '#171D2E',
    onMid: '#FFFFFF',
  },
} as const

/** Bir grafik rengi ve üstündeki yazının rengi. */
export interface ChartSlot {
  color: string
  text: string
}

/** Komşuları ayrışan renk sırası: güçlü, orta, güçlü, orta. n kadar renk döner. */
export function chartSequence(mode: ThemeMode, n: number): ChartSlot[] {
  const c = chartColors[mode]
  return Array.from({ length: n }, (_x, i) => {
    const k = Math.floor(i / 2)
    return i % 2 === 0
      ? { color: c.strong[k % c.strong.length], text: c.onStrong }
      : { color: c.mid[k % c.mid.length], text: c.onMid }
  })
}

/** İki serili grafik: ana seri güçlü lacivert, ikincil seri orta gri. */
export function chartPair(mode: ThemeMode): { main: ChartSlot; rest: ChartSlot } {
  const c = chartColors[mode]
  return { main: { color: c.strong[0], text: c.onStrong }, rest: { color: c.mid[c.mid.length - 1], text: c.onMid } }
}

/** Komşu dilimler arasındaki boşluk. Boşluk çalışma yüzeyinin rengindedir. */
export const chartGap = 2

/** Eski kategori anahtarları. Göstergeler ekranı chartSequence kullanınca silinir. */
export const chartSeries = ['toneNavy', 'toneTeal', 'tonePurple', 'toneOrange', 'statusInfo', 'statusHold', 'textSecondary'] as const satisfies readonly (keyof typeof light)[]

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
export const radius = { control: 6, panel: 10, hero: 10, pill: 999 } as const
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
/**
 * Yazı ölçeği. Her başlık düzeyinin tek kaynağı budur. temel.css aynı değerleri taşır.
 * Okunabilir hiçbir yazı 14 pikselin altına inmez. Gövde 16 pikseldir.
 */
export const font = {
  family: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  helper: 14,
  body: 16,
  subsection: 18,
  section: 20,
  h2: 24,
  h1Min: 28,
  h1Max: 36,
  /** Sayfa başlığı dar ekranda 28, geniş ekranda 36 pikseldir. */
  h1: 'clamp(28px, 2.4vw + 20px, 36px)',
  stat: 36,
  /** Devir raporundaki karar sorusu. Sayfa başlığından küçük, ikinci düzeyden büyüktür. */
  lead: 'clamp(28px, 1.2vw + 16px, 32px)',
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
  vars['--radius-pill'] = `${radius.pill}px`
  vars['--focus-marker'] = p.actionText
  const e = elevation[mode]
  vars['--shadow-card'] = e.card
  vars['--shadow-float'] = e.float
  vars['--shadow-bar'] = e.bar
  return vars
}

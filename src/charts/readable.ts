/**
 * Bütün grafiklerin ortak okunurluk ayarı. EChart çizmeden önce seçeneği bu işlevden geçirir.
 * Adım ekranlarındaki grafikler de böylece aynı kurala uyar.
 *
 * Kurallar:
 * - Eksen, etiket, açıklama ve ipucu yazısı en az 14 pikseldir. Daha büyük boyut korunur.
 * - Renk verilmeyen huni ve halka dilimleri sıralı grafik rengini alır. Dilim yazısı bandın yazı rengidir.
 * - Halka dilimleri, yığılı çubuk parçaları ve ısı haritası hücreleri 2 piksel yüzey boşluğuyla ayrılır.
 * - Yazısı içeride olan huninin en dar basamağı en az yüzde 60 genişliktedir. Böylece yazı dilime sığar.
 *   Grafiğin kendi ekran seçeneği bu sınırı geniş alanda değiştirebilir.
 * - Rengi verilmeyen ısı haritası bağlam yüzeyinden orta maviye gider. Hücre yazısı her tonda okunur.
 * - Ekran okuyucu açıklaması açıktır. Açıklama verilmediyse başlık ve özet yazılır.
 * Kaynak seçenek değişmez. İşlev yeni bir kopya döner.
 */
import { chartColors, chartGap, chartSequence, font, palette, space, type ThemeMode } from '@/theme/tokens'

type Json = Record<string, unknown>

export interface ReadableContext {
  mode: ThemeMode
  /** Parçalar arasındaki boşluğun rengi. Grafiğin çizildiği çalışma yüzeyidir. */
  gap: string
  /** Ekran okuyucunun okuyacağı cümle. Örneğin "Kasa çizgisi. En düşük bakiye 10 TL." */
  description: string
}

/** Yazı biçimi taşıyan anahtarlar. Bu nesnelerde yazı en az 14 pikseldir. */
const TEXT_KEYS = new Set(['axisLabel', 'label', 'textStyle', 'nameTextStyle', 'axisName', 'edgeLabel', 'upperLabel'])
const AXIS_KEYS = ['xAxis', 'yAxis', 'radiusAxis', 'angleAxis', 'singleAxis']
/** Komşu parçaları birbirine değen seri türleri. */
const SEPARATED = new Set(['pie', 'heatmap'])
const SLICED = new Set(['pie', 'funnel'])
/** Huninin en dar basamağının en küçük genişliği, yüzde olarak. */
const FUNNEL_MIN = 60

const isPlain = (x: unknown): x is Json => Boolean(x) && typeof x === 'object' && Object.getPrototypeOf(x) === Object.prototype

/** Düz nesne ve dizileri kopyalar. İşlev ve diğer değerler olduğu gibi kalır. */
function clone<T>(node: T): T {
  if (Array.isArray(node)) return node.map(clone) as T
  if (isPlain(node)) return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, clone(v)])) as T
  return node
}

/** Yazı boyutu sayı ya da "20px" gibi yazı olabilir. Okunamayan boyut undefined döner. */
const sizeOf = (x: unknown): number | undefined => {
  const n = typeof x === 'number' ? x : typeof x === 'string' ? parseFloat(x) : NaN
  return Number.isFinite(n) ? n : undefined
}

const readable = (style: unknown): Json => {
  const s = isPlain(style) ? style : {}
  return { ...s, fontSize: Math.max(sizeOf(s.fontSize) ?? 0, font.helper) }
}

/** Ekran seçeneği yalnız verilen küçük boyutu düzeltir. Boyut eklemez, ana seçenekteki büyük boyutu ezmez. */
const raiseOnly = (style: Json): Json => {
  const size = sizeOf(style.fontSize)
  return size === undefined ? style : { ...style, fontSize: Math.max(size, font.helper) }
}

/**
 * Ağacı gezer. Yazı biçimi nesnelerinde yazı boyutunu 14 pikselin altına indirmez.
 * add true ise boyutu olmayan nesneye 14 piksel eklenir. Ekran seçeneklerinde add false olur.
 */
function walk(node: unknown, add: boolean): void {
  if (Array.isArray(node)) {
    node.forEach((x) => walk(x, add))
    return
  }
  if (!isPlain(node)) return
  for (const [key, value] of Object.entries(node)) {
    if (TEXT_KEYS.has(key) && isPlain(value)) node[key] = add ? readable(value) : raiseOnly(value)
    walk(node[key], add)
  }
}

/** Yazı dilimin içinde mi? ECharts halka ve huni yazısını varsayılan olarak dışarı koyar. */
const INSIDE = new Set(['inside', 'inner', 'center'])
const insideLabel = (item: Json, series: Json): boolean => {
  const own = isPlain(item.label) ? item.label.position : undefined
  const shared = isPlain(series.label) ? series.label.position : undefined
  return INSIDE.has(String(own ?? shared ?? 'outside'))
}

const list = (x: unknown): Json[] => (Array.isArray(x) ? x.filter(isPlain) : isPlain(x) ? [x] : [])

/** Ana seçenekte eksik yazı biçimlerini ekler. ECharts kendi varsayılanında 12 piksel kullanır. */
function addMissingText(option: Json) {
  for (const key of AXIS_KEYS) {
    for (const axis of list(option[key])) {
      axis.axisLabel = readable(axis.axisLabel)
      if (axis.name !== undefined) axis.nameTextStyle = readable(axis.nameTextStyle)
    }
  }
  for (const key of ['legend', 'tooltip', 'title']) for (const part of list(option[key])) part.textStyle = readable(part.textStyle)
  for (const radar of list(option.radar)) radar.axisName = readable(radar.axisName)
  for (const series of list(option.series)) series.label = readable(series.label)
}

function separate(series: Json, gap: string) {
  const style = isPlain(series.itemStyle) ? series.itemStyle : {}
  const width = typeof style.borderWidth === 'number' ? style.borderWidth : 0
  series.itemStyle = { ...style, borderColor: style.borderColor ?? gap, borderWidth: Math.max(width, chartGap) }
}

function arrangeSeries(option: Json, ctx: ReadableContext) {
  for (const series of list(option.series)) {
    const type = String(series.type ?? '')
    if (SEPARATED.has(type) || (type === 'bar' && series.stack !== undefined)) separate(series, ctx.gap)
    if (type === 'funnel') {
      series.gap = Math.max(typeof series.gap === 'number' ? series.gap : 0, chartGap)
      /* Yazı içerideyse en dar basamağa da sığar. Yükseklik boş kenara harcanmaz. */
      const min = typeof series.minSize === 'string' ? parseFloat(series.minSize) : 0
      if (insideLabel({}, series) && !(min >= FUNNEL_MIN)) series.minSize = `${FUNNEL_MIN}%`
      if (series.top === undefined && series.bottom === undefined) Object.assign(series, { top: space.sm, bottom: space.sm })
    }
    if (SLICED.has(type) && Array.isArray(series.data)) {
      const slots = chartSequence(ctx.mode, series.data.length)
      series.data = series.data.map((item, i) => {
        const d: Json = isPlain(item) ? item : { value: item }
        const style = isPlain(d.itemStyle) ? d.itemStyle : {}
        if (style.color !== undefined) return d
        const colored = { ...d, itemStyle: { ...style, color: slots[i].color } }
        /* Yazı rengi yalnız dilimin içindeki yazıya verilir. Dışarıdaki yazı zeminin yazı rengini korur. */
        if (!insideLabel(d, series)) return colored
        const label = isPlain(d.label) ? d.label : {}
        return { ...colored, label: { ...label, color: label.color ?? slots[i].text } }
      })
    }
  }
}

/** Isı haritası: açık uçtan orta banda giden tek renk aralığı. Yazı rengi iki uçta da en az 4,5:1 olur. */
function arrangeHeatmap(option: Json, ctx: ReadableContext) {
  const heatmaps = list(option.series).filter((x) => x.type === 'heatmap')
  if (heatmaps.length === 0) return
  const c = chartColors[ctx.mode]
  for (const map of list(option.visualMap)) {
    const range = isPlain(map.inRange) ? map.inRange : {}
    if (range.color === undefined) map.inRange = { ...range, color: [palette(ctx.mode).surfaceContext, c.mid[1]] }
  }
  for (const series of heatmaps) {
    const label = isPlain(series.label) ? series.label : {}
    series.label = { ...label, color: label.color ?? c.onMid }
  }
}

function arrangeBase(option: Json, ctx: ReadableContext) {
  if (option.color === undefined) option.color = chartSequence(ctx.mode, 8).map((s) => s.color)
  const aria = isPlain(option.aria) ? option.aria : {}
  const label = isPlain(aria.label) ? aria.label : {}
  option.aria = { decal: { show: false }, ...aria, enabled: true, label: { ...label, description: label.description ?? ctx.description } }
  addMissingText(option)
  arrangeSeries(option, ctx)
  arrangeHeatmap(option, ctx)
}

/** Grafik seçeneğini ortak okunurluk kurallarına göre düzenler. Sonuç yeni bir kopyadır. */
export function readableOption(option: unknown, ctx: ReadableContext): unknown {
  const out = clone(option)
  if (!isPlain(out)) return out
  if (isPlain(out.baseOption)) {
    arrangeBase(out.baseOption, ctx)
    walk(out.baseOption, true)
    for (const media of list(out.media)) walk(media.option, false)
    walk(out.options, false)
  } else {
    arrangeBase(out, ctx)
    walk(out, true)
  }
  return out
}

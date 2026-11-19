// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { chartColors, chartGap, chartSequence, font, palette } from '@/theme/tokens'
import { readableOption } from './readable'

type Json = Record<string, unknown>
const gap = '#FFFFFF'

describe('ortak grafik okunurluğu', () => {
  it('yazı boyutu verilmeyen eksen, etiket ve açıklama 14 piksel olur, büyük boyut korunur', () => {
    const out = readableOption({
      xAxis: { type: 'category', axisLabel: { show: true } },
      yAxis: [{ type: 'value', name: 'TL', axisLabel: { fontSize: 12 } }],
      legend: { textStyle: { fontSize: 18 } },
      series: [{ type: 'bar', data: [1], label: { show: true } }],
    }, { mode: 'light', gap, description: 'Başlık' }) as Json
    expect(((out.xAxis as Json).axisLabel as Json).fontSize).toBe(font.helper)
    const y = (out.yAxis as Json[])[0]
    expect((y.axisLabel as Json).fontSize).toBe(font.helper)
    expect((y.nameTextStyle as Json).fontSize).toBe(font.helper)
    expect(((out.legend as Json).textStyle as Json).fontSize).toBe(18)
    expect(((out.series as Json[])[0].label as Json).fontSize).toBe(font.helper)
  })

  it('renk verilmeyen huni ve halka dilimlerine sıralı bant rengi ve okunur yazı verir', () => {
    const out = readableOption({
      series: [{ type: 'funnel', gap: 4, label: { show: true, position: 'inside' }, data: [{ name: 'A', value: 3 }, { name: 'B', value: 2 }, { name: 'C', value: 1 }] }],
    }, { mode: 'dark', gap, description: 'Huni' }) as Json
    const series = (out.series as Json[])[0]
    const slots = chartSequence('dark', 3)
    const data = series.data as Json[]
    expect(data.map((d) => (d.itemStyle as Json).color)).toEqual(slots.map((s) => s.color))
    expect(data.map((d) => (d.label as Json).color)).toEqual(slots.map((s) => s.text))
    expect(series.gap).toBeGreaterThanOrEqual(chartGap)
  })

  it('verilen dilim rengini değiştirmez', () => {
    const out = readableOption({
      series: [{ type: 'pie', data: [{ name: 'A', value: 1, itemStyle: { color: '#123456' } }, { name: 'B', value: 2 }] }],
    }, { mode: 'light', gap, description: 'Halka' }) as Json
    const data = (out.series as Json[])[0].data as Json[]
    expect((data[0].itemStyle as Json).color).toBe('#123456')
  })

  it('halka, yığılı çubuk ve ısı haritası parçalarını 2 piksel yüzey boşluğuyla ayırır', () => {
    const out = readableOption({
      series: [
        { type: 'pie', data: [1, 2] },
        { type: 'bar', stack: 'a', data: [1] },
        { type: 'bar', stack: 'a', data: [2] },
        { type: 'heatmap', data: [[0, 0, 1]] },
        { type: 'bar', data: [3] },
      ],
    }, { mode: 'light', gap, description: 'Parçalar' }) as Json
    const series = out.series as Json[]
    for (const s of series.slice(0, 4)) {
      expect((s.itemStyle as Json).borderColor).toBe(gap)
      expect((s.itemStyle as Json).borderWidth).toBe(chartGap)
    }
    /* Tek başına duran çubuğa kenar eklenmez. */
    expect((series[4].itemStyle as Json | undefined)?.borderWidth).toBeUndefined()
  })

  it('ekran seçenekli biçimde ana seçeneği ve ekran seçeneklerini işler', () => {
    const out = readableOption({
      baseOption: { xAxis: { axisLabel: {} }, series: [{ type: 'bar', data: [1] }] },
      media: [{ query: { maxWidth: 520 }, option: { xAxis: { axisLabel: { fontSize: 10 } } } }],
    }, { mode: 'light', gap, description: 'Ekran' }) as Json
    const base = out.baseOption as Json
    expect(((base.xAxis as Json).axisLabel as Json).fontSize).toBe(font.helper)
    const media = (out.media as Json[])[0].option as Json
    expect(((media.xAxis as Json).axisLabel as Json).fontSize).toBe(font.helper)
    expect((base.aria as Json).enabled).toBe(true)
  })

  it('ekran okuyucu açıklaması verilmediyse başlığı yazar, verilen açıklamayı korur', () => {
    const plain = readableOption({ series: [] }, { mode: 'light', gap, description: 'Kasa çizgisi. En düşük bakiye 10 TL.' }) as Json
    expect(((plain.aria as Json).label as Json).description).toBe('Kasa çizgisi. En düşük bakiye 10 TL.')
    const given = readableOption({ aria: { enabled: true, label: { description: 'Hazır' } }, series: [] }, { mode: 'light', gap, description: 'Başka' }) as Json
    expect(((given.aria as Json).label as Json).description).toBe('Hazır')
  })

  it('kaynak seçeneği değiştirmez', () => {
    const source = { series: [{ type: 'pie', data: [{ name: 'A', value: 1 }] }] }
    const copy = structuredClone(source)
    readableOption(source, { mode: 'light', gap, description: 'X' })
    expect(source).toEqual(copy)
  })

  it.each(['light', 'dark'] as const)('ısı haritası %s temada okunur yazılı açık bir renk aralığı kullanır', (mode) => {
    const out = readableOption({
      visualMap: { min: 0, max: 3, show: false },
      series: [{ type: 'heatmap', data: [[0, 0, 1]], label: { show: true } }],
    }, { mode, gap, description: 'Isı' }) as Json
    const range = ((out.visualMap as Json).inRange as Json).color as string[]
    expect(range).toEqual([palette(mode).surfaceContext, chartColors[mode].mid[1]])
    expect(((out.series as Json[])[0].label as Json).color).toBe(chartColors[mode].onMid)
  })

  it('huninin en dar basamağı içindeki yazıyı taşıyacak kadar geniş kalır', () => {
    const out = readableOption({
      series: [
        { type: 'funnel', minSize: '10%', label: { position: 'inside' }, data: [{ name: 'A', value: 2 }, { name: 'B', value: 1 }] },
        { type: 'funnel', minSize: '70%', top: 20, label: { position: 'inside' }, data: [{ name: 'A', value: 2 }] },
      ],
    }, { mode: 'light', gap, description: 'Huni' }) as Json
    const [narrow, wide] = out.series as Json[]
    expect(narrow.minSize).toBe('60%')
    expect([narrow.top, narrow.bottom]).toEqual([8, 8])
    expect(wide.minSize).toBe('70%')
    expect(wide.top).toBe(20)
  })

  it('ekran seçeneği büyük yazıyı küçültmez ve yazı boyutu eklemez, piksel yazısını okur', () => {
    const out = readableOption({
      baseOption: { series: [{ type: 'bar', data: [1], label: { show: true, fontSize: 18 } }], legend: { textStyle: { fontSize: '20px' } } },
      media: [{ query: { maxWidth: 520 }, option: { series: [{ label: { show: false } }], legend: { textStyle: { fontSize: '12px' } } } }],
    }, { mode: 'light', gap, description: 'Ekran' }) as Json
    const base = out.baseOption as Json
    expect(((base.series as Json[])[0].label as Json).fontSize).toBe(18)
    expect(((base.legend as Json).textStyle as Json).fontSize).toBe(20)
    const media = (out.media as Json[])[0].option as Json
    expect(((media.series as Json[])[0].label as Json).fontSize).toBeUndefined()
    expect(((media.legend as Json).textStyle as Json).fontSize).toBe(font.helper)
  })

  it('dilim yazı rengini yalnız yazı dilimin içindeyse verir', () => {
    const out = readableOption({
      series: [
        { type: 'pie', data: [{ name: 'A', value: 1 }] },
        { type: 'funnel', label: { position: 'inside' }, data: [{ name: 'B', value: 1 }] },
      ],
    }, { mode: 'light', gap, description: 'Dilim' }) as Json
    const [pie, funnel] = (out.series as Json[]).map((x) => (x.data as Json[])[0])
    expect((pie.label as Json | undefined)?.color).toBeUndefined()
    expect((pie.itemStyle as Json).color).toBe(chartSequence('light', 1)[0].color)
    expect((funnel.label as Json).color).toBe(chartSequence('light', 1)[0].text)
  })

  it('huninin dar basamak sınırı yalnız yazı içerideyse uygulanır', () => {
    const out = readableOption({
      series: [{ type: 'funnel', minSize: '10%', label: { position: 'left' }, data: [{ name: 'A', value: 1 }] }],
    }, { mode: 'light', gap, description: 'Huni' }) as Json
    expect((out.series as Json[])[0].minSize).toBe('10%')
  })
})

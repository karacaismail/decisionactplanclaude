import { describe, expect, it } from 'vitest'
import models from './models.json'
import howto from './models-howto.json'
import { STEP_LIST } from './steps'
import { FOUNDATION_DECISIONS } from './stages'
import type { HowTo } from './howto'

interface Entry { g: number; title: string; simple: string | null; example: { title: string; text: string } | null; help?: boolean }
const ALL = models as Entry[]
const HELP = howto as HowTo[]
const preStrategy = [...new Set(STEP_LIST.filter((s) => FOUNDATION_DECISIONS.includes(s.decision)).flatMap((s) => s.models))].sort((a, b) => a - b)

/** Yalın yazım kuralının makineyle bakılabilen kısmı. */
const FORBIDDEN: [RegExp, string][] = [
  [/—|–/, 'uzun çizgi'],
  [/;/, 'noktalı virgül'],
  [/→/, 'ok'],
  [/(^|[\s"“(])(sen|senin|sana|seni|sende|senden)([\s.,!?”")]|$)/i, '"sen" hitabı'],
  [/m[ae]ktad[ıi]r/i, '-mektedir kalıbı'],
]
const problems = (text: string): string[] => FORBIDDEN.filter(([re]) => re.test(text)).map(([, why]) => why)
const words = (text: string): number => text.trim().split(/\s+/).length

describe('yöntem yardımı', () => {
  it('strateji öncesi adımlara bağlı her yöntemin yardımı vardır', () => {
    expect(preStrategy.length).toBeGreaterThan(0)
    expect(HELP.map((h) => h.g).sort((a, b) => a - b)).toEqual(preStrategy)
    expect(ALL.filter((m) => m.help).map((m) => m.g).sort((a, b) => a - b)).toEqual(preStrategy)
  })

  it('her yardımda en az bir uygulama adımı vardır', () => {
    for (const h of HELP) {
      expect([h.g, h.steps.length > 0]).toEqual([h.g, true])
      for (const s of h.steps) expect([h.g, Boolean(s.title.trim() && s.text.trim())]).toEqual([h.g, true])
    }
  })

  it('adım başlıkları kısadır', () => {
    const long = HELP.flatMap((h) => h.steps.filter((s) => words(s.title) > 7).map((s) => `${h.g}: ${s.title}`))
    expect(long).toEqual([])
  })

  it('yardım metinleri "siz" diye ve yalın yazılmıştır', () => {
    const hits: string[] = []
    for (const h of HELP) {
      const texts = [...h.steps.flatMap((s) => [s.title, s.text]), ...h.warn, ...h.tip]
      for (const t of texts) for (const why of problems(t)) hits.push(`${h.g}: ${why}: ${t.slice(0, 60)}`)
    }
    expect(hits).toEqual([])
  })

  it('yardımı olan yöntemin kısa özeti ve örneği de aynı dille yazılmıştır', () => {
    const hits: string[] = []
    for (const m of ALL.filter((x) => x.help)) {
      for (const t of [m.simple ?? '', m.example?.text ?? '']) for (const why of problems(t)) hits.push(`${m.g}: ${why}: ${t.slice(0, 60)}`)
    }
    expect(hits).toEqual([])
  })
})

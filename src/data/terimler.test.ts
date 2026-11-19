import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Terim sözlüğü kuralı. Ayrıntı: docs/terim-sozlugu.md.
 * Eski terimler ekranda, raporda ve yardım metninde görünmez.
 * Kod adları, dosya adları ve "/gecis" ile "/devir" yolları korunur.
 * Bu yüzden test yorumları siler ve yalnız kalan metne bakar.
 */
const ROOT = join(__dirname, '..', '..')
const SELF = 'src/data/terimler.test.ts'

const OLD_TERMS: [RegExp, string][] = [
  [/[Gg]eçiş kapı/, '"Geçiş kapısı" yerine "Hazırlık kontrolü"'],
  [/[Gg]eçiş kararı/, '"Geçiş kararı" yerine "Hazırlık kararı"'],
  /* "Sahte kapı" bir deneme yöntemidir. Ürün kontrolü anlamına gelmez. */
  [/(?<![\p{L}])(?<![Ss]ahte )[Kk]apı/u, '"Kapı" yerine "Kontrol"'],
  /* Tırnak içindeki tek "pist" kod adıdır. Örnek: key: 'pist'. */
  [/(?<![\p{L}.])Pist|(?<![\p{L}.])pist(?!['"`])|(?<![\p{L}.'"`])pist/u, '"Pist" yerine "Kasa süresi"'],
  /* Karar 8 işin devrini anlatır. Bu "devir" kalır. Yalnız rapor adı değişir. */
  [/[Dd]evir rapor|[Ss]trateje devir/, '"Devir raporu" yerine "Teslim raporu"'],
  [/[Dd]oğrulama seviye/, '"Doğrulama seviyesi" yerine "Kanıt düzeyi"'],
  [/Hesap tutuyor/, '"Hesap tutuyor" yerine "Hesap tutarlı"'],
  [/[Tt]emel taş/, '"Temel taşları" yerine "Temel sorular"'],
]

/*
 * Yöntem kitaplığı genel yöntemleri anlatır. Oradaki "kapı" gerçek kapıdır.
 * Bu yüzden models.json ve models-howto.json taranmaz.
 */
const SKIP = new Set([SELF, 'src/data/models.json', 'src/data/models-howto.json'])

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return walk(full)
    return /\.(tsx?|json)$/.test(name) ? [full] : []
  })

/** Yorumları siler. Adresteki "//" korunur. */
const stripComments = (text: string): string =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '')
    .replace(/(^|[^:'"`])\/\/.*$/gm, '$1')

const files = [...walk(join(ROOT, 'src')), join(ROOT, 'index.html')].filter((f) => !SKIP.has(relative(ROOT, f)))

/* Proje modülünün görünen metni. Test dosyaları taranmaz. */
const moduleFiles = walk(join(ROOT, 'src', 'modules', 'proje')).filter((f) => !/\.test\.tsx?$/.test(f))
/* "iş" ile başlayan söz. "işlem" ve "işaret" başka sözlerdir. */
const PROJECT_TASK_WORD = /(?<![\p{L}])[İi]ş(?!lem|aret)\p{L}*/u
/* Strateji uygulamadaki işleri anlatan sözler. Bu sözler "iş" olarak kalır. */
const STRATEGY_TASK_PHRASES = [/İlk 90 günün iş(?:i|leri)/gu, /Bu işten proje aç/gu, /Bu işe bağlı/gu, /uygulamadaki şu işe bağlı/gu, /Bu işler strateji uygulamadaki/gu, /Büyük bir işi projeye/gu]
const withoutStrategyTasks = (line: string) => STRATEGY_TASK_PHRASES.reduce((text, re) => text.replace(re, ''), line)

describe('terim sözlüğü', () => {
  it('görünen metinde eski terim kalmaz', () => {
    const found: string[] = []
    for (const file of files) {
      const lines = stripComments(readFileSync(file, 'utf8')).split('\n')
      lines.forEach((line, i) => {
        for (const [re, why] of OLD_TERMS) {
          if (re.test(line)) found.push(`${relative(ROOT, file)}:${i + 1} ${why}: ${line.trim().slice(0, 120)}`)
        }
      })
    }
    expect(found).toEqual([])
  })

  /*
   * Projenin küçük çalışmalarının adı "Görev" olur. "İş" sözü strateji uygulamadaki işlerindir.
   * Örneğin "İlk 90 günün işleri" ve "Bu işten proje aç" bu işleri anlatır. Bu sözler kalır.
   * "işlem" başka bir sözdür. Örneğin "Bu işlem geri alınamaz." cümlesi kalır.
   */
  it('proje modülünde projenin çalışmalarına "iş" denmez', () => {
    const found: string[] = []
    for (const file of moduleFiles) {
      const lines = stripComments(readFileSync(file, 'utf8')).split('\n')
      lines.forEach((line, i) => {
        if (PROJECT_TASK_WORD.test(withoutStrategyTasks(line))) found.push(`${relative(ROOT, file)}:${i + 1} "iş" yerine "görev": ${line.trim().slice(0, 120)}`)
      })
    }
    expect(found).toEqual([])
  })

  it('proje görevi kuralı doğru sözleri yakalar', () => {
    const hit = (text: string) => PROJECT_TASK_WORD.test(withoutStrategyTasks(stripComments(text)))
    expect(hit("'Yeni iş'")).toBe(true)
    expect(hit("'İş ekle'")).toBe(true)
    expect(hit("'Henüz iş yok.'")).toBe(true)
    expect(hit("'Görev ekle'")).toBe(false)
    expect(hit("'Bu işlem geri alınamaz.'")).toBe(false)
    expect(hit("'İlk 90 günün işleri'")).toBe(false)
    expect(hit('`Bu işten proje aç: ${t}`')).toBe(false)
    expect(hit("const isler = []")).toBe(false)
  })

  it('test eski terimleri yakalar', () => {
    const hit = (text: string) => OLD_TERMS.some(([re]) => re.test(stripComments(text)))
    expect(hit("title: 'Geçiş kapısı'")).toBe(true)
    expect(hit("label: 'Kapı 6'")).toBe(true)
    expect(hit("'beş temel kapı'")).toBe(true)
    expect(hit("'Pist ay olarak'")).toBe(true)
    expect(hit("'Strateje devir raporu'")).toBe(true)
    expect(hit("'Doğrulama seviyesi'")).toBe(true)
    expect(hit("'Hesap tutuyor'")).toBe(true)
    expect(hit("'20 temel taşı'")).toBe(true)
    expect(hit("'Sahte kapı sayfası'")).toBe(false)
    expect(hit("key: 'pist'")).toBe(false)
    expect(hit("'Devir ve kapanış'")).toBe(false)
    expect(hit("to=\"/devir\"")).toBe(false)
    expect(hit("className=\"devir-page\"")).toBe(false)
    expect(hit('// Geçiş kapısı yorumu')).toBe(false)
    expect(hit("'Hazırlık kontrolü'")).toBe(false)
  })
})

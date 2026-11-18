import { describe, expect, it } from 'vitest'
// @ts-expect-error JavaScript modülü, tip bildirimi yok.
import { checkCssArchitecture } from './check-css-architecture.mjs'

/* Kapıya sahte bir proje verilir. Anahtar dosya yolu, değer dosya içeriğidir. */
function check(files: Record<string, string>) {
  return checkCssArchitecture(new Map(Object.entries(files))) as string[]
}

const valid = {
  'src/main.tsx': "import './styles/temel/temel.css'\nimport { loadInputStyles } from './app/girisStilleri'",
  'src/app/AppShell.tsx': "import '@/styles/kabuk/kabuk.css'",
  'src/app/girisStilleri.ts': "const a = () => import('@/styles/giris/dokunma.css')\nconst b = () => import('@/styles/giris/fare.css')",
  'src/components/PageHeader.tsx': "import '@/styles/bilesen/PageHeader.css'",
  'src/screens/WorkScreen.tsx': "import '@/styles/desen/pano-card.css'\nimport '@/styles/ekran/WorkScreen.css'",
  'src/styles/desen/pano-card.css': '.pano-card { margin: 0; }',
  'src/screens/reports/OutputsContent.tsx': "import '@/styles/ekran/OutputsContent.css'\nimport '@/styles/yazdirma/yazdirma.css'",
  'src/styles/temel/temel.css': ':root { --a: 1px; }',
  'src/styles/kabuk/kabuk.css': '.topbar { color: red; }',
  'src/styles/bilesen/PageHeader.css': '.page-header { margin: 0; }',
  'src/styles/ekran/WorkScreen.css': '.work-page { margin: 0; }',
  'src/styles/ekran/OutputsContent.css': '.outputs { margin: 0; }',
  'src/styles/yazdirma/yazdirma.css': '@media print { .x { display: none; } }',
  'src/styles/giris/dokunma.css': '/* not */\n@media (any-pointer: coarse) { .a:active { opacity: 0.8; } }',
  'src/styles/giris/fare.css': '@media (any-pointer: fine) and (any-hover: hover) { .a:hover { color: blue; } }',
}

describe('CSS mimari kapısı', () => {
  it('düzenli projede hata bulmaz', () => {
    expect(check(valid)).toEqual([])
  })

  it('altı klasörün dışındaki CSS dosyasını bulur', () => {
    const errors = check({ ...valid, 'src/styles/global.css': '.a {}', 'src/main.tsx': valid['src/main.tsx'] + "\nimport './styles/global.css'" })
    expect(errors.join('\n')).toMatch(/src\/styles\/global\.css.*izinli klasör/)
  })

  it('başka ekranın CSS dosyasını içe aktaran ekranı bulur', () => {
    const errors = check({ ...valid, 'src/screens/PlansScreen.tsx': "import '@/styles/ekran/WorkScreen.css'" })
    expect(errors.join('\n')).toMatch(/PlansScreen\.tsx.*ekran\/WorkScreen\.css/)
  })

  it('başka bileşenin CSS dosyasını içe aktaran bileşeni bulur', () => {
    const errors = check({ ...valid, 'src/components/StatTile.tsx': "import '@/styles/bilesen/PageHeader.css'" })
    expect(errors.join('\n')).toMatch(/StatTile\.tsx.*bilesen\/PageHeader\.css/)
  })

  it('temel ve kabuk katmanını yanlış yerden içe aktarmayı bulur', () => {
    const errors = check({ ...valid, 'src/screens/WorkScreen.tsx': valid['src/screens/WorkScreen.tsx'] + "\nimport '@/styles/temel/temel.css'\nimport '@/styles/kabuk/kabuk.css'" })
    expect(errors.join('\n')).toMatch(/WorkScreen\.tsx.*temel\/temel\.css/)
    expect(errors.join('\n')).toMatch(/WorkScreen\.tsx.*kabuk\/kabuk\.css/)
  })

  it('giriş katmanını yükleyiciden başka yerden içe aktarmayı bulur', () => {
    const errors = check({ ...valid, 'src/main.tsx': valid['src/main.tsx'] + "\nimport './styles/giris/fare.css'" })
    expect(errors.join('\n')).toMatch(/main\.tsx.*giris\/fare\.css/)
  })

  it('giriş dosyasında kendi sorgusunun dışındaki kuralı bulur', () => {
    const errors = check({ ...valid, 'src/styles/giris/fare.css': '.a:hover { color: blue; }\n@media (any-pointer: fine) and (any-hover: hover) { .b:hover { color: red; } }' })
    expect(errors.join('\n')).toMatch(/giris\/fare\.css.*sorgu/)
  })

  it('giriş dosyasında yanlış sorguyu bulur', () => {
    const errors = check({ ...valid, 'src/styles/giris/dokunma.css': '@media (min-width: 600px) { .a { color: red; } }' })
    expect(errors.join('\n')).toMatch(/giris\/dokunma\.css.*sorgu/)
  })

  it('deseni kabuk ve temel dışındaki uygulama dosyasından içe aktarmayı bulur', () => {
    const errors = check({ ...valid, 'src/data/x.ts': "import '@/styles/desen/pano-card.css'" })
    expect(errors.join('\n')).toMatch(/data\/x\.ts.*desen\/pano-card\.css/)
  })

  it('hiçbir yerden içe aktarılmayan CSS dosyasını bulur', () => {
    const errors = check({ ...valid, 'src/styles/ekran/EskiEkran.css': '.a {}' })
    expect(errors.join('\n')).toMatch(/ekran\/EskiEkran\.css.*kullanılmıyor/)
  })
})

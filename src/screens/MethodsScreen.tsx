import { useMemo, useState } from 'react'
import { Button, Input, Select } from 'antd'
import { MagnifyingGlass } from '@phosphor-icons/react'
import models from '@/data/models.json'
import { STEP_LIST } from '@/data/steps'
import type { StepDef } from '@/data/schema'
import { useCurrentPlan } from '@/store/planStore'
import { ModelCard, type ModelEntry } from '@/components/ModelCard'
import { PageHeader, SectionHead } from '@/components/PageHeader'
import '@/styles/screens-rapor.css'

const ALL = models as ModelEntry[]
const TUMU = '__tumu__'

/** Bölümler kitaptaki sırayla. */
const SECTIONS = [...new Map(ALL.map((m) => [m.section, m.sectionNo])).entries()].sort((a, b) => a[1] - b[1]).map(([section, sectionNo]) => ({ section, sectionNo }))

/** Yöntem sırasından (1 ile 128) o yöntemi kullanan adımlara. */
const STEPS_BY_MODEL: Record<number, StepDef[]> = {}
for (const step of STEP_LIST) for (const g of step.models) (STEPS_BY_MODEL[g] ??= []).push(step)

const lower = (s: string) => s.toLocaleLowerCase('tr')

/** Bir sayfada gösterilen yöntem sayısı. "24 yöntem daha göster" düğmesi bu kadar ekler. */
export const PAGE = 24

/**
 * Sayının iyelik eki: 24'ü, 48'i, 72'si, 96'sı, 128'i. Ek son okunan rakama ya da basamağa göre seçilir.
 */
export function possessive(n: number): string {
  if (n === 0) return 'ı'
  const ones = n % 10
  const tens = Math.floor((n % 100) / 10)
  if (ones !== 0) return ['', 'i', 'si', 'ü', 'ü', 'i', 'sı', 'si', 'i', 'u'][ones]
  if (tens !== 0) return ['', 'u', 'si', 'u', 'ı', 'si', 'ı', 'i', 'i', 'ı'][tens]
  const hundreds = Math.floor((n % 1000) / 100)
  return hundreds !== 0 ? 'ü' : 'i'
}

/** Karar Kitabı. 128 yöntem. Arama, bölüm süzgeci ve bölüm başlıklı liste. İlk 24 kart görünür. */
export function MethodsScreen() {
  const plan = useCurrentPlan()
  const [query, setQueryState] = useState('')
  const [section, setSectionState] = useState<string>(TUMU)
  const [shown, setShown] = useState(PAGE)
  /* Arama ya da bölüm değişince sayfalama başa döner. */
  const setQuery = (q: string) => { setQueryState(q); setShown(PAGE) }
  const setSection = (sec: string) => { setSectionState(sec); setShown(PAGE) }

  const filtered = useMemo(() => {
    const q = lower(query.trim())
    return ALL.filter((m) => (section === TUMU || m.section === section) && (!q || lower(`${m.title} ${m.question} ${m.summary} ${m.simple ?? ''}`).includes(q)))
  }, [query, section])

  const sorted = useMemo(() => [...filtered].sort((a, b) => a.sectionNo - b.sectionNo || a.no - b.no), [filtered])
  const visible = useMemo(() => sorted.slice(0, shown), [sorted, shown])
  const remaining = sorted.length - visible.length
  const grouped = useMemo(() => SECTIONS.map((s) => ({ ...s, items: visible.filter((m) => m.section === s.section) })).filter((s) => s.items.length > 0), [visible])

  return (
    <div className="page">
      <PageHeader kicker="Kitaplık" title="Karar Kitabı" description="Kitapta 128 yöntem var. Her yöntem bir soruya cevap verir. Yöntemi arayın ya da bölüm seçin." />

      <section className="section" aria-label="Yöntem listesi">
        <div className="toolbar" style={{ justifyContent: 'flex-start' }}>
          <div className="filter-field">
            <label className="field-label" htmlFor="yontem-ara">Yöntem ara</label>
            <Input id="yontem-ara" allowClear prefix={<MagnifyingGlass size={16} aria-hidden />} placeholder="Başlık, soru veya özet" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="filter-field" style={{ maxWidth: 280 }}>
            <label className="field-label" htmlFor="bolum-sec">Bölüm</label>
            <Select
              id="bolum-sec"
              value={section}
              onChange={setSection}
              options={[{ value: TUMU, label: 'Bütün bölümler' }, ...SECTIONS.map((s) => ({ value: s.section, label: s.section }))]}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <span className="helper tabular" role="status">
          {filtered.length === ALL.length
            ? `${ALL.length} yöntemden ${visible.length}'${possessive(visible.length)} görünüyor.`
            : `${filtered.length} yöntem bulundu. ${visible.length}'${possessive(visible.length)} görünüyor.`}
        </span>
        {grouped.length === 0 ? (
          <div className="empty-state" role="status">
            <h2>Yöntem bulunamadı</h2>
            <p>Bu arama için yöntem yok. Başka bir kelime deneyin ya da bölümü “Bütün bölümler” yapın.</p>
          </div>
        ) : null}
      </section>

      {grouped.map((s) => (
        <section key={s.section} className="section" aria-label={s.section}>
          <SectionHead title={s.section} actions={<span className="helper tabular">{s.items.length} yöntem</span>} />
          <div className="method-grid">
            {s.items.map((m) => <ModelCard key={m.g} model={m} steps={STEPS_BY_MODEL[m.g] ?? []} linkSteps={Boolean(plan)} />)}
          </div>
        </section>
      ))}

      {remaining > 0 ? (
        <section className="section method-more" aria-label="Daha fazla yöntem">
          <Button onClick={() => setShown((n) => n + PAGE)}>{Math.min(PAGE, remaining)} yöntem daha göster</Button>
        </section>
      ) : null}
    </div>
  )
}

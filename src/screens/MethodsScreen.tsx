import { useMemo, useState } from 'react'
import { Input, Select, Typography, theme } from 'antd'
import { MagnifyingGlass } from '@phosphor-icons/react'
import models from '@/data/models.json'
import { STEP_LIST } from '@/data/steps'
import type { StepDef } from '@/data/schema'
import { useCurrentPlan } from '@/store/planStore'
import { ModelCard, type ModelEntry } from '@/components/ModelCard'

const ALL = models as ModelEntry[]
const TUMU = '__tumu__'

/** Bölümler kitaptaki sırayla. */
const SECTIONS = [...new Map(ALL.map((m) => [m.section, m.sectionNo])).entries()].sort((a, b) => a[1] - b[1]).map(([section, sectionNo]) => ({ section, sectionNo }))

/** Yöntem sırasından (1 ile 128) o yöntemi kullanan adımlara. */
const STEPS_BY_MODEL: Record<number, StepDef[]> = {}
for (const step of STEP_LIST) for (const g of step.models) (STEPS_BY_MODEL[g] ??= []).push(step)

const lower = (s: string) => s.toLocaleLowerCase('tr')

/** Karar Kitabı. 128 yöntem. Arama, bölüm filtresi ve bölüm başlıklı liste. */
export function MethodsScreen() {
  const { token } = theme.useToken()
  const plan = useCurrentPlan()
  const [query, setQuery] = useState('')
  const [section, setSection] = useState<string>(TUMU)

  const filtered = useMemo(() => {
    const q = lower(query.trim())
    return ALL.filter((m) => (section === TUMU || m.section === section) && (!q || lower(`${m.title} ${m.question} ${m.summary} ${m.simple ?? ''}`).includes(q)))
  }, [query, section])

  const grouped = useMemo(() => SECTIONS.map((s) => ({ ...s, items: filtered.filter((m) => m.section === s.section).sort((a, b) => a.no - b.no) })).filter((s) => s.items.length > 0), [filtered])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
        <Typography.Title level={1} style={{ fontSize: 32, marginBottom: 0 }}>Karar Kitabı</Typography.Title>
        <Typography.Text style={{ color: token.colorTextSecondary }}>Kitapta 128 yöntem var. Her yöntem bir soruya cevap verir. Yöntemi arayın ya da bölüm seçin.</Typography.Text>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
        <label htmlFor="yontem-ara" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Yöntem ara</span>
          <Input id="yontem-ara" aria-label="Yöntem ara" allowClear prefix={<MagnifyingGlass size={18} aria-hidden />} placeholder="Başlık, soru veya özet" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label htmlFor="bolum-sec" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Bölüm seçin</span>
          <Select
            id="bolum-sec"
            aria-label="Bölüm seçin"
            value={section}
            onChange={setSection}
            options={[{ value: TUMU, label: 'Bütün bölümler' }, ...SECTIONS.map((s) => ({ value: s.section, label: s.section }))]}
            style={{ width: '100%' }}
          />
        </label>
      </div>

      <Typography.Text role="status" style={{ fontSize: 14, color: token.colorTextSecondary }}>
        {filtered.length === ALL.length ? `${ALL.length} yöntemin hepsi görünüyor.` : `${ALL.length} yöntemden ${filtered.length} tanesi görünüyor.`}
      </Typography.Text>

      {grouped.length === 0 ? (
        <Typography.Text style={{ fontSize: 16 }}>Bu arama için yöntem bulunamadı. Başka bir kelime deneyin.</Typography.Text>
      ) : (
        grouped.map((s) => (
          <section key={s.section} aria-labelledby={`bolum-${s.sectionNo}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <Typography.Title level={2} id={`bolum-${s.sectionNo}`} style={{ fontSize: 24, margin: 0 }}>{s.section}</Typography.Title>
              <span style={{ fontSize: 14, color: token.colorTextSecondary }}>{s.items.length} yöntem</span>
            </div>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
              {s.items.map((m) => <ModelCard key={m.g} model={m} steps={STEPS_BY_MODEL[m.g] ?? []} linkSteps={Boolean(plan)} />)}
            </div>
          </section>
        ))
      )}
    </div>
  )
}

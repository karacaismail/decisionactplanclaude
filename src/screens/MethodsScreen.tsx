import { useMemo, useRef, useState } from 'react'
import { Badge, Input, Pagination, Tabs, Empty, Grid } from 'antd'
import models from '@/data/models.json'
import { STEP_LIST } from '@/data/steps'
import type { StepDef } from '@/data/schema'
import { useCurrentPlan } from '@/store/planStore'
import { ModelCard, type ModelEntry } from '@/components/ModelCard'
import { PageHeader } from '@/components/PageHeader'
import '@/styles/screens-rapor.css'

const ALL = models as ModelEntry[]
const TUMU = '__tumu__'

/** Bölümler kitaptaki sırayla. */
const SECTIONS = [...new Map(ALL.map((m) => [m.section, m.sectionNo])).entries()].sort((a, b) => a[1] - b[1]).map(([section, sectionNo]) => ({ section, sectionNo }))

/** Yöntem sırasından (1 ile 128) o yöntemi kullanan adımlara. */
const STEPS_BY_MODEL: Record<number, StepDef[]> = {}
for (const step of STEP_LIST) for (const g of step.models) (STEPS_BY_MODEL[g] ??= []).push(step)

const lower = (s: string) => s.toLocaleLowerCase('tr')

/** Bir sayfada gösterilen yöntem sayısı. */
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

/** Sekme etiketi: bölüm adı ve yöntem sayısı rozeti. */
function TabLabel({ text, count }: { text: string; count: number }) {
  return (
    <span className="method-tab">
      {text}
      <Badge count={count} showZero overflowCount={999} size="small" className="method-badge" aria-label={`${count} yöntem`} />
    </span>
  )
}

/**
 * Karar Kitabı. 128 yöntem. Bölüm sekmeleri, arama kutusu ve kart ızgarası.
 * Masaüstünde üç sütun, telefonda tek sütun. Sayfada 24 kart; sayfa değişince liste başına kaydırılır.
 */
export function MethodsScreen() {
  const plan = useCurrentPlan()
  const bp = Grid.useBreakpoint()
  const [query, setQueryState] = useState('')
  const [section, setSectionState] = useState<string>(TUMU)
  const [pageNo, setPageNo] = useState(1)
  const listRef = useRef<HTMLDivElement>(null)
  /* Arama ya da bölüm değişince sayfalama başa döner. */
  const setQuery = (q: string) => { setQueryState(q); setPageNo(1) }
  const setSection = (sec: string) => { setSectionState(sec); setPageNo(1) }

  const searched = useMemo(() => {
    const q = lower(query.trim())
    return ALL.filter((m) => !q || lower(`${m.title} ${m.question} ${m.summary} ${m.simple ?? ''}`).includes(q))
  }, [query])
  const countOf = (sec: string) => (sec === TUMU ? searched.length : searched.filter((m) => m.section === sec).length)
  const filtered = useMemo(() => searched.filter((m) => section === TUMU || m.section === section), [searched, section])
  const sorted = useMemo(() => [...filtered].sort((a, b) => a.sectionNo - b.sectionNo || a.no - b.no), [filtered])
  const start = (pageNo - 1) * PAGE
  const visible = sorted.slice(start, start + PAGE)

  const changePage = (n: number) => {
    setPageNo(n)
    /* Sayfa değişince liste başına dönülür. Hareket azaltma tercihi varsa kaydırma anında olur. */
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    listRef.current?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <div className="page page-rapor">
      <PageHeader kicker="Kitaplık" title="Karar Kitabı" description="Kitapta 128 yöntem var. Her yöntem bir soruya cevap verir. Yöntemi arayın ya da bölüm seçin." />

      <div className="method-tools" ref={listRef}>
        <label className="field-label" htmlFor="yontem-ara">Yöntem ara</label>
        <Input.Search id="yontem-ara" allowClear placeholder="Başlık, soru veya özet" value={query} onChange={(e) => setQuery(e.target.value)} onSearch={setQuery} className="method-search" />
        <Tabs
          className="method-tabs"
          activeKey={section}
          onChange={setSection}
          items={[
            { key: TUMU, label: <TabLabel text="Hepsi" count={countOf(TUMU)} /> },
            ...SECTIONS.map((s) => ({ key: s.section, label: <TabLabel text={s.section} count={countOf(s.section)} /> })),
          ]}
        />
        <span className="helper tabular" role="status">
          {sorted.length === 0
            ? 'Bu arama için yöntem yok.'
            : sorted.length <= PAGE
              ? `${sorted.length} yöntem görünüyor.`
              : `${sorted.length} yöntemden ${start + 1} ile ${start + visible.length} arası görünüyor.`}
        </span>
      </div>

      {visible.length === 0 ? (
        <Empty description={<span className="insight-empty-text">Bu arama için yöntem yok. Başka bir kelime deneyin ya da “Hepsi” sekmesine dönün.</span>} />
      ) : (
        <section className="method-grid" aria-label="Yöntem listesi">
          {visible.map((m) => <ModelCard key={m.g} model={m} steps={STEPS_BY_MODEL[m.g] ?? []} linkSteps={Boolean(plan)} />)}
        </section>
      )}

      {sorted.length > PAGE ? (
        <nav className="method-pagination" aria-label="Sayfalar">
          <Pagination current={pageNo} total={sorted.length} pageSize={PAGE} onChange={changePage} showSizeChanger={false} simple={!bp.sm} />
        </nav>
      ) : null}
    </div>
  )
}

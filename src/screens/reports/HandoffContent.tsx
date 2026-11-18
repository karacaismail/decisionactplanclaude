import '@/styles/desen/kapi-ortak.css'
import '@/styles/desen/kapi.css'
import '@/styles/desen/cikti-ortak.css'
import '@/styles/ekran/HandoffContent.css'
import '@/styles/yazdirma/yazdirma.css'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button, Collapse, Descriptions, Empty, Grid, Progress, Segmented, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link, useNavigate } from 'react-router'
import { CheckCircle, CircleHalf, DownloadSimple, FileCode, Printer, XCircle } from '@phosphor-icons/react'
import { useCurrentPlan } from '@/store/planStore'
import { stepPath } from '@/data/registry'
import { TRANSITION_LABEL } from '@/data/types'
import {
  CONFIDENCE_LABEL,
  DOOR_LABEL,
  NO_PATHS,
  pathBasis,
  STATUS_LABEL,
  buildHandoffReport,
  handoffToMarkdown,
  type Claim,
  type ClaimStatus,
  type Confidence,
  type CoverageStatus,
  type Door,
  type OpenDecision,
  type PathColumn,
  type SensitivityRow,
} from '@/reports/handoff'
import { CONDITION_LABEL, DISSENT_LABEL, RELATION_LABEL, type ConditionStatus } from '@/engine/crux'
import { BLIND_SPOT_LABEL } from '@/engine/blindspots'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
/** İçindekiler ve bölüm kimlikleri. Sıra raporun sırasıdır. */
const SECTIONS = [
  { id: 'devir-karar', toc: '1. Karar sorusu' },
  { id: 'devir-dayanaklar', toc: '2. Dayanaklar' },
  { id: 'devir-sinirlar', toc: '3. Bağlayıcı sınırlar' },
  { id: 'devir-yollar', toc: '4. Karşılaştırılacak yollar' },
  { id: 'devir-eksik', toc: '5. Eksik bilgi' },
  { id: 'devir-kapsam', toc: 'Ek 1. Kapsam' },
  { id: 'devir-ilk-gun', toc: "Ek 2. Stratej'in ilk günü" },
  { id: 'devir-alti-soru', toc: 'Ek 3. Altı soru' },
] as const


type Filter = 'hepsi' | ClaimStatus
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'hepsi', label: 'Hepsi' },
  { value: 'kaynakli', label: STATUS_LABEL.kaynakli },
  { value: 'hesap', label: STATUS_LABEL.hesap },
  { value: 'karar', label: STATUS_LABEL.karar },
  { value: 'varsayim', label: STATUS_LABEL.varsayim },
]
const STATUS_COLOR: Record<ClaimStatus, string | undefined> = { kaynakli: 'success', hesap: 'processing', karar: undefined, varsayim: 'warning' }
const CONFIDENCE_COLOR: Record<Confidence, string | undefined> = { yuksek: 'success', orta: undefined, dusuk: 'warning', kanitsiz: 'error' }
const COVERAGE_TEXT: Record<CoverageStatus, string> = { dolu: 'Dolu', kismen: 'Kısmen dolu', bos: 'Boş' }

/**
 * Yerleşim, ekranın değil rapor sütununun genişliğine bakar. Solda yol dizini, sağda içindekiler durabilir.
 * "liste": telefon, tablolar blok olur. "orta": dar tablo. "genis": bütün sütunlar yan yana.
 */
type Density = 'liste' | 'orta' | 'genis'
const LIST_MAX = 560
const WIDE_MIN = 920

function useDensity(fallbackNarrow: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const density: Density = width === null ? (fallbackNarrow ? 'liste' : 'orta') : width < LIST_MAX ? 'liste' : width < WIDE_MIN ? 'orta' : 'genis'
  return { ref, density }
}

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9ğüşöçı]+/gi, '-').replace(/^-+|-+$/g, '') || 'plan'
}

/** Adım numarasına gelen belirtme eki. Örneğin "18'i", "02'yi", "09'u". */
function accusative(step: string): string {
  const n = Number(step)
  if (!Number.isInteger(n) || n <= 0) return "'i"
  const unit = ['', "'i", "'yi", "'ü", "'ü", "'i", "'yı", "'yi", "'i", "'u"]
  const ten = ['', "'u", "'yi", "'u", "'ı", "'yi", "'ı", "'i", "'i", "'ı"]
  return n % 10 ? unit[n % 10] : ten[Math.floor(n / 10) % 10] || "'ü"
}

function StepLink({ step }: { step: string }) {
  return <Link className="devir-step-link no-print" to={stepPath(step)}>Adım {step}{accusative(step)} aç</Link>
}

/** Eksik bilgi uydurulmaz. Yerine bu cümle ve ilgili adımın bağlantısı gelir. */
function Missing({ step, text = 'Henüz yazılmadı.' }: { step: string; text?: string }) {
  return <p className="helper devir-missing">{text} <StepLink step={step} /></p>
}

const doorTag = (d: Door | null): ReactNode => (d ? <Tag color={d === 'ciftYonlu' ? 'success' : 'error'}>{DOOR_LABEL[d]}</Tag> : <span className="devir-none">Yazılmadı</span>)
const CONDITION_COLOR: Record<ConditionStatus, string | undefined> = { sinanmadi: undefined, destek: 'success', karsi: 'error', celiski: 'warning' }
const orNone = (x: string | null | undefined): ReactNode => (x ? x : <span className="devir-none">Yazılmadı</span>)
const sourceText = (c: Claim): string | null => (c.source ? `${c.source}${c.date ? `, ${c.date}` : ''}` : null)

interface RecordColumn<T> {
  title: string
  render: (row: T) => ReactNode
  width?: number
}

/**
 * Kayıt listesi. Geniş ekranda tablo olur ve kendi kabında yatay kayar.
 * Telefonda her kayıt bir blok olur: ilk sütun başlık, öteki sütunlar başlık ve değer çiftidir.
 */
function Records<T>({ rows, columns, narrow, label }: { rows: T[]; columns: RecordColumn<T>[]; narrow: boolean; label: string }) {
  if (narrow) {
    const [head, ...rest] = columns
    return (
      <ul className="devir-records" aria-label={label}>
        {rows.map((row, i) => (
          <li key={i}>
            <p className="devir-record-title">{head.render(row)}</p>
            <dl className="devir-pairs">
              {rest.map((c) => (
                <div key={c.title}>
                  <dt>{c.title}</dt>
                  <dd>{c.render(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    )
  }
  const total = columns.reduce((sum, c) => sum + (c.width ?? 160), 0)
  const cols: ColumnsType<T> = columns.map((c) => ({ title: c.title, key: c.title, width: c.width ?? 160, render: (_, row) => c.render(row) }))
  return <Table<T> className="devir-table" size="small" pagination={false} rowKey={(row) => String(rows.indexOf(row))} dataSource={rows} columns={cols} scroll={{ x: total }} aria-label={label} />
}

interface Measure {
  label: string
  render: (p: PathColumn, top: number | null) => ReactNode
}
/** Yolların karşılaştırıldığı ölçüler. En yüksek puan kalın yazılır; hiçbir yol önerilmez. */
const MEASURES: Measure[] = [
  { label: 'Kime ve nereden?', render: (p) => orNone(p.where) },
  { label: 'Neyle kazanılır?', render: (p) => orNone(p.how) },
  { label: 'Para nasıl kazanılır?', render: (p) => orNone(p.revenue) },
  { label: 'Nasıl kurulur?', render: (p) => orNone(p.vehicle) },
  { label: 'Neyden vazgeçilir?', render: (p) => orNone(p.giveUp) },
  { label: 'Destekleyen kanıt', render: (p) => orNone(p.evidence) },
  { label: 'Kanıtın türü', render: (p) => <span className="devir-basis"><Tag color={p.sourced ? 'success' : 'warning'}>{p.sourced ? 'Kaynaklı' : 'Varsayım'}</Tag>{pathBasis(p).replace(/^(Kaynaklı|Varsayım)\. /, '')}</span> },
  { label: 'Hangi sorudan çıktı?', render: (p) => orNone(p.origin) },
  { label: 'Bedeli ve süresi', render: (p) => orNone(p.cost) },
  { label: 'Geri alınabilir mi?', render: (p) => doorTag(p.reversible) },
  { label: 'Puan', render: (p, top) => (p.score === null ? orNone(null) : <span className={`tabular${p.score === top ? ' devir-score-top' : ''}`}>{p.score.toLocaleString('tr-TR')}</span>) },
]

function PathHead({ p }: { p: PathColumn }) {
  return (
    <span className="devir-path-head">
      <span>{p.name}</span>
      {p.baseline ? <Tag>Bugünkü durum</Tag> : null}
    </span>
  )
}

/** Yollar: geniş ekranda sütunlar yol adayıdır, satırlar ölçüdür. Telefonda her yol alt alta bir bloktur. */
function PathCompare({ paths, narrow }: { paths: PathColumn[]; narrow: boolean }) {
  const scores = paths.map((p) => p.score).filter((s): s is number => s !== null)
  const top = scores.length ? Math.max(...scores) : null
  if (narrow) {
    return (
      <div className="devir-path-blocks">
        {paths.map((p) => (
          <section key={p.id} className="devir-path" aria-label={p.name}>
            <h3 className="devir-sub"><PathHead p={p} /></h3>
            <dl className="devir-pairs">
              {MEASURES.map((m) => (
                <div key={m.label}>
                  <dt>{m.label}</dt>
                  <dd>{m.render(p, top)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    )
  }
  const columns: ColumnsType<Measure> = [
    { title: 'Ölçü', key: 'olcu', width: 144, fixed: 'start', rowScope: 'row', render: (_, m) => m.label },
    ...paths.map((p) => ({ title: <PathHead p={p} />, key: p.id, width: 168, render: (_: unknown, m: Measure) => m.render(p, top) })),
  ]
  return <Table<Measure> className="devir-table devir-compare" size="small" pagination={false} rowKey="label" dataSource={MEASURES} columns={columns} scroll={{ x: 144 + paths.length * 168 }} aria-label="Yolların karşılaştırması" />
}

const typeTag = (c: Claim) => <Tag className="devir-claim-type" color={STATUS_COLOR[c.status]}>{STATUS_LABEL[c.status]}</Tag>
const confidenceTag = (c: Claim) => <Tag color={CONFIDENCE_COLOR[c.confidence]}>{CONFIDENCE_LABEL[c.confidence]}</Tag>
const sourceLines = (c: Claim) => (
  <>
    <span className="devir-source">{sourceText(c) ? `Kaynak: ${sourceText(c)}.` : 'Kaynak yok.'}</span>
    {c.counter ? <span className="devir-source">Karşı bulgu: {c.counter}</span> : null}
  </>
)

/**
 * Dayanak cümleleri. Geniş sütunda beş sütunlu tablo olur. Orta genişlikte kaynak, bilginin altına iner.
 * Telefonda satır listesi olur: bilgi, altında etiketler ve kaynak.
 */
function ClaimTable({ claims, density, label }: { claims: Claim[]; density: Density; label: string }) {
  if (density === 'liste') {
    return (
      <ul className="devir-claims" aria-label={label}>
        {claims.map((c, i) => (
          <li key={i} className={i >= CLAIM_PREVIEW ? 'devir-more-row' : undefined}>
            <p className="devir-claim-text">{c.text}</p>
            <span className="devir-tags">
              {typeTag(c)}
              {confidenceTag(c)}
            </span>
            {sourceLines(c)}
          </li>
        ))}
      </ul>
    )
  }
  const wide = density === 'genis'
  const columns: ColumnsType<Claim> = [
    {
      title: 'Bilgi',
      key: 'bilgi',
      render: (_, c) => (wide ? c.text : <span className="devir-claim-cell">{c.text}{sourceLines(c)}</span>),
    },
    { title: 'Tür', key: 'tur', width: 112, render: (_, c) => typeTag(c) },
    { title: 'Güven', key: 'guven', width: 140, render: (_, c) => confidenceTag(c) },
    ...(wide
      ? ([
          { title: 'Kaynak ve tarih', key: 'kaynak', width: 216, render: (_, c) => (sourceText(c) ? <span className="devir-source">{sourceText(c)}</span> : <span className="devir-none">Kaynak yok</span>) },
          { title: 'Karşı bulgu', key: 'karsi', width: 176, render: (_, c) => (c.counter ? c.counter : <span className="devir-none">Yok</span>) },
        ] satisfies ColumnsType<Claim>)
      : []),
  ]
  return <Table<Claim> className="devir-table devir-claim-table" size="small" pagination={false} rowKey={(c) => String(claims.indexOf(c))} rowClassName={(_, i) => (i >= CLAIM_PREVIEW ? 'devir-more-row' : '')} dataSource={claims} columns={columns} aria-label={label} />
}

/** Her grupta ilk üç cümle açık gelir. Kalanı düğmeyle açılır. Yazdırmada hepsi basılır. */
const CLAIM_PREVIEW = 3
function ClaimGroupBlock({ title, decision, claims, step, density }: { title: string; decision: string; claims: Claim[]; step: string; density: Density }) {
  const [open, setOpen] = useState(false)
  const more = Math.max(0, claims.length - CLAIM_PREVIEW)
  return (
    <section className={`devir-block devir-group${open ? ' is-open' : ''}`} aria-label={title}>
      <h3 className="devir-sub">{title}</h3>
      <p className="helper">Bu bilgiyle verilecek karar: {decision}</p>
      {claims.length ? <ClaimTable claims={claims} density={density} label={`${title} dayanakları`} /> : <Missing step={step} />}
      {more > 0 ? (
        <Button className="no-print devir-more-button" type="text" aria-expanded={open} onClick={() => setOpen((x) => !x)}>
          {open ? 'İlk üç cümleyi göster' : `${more} cümle daha göster`}
        </Button>
      ) : null}
    </section>
  )
}

const coverageIcon = (s: CoverageStatus) =>
  s === 'dolu' ? (
    <span className="criterion-icon is-ok"><CheckCircle size={20} weight="fill" aria-hidden /></span>
  ) : s === 'kismen' ? (
    <span className="criterion-icon devir-is-hold"><CircleHalf size={20} weight="fill" aria-hidden /></span>
  ) : (
    <span className="criterion-icon is-muted"><XCircle size={20} aria-hidden /></span>
  )

/**
 * Strateje teslim raporu. Stratej, stratejiyi geliştiren kişinin unvanıdır.
 * Rapor seçim yapmaz: soruyu, dayanağı, sınırı, yolları ve eksik bilgiyi gösterir.
 * Masaüstünde sağda yapışkan içindekiler durur. Telefonda tablolar blok listesine döner.
 */
/** Bölümler açık başlar. Kapatılan bölüm yazdırmada yine bütünüyle görünür. */
function HandoffSection({ id, className, title, closed, onToggle, children }: {
  id: string; className: string; title: string; closed: boolean; onToggle: () => void; children: ReactNode
}) {
  return (
    <section id={id} className={className} aria-labelledby={`${id}-title`}>
      <Collapse
        className="devir-section"
        ghost
        activeKey={closed ? [] : [id]}
        onChange={onToggle}
        items={[{ key: id, label: <h2 id={`${id}-title`} className="devir-card-title">{title}</h2>, forceRender: true, children }]}
      />
    </section>
  )
}

export function HandoffScreen() {
  const plan = useCurrentPlan()
  const navigate = useNavigate()
  const bp = Grid.useBreakpoint()
  const { ref: mainRef, density } = useDensity(bp.md === false)
  const narrow = density === 'liste'
  const [filter, setFilter] = useState<Filter>('hepsi')
  const [closedSections, setClosedSections] = useState<string[]>([])
  const [tocOpen, setTocOpen] = useState<boolean>()
  const report = useMemo(() => (plan ? buildHandoffReport(plan) : null), [plan])
  if (!plan || !report) return null

  const slug = slugify(plan.name)
  const fileBase = `${slug}-strateje-devir-raporu-surum-${plan.revision}`
  const allClaims = report.groups.flatMap((g) => g.claims)
  const count = (s: ClaimStatus) => allClaims.filter((c) => c.status === s).length
  const visibleGroups = report.groups
    .map((g) => ({ ...g, shown: filter === 'hepsi' ? g.claims : g.claims.filter((c) => c.status === filter) }))
    .filter((g) => filter === 'hepsi' || g.shown.length > 0)
  const assumptionsWritten = Array.isArray(plan.steps['10']?.values?.assumptions) && (plan.steps['10']?.values?.assumptions as unknown[]).length > 0
  const t = report.transition
  const percent = Math.round((report.coverageFilled / report.coverage.length) * 100)
  const coverageText = `${report.coverageFilled} / ${report.coverage.length} başlık dolu`

  const sensitivityColumns: RecordColumn<SensitivityRow>[] = [
    { title: 'Durum', render: (s) => s.label, width: 120 },
    { title: 'Sipariş katkısı', render: (s) => <span className="tabular">{s.contribution}</span>, width: 136 },
    { title: 'Başabaş', render: (s) => <span className="tabular">{s.breakEven}</span>, width: 128 },
    { title: 'Not', render: (s) => s.note, width: 184 },
  ]
  const scenarioColumns: RecordColumn<(typeof report.scenarios)[number]>[] = [
    { title: 'Senaryo', render: (s) => s.name, width: 152 },
    { title: 'İşaret', render: (s) => orNone(s.signal), width: 208 },
    { title: 'Kazanma koşulu', render: (s) => orNone(s.winCondition), width: 208 },
  ]
  const decisionColumns: RecordColumn<OpenDecision>[] = [
    { title: 'Karar sorusu', render: (d) => d.question, width: 200 },
    { title: 'Seçenekler', render: (d) => orNone(d.alternatives), width: 200 },
    { title: 'Dayanak', render: (d) => orNone(d.basis), width: 200 },
    { title: 'Karar sahibi', render: (d) => orNone(d.owner), width: 128 },
    { title: 'Karar tarihi', render: (d) => orNone(d.dueDate), width: 152 },
    { title: 'Dönüş bedeli', render: (d) => orNone(d.reversalCost), width: 176 },
    { title: 'Geri alınır mı?', render: (d) => doorTag(d.door), width: 136 },
  ]

  const toggleSection = (id: string) => setClosedSections((closed) => closed.includes(id) ? closed.filter((key) => key !== id) : [...closed, id])

  const scrollTo = (id: string) => {
    setClosedSections((closed) => closed.filter((key) => key !== id))
    const section = document.getElementById(id)
    section?.querySelector<HTMLElement>('.ant-collapse-header')?.focus({ preventScroll: true })
    section?.scrollIntoView({ block: 'start' })
  }

  /* Telefonda dışa aktarma düğmeleri sayfanın sonundadır. Böylece karar sorusu ilk ekranda okunur. */
  const phone = bp.md === false
  const actions = (
    <span className="devir-actions no-print">
      <Button type="primary" icon={<Printer size={16} />} onClick={() => window.print()}>Yazdır veya PDF</Button>
      <Button icon={<DownloadSimple size={16} />} onClick={() => download(`${fileBase}.md`, handoffToMarkdown(report), 'text/markdown')}>Markdown indir</Button>
      <Button type="text" icon={<FileCode size={16} />} onClick={() => download(`${fileBase}.json`, JSON.stringify(report, null, 2), 'application/json')}>JSON indir</Button>
    </span>
  )

  return (
    <div className="page devir-page">
      <PageHeader
        newPath="/devir"
        kicker="Hazırlık"
        title="Strateje teslim raporu"
        description="Stratej bu raporla başlar. Rapor seçim yapmaz. Soruyu, dayanağı, sınırı, yolları ve eksik bilgiyi gösterir."
        actions={phone ? undefined : actions}
      />

      {report.stamp ? <Callout tone="uyari" title="Örnek">{report.stamp}</Callout> : null}

      <div className="devir-layout">
        <aside className="devir-toc no-print" aria-label="İçindekiler">
          <Collapse ghost className="devir-toc-toggle" activeKey={(tocOpen ?? bp.xl) ? ['bolumler'] : []} onChange={(keys) => setTocOpen(keys.length > 0)} items={[{
            key: 'bolumler',
            label: 'İçindekiler',
            children: (
          <nav aria-label="Rapor bölümleri">
            {SECTIONS.map((section) => (
              <a href={`#${section.id}`} key={section.id} onClick={(event) => { event.preventDefault(); scrollTo(section.id) }}>{section.toc}</a>
            ))}
          </nav>
            ),
          }]} />
        </aside>
        <div className="devir-main" ref={mainRef}>
          <HandoffSection id={SECTIONS[0].id} className="devir-card devir-lead" title="1. Bugün hangi karar verilecek?" closed={closedSections.includes(SECTIONS[0].id)} onToggle={() => toggleSection(SECTIONS[0].id)}>
            <p className="devir-question">{report.question}</p>
            {report.scope ? (
              <p className="devir-line">
                <Tag color="warning">Kapsam sınırı</Tag> Yalnız şu konu planlanır: {report.scope}
              </p>
            ) : null}
            <ul className="devir-meta" aria-label="Rapor bilgisi">
              {report.meta.map((m) => <li key={m}>{m}</li>)}
            </ul>

            {report.crux ? (
              <div className="devir-block devir-crux">
                <h3 className="devir-sub">Asıl engel</h3>
                <p className="devir-line devir-crux-text">{report.crux.text}</p>
                <dl className="devir-pairs">
                  {report.crux.why ? <div><dt>Neden önce incelenmeli?</dt><dd>{report.crux.why}</dd></div> : null}
                  {report.crux.paths ? <div><dt>Etkilediği yol</dt><dd>{report.crux.paths}</dd></div> : null}
                  {report.crux.alternative ? <div><dt>Başka açıklama</dt><dd>{report.crux.alternative}</dd></div> : null}
                  {report.crux.split ? <div><dt>İki açıklamayı ayıran bulgu</dt><dd>{report.crux.split}</dd></div> : null}
                  <div><dt>Destekleyen kanıt</dt><dd>{report.crux.support.length ? report.crux.support.join('. ') : <span className="devir-none">Bağlanmadı</span>}</dd></div>
                  <div><dt>Karşı bulgu</dt><dd>{report.crux.counter.length ? report.crux.counter.join(' ') : <span className="devir-none">Bağlanmadı</span>}</dd></div>
                </dl>
                {report.crux.missing ? <span className="devir-source">{report.crux.missing} bağlı kanıt silinmiş. <StepLink step="18" /></span> : null}
              </div>
            ) : null}

            {report.conditions.length ? (
              <div className="devir-block">
                <h3 className="devir-sub">Başarı neye bağlı?</h3>
                <ul className="devir-conditions">
                  {report.conditions.map((c) => (
                    <li key={c.id} className="devir-condition">
                      <span className="devir-tags">
                        <Tag color={CONDITION_COLOR[c.status]}>{CONDITION_LABEL[c.status]}</Tag>
                        {c.thresholdLate ? <Tag color="warning">Sınır sonradan belirlendi</Tag> : null}
                      </span>
                      <span className="devir-line">{c.condition}</span>
                      <dl className="devir-pairs">
                        {c.paths ? <div><dt>Etkilediği yol</dt><dd>{c.paths}</dd></div> : null}
                        {c.measure ? <div><dt>Ölçü</dt><dd>{c.measure}</dd></div> : null}
                        <div><dt>Başlangıç</dt><dd>{c.baseline}</dd></div>
                        {c.threshold ? <div><dt>Sınır</dt><dd>{c.threshold}</dd></div> : null}
                        {c.owner ? <div><dt>Sorumlu</dt><dd>{c.owner}</dd></div> : null}
                        {c.support.length ? <div><dt>Destekleyen kanıt</dt><dd>{c.support.join('. ')}</dd></div> : null}
                        {c.counter.length ? <div><dt>Karşı bulgu</dt><dd>{c.counter.join(' ')}</dd></div> : null}
                        {c.comment ? <div><dt>Karar sahibinin yorumu</dt><dd>{c.comment}</dd></div> : null}
                      </dl>
                      {c.missing ? <span className="devir-source">{c.missing} bağlı kanıt silinmiş. <StepLink step="18" /></span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="devir-block">
              <h3 className="devir-sub">Hazırlık kararı</h3>
              {t ? (
                <>
                  <span className="devir-tags">
                    <Tag color={t.effective === 'hazir' ? 'success' : t.effective === 'kosullu' ? 'warning' : undefined}>{t.label}</Tag>
                    {t.stale ? <Tag color="warning">İnceleme bekliyor</Tag> : null}
                    {!t.stale && TRANSITION_LABEL[t.effective] !== t.label ? <Tag color="error">Süresi doldu</Tag> : null}
                  </span>
                  <p className="devir-line">{t.reason}</p>
                  <span className="devir-source">Karar sahibi: {t.decidedBy}. Karar tarihi: {t.date}.</span>
                  {t.stale ? <span className="devir-source">Kararın dayandığı veri sonradan değişti. <Link className="no-print" to="/gecis">Hazırlık kontrolünü aç</Link></span> : null}
                </>
              ) : (
                <p className="helper devir-missing">Hazırlık kararı henüz kaydedilmedi. <Link className="no-print" to="/gecis">Hazırlık kontrolünü aç</Link></p>
              )}
            </div>

            <div className="devir-block">
              <h3 className="devir-sub">Verilmiş kararlar</h3>
              {report.locked.length ? (
                <>
                  <p className="helper">Stratej bu kararları yeniden açmaz.</p>
                  <ul className="devir-list">
                    {report.locked.map((l) => (
                      <li key={l.source}>
                        {l.text}
                        <span className="devir-source">{l.source}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="helper devir-missing">Henüz geçilen kontrol yok. <Link className="no-print" to="/ozet">Plan özetini aç</Link></p>
              )}
            </div>
          </HandoffSection>

          <HandoffSection id={SECTIONS[1].id} className="devir-card" title="2. Dayanaklar" closed={closedSections.includes(SECTIONS[1].id)} onToggle={() => toggleSection(SECTIONS[1].id)}>
            <div className="devir-filter">
              <Segmented<Filter> className="no-print" aria-label="Cümle türüne göre süz" options={FILTERS} value={filter} onChange={setFilter} />
              <p className="helper tabular">
                {allClaims.length} cümle: {count('kaynakli')} kaynaklı, {count('hesap')} hesap, {count('karar')} karar, {count('varsayim')} varsayım.
              </p>
            </div>
            {visibleGroups.length === 0 ? <p className="helper">Bu türde cümle yok. Başka bir süzgeç seçin.</p> : null}
            {visibleGroups.map((g) => (
              <ClaimGroupBlock key={`${g.title}-${filter}`} title={g.title} decision={g.decision} claims={g.shown} step={g.step} density={density} />
            ))}
          </HandoffSection>

          <HandoffSection id={SECTIONS[2].id} className="devir-card" title="3. Bağlayıcı sınırlar" closed={closedSections.includes(SECTIONS[2].id)} onToggle={() => toggleSection(SECTIONS[2].id)}>
            {report.limits.length ? (
              <Descriptions className="devir-facts" size="small" column={{ xs: 1, sm: 2, lg: 3 }} items={report.limits.map((l) => ({ key: l.label, label: l.label, children: l.value }))} />
            ) : (
              <Missing step="02" />
            )}
            <div className="devir-block">
              <h3 className="devir-sub">Durdurma kuralları</h3>
              {report.stopRules.length ? <ul className="devir-list">{report.stopRules.map((s) => <li key={s}>{s}</li>)}</ul> : <Missing step="02" />}
            </div>
            <div className="devir-block">
              <h3 className="devir-sub">Kırmızı çizgiler</h3>
              {report.redLines ? <p className="devir-line">{report.redLines}</p> : <Missing step="01" />}
            </div>
            {report.stakeholders.length ? (
              <div className="devir-block devir-stakeholders">
                <h3 className="devir-sub">İşi etkileyen kişiler</h3>
                <ul className="devir-list">
                  {report.stakeholders.map((x, i) => (
                    <li key={`${i}-${x.who}`}>
                      {x.who}
                      <span className="devir-source devir-tags">
                        {x.effect ? <Tag color={x.effect === 'Engelleyebilir' ? 'warning' : undefined}>{x.effect}</Tag> : null}
                        {x.how ? <span>Ne yapabilir: {x.how}</span> : null}
                        {x.plan ? <span>Önlem: {x.plan}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </HandoffSection>

          <HandoffSection id={SECTIONS[3].id} className="devir-card" title="4. Karşılaştırılacak yollar" closed={closedSections.includes(SECTIONS[3].id)} onToggle={() => toggleSection(SECTIONS[3].id)}>
            {report.paths.length ? (
              <>
                <p className="helper">Yollar yan yana durur. Rapor yol seçmez. Stratej yolu önerir. Karar sahibi seçer.</p>
                <PathCompare paths={report.paths} narrow={narrow} />
                {report.pathIssues.length ? (
                  <Callout tone="uyari" title="Yol denetimi">
                    <ul className="devir-list devir-issues">
                      {report.pathIssues.map((x) => <li key={x}>{x}</li>)}
                    </ul>
                  </Callout>
                ) : null}
                {report.crosses.length ? (
                  <div className="devir-block">
                    <h3 className="devir-sub">Yollar hangi sorulardan çıktı?</h3>
                    <dl className="devir-pairs">
                      {report.crosses.map((c) => (
                        <div key={c.question}>
                          <dt>{c.question}</dt>
                          <dd>{c.text}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}
                {report.links.length ? (
                  <div className="devir-block">
                    <h3 className="devir-sub">Bu yollar neden çalışabilir?</h3>
                    <ul className="devir-list">
                      {report.links.map((l, i) => (
                        <li key={i}>
                          {l.path ? `${l.path}. ` : ''}{l.a} ile {l.b}.
                          <span className="devir-source devir-tags">
                            <Tag color={l.relation === 'celisiyor' ? 'error' : l.relation === 'destekliyor' ? 'success' : undefined}>{RELATION_LABEL[l.relation]}</Tag>
                            {l.reason ? <span>{l.reason}</span> : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="devir-block">
                  <h3 className="devir-sub">Rakip karşı hamlesi</h3>
                  {report.counterMove ? <p className="devir-line">{report.counterMove}</p> : <Missing step="18" />}
                </div>
                <div className="devir-block">
                  <h3 className="devir-sub">Para hesabı üç durumda</h3>
                  {report.sensitivity.length ? <Records rows={report.sensitivity} columns={sensitivityColumns} narrow={narrow} label="Para hesabı üç durumda" /> : <Missing step="16" />}
                </div>
              </>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="devir-empty-text">{NO_PATHS}</span>}>
                <StepLink step="18" />
              </Empty>
            )}
          </HandoffSection>

          <HandoffSection id={SECTIONS[4].id} className="devir-card" title="5. Seçimi değiştirebilecek eksik bilgi" closed={closedSections.includes(SECTIONS[4].id)} onToggle={() => toggleSection(SECTIONS[4].id)}>
            <div className="devir-block">
              <h3 className="devir-sub">Kırılgan sayı</h3>
              {report.fragile ? <p className="devir-line">{report.fragile}</p> : <Missing step="16" />}
            </div>
            {report.dissents.length ? (
              <div className="devir-block devir-dissents">
                <h3 className="devir-sub">Ayrı görüşler</h3>
                <ul className="devir-list">
                  {report.dissents.map((d, i) => (
                    <li key={i}>
                      {d.who ? `${d.who}: ` : ''}{d.view}
                      <span className="devir-source devir-tags">
                        <Tag color={d.response === 'kabul' ? 'success' : d.response === 'suruyor' ? 'warning' : undefined}>{DISSENT_LABEL[d.response]}</Tag>
                        {d.about ? <span>İtiraz edilen: {d.about}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="devir-block">
              <h3 className="devir-sub">Açık varsayımlar</h3>
              {report.assumptions.length ? (
                <ul className="devir-list">
                  {report.assumptions.map((a) => (
                    <li key={a.text}>
                      {a.text}
                      <span className="devir-source devir-tags">
                        <span className="tabular">Etki {a.impact} / 5.</span>
                        {a.state === 'curudu' ? <Tag color="error">Çürüdü</Tag> : null}
                        <span>{a.test ? `Test: ${a.test}` : 'Test yöntemi yazılmadı.'}</span>
                        {a.affects ? <span>Yanlış çıkarsa değişen yol: {a.affects}.</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : assumptionsWritten ? (
                <p className="helper">Açık varsayım kalmadı. Yazılan varsayımların hepsi doğrulandı.</p>
              ) : (
                <Missing step="10" />
              )}
            </div>
            <div className="devir-block">
              <h3 className="devir-sub">Kritik belirsizlikler ve senaryolar</h3>
              {report.uncertaintyLevels.length ? (
                <ul className="devir-list devir-uncertainties">
                  {report.uncertaintyLevels.map((u, i) => (
                    <li key={`${i}-${u.text}`}>
                      {u.text}
                      <span className="devir-source devir-tags">
                        <span>Belirsizlik seviyesi:</span>
                        {u.level ? <Tag>{u.level}</Tag> : <span className="devir-none">Seçilmedi</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {report.scenarios.length ? <Records rows={report.scenarios} columns={scenarioColumns} narrow={narrow} label="Senaryolar" /> : null}
              {!report.uncertainties.length && !report.scenarios.length ? <Missing step="04" /> : null}
            </div>
            <div className="devir-block">
              <h3 className="devir-sub">Açık karar defteri</h3>
              {report.openDecisions.length ? <Records rows={report.openDecisions} columns={decisionColumns} narrow={density !== 'genis'} label="Açık karar defteri" /> : <Missing step="18" />}
            </div>
          </HandoffSection>

          <HandoffSection id={SECTIONS[5].id} className="devir-card" title="Ek 1. Kapsam" closed={closedSections.includes(SECTIONS[5].id)} onToggle={() => toggleSection(SECTIONS[5].id)}>
            <div className="devir-progress">
              <Progress percent={percent} showInfo={false} aria-label={`14 başlığın ${report.coverageFilled} tanesi dolu`} />
              <p className="devir-coverage-count tabular">{coverageText}</p>
            </div>
            <ul className="devir-coverage">
              {report.coverage.map((c) => (
                <li key={c.no}>
                  {coverageIcon(c.status)}
                  <span className="devir-coverage-title">
                    {c.no}. {c.title}
                    <span className="devir-source">{COVERAGE_TEXT[c.status]}</span>
                  </span>
                  <StepLink step={c.step} />
                </li>
              ))}
            </ul>
            <div className="devir-block devir-blind">
              <h3 className="devir-sub">Bakılmayan alanlar</h3>
              {report.blindSpots.length ? (
                <>
                  <p className="helper">Öngörülemeyen sorunlar en çok kimsenin bakmadığı yerde saklanır. Bu adımlara bakılmadı.</p>
                  <ul className="devir-list">
                    {report.blindSpots.map((b) => (
                      <li key={b.step}>
                        Adım {b.step}. {b.title}
                        <span className="devir-source devir-tags">
                          <Tag color={b.kind === 'atlandi' ? 'warning' : undefined}>{BLIND_SPOT_LABEL[b.kind]}</Tag>
                          <span>{b.reason}</span>
                          <StepLink step={b.step} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="devir-line">Bakılmayan alan yok. Atlanan ya da boş bırakılan temel adımı yok.</p>
              )}
            </div>
          </HandoffSection>

          <HandoffSection id={SECTIONS[6].id} className="devir-card" title="Ek 2. Stratej'in ilk günü" closed={closedSections.includes(SECTIONS[6].id)} onToggle={() => toggleSection(SECTIONS[6].id)}>
            <ol className="devir-list devir-first-day">
              {report.firstDay.map((s) => <li key={s}>{s}</li>)}
            </ol>
            <div className="no-print">
              <Button onClick={() => navigate('/strateji')}>Strateji oluşturmaya git</Button>
            </div>
          </HandoffSection>

          <HandoffSection id={SECTIONS[7].id} className="devir-card" title="Ek 3. Altı soru" closed={closedSections.includes(SECTIONS[7].id)} onToggle={() => toggleSection(SECTIONS[7].id)}>
            <p className="helper">Yazılım altı cevabı plandan bulur. Yeni bilgi eklemez. Cevap yoksa soruyu ilgili adımda cevaplayın.</p>
            <ol className="devir-six">
              {report.sixQuestions.map((q, i) => (
                <li key={q.question}>
                  <span className="devir-six-q">{i + 1}. {q.question}</span>
                  {q.answer ? <span className="devir-six-a">{q.answer}</span> : <Missing step={q.step} />}
                </li>
              ))}
            </ol>
          </HandoffSection>
        </div>

        {phone ? (
          <section className="devir-export no-print" aria-labelledby="devir-disa-aktar">
            <h2 id="devir-disa-aktar" className="devir-sub">Raporu dışa aktarın</h2>
            {actions}
          </section>
        ) : null}


      </div>
    </div>
  )
}

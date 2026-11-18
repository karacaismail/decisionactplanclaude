import '@/styles/desen/page-rapor.css'
import '@/styles/desen/strateji.css'
import '@/styles/ekran/OutputsContent.css'
import '@/styles/yazdirma/yazdirma.css'
import { useLayoutEffect, useMemo, useState } from 'react'
import { Anchor, Button, Card, Collapse, Descriptions, Grid, Input, Select, Table, Timeline, Typography } from 'antd'
import { DownloadSimple, FileCode, Printer, PushPin } from '@phosphor-icons/react'
import { Link, useSearchParams } from 'react-router'
import { usePlanStore, useCurrentPlan, migratePlan } from '@/store/planStore'
import { buildActionPlan, buildExecutiveReport, reportToMarkdown, type Fact, type Report, type ReportSection } from '@/reports/build'
import { buildHandoffReport, handoffToMarkdown, type HandoffReport } from '@/reports/handoff'
import { formatDate, uid } from '@/engine/format'
import type { PlanDoc, Revision } from '@/data/types'
import { PageHeader } from '@/components/PageHeader'
import { Callout } from '@/components/Callout'
/** "temel" anahtarı eski bağlantılar için korunur. Sekme artık strateje teslim raporunun özetidir. */
type Kind = 'temel' | 'yonetici' | 'aksiyon'
const KIND_LABEL: Record<Kind, string> = { temel: 'Strateje teslim raporu', yonetici: 'Yönetici raporu', aksiyon: 'Girişimci aksiyon planı' }
/** Adresteki `?belge=` değeri. Eski "temel" ve yeni "devir" aynı sekmeyi açar. */
const HANDOFF_PARAMS = ['temel', 'devir']
/** Güncel taslağın seçici değeri. Sürüm kimlikleri "surum-" ile başlar, çakışmaz. */
const CURRENT = 'guncel'

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

function parseSnapshot(r: Revision): PlanDoc | null {
  try {
    const doc = JSON.parse(r.snapshot) as PlanDoc
    /* Eski sürümün anlık görüntüsü de güncel alan yerleşimine taşınır. Böylece rapor aynı yerden okur. */
    return doc && typeof doc === 'object' && Array.isArray(doc.decisions) ? migratePlan({ ...doc, revisions: [] }) : null
  } catch {
    return null
  }
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9ğüşöçı]+/gi, '-').replace(/^-+|-+$/g, '') || 'plan'
}

/** Bölüm başlığından belge içi kimlik. İçindekiler bu kimliğe kaydırır. */
const sectionId = (title: string) => `rapor-${slugify(title)}`

/** Başlık ve değer çiftleri. Dar ekranda tek sütun, genişte iki sütun. */
function FactList({ facts, columns = 1 }: { facts: Fact[]; columns?: 1 | 2 }) {
  return (
    <Descriptions
      className="report-facts"
      size="small"
      column={columns === 2 ? { xs: 1, sm: 1, md: 2 } : 1}
      items={facts.map((f, i) => ({ key: String(i), label: f.title, children: f.value || 'Bilinmiyor' }))}
    />
  )
}

/** Rapor bölümünün gövdesi: çiftler ya da cümleler ve varsa tablo. Boş tablo çizilmez. */
function SectionBody({ s }: { s: ReportSection }) {
  return (
    <>
      {s.facts && s.facts.length ? <FactList facts={s.facts} /> : s.lines.map((l, i) => <Typography.Paragraph key={i} className="report-line">{l}</Typography.Paragraph>)}
      {s.table && s.table.rows.length ? (
        <Table
          size="small"
          pagination={false}
          rowKey="key"
          dataSource={s.table.rows.map((r, n) => ({ key: String(n), ...Object.fromEntries(r.map((c, i) => [String(i), c])) }))}
          columns={s.table.head.map((h, i) => ({ title: h, dataIndex: String(i) }))}
          scroll={{ x: 'max-content' }}
        />
      ) : null}
    </>
  )
}

/**
 * Strateje teslim raporunun kısa özeti: karar sorusu, kapsam ve raporun bağlantısı.
 * Raporun tamamı /devir ekranındadır. Markdown indirme raporun tamamını verir.
 */
function HandoffSummary({ report, state, current }: { report: HandoffReport; state: string; current: boolean }) {
  const options = report.paths.filter((p) => !p.baseline).length
  return (
    <article className="report devir-summary">
      <header className="report-head">
        {report.stamp ? <Callout tone="uyari" title="Örnek">{report.stamp}</Callout> : null}
        <h2 className="report-title">{report.title}</h2>
        <p className="helper report-state">{state}</p>
      </header>
      <section className="report-section" aria-labelledby="devir-ozet-soru">
        <h3 id="devir-ozet-soru">Bugün hangi karar verilecek?</h3>
        <p className="devir-question">{report.question}</p>
      </section>
      <FactList
        columns={2}
        facts={[
          { title: 'Kapsam', value: `${report.coverageFilled} / ${report.coverage.length} başlık dolu` },
          { title: 'Yol adayı', value: options > 0 ? `${options} yol ve bugünkü durum` : 'Henüz yazılmadı' },
          { title: 'Açık karar', value: report.openDecisions.length > 0 ? `${report.openDecisions.length} karar` : 'Henüz yazılmadı' },
          { title: 'Açık varsayım', value: report.assumptions.length > 0 ? `${report.assumptions.length} varsayım` : 'Yok' },
        ]}
      />
      <p className="report-line no-print">
        Rapor seçim yapmaz. Dayanakları, sınırları ve yolları gösterir. <Link to="/devir">Raporu aç</Link>
      </p>
      {current ? null : <p className="helper no-print">Rapor ekranı güncel taslağı gösterir. Bu özet seçili sürümden üretildi.</p>}
    </article>
  )
}

/**
 * Çıktılar. Üç belge aynı veriden üretilir: strateje teslim raporu, yönetici raporu ve girişimci aksiyon planı.
 * Varsayılan sekme yönetici raporudur. Adres `?belge=devir` ya da eski `?belge=temel` taşırsa teslim raporunun özeti açılır. Masaüstünde iki sütun:
 * solda belge kartı (sekmeler, içindekiler, belge), sağda "Sürümler" ve "Dışa aktar" kartları.
 * Telefonda tek sütun; rapor bölümleri akordeondur ve ilk bölüm açık gelir. Yazdırmada yalnız belge kalır.
 */
export function OutputsScreen() {
  const plan = useCurrentPlan()
  const update = usePlanStore((s) => s.update)
  const snapshot = usePlanStore((s) => s.snapshot)
  const markBackup = usePlanStore((s) => s.markBackup)
  const bp = Grid.useBreakpoint()
  const wide = Boolean(bp.md)
  const [params] = useSearchParams()
  const [kind, setKind] = useState<Kind>(HANDOFF_PARAMS.includes(params.get('belge') ?? '') ? 'temel' : 'yonetici')
  const [versionId, setVersionId] = useState<string>(CURRENT)
  const [pinLabel, setPinLabel] = useState('')
  const [expandedSections, setExpandedSections] = useState<Record<string, string[]>>({})
  const documentKey = `${kind}-${versionId}`

  const revisions = plan?.revisions ?? []
  const versionIndex = revisions.findIndex((r) => r.id === versionId)
  const revision = versionIndex >= 0 ? revisions[versionIndex] : undefined
  const viewed = useMemo<PlanDoc | null>(() => {
    if (!plan) return null
    if (!revision) return plan
    return parseSnapshot(revision)
  }, [plan, revision])
  const report: Report | null = useMemo(() => {
    if (!viewed || kind === 'temel') return null
    const base = kind === 'yonetici' ? buildExecutiveReport(viewed) : buildActionPlan(viewed)
    return revision ? { ...base, meta: [...base.meta, `Sürüm kaydı: ${formatDate(revision.createdAt)}`] } : base
  }, [viewed, kind, revision])
  const handoff: HandoffReport | null = useMemo(() => {
    if (!viewed || kind !== 'temel') return null
    const base = buildHandoffReport(viewed)
    return revision ? { ...base, meta: [...base.meta, `Sürüm kaydı: ${formatDate(revision.createdAt)}`] } : base
  }, [viewed, kind, revision])

  useLayoutEffect(() => {
    if (!report || bp.md === undefined) return
    setExpandedSections((current) => current[documentKey] !== undefined ? current : {
      ...current,
      [documentKey]: bp.md ? report.sections.map((section) => section.title) : [report.sections[0]?.title ?? ''],
    })
  }, [bp.md, documentKey, report])

  if (!plan) return null
  const hasDoc = kind === 'temel' ? Boolean(handoff) : Boolean(report)

  const versionOptions = [
    { value: CURRENT, label: 'Güncel taslak' },
    ...revisions.map((r, i) => ({ value: r.id, label: `Sürüm ${i + 1}: ${r.label}, ${formatDate(r.createdAt, false)}` })),
  ]
  const versionSlug = revision ? `surum-${versionIndex + 1}` : `taslak-surum-${plan.revision}`
  const slug = slugify(plan.name)
  const isCurrent = !revision
  /* Yayım kaydı yalnız iki rapor içindir. Strateje teslim raporu yayım listesine yazılmaz. */
  const publish = (k: 'yonetici' | 'aksiyon') => update((p) => p.outputs.push({ id: uid('cikti'), kind: k, revision: viewed?.revision ?? p.revision, createdAt: new Date().toISOString() }))
  const pin = () => {
    const label = pinLabel.trim() || `${KIND_LABEL[kind]} çıktısı`
    snapshot(label)
    const current = usePlanStore.getState()
    const last = current.currentId ? current.plans[current.currentId]?.revisions.at(-1) : undefined
    if (last) setVersionId(last.id)
    setPinLabel('')
  }
  const downloadMarkdown = () => {
    if (kind === 'temel') {
      if (handoff) download(`${slug}-strateje-devir-raporu-${versionSlug}.md`, handoffToMarkdown(handoff), 'text/markdown')
      return
    }
    if (!report) return
    publish(kind)
    download(`${slug}-${kind}-${versionSlug}.md`, reportToMarkdown(report), 'text/markdown')
  }
  const stateText = isCurrent ? 'Güncel taslak her değişiklikle güncellenir.' : `Sürüm kaydı: ${formatDate(revision!.createdAt)}. Bu sürüm donduruldu. Sonraki değişiklikler bu belgeyi etkilemez.`
  const downloadJson = () => {
    if (!viewed) return
    download(`${slug}-veri-${versionSlug}.json`, JSON.stringify(viewed, null, 2), 'application/json')
    /* Güncel taslağın indirilmesi yedek sayılır. Eski sürümün indirilmesi sayılmaz. */
    if (isCurrent && plan) markBackup(plan.id)
  }

  /* Sürüm zaman çizgisi: en yeni üstte, güncel taslak en altta. Seçili sürüm turuncu nokta ile işaretlidir. */
  const timelineItems = [
    ...revisions.map((r, i) => ({ r, i })).reverse().map(({ r, i }) => ({
      key: r.id,
      color: r.id === versionId ? undefined : 'gray',
      content: (
        <span className="version-item">
          <strong>{r.label}</strong>
          <span className="helper">
            {i + 1}. sürüm, {formatDate(r.createdAt, false)}.{' '}
            {r.id === versionId ? 'Görüntüleniyor.' : <Button type="link" size="small" onClick={() => setVersionId(r.id)}>Görüntüle</Button>}
          </span>
        </span>
      ),
    })),
    {
      key: CURRENT,
      color: isCurrent ? undefined : 'gray',
      content: (
        <span className="version-item">
          <strong>Şu anki taslak</strong>
          <span className="helper">
            Sürüm {plan.revision}. Her değişiklikle güncellenir.{' '}
            {isCurrent ? 'Görüntüleniyor.' : <Button type="link" size="small" onClick={() => setVersionId(CURRENT)}>Görüntüle</Button>}
          </span>
        </span>
      ),
    },
  ]

  const anchorItems = report ? report.sections.map((s) => ({ key: sectionId(s.title), href: `#${sectionId(s.title)}`, title: s.title })) : []
  const activeSections = expandedSections[documentKey] ?? []
  const openSection = (title: string) => {
    setExpandedSections((current) => ({ ...current, [documentKey]: Array.from(new Set([...activeSections, title])) }))
    const heading = document.getElementById(sectionId(title))
    heading?.closest<HTMLElement>('.ant-collapse-header')?.focus({ preventScroll: true })
    heading?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }

  return (
    <div className="page page-rapor page-outputs">
      <div className="no-print">
        <PageHeader kicker="Çıktılar" title="Çıktılar" description="Üç belge aynı veri sürümünden üretilir. Eksik bilgi uydurulmaz. Eksik yere “Bilinmiyor” yazılır." />
      </div>

      <div className="report-layout">
        <Card
          className="report-card"
          tabList={[
            { key: 'temel', label: KIND_LABEL.temel },
            { key: 'yonetici', label: KIND_LABEL.yonetici },
            { key: 'aksiyon', label: KIND_LABEL.aksiyon },
          ]}
          activeTabKey={kind}
          onTabChange={(k) => setKind(k as Kind)}
          tabProps={{ rootClassName: 'report-tabs report-tabs-wrap', size: 'middle' }}
        >
          {kind === 'temel' && handoff ? (
            <HandoffSummary report={handoff} state={stateText} current={isCurrent} />
          ) : !report || !viewed ? (
            <Callout tone="uyari" danger title="Bu sürüm okunamadı">Kayıtlı sürüm verisi bozuk. Güncel taslağı seçin ya da başka bir sürüm deneyin.</Callout>
          ) : (
            <>
              {wide ? (
                <nav className="report-anchor no-print" aria-label="İçindekiler">
                  <Anchor direction="horizontal" affix={false} targetOffset={80} items={anchorItems} onClick={(e, link) => { e.preventDefault(); openSection(String(link.title)) }} />
                </nav>
              ) : null}
              <article className="report">
                <header className="report-head">
                  {report.stamp ? <Callout tone="uyari" title="Örnek">{report.stamp}</Callout> : null}
                  <h2 className="report-title">{report.title}</h2>
                  <FactList facts={report.facts} />
                  <p className="helper report-state">
                    {isCurrent ? 'Güncel taslak her değişiklikle güncellenir.' : `Sürüm kaydı: ${formatDate(revision!.createdAt)}. Bu sürüm donduruldu. Sonraki değişiklikler bu raporu etkilemez.`}
                  </p>
                </header>
                <Collapse
                  key={documentKey}
                  className="report-collapse"
                  ghost
                  activeKey={activeSections}
                  onChange={(keys) => setExpandedSections((current) => ({ ...current, [documentKey]: Array.isArray(keys) ? keys : [keys] }))}
                  items={report.sections.map((s) => ({
                    key: s.title,
                    label: <h3 id={sectionId(s.title)} className="report-collapse-title">{s.title}</h3>,
                    forceRender: true,
                    children: <div className="report-section"><SectionBody s={s} /></div>,
                  }))}
                />
              </article>
            </>
          )}
        </Card>

        <aside className="report-side no-print" aria-label="Sürümler ve dışa aktarma">
          <Card title="Sürümler">
            <div className="toolbar report-toolbar">
              <div className="filter-field">
                <label className="field-label" htmlFor="surum-secici">Sürüm</label>
                <Select id="surum-secici" value={versionId} onChange={(val) => setVersionId(val)} options={versionOptions} style={{ width: '100%' }} popupMatchSelectWidth />
              </div>
              <div className="filter-field">
                <label className="field-label" htmlFor="surum-adi">Sürüm adı</label>
                <Input id="surum-adi" value={pinLabel} onChange={(e) => setPinLabel(e.target.value)} placeholder="Örneğin Yatırımcı görüşmesi öncesi" disabled={!isCurrent} onPressEnter={() => isCurrent && pin()} />
              </div>
              <Button icon={<PushPin size={16} />} onClick={pin} disabled={!isCurrent}>Bu sürümü sabitle</Button>
            </div>
            <p className="helper">
              {isCurrent ? 'Sabitlenen sürüm sonraki değişikliklerden etkilenmez. Her kontrol kararı da bir sürüm kaydeder.' : 'Yalnız güncel taslak sabitlenir. Önce “Güncel taslak” seçin.'}
            </p>
            <Timeline className="version-timeline" items={timelineItems} />
          </Card>

          <Card title="Dışa aktar">
            <div className="export-actions">
              <Button type="primary" block icon={<Printer size={16} />} onClick={() => window.print()} disabled={!hasDoc}>Yazdır veya PDF</Button>
              <Button block icon={<DownloadSimple size={16} />} onClick={downloadMarkdown} disabled={!hasDoc}>Markdown indir</Button>
              <Button block icon={<FileCode size={16} />} onClick={downloadJson} disabled={!viewed}>JSON indir</Button>
            </div>
            {plan.outputs.length === 0 ? (
              <p className="helper">Markdown indirince yönetici raporu ve aksiyon planı yayımlanmış sayılır. Yayımlanan belgeler burada listelenir.</p>
            ) : (
              <ul className="published-list" aria-label="Yayımlanan belgeler">
                {[...plan.outputs].reverse().map((o) => (
                  <li key={o.id}>
                    <span>{KIND_LABEL[o.kind]}, sürüm {o.revision}</span>
                    <span className="helper">{formatDate(o.createdAt, false)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Button, Collapse, Dropdown, Grid, Input, Select, Table, Tabs } from 'antd'
import { CaretDown, Printer, PushPin } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { buildActionPlan, buildExecutiveReport, reportToMarkdown, type Report, type ReportSection } from '@/reports/build'
import { formatDate, uid } from '@/engine/format'
import type { PlanDoc, Revision } from '@/data/types'
import { PageHeader, SectionHead } from '@/components/PageHeader'
import { Callout } from '@/components/Callout'
import { EmptyState } from '@/components/EmptyState'
import '@/styles/screens-rapor.css'
import '@/styles/print.css'

type Kind = 'yonetici' | 'aksiyon'
const KIND_LABEL: Record<Kind, string> = { yonetici: 'Yönetici raporu', aksiyon: 'Girişimci aksiyon planı' }
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
    return doc && typeof doc === 'object' && Array.isArray(doc.decisions) ? { ...doc, revisions: [] } : null
  } catch {
    return null
  }
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9ğüşöçı]+/gi, '-').replace(/^-+|-+$/g, '') || 'plan'
}

/** Rapor bölümünün gövdesi: cümleler ve varsa tablo. Boş tablo çizilmez. */
function SectionBody({ s }: { s: ReportSection }) {
  return (
    <>
      {s.lines.map((l, i) => <p key={i}>{l}</p>)}
      {s.table && s.table.rows.length ? (
        <Table
          size="small"
          pagination={false}
          rowKey={(_, i) => String(i)}
          dataSource={s.table.rows.map((r) => Object.fromEntries(r.map((c, i) => [String(i), c])))}
          columns={s.table.head.map((h, i) => ({ title: h, dataIndex: String(i) }))}
          scroll={{ x: 'max-content' }}
        />
      ) : null}
    </>
  )
}

/**
 * Çıktılar. İki belge aynı veriden üretilir. Belge üstünde tek araç çubuğu vardır:
 * sürüm seçimi, "Yazdır veya PDF" ve "Daha fazla" menüsü. Belge sayfa ortasında 760 px durur.
 * Telefonda rapor bölümleri akordeondur. İlk bölüm açık gelir. Masaüstünde ve yazdırmada hepsi açıktır.
 */
export function OutputsScreen() {
  const plan = useCurrentPlan()
  const update = usePlanStore((s) => s.update)
  const snapshot = usePlanStore((s) => s.snapshot)
  const bp = Grid.useBreakpoint()
  const wide = Boolean(bp.md)
  const [kind, setKind] = useState<Kind>('yonetici')
  const [versionId, setVersionId] = useState<string>(CURRENT)
  const [pinLabel, setPinLabel] = useState('')

  const revisions = plan?.revisions ?? []
  const versionIndex = revisions.findIndex((r) => r.id === versionId)
  const revision = versionIndex >= 0 ? revisions[versionIndex] : undefined
  const viewed = useMemo<PlanDoc | null>(() => {
    if (!plan) return null
    if (!revision) return plan
    return parseSnapshot(revision)
  }, [plan, revision])
  const report: Report | null = useMemo(() => {
    if (!viewed) return null
    const base = kind === 'yonetici' ? buildExecutiveReport(viewed) : buildActionPlan(viewed)
    return revision ? { ...base, meta: [...base.meta, `Sürüm kaydı: ${formatDate(revision.createdAt)}`] } : base
  }, [viewed, kind, revision])

  if (!plan) return null

  const versionOptions = [
    { value: CURRENT, label: 'Güncel taslak' },
    ...revisions.map((r, i) => ({ value: r.id, label: `Sürüm ${i + 1}: ${r.label}, ${formatDate(r.createdAt, false)}` })),
  ]
  const versionSlug = revision ? `surum-${versionIndex + 1}` : `taslak-surum-${plan.revision}`
  const slug = slugify(plan.name)
  const isCurrent = !revision
  const publish = () => update((p) => p.outputs.push({ id: uid('cikti'), kind, revision: viewed?.revision ?? p.revision, createdAt: new Date().toISOString() }))
  const pin = () => {
    const label = pinLabel.trim() || `${KIND_LABEL[kind]} çıktısı`
    snapshot(label)
    const current = usePlanStore.getState()
    const last = current.currentId ? current.plans[current.currentId]?.revisions.at(-1) : undefined
    if (last) setVersionId(last.id)
    setPinLabel('')
  }
  const downloadMarkdown = () => {
    if (!report) return
    publish()
    download(`${slug}-${kind}-${versionSlug}.md`, reportToMarkdown(report), 'text/markdown')
  }
  const downloadJson = () => {
    if (viewed) download(`${slug}-veri-${versionSlug}.json`, JSON.stringify(viewed, null, 2), 'application/json')
  }
  const moreMenu = {
    items: [
      { key: 'md', label: 'Markdown indir', disabled: !report, onClick: downloadMarkdown },
      { key: 'json', label: 'JSON indir', disabled: !viewed, onClick: downloadJson },
    ],
  }

  /* Sabitleme düğmesi tek yerde durur: liste boşken boş durumun içinde, doluyken ad alanının yanında. */
  const pinButton = <Button icon={<PushPin size={16} />} onClick={pin} disabled={!isCurrent}>Bu sürümü sabitle</Button>
  const pinForm = (
    <div className="toolbar" style={{ justifyContent: 'flex-start', alignItems: 'flex-end' }}>
      <div className="filter-field">
        <label className="field-label" htmlFor="surum-adi">Sürüm adı</label>
        <Input id="surum-adi" value={pinLabel} onChange={(e) => setPinLabel(e.target.value)} placeholder="Örneğin Yatırımcı görüşmesi öncesi" disabled={!isCurrent} onPressEnter={() => isCurrent && pin()} />
      </div>
      {plan.outputs.length ? pinButton : null}
      <span className="helper" style={{ flexBasis: '100%' }}>
        {isCurrent ? 'Sabitlenen sürüm sonraki değişikliklerden etkilenmez. Her kapı kararı da bir sürüm kaydeder.' : 'Yalnız güncel taslak sabitlenir. Önce “Güncel taslak” seçin.'}
      </span>
    </div>
  )

  return (
    <div className="page">
      <div className="no-print">
        <PageHeader kicker="Çıktılar" title="Çıktılar" description="İki belge aynı veri sürümünden üretilir. Eksik bilgi uydurulmaz. Eksik yere “Bilinmiyor” yazılır." />
      </div>

      <section className="section" aria-label="Belge">
        <div className="no-print">
          <Tabs
            className="report-tabs"
            activeKey={kind}
            onChange={(k) => setKind(k as Kind)}
            items={[
              { key: 'yonetici', label: KIND_LABEL.yonetici },
              { key: 'aksiyon', label: KIND_LABEL.aksiyon },
            ]}
          />
          <div className="toolbar report-toolbar">
            <div className="filter-field">
              <label className="field-label" htmlFor="surum-secici">Sürüm</label>
              <Select id="surum-secici" value={versionId} onChange={(val) => setVersionId(val)} options={versionOptions} style={{ width: '100%' }} popupMatchSelectWidth />
            </div>
            <div className="toolbar-group">
              <Button type="primary" icon={<Printer size={16} />} onClick={() => window.print()} disabled={!report}>Yazdır veya PDF</Button>
              <Dropdown menu={moreMenu} trigger={['click']}>
                <Button icon={<CaretDown size={16} />} iconPlacement="end">Daha fazla</Button>
              </Dropdown>
            </div>
          </div>
          <p className="helper" style={{ margin: '8px 0 0' }}>
            {isCurrent ? 'Güncel taslak her değişiklikle güncellenir.' : 'Bu sürüm kapı kararında donduruldu. Sonraki değişiklikler bu raporu etkilemez.'}
          </p>
        </div>

        {!report || !viewed ? (
          <Callout tone="uyari" danger title="Bu sürüm okunamadı">Kayıtlı sürüm verisi bozuk. Güncel taslağı seçin ya da başka bir sürüm deneyin.</Callout>
        ) : (
          <div className="report-wrap">
            <article className="report">
              <header className="report-head">
                {report.stamp ? <Callout tone="uyari" title="Örnek">{report.stamp}</Callout> : null}
                <h2 className="report-title">{report.title}</h2>
                <div className="report-meta">{report.meta.map((m, i) => <span key={i}>{m}</span>)}</div>
              </header>
              {wide ? (
                report.sections.map((s) => (
                  <section key={s.title} className="report-section">
                    <h3>{s.title}</h3>
                    <SectionBody s={s} />
                  </section>
                ))
              ) : (
                <Collapse
                  key={`${kind}-${versionId}`}
                  className="report-collapse"
                  ghost
                  defaultActiveKey={[report.sections[0]?.title ?? '']}
                  items={report.sections.map((s) => ({
                    key: s.title,
                    label: <h3 className="report-collapse-title">{s.title}</h3>,
                    forceRender: true,
                    children: <div className="report-section"><SectionBody s={s} /></div>,
                  }))}
                />
              )}
            </article>
          </div>
        )}
      </section>

      <section className="section no-print" aria-label="Sürümler">
        <SectionHead title="Sürümler" description="Sabitlenen sürüm değişmez. Markdown indirince belge yayımlanmış sayılır." />
        {pinForm}
        {plan.outputs.length === 0 ? (
          <EmptyState title="Henüz yayımlanan belge yok" text="Güncel taslağı sabitleyin. Ya da “Daha fazla” menüsünden Markdown indirin. İndirilen belge burada listelenir." actions={pinButton} />
        ) : (
          <ul className="version-list" aria-label="Yayımlanan belgeler">
            {plan.outputs.map((o) => (
              <li key={o.id}>
                <span>{KIND_LABEL[o.kind]}, sürüm {o.revision}</span>
                <span className="version-date">{formatDate(o.createdAt, false)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

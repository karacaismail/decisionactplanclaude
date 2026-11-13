import { useMemo, useState } from 'react'
import { Alert, Button, Card, Input, Radio, Select, Space, Table, Typography, theme } from 'antd'
import { DownloadSimple, Printer, FileText, ListChecks, Code, PushPin } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { buildActionPlan, buildExecutiveReport, reportToMarkdown, type Report } from '@/reports/build'
import { formatDate, uid } from '@/engine/format'
import type { PlanDoc, Revision } from '@/data/types'
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

export function OutputsScreen() {
  const { token } = theme.useToken()
  const plan = useCurrentPlan()
  const update = usePlanStore((s) => s.update)
  const snapshot = usePlanStore((s) => s.snapshot)
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 24 }}>
      <div className="no-print">
        <Typography.Title level={1} style={{ fontSize: 32, marginBottom: 8 }}>Çıktılar</Typography.Title>
        <Typography.Text style={{ color: token.colorTextSecondary }}>İki belge aynı veri sürümünden üretilir. Eksik bilgi uydurulmaz. "Bilinmiyor" yazılır.</Typography.Text>
      </div>

      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
        <Radio.Group
          aria-label="Belge seçimi"
          value={kind}
          onChange={(e) => setKind(e.target.value as Kind)}
          optionType="button"
          buttonStyle="solid"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
          options={[
            { value: 'yonetici', label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FileText size={18} /> Yönetici raporu</span> },
            { value: 'aksiyon', label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ListChecks size={18} /> Girişimci aksiyon planı</span> },
          ]}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 6, maxWidth: 520 }}>
          <label htmlFor="surum-secici" style={{ fontWeight: 500 }}>Sürüm</label>
          <Select
            id="surum-secici"
            value={versionId}
            onChange={(v) => setVersionId(v)}
            options={versionOptions}
            style={{ width: '100%' }}
            popupMatchSelectWidth
          />
          <Typography.Text style={{ color: token.colorTextSecondary, fontSize: 14 }}>
            {isCurrent ? 'Güncel taslak her değişiklikle güncellenir. Her kapı kararı bir sürüm kaydeder.' : 'Bu sürüm kapı kararında donduruldu. Sonraki değişiklikler bu raporu etkilemez.'}
          </Typography.Text>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 6, maxWidth: 520 }}>
          <label htmlFor="surum-adi" style={{ fontWeight: 500 }}>Sürüm adı</label>
          <Space.Compact style={{ width: '100%' }}>
            <Input id="surum-adi" value={pinLabel} onChange={(e) => setPinLabel(e.target.value)} placeholder="Örneğin Yatırımcı görüşmesi öncesi" disabled={!isCurrent} onPressEnter={() => isCurrent && pin()} />
            <Button icon={<PushPin size={18} />} onClick={pin} disabled={!isCurrent}>Bu sürümü sabitle</Button>
          </Space.Compact>
          {!isCurrent ? <Typography.Text style={{ color: token.colorTextSecondary, fontSize: 14 }}>Yalnız güncel taslak sabitlenir. Önce "Güncel taslak" seçin.</Typography.Text> : null}
        </div>

        <Space wrap>
          <Button icon={<Printer size={18} />} onClick={() => window.print()} disabled={!report}>Yazdır veya PDF</Button>
          <Button icon={<DownloadSimple size={18} />} disabled={!report} onClick={() => { if (!report) return; publish(); download(`${slug}-${kind}-${versionSlug}.md`, reportToMarkdown(report), 'text/markdown') }}>Markdown indir</Button>
          <Button icon={<Code size={18} />} disabled={!viewed} onClick={() => viewed && download(`${slug}-veri-${versionSlug}.json`, JSON.stringify(viewed, null, 2), 'application/json')}>JSON indir</Button>
        </Space>
      </div>

      {!report || !viewed ? (
        <Alert type="error" showIcon message="Bu sürüm okunamadı." description="Kayıtlı sürüm verisi bozuk. Güncel taslağı seçin veya başka bir sürüm deneyin." />
      ) : (
        <article className="report" style={{ background: token.colorBgContainer, borderRadius: token.borderRadiusLG, padding: 'clamp(16px, 5vw, 32px)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 28, maxWidth: 820 }}>
          <header style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
            {report.stamp ? (
              <div className="report-stamp" role="note" style={{ justifySelf: 'start', background: token.colorWarningBg, color: token.colorWarningText, padding: '6px 12px', borderRadius: token.borderRadius, fontWeight: 600 }}>
                {report.stamp}
              </div>
            ) : null}
            <Typography.Title level={1} style={{ fontSize: 'clamp(28px, 8vw, 40px)', margin: 0, overflowWrap: 'break-word' }}>{report.title}</Typography.Title>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 2, color: token.colorTextSecondary, fontSize: 14 }}>{report.meta.map((m, i) => <span key={i}>{m}</span>)}</div>
          </header>
          {report.sections.map((s) => (
            <section key={s.title} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
              <Typography.Title level={2} style={{ fontSize: 24, margin: 0 }}>{s.title}</Typography.Title>
              {s.lines.map((l, i) => <Typography.Paragraph key={i} style={{ margin: 0, fontSize: 16 }}>{l}</Typography.Paragraph>)}
              {s.table ? <Table size="small" pagination={false} rowKey={(_, i) => String(i)} dataSource={s.table.rows.map((r) => Object.fromEntries(r.map((c, i) => [String(i), c])))} columns={s.table.head.map((h, i) => ({ title: h, dataIndex: String(i) }))} scroll={{ x: 'max-content' }} /> : null}
            </section>
          ))}
        </article>
      )}

      <Card size="small" title="Yayımlanan sürümler" className="no-print">
        {plan.outputs.length === 0 ? <span style={{ color: token.colorTextSecondary }}>Henüz yayımlanmadı. Markdown indirince sürüm sabitlenir.</span> : <ul style={{ margin: 0, paddingLeft: 20 }}>{plan.outputs.map((o) => <li key={o.id}>{KIND_LABEL[o.kind]}, sürüm {o.revision}, {formatDate(o.createdAt, false)}</li>)}</ul>}
      </Card>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Button, Card, Radio, Space, Table, Typography, theme } from 'antd'
import { DownloadSimple, Printer, FileText, ListChecks, Code } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { buildActionPlan, buildExecutiveReport, reportToMarkdown, type Report } from '@/reports/build'
import { uid } from '@/engine/format'

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function OutputsScreen() {
  const { token } = theme.useToken()
  const plan = useCurrentPlan()
  const update = usePlanStore((s) => s.update)
  const [kind, setKind] = useState<'yonetici' | 'aksiyon'>('yonetici')
  const report: Report | null = useMemo(() => (plan ? (kind === 'yonetici' ? buildExecutiveReport(plan) : buildActionPlan(plan)) : null), [plan, kind])
  if (!plan || !report) return null
  const slug = plan.name.toLowerCase().replace(/[^a-z0-9ğüşöçı]+/gi, '-')
  const publish = () => update((p) => p.outputs.push({ id: uid('cikti'), kind, revision: p.revision, createdAt: new Date().toISOString() }))
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
          onChange={(e) => setKind(e.target.value as 'yonetici' | 'aksiyon')}
          optionType="button"
          buttonStyle="solid"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
          options={[
            { value: 'yonetici', label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FileText size={18} /> Yönetici raporu</span> },
            { value: 'aksiyon', label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ListChecks size={18} /> Girişimci aksiyon planı</span> },
          ]}
        />
        <Space wrap>
        <Button icon={<Printer size={18} />} onClick={() => window.print()}>Yazdır veya PDF</Button>
        <Button icon={<DownloadSimple size={18} />} onClick={() => { publish(); download(`${slug}-${kind}-surum-${plan.revision}.md`, reportToMarkdown(report), 'text/markdown') }}>Markdown indir</Button>
        <Button icon={<Code size={18} />} onClick={() => download(`${slug}-veri-surum-${plan.revision}.json`, JSON.stringify(plan, null, 2), 'application/json')}>JSON indir</Button>
        </Space>
      </div>
      <article style={{ background: token.colorBgContainer, borderRadius: token.borderRadiusLG, padding: 32, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 28, maxWidth: 820 }}>
        <header>
          <Typography.Title level={1} style={{ fontSize: 40, marginBottom: 8 }}>{report.title}</Typography.Title>
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
      <Card size="small" title="Yayımlanan sürümler" className="no-print">
        {plan.outputs.length === 0 ? <span style={{ color: token.colorTextSecondary }}>Henüz yayımlanmadı. Markdown indirince sürüm sabitlenir.</span> : <ul style={{ margin: 0, paddingLeft: 20 }}>{plan.outputs.map((o) => <li key={o.id}>{o.kind === 'yonetici' ? 'Yönetici raporu' : 'Aksiyon planı'}, sürüm {o.revision}</li>)}</ul>}
      </Card>
    </div>
  )
}

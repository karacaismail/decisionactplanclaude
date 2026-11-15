import { useId, useMemo, useState } from 'react'
import { Button, Card, DatePicker, Descriptions, Drawer, Dropdown, Form, Grid, Input, Popconfirm, Select, Statistic, Table, Tag, App as AntApp } from 'antd'
import type { TableProps } from 'antd'
import dayjs from 'dayjs'
import { Link } from 'react-router'
import { Plus, Check, PencilSimple, DotsThree, Trash } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import type { Evidence, EvidenceKind } from '@/data/types'
import { STEPS, stepHeading } from '@/data/registry'
import { EvidenceLadderPicker, LADDER } from '@/components/EvidenceLadderPicker'
import { ChartFrame } from '@/charts/ChartFrame'
import { formatDate } from '@/engine/format'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import '@/styles/screens-kapi.css'

const KIND_LABEL: Record<EvidenceKind, string> = { gozlem: 'Gözlem', tahmin: 'Tahmin', varsayim: 'Varsayım' }
const KIND_OPTIONS = (Object.keys(KIND_LABEL) as EvidenceKind[]).map((k) => ({ value: k, label: KIND_LABEL[k] }))
const KIND_FILTERS = KIND_OPTIONS.map((o) => ({ text: o.label, value: o.value }))
const LADDER_FILTERS = LADDER.map((l) => ({ text: `${l.level}. ${l.label}`, value: l.level }))

type Panel = { mode: 'yeni'; item: Partial<Evidence> } | { mode: 'detay'; item: Evidence } | { mode: 'duzenle'; item: Evidence; draft: Partial<Evidence> }

const ladderLabel = (l: number) => `${l}. ${LADDER[l - 1]?.label ?? ''}`.trim()

export function EvidenceScreen() {
  const uid = useId()
  const id = (k: string) => `${uid}-${k}`
  const bp = Grid.useBreakpoint()
  const narrow = bp.md === false
  const { message } = AntApp.useApp()
  const plan = useCurrentPlan()
  const addEvidence = usePlanStore((s) => s.addEvidence)
  const updateEvidence = usePlanStore((s) => s.updateEvidence)
  const removeEvidence = usePlanStore((s) => s.removeEvidence)
  const [panel, setPanel] = useState<Panel | null>(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const list = useMemo(() => {
    const all = plan?.evidence ?? []
    const q = query.trim().toLocaleLowerCase('tr-TR')
    if (!q) return all
    return all.filter((e) => [e.title, e.source, e.group, e.counterFinding].some((t) => t?.toLocaleLowerCase('tr-TR').includes(q)))
  }, [plan, query])
  if (!plan) return null

  const counts = {
    total: plan.evidence.length,
    gozlem: plan.evidence.filter((e) => e.kind === 'gozlem').length,
    tahmin: plan.evidence.filter((e) => e.kind === 'tahmin').length,
    varsayim: plan.evidence.filter((e) => e.kind === 'varsayim').length,
  }
  const ladderCounts = LADDER.map((l) => plan.evidence.filter((e) => e.ladder === l.level).length)
  const strong = plan.evidence.filter((e) => e.ladder <= 3).length
  const chartOption = {
    grid: { left: 36, right: 32, top: 8, bottom: 8, containLabel: false },
    tooltip: { trigger: 'axis', formatter: (ps: { dataIndex: number; value: number }[]) => { const p = ps[0]; return `${ladderLabel(p.dataIndex + 1)}: ${p.value} kanıt` } },
    xAxis: { type: 'value', minInterval: 1, splitLine: { show: false }, axisLabel: { show: false }, axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'category', inverse: true, data: LADDER.map((l) => String(l.level)), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 14 } },
    series: [{ type: 'bar', data: ladderCounts, barMaxWidth: 14, label: { show: true, position: 'right', fontSize: 14, formatter: (p: { value: number }) => (p.value ? String(p.value) : '') }, itemStyle: { borderRadius: 2 } }],
  }
  const chartTable = { head: ['Basamak', 'Kanıt sayısı'], rows: LADDER.map((l, i) => [ladderLabel(l.level), ladderCounts[i]]) }

  const draftOf = (p: Panel | null): Partial<Evidence> | null => (p?.mode === 'yeni' ? p.item : p?.mode === 'duzenle' ? p.draft : null)
  const setDraft = (patch: Partial<Evidence>) => {
    if (!panel) return
    if (panel.mode === 'yeni') setPanel({ mode: 'yeni', item: { ...panel.item, ...patch } })
    if (panel.mode === 'duzenle') setPanel({ mode: 'duzenle', item: panel.item, draft: { ...panel.draft, ...patch } })
  }
  const draft = draftOf(panel)
  const save = () => {
    if (!panel || !draft?.title?.trim()) return
    if (panel.mode === 'duzenle') {
      updateEvidence(panel.item.id, draft)
      message.success('Kanıt güncellendi.')
      setPanel({ mode: 'detay', item: { ...panel.item, ...draft } as Evidence })
      return
    }
    addEvidence({ title: draft.title.trim(), kind: draft.kind ?? 'gozlem', ladder: draft.ladder ?? 5, date: draft.date, source: draft.source, group: draft.group, counterFinding: draft.counterFinding, linkedSteps: [] })
    message.success('Kanıt eklendi.')
    setPanel(null)
  }
  const removeSelected = () => {
    // Depo kanıtı siler, bağlı kararları ve geçiş kararını eskitir.
    removeEvidence(selected)
    message.success(`${selected.length} kanıt silindi.`)
    setSelected([])
    setConfirmOpen(false)
  }
  const stepsOfEvidence = (e: Evidence) => e.linkedSteps.map((sid) => STEPS[sid]).filter(Boolean)

  const kindTag = (k: EvidenceKind) => <Tag>{KIND_LABEL[k]}</Tag>
  const wideColumns: TableProps<Evidence>['columns'] = [
    { title: 'Kanıt', dataIndex: 'title', width: 240, className: 'is-sticky-col', sorter: (a, b) => a.title.localeCompare(b.title, 'tr-TR'), render: (t: string) => <span>{t}</span> },
    { title: 'Tür', dataIndex: 'kind', width: 110, filters: KIND_FILTERS, onFilter: (v, e) => e.kind === v, render: (k: EvidenceKind) => kindTag(k) },
    { title: 'Basamak', dataIndex: 'ladder', width: 190, filters: LADDER_FILTERS, onFilter: (v, e) => e.ladder === v, sorter: (a, b) => a.ladder - b.ladder, render: (l: number) => <span className="tabular">{ladderLabel(l)}</span> },
    { title: 'Tarih', dataIndex: 'date', width: 140, sorter: (a, b) => (a.date ?? '').localeCompare(b.date ?? ''), defaultSortOrder: 'descend', render: (d?: string) => <span className="tabular">{formatDate(d, false)}</span> },
    { title: 'Kaynak', dataIndex: 'source', width: bp.xxl ? 200 : undefined, render: (s?: string) => s ?? <span className="helper">Yazılmadı</span> },
    /* Karşı bulgu sütunu yalnız 1600 ve üstünde; dar masaüstünde ayrıntı çekmecesinde okunur. */
    ...(bp.xxl ? [{ title: 'Karşı bulgu', dataIndex: 'counterFinding', render: (s?: string) => s ?? <span className="helper">Yok</span> }] : []),
  ]
  const narrowColumns: TableProps<Evidence>['columns'] = [
    {
      title: 'Kanıt',
      dataIndex: 'title',
      filters: KIND_FILTERS,
      onFilter: (v, e) => e.kind === v,
      sorter: (a, b) => (a.date ?? '').localeCompare(b.date ?? ''),
      defaultSortOrder: 'descend',
      render: (_: string, e: Evidence) => (
        <div className="cell-stack">
          <span className="cell-title">{e.title}</span>
          <span className="cell-line">{kindTag(e.kind)}<span className="tabular">{ladderLabel(e.ladder)}</span></span>
          <span className="cell-line">
            <span className="tabular">{formatDate(e.date, false)}</span>
            {e.source ? <span>{e.source}</span> : null}
          </span>
        </div>
      ),
    },
  ]

  const form = draft ? (
    <Form className="k-form" layout="vertical" requiredMark={false} onFinish={save}>
      <Form.Item label="Kanıtın adı" htmlFor={id('ad')} extra="Tek cümle. Ne gördünüz ya da ne bekliyorsunuz?">
        <Input id={id('ad')} value={draft.title ?? ''} onChange={(e) => setDraft({ title: e.target.value })} />
      </Form.Item>
      <div className="two-col">
        <Form.Item label="Türü" htmlFor={id('tur')}>
          <Select id={id('tur')} value={draft.kind ?? 'gozlem'} onChange={(v) => setDraft({ kind: v })} options={KIND_OPTIONS} />
        </Form.Item>
        <Form.Item label="Olay tarihi" htmlFor={id('tarih')}>
          <DatePicker id={id('tarih')} format="D MMMM YYYY" placeholder="Tarih seçin" disabledDate={(d) => d.isAfter(dayjs().endOf('day'))} value={draft.date ? dayjs(draft.date) : null} onChange={(v) => setDraft({ date: v ? v.format('YYYY-MM-DD') : undefined })} />
        </Form.Item>
      </div>
      <Form.Item label="Kaynak" htmlFor={id('kaynak')}>
        <Input id={id('kaynak')} value={draft.source ?? ''} onChange={(e) => setDraft({ source: e.target.value })} placeholder="Kim, nerede?" />
      </Form.Item>
      <Form.Item label="İlgili grup" htmlFor={id('grup')}>
        <Input id={id('grup')} value={draft.group ?? ''} onChange={(e) => setDraft({ group: e.target.value })} placeholder="Hangi müşteri grubu?" />
      </Form.Item>
      <Form.Item label="Karşı bulgu" htmlFor={id('karsi')} extra="Bu iddiayla çelişen ne var?">
        <Input.TextArea id={id('karsi')} rows={2} showCount value={draft.counterFinding ?? ''} onChange={(e) => setDraft({ counterFinding: e.target.value })} />
      </Form.Item>
      <Form.Item label={<span id={id('basamak-etiket')}>Kanıt basamağı</span>}>
        <EvidenceLadderPicker id={id('basamak')} value={draft.ladder} onChange={(l) => setDraft({ ladder: l })} />
      </Form.Item>
    </Form>
  ) : null

  const detail = panel?.mode === 'detay' ? panel.item : null
  const drawerTitle = panel?.mode === 'yeni' ? 'Yeni kanıt' : panel?.mode === 'duzenle' ? 'Kanıtı düzenle' : 'Kanıt'

  return (
    <div className="page">
      <PageHeader
        kicker="Kanıt defteri"
        title="Kanıtlar"
        description="Tek kanıt defteri. Aynı kanıt birden çok adımda kullanılır. Aynı haberin iki kopyası tek kaynaktır."
        actions={<Button type="primary" icon={<Plus size={16} />} onClick={() => setPanel({ mode: 'yeni', item: { kind: 'gozlem', ladder: 5 } })}>Kanıt ekle</Button>}
      />

      <div className="stat-grid is-three" role="group" aria-label="Kanıt özeti">
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Toplam kanıt" value={counts.total} />
          <span className="stat-note">{strong} kanıt 1, 2 veya 3. basamakta.</span>
        </Card>
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Gözlem" value={counts.gozlem} />
          <span className="stat-note">Kayda geçmiş olay.</span>
        </Card>
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Tahmin" value={counts.tahmin} />
          <span className="stat-note">{counts.varsayim} varsayım ayrıca duruyor.</span>
        </Card>
        <div className="is-wide chart-slot">
          <ChartFrame title="Basamak dağılımı" option={chartOption} table={chartTable} height={168} summary="1. basamak en güçlü kanıttır. 7. basamak yalnız kurucu kanaatidir." />
        </div>
      </div>

      <Card
        className="k-card"
        variant="borderless"
        title="Kanıt listesi"
        extra={
          <>
            <Input.Search className="toolbar-search" allowClear placeholder="Kanıt ara" aria-label="Kanıt ara" value={query} onChange={(e) => setQuery(e.target.value)} />
            <span className="tabular">{list.length} kanıt</span>
          </>
        }
      >
        {selected.length > 0 ? (
          <div className="bulk-bar" role="status">
            <span className="helper">{selected.length} kanıt seçildi.</span>
            <Popconfirm
              open={confirmOpen}
              title="Seçilen kanıtlar silinsin mi?"
              description="Bu kanıta dayanan kararlar yeniden inceleme ister."
              okText="Sil"
              cancelText="Vazgeç"
              okButtonProps={{ danger: true }}
              onConfirm={removeSelected}
              onCancel={() => setConfirmOpen(false)}
            >
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    { key: 'sil', label: 'Seçilenleri sil', icon: <Trash size={16} />, danger: true },
                    { key: 'temizle', label: 'Seçimi kaldır' },
                  ],
                  onClick: ({ key }) => { if (key === 'sil') setConfirmOpen(true); else setSelected([]) },
                }}
              >
                <Button icon={<DotsThree size={16} weight="bold" />}>Toplu işlem</Button>
              </Dropdown>
            </Popconfirm>
          </div>
        ) : null}
        <div className="table-scroll">
          <Table<Evidence>
            rowKey="id"
            size="middle"
            dataSource={list}
            pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
            style={narrow ? undefined : { minWidth: 760 }}
            locale={{ emptyText: query ? 'Aramaya uyan kanıt yok.' : 'Kanıt yok. İlk görüşme notunu ekleyin.' }}
            rowSelection={{ selectedRowKeys: selected, onChange: (keys) => setSelected(keys.map(String)), columnWidth: 48 }}
            rowClassName={() => 'is-link'}
            onRow={(e) => ({
              onClick: (ev) => {
                if ((ev.target as HTMLElement).closest('.ant-table-selection-column, .ant-checkbox-wrapper')) return
                setPanel({ mode: 'detay', item: e })
              },
            })}
            columns={narrow ? narrowColumns : wideColumns}
          />
        </div>
      </Card>

      <Callout tone="ipucu" title="Bir bulgu neyi kanıtlar?">Gözlem kayda geçmiş olaydır. Tahmin gelecekte beklediğiniz sonuçtur. Varsayım doğru kabul ettiğiniz sözdür. Eksik ölçümü "bilinmiyor" diye kaydedin. Sıfır yazmayın.</Callout>

      <Drawer
        rootClassName="k-drawer"
        open={Boolean(panel)}
        onClose={() => setPanel(null)}
        title={drawerTitle}
        size={Math.min(560, typeof window !== 'undefined' ? window.innerWidth : 560)}
        footer={
          <div className="drawer-footer">
            {detail ? (
              <>
                <Button type="text" onClick={() => setPanel(null)}>Kapat</Button>
                <Button icon={<PencilSimple size={16} />} onClick={() => setPanel({ mode: 'duzenle', item: detail, draft: { ...detail } })}>Düzenle</Button>
              </>
            ) : (
              <>
                <Button type="text" onClick={() => (panel?.mode === 'duzenle' ? setPanel({ mode: 'detay', item: panel.item }) : setPanel(null))}>Vazgeç</Button>
                <Button icon={<Check size={16} />} onClick={save} disabled={!draft?.title?.trim()}>Kaydet</Button>
              </>
            )}
          </div>
        }
      >
        {detail ? (
          <div className="drawer-stack">
            <Descriptions
              column={1}
              size="small"
              colon={false}
              title={detail.title}
              items={[
                { key: 'tur', label: 'Tür', children: kindTag(detail.kind) },
                { key: 'basamak', label: 'Basamak', children: ladderLabel(detail.ladder) },
                { key: 'tarih', label: 'Olay tarihi', children: formatDate(detail.date) },
                { key: 'kaynak', label: 'Kaynak', children: detail.source ?? 'Yazılmadı' },
                { key: 'grup', label: 'İlgili grup', children: detail.group ?? 'Yazılmadı' },
                { key: 'karsi', label: 'Karşı bulgu', children: detail.counterFinding ?? 'Yok' },
                { key: 'eklendi', label: 'Eklendi', children: formatDate(detail.createdAt) },
              ]}
            />
            <div>
              <h3 className="section-head" style={{ marginBottom: 8 }}><span style={{ fontSize: 16, fontWeight: 600 }}>Kullanıldığı adımlar</span></h3>
              {stepsOfEvidence(detail).length === 0 ? (
                <span className="helper">Bu kanıt henüz bir adıma bağlanmadı.</span>
              ) : (
                <div className="tag-row">
                  {stepsOfEvidence(detail).map((s) => (
                    <Tag key={s.id}><Link to={`/karar/${s.decision}/adim/${s.id}`} onClick={() => setPanel(null)}>{stepHeading(s.id)}</Link></Tag>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : form}
      </Drawer>
    </div>
  )
}

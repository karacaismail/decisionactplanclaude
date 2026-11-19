import '@/styles/desen/section-head.css'
import '@/styles/desen/pano.css'
import '@/styles/desen/pano-ortak.css'
import '@/styles/desen/k-card.css'
import '@/styles/desen/kapi-ortak.css'
import '@/styles/desen/stat-card.css'
import '@/styles/desen/k-drawer.css'
import '@/styles/desen/k-form.css'
import '@/styles/desen/kapi.css'
import '@/styles/ekran/EvidenceScreen.css'
import { useId, useMemo, useState } from 'react'
import { Button, Card, Checkbox, DatePicker, Descriptions, Drawer, Dropdown, Form, Input, Pagination, Popconfirm, Select, Statistic, Table, Tag, App as AntApp } from 'antd'
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
import { EmptyState } from '@/components/EmptyState'
const KIND_LABEL: Record<EvidenceKind, string> = { gozlem: 'Gözlem', tahmin: 'Tahmin', varsayim: 'Varsayım' }
const KIND_OPTIONS = (Object.keys(KIND_LABEL) as EvidenceKind[]).map((k) => ({ value: k, label: KIND_LABEL[k] }))
const LADDER_OPTIONS = LADDER.map((l) => ({ label: `${l.level}. ${l.label}`, value: l.level }))
const SELECT_CLASS_NAMES = { popup: { root: 'mobil-evidence-select-popup' } }
const PAGE_SIZE = 10
const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Tarih: yeniden eskiye' },
  { value: 'date-asc', label: 'Tarih: eskiden yeniye' },
  { value: 'title-asc', label: 'Ad: A harfinden Z harfine' },
  { value: 'title-desc', label: 'Ad: Z harfinden A harfine' },
  { value: 'ladder-asc', label: 'Basamak: güçlüden zayıfa' },
  { value: 'ladder-desc', label: 'Basamak: zayıftan güçlüye' },
] as const
type EvidenceSort = typeof SORT_OPTIONS[number]['value']

type Panel = { mode: 'yeni'; item: Partial<Evidence> } | { mode: 'detay'; item: Evidence } | { mode: 'duzenle'; item: Evidence; draft: Partial<Evidence> }

const ladderLabel = (l: number) => `${l}. ${LADDER[l - 1]?.label ?? ''}`.trim()

export function EvidenceScreen() {
  const uid = useId()
  const id = (k: string) => `${uid}-${k}`
  const { message } = AntApp.useApp()
  const plan = useCurrentPlan()
  const addEvidence = usePlanStore((s) => s.addEvidence)
  const updateEvidence = usePlanStore((s) => s.updateEvidence)
  const removeEvidence = usePlanStore((s) => s.removeEvidence)
  const [panel, setPanel] = useState<Panel | null>(null)
  const [query, setQuery] = useState('')
  const [kinds, setKinds] = useState<EvidenceKind[]>([])
  const [ladders, setLadders] = useState<number[]>([])
  const [sort, setSort] = useState<EvidenceSort>('date-desc')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const list = useMemo(() => {
    const all = plan?.evidence ?? []
    const q = query.trim().toLocaleLowerCase('tr-TR')
    const filtered = all.filter((e) =>
      (!q || [e.title, e.source, e.group, e.counterFinding].some((t) => t?.toLocaleLowerCase('tr-TR').includes(q))) &&
      (kinds.length === 0 || kinds.includes(e.kind)) &&
      (ladders.length === 0 || ladders.includes(e.ladder)),
    )
    return filtered.sort((a, b) => {
      const comparison = sort.startsWith('title') ? a.title.localeCompare(b.title, 'tr-TR')
        : sort.startsWith('ladder') ? a.ladder - b.ladder
          : (a.date ?? '').localeCompare(b.date ?? '')
      return sort.endsWith('asc') ? comparison : -comparison
    })
  }, [plan, query, kinds, ladders, sort])
  if (!plan) return null
  const currentPage = Math.min(page, Math.max(1, Math.ceil(list.length / PAGE_SIZE)))
  const visibleEvidence = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const pageSelected = visibleEvidence.filter((e) => selected.includes(e.id)).length
  const hasFilters = Boolean(query || kinds.length || ladders.length)
  const clearFilters = () => {
    setQuery('')
    setKinds([])
    setLadders([])
    setPage(1)
  }

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
    // Depo kanıtı siler, bağlı kararları ve hazırlık kararını eskitir.
    removeEvidence(selected)
    message.success(`${selected.length} kanıt silindi.`)
    setSelected([])
    setConfirmOpen(false)
  }
  const stepsOfEvidence = (e: Evidence) => e.linkedSteps.map((sid) => STEPS[sid]).filter(Boolean)

  const kindTag = (k: EvidenceKind) => <Tag>{KIND_LABEL[k]}</Tag>

  const form = draft ? (
    <Form className="k-form" layout="vertical" requiredMark={false} onFinish={save}>
      <Form.Item label="Kanıtın adı" htmlFor={id('ad')} extra="Gördüğünüz veya beklediğiniz sonucu tek cümleyle yazın.">
        <Input id={id('ad')} value={draft.title ?? ''} onChange={(e) => setDraft({ title: e.target.value })} />
      </Form.Item>
      <div className="two-col">
        <Form.Item label="Türü" htmlFor={id('tur')}>
          <Select id={id('tur')} classNames={SELECT_CLASS_NAMES} value={draft.kind ?? 'gozlem'} onChange={(v) => setDraft({ kind: v })} options={KIND_OPTIONS} />
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

  const detail = panel?.mode === 'detay' ? plan.evidence.find((e) => e.id === panel.item.id) ?? panel.item : null
  const drawerTitle = panel?.mode === 'yeni' ? 'Yeni kanıt' : panel?.mode === 'duzenle' ? 'Kanıtı düzenle' : 'Kanıt'

  return (
    <div className="page mobil-evidence">
      <PageHeader
        kicker="Kanıt defteri"
        title="Kanıtlar"
        description="Bütün kanıtlar bu defterde durur. Aynı kanıt birden çok adımda kullanılır. Aynı haberin iki kopyası tek kaynaktır."
        actions={<Button type="primary" icon={<Plus size={16} />} onClick={() => setPanel({ mode: 'yeni', item: { kind: 'gozlem', ladder: 5 } })}>Kanıt ekle</Button>}
      />

      <div className="stat-grid is-three" role="group" aria-label="Kanıt özeti">
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Toplam kanıt" value={counts.total} />
          <span className="stat-note">{strong} kanıt ilk üç basamakta yer alır.</span>
        </Card>
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Gözlem" value={counts.gozlem} />
          <span className="stat-note">Gözlem, kayda geçmiş olaydır.</span>
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
        className="k-card evidence-register"
        variant="borderless"
        title="Kanıt listesi"
        extra={<span className="tabular" role="status">{list.length} kanıt bulundu.</span>}
      >
        <div className="evidence-toolbar" role="group" aria-label="Kanıt filtreleri">
          <div className="evidence-filter">
            <label htmlFor={id('arama')}>Kanıt ara</label>
            <Input.Search id={id('arama')} allowClear placeholder="Kanıt ara" aria-label="Kanıt ara" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} />
          </div>
          <div className="evidence-filter">
            <label htmlFor={id('tur-filtre')}>Tür</label>
            <Select<EvidenceKind[]> id={id('tur-filtre')} aria-label="Kanıt türünü filtrele" classNames={SELECT_CLASS_NAMES} mode="multiple" allowClear placeholder="Bütün türler" value={kinds} options={KIND_OPTIONS} onChange={(values) => { setKinds(values); setPage(1) }} />
          </div>
          <div className="evidence-filter">
            <label htmlFor={id('basamak-filtre')}>Basamak</label>
            <Select<number[]> id={id('basamak-filtre')} aria-label="Kanıt basamağını filtrele" classNames={SELECT_CLASS_NAMES} mode="multiple" allowClear placeholder="Bütün basamaklar" value={ladders} options={LADDER_OPTIONS} onChange={(values) => { setLadders(values); setPage(1) }} />
          </div>
          <div className="evidence-filter">
            <label htmlFor={id('sirala')}>Sıralama</label>
            <Select<EvidenceSort> id={id('sirala')} aria-label="Kanıtları sırala" classNames={SELECT_CLASS_NAMES} value={sort} options={[...SORT_OPTIONS]} onChange={(value) => { setSort(value); setPage(1) }} />
          </div>
          <Button onClick={clearFilters} disabled={!hasFilters}>Filtreleri temizle</Button>
        </div>
        <div className="evidence-selection">
          <Checkbox
            checked={visibleEvidence.length > 0 && pageSelected === visibleEvidence.length}
            indeterminate={pageSelected > 0 && pageSelected < visibleEvidence.length}
            disabled={visibleEvidence.length === 0}
            onChange={(event) => setSelected((previous) => event.target.checked
              ? [...new Set([...previous, ...visibleEvidence.map((e) => e.id)])]
              : previous.filter((key) => !visibleEvidence.some((e) => e.id === key)))}
          >Bu sayfadaki kanıtları seç</Checkbox>
        </div>
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
        <Table<Evidence>
          className="evidence-table"
          aria-label="Kanıt kayıtları"
          rowKey="id"
          dataSource={visibleEvidence}
          pagination={false}
          showHeader={false}
          tableLayout="fixed"
          size="middle"
          rowHoverable={false}
          locale={{ emptyText: hasFilters
            ? <EmptyState announce={false} level={3} title="Kanıt bulunamadı" text="Seçtiğiniz filtrelere uyan kanıt yok." action={<Button onClick={clearFilters}>Filtreleri temizle</Button>} />
            : <EmptyState announce={false} level={3} title="Henüz kanıt yok" text="İlk görüşme notunuzu ekleyince kanıt burada görünür." action={<Button icon={<Plus size={16} />} onClick={() => setPanel({ mode: 'yeni', item: { kind: 'gozlem', ladder: 5 } })}>Kanıt ekle</Button>} /> }}
          columns={[{
            key: 'evidence',
            title: 'Kanıt',
            render: (_: unknown, e: Evidence) => (
              <article className="evidence-card" aria-label={e.title}>
                <div className="evidence-card-head">
                  <h3 className="evidence-card-title">
                    <Button type="link" aria-label={`Kanıtı aç: ${e.title}`} onClick={() => setPanel({ mode: 'detay', item: e })}>{e.title}</Button>
                  </h3>
                  <Checkbox aria-label={`Kanıtı seç: ${e.title}`} checked={selected.includes(e.id)} onChange={(event) => setSelected((previous) => event.target.checked ? [...previous, e.id] : previous.filter((key) => key !== e.id))} />
                </div>
                <dl className="evidence-fields">
                  <div><dt>Tür</dt><dd>{kindTag(e.kind)}</dd></div>
                  <div><dt>Basamak</dt><dd>{ladderLabel(e.ladder)}</dd></div>
                  <div><dt>Olay tarihi</dt><dd className="tabular">{formatDate(e.date)}</dd></div>
                  <div><dt>Kaynak</dt><dd>{e.source ?? 'Yazılmadı'}</dd></div>
                  <div><dt>İlgili grup</dt><dd>{e.group ?? 'Yazılmadı'}</dd></div>
                  <div><dt>Karşı bulgu</dt><dd>{e.counterFinding ?? 'Yok'}</dd></div>
                </dl>
              </article>
            ),
          }]}
        />
        <nav className="evidence-pagination" aria-label="Kanıt sayfaları">
          <Pagination current={currentPage} pageSize={PAGE_SIZE} total={list.length} onChange={setPage} hideOnSinglePage showSizeChanger={false} simple={{ readOnly: true }} />
        </nav>
      </Card>

      <Callout tone="ipucu" title="Bir bulgu neyi kanıtlar?">Gözlem kayda geçmiş olaydır. Tahmin gelecekte beklediğiniz sonuçtur. Varsayım doğru kabul ettiğiniz sözdür. Eksik ölçümü "bilinmiyor" diye kaydedin. Sıfır yazmayın.</Callout>

      <Drawer
        rootClassName="k-drawer mobil-evidence-drawer"
        open={Boolean(panel)}
        onClose={() => setPanel(null)}
        title={drawerTitle}
        size="min(100vw, var(--evidence-drawer-width))"
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
                { key: 'ek', label: 'Ek dosya', children: detail.attachmentName ?? 'Yok' },
                { key: 'eklendi', label: 'Eklendi', children: formatDate(detail.createdAt) },
                { key: 'guncellendi', label: 'Güncellendi', children: formatDate(detail.updatedAt) },
              ]}
            />
            <div>
              <h3 className="section-head">Kullanıldığı adımlar</h3>
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

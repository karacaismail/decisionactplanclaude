import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { App as AntApp, Button, Card, Dropdown, Empty, Grid, Input, List, Modal, Popconfirm, Progress, Statistic, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Plus, DotsThree, CaretDown, DownloadSimple, UploadSimple, Sparkle, Trash, ArrowSquareOut } from '@phosphor-icons/react'
import { useNavigate } from 'react-router'
import { usePlanStore } from '@/store/planStore'
import { formatDate } from '@/engine/format'
import { downloadJson, safeFileName } from '@/engine/sync'
import { gatePassed } from '@/engine/gate'
import { DECISIONS } from '@/data/decisions'
import { buildDemoPlan } from '@/data/demo'
import type { PlanDoc } from '@/data/types'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import '@/styles/screens-pano.css'

const GATES = DECISIONS.length

interface Row {
  plan: PlanDoc
  passed: number
  openGate: number | null
}

function toRow(plan: PlanDoc): Row {
  const passed = DECISIONS.filter((d) => gatePassed(plan, d.n)).length
  const open = DECISIONS.find((d) => !gatePassed(plan, d.n))
  return { plan, passed, openGate: open ? open.n : null }
}

function StatusTags({ row }: { row: Row }) {
  return (
    <span className="tag-row">
      {row.plan.example ? <Tag>Örnek</Tag> : null}
      {row.openGate === null ? <Tag color="success">Tamamlandı</Tag> : <Tag color="processing">Açık karar {row.openGate}</Tag>}
    </span>
  )
}

export function PlansScreen() {
  const nav = useNavigate()
  const plans = usePlanStore((s) => s.plans)
  const createPlan = usePlanStore((s) => s.createPlan)
  const selectPlan = usePlanStore((s) => s.selectPlan)
  const deletePlan = usePlanStore((s) => s.deletePlan)
  const importPlan = usePlanStore((s) => s.importPlan)
  const importPlanText = usePlanStore((s) => s.importPlanText)
  const { message } = AntApp.useApp()
  const bp = Grid.useBreakpoint()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const rows = useMemo(() => Object.values(plans).map(toRow).sort((a, b) => b.plan.updatedAt.localeCompare(a.plan.updatedAt)), [plans])
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR')
    return q ? rows.filter((r) => r.plan.name.toLocaleLowerCase('tr-TR').includes(q)) : rows
  }, [rows, query])
  const openCount = rows.filter((r) => r.openGate !== null).length
  const latest = rows[0]?.plan.updatedAt

  /* Yeni ekran en üstten açılır. Liste aşağı kaydırılmış olsa da kaydırma sıfırlanır. */
  const goTop = (to: string) => {
    window.scrollTo(0, 0)
    nav(to)
  }

  const create = () => {
    if (!name.trim()) return
    createPlan(name.trim())
    setOpen(false)
    setName('')
    goTop('/baslangic')
  }

  const openDemo = () => {
    importPlan(buildDemoPlan())
    goTop('/ozet')
  }

  const openPlan = (id: string, to?: string) => {
    selectPlan(id)
    goTop(to ?? '/ozet')
  }

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    file.text().then((t) => {
      try {
        importPlanText(t, file.size)
        message.success('Plan içe alındı.')
      } catch (err) {
        message.error(err instanceof Error ? err.message : 'Dosya okunamadı.')
      }
    })
  }

  const moreMenu = {
    items: [
      { key: 'import', label: 'JSON içe al', icon: <UploadSimple size={16} /> },
      { key: 'demo', label: 'Örnek planı aç', icon: <Sparkle size={16} /> },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'import') fileInput.current?.click()
      if (key === 'demo') openDemo()
    },
  }

  const actions = (p: PlanDoc) => (
    <Popconfirm
      title="Plan silinsin mi?"
      description="Bu işlem geri alınamaz."
      okText="Sil"
      cancelText="Vazgeç"
      open={confirmId === p.id}
      onOpenChange={(v) => {
        if (!v) setConfirmId(null)
      }}
      onConfirm={() => {
        setConfirmId(null)
        deletePlan(p.id)
      }}
    >
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            { key: 'open', label: 'Aç', icon: <ArrowSquareOut size={16} /> },
            { key: 'json', label: 'JSON indir', icon: <DownloadSimple size={16} /> },
            { type: 'divider' },
            { key: 'delete', label: 'Sil', icon: <Trash size={16} />, danger: true },
          ],
          onClick: ({ key }) => {
            if (key === 'open') openPlan(p.id, p.lastLocation ?? '/ozet')
            if (key === 'json') downloadJson(`${safeFileName(p.name)}.json`, p)
            if (key === 'delete') setConfirmId(p.id)
          },
        }}
      >
        <Button type="text" aria-label={`${p.name} için daha fazla işlem`} icon={<DotsThree size={20} weight="bold" />} />
      </Dropdown>
    </Popconfirm>
  )

  const columns: ColumnsType<Row> = [
    {
      title: 'Plan',
      key: 'name',
      dataIndex: ['plan', 'name'],
      sorter: (a, b) => a.plan.name.localeCompare(b.plan.name, 'tr'),
      render: (_, r) => (
        <Button type="link" className="plan-name" onClick={() => openPlan(r.plan.id, r.plan.lastLocation ?? '/ozet')}>
          {r.plan.name}
        </Button>
      ),
    },
    {
      title: 'İlerleme',
      key: 'progress',
      width: 170,
      sorter: (a, b) => a.passed - b.passed,
      render: (_, r) => <Progress percent={Math.round((r.passed / GATES) * 100)} format={() => `${r.passed} / ${GATES}`} aria-label={`${r.passed} / ${GATES} kapı geçildi`} />,
    },
    { title: 'Durum', key: 'status', width: 190, render: (_, r) => <StatusTags row={r} /> },
    {
      title: 'Son değişiklik',
      key: 'updated',
      width: 170,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.plan.updatedAt.localeCompare(b.plan.updatedAt),
      render: (_, r) => formatDate(r.plan.updatedAt, false),
    },
    { title: 'Sürüm', key: 'revision', width: 80, align: 'right', sorter: (a, b) => a.plan.revision - b.plan.revision, render: (_, r) => <span className="tabular">{r.plan.revision}</span> },
    { title: 'Eylemler', key: 'actions', width: 72, align: 'right', render: (_, r) => actions(r.plan) },
  ]

  const emptyActions = (
    <span className="empty-actions">
      <Button icon={<Sparkle size={16} />} onClick={openDemo}>
        Örnek planı aç
      </Button>
      <Button type="text" icon={<UploadSimple size={16} />} onClick={() => fileInput.current?.click()}>
        JSON içe al
      </Button>
    </span>
  )

  return (
    <div className="page">
      <PageHeader
        title="Planlar"
        kicker="Çalışma alanı"
        description="Her iş fikri ayrı bir plandır. Plan bu tarayıcıda saklanır. İstediğinizde dosya olarak dışa aktarırsınız."
        actions={
          <>
            <Button type="primary" icon={<Plus size={16} />} onClick={() => setOpen(true)}>
              Yeni plan
            </Button>
            <Dropdown menu={moreMenu} trigger={['click']}>
              <Button icon={<CaretDown size={16} />} iconPlacement="end">
                Daha fazla
              </Button>
            </Dropdown>
          </>
        }
      />
      <input ref={fileInput} type="file" accept="application/json" hidden onChange={onFile} aria-label="JSON dosyası seç" />

      <div className="stat-row">
        <Card className="pano-card">
          <Statistic title="Plan" value={rows.length} suffix="plan" />
          <p className="helper">{rows.length === 0 ? 'Henüz plan yok.' : rows.filter((r) => r.plan.example).length > 0 ? 'Biri örnek plan.' : 'Hepsi sizin planınız.'}</p>
        </Card>
        <Card className="pano-card">
          <Statistic title="Açık karar" value={openCount} suffix="karar" />
          <p className="helper">{openCount === 0 ? 'Bekleyen karar yok.' : `${openCount} planda sıradaki kapı bekliyor.`}</p>
        </Card>
        <Card className="pano-card">
          <Statistic title="Son değişiklik" value={latest ? formatDate(latest, false) : 'Henüz yok'} />
          <p className="helper">{latest ? 'En son kaydedilen plan bu tarihte değişti.' : 'İlk planı açınca tarih görünür.'}</p>
        </Card>
      </div>

      <Card
        className="pano-card"
        title="Plan listesi"
        extra={rows.length > 0 ? <Input.Search allowClear placeholder="Plan adı ara" aria-label="Plan adı ara" value={query} onChange={(e) => setQuery(e.target.value)} className="plan-search" /> : null}
      >
        {rows.length === 0 ? (
          <Empty description="Henüz plan yok. Yeni bir plan açın. Ya da örnek planla ekranları tanıyın.">{emptyActions}</Empty>
        ) : filtered.length === 0 ? (
          <Empty description={`"${query}" adında plan bulunamadı.`}>
            <Button type="text" onClick={() => setQuery('')}>
              Aramayı temizle
            </Button>
          </Empty>
        ) : bp.md ? (
          <Table<Row> rowKey={(r) => r.plan.id} size="middle" pagination={filtered.length > 10 ? { pageSize: 10 } : false} dataSource={filtered} columns={columns} scroll={{ x: 'max-content' }} showSorterTooltip={false} />
        ) : (
          <List<Row>
            className="plan-cards"
            dataSource={filtered}
            renderItem={(r) => (
              <List.Item key={r.plan.id}>
                <div className="plan-card">
                  <div className="plan-card-head">
                    <Button type="link" className="plan-name" onClick={() => openPlan(r.plan.id, r.plan.lastLocation ?? '/ozet')}>
                      {r.plan.name}
                    </Button>
                    {actions(r.plan)}
                  </div>
                  <Progress percent={Math.round((r.passed / GATES) * 100)} format={() => `${r.passed} / ${GATES}`} aria-label={`${r.passed} / ${GATES} kapı geçildi`} />
                  <StatusTags row={r} />
                  <span className="helper tabular">
                    Son değişiklik {formatDate(r.plan.updatedAt, false)}. Sürüm {r.plan.revision}.
                  </span>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Callout tone="ipucu" title="Veri nerede durur?">
        Plan yalnız bu tarayıcıda durur. Tarayıcı verisi silinirse plan kaybolur. Her hafta "Çıktılar" ekranından JSON dışa aktarın.
      </Callout>

      <Modal open={open} title="Yeni plan" onCancel={() => setOpen(false)} onOk={create} okText="Oluştur" cancelText="Vazgeç" okButtonProps={{ disabled: !name.trim() }}>
        <label style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
          <span>Planın adı</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örneğin Mahalle kafesi" onPressEnter={create} autoFocus />
        </label>
      </Modal>
    </div>
  )
}

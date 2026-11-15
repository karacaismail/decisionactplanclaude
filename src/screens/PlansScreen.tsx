import { BACKUP_DAYS } from '@/engine/backup'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { App as AntApp, Button, Card, Dropdown, Empty, Grid, Input, List, Modal, Popconfirm, Progress, Statistic, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Plus, DotsThree, CaretDown, DownloadSimple, UploadSimple, Sparkle, Trash, ArrowSquareOut } from '@phosphor-icons/react'
import { useNavigate } from 'react-router'
import { usePlanStore } from '@/store/planStore'
import { formatDate } from '@/engine/format'
import { downloadJson, safeFileName } from '@/engine/sync'
import { buildDemoPlan } from '@/data/demo'
import type { PlanDoc } from '@/data/types'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import { planPosition, type PlanPosition } from '@/engine/position'
import '@/styles/screens-pano.css'

/** Doğrulama seviyesinin en üst basamağı. Beş temel kapı geçilince 5 olur. */
const MAX_LEVEL = 5

interface Row {
  plan: PlanDoc
  position: PlanPosition
}

function toRow(plan: PlanDoc): Row {
  return { plan, position: planPosition(plan) }
}

/** Planın yol üzerindeki yeri tek etikette. */
function stageTag(p: PlanPosition): { label: string; color: string } {
  if (p.stage === 'temel') return { label: `Strateji öncesi hazırlık, Karar ${p.decision} açık`, color: 'processing' }
  if (p.stage === 'gecis') return { label: 'Geçiş kapısı bekliyor', color: 'warning' }
  if (p.stage === 'strateji') return { label: 'Strateji oluşturma', color: 'processing' }
  if (p.stage === 'uygulama') return { label: `Strateji uygulama, Karar ${p.decision} açık`, color: 'processing' }
  return { label: 'Tamamlandı', color: 'success' }
}

function StatusTags({ row }: { row: Row }) {
  const tag = stageTag(row.position)
  return (
    <span className="tag-row">
      {row.plan.example ? <Tag>Örnek</Tag> : null}
      <Tag color={tag.color}>{tag.label}</Tag>
    </span>
  )
}

function LevelBar({ level }: { level: number }) {
  return <Progress percent={Math.round((level / MAX_LEVEL) * 100)} format={() => `${level} / ${MAX_LEVEL}`} aria-label={`Doğrulama seviyesi ${level} / ${MAX_LEVEL}`} />
}

export function PlansScreen() {
  const nav = useNavigate()
  const plans = usePlanStore((s) => s.plans)
  const createPlan = usePlanStore((s) => s.createPlan)
  const selectPlan = usePlanStore((s) => s.selectPlan)
  const deletePlan = usePlanStore((s) => s.deletePlan)
  const importPlan = usePlanStore((s) => s.importPlan)
  const markBackup = usePlanStore((s) => s.markBackup)
  const importPlanText = usePlanStore((s) => s.importPlanText)
  /* Kayıt okunamadıysa yeni plan açılmaz. Açılırsa depoya yazılmaz ve kaybolur. */
  const loadFailed = usePlanStore((s) => s.loadFailed)
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
  /* Beş temel kapıyı geçen plan geçiş kapısına ulaşmıştır. */
  const reachedCount = rows.filter((r) => r.position.stage !== 'temel').length
  const latest = rows[0]?.plan.updatedAt

  /* Yeni ekran en üstten açılır. Liste aşağı kaydırılmış olsa da kaydırma sıfırlanır. */
  const goTop = (to: string) => {
    window.scrollTo(0, 0)
    nav(to)
  }

  const create = () => {
    if (!name.trim()) return
    try {
      createPlan(name.trim())
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Plan açılamadı.')
      return
    }
    setOpen(false)
    setName('')
    goTop('/baslangic')
  }

  const openDemo = () => {
    try {
      importPlan(buildDemoPlan())
      goTop('/ozet')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Örnek plan açılamadı.')
    }
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
            if (key === 'json') {
              downloadJson(`${safeFileName(p.name)}.json`, p)
              markBackup(p.id)
            }
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
      title: 'Doğrulama seviyesi',
      key: 'progress',
      width: 190,
      sorter: (a, b) => a.position.level - b.position.level,
      render: (_, r) => <LevelBar level={r.position.level} />,
    },
    { title: 'Durum', key: 'status', width: 230, render: (_, r) => <StatusTags row={r} /> },
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
      <Button icon={<Sparkle size={16} />} onClick={openDemo} disabled={loadFailed}>
        Örnek planı aç
      </Button>
      <Button type="text" icon={<UploadSimple size={16} />} onClick={() => fileInput.current?.click()} disabled={loadFailed}>
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
            <Button type="primary" icon={<Plus size={16} />} onClick={() => setOpen(true)} disabled={loadFailed}>
              Yeni plan
            </Button>
            <Dropdown menu={moreMenu} trigger={['click']} disabled={loadFailed}>
              <Button icon={<CaretDown size={16} />} iconPlacement="end" disabled={loadFailed}>
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
          <Statistic title="Geçiş kapısına ulaşan plan" value={reachedCount} suffix="plan" />
          <p className="helper">{reachedCount === 0 ? 'Henüz hiçbir plan beş temel kapıyı geçmedi.' : `${reachedCount} plan beş temel kapıyı geçti.`}</p>
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
                  <span className="helper">Doğrulama seviyesi</span>
                  <LevelBar level={r.position.level} />
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
        Plan yalnız bu tarayıcıda durur. Tarayıcı verisi silinirse plan kaybolur. Her hafta yedek alın. Yedek almak için planın menüsünden "JSON indir" seçin. Yedek {BACKUP_DAYS} günden eskiyse pano sizi uyarır.
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

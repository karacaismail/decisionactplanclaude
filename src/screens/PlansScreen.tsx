import { useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react'
import { App as AntApp, Button, Dropdown, Input, Modal, Popconfirm } from 'antd'
import { Plus, DotsThree, CaretDown, UploadSimple, Sparkle, Trash } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router'
import { usePlanStore } from '@/store/planStore'
import { formatDate } from '@/engine/format'
import { buildDemoPlan } from '@/data/demo'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import '@/styles/screens-pano.css'

export function PlansScreen() {
  const nav = useNavigate()
  const plans = usePlanStore((s) => s.plans)
  const createPlan = usePlanStore((s) => s.createPlan)
  const selectPlan = usePlanStore((s) => s.selectPlan)
  const deletePlan = usePlanStore((s) => s.deletePlan)
  const importPlan = usePlanStore((s) => s.importPlan)
  const importPlanText = usePlanStore((s) => s.importPlanText)
  const { message } = AntApp.useApp()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const list = Object.values(plans).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const create = () => {
    if (!name.trim()) return
    createPlan(name.trim())
    setOpen(false)
    setName('')
    nav('/baslangic')
  }

  const openDemo = () => {
    importPlan(buildDemoPlan())
    nav('/ozet')
  }

  const openPlan = (id: string, to?: string) => {
    selectPlan(id)
    nav(to ?? '/ozet')
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

      {list.length === 0 ? (
        <EmptyState
          title="Henüz plan yok"
          text="Yeni bir plan açın. Ya da örnek planla ekranları tanıyın."
          actions={
            <>
              <Button icon={<Sparkle size={16} />} onClick={openDemo}>
                Örnek planı aç
              </Button>
              <Button type="text" icon={<UploadSimple size={16} />} onClick={() => fileInput.current?.click()}>
                JSON içe al
              </Button>
            </>
          }
        />
      ) : (
        <div className="card-grid">
          {list.map((p) => {
            const to = p.lastLocation ?? '/ozet'
            const onCardKey = (e: KeyboardEvent<HTMLElement>) => {
              if (e.target !== e.currentTarget) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openPlan(p.id, to)
              }
            }
            const stop = (e: MouseEvent) => e.stopPropagation()
            return (
              <article
                key={p.id}
                className="surface-card is-link"
                aria-label={p.name}
                tabIndex={0}
                onClick={() => openPlan(p.id, to)}
                onKeyDown={onCardKey}
              >
                <div className="surface-card-head">
                  <h3>{p.name}</h3>
                  <span onClick={stop} onKeyDown={(e) => e.stopPropagation()}>
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
                          items: [{ key: 'delete', label: 'Planı sil', icon: <Trash size={16} />, danger: true }],
                          onClick: ({ key }) => {
                            if (key === 'delete') setConfirmId(p.id)
                          },
                        }}
                      >
                        <Button type="text" aria-label={`${p.name} için daha fazla işlem`} icon={<DotsThree size={20} weight="bold" />} />
                      </Dropdown>
                    </Popconfirm>
                  </span>
                </div>
                {p.example ? <span className="tag is-hold">Örnek</span> : null}
                <div className="meta">
                  <span>Son değişiklik {formatDate(p.updatedAt)}</span>
                  <span className="tabular">
                    Sürüm {p.revision}. {p.decisions.length} karar kaydı.
                  </span>
                </div>
                <Link
                  className="card-link"
                  to={to}
                  onClick={(e) => {
                    e.stopPropagation()
                    selectPlan(p.id)
                  }}
                >
                  Aç
                </Link>
              </article>
            )
          })}
        </div>
      )}

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

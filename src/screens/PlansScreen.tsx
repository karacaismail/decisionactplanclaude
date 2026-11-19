import '@/styles/desen/pano.css'
import '@/styles/desen/pano-card.css'
import '@/styles/desen/pano-ortak.css'
import '@/styles/ekran/PlansScreen.css'
import { BACKUP_DAYS } from '@/engine/backup'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { App as AntApp, Button, Card, Dropdown, Empty, Input, Modal, Pagination, Popconfirm, Progress, Select, Statistic, Tag } from 'antd'
import { Plus, CaretDown, DownloadSimple, UploadSimple, Sparkle, Trash, ArrowSquareOut } from '@phosphor-icons/react'
import { useNavigate } from 'react-router'
import { usePlanStore } from '@/store/planStore'
import { exportPlanFile, importParsedFile, parseImportFile, replacesExistingExample } from '@/store/bundle'
import { lifecycleSettled } from '@/platform/lifecycle'
import { formatDate } from '@/engine/format'
import { downloadJson, safeFileName } from '@/engine/sync'
import { buildDemoPlan } from '@/data/demo'
import { buildShoeDemoPlan } from '@/data/demoAyakkabi'
import type { PlanDoc } from '@/data/types'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import { planPosition, type PlanPosition } from '@/engine/position'
/** Kanıt düzeyinin en üst basamağı. Beş temel kontrol geçilince 5 olur. */
const MAX_LEVEL = 5
const PAGE_SIZE = 10
/** İki örnek plan. İlki birincil örnektir ve önce gösterilir. */
const EXAMPLES = [
  { key: 'ornek-ayakkabi', label: 'Ayakkabı örneğini aç', build: buildShoeDemoPlan },
  { key: 'ornek-kafe', label: 'Kafe örneğini aç', build: buildDemoPlan },
] as const
const SORT_OPTIONS = [
  { value: 'updated-desc', label: 'Son değişiklik: yeniden eskiye' },
  { value: 'updated-asc', label: 'Son değişiklik: eskiden yeniye' },
  { value: 'name-asc', label: 'Plan adı: A harfinden Z harfine' },
  { value: 'name-desc', label: 'Plan adı: Z harfinden A harfine' },
  { value: 'level-asc', label: 'Kanıt düzeyi: düşükten yükseğe' },
  { value: 'level-desc', label: 'Kanıt düzeyi: yüksekten düşüğe' },
  { value: 'revision-asc', label: 'Sürüm: küçükten büyüğe' },
  { value: 'revision-desc', label: 'Sürüm: büyükten küçüğe' },
] as const
type PlanSort = typeof SORT_OPTIONS[number]['value']

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
  if (p.stage === 'gecis') return { label: 'Hazırlık kontrolü bekliyor', color: 'warning' }
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
  return <Progress percent={Math.round((level / MAX_LEVEL) * 100)} format={() => `${level} / ${MAX_LEVEL}`} aria-label={`Kanıt düzeyi ${level} / ${MAX_LEVEL}`} />
}

export function PlansScreen() {
  const nav = useNavigate()
  const plans = usePlanStore((s) => s.plans)
  const createPlan = usePlanStore((s) => s.createPlan)
  const selectPlan = usePlanStore((s) => s.selectPlan)
  const deletePlan = usePlanStore((s) => s.deletePlan)
  const importPlan = usePlanStore((s) => s.importPlan)
  const markBackup = usePlanStore((s) => s.markBackup)
  /* Kayıt okunamadıysa yeni plan açılmaz. Açılırsa depoya yazılmaz ve kaybolur. */
  const loadFailed = usePlanStore((s) => s.loadFailed)
  const { message, modal } = AntApp.useApp()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<PlanSort>('updated-desc')
  const [page, setPage] = useState(1)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const rows = useMemo(() => Object.values(plans).map(toRow).sort((a, b) => b.plan.updatedAt.localeCompare(a.plan.updatedAt)), [plans])
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR')
    return q ? rows.filter((r) => r.plan.name.toLocaleLowerCase('tr-TR').includes(q)) : rows
  }, [rows, query])
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const comparison = sort.startsWith('name') ? a.plan.name.localeCompare(b.plan.name, 'tr-TR')
      : sort.startsWith('level') ? a.position.level - b.position.level
        : sort.startsWith('revision') ? a.plan.revision - b.plan.revision
          : a.plan.updatedAt.localeCompare(b.plan.updatedAt)
    return sort.endsWith('asc') ? comparison : -comparison
  }), [filtered, sort])
  const currentPage = Math.min(page, Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)))
  // Kayıt azalınca saklanan sayfa da düzelir. Yeni kayıt eski sayfaya sıçratmaz.
  if (currentPage !== page) setPage(currentPage)
  const visibleRows = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  /* Beş temel kontrolü geçen plan hazırlık kontrolüne ulaşmıştır. */
  const reachedCount = rows.filter((r) => r.position.stage !== 'temel').length
  const latest = rows[0]?.plan.updatedAt
  const exampleCount = rows.filter((r) => r.plan.example).length

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

  /*
   * Örnek zaten varsa yeni örnek eskisinin yerine geçer. Bu yüzden önce kişiye sorulur.
   * Menüdeki örnek ve dosyadan gelen örnek aynı soruyu sorar. İkisi de modül verisini silmez.
   */
  const confirmExampleReplace = (name: string, fileHasModules = false) => new Promise<boolean>((resolve) => {
    modal.confirm({
      title: 'Örnek plan yeniden açılsın mı?',
      content: (
        <>
          <p>“{name}” planı zaten var. Yeni örnek eski örneğin yerine geçer.</p>
          <p>Örnek planda yaptığınız değişiklikler silinir.</p>
          <p>Bu örneğe bağlı projeler ve destek başvuruları silinmez.</p>
          {fileHasModules ? <p>Dosyadaki proje ve destek verisi alınmaz. Örneğin şimdiki verisi korunur. Dosyadaki veriyi almak için önce örnek planı silin.</p> : null}
        </>
      ),
      okText: 'Örneği yeniden aç',
      cancelText: 'Vazgeç',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    })
  })

  const openDemo = async (build: () => PlanDoc) => {
    try {
      const plan = build()
      if (replacesExistingExample(plan) && !(await confirmExampleReplace(plan.name))) return
      /* Silinen örneğin temizliği bitmeden yeni örnek yazılmaz. Yoksa temizlik yeni veriyi silebilir. */
      await lifecycleSettled()
      importPlan(plan)
      goTop('/ozet')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Örnek plan açılamadı.')
    }
  }

  const openPlan = (id: string, to?: string) => {
    selectPlan(id)
    goTop(to ?? '/ozet')
  }

  /* Modül verisi varsa dosya paket olur. Yoksa eski düz plan dosyası yazılır. */
  const downloadPlan = (plan: PlanDoc) => {
    exportPlanFile(plan).then((data) => {
      downloadJson(`${safeFileName(plan.name)}.json`, data)
      markBackup(plan.id)
    }, (err: unknown) => message.error(err instanceof Error ? err.message : 'Plan dışa aktarılamadı.'))
  }

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    /* Eski düz plan dosyası ve paket dosyası aynı yoldan alınır. */
    file.text()
      .then(async (t) => {
        const parsed = parseImportFile(t, file.size)
        if (replacesExistingExample(parsed.plan) && !(await confirmExampleReplace(parsed.plan.name, Object.keys(parsed.modules).length > 0))) return
        const { warnings } = await importParsedFile(parsed)
        message.success('Plan içe alındı.')
        for (const w of warnings) message.warning(w)
      })
      .catch((err: unknown) => message.error(err instanceof Error ? err.message : 'Dosya okunamadı.'))
  }

  const moreMenu = {
    items: [
      { key: 'import', label: 'JSON içe al', icon: <UploadSimple size={16} /> },
      ...EXAMPLES.map((e) => ({ key: e.key, label: e.label, icon: <Sparkle size={16} /> })),
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'import') fileInput.current?.click()
      const example = EXAMPLES.find((e) => e.key === key)
      if (example) void openDemo(example.build)
    },
  }

  const emptyActions = (
    <span className="empty-actions">
      {EXAMPLES.map((e) => (
        <Button key={e.key} icon={<Sparkle size={16} />} onClick={() => void openDemo(e.build)} disabled={loadFailed}>
          {e.label}
        </Button>
      ))}
      <Button type="text" icon={<UploadSimple size={16} />} onClick={() => fileInput.current?.click()} disabled={loadFailed}>
        JSON içe al
      </Button>
    </span>
  )

  return (
    <div className="page mobil-plans">
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
          <p className="helper">{rows.length === 0 ? 'Henüz plan yok.' : exampleCount === 0 ? 'Hepsi sizin planınız.' : exampleCount === 1 ? 'Biri örnek plan.' : `${exampleCount} tanesi örnek plan.`}</p>
        </Card>
        <Card className="pano-card">
          <Statistic title="Hazırlık kontrolüne ulaşan plan" value={reachedCount} suffix="plan" />
          <p className="helper">{reachedCount === 0 ? 'Henüz hiçbir plan beş temel kontrolü geçmedi.' : `${reachedCount} plan beş temel kontrolü geçti.`}</p>
        </Card>
        <Card className="pano-card">
          <Statistic title="Son değişiklik" value={latest ? formatDate(latest) : 'Henüz yok'} />
          <p className="helper">{latest ? 'En son kaydedilen plan bu tarihte değişti.' : 'İlk planı açınca tarih görünür.'}</p>
        </Card>
      </div>

      <Card
        className="pano-card"
        title={<h2 className="mobil-plans-list-heading" id="plan-list-heading">Plan listesi</h2>}
        extra={rows.length > 0 ? <Input.Search allowClear placeholder="Plan adı ara" aria-label="Plan adı ara" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} className="plan-search" /> : null}
      >
        <div className="mobil-plans-toolbar">
          <label htmlFor="plan-list-sort">Sıralama</label>
          <Select<PlanSort>
            id="plan-list-sort"
            className="mobil-plans-sort"
            classNames={{ popup: { root: 'mobil-plans-select-popup' } }}
            aria-label="Planları sırala"
            value={sort}
            options={[...SORT_OPTIONS]}
            onChange={(value) => { setSort(value); setPage(1) }}
          />
        </div>
        {rows.length === 0 ? (
          <Empty description="Henüz plan yok. Yeni bir plan açın. Ya da bir örnek planla ekranları tanıyın. Ayakkabı örneği gerçek bir şirkete dayanır. Kafe örneği yeni bir fikirdir.">{emptyActions}</Empty>
        ) : filtered.length === 0 ? (
          <Empty description={`"${query}" adında plan bulunamadı.`}>
            <Button type="text" onClick={() => { setQuery(''); setPage(1) }}>
              Aramayı temizle
            </Button>
          </Empty>
        ) : (
          <ul className="mobil-plans-list" aria-labelledby="plan-list-heading">
            {visibleRows.map((r) => (
              <li key={r.plan.id}>
                <article className="mobil-plan-card" aria-labelledby={`plan-title-${encodeURIComponent(r.plan.id)}`}>
                  <h3 className="mobil-plan-card-title" id={`plan-title-${encodeURIComponent(r.plan.id)}`}>{r.plan.name}</h3>
                  <dl className="mobil-plan-metadata">
                    <div>
                      <dt>Kanıt düzeyi</dt>
                      <dd><LevelBar level={r.position.level} /></dd>
                    </div>
                    <div>
                      <dt>Durum</dt>
                      <dd><StatusTags row={r} /></dd>
                    </div>
                    <div>
                      <dt>Son değişiklik</dt>
                      <dd><time dateTime={r.plan.updatedAt}>{formatDate(r.plan.updatedAt)}</time></dd>
                    </div>
                    <div>
                      <dt>Sürüm</dt>
                      <dd className="tabular">{r.plan.revision}</dd>
                    </div>
                  </dl>
                  <div className="mobil-plan-actions" role="group" aria-label={`${r.plan.name} için işlemler`}>
                    <Button icon={<ArrowSquareOut size={16} />} aria-label={`Aç: ${r.plan.name}`} onClick={() => openPlan(r.plan.id, r.plan.lastLocation ?? '/ozet')}>
                      Aç
                    </Button>
                    <Button icon={<DownloadSimple size={16} />} aria-label={`JSON indir: ${r.plan.name}`} onClick={() => downloadPlan(r.plan)}>
                      JSON indir
                    </Button>
                    <Popconfirm
                      title="Plan silinsin mi?"
                      description="Planın projeleri ve destek başvuruları da silinir. Bu işlem geri alınamaz."
                      okText="Sil"
                      cancelText="Vazgeç"
                      open={confirmId === r.plan.id}
                      onOpenChange={(value) => setConfirmId(value ? r.plan.id : null)}
                      onConfirm={() => {
                        setConfirmId(null)
                        deletePlan(r.plan.id)
                      }}
                    >
                      <Button danger icon={<Trash size={16} />} aria-label={`Sil: ${r.plan.name}`}>Sil</Button>
                    </Popconfirm>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
        <nav className="mobil-plans-pagination" aria-label="Plan sayfaları">
          <Pagination
            current={currentPage}
            pageSize={PAGE_SIZE}
            total={sorted.length}
            onChange={setPage}
            hideOnSinglePage
            showSizeChanger={false}
            simple={{ readOnly: true }}
          />
        </nav>
      </Card>

      <Callout tone="ipucu" title="Veri nerede durur?">
        Plan yalnız bu tarayıcıda durur. Tarayıcı verisi silinirse plan kaybolur. Her hafta yedek alın. Yedek almak için plan kartından "JSON indir" seçin. Yedek {BACKUP_DAYS} günden eskiyse pano sizi uyarır.
      </Callout>

      <Modal open={open} title="Yeni plan" onCancel={() => setOpen(false)} onOk={create} okText="Oluştur" cancelText="Vazgeç" okButtonProps={{ disabled: !name.trim() }}>
        <label className="mobil-plans-name-field">
          <span>Planın adı</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örneğin Mahalle kafesi" onPressEnter={create} autoFocus />
        </label>
      </Modal>
    </div>
  )
}

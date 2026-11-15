import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Empty, Input, List, Modal } from 'antd'
import { useNavigate } from 'react-router'
import { ArrowElbowDownLeft, BookOpen, Compass, Flag, ListChecks, MagnifyingGlass, SquaresFour } from '@phosphor-icons/react'
import { create } from 'zustand'
import { DECISIONS, STRATEGY, STRATEGY_N } from '@/data/decisions'
import { STEPS, stepPath, stepHeading } from '@/data/registry'
import models from '@/data/models.json'
import '@/styles/screens-karar.css'

/** Açık/kapalı durumu. Düğme ile palet aynı mağazayı okur. */
interface PaletteState {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}
export const useCommandPalette = create<PaletteState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}))

type Group = 'Kararlar' | 'Adımlar' | 'Yöntemler' | 'Ekranlar'
interface Item {
  id: string
  group: Group
  title: string
  subtitle?: string
  to: string
}

const GROUP_ORDER: Group[] = ['Kararlar', 'Adımlar', 'Yöntemler', 'Ekranlar']
const GROUP_ICON: Record<Group, typeof Flag> = { Kararlar: Flag, Adımlar: ListChecks, Yöntemler: BookOpen, Ekranlar: SquaresFour }
const MAX_RESULTS = 12

const SCREENS: { title: string; to: string; subtitle: string }[] = [
  { title: 'Planlar', to: '/', subtitle: 'Bütün planlar' },
  { title: 'Plan özeti', to: '/ozet', subtitle: 'Sıradaki iş, yol ve kapılar' },
  { title: 'Strateje devir raporu', to: '/devir', subtitle: 'Stratej bu raporla başlar' },
  { title: 'Geçiş kapısı', to: '/gecis', subtitle: 'Dayanak yeterli mi? Geçiş kararı' },
  { title: 'Strateji oluşturma', to: '/strateji', subtitle: 'Beş alt aşama ve strateji belgesi' },
    { title: 'Strateji uygulama', to: '/uygulama', subtitle: 'Beş alt aşama ve gözden geçirme kaydı' },
  { title: 'Temel taşları', to: '/temel', subtitle: 'Yirmi temel taşı ve kanıt gücü' },
  { title: 'Varsayımlar', to: '/varsayimlar', subtitle: 'Denenmedi, doğrulandı, çürüdü' },
  { title: 'Devralma', to: '/devralma', subtitle: 'Çalışan işi devralma girişi' },
  { title: 'Kanıtlar', to: '/kanitlar', subtitle: 'Gözlem, tahmin ve varsayımlar' },
  { title: 'İşler', to: '/isler', subtitle: 'Açık işler ve sorumlular' },
  { title: 'Göstergeler', to: '/gostergeler', subtitle: 'Grafikler ve ölçüler' },
  { title: 'Çıktılar', to: '/ciktilar', subtitle: 'Devir raporu özeti, yönetici raporu ve aksiyon planı' },
  { title: 'Geçmiş', to: '/gecmis', subtitle: 'Karar, geçiş ve değişiklik kaydı' },
  { title: 'Karar Kitabı', to: '/yontemler', subtitle: '128 yöntem' },
]

interface ModelRow {
  g: number
  title: string
  section: string
}

function buildItems(): Item[] {
  const out: Item[] = []
  for (const d of DECISIONS) out.push({ id: `karar-${d.n}`, group: 'Kararlar', title: `Karar ${d.n}. ${d.title}`, subtitle: d.question, to: `/karar/${d.n}` })
  /* Adım 19 ve 20 bir karara değil strateji oluşturmaya bağlıdır. Adres kayıt defterinden gelir. */
  for (const s of Object.values(STEPS)) out.push({ id: `adim-${s.id}`, group: 'Adımlar', title: stepHeading(s.id), subtitle: s.decision === STRATEGY_N ? STRATEGY.title : `Karar ${s.decision}`, to: stepPath(s.id) })
  for (const m of models as ModelRow[]) out.push({ id: `yontem-${m.g}`, group: 'Yöntemler', title: m.title, subtitle: m.section, to: '/yontemler' })
  for (const s of SCREENS) out.push({ id: `ekran-${s.to}`, group: 'Ekranlar', title: s.title, subtitle: s.subtitle, to: s.to })
  return out
}

const ITEMS = buildItems()

const fold = (s: string) => s.toLocaleLowerCase('tr-TR')

/** Sorguya uyan en çok 12 sonuç. Boş sorguda bütün ekranlar ve kararlar gelir. */
export function searchItems(query: string): Item[] {
  const q = fold(query.trim())
  /* Sıra ekrandaki grup sırasıyla aynıdır. Böylece ok tuşları görünen sırayla gezer. */
  if (!q) return [...ITEMS.filter((i) => i.group === 'Kararlar'), ...ITEMS.filter((i) => i.group === 'Ekranlar')]
  const words = q.split(/\s+/).filter(Boolean)
  const score = (i: Item): number => {
    const title = fold(i.title)
    const sub = fold(i.subtitle ?? '')
    if (!words.every((w) => title.includes(w) || sub.includes(w))) return 0
    if (title.startsWith(q)) return 3
    if (title.includes(q)) return 2
    return 1
  }
  return ITEMS.map((i) => ({ i, s: score(i) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || GROUP_ORDER.indexOf(a.i.group) - GROUP_ORDER.indexOf(b.i.group))
    .slice(0, MAX_RESULTS)
    .map((x) => x.i)
}

function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
}

/** Üst şeritteki "Ara" düğmesi. Kısayol ipucu yanında durur. */
export function CommandPaletteButton() {
  const setOpen = useCommandPalette((s) => s.setOpen)
  const mac = isMac()
  return (
    <Button className="cmdk-button" icon={<MagnifyingGlass size={16} aria-hidden />} onClick={() => setOpen(true)} aria-label={`Ara. Kısayol ${mac ? 'Komut K' : 'Kontrol K'}`} aria-haspopup="dialog">
      <span className="cmdk-label">Ara</span>
      <kbd className="cmdk-kbd" aria-hidden>
        {mac ? '⌘K' : 'Ctrl K'}
      </kbd>
    </Button>
  )
}

/** Komut paleti. Ctrl+K ya da Cmd+K açar. Ok tuşları gezer, Enter gider, Esc kapatır. */
export function CommandPalette() {
  const open = useCommandPalette((s) => s.open)
  const setOpen = useCommandPalette((s) => s.setOpen)
  const toggle = useCommandPalette((s) => s.toggle)
  const nav = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
    }
  }, [open])

  const results = useMemo(() => searchItems(query), [query])
  const groups = useMemo(() => GROUP_ORDER.map((g) => ({ g, items: results.filter((r) => r.group === g) })).filter((x) => x.items.length > 0), [results])
  const activeItem = results[Math.min(active, results.length - 1)]
  const activeId = activeItem ? `cmdk-opt-${activeItem.id}` : undefined

  useEffect(() => {
    if (!activeId || !listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(`#${CSS.escape(activeId)}`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeId])

  const go = (item: Item | undefined) => {
    if (!item) return
    setOpen(false)
    nav(item.to)
  }

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (results.length ? (a + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActive(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActive(Math.max(0, results.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(activeItem)
    }
  }

  return (
    <Modal
      className="cmdk-modal"
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      closable={false}
      title={null}
      destroyOnHidden
      width={600}
      style={{ top: 72 }}
      aria-label="Komut paleti"
    >
      <Input
        className="cmdk-input"
        autoFocus
        size="large"
        allowClear
        prefix={<MagnifyingGlass size={18} aria-hidden />}
        placeholder="Adım, karar ya da yöntem ara…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
        }}
        onKeyDown={onInputKey}
        role="combobox"
        aria-expanded={open}
        aria-controls="cmdk-list"
        aria-autocomplete="list"
        aria-activedescendant={activeId}
      />
      <div id="cmdk-list" ref={listRef} className="cmdk-list" role="listbox" aria-label="Sonuçlar">
        {results.length === 0 ? (
          <div className="cmdk-empty">
            <Empty description="Sonuç yok. Başka bir kelime deneyin." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : null}
        {groups.map(({ g, items }) => {
          const Icon = GROUP_ICON[g]
          const titleId = `cmdk-group-${g}`
          return (
            <div key={g} role="group" aria-labelledby={titleId}>
              <span id={titleId} className="cmdk-group-title">
                {g}
              </span>
              <List
                split={false}
                size="small"
                dataSource={items}
                rowKey="id"
                renderItem={(item) => {
                  const selected = activeItem?.id === item.id
                  return (
                    <List.Item>
                      <div
                        id={`cmdk-opt-${item.id}`}
                        role="option"
                        aria-selected={selected}
                        className="cmdk-option"
                        onMouseEnter={() => setActive(results.indexOf(item))}
                        onClick={() => go(item)}
                      >
                        <span className="cmdk-option-icon">
                          <Icon size={18} aria-hidden />
                        </span>
                        <span className="cmdk-option-text">
                          <span className="cmdk-option-title">{item.title}</span>
                          {item.subtitle ? <span className="cmdk-option-sub">{item.subtitle}</span> : null}
                        </span>
                        {selected ? (
                          <span className="cmdk-option-go">
                            <ArrowElbowDownLeft size={16} aria-hidden />
                          </span>
                        ) : null}
                      </div>
                    </List.Item>
                  )
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="cmdk-foot" aria-hidden>
        <span>
          <kbd>↑</kbd> <kbd>↓</kbd> gezin
        </span>
        <span>
          <kbd>Enter</kbd> git
        </span>
        <span>
          <kbd>Esc</kbd> kapat
        </span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Compass size={14} aria-hidden /> {results.length} sonuç
        </span>
      </div>
    </Modal>
  )
}

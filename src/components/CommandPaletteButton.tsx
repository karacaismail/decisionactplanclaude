import { lazy, Suspense, useEffect, useState } from 'react'
import { Button } from 'antd'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { create } from 'zustand'

/*
 * Komut paletinin hafif bölümü. Bu dosya ilk açılışta iner.
 * Düğme, kısayol tuşu ve açık/kapalı durumu buradadır.
 * Paletin penceresi, arama listesi ve stilleri ilk açılışta inmez. Palet ilk kez açılınca iner.
 */

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

const loadPalette = () => import('./CommandPalette')
const LazyPalette = lazy(loadPalette)

/** Fare üzerine gelince ya da odak gelince palet önceden iner. Açılış beklemesi kısalır. */
export function preloadCommandPalette() {
  void loadPalette().catch(() => undefined)
}

function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
}

/** Üst şeritteki "Ara" düğmesi. Kısayol ipucu yanında durur. */
export function CommandPaletteButton() {
  const setOpen = useCommandPalette((s) => s.setOpen)
  const mac = isMac()
  return (
    <Button
      className="cmdk-button"
      icon={<MagnifyingGlass size={16} aria-hidden />}
      onPointerEnter={preloadCommandPalette}
      onFocus={preloadCommandPalette}
      onClick={(event) => {
        event.currentTarget.focus()
        setOpen(true)
      }}
      aria-label={`Ara. Kısayol ${mac ? 'Komut K' : 'Kontrol K'}`}
      aria-haspopup="dialog"
    >
      <span className="cmdk-label">Ara</span>
      <kbd className="cmdk-kbd" aria-hidden>
        {mac ? '⌘K' : 'Ctrl K'}
      </kbd>
    </Button>
  )
}

/**
 * Ctrl+K ya da Cmd+K paleti açar ve kapatır. Dinleyici her zaman çalışır.
 * Palet ilk kez açılınca iner. Sonra kapanış hareketi için yerinde kalır.
 */
export function CommandPaletteHost() {
  const open = useCommandPalette((s) => s.open)
  const toggle = useCommandPalette((s) => s.toggle)
  const [needed, setNeeded] = useState(open)

  useEffect(() => {
    if (open) setNeeded(true)
  }, [open])

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

  if (!needed) return null
  return (
    <Suspense fallback={null}>
      <LazyPalette />
    </Suspense>
  )
}

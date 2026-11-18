import '@/styles/desen/note.css'
import '@/styles/bilesen/Callout.css'
import { Info, Lightbulb, Warning, ChatCircleText, FlagCheckered } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
export type CalloutTone = 'bilgi' | 'ipucu' | 'uyari' | 'ornek' | 'sonuc'

const META: Record<CalloutTone, { label: string; Icon: typeof Info; cls: string }> = {
  bilgi: { label: 'Bilgi', Icon: Info, cls: 'is-info' },
  ipucu: { label: 'İpucu', Icon: Lightbulb, cls: '' },
  uyari: { label: 'Dikkat', Icon: Warning, cls: 'is-warn' },
  ornek: { label: 'Günlük Hayattan', Icon: ChatCircleText, cls: '' },
  sonuc: { label: 'Sonuç', Icon: FlagCheckered, cls: '' },
}

/**
 * Tek not bloğu. Solda 3 px düz çizgi durur, çizginin değdiği köşeler düzdür.
 * Dolgu rengi yoktur. Çizgi rengi yalnız bilgi, uyarı ve tehlikede değişir.
 */
export function Callout({ tone = 'bilgi', title, danger, children }: { tone?: CalloutTone; title?: string; danger?: boolean; children: ReactNode }) {
  const { label, Icon, cls } = META[tone]
  return (
    <div role={tone === 'uyari' || danger ? 'alert' : 'note'} className={`note mt-callout ${danger ? 'is-danger' : cls}`.trim()}>
      <span className="note-title">
        <Icon className="mt-callout-icon mt-icon-inline" aria-hidden />
        {title ?? label}
      </span>
      <div className="note-body">{children}</div>
    </div>
  )
}

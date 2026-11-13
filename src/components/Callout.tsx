import { theme } from 'antd'
import { Info, Lightbulb, Warning, ChatCircleText, FlagCheckered } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

export type CalloutTone = 'bilgi' | 'ipucu' | 'uyari' | 'ornek' | 'sonuc'

const META: Record<CalloutTone, { label: string; Icon: typeof Info }> = {
  bilgi: { label: 'Bilgi', Icon: Info },
  ipucu: { label: 'İpucu', Icon: Lightbulb },
  uyari: { label: 'Dikkat', Icon: Warning },
  ornek: { label: 'Günlük Hayattan', Icon: ChatCircleText },
  sonuc: { label: 'Sonuç', Icon: FlagCheckered },
}

/** Kenarlıksız, yüzey tonlu bilgi kutusu. Kavisli vurgu kenarı kullanılmaz. */
export function Callout({ tone = 'bilgi', title, children }: { tone?: CalloutTone; title?: string; children: ReactNode }) {
  const { token } = theme.useToken()
  const { label, Icon } = META[tone]
  const bg: Record<CalloutTone, string> = {
    bilgi: token.colorInfoBg,
    ipucu: token.colorSuccessBg,
    uyari: token.colorWarningBg,
    ornek: token.colorFillAlter,
    sonuc: token.colorPrimaryBg,
  }
  const fg: Record<CalloutTone, string> = {
    bilgi: token.colorInfo,
    ipucu: token.colorSuccess,
    uyari: token.colorWarning,
    ornek: token.colorTextSecondary,
    sonuc: token.colorPrimary,
  }
  return (
    <div
      role={tone === 'uyari' ? 'alert' : 'note'}
      style={{ background: bg[tone], borderRadius: token.borderRadiusLG, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}
    >
      <Icon size={22} weight="regular" color={fg[tone]} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: fg[tone], marginBottom: 4 }}>{title ?? label}</div>
        <div style={{ fontSize: 16, lineHeight: 1.6, color: token.colorText }}>{children}</div>
      </div>
    </div>
  )
}

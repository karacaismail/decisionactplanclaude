import { useState, type KeyboardEvent } from 'react'
import { Button } from 'antd'
import { ArrowRight, CheckCircle, Circle } from '@phosphor-icons/react'
import { useNavigate } from 'react-router'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import type { Entry } from '@/data/types'
import '@/styles/screens-pano.css'

const OPTIONS: { value: Entry; title: string; text: string; to: string }[] = [
  { value: 'yeni', title: 'Yeni bir fikrim var', text: "Karar 1'den başlayın. Önce işinizi yedi soruyla anlatın.", to: '/karar/1/adim/00' },
  { value: 'devralma', title: 'Çalışan bir işi devralıyorum', text: 'Vaatleri sonuçlarla karşılaştırın. Kanıtı eksik olan ilk karara dönün.', to: '/devralma' },
  { value: 'acil', title: 'Acil zarar tehlikesi var', text: 'Etkilenen işi hemen durdurun. Sorumlu kişi güvenli koşulları doğrulayınca kararı yeniden açın.', to: '/karar/1/adim/02' },
]

export function StartScreen() {
  const nav = useNavigate()
  const plan = useCurrentPlan()
  const update = usePlanStore((s) => s.update)
  const setLocation = usePlanStore((s) => s.setLocation)
  const [picked, setPicked] = useState<Entry | undefined>(plan?.entry)
  if (!plan) return null
  const selected = OPTIONS.find((o) => o.value === picked)

  const go = () => {
    if (!selected) return
    update((p) => (p.entry = selected.value))
    setLocation(selected.to)
    nav(selected.to)
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    const next = e.key === 'ArrowDown' ? index + 1 : e.key === 'ArrowUp' ? index - 1 : null
    if (next !== null) {
      e.preventDefault()
      const target = OPTIONS[(next + OPTIONS.length) % OPTIONS.length]
      setPicked(target.value)
      const el = e.currentTarget.parentElement?.querySelector<HTMLElement>(`[data-value="${target.value}"]`)
      el?.focus()
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setPicked(OPTIONS[index].value)
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Bugün nereden başlayacaksınız?"
        documentTitle="Giriş"
        kicker="Giriş"
        description="Bir sonraki harcamaya hangi kanıtla karar vereceksiniz? Önce sıradaki işi yazın. Sonra kararı değiştirecek bulguyu seçin."
      />
      <div className="section">
        <div className="choice-list" role="radiogroup" aria-label="Başlangıç yolu">
          {OPTIONS.map((o, i) => {
            const isSelected = picked === o.value
            return (
              <div
                key={o.value}
                className={`choice${isSelected ? ' is-selected' : ''}`}
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected || (!picked && i === 0) ? 0 : -1}
                data-value={o.value}
                onClick={() => setPicked(o.value)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span className="choice-mark" aria-hidden>
                  {isSelected ? <CheckCircle size={16} weight="fill" /> : <Circle size={16} />}
                </span>
                <span className="choice-body">
                  <span className="choice-title">{o.title}</span>
                  <span className="choice-desc">{o.text}</span>
                </span>
              </div>
            )
          })}
        </div>
        <div className="action-row">
          <Button type="primary" icon={<ArrowRight size={16} />} iconPlacement="end" disabled={!selected} onClick={go}>
            Devam et
          </Button>
        </div>
      </div>
      <Callout tone="ipucu" title="Beş soruyu tek sayfada cevaplayın">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Vereceğiniz kararı tek cümleyle yazın.</li>
          <li>Yanlış kararın en ağır sonucunu yazın.</li>
          <li>Kararı değiştirecek bir gözlem seçin.</li>
          <li>Gözlemi kimin, ne zaman kaydedeceğini belirleyin.</li>
          <li>Harcama sınırını ve durma koşulunu önceden yazın.</li>
        </ol>
      </Callout>
    </div>
  )
}

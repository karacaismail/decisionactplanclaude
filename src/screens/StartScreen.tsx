import { Button } from 'antd'
import { Sparkle, ArrowsLeftRight, Warning, Compass, ArrowRight } from '@phosphor-icons/react'
import { useNavigate } from 'react-router'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import type { Entry } from '@/data/types'

const OPTIONS: { value: Entry; title: string; text: string; Icon: typeof Sparkle; to: string; tone: 'teal' | 'navy' | 'orange' }[] = [
  { value: 'yeni', title: 'Yeni bir fikrim var', text: 'Karar 1\'den başlayın. Önce işinizi yedi soruyla anlatın.', Icon: Sparkle, to: '/karar/1/adim/00', tone: 'teal' },
  { value: 'devralma', title: 'Çalışan bir işi devralıyorum', text: 'Vaatleri sonuçlarla karşılaştırın. Kanıtı eksik olan ilk karara dönün.', Icon: ArrowsLeftRight, to: '/devralma', tone: 'navy' },
  { value: 'acil', title: 'Acil zarar tehlikesi var', text: 'Etkilenen işi hemen durdurun. Sorumlu kişi güvenli koşulları doğrulayınca kararı yeniden açın.', Icon: Warning, to: '/karar/1/adim/02', tone: 'orange' },
]

export function StartScreen() {
  const nav = useNavigate()
  const plan = useCurrentPlan()
  const update = usePlanStore((s) => s.update)
  const setLocation = usePlanStore((s) => s.setLocation)
  if (!plan) return null
  return (
    <div className="page">
      <PageHeader
        title="Bugün nereden başlayacaksınız?"
        documentTitle="Giriş"
        kicker="Giriş"
        icon={<span className="icon-tile deep" aria-hidden><Compass size={20} weight="fill" /></span>}
        description="Bir sonraki harcamaya hangi kanıtla karar vereceksiniz? Önce sıradaki işi yazın. Sonra kararı değiştirecek bulguyu seçin."
      />
      <div className="card-grid">
        {OPTIONS.map((o) => {
          const selected = plan.entry === o.value
          return (
            <article key={o.value} className={`surface-card${selected ? ' is-selected' : ''}`} aria-label={o.title}>
              <span className={`icon-tile ${o.tone}`} aria-hidden>
                <o.Icon size={24} weight={o.value === 'acil' ? 'fill' : 'regular'} />
              </span>
              <h3>{o.title}</h3>
              <p>{o.text}</p>
              <div className="card-actions">
                <Button
                  type={o.value === 'acil' ? 'default' : 'primary'}
                  danger={o.value === 'acil'}
                  icon={<ArrowRight size={18} />}
                  iconPlacement="end"
                  onClick={() => { update((p) => (p.entry = o.value)); setLocation(o.to); nav(o.to) }}
                >
                  {selected ? 'Devam et' : 'Başla'}
                </Button>
              </div>
            </article>
          )
        })}
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

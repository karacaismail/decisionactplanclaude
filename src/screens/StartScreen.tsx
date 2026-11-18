import '@/styles/desen/section-head.css'
import '@/styles/desen/pano.css'
import '@/styles/desen/pano-card.css'
import '@/styles/desen/pano-ortak.css'
import '@/styles/ekran/StartScreen.css'
import { useId, useState, type KeyboardEvent } from 'react'
import { Button, Card, Grid, Steps } from 'antd'
import { ArrowRight, CheckCircle, Handshake, Lightbulb, Warning } from '@phosphor-icons/react'
import { useNavigate } from 'react-router'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import { STAGES } from '@/data/stages'
import type { Entry } from '@/data/types'
const OPTIONS: { value: Entry; title: string; text: string; to: string; Icon: typeof Lightbulb }[] = [
  { value: 'yeni', title: 'Yeni bir fikrim var', text: "Karar 1'den başlayın. Önce işinizi yedi soruyla anlatın.", to: '/karar/1/adim/00', Icon: Lightbulb },
  { value: 'devralma', title: 'Çalışan bir işi devralıyorum', text: 'Vaatleri sonuçlarla karşılaştırın. Kanıtı eksik olan ilk karara dönün.', to: '/devralma', Icon: Handshake },
  { value: 'acil', title: 'Acil zarar tehlikesi var', text: 'Etkilenen işi hemen durdurun. Sorumlu kişi güvenli koşulları doğrulayınca kararı yeniden açın.', to: '/karar/1/adim/02', Icon: Warning },
]

/** Aracın amacı üç kısa cümlede. İlk ekranda okunur. */
const PURPOSE = ['Stratejik planlamadan önce yapılacak işleri yaptırır.', 'Her iddia için kanıt ister.', 'Sonunda dayanak yeterliyse strateji oluşturmayı açar.']

export function StartScreen() {
  const nav = useNavigate()
  const plan = useCurrentPlan()
  const update = usePlanStore((s) => s.update)
  const setLocation = usePlanStore((s) => s.setLocation)
  const [picked, setPicked] = useState<Entry | undefined>(plan?.entry)
  const choiceId = useId()
  const bp = Grid.useBreakpoint()
  if (!plan) return null
  const selected = OPTIONS.find((o) => o.value === picked)

  const go = () => {
    if (!selected) return
    update((p) => (p.entry = selected.value))
    setLocation(selected.to)
    nav(selected.to)
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight'
    const back = e.key === 'ArrowUp' || e.key === 'ArrowLeft'
    const next = forward ? index + 1 : back ? index - 1 : null
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
    <div className="page mobil-start">
      <PageHeader
        title="Bugün nereden başlayacaksınız?"
        documentTitle="Giriş"
        kicker="Giriş"
        description="Bir sonraki harcamaya hangi kanıtla karar vereceksiniz? Önce sıradaki işi yazın. Sonra kararı değiştirecek bulguyu seçin."
      />

      <Card className="pano-card purpose-card" title="Bu araç ne işe yarar?">
        <ul className="purpose-list">
          {PURPOSE.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <Steps
          className="pano-steps purpose-steps"
          size="small"
          orientation={bp.md ? 'horizontal' : 'vertical'}
          titlePlacement={bp.md ? 'vertical' : 'horizontal'}
          current={0}
          items={STAGES.map((st) => ({ key: st.key, title: st.title, content: st.description }))}
          aria-label="Yolun dört bölümü"
        />
      </Card>

      <section className="section mobil-start-options" aria-labelledby={`${choiceId}-title`}>
        <div className="section-head">
          <h2 id={`${choiceId}-title`}>Başlangıç yolunu seçin</h2>
          <p id={`${choiceId}-help`}>Bir yol seçin. Ardından “Devam et” düğmesine basın.</p>
        </div>
        <div className="entry-grid" role="radiogroup" aria-label="Başlangıç yolu" aria-describedby={`${choiceId}-help`}>
          {OPTIONS.map((o, i) => {
            const isSelected = picked === o.value
            const optionId = `${choiceId}-${o.value}`
            return (
              <Card
                key={o.value}
                hoverable
                className={`pano-card entry-card${isSelected ? ' is-selected' : ''}`}
                role="radio"
                aria-checked={isSelected}
                aria-labelledby={`${optionId}-title`}
                aria-describedby={`${optionId}-description`}
                tabIndex={isSelected || (!picked && i === 0) ? 0 : -1}
                data-value={o.value}
                onClick={() => setPicked(o.value)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <div className="entry-head">
                  <span className="entry-icon" aria-hidden>
                    <o.Icon size={24} />
                  </span>
                  <span className="entry-check" aria-hidden>
                    {isSelected ? <CheckCircle size={20} weight="fill" /> : null}
                  </span>
                </div>
                <h3 id={`${optionId}-title`}>{o.title}</h3>
                <p id={`${optionId}-description`}>{o.text}</p>
              </Card>
            )
          })}
        </div>

        <div className="action-row mobil-start-actions">
          <Button className="mobil-start-continue" type="primary" icon={<ArrowRight size={16} />} iconPlacement="end" disabled={!selected} onClick={go}>
            Devam et
          </Button>
        </div>
      </section>

      <Callout tone="ipucu" title="Beş soruyu tek sayfada cevaplayın">
        <ol className="mobil-start-questions">
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

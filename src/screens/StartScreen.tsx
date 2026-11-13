import { Button, Card, Typography, theme } from 'antd'
import { Sparkle, ArrowsLeftRight, Warning } from '@phosphor-icons/react'
import { useNavigate } from 'react-router'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { Callout } from '@/components/Callout'
import type { Entry } from '@/data/types'

const OPTIONS: { value: Entry; title: string; text: string; Icon: typeof Sparkle; to: string }[] = [
  { value: 'yeni', title: 'Yeni bir fikrim var', text: 'Karar 1\'den başlayın. Önce işinizi yedi soruyla anlatın.', Icon: Sparkle, to: '/karar/1/adim/00' },
  { value: 'devralma', title: 'Çalışan bir işi devralıyorum', text: 'Vaatleri sonuçlarla karşılaştırın. Kanıtı eksik olan ilk karara dönün.', Icon: ArrowsLeftRight, to: '/devralma' },
  { value: 'acil', title: 'Acil zarar tehlikesi var', text: 'Etkilenen işi hemen durdurun. Sorumlu kişi güvenli koşulları doğrulayınca kararı yeniden açın.', Icon: Warning, to: '/karar/1/adim/02' },
]

export function StartScreen() {
  const { token } = theme.useToken()
  const nav = useNavigate()
  const plan = useCurrentPlan()
  const update = usePlanStore((s) => s.update)
  const setLocation = usePlanStore((s) => s.setLocation)
  if (!plan) return null
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <Typography.Title level={1} style={{ fontSize: 32, marginBottom: 8 }}>Bugün nereden başlayacaksınız?</Typography.Title>
        <Typography.Paragraph style={{ fontSize: 16, color: token.colorTextSecondary }}>Bir sonraki harcamaya hangi kanıtla karar vereceksiniz? Önce sıradaki işi yazın. Sonra kararı değiştirecek bulguyu seçin.</Typography.Paragraph>
      </div>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {OPTIONS.map((o) => (
          <Card key={o.value} hoverable style={{ background: plan.entry === o.value ? token.colorPrimaryBg : token.colorBgContainer }} styles={{ body: { display: 'grid', gap: 12 } }}>
            <o.Icon size={32} color={o.value === 'acil' ? token.colorError : token.colorPrimary} aria-hidden />
            <Typography.Text strong style={{ fontSize: 18 }}>{o.title}</Typography.Text>
            <Typography.Text style={{ color: token.colorTextSecondary }}>{o.text}</Typography.Text>
            <Button type={o.value === 'acil' ? 'default' : 'primary'} danger={o.value === 'acil'} onClick={() => { update((p) => (p.entry = o.value)); setLocation(o.to); nav(o.to) }}>
              Başla
            </Button>
          </Card>
        ))}
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

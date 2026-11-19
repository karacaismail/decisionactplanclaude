import { Button } from 'antd'
import { useNavigate } from 'react-router'
import { isStrategyApproved, selectStrategyMoves } from '@/contracts'
import { useCurrentPlanView } from '@/platform/planSource'
import { PjBosEkran } from '../components/PjBosEkran'

const KICKER = 'Proje yönetimi'
const DESCRIPTION = 'Projeler stratejideki ana hamleleri işe çevirir. Bu bölüm numaralı aşamaların dışındadır.'

/** Proje listesi. Strateji onaylanmadan proje açılmaz. Ekran bunun nedenini söyler. */
export default function PjProjelerScreen() {
  const plan = useCurrentPlanView()
  const nav = useNavigate()
  if (!plan) return null
  if (!isStrategyApproved(plan)) {
    return (
      <PjBosEkran
        title="Projeler"
        kicker={KICKER}
        description={DESCRIPTION}
        emptyTitle="Projeler burada görünecek."
        text="Strateji onaylanınca ana hamlelerden proje açabilirsiniz."
        actions={<Button onClick={() => nav('/strateji')}>Strateji oluşturmaya git</Button>}
      />
    )
  }
  const moves = selectStrategyMoves(plan).length
  return (
    <PjBosEkran
      title="Projeler"
      kicker={KICKER}
      description={DESCRIPTION}
      emptyTitle="Henüz proje yok."
      text={`Stratejinizde ${moves} ana hamle var. Proje açma bir sonraki sürümde gelecek.`}
    />
  )
}

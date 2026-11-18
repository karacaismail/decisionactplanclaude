import { Button } from 'antd'
import { useNavigate } from 'react-router'
import { DtBosEkran } from '../components/DtBosEkran'

/** Tek programın ekranı. Bu ekran plan istemez. */
export default function DtProgramScreen() {
  const nav = useNavigate()
  return (
    <DtBosEkran
      title="Destek programı"
      kicker="Destek ve teşvik"
      description="Bu ekran tek bir programın koşullarını gösterecek."
      emptyTitle="Programın ayrıntısı burada görünecek."
      text="Program bilgileri bir sonraki sürümde eklenecek."
      actions={<Button onClick={() => nav('/destek')}>Programlara dön</Button>}
    />
  )
}

import { Button } from 'antd'
import { useNavigate } from 'react-router'
import { PjBosEkran } from '../components/PjBosEkran'

/** Tek projenin ekranı. İlk sürümde yalnız açıklama gösterir. */
export default function PjProjeScreen() {
  const nav = useNavigate()
  return (
    <PjBosEkran
      title="Proje"
      kicker="Proje yönetimi"
      description="Bu ekran tek bir projenin işlerini gösterecek."
      emptyTitle="Proje bilgisi burada görünecek."
      text="Bu sürümde proje açılamıyor. Proje açma bir sonraki sürümde gelecek."
      actions={<Button onClick={() => nav('/projeler')}>Projelere dön</Button>}
    />
  )
}

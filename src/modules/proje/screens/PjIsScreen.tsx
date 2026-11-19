import { Button } from 'antd'
import { useNavigate, useParams } from 'react-router'
import { PjBosEkran } from '../components/PjBosEkran'

/** Projedeki tek işin ekranı. İlk sürümde yalnız açıklama gösterir. */
export default function PjIsScreen() {
  const nav = useNavigate()
  const { pid } = useParams()
  return (
    <PjBosEkran
      title="Proje işi"
      kicker="Proje yönetimi"
      description="Bu ekran projedeki tek bir işi gösterecek."
      emptyTitle="İşin ayrıntısı burada görünecek."
      text="Bu sürümde iş eklenemiyor. İş ekleme bir sonraki sürümde gelecek."
      actions={<Button onClick={() => nav(pid ? `/projeler/${encodeURIComponent(pid)}` : '/projeler')}>Projeye dön</Button>}
    />
  )
}

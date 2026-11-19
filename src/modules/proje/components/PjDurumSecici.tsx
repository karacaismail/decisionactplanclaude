import '@/styles/bilesen/PjDurumSecici.css'
import { Select } from 'antd'
import { DURUM_ADI, IS_DURUMLARI, type IsDurumu } from '../domain/model'

const SECENEKLER = IS_DURUMLARI.map((d) => ({ value: d, label: DURUM_ADI[d] }))
const SINIFLAR = { popup: { root: 'pj-durum-popup' } }

/**
 * İşin durum düğmesi. Basınca beş durumun listesi açılır.
 * Klavyede Enter ya da aşağı ok listeyi açar. Oklar durumu seçer. Enter kaydeder.
 * Durum metinle yazılır. Renk tek başına anlam taşımaz.
 */
export function PjDurumSecici({ value, onChange, baslik, id, disabled }: {
  value: IsDurumu
  onChange: (durum: IsDurumu) => void
  /** İşin başlığı. Ekran okuyucu "Durum: <başlık>" duyar. */
  baslik: string
  id?: string
  disabled?: boolean
}) {
  return (
    <Select<IsDurumu>
      id={id}
      className="pj-durum-secici"
      classNames={SINIFLAR}
      value={value}
      options={SECENEKLER}
      onChange={onChange}
      disabled={disabled}
      popupMatchSelectWidth={false}
      labelRender={(o) => `Durum: ${o.label as string}`}
      aria-label={`Durum: ${baslik}`}
    />
  )
}

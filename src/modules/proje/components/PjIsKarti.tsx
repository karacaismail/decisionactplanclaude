import '@/styles/bilesen/PjIsKarti.css'
import { WarningCircle } from '@phosphor-icons/react'
import { Link } from 'react-router'
import type { Is, IsDurumu } from '../domain/model'
import { gecikmisMi } from '../domain/islemler'
import { tarihYaz } from '../domain/tarih'
import { PjDurumSecici } from './PjDurumSecici'

/** Geciken işin işareti. İkon ve metin birlikte görünür. Renk tek başına anlam taşımaz. */
export function PjGecikti() {
  return (
    <span className="pj-gecikti">
      <WarningCircle size={18} weight="bold" aria-hidden />
      Gecikti
    </span>
  )
}

/**
 * Tek işin kartı. Liste ve pano aynı kartı kullanır.
 * Başlık işin ekranına götürür. Durum düğmesi durumu hemen değiştirir.
 */
export function PjIsKarti({ is, adres, bugun, onDurum, mesgul }: {
  is: Is
  adres: string
  bugun: string
  onDurum: (durum: IsDurumu) => void
  mesgul?: boolean
}) {
  const gec = gecikmisMi(is, bugun)
  return (
    <article className="pj-is-karti">
      <Link className="pj-is-karti-baslik" to={adres}>{is.baslik}</Link>
      <p className="pj-is-karti-bilgi">
        <span>{is.sorumlu ? `Sorumlu: ${is.sorumlu}` : 'Sorumlu yazılmadı.'}</span>
        {is.sonTarih ? (
          <span>
            Son tarih: <time dateTime={is.sonTarih}>{tarihYaz(is.sonTarih)}</time>
          </span>
        ) : null}
        {gec ? <PjGecikti /> : null}
      </p>
      <PjDurumSecici value={is.durum} onChange={onDurum} baslik={is.baslik} disabled={mesgul} />
    </article>
  )
}

import '@/styles/bilesen/DtUyari.css'
import { Info } from '@phosphor-icons/react'
import { UYARI_METNI } from '../metinler'

/** Her destek ekranındaki yasal uyarı. Uygulama destek vermez ve söz vermez. */
export function DtUyari() {
  return (
    <aside className="dt-uyari" aria-label="Önemli not">
      <Info className="dt-uyari-ikon" aria-hidden />
      <p>{UYARI_METNI}</p>
    </aside>
  )
}

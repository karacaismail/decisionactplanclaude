import '@/styles/bilesen/DtProgramKarti.css'
import { Link } from 'react-router'
import type { Program } from '../data/tipler'
import { DURUM_ADI, KATEGORI_ADI } from '../metinler'
import { gecerliDurum, tarihYaz, tazelik } from '../motor/tazelik'
import { DtEtiket } from './DtEtiket'

/** Program listesindeki tek kart. Kartın tamamı programın sayfasını açar. */
export function DtProgramKarti({ program, bugun }: { program: Program; bugun: string }) {
  const durum = gecerliDurum(program, bugun)
  const eski = tazelik(program.kaynak.asOf, bugun).eski
  return (
    <Link className="dt-program-karti" to={`/destek/${program.id}`}>
      <span className="dt-program-karti-kurum">{program.kurum}</span>
      <h3 className="dt-program-karti-ad">{program.ad}</h3>
      <span className="dt-program-karti-ozet">{program.ozet}</span>
      <span className="dt-program-karti-etiketler">
        <DtEtiket>{KATEGORI_ADI[program.kategori]}</DtEtiket>
        <DtEtiket ton={durum === 'kapandi' || durum === 'kapali' ? 'kapali' : 'notr'}>{DURUM_ADI[durum]}</DtEtiket>
        {eski ? <DtEtiket ton="uyari">Eski bilgi</DtEtiket> : null}
      </span>
      <span className="dt-program-karti-kontrol">Son kontrol: {tarihYaz(program.kaynak.asOf)}</span>
    </Link>
  )
}

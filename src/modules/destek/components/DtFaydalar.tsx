import '@/styles/bilesen/DtFaydalar.css'
import { FAYDA_ADI, FAYDA_ETKISI, KATILIMCI_ETKISI } from '../data/faydalar'
import { programEtiketi } from '../data/etiketler'
import { SOZLUK } from '../data/sozluk'
import type { FaydaTuru, Program } from '../data/tipler'
import { alanMetni } from '../motor/tazelik'
import { DtEtiket } from './DtEtiket'

const TL = new Intl.NumberFormat('tr-TR')

const TERIM: Partial<Record<FaydaTuru, string>> = {
  hibe: 'hibe',
  vergi_sgk: 'tesvik',
  kredi: 'kredi',
  ortaklik: 'ortaklikYatirimi',
  kefalet: 'kefalet',
}

export function DtFaydalar({ program, bugun }: { program: Program; bugun: string }) {
  const etiket = programEtiketi(program.id)
  return (
    <>
      {etiket && !program.faydalar.includes('destek_degil') ? <DtEtiket>{etiket}</DtEtiket> : null}
      {program.faydalar.map((fayda) => {
        const terim = SOZLUK.find((t) => t.id === TERIM[fayda])
        const eskiTavan = program.faydalar.length === 1
          && ((fayda === 'hibe' && program.tutar.tavanTuru === 'hibe_tavani')
            || (fayda === 'kredi' && program.tutar.tavanTuru === 'kredi_anaparasi'))
          ? program.tutar.tavanTL : undefined
        const tavan = program.faydaTavanlari?.[fayda] ?? eskiTavan
        return (
          <div key={fayda}>
            {terim ? (
              <details className="dt-fayda-terim">
                <summary><DtEtiket>{FAYDA_ADI[fayda]}</DtEtiket></summary>
                <p>{terim.anlam}</p>
              </details>
            ) : <DtEtiket>{fayda === 'destek_degil' ? etiket ?? FAYDA_ADI[fayda] : FAYDA_ADI[fayda]}</DtEtiket>}
            <p>{program.kategori === 'katilimciya_odeme' && fayda === 'hizmet' ? KATILIMCI_ETKISI : FAYDA_ETKISI[fayda]}</p>
            {tavan ? <p>Üst sınır: {alanMetni(tavan, bugun, (value) => `${TL.format(value)} TL`)}</p> : null}
          </div>
        )
      })}
    </>
  )
}

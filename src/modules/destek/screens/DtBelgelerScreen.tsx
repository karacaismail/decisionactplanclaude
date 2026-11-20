import '@/styles/ekran/DtBelgelerScreen.css'
import { Link } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { DtKontrolTarihi } from '../components/DtKontrolTarihi'
import { DtTerimBaglantisi } from '../components/DtTerimBaglantisi'
import { DtUyari } from '../components/DtUyari'
import { KANIT_GRUPLARI, KANIT_SON_KONTROL } from '../data/kanitlar'
import { useBugun, usePlanYeri } from '../kancalar'

const MADDE_SAYISI = KANIT_GRUPLARI.reduce((n, g) => n + g.maddeler.length, 0)

/** Belge ve kanıt listesi. Bu ekran plan istemez. Belgeler başvuru ekranında başvuruya eklenir. */
export default function DtBelgelerScreen() {
  const bugun = useBugun()
  const { planId } = usePlanYeri()
  return (
    <div className="page dt-belgeler">
      <PageHeader
        title="Belge ve kanıt listesi"
        kicker="Destek ve teşvik"
        description="Destek başvurularında sık istenen belgeler burada. Her belgenin neden gerektiği yanında yazar."
      />
      <DtUyari />
      <DtKontrolTarihi asOf={KANIT_SON_KONTROL} bugun={bugun} />
      <section className="dt-belgeler-giris" aria-labelledby="dt-belgeler-nasil">
        <h2 id="dt-belgeler-nasil">Bu liste nasıl kullanılır?</h2>
        <p>Her program bütün belgeleri istemez. Programın kendi belge listesi program sayfasındadır.</p>
        {planId ? (
          <>
            <p>Bu listedeki belgeleri başvurunuzun belge listesine ekleyebilirsiniz.</p>
            <Link className="dt-belgeler-baglanti" to="/destek/basvurular">Başvurularıma gidin</Link>
          </>
        ) : (
          <p>Belgeyi başvuruya eklemek için önce bir plan açın. Sonra programı başvuru listenize ekleyin.</p>
        )}
      </section>
      <p className="dt-belgeler-sayi">{KANIT_GRUPLARI.length} grupta {MADDE_SAYISI} belge var.</p>
      <div className="dt-belgeler-gruplar">
        {KANIT_GRUPLARI.map((g, i) => (
          <section key={g.id} className="dt-belgeler-grup" aria-labelledby={`dt-grup-${g.id}`}>
            <h2 id={`dt-grup-${g.id}`}>{i + 1}. {g.ad}</h2>
            <ul className="dt-belgeler-liste">
              {g.maddeler.map((m) => (
                <li key={m.id}>
                  <p className="dt-belgeler-ad">{m.ad}</p>
                  <p>{m.neden}</p>
                  <DtTerimBaglantisi terim={m.terim} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

import '@/styles/ekran/DtBelgelerScreen.css'
import { useState } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { DtHavuzBelgesi } from '../components/DtHavuzBelgesi'
import { DtKontrolTarihi } from '../components/DtKontrolTarihi'
import { DtTerimBaglantisi } from '../components/DtTerimBaglantisi'
import { DtUyari } from '../components/DtUyari'
import { KANIT_GRUPLARI, KANIT_SON_KONTROL } from '../data/kanitlar'
import { ORTAK_BELGELER } from '../data/ortakBelgeler'
import { OKUMA_HATASI, useBugun, useHavuz, usePlanYeri } from '../kancalar'

const MADDE_SAYISI = KANIT_GRUPLARI.reduce((n, g) => n + g.maddeler.length, 0)
const ORTAK = new Map(ORTAK_BELGELER.map((b) => [b.id, b]))

/**
 * Belge ve kanıt listesi. Bu ekran plan istemez. Belgeler başvuru ekranında başvuruya eklenir.
 * Liste aynı zamanda ortak belge havuzudur. Kişi hazır belgeyi burada bir kez işaretler.
 */
export default function DtBelgelerScreen() {
  const bugun = useBugun()
  const { planId, yer } = usePlanYeri()
  const { havuz, hata: okumaHatasi } = useHavuz(yer)
  const [hata, setHata] = useState<string>()
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
      <section className="dt-belgeler-giris" aria-labelledby="dt-belgeler-havuz">
        <h2 id="dt-belgeler-havuz">Hazır belgelerinizi işaretleyin</h2>
        <p>Elinizde hazır olan belgeyi burada bir kez işaretleyin. Bu işaret başvurularınızı değiştirmez.</p>
        <p>Başvuru ekranında her belgenin yanında bir düğme çıkar. Belgeyi o başvuruda kullanacaksanız düğmeye basın.</p>
        <p>Bazı belgelerin bir geçerlilik tarihi vardır. Bu belgelerde tarihi kendiniz yazın. Tarih geçince uygulama sizi uyarır.</p>
        {planId ? null : <p>Plan açık değil. İşaretleriniz plana bağlı olmadan bu tarayıcıda durur.</p>}
      </section>
      {okumaHatasi ? <p className="dt-belgeler-hata" role="alert">{OKUMA_HATASI}</p> : null}
      {hata ? <p className="dt-belgeler-hata" role="alert">{hata}</p> : null}
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
                  {havuz ? <DtHavuzBelgesi belge={ORTAK.get(m.id)!} kayit={havuz.belgeler[m.id]} yer={yer} bugun={bugun} hataGoster={setHata} /> : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

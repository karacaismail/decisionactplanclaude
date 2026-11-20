import '@/styles/ekran/DtGiderlerScreen.css'
import { Link, useSearchParams } from 'react-router'
import { Select } from 'antd'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { DtKontrolTarihi } from '../components/DtKontrolTarihi'
import { DtTerimBaglantisi } from '../components/DtTerimBaglantisi'
import { DtUyari } from '../components/DtUyari'
import { GIDER_ESLESMELERI } from '../data/giderEslesmeleri'
import { GIDER_KALEMLERI, GIDER_SON_KONTROL } from '../data/giderler'
import { useBugun, useKatalog } from '../kancalar'
import { GIDER_KARSILIK_YOK } from '../metinler'
import { giderAdaylari, type GiderAdayi } from '../motor/gider'

/** Açılır listedeki uzun gider adları kesilmez, satıra sarılır. */
const ACILIR = { popup: { root: 'dt-giderler-acilir' } }

function ProgramListesi({ liste }: { liste: GiderAdayi[] }) {
  return (
    <ul className="dt-giderler-liste">
      {liste.map(({ program, kanitlar }) => (
        <li key={program.id}>
          <Link className="dt-giderler-program" to={`/destek/${program.id}`}>{program.ad}</Link>
          <p>Kurum: {program.kurum}</p>
          {kanitlar.map((k) => <p key={k}>Katalogdaki gider: “{k}”</p>)}
        </li>
      ))}
    </ul>
  )
}

/**
 * Gider rehberi. Kişi bir gider seçer. Ekran bu gideri ödeyebilecek programları gösterir.
 * Programlar yalnız katalogdaki gider metnine dayanan bağlardan gelir. Gideri hariç tutan program aday olmaz.
 * Seçimden sonra odak seçim kutusunda kalır. Sonuç sayısı canlı bölgede duyurulur.
 * Seçim adreste durur. Bu yüzden sayfa yenilenince seçim kalır. Liste ilk rehberdir, söz değildir.
 */
export default function DtGiderlerScreen() {
  const programlar = useKatalog()
  const bugun = useBugun()
  const [params, setParams] = useSearchParams()
  const secili = GIDER_KALEMLERI.find((g) => g.id === params.get('kalem'))
  const { adaylar: bulunan, haric } = secili ? giderAdaylari(secili.id, GIDER_ESLESMELERI, programlar) : { adaylar: [], haric: [] }

  return (
    <div className="page dt-giderler">
      <PageHeader title="Gider rehberi" kicker="Destek ve teşvik" description="Bir gider seçin. Bu gideri ödeyebilecek programları görün." />
      <DtUyari />
      <section className="dt-giderler-not" aria-labelledby="dt-giderler-not-baslik">
        <h2 id="dt-giderler-not-baslik">Bu liste ilk rehberdir</h2>
        <p>Bu liste söz değildir. Program bu gideri her durumda ödemeyebilir. Programın koşullarını ve kurumun sayfasını okuyun. Kesin kararı kurum verir.</p>
        <DtKontrolTarihi asOf={GIDER_SON_KONTROL} bugun={bugun} />
      </section>
      <div className="dt-giderler-alan">
        <label htmlFor="dt-gider">Gider</label>
        <Select<string>
          id="dt-gider"
          classNames={ACILIR}
          value={secili?.id}
          placeholder="Bir gider seçin"
          allowClear
          showSearch
          virtual={false}
          optionFilterProp="label"
          notFoundContent="Eşleşen gider yok."
          options={GIDER_KALEMLERI.map((g) => ({ value: g.id, label: g.ad }))}
          onChange={(id) => setParams(id ? { kalem: id } : {}, { replace: true })}
        />
        {/* Odak seçim kutusunda kalır. Sonuç bu satırda duyurulur. */}
        <p className="dt-giderler-durum" aria-live="polite">{!secili ? 'Gider seçince programlar aşağıda görünür.' : bulunan.length ? `Bu gider için ${bulunan.length} program bulundu. Programlar aşağıda.` : GIDER_KARSILIK_YOK}</p>
      </div>
      {secili ? (
        <section className="dt-giderler-sonuc" aria-labelledby="dt-gider-baslik">
          <h2 id="dt-gider-baslik">{secili.ad}</h2>
          {secili.not ? <p>{secili.not}</p> : null}
          <DtTerimBaglantisi terim={secili.terim} />
          <h3>Bu gideri ödeyebilecek programlar ({bulunan.length})</h3>
          {bulunan.length ? <ProgramListesi liste={bulunan} /> : (
            <div className="dt-giderler-yok">
              <p>{GIDER_KARSILIK_YOK}</p>
              <p>Bu durum desteğin olmadığı anlamına gelmez. Katalog bütün destekleri içermez.</p>
            </div>
          )}
          {haric.length ? (
            <>
              <h3>Bu gideri ödemeyen programlar ({haric.length})</h3>
              <p>Bu programların kataloğu bu gideri kapsam dışında sayar.</p>
              <ProgramListesi liste={haric} />
            </>
          ) : null}
        </section>
      ) : (
        <EmptyState level={2} announce={false} title="Henüz gider seçmediniz" text="Yukarıdaki kutudan bir gider seçin. Bu gideri ödeyebilecek programlar burada görünür." actionless="Gider seçme kutusu hemen üstte duruyor." />
      )}
    </div>
  )
}

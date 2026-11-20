import '@/styles/ekran/DtGiderlerScreen.css'
import { Link, useSearchParams } from 'react-router'
import { Select } from 'antd'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { DtKontrolTarihi } from '../components/DtKontrolTarihi'
import { DtTerimBaglantisi } from '../components/DtTerimBaglantisi'
import { DtUyari } from '../components/DtUyari'
import { GIDER_KALEMLERI, GIDER_SON_KONTROL } from '../data/giderler'
import type { Program } from '../data/tipler'
import { useBugun, useKatalog } from '../kancalar'

/** Açılır listedeki uzun gider adları kesilmez, satıra sarılır. */
const ACILIR = { popup: { root: 'dt-giderler-acilir' } }

/**
 * Gider rehberi. Kişi bir gider seçer. Ekran bu gideri ödeyebilecek programları gösterir.
 * Seçimden sonra odak seçim kutusunda kalır. Sonuç sayısı canlı bölgede duyurulur.
 * Seçim adreste durur. Bu yüzden sayfa yenilenince seçim kalır. Liste ilk rehberdir, söz değildir.
 */
export default function DtGiderlerScreen() {
  const programlar = useKatalog()
  const bugun = useBugun()
  const [params, setParams] = useSearchParams()
  const secili = GIDER_KALEMLERI.find((g) => g.id === params.get('kalem'))
  const bulunan = (secili?.programlar ?? []).map((id) => programlar.find((p) => p.id === id)).filter((p): p is Program => Boolean(p))

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
        <p className="dt-giderler-durum" aria-live="polite">{secili ? `Bu gider için ${bulunan.length} program bulundu. Programlar aşağıda.` : 'Gider seçince programlar aşağıda görünür.'}</p>
      </div>
      {secili ? (
        <section className="dt-giderler-sonuc" aria-labelledby="dt-gider-baslik">
          <h2 id="dt-gider-baslik">{secili.ad}</h2>
          {secili.not ? <p>{secili.not}</p> : null}
          <DtTerimBaglantisi terim={secili.terim} />
          <h3>Bu gideri ödeyebilecek programlar ({bulunan.length})</h3>
          <ul className="dt-giderler-liste">
            {bulunan.map((p) => (
              <li key={p.id}>
                <Link className="dt-giderler-program" to={`/destek/${p.id}`}>{p.ad}</Link>
                <p>Kurum: {p.kurum}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <EmptyState level={2} announce={false} title="Henüz gider seçmediniz" text="Yukarıdaki kutudan bir gider seçin. Bu gideri ödeyebilecek programlar burada görünür." actionless="Gider seçme kutusu hemen üstte duruyor." />
      )}
    </div>
  )
}

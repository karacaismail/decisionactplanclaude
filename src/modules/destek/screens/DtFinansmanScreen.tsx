import '@/styles/ekran/DtFinansmanScreen.css'
import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { Checkbox } from 'antd'
import { Warning } from '@phosphor-icons/react'
import { selectLimits, selectResources, type ReadonlyPlan } from '@/contracts'
import { useCurrentPlanView } from '@/platform/planSource'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { DtUyari } from '../components/DtUyari'
import { giderBagiDegistir } from '../depo'
import { OKUMA_HATASI, useBasvurular, useGiderBaglari } from '../kancalar'
import { BASVURU_DURUM_ADI, IKI_BASVURU_UYARISI } from '../metinler'
import type { Basvuru } from '../motor/basvuru'
import { beklenenDestekler, cubuklar, ikiBasvuruluSatirlar, tlYaz, type Cubuk, type GiderBagi } from '../motor/finansman'

const KICKER = 'Destek ve teşvik'
const ACIKLAMA = 'Planınızdaki kaynakları ve beklenen destekleri ayrı ayrı görün.'

/**
 * Finansman görünümü. Ekran planı yalnız okur.
 * Planın kaynak satırları kişinin yazdığı tutarlarla çubukta ve tabloda görünür.
 * Beklenen destekler ayrı kutuda durur ve tutar taşımaz. Destek çubuğa girmez.
 * Uygulama yeni tutar hesaplamaz ve toplam almaz. Gider bağı destek deposuna yazılır.
 */
export default function DtFinansmanScreen() {
  const plan = useCurrentPlanView()
  if (!plan) return null
  return <FinansmanIcerik plan={plan} />
}

function FinansmanIcerik({ plan }: { plan: ReadonlyPlan }) {
  const kalemler = cubuklar(selectResources(plan))
  const { basvurular, hata: basvuruHatasi } = useBasvurular(plan.id)
  const { baglar, hata: bagHatasi } = useGiderBaglari(plan.id)
  const hata = basvuruHatasi || bagHatasi

  return (
    <div className="page dt-finansman">
      <PageHeader title="Finansman görünümü" kicker={KICKER} description={ACIKLAMA} />
      <DtUyari />
      <p className="dt-finansman-not">Bu ekran planınızı değiştirmez. Tutarları siz yazdınız. Uygulama tutar hesaplamaz ve toplam almaz.</p>
      <Kaynaklar kalemler={kalemler} />
      <Sinirlar plan={plan} />
      {hata ? <p className="dt-finansman-hata" role="alert">{OKUMA_HATASI}</p> : null}
      {!hata && basvurular && baglar ? (
        <>
          <GiderBaglari planId={plan.id} kalemler={kalemler} basvurular={basvurular} baglar={baglar} />
          <Beklenen basvurular={basvurular} />
        </>
      ) : null}
    </div>
  )
}

function Kaynaklar({ kalemler }: { kalemler: Cubuk[] }) {
  if (!kalemler.length) {
    return (
      <section className="dt-finansman-bolum" aria-labelledby="dt-kaynak-baslik">
        <h2 id="dt-kaynak-baslik">Planınızdaki kaynaklar</h2>
        <EmptyState level={3} title="Henüz kaynak yazılmadı" text="Kaynak ve bütçe adımında işlerin parasını yazın. Yazdığınız kalemler burada görünür." action={<Link className="dt-finansman-baglanti" to="/uygulama">Strateji uygulama ekranına gidin</Link>} />
      </section>
    )
  }
  return (
    <section className="dt-finansman-bolum" aria-labelledby="dt-kaynak-baslik">
      <h2 id="dt-kaynak-baslik">Planınızdaki kaynaklar</h2>
      <p>Çubuklar kaynak ve bütçe adımında yazdığınız tutarları gösterir. En uzun çubuk en büyük tutardır. Destekler bu çubuklarda yoktur.</p>
      <ul className="dt-finansman-cubuklar" aria-label="Kaynak çubukları">
        {kalemler.map((k) => (
          <li key={k.rowId} className="dt-finansman-cubuk-satir">
            <span className="dt-finansman-kalem">{k.item}</span>
            <span className="dt-finansman-tutar">{k.tutar}</span>
            <span className="dt-finansman-cubuk" aria-hidden>
              {k.oran === null ? null : <span className="dt-finansman-cubuk-dolu" style={{ '--dt-cubuk-oran': `${k.oran}%` } as CSSProperties} />}
            </span>
          </li>
        ))}
      </ul>
      <div className="dt-finansman-tablo-kutu" role="region" aria-labelledby="dt-kaynak-tablo-baslik" tabIndex={0}>
        <table className="dt-finansman-tablo">
          <caption id="dt-kaynak-tablo-baslik">Kaynak tablosu</caption>
          <thead>
            <tr>
              <th scope="col">Kalem</th>
              <th scope="col">Yazdığınız tutar</th>
            </tr>
          </thead>
          <tbody>
            {kalemler.map((k) => (
              <tr key={k.rowId}>
                <th scope="row">{k.item}</th>
                <td>{k.tutar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Sinirlar({ plan }: { plan: ReadonlyPlan }) {
  const s = selectLimits(plan)
  const satirlar = [
    { ad: 'Harcama sınırı', deger: s.budgetKurus },
    { ad: 'Eldeki nakit', deger: s.cashKurus },
    { ad: 'Aylık sabit gider', deger: s.monthlyBurnKurus },
  ]
  return (
    <section className="dt-finansman-bolum" aria-labelledby="dt-sinir-baslik">
      <h2 id="dt-sinir-baslik">Planınızın para sınırları</h2>
      <p>Bu tutarları Adım 02'de siz yazdınız. Tutar yazılmadıysa "Bilinmiyor" yazar.</p>
      <dl className="dt-finansman-sinirlar">
        {satirlar.map((x) => (
          <div key={x.ad}>
            <dt>{x.ad}</dt>
            <dd>{tlYaz(x.deger)}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function GiderBaglari({ planId, kalemler, basvurular, baglar }: { planId: string; kalemler: Cubuk[]; basvurular: Basvuru[]; baglar: GiderBagi[] }) {
  const [durum, setDurum] = useState('')
  const iki = ikiBasvuruluSatirlar(baglar, basvurular)
  if (!kalemler.length) return null

  /* Her işaret tek bir değişiklik olarak yazılır. Depo değişikliği son kayda uygular. */
  const degistir = async (kalem: Cubuk, basvuru: Basvuru, secili: boolean) => {
    try {
      await giderBagiDegistir(planId, kalem.rowId, basvuru.id, secili)
      setDurum(secili ? `“${kalem.item}” gideri “${basvuru.programAdi}” başvurusuna bağlandı.` : `“${kalem.item}” giderinin “${basvuru.programAdi}” bağı kaldırıldı.`)
    } catch (error) {
      console.error('Gider bağı yazılamadı.', error)
      setDurum('Bağ kaydedilemedi. Planınız değişmedi. Yeniden deneyin.')
    }
  }

  return (
    <section className="dt-finansman-bolum" aria-labelledby="dt-bag-baslik">
      <h2 id="dt-bag-baslik">Giderleri başvurulara bağlayın</h2>
      <p>Bir gideri hangi başvuruda göstereceğinizi işaretleyin. Bu bağ planınıza yazılmaz. Bağ yalnız size hatırlatma içindir.</p>
      {!basvurular.length ? (
        <EmptyState level={3} announce={false} title="Henüz başvuru yok" text="Bağ kurmak için önce bir programı başvuru listenize ekleyin." action={<Link className="dt-finansman-baglanti" to="/destek">Destek programlarına gidin</Link>} />
      ) : (
        <ul className="dt-finansman-baglar">
          {kalemler.map((k) => {
            const secili = new Set(baglar.find((b) => b.satirId === k.rowId)?.basvuruIdleri ?? [])
            return (
              <li key={k.rowId}>
                <fieldset className="dt-finansman-bag">
                  <legend>{k.item}</legend>
                  {basvurular.map((b) => (
                    <Checkbox key={b.id} checked={secili.has(b.id)} onChange={(e) => void degistir(k, b, e.target.checked)}>
                      {b.programAdi}
                    </Checkbox>
                  ))}
                  {iki.has(k.rowId) ? (
                    <p className="dt-finansman-uyari">
                      <Warning aria-hidden className="dt-finansman-uyari-ikon" />
                      <span>{IKI_BASVURU_UYARISI}</span>
                    </p>
                  ) : null}
                </fieldset>
              </li>
            )
          })}
        </ul>
      )}
      <p className="dt-finansman-durum" aria-live="polite">{durum}</p>
    </section>
  )
}

function Beklenen({ basvurular }: { basvurular: Basvuru[] }) {
  const liste = beklenenDestekler(basvurular)
  return (
    <section className="dt-finansman-beklenen" aria-labelledby="dt-beklenen-baslik">
      <h2 id="dt-beklenen-baslik">Beklenen, kesin değil</h2>
      <p>Bu destekler kesin para değildir. Bu yüzden tutar yazılmaz. Kesin cevabı kurum verir.</p>
      {liste.length ? (
        <ul className="dt-finansman-beklenen-liste">
          {liste.map((b) => (
            <li key={b.id}>
              <span className="dt-finansman-kalem">{b.programAdi}</span>
              <span>Durum: {BASVURU_DURUM_ADI[b.durum]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Beklenen destek yok. Başvuru listeniz boş ya da başvurular sonuçlandı.</p>
      )}
      <Link className="dt-finansman-baglanti" to="/destek/basvurular">Başvurularıma gidin</Link>
    </section>
  )
}

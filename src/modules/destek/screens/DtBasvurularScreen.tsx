import '@/styles/ekran/DtBasvurularScreen.css'
import 'dayjs/locale/tr'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button, Checkbox, DatePicker, Popconfirm, Select } from 'antd'
import dayjs from 'dayjs'
import { Info, Prohibit, Question, Warning } from '@phosphor-icons/react'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { DtEtiket } from '../components/DtEtiket'
import { DtTerimBaglantisi } from '../components/DtTerimBaglantisi'
import { DtUyari } from '../components/DtUyari'
import { KANIT_GRUPLARI } from '../data/kanitlar'
import type { Program } from '../data/tipler'
import { basvuruGuncelle, basvuruSil } from '../depo'
import { OKUMA_HATASI, useBasvurular, useBugun, useKatalog, usePlanYeri } from '../kancalar'
import { BASVURU_DURUM_ADI, BILGI_YOK, BILGI_YOK_ACIKLAMA, DESTEKSIZ_ADI, farkliKayitMetni, KOMBINASYON_METNI } from '../metinler'
import { BASVURU_DURUMLARI, belgeAnahtari, type Basvuru, type BasvuruDegisikligi, type BasvuruDurumu } from '../motor/basvuru'
import { basvuruCiftleri, uyariMi, type Iliski } from '../motor/kombinasyon'
import { tarihGectiMi, tarihYaz } from '../motor/tazelik'

const KANITLAR = KANIT_GRUPLARI.flatMap((g) => g.maddeler)
/** Açılır listedeki uzun belge adları kesilmez, satıra sarılır. */
const BELGE_ACILIR = { popup: { root: 'dt-basvurular-belge-acilir' } }

/**
 * Belge ve kanıt listesinden başvuruya belge ekler. Seçim kutusu markalı bileşendir.
 * Başvuruda aynı adlı belge varsa seçenek kapalıdır ve "listede var" yazar.
 */
function BelgeEkle({ basvuru, id, degistir, bildir }: { basvuru: Basvuru; id: string; degistir: (d: BasvuruDegisikligi) => Promise<boolean>; bildir: (m: string) => void }) {
  const [secim, setSecim] = useState<string>()
  const [calisiyor, setCalisiyor] = useState(false)
  const varolan = new Set(basvuru.belgeler.map((b) => belgeAnahtari(b.ad)))
  const secenekler = KANIT_GRUPLARI.map((g, i) => ({
    label: `${i + 1}. ${g.ad}`,
    title: g.ad,
    options: g.maddeler.map((m) => {
      const var_ = varolan.has(belgeAnahtari(m.ad)) || basvuru.belgeler.some((b) => b.kanit === m.id)
      return { value: m.id, label: var_ ? `${m.ad} (listede var)` : m.ad, disabled: var_ }
    }),
  }))
  /* Düğme kapanmaz. Kapanan düğme odağı kaybettirir. Seçim yoksa ekran nedenini söyler. */
  const ekle = async () => {
    if (calisiyor) return
    const madde = KANITLAR.find((m) => m.id === secim)
    if (!madde) {
      bildir('Önce listeden bir belge seçin.')
      return
    }
    setCalisiyor(true)
    const tamam = await degistir({ belgeEkle: { ad: madde.ad, kanit: madde.id } })
    setCalisiyor(false)
    if (tamam) {
      setSecim(undefined)
      bildir(`“${madde.ad}” belge listesine eklendi.`)
    }
  }
  return (
    <div className="dt-basvuru-ekle-belge">
      <div className="dt-basvuru-alan">
        <label htmlFor={`${id}-kanit`}>Belge ve kanıt listesinden belge ekleyin</label>
        <Select<string> id={`${id}-kanit`} value={secim} onChange={setSecim} classNames={BELGE_ACILIR} placeholder="Bir belge seçin" showSearch optionFilterProp="label" virtual={false} notFoundContent="Eşleşen belge yok." options={secenekler} />
      </div>
      <div className="dt-basvuru-dugmeler">
        <Button onClick={() => void ekle()}>Belgeyi ekleyin</Button>
        <Link className="dt-basvuru-baglanti" to="/destek/belgeler">Belgelerin nedenini okuyun</Link>
      </div>
    </div>
  )
}

const ILISKI_IKONU = { dislayici: Prohibit, ayri_gider: Warning } as const

function IliskiSatiri({ iliski }: { iliski: Iliski | undefined }) {
  const Ikon = iliski ? (ILISKI_IKONU[iliski.tur as keyof typeof ILISKI_IKONU] ?? Info) : Question
  return (
    <p className={`dt-cift-durum dt-cift-${iliski?.tur ?? 'bilinmiyor'}`}>
      <Ikon aria-hidden className="dt-cift-ikon" />
      <span>{iliski ? KOMBINASYON_METNI[iliski.tur].kisa : BILGI_YOK}</span>
    </p>
  )
}

/** Başvuru listesindeki programların birlikte kullanımı. Uyarı gereken çiftler önce gelir. */
function BirlikteKullanma({ basvurular, programlar }: { basvurular: readonly Basvuru[]; programlar: readonly Program[] }) {
  const ciftler = basvuruCiftleri(basvurular, programlar)
  const uyarilar = ciftler.filter((c) => uyariMi(c.iliski))
  /* Bilgisi olmayan çiftler tek bir açılır bölümde durur. Böylece çok başvuruda liste uzamaz. */
  const bilinen = ciftler.filter((c) => c.iliski)
  const bilinmeyen = ciftler.filter((c) => !c.iliski)
  const ayriGider = ciftler.some((c) => c.iliski && [c.iliski.tur, c.iliski.farkli].includes('ayri_gider'))
  return (
    <section className="dt-basvurular-birlikte" aria-labelledby="dt-birlikte-baslik">
      <h2 id="dt-birlikte-baslik">Programları birlikte kullanma</h2>
      <p>Bu bilgi katalogdaki kayıtlardan gelir. Kesin kararı kurumlar verir.</p>
      <p className="dt-basvurular-sayi">{uyarilar.length ? `${ciftler.length} program çiftinden ${uyarilar.length} tanesi için uyarı var.` : `${ciftler.length} program çifti için uyarı yok.`}</p>
      {bilinen.length ? (
        <ul className="dt-ciftler">
          {bilinen.map((c) => (
            <li key={`${c.a.id}-${c.b.id}`} className={uyariMi(c.iliski) ? 'dt-cift dt-cift-uyari' : 'dt-cift'}>
              <p className="dt-cift-ad">{c.a.programAdi} ile {c.b.programAdi}</p>
              <IliskiSatiri iliski={c.iliski} />
              {c.iliski?.farkli ? <p>{farkliKayitMetni(c.iliski.farkli)}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {bilinmeyen.length ? (
        <details className="dt-ciftler-bilinmeyen" open={!bilinen.length}>
          <summary>Bilgisi olmayan çiftler ({bilinmeyen.length})</summary>
          <p className="dt-cift-durum dt-cift-bilinmiyor">
            <Question aria-hidden className="dt-cift-ikon" />
            <span>{BILGI_YOK} {BILGI_YOK_ACIKLAMA}</span>
          </p>
          <ul>
            {bilinmeyen.map((c) => <li key={`${c.a.id}-${c.b.id}`}>{c.a.programAdi} ile {c.b.programAdi}</li>)}
          </ul>
        </details>
      ) : null}
      {ayriGider ? <DtTerimBaglantisi terim="ciftFinansman" /> : null}
    </section>
  )
}

function BasvuruKarti({ basvuru, program, planId, bugun, hataGoster, silindi }: { basvuru: Basvuru; program: Program | undefined; planId: string; bugun: string; hataGoster: (m: string) => void; silindi: () => void }) {
  const id = `dt-basvuru-${basvuru.id}`
  /*
   * İşaret hemen görünür. Bekleyen işaret belgenin adına ya da kimliğine bağlıdır. Sıra kaysa da doğru belgede kalır.
   * Depodaki hal bekleyen işaretle aynı olunca işaret temizlenir. Sıradaki başka işaretler korunur.
   */
  const [bekleyen, setBekleyen] = useState<Record<string, boolean>>({})
  const belgeAnahtar = (b: { ad: string; kanit?: string }) => b.kanit ?? b.ad
  useEffect(() => {
    setBekleyen((x) => {
      const kalan = Object.entries(x).filter(([k, v]) => {
        const kayitli = basvuru.belgeler.find((b) => belgeAnahtar(b) === k)
        return kayitli !== undefined && kayitli.hazir !== v
      })
      return kalan.length === Object.keys(x).length ? x : Object.fromEntries(kalan)
    })
  }, [basvuru.belgeler])
  const belgeler = basvuru.belgeler.map((b) => ({ ...b, hazir: bekleyen[belgeAnahtar(b)] ?? b.hazir }))
  const [belgeMesaji, setBelgeMesaji] = useState('')
  const belgeBasligi = useRef<HTMLHeadingElement>(null)
  const hazir = belgeler.filter((b) => b.hazir).length
  const degistir = (d: BasvuruDegisikligi): Promise<boolean> =>
    basvuruGuncelle(planId, basvuru.id, d, new Date().toISOString()).then(
      () => true,
      (error: unknown) => {
        console.error(error)
        /* Kayıt yazılmadı. Ekrandaki bekleyen işaret de geri alınır. Böylece ekran kayıtlı hâli gösterir. */
        setBekleyen({})
        hataGoster('Değişiklik kaydedilemedi. Önceki kayıt duruyor. Yeniden deneyin.')
        return false
      },
    )
  const programTarihleri = program?.tarihler.filter((t) => t.kritik && t.tarih.state === 'kaynakli') ?? []
  return (
    <article className="dt-basvuru" aria-labelledby={`${id}-ad`}>
      <h3 id={`${id}-ad`}>
        {program ? <Link to={`/destek/${program.id}`}>{basvuru.programAdi}</Link> : basvuru.programAdi}
      </h3>
      {program ? null : <p>Bu program artık listede yok. Kurumun sayfasından kontrol edin.</p>}
      <div className="dt-basvuru-alan">
        <label htmlFor={`${id}-durum`}>Başvurunun durumu</label>
        <Select<BasvuruDurumu> id={`${id}-durum`} value={basvuru.durum} virtual={false} options={BASVURU_DURUMLARI.map((d) => ({ value: d, label: BASVURU_DURUM_ADI[d] }))} onChange={(durum) => degistir({ durum })} />
      </div>
      <p>Bu işi destek olmadan da yapar mıydınız? Cevabınız: {DESTEKSIZ_ADI[basvuru.desteksizYapar]}.</p>

      <section className="dt-basvuru-bolum" aria-labelledby={`${id}-tarih`}>
        <h4 id={`${id}-tarih`}>Son tarihler</h4>
        {programTarihleri.length ? (
          <ul>
            {programTarihleri.map((t) => (
              <li key={t.ad}>
                {t.ad}: {tarihYaz(t.tarih.value as string)}
                {tarihGectiMi(t.tarih.value as string, bugun) ? <> <DtEtiket ton="kapali">Geçti</DtEtiket></> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p>Kaynakta son gün yok. Tarihi kurumun sayfasında okuyun.</p>
        )}
        <div className="dt-basvuru-alan">
          <label htmlFor={`${id}-son`}>Kendi son gününüz</label>
          <DatePicker
            id={`${id}-son`}
            format="D MMMM YYYY dddd"
            placeholder="Gün seçin"
            inputReadOnly
            value={basvuru.sonTarih ? dayjs(basvuru.sonTarih).locale('tr') : null}
            onChange={(v) => void degistir({ sonTarih: v ? v.format('YYYY-MM-DD') : undefined })}
          />
        </div>
        {basvuru.sonTarih ? (
          <p>
            Kendi son gününüz: {tarihYaz(basvuru.sonTarih)}.
            {tarihGectiMi(basvuru.sonTarih, bugun) ? <> <DtEtiket ton="kapali">Geçti</DtEtiket></> : null}
          </p>
        ) : null}
      </section>

      <section className="dt-basvuru-bolum" aria-labelledby={`${id}-belge`}>
        <h4 id={`${id}-belge`} ref={belgeBasligi} tabIndex={-1}>Belgeler</h4>
        {basvuru.belgeler.length ? (
          <>
            <p>{belgeler.length} belgeden {hazir} tanesi hazır.</p>
            <ul className="dt-basvuru-belgeler">
              {belgeler.map((b, i) => (
                <li key={b.kanit ?? `p-${i}`}>
                  <Checkbox
                    checked={b.hazir}
                    onChange={(e) => {
                      setBekleyen((x) => ({ ...x, [belgeAnahtar(b)]: e.target.checked }))
                      void degistir({ belge: { sira: i, hazir: e.target.checked, ad: b.ad } })
                    }}
                  >
                    {b.ad}
                  </Checkbox>
                  {b.kanit ? (
                    <Button
                      className="dt-basvuru-belge-cikar"
                      aria-label={`“${b.ad}” belgesini listeden çıkarın`}
                      onClick={() => {
                        /* Satır silinince odak kaybolmaz. Odak belge başlığına geçer ve ekran sonucu söyler. */
                        void degistir({ belgeCikar: { kanit: b.kanit! } }).then((tamam) => {
                          if (!tamam) return
                          setBelgeMesaji(`“${b.ad}” listeden çıkarıldı.`)
                          belgeBasligi.current?.focus()
                        })
                      }}
                    >
                      Çıkarın
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Kaynakta belge listesi yok. Kurumun sayfasını okuyun.</p>
        )}
        <BelgeEkle basvuru={basvuru} id={id} degistir={degistir} bildir={setBelgeMesaji} />
        <p className="dt-basvuru-sonuc" aria-live="polite">{belgeMesaji}</p>
      </section>

      <Popconfirm title="Bu başvuru listeden çıkarılsın mı?" description="Belge işaretleri de silinir." okText="Çıkarın" cancelText="Vazgeçin" onConfirm={() => void basvuruSil(planId, basvuru.id).then(silindi, () => hataGoster('Başvuru silinemedi. Yeniden deneyin.'))}>
        <Button className="dt-basvuru-cikar">Listeden çıkarın</Button>
      </Popconfirm>
    </article>
  )
}

/** Planın başvuruları. Başvuru verisi plana yazılmaz. */
export default function DtBasvurularScreen() {
  const { planId } = usePlanYeri()
  const { basvurular, hata: okumaHatasi } = useBasvurular(planId)
  const listeBasligi = useRef<HTMLHeadingElement>(null)
  const programlar = useKatalog()
  const bugun = useBugun()
  const nav = useNavigate()
  const [hata, setHata] = useState<string>()
  const hazirlanan = basvurular?.filter((b) => b.durum === 'hazirlaniyor').length ?? 0

  return (
    <div className="page dt-basvurular">
      <PageHeader
        title="Başvurularım"
        kicker="Destek ve teşvik"
        description="Başvurularınızı buradan izleyin. Başvurular plan dosyasına yazılmaz. Bu yüzden kararlarınız eskimez."
        actions={<Button onClick={() => nav('/destek')}>Program ekleyin</Button>}
      />
      <DtUyari />
      {okumaHatasi ? <p className="dt-basvurular-hata" role="alert">{OKUMA_HATASI}</p> : null}
      {hata ? <p className="dt-basvurular-hata" role="alert">{hata}</p> : null}
      {planId && basvurular && basvurular.length > 1 ? <BirlikteKullanma basvurular={basvurular} programlar={programlar} /> : null}
      <h2 className="dt-basvurular-baslik" ref={listeBasligi} tabIndex={-1}>Başvuru listesi</h2>
      {planId && basvurular ? (
        basvurular.length ? (
          <>
            <p role="status" className="dt-basvurular-sayi">{basvurular.length} başvuru var. {hazirlanan} tanesi hazırlanıyor.</p>
            <ul className="dt-basvurular-liste">
              {basvurular.map((b) => (
                <li key={b.id}>
                  <BasvuruKarti basvuru={b} program={programlar.find((p) => p.id === b.programId)} planId={planId} bugun={bugun} hataGoster={setHata} silindi={() => listeBasligi.current?.focus()} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState level={3} title="Henüz başvuru yok" text="Bir programın sayfasını açın. Sonra “Başvuru listeme ekle” düğmesine basın." action={<Button onClick={() => nav('/destek')}>Programlara bakın</Button>} />
        )
      ) : null}
    </div>
  )
}

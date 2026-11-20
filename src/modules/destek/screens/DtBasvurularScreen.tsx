import '@/styles/ekran/DtBasvurularScreen.css'
import 'dayjs/locale/tr'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button, Checkbox, DatePicker, Input, Popconfirm, Select } from 'antd'
import dayjs from 'dayjs'
import { Warning } from '@phosphor-icons/react'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { DtEtiket } from '../components/DtEtiket'
import { SURESI_GECTI, TARIH_GEREKLI } from '../components/DtHavuzBelgesi'
import { DtKurumSorulari } from '../components/DtKurumSorulari'
import { DtUyari } from '../components/DtUyari'
import { KANIT_GRUPLARI } from '../data/kanitlar'
import type { Program } from '../data/tipler'
import { basvuruGuncelle, basvuruSil, PLANSIZ } from '../depo'
import { OKUMA_HATASI, useBasvurular, useBugun, useHavuz, useKatalog, usePlanYeri } from '../kancalar'
import { BASVURU_DURUM_ADI, DESTEKSIZ_ADI, KOMBINASYON_METNI } from '../metinler'
import { BASVURU_DURUMLARI, belgeAnahtari, type Basvuru, type BasvuruDegisikligi, type BasvuruDurumu } from '../motor/basvuru'
import { basvuruBelgeOnerisi, type BelgeHavuzu } from '../motor/belgeHavuzu'
import { basvuruCiftleri, BILINMEYEN_ILISKI } from '../motor/kombinasyon'
import { alanDurumu, alanMetni, tarihGectiMi, tarihYaz } from '../motor/tazelik'

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

function BirlikteKullanma({ basvurular, programlar }: { basvurular: readonly Basvuru[]; programlar: readonly Program[] }) {
  const ciftler = basvuruCiftleri(basvurular, programlar)
  return (
    <section className="dt-basvurular-birlikte" aria-labelledby="dt-birlikte-baslik">
      <h2 id="dt-birlikte-baslik">Programları birlikte kullanma</h2>
      <p className="dt-cift-durum">
        <Warning aria-hidden className="dt-cift-ikon" />
        <span>Aynı gideri iki programa yazmadan önce iki kuruma da sorun.</span>
      </p>
      {ciftler.some((c) => c.ortakGider) ? (
        <p className="dt-cift-durum" role="note">
          <Warning aria-hidden className="dt-cift-ikon" />
          <span>Bu gider iki başvuruda da yer alıyor. Birlikte kullanımı kurumlara sorun.</span>
        </p>
      ) : null}
      <details className="dt-ciftler-bilinmeyen">
        <summary>Program çiftleri ({ciftler.length})</summary>
        <ul className="dt-ciftler">
          {ciftler.map((c) => (
            <li key={`${c.a.id}-${c.b.id}`} className="dt-cift">
              <p className="dt-cift-ad">{c.a.programAdi} ile {c.b.programAdi}</p>
              <p className="dt-cift-durum">
                {c.iliski?.iliski.state === 'kaynakli' ? (
                  <a className="dt-basvuru-baglanti" href={c.iliski.iliski.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {KOMBINASYON_METNI[c.iliski.iliski.value].kisa}
                  </a>
                ) : BILINMEYEN_ILISKI}
              </p>
              {c.ortakGider ? <p>Ortak gider var.</p> : null}
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}

function BasvuruKarti({ basvuru, program, planId, bugun, havuz, hataGoster, silindi }: { basvuru: Basvuru; program: Program | undefined; planId: string; bugun: string; havuz: BelgeHavuzu | undefined; hataGoster: (m: string) => void; silindi: () => void }) {
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
  const [giderMesaji, setGiderMesaji] = useState('')
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
  const programTarihleri = program?.tarihler.filter((t) => t.kritik) ?? []
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
                {t.ad}: {alanMetni(t.tarih, bugun, tarihYaz)}
                {t.tarih.state === 'kaynakli' && alanDurumu(t.tarih, bugun) === 'kaynakli' && tarihGectiMi(t.tarih.value, bugun) ? <> <DtEtiket ton="kapali">Geçti</DtEtiket></> : null}
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

      <details className="dt-ciftler-bilinmeyen">
        <summary>Gider kodları</summary>
        <form className="dt-basvuru-alan" onSubmit={async (e) => {
          e.preventDefault()
          const metin = new FormData(e.currentTarget).get('gider')
          const giderKodlari = typeof metin === 'string' ? metin.toLowerCase().split(/\s+/).filter(Boolean) : []
          if (giderKodlari.length > 40 || giderKodlari.some((kod) => !/^[a-z0-9_-]{1,48}$/.test(kod))) {
            setGiderMesaji('Her kodda yalnız harf, rakam, kısa çizgi ya da alt çizgi kullanın. Kodları kısaltın ya da azaltın.')
            return
          }
          if (await degistir({ giderKodlari })) setGiderMesaji('Gider kodları kaydedildi.')
        }}>
          <label htmlFor={`${id}-gider`}>Fatura veya çalışan gideri için kod</label>
          <p id={`${id}-gider-aciklama`}>Aynı gider için her başvuruya aynı kodu yazın. Kodları boşlukla ayırın. Kişi adı yazmayın.</p>
          <Input.TextArea
            key={basvuru.giderKodlari?.join(' ')}
            id={`${id}-gider`}
            aria-describedby={`${id}-gider-aciklama`}
            name="gider"
            rows={2}
            maxLength={1960}
            defaultValue={basvuru.giderKodlari?.join(' ')}
            onChange={() => setGiderMesaji('')}
          />
          <Button htmlType="submit">Gider kodlarını kaydedin</Button>
          <span aria-live="polite">{giderMesaji}</span>
        </form>
      </details>

      <section className="dt-basvuru-bolum" aria-labelledby={`${id}-belge`}>
        <h4 id={`${id}-belge`} ref={belgeBasligi} tabIndex={-1}>Belgeler</h4>
        {basvuru.belgeler.length ? (
          <>
            <p>{belgeler.length} belgeden {hazir} tanesi hazır.</p>
            <ul className="dt-basvuru-belgeler">
              {belgeler.map((b, i) => {
                const oneri = basvuruBelgeOnerisi(b, havuz, bugun)
                const isaretle = (hazir: boolean) => {
                  setBekleyen((x) => ({ ...x, [belgeAnahtar(b)]: hazir }))
                  void degistir({ belge: { sira: i, hazir, ad: b.ad } })
                }
                return (
                <li key={b.kanit ?? `p-${i}`}>
                  <Checkbox checked={b.hazir} onChange={(e) => isaretle(e.target.checked)}>
                    {b.ad}
                  </Checkbox>
                  {oneri === 'kullan' ? (
                    <div className="dt-basvuru-havuz">
                      <p>Bu belge havuzunuzda hazır görünüyor.</p>
                      <Button
                        aria-label={`Bu belgeyi kullanacağım (${b.ad})`}
                        onClick={(e) => {
                          /* Düğme işaretten sonra kaybolur. Odak kaybolmaz, aynı satırdaki işaret kutusuna geçer. */
                          const kutu = e.currentTarget.closest('li')?.querySelector<HTMLInputElement>('input[type="checkbox"]')
                          isaretle(true)
                          kutu?.focus()
                        }}
                      >
                        Bu belgeyi kullanacağım
                      </Button>
                    </div>
                  ) : null}
                  {oneri === 'suresiGecti' || oneri === 'tarihGerekli' ? (
                    <p className="dt-basvuru-havuz-uyari" role="note">
                      <Warning aria-hidden className="dt-cift-ikon" />
                      <span>{oneri === 'suresiGecti' ? SURESI_GECTI : TARIH_GEREKLI}</span>
                    </p>
                  ) : null}
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
                )
              })}
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
  const { havuz } = useHavuz(planId ?? PLANSIZ)
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
      <DtKurumSorulari />
      {!planId ? <p>Başvurularınızı görmek için bir plan açın.</p> : null}
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
                  <BasvuruKarti basvuru={b} program={programlar.find((p) => p.id === b.programId)} planId={planId} bugun={bugun} havuz={havuz} hataGoster={setHata} silindi={() => listeBasligi.current?.focus()} />
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

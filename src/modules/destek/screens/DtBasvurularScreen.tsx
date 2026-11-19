import '@/styles/ekran/DtBasvurularScreen.css'
import 'dayjs/locale/tr'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button, Checkbox, DatePicker, Popconfirm, Select } from 'antd'
import dayjs from 'dayjs'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { DtEtiket } from '../components/DtEtiket'
import { DtUyari } from '../components/DtUyari'
import type { Program } from '../data/tipler'
import { basvuruGuncelle, basvuruSil } from '../depo'
import { OKUMA_HATASI, useBasvurular, useBugun, useKatalog, usePlanYeri } from '../kancalar'
import { BASVURU_DURUM_ADI, DESTEKSIZ_ADI } from '../metinler'
import { BASVURU_DURUMLARI, type Basvuru, type BasvuruDegisikligi, type BasvuruDurumu } from '../motor/basvuru'
import { tarihGectiMi, tarihYaz } from '../motor/tazelik'

function BasvuruKarti({ basvuru, program, planId, bugun, hataGoster, silindi }: { basvuru: Basvuru; program: Program | undefined; planId: string; bugun: string; hataGoster: (m: string) => void; silindi: () => void }) {
  const id = `dt-basvuru-${basvuru.id}`
  /* İşaret hemen görünür. Kayıt bitince depodaki hal gelir ve bekleyen işaret temizlenir. */
  const [bekleyen, setBekleyen] = useState<Record<number, boolean>>({})
  useEffect(() => setBekleyen({}), [basvuru.guncelleme])
  const belgeler = basvuru.belgeler.map((b, i) => ({ ...b, hazir: bekleyen[i] ?? b.hazir }))
  const hazir = belgeler.filter((b) => b.hazir).length
  const degistir = (d: BasvuruDegisikligi) => {
    basvuruGuncelle(planId, basvuru.id, d, new Date().toISOString()).catch((error: unknown) => {
      console.error(error)
      hataGoster('Değişiklik kaydedilemedi. Önceki kayıt duruyor. Yeniden deneyin.')
    })
  }
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
            onChange={(v) => degistir({ sonTarih: v ? v.format('YYYY-MM-DD') : undefined })}
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
        <h4 id={`${id}-belge`}>Belgeler</h4>
        {basvuru.belgeler.length ? (
          <>
            <p>{belgeler.length} belgeden {hazir} tanesi hazır.</p>
            <ul className="dt-basvuru-belgeler">
              {belgeler.map((b, i) => (
                <li key={i}>
                  <Checkbox
                    checked={b.hazir}
                    onChange={(e) => {
                      setBekleyen((x) => ({ ...x, [i]: e.target.checked }))
                      degistir({ belge: { sira: i, hazir: e.target.checked } })
                    }}
                  >
                    {b.ad}
                  </Checkbox>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Kaynakta belge listesi yok. Kurumun sayfasını okuyun.</p>
        )}
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
          <EmptyState title="Henüz başvuru yok" text="Bir programın sayfasını açın. Sonra “Başvuru listeme ekle” düğmesine basın." action={<Button onClick={() => nav('/destek')}>Programlara bakın</Button>} />
        )
      ) : null}
    </div>
  )
}

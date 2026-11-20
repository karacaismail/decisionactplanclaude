import '@/styles/ekran/DtProgramlarScreen.css'
import { useMemo, useRef, useState } from 'react'
import type { InputRef } from 'antd'
import { useNavigate } from 'react-router'
import { Button, Input, Select } from 'antd'
import { PageHeader } from '@/components/PageHeader'
import { DtEskiBilgi } from '../components/DtEskiBilgi'
import { DtProgramKarti } from '../components/DtProgramKarti'
import { DtTerimler } from '../components/DtTerimler'
import { DtUyari } from '../components/DtUyari'
import { FAYDA_ADI } from '../data/faydalar'
import { KATEGORILER, type FaydaTuru, type Kategori } from '../data/tipler'
import { useBugun, useKatalog, usePlanYeri } from '../kancalar'
import { aramaMetni, DURUM_ADI, KATEGORI_ADI } from '../metinler'
import { gecerliDurum, tazelik, type GecerliDurum } from '../motor/tazelik'

const DURUM_SIRASI: readonly GecerliDurum[] = ['acik', 'surekli', 'yururlukte', 'cagri_bekleniyor', 'kapandi', 'kapali']

/** Destek programları listesi. Bu ekran plan istemez. */
export default function DtProgramlarScreen() {
  const programlar = useKatalog()
  const bugun = useBugun()
  const { planId } = usePlanYeri()
  const nav = useNavigate()
  const [arama, setArama] = useState('')
  const aramaKutusu = useRef<InputRef>(null)
  const [kurum, setKurum] = useState<string>()
  const [tur, setTur] = useState<Kategori>()
  const [fayda, setFayda] = useState<FaydaTuru>()
  const [durum, setDurum] = useState<GecerliDurum>()

  const kurumlar = useMemo(() => [...new Set(programlar.map((p) => p.kurum))].sort((a, b) => a.localeCompare(b, 'tr')), [programlar])
  const gorunen = useMemo(() => {
    const aranan = aramaMetni(arama.trim())
    return programlar.filter((p) => {
      if (kurum && p.kurum !== kurum) return false
      if (tur && p.kategori !== tur) return false
      if (fayda && !p.faydalar.includes(fayda)) return false
      if (durum && gecerliDurum(p, bugun) !== durum) return false
      if (!aranan) return true
      return aramaMetni([p.ad, p.kurum, p.ozet, p.destekTuru].join(' ')).includes(aranan)
    })
  }, [programlar, arama, kurum, tur, fayda, durum, bugun])
  const enEskiKontrol = programlar.filter((p) => tazelik(p.kaynak.asOf, bugun).eski).map((p) => p.kaynak.asOf).sort()[0]
  const suzuldu = Boolean(arama || kurum || tur || fayda || durum)
  const temizle = () => {
    setArama('')
    setKurum(undefined)
    setTur(undefined)
    setFayda(undefined)
    setDurum(undefined)
    aramaKutusu.current?.focus()
  }

  return (
    <div className="page dt-programlar">
      <PageHeader
        title="Destek ve teşvik programları"
        kicker="Destek ve teşvik"
        description="Kurumların destek programlarını burada bulun. Bu ekran için plan gerekmez."
        actions={
          <>
            <Button type="primary" onClick={() => nav('/destek/eslesme')}>Size uygun destekleri bulun</Button>
            {planId ? <Button onClick={() => nav('/destek/basvurular')}>Başvurularım</Button> : null}
          </>
        }
      />
      <DtUyari />
      {enEskiKontrol ? <DtEskiBilgi asOf={enEskiKontrol} /> : null}
      <div className="dt-programlar-giris">
        <p>Fayda etiketleri katalogdaki destek türünü açıklar.</p>
        <DtTerimler />
      </div>

      <section className="dt-programlar-filtre" aria-labelledby="dt-filtre-baslik">
        <h2 id="dt-filtre-baslik">Programları süzün</h2>
        <div className="dt-programlar-alanlar">
          <div className="dt-programlar-alan dt-programlar-alan-genis">
            <label htmlFor="dt-arama">Programlarda arayın</label>
            <Input ref={aramaKutusu} id="dt-arama" enterKeyHint="search" value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Örneğin KOSGEB ya da hibe" allowClear autoComplete="off" />
          </div>
          <div className="dt-programlar-alan">
            <label htmlFor="dt-kurum">Kurum</label>
            <Select<string> id="dt-kurum" value={kurum} onChange={setKurum} allowClear placeholder="Bütün kurumlar" showSearch optionFilterProp="label" notFoundContent="Eşleşen kurum yok." options={kurumlar.map((k) => ({ value: k, label: k }))} />
          </div>
          <div className="dt-programlar-alan">
            <label htmlFor="dt-tur">Destek türü</label>
            <Select<Kategori> id="dt-tur" value={tur} onChange={setTur} allowClear placeholder="Bütün türler" options={KATEGORILER.map((k) => ({ value: k, label: KATEGORI_ADI[k] }))} />
          </div>
          <div className="dt-programlar-alan">
            <label htmlFor="dt-fayda">Fayda türü</label>
            <Select<FaydaTuru> id="dt-fayda" value={fayda} onChange={setFayda} allowClear placeholder="Bütün faydalar" options={(Object.keys(FAYDA_ADI) as FaydaTuru[]).map((f) => ({ value: f, label: FAYDA_ADI[f] }))} />
          </div>
          <div className="dt-programlar-alan">
            <label htmlFor="dt-durum">Durum</label>
            <Select<GecerliDurum> id="dt-durum" value={durum} onChange={setDurum} allowClear placeholder="Bütün durumlar" options={DURUM_SIRASI.map((d) => ({ value: d, label: DURUM_ADI[d] }))} />
          </div>
        </div>
        {suzuldu ? <Button className="dt-programlar-temizle" onClick={temizle}>Süzmeyi temizleyin</Button> : null}
      </section>

      <section className="dt-programlar-sonuc" aria-labelledby="dt-liste-baslik">
        <h2 id="dt-liste-baslik">Programlar</h2>
        <p role="status" className="dt-programlar-sayi">{programlar.length} programdan {gorunen.length} tanesi görünüyor.</p>
        {gorunen.length ? (
          <ul className="dt-programlar-liste">
            {gorunen.map((p) => (
              <li key={p.id}>
                <DtProgramKarti program={p} bugun={bugun} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="dt-programlar-bos">Bu süzmeye uyan program yok. Süzmeyi temizleyip yeniden deneyin.</p>
        )}
      </section>
    </div>
  )
}

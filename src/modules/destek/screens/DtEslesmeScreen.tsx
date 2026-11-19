import '@/styles/ekran/DtEslesmeScreen.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button, Checkbox, InputNumber, Radio, Select } from 'antd'
import { PageHeader } from '@/components/PageHeader'
import { DtTerimler } from '../components/DtTerimler'
import { DtUyari } from '../components/DtUyari'
import type { Program } from '../data/tipler'
import { profilKaydet } from '../depo'
import { useBugun, useKatalog, useProfil, usePlanYeri } from '../kancalar'
import { AYLAR, IHRACAT_ADI, KURUCU_ADI, SORULAR } from '../metinler'
import { eslestirHepsi, sonrakiSorular, type Eslesme } from '../motor/eslestir'
import {
  BILMIYORUM, EN_ESKI_KURULUS_YILI, IHRACAT_DURUMLARI, ILLER, KURUCU_DURUMLARI, NACE_BOLUMLERI, profilDoluMu, sorulacaklar, SORU_SIRASI,
  type Alan, type DestekProfili, type IhracatDurumu, type KurucuDurumu, type NaceHarfi,
} from '../motor/profil'

type Mod = { tur: 'soru'; sorular: Alan[]; i: number } | { tur: 'sonuc' }

/** Bir sorunun taslak cevabı. Geçerli değilse undefined olur. */
type Taslak = DestekProfili[Alan] | undefined

const NACE_ADI = new Map<string, string>(NACE_BOLUMLERI.map((n) => [n.harf, `${n.harf}. ${n.ad}`]))

function cevapYaz(profil: DestekProfili, alan: Alan): string {
  const v = profil[alan]
  if (v === undefined) return 'Cevaplanmadı.'
  if (v === BILMIYORUM) return 'Bilmiyorum.'
  switch (alan) {
    case 'kurulus': {
      const k = profil.kurulus as { yil: number; ay?: number }
      return k.ay ? `${AYLAR[k.ay - 1]} ${k.yil}.` : `${k.yil}. Ayı bilinmiyor.`
    }
    case 'calisan':
      return `${String(v)} kişi.`
    case 'faaliyet':
      return `${(v as NaceHarfi[]).map((h) => NACE_ADI.get(h)).join(', ')}.`
    case 'ihracat':
      return `${IHRACAT_ADI[v as IhracatDurumu]}.`
    case 'kurucu':
      return (v as KurucuDurumu[]).length ? `${(v as KurucuDurumu[]).map((k) => KURUCU_ADI[k]).join(', ')}.` : 'Hiçbiri.'
    case 'kosgeb':
    case 'arge':
      return v === 'evet' ? 'Evet.' : 'Hayır.'
    default:
      return `${String(v)}.`
  }
}

function taslakGecerli(alan: Alan, t: Taslak): boolean {
  if (t === undefined) return false
  if (alan === 'faaliyet') return Array.isArray(t) && t.length > 0
  if (alan === 'calisan') return typeof t === 'number' && Number.isInteger(t) && t >= 0
  return true
}

/** Tek sorunun denetimi. Her soru ayrı ekranda gelir. */
function SoruAlani({ alan, taslak, setTaslak, buYil }: { alan: Alan; taslak: Taslak; setTaslak: (t: Taslak) => void; buYil: number }) {
  const yillar = useMemo(() => Array.from({ length: buYil - EN_ESKI_KURULUS_YILI + 1 }, (_, i) => buYil - i), [buYil])
  switch (alan) {
    case 'kurulus': {
      const k = (taslak && taslak !== BILMIYORUM ? taslak : {}) as { yil?: number; ay?: number }
      return (
        <div className="dt-eslesme-alanlar">
          <div className="dt-eslesme-alan">
            <label htmlFor="dt-soru-yil">Kuruluş yılı</label>
            <Select<number> id="dt-soru-yil" value={k.yil} placeholder="Yıl seçin" showSearch optionFilterProp="label" notFoundContent="Eşleşen yıl yok." options={yillar.map((y) => ({ value: y, label: String(y) }))} onChange={(yil) => setTaslak(k.ay ? { yil, ay: k.ay } : { yil })} />
          </div>
          <div className="dt-eslesme-alan">
            <label htmlFor="dt-soru-ay">Kuruluş ayı</label>
            <Select<number> id="dt-soru-ay" value={k.ay ?? 0} virtual={false} options={[{ value: 0, label: 'Ayı bilmiyorum' }, ...AYLAR.map((ad, i) => ({ value: i + 1, label: ad }))]} onChange={(ay) => setTaslak(k.yil ? (ay ? { yil: k.yil, ay } : { yil: k.yil }) : undefined)} disabled={!k.yil} />
          </div>
        </div>
      )
    }
    case 'calisan':
      return (
        <div className="dt-eslesme-alan">
          <label htmlFor="dt-soru-calisan">Sigortalı çalışan sayısı</label>
          <InputNumber<number> id="dt-soru-calisan" min={0} max={1_000_000} precision={0} inputMode="numeric" value={typeof taslak === 'number' ? taslak : null} onChange={(n) => setTaslak(n === null ? undefined : n)} />
        </div>
      )
    case 'faaliyet':
      return (
        <div className="dt-eslesme-alan">
          <label htmlFor="dt-soru-faaliyet">İş kolu</label>
          <Select<NaceHarfi[]> id="dt-soru-faaliyet" mode="multiple" virtual={false} placeholder="İş kolu seçin" showSearch optionFilterProp="label" notFoundContent="Eşleşen iş kolu yok." value={Array.isArray(taslak) ? (taslak as NaceHarfi[]) : []} options={NACE_BOLUMLERI.map((n) => ({ value: n.harf, label: `${n.harf}. ${n.ad}` }))} onChange={(v) => setTaslak(v.length ? v : undefined)} />
        </div>
      )
    case 'ihracat':
      return (
        <Radio.Group className="dt-eslesme-secenekler" aria-labelledby="dt-soru-baslik" value={taslak} onChange={(e) => setTaslak(e.target.value as IhracatDurumu)} options={IHRACAT_DURUMLARI.map((d) => ({ value: d, label: IHRACAT_ADI[d] }))} />
      )
    case 'kosgeb':
    case 'arge':
      return (
        <Radio.Group className="dt-eslesme-secenekler" aria-labelledby="dt-soru-baslik" value={taslak} onChange={(e) => setTaslak(e.target.value as 'evet' | 'hayir')} options={[{ value: 'evet', label: 'Evet' }, { value: 'hayir', label: 'Hayır' }]} />
      )
    case 'kurucu': {
      const secili = Array.isArray(taslak) ? (taslak as KurucuDurumu[]) : []
      return (
        <div className="dt-eslesme-secenekler" role="group" aria-labelledby="dt-soru-baslik">
          <Checkbox.Group className="dt-eslesme-secenekler" value={secili} onChange={(v) => setTaslak(v as KurucuDurumu[])} options={KURUCU_DURUMLARI.map((k) => ({ value: k, label: KURUCU_ADI[k] }))} />
          <Checkbox checked={Array.isArray(taslak) && secili.length === 0} onChange={(e) => setTaslak(e.target.checked ? [] : undefined)}>Hiçbiri</Checkbox>
        </div>
      )
    }
    case 'il':
      return (
        <div className="dt-eslesme-alan">
          <label htmlFor="dt-soru-il">İl</label>
          <Select<string> id="dt-soru-il" value={typeof taslak === 'string' && taslak !== BILMIYORUM ? taslak : undefined} placeholder="İl seçin" showSearch optionFilterProp="label" notFoundContent="Eşleşen il yok." options={ILLER.map((il) => ({ value: il, label: il }))} onChange={(il) => setTaslak(il)} />
        </div>
      )
  }
}

function Sihirbaz({ mod, profil, buYil, cevapla, geri }: { mod: Extract<Mod, { tur: 'soru' }>; profil: DestekProfili; buYil: number; cevapla: (alan: Alan, deger: DestekProfili[Alan]) => void; geri: () => void }) {
  const alan = mod.sorular[mod.i]
  const mevcut = profil[alan]
  const [taslak, setTaslak] = useState<Taslak>(mevcut === BILMIYORUM ? undefined : mevcut)
  const baslik = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (mod.i > 0) baslik.current?.focus()
  }, [mod.i])
  const son = mod.i === mod.sorular.length - 1
  const soru = SORULAR[alan]
  return (
    <section className="dt-eslesme-sihirbaz" aria-labelledby="dt-soru-baslik">
      <p role="status" className="dt-eslesme-ilerleme">Soru {mod.i + 1} / {mod.sorular.length}</p>
      <h2 id="dt-soru-baslik" ref={baslik} tabIndex={-1}>{soru.baslik}</h2>
      <p>{soru.aciklama}</p>
      <SoruAlani alan={alan} taslak={taslak} setTaslak={setTaslak} buYil={buYil} />
      <div className="dt-eslesme-eylemler">
        <Button type="primary" disabled={!taslakGecerli(alan, taslak)} onClick={() => cevapla(alan, taslak)}>{son ? 'Sonucu gösterin' : 'Devam'}</Button>
        <Button onClick={() => cevapla(alan, BILMIYORUM)}>Bilmiyorum</Button>
        {mod.i > 0 ? <Button type="text" onClick={geri}>Önceki soru</Button> : null}
      </div>
    </section>
  )
}

function SonucSatiri({ program, eslesme }: { program: Program; eslesme: Eslesme }) {
  return (
    <li className="dt-sonuc-satir">
      <Link className="dt-sonuc-ad" to={`/destek/${program.id}`}>{program.ad}</Link>
      <span className="dt-sonuc-kurum">{program.kurum}</span>
      {eslesme.sorulanlarTuttu ? (
        <>
          <span className="dt-sonuc-kurum">Tutan koşullar:</span>
          <ul className="dt-sonuc-nedenler">
            {eslesme.denetlenenKosullar.map((k) => <li key={k}>{k}</li>)}
          </ul>
        </>
      ) : eslesme.kuralVar && eslesme.nedenler.length ? (
        <ul className="dt-sonuc-nedenler">
          {eslesme.nedenler.map((n) => <li key={n}>{n}</li>)}
        </ul>
      ) : null}
    </li>
  )
}

function Grup({ sinif, baslik, aciklama, eslesmeler, programlar }: { sinif: string; baslik: string; aciklama: string; eslesmeler: Eslesme[]; programlar: Map<string, Program> }) {
  const id = `${sinif}-baslik`
  return (
    <section className={`dt-sonuc-grup ${sinif}`} aria-labelledby={id}>
      <h2 id={id}>{baslik} ({eslesmeler.length})</h2>
      <p>{aciklama}</p>
      {eslesmeler.length ? (
        <ul className="dt-sonuc-liste">
          {eslesmeler.map((e) => <SonucSatiri key={e.programId} program={programlar.get(e.programId)!} eslesme={e} />)}
        </ul>
      ) : null}
    </section>
  )
}

function Sonuclar({ profil, programlar, bugun, sor }: { profil: DestekProfili; programlar: readonly Program[]; bugun: string; sor: (sorular: Alan[]) => void }) {
  const gruplar = useMemo(() => eslestirHepsi(programlar, profil, bugun), [programlar, profil, bugun])
  const harita = useMemo(() => new Map(programlar.map((p) => [p.id, p])), [programlar])
  const sorular = sonrakiSorular([...gruplar.belki, ...gruplar.uygun])
  const tutan = gruplar.belki.filter((e) => e.sorulanlarTuttu)
  const bilgiEksik = gruplar.belki.filter((e) => e.kuralVar && !e.sorulanlarTuttu)
  const kuralsiz = gruplar.belki.filter((e) => !e.kuralVar)
  return (
    <>
      <p role="status" className="dt-sonuc-sayilar">Uygun: {gruplar.uygun.length}. Belki: {gruplar.belki.length}. Uygun değil: {gruplar.uygunDegil.length}.</p>
      <p className="dt-sonuc-not">Bu bir ön eşleşmedir. Uygulama yalnız sorduğu koşulları denetler. Kesin kararı kurum verir.</p>
      {sorular.length ? (
        <section className="dt-sonuc-netlestir" aria-labelledby="dt-netlestir-baslik">
          <h2 id="dt-netlestir-baslik">Sonucu netleştirin</h2>
          <p>Şu soruları cevaplarsanız sonuç netleşir:</p>
          <ul>
            {sorular.map((a) => <li key={a}>{SORULAR[a].kisa}</li>)}
          </ul>
          <Button type="primary" onClick={() => sor(sorulacaklar(profil, sorular))}>Bu soruları cevaplayın</Button>
        </section>
      ) : null}
      <Grup sinif="dt-sonuc-uygun" baslik="Uygun" aciklama="Uygulama bir programın bütün koşullarını denetleyemezse Uygun demez. Bu yüzden bu grup çoğu zaman boş kalır." eslesmeler={gruplar.uygun} programlar={harita} />
      <section className="dt-sonuc-grup dt-sonuc-belki" aria-labelledby="dt-sonuc-belki-baslik">
        <h2 id="dt-sonuc-belki-baslik">Belki ({gruplar.belki.length})</h2>
        <p>Bu programlarda bazı koşulları uygulama denetleyemiyor. Bu koşulları programın sayfasında okuyun.</p>
        {tutan.length ? (
          <>
            <h3>Sorduğumuz koşullar tutuyor ({tutan.length})</h3>
            <ul className="dt-sonuc-liste">
              {tutan.map((e) => <SonucSatiri key={e.programId} program={harita.get(e.programId)!} eslesme={e} />)}
            </ul>
          </>
        ) : null}
        {bilgiEksik.length ? (
          <>
            <h3>Bilgi eksik ({bilgiEksik.length})</h3>
            <ul className="dt-sonuc-liste">
              {bilgiEksik.map((e) => <SonucSatiri key={e.programId} program={harita.get(e.programId)!} eslesme={e} />)}
            </ul>
          </>
        ) : null}
        {kuralsiz.length ? (
          <>
            <h3>Koşulları kendiniz okuyun ({kuralsiz.length})</h3>
            <ul className="dt-sonuc-liste">
              {kuralsiz.map((e) => <SonucSatiri key={e.programId} program={harita.get(e.programId)!} eslesme={e} />)}
            </ul>
          </>
        ) : null}
      </section>
      <Grup sinif="dt-sonuc-uygun-degil" baslik="Uygun değil" aciklama="Bu programlarda en az bir koşul tutmuyor. Neden tutmadığı yazıyor." eslesmeler={gruplar.uygunDegil} programlar={harita} />
      <section className="dt-sonuc-cevaplar" aria-labelledby="dt-cevaplar-baslik">
        <h2 id="dt-cevaplar-baslik">Cevaplarınız</h2>
        <p>Cevaplarınız plan dosyasına yazılmaz. Bu cevaplar kararlarınızı eskitmez.</p>
        <dl>
          {SORU_SIRASI.map((a) => (
            <div key={a} className="dt-sonuc-cevap">
              <dt>{SORULAR[a].kisa}</dt>
              <dd>
                <span>{cevapYaz(profil, a)}</span>
                <Button type="link" aria-label={`${SORULAR[a].kisa} cevabını değiştirin`} onClick={() => sor([a])}>Değiştirin</Button>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  )
}

/** Plana uygun destekler. Uygulama karşılaştırır. Kararı kişi verir. Bu ekran plan istemez. */
export default function DtEslesmeScreen() {
  const { yer } = usePlanYeri()
  return <Eslesme key={yer} yer={yer} />
}

function Eslesme({ yer }: { yer: string }) {
  const programlar = useKatalog()
  const bugun = useBugun()
  const buYil = Number(bugun.slice(0, 4))
  const { profil: yuklenen } = useProfil(yer)
  const [profil, setProfil] = useState<DestekProfili>()
  const [mod, setMod] = useState<Mod>()
  const [hata, setHata] = useState<string>()

  useEffect(() => {
    if (!yuklenen || profil) return
    setProfil(yuklenen)
    setMod(profilDoluMu(yuklenen) ? { tur: 'sonuc' } : { tur: 'soru', sorular: sorulacaklar(yuklenen), i: 0 })
  }, [yuklenen, profil])

  const cevapla = (alan: Alan, deger: DestekProfili[Alan]) => {
    if (!profil || mod?.tur !== 'soru') return
    const sonraki = { ...profil, [alan]: deger }
    setProfil(sonraki)
    profilKaydet(yer, sonraki).catch((error: unknown) => {
      console.error(error)
      setHata('Cevabınız kaydedilemedi. Sayfayı yenileyip yeniden deneyin.')
    })
    setMod(mod.i + 1 < mod.sorular.length ? { ...mod, i: mod.i + 1 } : { tur: 'sonuc' })
  }

  return (
    <div className="page dt-eslesme">
      <PageHeader
        title="Size uygun destekler"
        kicker="Destek ve teşvik"
        description="Birkaç soruyu cevaplayın. Uygulama size uygun olabilecek programları gösterir. Bu bir ön eşleşmedir. Kesin kararı kurum verir."
      />
      <DtUyari />
      {hata ? <p className="dt-eslesme-hata" role="alert">{hata}</p> : null}
      {profil && mod?.tur === 'soru' ? (
        <Sihirbaz key={`${mod.sorular.join('-')}-${mod.i}`} mod={mod} profil={profil} buYil={buYil} cevapla={cevapla} geri={() => setMod({ ...mod, i: mod.i - 1 })} />
      ) : null}
      {profil && mod?.tur === 'sonuc' ? <Sonuclar profil={profil} programlar={programlar} bugun={bugun} sor={(sorular) => setMod({ tur: 'soru', sorular, i: 0 })} /> : null}
      <DtTerimler />
    </div>
  )
}

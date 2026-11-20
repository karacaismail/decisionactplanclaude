import '@/styles/ekran/DtEslesmeScreen.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button, Checkbox, InputNumber, Radio, Select } from 'antd'
import { PageHeader } from '@/components/PageHeader'
import { DtTerimler } from '../components/DtTerimler'
import { DtUyari } from '../components/DtUyari'
import type { Program } from '../data/tipler'
import { profilAlanKaydet, tercihKaydet } from '../depo'
import { DtEtiket } from '../components/DtEtiket'
import { OKUMA_HATASI, useBugun, useKatalog, useProfil, usePlanYeri } from '../kancalar'
import {
  AYLAR, BOS_SONUC_METNI, DURUM_ADI, IHRACAT_ADI, ISE_OZEL_YOK_METNI, ISLETME_TURU_ADI, KURUCU_ADI, KURULUS_DURUMU_ADI, OLCEK_ADI, SORULAR,
  TERCIH_HISSE, TERCIH_KREDI, TERCIHE_UYMUYOR,
} from '../metinler'
import { eslestirHepsi, netlestirmeSorulari, sonucNotu, tercihSirala, tercihUymuyor, type Eslesme, type EslesmeGruplari } from '../motor/eslestir'
import { gecerliDurum } from '../motor/tazelik'
import {
  akisiGuncelle, BILMIYORUM, EN_ESKI_KURULUS_YILI, IHRACAT_DURUMLARI, ILLER, ISLETME_TURLERI, KURUCU_DURUMLARI, KURULUS_DURUMLARI, NACE_BOLUMLERI, OLCEKLER,
  profilDoluMu, sorulacaklar, SORU_SIRASI, tarihSorulur,
  type Alan, type DestekProfili, type DestekTercihi, type IhracatDurumu, type IsletmeTuru, type KurucuDurumu, type KurulusDurumu, type NaceHarfi, type Olcek,
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
      return k.ay ? `${AYLAR[k.ay - 1]} ${k.yil}.` : `${k.yil} yılı. Ay bilinmiyor.`
    }
    case 'calisan':
      return `${String(v)} kişi.`
    case 'faaliyet':
      return `${(v as NaceHarfi[]).map((h) => NACE_ADI.get(h)).join(', ')}.`
    case 'ihracat':
      return `${IHRACAT_ADI[v as IhracatDurumu]}.`
    case 'kurulusDurumu':
      return `${KURULUS_DURUMU_ADI[v as KurulusDurumu]}.`
    case 'olcek':
      return `${OLCEK_ADI[v as Olcek]}.`
    case 'isletmeTuru':
      return `${ISLETME_TURU_ADI[v as IsletmeTuru]}.`
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
function SoruAlani({ alan, taslak, setTaslak, bugun }: { alan: Alan; taslak: Taslak; setTaslak: (t: Taslak) => void; bugun: string }) {
  const [buYil, buAy] = bugun.split('-').map(Number)
  const yillar = useMemo(() => Array.from({ length: buYil - EN_ESKI_KURULUS_YILI + 1 }, (_, i) => buYil - i), [buYil])
  switch (alan) {
    case 'kurulus': {
      const k = (taslak && taslak !== BILMIYORUM ? taslak : {}) as { yil?: number; ay?: number }
      return (
        <div className="dt-eslesme-alanlar">
          <div className="dt-eslesme-alan">
            <label htmlFor="dt-soru-yil">Kuruluş yılı</label>
            <Select<number> id="dt-soru-yil" value={k.yil} placeholder="Yıl seçin" showSearch optionFilterProp="label" notFoundContent="Eşleşen yıl yok." options={yillar.map((y) => ({ value: y, label: String(y) }))} onChange={(yil) => setTaslak(k.ay && (yil < buYil || k.ay <= buAy) ? { yil, ay: k.ay } : { yil })} />
          </div>
          <div className="dt-eslesme-alan">
            <label htmlFor="dt-soru-ay">Kuruluş ayı</label>
            <Select<number> id="dt-soru-ay" value={k.ay ?? 0} virtual={false} options={[{ value: 0, label: 'Ayı bilmiyorum' }, ...AYLAR.map((ad, i) => ({ value: i + 1, label: ad, disabled: k.yil === buYil && i + 1 > buAy }))]} onChange={(ay) => setTaslak(k.yil ? (ay ? { yil: k.yil, ay } : { yil: k.yil }) : undefined)} disabled={!k.yil} />
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
    case 'kurulusDurumu':
      return (
        <Radio.Group className="dt-eslesme-secenekler" aria-labelledby="dt-soru-baslik" value={taslak} onChange={(e) => setTaslak(e.target.value as KurulusDurumu)} options={KURULUS_DURUMLARI.map((d) => ({ value: d, label: KURULUS_DURUMU_ADI[d] }))} />
      )
    case 'olcek':
      return (
        <Radio.Group className="dt-eslesme-secenekler" aria-labelledby="dt-soru-baslik" value={taslak} onChange={(e) => setTaslak(e.target.value as Olcek)} options={OLCEKLER.map((o) => ({ value: o, label: OLCEK_ADI[o] }))} />
      )
    case 'isletmeTuru':
      return (
        <Radio.Group className="dt-eslesme-secenekler" aria-labelledby="dt-soru-baslik" value={taslak} onChange={(e) => setTaslak(e.target.value as IsletmeTuru)} options={ISLETME_TURLERI.map((t) => ({ value: t, label: ISLETME_TURU_ADI[t] }))} />
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

function Sihirbaz({ mod, profil, bugun, odakla, cevapla, geri }: { mod: Extract<Mod, { tur: 'soru' }>; profil: DestekProfili; bugun: string; odakla: boolean; cevapla: (alan: Alan, deger: DestekProfili[Alan]) => void; geri: () => void }) {
  const alan = mod.sorular[mod.i]
  const mevcut = profil[alan]
  const [taslak, setTaslak] = useState<Taslak>(mevcut === BILMIYORUM ? undefined : mevcut)
  const baslik = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (odakla) baslik.current?.focus()
  }, [odakla])
  const son = mod.i === mod.sorular.length - 1
  const soru = SORULAR[alan]
  return (
    <section className="dt-eslesme-sihirbaz" aria-labelledby="dt-soru-baslik">
      <h2 id="dt-soru-baslik" ref={baslik} tabIndex={-1}>{soru.baslik}</h2>
      <p>{soru.aciklama}</p>
      <SoruAlani alan={alan} taslak={taslak} setTaslak={setTaslak} bugun={bugun} />
      <div className="dt-eslesme-eylemler">
        <Button type="primary" disabled={!taslakGecerli(alan, taslak)} onClick={() => cevapla(alan, taslak)}>{son ? 'Sonucu gösterin' : 'Devam'}</Button>
        <Button onClick={() => cevapla(alan, BILMIYORUM)}>Bilmiyorum</Button>
        {mod.i > 0 ? <Button type="text" onClick={geri}>Önceki soru</Button> : null}
      </div>
    </section>
  )
}

function SonucSatiri({ program, eslesme, bugun, tercih }: { program: Program; eslesme: Eslesme; bugun: string; tercih?: DestekTercihi }) {
  const durum = gecerliDurum(program, bugun)
  const kapali = durum === 'kapandi' || durum === 'kapali'
  return (
    <li className="dt-sonuc-satir">
      <Link className="dt-sonuc-ad" to={`/destek/${program.id}`}>{program.ad}</Link>
      <span className="dt-sonuc-kurum">{program.kurum}</span>
      {kapali ? <span><DtEtiket ton="kapali">{DURUM_ADI[durum]}</DtEtiket></span> : null}
      {tercihUymuyor(program, tercih) ? <span><DtEtiket>{TERCIHE_UYMUYOR}</DtEtiket></span> : null}
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

function Grup({ sinif, baslik, aciklama, eslesmeler, programlar, bugun, tercih }: { sinif: string; baslik: string; aciklama: string; eslesmeler: Eslesme[]; programlar: Map<string, Program>; bugun: string; tercih?: DestekTercihi }) {
  const id = `${sinif}-baslik`
  return (
    <section className={`dt-sonuc-grup ${sinif}`} aria-labelledby={id}>
      <h2 id={id}>{baslik} ({eslesmeler.length})</h2>
      <p>{aciklama}</p>
      {eslesmeler.length ? (
        <ul className="dt-sonuc-liste">
          {tercihSirala(eslesmeler, programlar, tercih).map((e) => <SonucSatiri key={e.programId} program={programlar.get(e.programId)!} eslesme={e} bugun={bugun} tercih={tercih} />)}
        </ul>
      ) : null}
    </section>
  )
}

/** Üçüncü katman. Süzgeç hiçbir programı "Uygun değil" yapmaz. Yalnız sırayı ve etiketi değiştirir. */
function TercihSuzgeci({ tercih, degistir }: { tercih?: DestekTercihi; degistir: (t: DestekTercihi) => void }) {
  return (
    <section className="dt-sonuc-tercih" aria-labelledby="dt-tercih-baslik">
      <h2 id="dt-tercih-baslik">Tercihleriniz</h2>
      <p>Tercih bir programı listeden çıkarmaz. Tercihe uymayan program kendi grubunun sonuna geçer.</p>
      <div className="dt-eslesme-secenekler">
        <Checkbox checked={Boolean(tercih?.krediIstemiyorum)} onChange={(e) => degistir({ ...tercih, krediIstemiyorum: e.target.checked })}>{TERCIH_KREDI}</Checkbox>
        <Checkbox checked={Boolean(tercih?.hisseIstemiyorum)} onChange={(e) => degistir({ ...tercih, hisseIstemiyorum: e.target.checked })}>{TERCIH_HISSE}</Checkbox>
      </div>
    </section>
  )
}

function Sonuclar({ profil, programlar, gruplar, bugun, odakla, sor, tercihDegistir }: { profil: DestekProfili; programlar: readonly Program[]; gruplar: EslesmeGruplari; bugun: string; odakla: boolean; sor: (sorular: Alan[]) => void; tercihDegistir: (t: DestekTercihi) => void }) {
  const baslik = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (odakla) baslik.current?.focus()
  }, [odakla])
  const harita = useMemo(() => new Map(programlar.map((p) => [p.id, p])), [programlar])
  const sorular = netlestirmeSorulari(gruplar, profil)
  const not = sonucNotu(gruplar, profil)
  const tercih = profil.tercih
  const sirala = (liste: Eslesme[]) => tercihSirala(liste, harita, tercih)
  const tutan = sirala(gruplar.belki.filter((e) => e.sorulanlarTuttu))
  const bilgiEksik = sirala(gruplar.belki.filter((e) => e.kuralVar && !e.sorulanlarTuttu))
  const kuralsiz = sirala(gruplar.belki.filter((e) => !e.kuralVar))
  const satir = (e: Eslesme) => <SonucSatiri key={e.programId} program={harita.get(e.programId)!} eslesme={e} bugun={bugun} tercih={tercih} />
  return (
    <>
      <h2 className="dt-sonuc-baslik" ref={baslik} tabIndex={-1}>Sonuçlar</h2>
      <p className="dt-sonuc-not">Bu bir ön eşleşmedir. Uygulama yalnız sorduğu koşulları denetler. Kesin kararı kurum verir.</p>
      {not ? (
        <section className="dt-sonuc-bilgi" aria-labelledby="dt-sonuc-bilgi-baslik">
          <h2 id="dt-sonuc-bilgi-baslik">{not === 'bos' ? 'Eşleşen program yok' : 'İşinize özel program yok'}</h2>
          <p>{not === 'bos' ? BOS_SONUC_METNI : ISE_OZEL_YOK_METNI}</p>
        </section>
      ) : null}
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
      <TercihSuzgeci tercih={tercih} degistir={tercihDegistir} />
      <Grup sinif="dt-sonuc-uygun" baslik="Uygun" aciklama="Uygulama bir programın bütün koşullarını denetleyemezse “Uygun” demez. Bu sürümde hiçbir programın bütün koşulları denetlenmiyor. Bu yüzden bu grup boş kalır." eslesmeler={gruplar.uygun} programlar={harita} bugun={bugun} tercih={tercih} />
      <section className="dt-sonuc-grup dt-sonuc-belki" aria-labelledby="dt-sonuc-belki-baslik">
        <h2 id="dt-sonuc-belki-baslik">Belki ({gruplar.belki.length})</h2>
        <p>Bu programlarda bazı koşulları uygulama denetleyemiyor. Bu koşulları programın sayfasında okuyun.</p>
        {tutan.length ? (
          <>
            <h3>Sorduğumuz koşullar tutuyor ({tutan.length})</h3>
            <ul className="dt-sonuc-liste">
              {tutan.map(satir)}
            </ul>
          </>
        ) : null}
        {bilgiEksik.length ? (
          <>
            <h3>Bilgi eksik ya da sonuç kesin değil ({bilgiEksik.length})</h3>
            <ul className="dt-sonuc-liste">
              {bilgiEksik.map(satir)}
            </ul>
          </>
        ) : null}
        {kuralsiz.length ? (
          <>
            <h3>Koşulları kendiniz okuyun ({kuralsiz.length})</h3>
            <ul className="dt-sonuc-liste">
              {kuralsiz.map(satir)}
            </ul>
          </>
        ) : null}
      </section>
      <Grup sinif="dt-sonuc-uygun-degil" baslik="Uygun değil" aciklama="Bu programlarda en az bir koşul tutmuyor. Tutmayan koşul her programın altında yazıyor." eslesmeler={gruplar.uygunDegil} programlar={harita} bugun={bugun} tercih={tercih} />
      <section className="dt-sonuc-cevaplar" aria-labelledby="dt-cevaplar-baslik">
        <h2 id="dt-cevaplar-baslik">Cevaplarınız</h2>
        <p>Cevaplarınız plan dosyasına yazılmaz. Bu cevaplar kararlarınızı eskitmez.</p>
        <dl>
          {SORU_SIRASI.filter((a) => a !== 'kurulus' || tarihSorulur(profil)).map((a) => (
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
  const { profil: yuklenen, hata: okumaHatasi } = useProfil(yer)
  const [profil, setProfil] = useState<DestekProfili>()
  const [mod, setMod] = useState<Mod>()
  /* Kişi bir düğmeye basınca odak yeni ekranın başlığına taşınır. İlk açılışta odak yerinde kalır. */
  const [odakla, setOdakla] = useState(false)
  const [hata, setHata] = useState<string>()

  useEffect(() => {
    if (!yuklenen) return
    /* Başka sekme profili değiştirirse ekran son hali kullanır. */
    setProfil(yuklenen)
    setMod((m) => m ?? (profilDoluMu(yuklenen) ? { tur: 'sonuc' } : { tur: 'soru', sorular: sorulacaklar(yuklenen), i: 0 }))
  }, [yuklenen])

  const gruplar = useMemo(() => (profil ? eslestirHepsi(programlar, profil, bugun) : undefined), [programlar, profil, bugun])

  const git = (sonraki: Mod) => {
    setOdakla(true)
    setMod(sonraki)
  }

  const cevapla = (alan: Alan, deger: DestekProfili[Alan]) => {
    if (!profil || mod?.tur !== 'soru') return
    setProfil({ ...profil, [alan]: deger })
    profilAlanKaydet(yer, alan, deger, bugun).catch((error: unknown) => {
      console.error(error)
      setHata('Cevabınız kaydedilemedi. Önceki cevaplarınız duruyor. Sayfayı yenileyip yeniden deneyin.')
    })
    /* "Henüz kurulmadı" cevabından sonra kuruluş tarihi sorulmaz. "Kuruldu" cevabından sonra tarih sorulur. */
    const sorular = akisiGuncelle(mod.sorular, mod.i, { ...profil, [alan]: deger })
    git(mod.i + 1 < sorular.length ? { ...mod, sorular, i: mod.i + 1 } : { tur: 'sonuc' })
  }

  const tercihDegistir = (tercih: DestekTercihi) => {
    if (!profil) return
    setProfil({ ...profil, tercih })
    tercihKaydet(yer, tercih, bugun).catch((error: unknown) => {
      console.error(error)
      setHata('Tercihiniz kaydedilemedi. Önceki cevaplarınız duruyor. Sayfayı yenileyip yeniden deneyin.')
    })
  }

  const durumMetni = mod?.tur === 'soru'
    ? `Soru ${mod.i + 1}. Toplam ${mod.sorular.length} soru var.`
    : gruplar ? `Uygun: ${gruplar.uygun.length}. Belki: ${gruplar.belki.length}. Uygun değil: ${gruplar.uygunDegil.length}.` : ''

  return (
    <div className="page dt-eslesme">
      <PageHeader
        title="Size uygun destekler"
        kicker="Destek ve teşvik"
        description="Birkaç soruyu cevaplayın. Uygulama size uygun olabilecek programları gösterir. Bu bir ön eşleşmedir. Kesin kararı kurum verir."
      />
      <DtUyari />
      {okumaHatasi ? <p className="dt-eslesme-hata" role="alert">{OKUMA_HATASI}</p> : null}
      {hata ? <p className="dt-eslesme-hata" role="alert">{hata}</p> : null}
      <p role="status" className="dt-eslesme-durum">{durumMetni}</p>
      {profil && mod?.tur === 'soru' ? (
        <Sihirbaz key={`${mod.sorular.join('-')}-${mod.i}`} mod={mod} profil={profil} bugun={bugun} odakla={odakla} cevapla={cevapla} geri={() => git({ ...mod, i: mod.i - 1 })} />
      ) : null}
      {profil && gruplar && mod?.tur === 'sonuc' ? <Sonuclar profil={profil} programlar={programlar} gruplar={gruplar} bugun={bugun} odakla={odakla} sor={(sorular) => git({ tur: 'soru', sorular, i: 0 })} tercihDegistir={tercihDegistir} /> : null}
      <DtTerimler />
    </div>
  )
}

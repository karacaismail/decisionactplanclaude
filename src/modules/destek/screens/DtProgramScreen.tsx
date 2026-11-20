import '@/styles/ekran/DtProgramScreen.css'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Button } from 'antd'
import { ArrowSquareOut, CaretLeft } from '@phosphor-icons/react'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { DtBasvuruEkle } from '../components/DtBasvuruEkle'
import { DtEskiBilgi } from '../components/DtEskiBilgi'
import { DtEtiket } from '../components/DtEtiket'
import { DtFaydalar } from '../components/DtFaydalar'
import { DtKurumSorulari } from '../components/DtKurumSorulari'
import { DtTerimler } from '../components/DtTerimler'
import { DtUyari } from '../components/DtUyari'
import type { Program } from '../data/tipler'
import { useBugun, useKatalog, useProfil, usePlanYeri } from '../kancalar'
import { DURUM_ADI, KATEGORI_ADI, KOMBINASYON_METNI, SONUC_ADI, TAVAN_TURU_ADI } from '../metinler'
import { eslestir } from '../motor/eslestir'
import { BILINMEYEN_ILISKI, iliskiBul } from '../motor/kombinasyon'
import { profilDoluMu } from '../motor/profil'
import { alanDurumu, alanMetni, eskiMetniGoster, gecerliDurum, tarihGectiMi, tarihYaz, tazelik } from '../motor/tazelik'

const TL = new Intl.NumberFormat('tr-TR')

function Bolum({ no, baslik, children }: { no: number; baslik: string; children: ReactNode }) {
  const id = `dt-bolum-${no}`
  return (
    <section className="dt-program-bolum" aria-labelledby={id}>
      <h2 id={id}>{no}. {baslik}</h2>
      {children}
    </section>
  )
}

function Liste({ maddeler, bos, metin = (m) => m }: { maddeler: readonly string[]; bos: string; metin?: (m: string) => string }) {
  if (!maddeler.length) return <p>{bos}</p>
  return (
    <ul className="dt-program-liste">
      {maddeler.map((m) => <li key={m}>{metin(m)}</li>)}
    </ul>
  )
}

function Tutar({ program, bugun }: { program: Program; bugun: string }) {
  const { metin, tavanTL, tavanTuru } = program.tutar
  return (
    <>
      <p>{alanMetni(metin, bugun, (value) => value)}</p>
      {tavanTuru !== 'yok' && tavanTuru !== 'oransal' ? (
        <p>{TAVAN_TURU_ADI[tavanTuru]}: {alanMetni(tavanTL, bugun, (value) => `${TL.format(value)} TL`)}</p>
      ) : null}
      {alanDurumu(metin, bugun) === 'kaynakli' ? (
        <p className="dt-program-kaynak">Kaynak: {program.kaynak.ad}. Son kontrol: {tarihYaz(metin.asOf)}</p>
      ) : null}
    </>
  )
}

function Sureler({ program, bugun }: { program: Program; bugun: string }) {
  const { degerlendirme, ilkOdeme } = program.sure
  const bilinmiyor = 'Süre bilinmiyor. Kuruma sorun.'
  const ayni = [degerlendirme, ilkOdeme].every((fact) => alanDurumu(fact, bugun) === 'bilinmiyor')
  return (
    <>
      {ayni ? <p>{bilinmiyor}</p> : (
        <>
          <p>Değerlendirme: {alanMetni(degerlendirme, bugun, (value) => value, bilinmiyor)}</p>
          <p>İlk ödeme: {alanMetni(ilkOdeme, bugun, (value) => value, bilinmiyor)}</p>
        </>
      )}
      <p>Ödeme biçimi: {alanMetni(program.odemeBicimi, bugun, (value) => value)}</p>
    </>
  )
}

function OnEslesme({ program, bugun }: { program: Program; bugun: string }) {
  const { yer } = usePlanYeri()
  const { profil } = useProfil(yer)
  if (!profil) return null
  if (!profilDoluMu(profil)) {
    return (
      <section className="dt-program-eslesme" aria-labelledby="dt-eslesme-baslik">
        <h2 id="dt-eslesme-baslik">Size uygun mu?</h2>
        <p>Birkaç soruyu cevaplayın. Uygulama size uygun olabilecek programları gösterir.</p>
        <Link className="dt-program-baglanti" to="/destek/eslesme">Soruları cevaplayın</Link>
      </section>
    )
  }
  const e = eslestir(program, profil, bugun)
  return (
    <section className="dt-program-eslesme" aria-labelledby="dt-eslesme-baslik">
      <h2 id="dt-eslesme-baslik">Ön eşleşme sonucu: {SONUC_ADI[e.sonuc]}</h2>
      <p>Bu bir tahmindir. Kesin kararı kurum verir.</p>
      {e.nedenler.length ? <Liste maddeler={e.nedenler} bos="" /> : null}
      {e.sonuc === 'uygun' ? <p>Sorduğumuz koşulları karşılıyorsunuz. Öteki koşulları aşağıda okuyun.</p> : null}
      <Link className="dt-program-baglanti" to="/destek/eslesme">Bütün sonuçları görün</Link>
    </section>
  )
}

function BirlikteKullanma({ program, programlar }: { program: Program; programlar: readonly Program[] }) {
  return (
    <details className="dt-program-ciftler">
      <summary>Program çiftlerini görün</summary>
      <ul className="dt-program-birlikte-liste">
        {programlar.filter((p) => p.id !== program.id).map((diger) => {
          const kural = iliskiBul(program, diger)
          return (
            <li key={diger.id}>
              <Link className="dt-program-baglanti" to={`/destek/${diger.id}`}>{diger.ad}</Link>
              {kural?.iliski.state === 'kaynakli' ? (
                <>
                  <p>{KOMBINASYON_METNI[kural.iliski.value].aciklama}</p>
                  <a className="dt-program-baglanti" href={kural.iliski.sourceUrl} target="_blank" rel="noopener noreferrer">İlişkinin kaynağını açın</a>
                </>
              ) : <p>{BILINMEYEN_ILISKI}</p>}
            </li>
          )
        })}
      </ul>
    </details>
  )
}

/** Tek programın ekranı. Bu ekran plan istemez. Başvuru eklemek plan ister. */
export default function DtProgramScreen() {
  const { programId } = useParams()
  const programlar = useKatalog()
  const bugun = useBugun()
  const nav = useNavigate()
  const program = programlar.find((p) => p.id === programId)

  if (!program) {
    return (
      <div className="page dt-program">
        <PageHeader title="Destek programı" kicker="Destek ve teşvik" description="Bu adreste bir program yok. Program listesinden seçin." />
        <DtUyari />
        <EmptyState title="Bu program bulunamadı" text="Program adı değişmiş ya da listeden çıkmış olabilir." action={<Button onClick={() => nav('/destek')}>Programlara dönün</Button>} />
      </div>
    )
  }

  const eski = tazelik(program.kaynak.asOf, bugun).eski
  const metin = (m: string) => eskiMetniGoster(m, program.kaynak, bugun)
  const durum = gecerliDurum(program, bugun)
  return (
    <div className="page dt-program">
      <Link className="dt-program-geri" to="/destek">
        <CaretLeft aria-hidden className="dt-program-ikon" />
        Bütün programlar
      </Link>
      <PageHeader title={metin(program.ad)} kicker="Destek programı" description={metin(program.ozet)} />
      <div className="dt-program-ust">
        <p className="dt-program-kurum">Kurum: {program.kurum}</p>
        <div className="dt-program-etiketler">
          <DtEtiket>{KATEGORI_ADI[program.kategori]}</DtEtiket>
          <DtEtiket ton={durum === 'kapandi' || durum === 'kapali' ? 'kapali' : 'notr'}>{DURUM_ADI[durum]}</DtEtiket>
          {eski ? <DtEtiket ton="uyari">Eski bilgi</DtEtiket> : null}
        </div>
        <p className="dt-program-kontrol">Son kontrol: {tarihYaz(program.kaynak.asOf)}</p>
      </div>
      <DtFaydalar program={program} bugun={bugun} />
      <DtUyari />
      {eski ? <DtEskiBilgi asOf={program.kaynak.asOf} /> : null}
      <OnEslesme program={program} bugun={bugun} />

      <div className="dt-program-bolumler">
        <Bolum no={1} baslik="Kim alabilir?">
          <Liste maddeler={program.kosullar} metin={metin} bos="Kaynakta koşul yazmıyor. Kurumun sayfasını okuyun." />
        </Bolum>
        <Bolum no={2} baslik="Neyi öder?">
          <p>Destek türü: {metin(program.destekTuru)}</p>
          <Liste maddeler={program.uygunGider} metin={metin} bos="Kaynakta gider listesi yok. Kurumun sayfasını okuyun." />
          <Link className="dt-program-baglanti" to="/destek/giderler">Giderden programa bakın</Link>
          {program.haricGider.length ? (
            <>
              <h3>Kapsamın dışında kalanlar</h3>
              <Liste maddeler={program.haricGider} metin={metin} bos="" />
            </>
          ) : null}
        </Bolum>
        <Bolum no={3} baslik="Ne kadar?">
          <Tutar program={program} bugun={bugun} />
        </Bolum>
        <Bolum no={4} baslik="Son tarih ne zaman?">
          <p>Durum: {DURUM_ADI[durum]}.</p>
          {program.tarihler.length ? (
            <ul className="dt-program-liste">
              {program.tarihler.map((t) => (
                <li key={t.ad}>
                  {metin(t.ad)}:{' '}
                  {t.tarih.state === 'kaynakli' && alanDurumu(t.tarih, bugun) === 'kaynakli' ? (
                    <>
                      {tarihYaz(t.tarih.value)}
                      {tarihGectiMi(t.tarih.value, bugun) ? <> <DtEtiket ton="kapali">Geçti</DtEtiket></> : null}
                    </>
                  ) : alanMetni(t.tarih, bugun, tarihYaz)}
                </li>
              ))}
            </ul>
          ) : (
            <p>Kaynakta tarih yok. Güncel tarihi kurumun sayfasında okuyun.</p>
          )}
          <Sureler program={program} bugun={bugun} />
        </Bolum>
        <Bolum no={5} baslik="Resmî sayfa nerede?">
          <p>Başvuru yolu: {metin(program.kanal)}</p>
          <p className="dt-program-kaynak">Kaynak: {metin(program.kaynak.ad)}</p>
          <a className="dt-program-dis" href={program.kaynak.url} target="_blank" rel="noopener noreferrer">
            Kurumun sayfasını açın
            <ArrowSquareOut aria-hidden className="dt-program-ikon" />
            <span className="dt-gizli"> Yeni sekmede açılır.</span>
          </a>
        </Bolum>
        <Bolum no={6} baslik="Hangi belgeler gerekir?">
          <Liste maddeler={program.belgeler} metin={metin} bos="Kaynakta belge listesi yok. Kurumun sayfasını okuyun." />
          <Link className="dt-program-baglanti" to="/destek/belgeler">Belge ve kanıt listesini açın</Link>
        </Bolum>
        <Bolum no={7} baslik="Bu programla birlikte kullanma">
          <BirlikteKullanma program={program} programlar={programlar} />
        </Bolum>
      </div>

      <DtBasvuruEkle key={program.id} program={program} />
      <DtKurumSorulari />
      <DtTerimler />
    </div>
  )
}

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
import { DtTerimler } from '../components/DtTerimler'
import { DtUyari } from '../components/DtUyari'
import type { Program } from '../data/tipler'
import { useBugun, useKatalog, useProfil, usePlanYeri } from '../kancalar'
import { DURUM_ADI, KATEGORI_ADI, SONUC_ADI, TAVAN_TURU_ADI, TUTARI_OKUYUN } from '../metinler'
import { eslestir } from '../motor/eslestir'
import { profilDoluMu } from '../motor/profil'
import { gecerliDurum, tarihGectiMi, tarihYaz, tazelik, tutarlariGizle } from '../motor/tazelik'

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

function Liste({ maddeler, bos }: { maddeler: readonly string[]; bos: string }) {
  if (!maddeler.length) return <p>{bos}</p>
  return (
    <ul className="dt-program-liste">
      {maddeler.map((m) => <li key={m}>{m}</li>)}
    </ul>
  )
}

function Tutar({ program, eski }: { program: Program; eski: boolean }) {
  const { metin, tavanTL, tavanTuru } = program.tutar
  if (eski) {
    return (
      <>
        <p className="dt-program-vurgu">{TUTARI_OKUYUN}</p>
        <p>Bu bilgi 90 günden eski. Tutar değişmiş olabilir. Bu yüzden tutarı gizledik.</p>
      </>
    )
  }
  if (metin.state !== 'kaynakli') return <p className="dt-program-vurgu">Tutar bilinmiyor. Kurumun sayfasına bakın.</p>
  return (
    <>
      <p>{metin.value}</p>
      {tavanTL.state === 'kaynakli' ? <p>{TAVAN_TURU_ADI[tavanTuru]}: {TL.format(tavanTL.value)} TL</p> : null}
      <p className="dt-program-kaynak">Kaynak: {program.kaynak.ad}. Son kontrol: {tarihYaz(metin.asOf)}</p>
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
        <EmptyState title="Bu program bulunamadı." text="Program adı değişmiş ya da listeden çıkmış olabilir." actions={<Button onClick={() => nav('/destek')}>Programlara dönün</Button>} />
      </div>
    )
  }

  const eski = tazelik(program.kaynak.asOf, bugun).eski
  const metin = (m: string) => (eski ? tutarlariGizle(m) : m)
  const durum = gecerliDurum(program, bugun)
  return (
    <div className="page dt-program">
      <Link className="dt-program-geri" to="/destek">
        <CaretLeft aria-hidden className="dt-program-ikon" />
        Bütün programlar
      </Link>
      <PageHeader title={program.ad} kicker="Destek programı" description={program.ozet} />
      <div className="dt-program-ust">
        <p className="dt-program-kurum">Kurum: {program.kurum}</p>
        <div className="dt-program-etiketler">
          <DtEtiket>{KATEGORI_ADI[program.kategori]}</DtEtiket>
          <DtEtiket ton={durum === 'kapandi' || durum === 'kapali' ? 'kapali' : 'notr'}>{DURUM_ADI[durum]}</DtEtiket>
          {eski ? <DtEtiket ton="uyari">Eski bilgi</DtEtiket> : null}
        </div>
        <p className="dt-program-kontrol">Son kontrol: {tarihYaz(program.kaynak.asOf)}</p>
      </div>
      <DtUyari />
      {eski ? <DtEskiBilgi asOf={program.kaynak.asOf} /> : null}
      <OnEslesme program={program} bugun={bugun} />

      <div className="dt-program-bolumler">
        <Bolum no={1} baslik="Kim alabilir?">
          <Liste maddeler={program.kosullar.map(metin)} bos="Kaynakta koşul yazmıyor. Kurumun sayfasını okuyun." />
        </Bolum>
        <Bolum no={2} baslik="Neyi öder?">
          <p>Destek türü: {metin(program.destekTuru)}</p>
          <Liste maddeler={program.uygunGider.map(metin)} bos="Kaynakta gider listesi yok. Kurumun sayfasını okuyun." />
          {program.haricGider.length ? (
            <>
              <h3>Kapsamın dışında kalanlar</h3>
              <Liste maddeler={program.haricGider.map(metin)} bos="" />
            </>
          ) : null}
        </Bolum>
        <Bolum no={3} baslik="Ne kadar?">
          <Tutar program={program} eski={eski} />
        </Bolum>
        <Bolum no={4} baslik="Son tarih ne zaman?">
          <p>Durum: {DURUM_ADI[durum]}.</p>
          {program.tarihler.length ? (
            <ul className="dt-program-liste">
              {program.tarihler.map((t) => (
                <li key={t.ad}>
                  {t.ad}:{' '}
                  {t.tarih.state === 'kaynakli' ? (
                    <>
                      {tarihYaz(t.tarih.value)}
                      {tarihGectiMi(t.tarih.value, bugun) ? <> <DtEtiket ton="kapali">Geçti</DtEtiket></> : null}
                    </>
                  ) : 'Tarih bilinmiyor. Kurumun sayfasına bakın.'}
                </li>
              ))}
            </ul>
          ) : (
            <p>Kaynakta tarih yok. Güncel tarihi kurumun sayfasında okuyun.</p>
          )}
        </Bolum>
        <Bolum no={5} baslik="Resmî sayfa nerede?">
          <p>Başvuru yolu: {program.kanal}</p>
          <p className="dt-program-kaynak">Kaynak: {program.kaynak.ad}</p>
          <a className="dt-program-dis" href={program.kaynak.url} target="_blank" rel="noopener noreferrer">
            Kurumun sayfasını açın
            <ArrowSquareOut aria-hidden className="dt-program-ikon" />
            <span className="dt-gizli"> Yeni sekmede açılır.</span>
          </a>
        </Bolum>
        <Bolum no={6} baslik="Hangi belgeler gerekir?">
          <Liste maddeler={program.belgeler.map(metin)} bos="Kaynakta belge listesi yok. Kurumun sayfasını okuyun." />
        </Bolum>
      </div>

      <DtBasvuruEkle program={program} />
      <DtTerimler />
    </div>
  )
}

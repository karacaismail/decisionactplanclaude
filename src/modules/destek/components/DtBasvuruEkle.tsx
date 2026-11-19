import '@/styles/bilesen/DtBasvuruEkle.css'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button } from 'antd'
import type { Program } from '../data/tipler'
import { basvuruEkle } from '../depo'
import { useBasvurular, usePlanYeri } from '../kancalar'
import { DESTEKSIZ_ADI } from '../metinler'
import { DESTEKSIZ_CEVAPLARI, type DesteksizCevap } from '../motor/basvuru'

type Adim = 'bekliyor' | 'soru' | 'eklendi'

/**
 * Programı başvuru listesine ekler. Başvuru listesi plan ister.
 * Eklemeden önce kişi bir soruyu cevaplar: "Bu işi destek olmadan da yapar mıydık?"
 * Cevap başvuruyla birlikte saklanır. Strateji destek için değiştirilmez.
 */
export function DtBasvuruEkle({ program }: { program: Program }) {
  const { planId } = usePlanYeri()
  const { basvurular } = useBasvurular(planId)
  const [adim, setAdim] = useState<Adim>('bekliyor')
  const [hata, setHata] = useState<string>()
  const [calisiyor, setCalisiyor] = useState(false)
  const soruBaslik = useRef<HTMLHeadingElement>(null)
  const sonucMetni = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (adim === 'soru') soruBaslik.current?.focus()
    if (adim === 'eklendi') sonucMetni.current?.focus()
  }, [adim])

  const baslik = <h2 id="dt-ekle-baslik">Başvuru listesi</h2>

  if (!planId) {
    return (
      <section className="dt-basvuru-ekle" aria-labelledby="dt-ekle-baslik">
        {baslik}
        <p>Başvuru listesi bir plana bağlıdır. Önce bir plan açın.</p>
        <Link className="dt-basvuru-ekle-baglanti" to="/">Planlara gidin</Link>
      </section>
    )
  }

  if (adim === 'eklendi') {
    return (
      <section className="dt-basvuru-ekle" aria-labelledby="dt-ekle-baslik">
        {baslik}
        <p ref={sonucMetni} tabIndex={-1}>Program başvuru listenize eklendi.</p>
        <Link className="dt-basvuru-ekle-baglanti" to="/destek/basvurular">Başvurularıma gidin</Link>
      </section>
    )
  }

  if (basvurular?.some((b) => b.programId === program.id)) {
    return (
      <section className="dt-basvuru-ekle" aria-labelledby="dt-ekle-baslik">
        {baslik}
        <p>Bu program başvuru listenizde.</p>
        <Link className="dt-basvuru-ekle-baglanti" to="/destek/basvurular">Başvurularıma gidin</Link>
      </section>
    )
  }

  const ekle = async (cevap: DesteksizCevap) => {
    setCalisiyor(true)
    setHata(undefined)
    try {
      await basvuruEkle(planId, program, cevap, new Date().toISOString())
      setAdim('eklendi')
    } catch (error) {
      setHata(error instanceof Error ? error.message : 'Başvuru eklenemedi. Yeniden deneyin.')
    } finally {
      setCalisiyor(false)
    }
  }

  return (
    <section className="dt-basvuru-ekle" aria-labelledby="dt-ekle-baslik">
      {baslik}
      {adim === 'bekliyor' ? (
        <>
          <p>Bu programa başvurmayı düşünüyorsanız listenize ekleyin. Belgeleri ve son tarihi listede izlersiniz.</p>
          <Button type="primary" className="dt-basvuru-ekle-ana" onClick={() => setAdim('soru')}>Başvuru listeme ekle</Button>
        </>
      ) : (
        <div className="dt-basvuru-ekle-soru">
          <h3 ref={soruBaslik} tabIndex={-1}>Bu işi destek olmadan da yapar mıydık?</h3>
          <p>Bu soru, desteğin kararınızı değiştirip değiştirmediğini gösterir. Stratejinizi desteğe göre değiştirmeyin.</p>
          <div className="dt-basvuru-ekle-cevaplar">
            {DESTEKSIZ_CEVAPLARI.map((c) => (
              <Button key={c} disabled={calisiyor} onClick={() => void ekle(c)}>{DESTEKSIZ_ADI[c]}</Button>
            ))}
            <Button type="text" disabled={calisiyor} onClick={() => setAdim('bekliyor')}>Vazgeçin</Button>
          </div>
          {hata ? <p className="dt-basvuru-ekle-hata" role="alert">{hata}</p> : null}
        </div>
      )}
    </section>
  )
}

import '@/styles/bilesen/DtEskiBilgi.css'
import { Warning } from '@phosphor-icons/react'
import { ESKI_BILGI_GUN, tarihYaz } from '../motor/tazelik'
import { TUTARI_OKUYUN } from '../metinler'

/**
 * Eski bilgi uyarısı. Bilgi 90 günden eskiyse görünür.
 * Uyarı sayfa açılınca ekran okuyucuyu bölmez. Bu yüzden "alert" rolü kullanılmaz.
 */
export function DtEskiBilgi({ asOf }: { asOf: string }) {
  return (
    <section className="dt-eski-bilgi" aria-labelledby="dt-eski-bilgi-baslik">
      <h2 id="dt-eski-bilgi-baslik">
        <Warning className="dt-eski-bilgi-ikon" aria-hidden />
        Eski bilgi
      </h2>
      <p>
        Bu bilgiler en son {tarihYaz(asOf)} günü kontrol edildi. Bilgi {ESKI_BILGI_GUN} günden eski. Bu yüzden tutarları gizledik. {TUTARI_OKUYUN}
      </p>
    </section>
  )
}

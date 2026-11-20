import '@/styles/bilesen/DtKontrolTarihi.css'
import { ESKI_BILGI_GUN, tarihYaz, tazelik } from '../motor/tazelik'

/** Listenin son kontrol tarihi. Bilgi eskiyse kişiyi kurumun sayfasına yönlendirir. */
export function DtKontrolTarihi({ asOf, bugun }: { asOf: string; bugun: string }) {
  const eski = tazelik(asOf, bugun).eski
  return (
    <p className="dt-kontrol-tarihi">
      Son kontrol: {tarihYaz(asOf)}.{eski ? ` Bu bilgi ${ESKI_BILGI_GUN} günden eski. Kurumun sayfasını okuyun.` : ''}
    </p>
  )
}

import '@/styles/bilesen/DtHavuzBelgesi.css'
import 'dayjs/locale/tr'
import { useEffect, useState } from 'react'
import { Checkbox, DatePicker } from 'antd'
import dayjs from 'dayjs'
import { Warning } from '@phosphor-icons/react'
import type { OrtakBelge } from '../data/tipler'
import { havuzBelgeKaydet } from '../depo'
import { havuzDurumu, type HavuzDegisikligi, type HavuzKaydi } from '../motor/belgeHavuzu'
import { tarihYaz } from '../motor/tazelik'

export const TARIH_GEREKLI = 'Belgenin geçerlilik tarihini yazın. Tarihi belgenin üstünde okuyun.'
export const SURESI_GECTI = 'Belgenin geçerlilik tarihi geçti. Belgeyi yenileyin.'

/**
 * Havuzdaki tek ortak belge. Kişi belgenin hazır olduğunu işaretler.
 * Süreli belgede kişi geçerlilik tarihini yazar. Tarih yoksa ya da geçtiyse uyarı çıkar.
 * İşaret başvurulara geçmez. Kişi her başvuruda "Bu belgeyi kullanacağım" der.
 */
export function DtHavuzBelgesi({ belge, kayit, yer, bugun, hataGoster }: { belge: OrtakBelge; kayit: HavuzKaydi | undefined; yer: string; bugun: string; hataGoster: (m: string) => void }) {
  /*
   * İşaret hemen görünür. Depodaki kayıt bekleyen hâle ulaşınca bekleyen hâl silinir.
   * Sıradaki önceki bir yazma bitince bekleyen hâl kalır. Böylece seçilen tarih kaybolmaz.
   */
  const [bekleyen, setBekleyen] = useState<HavuzKaydi>()
  useEffect(() => {
    setBekleyen((b) => (b && (kayit?.hazir ?? false) === b.hazir && kayit?.gecerlilik === b.gecerlilik ? undefined : b))
  }, [kayit])
  const gorunen = bekleyen ?? kayit
  const durum = havuzDurumu(belge, gorunen, bugun)
  const id = `dt-havuz-${belge.id}`
  const yaz = (d: HavuzDegisikligi) => {
    setBekleyen({ hazir: d.hazir ?? gorunen?.hazir ?? false, ...(d.gecerlilik === null ? {} : { gecerlilik: d.gecerlilik ?? gorunen?.gecerlilik }) })
    havuzBelgeKaydet(yer, belge, d).catch((error: unknown) => {
      console.error(error)
      setBekleyen(undefined)
      hataGoster('Belge işareti kaydedilemedi. Önceki kayıt duruyor. Yeniden deneyin.')
    })
  }
  return (
    <div className="dt-havuz-belgesi">
      <Checkbox checked={Boolean(gorunen?.hazir)} onChange={(e) => yaz({ hazir: e.target.checked })}>
        Bu belge elimde hazır<span className="dt-gizli"> ({belge.ad})</span>
      </Checkbox>
      {belge.sureli && gorunen?.hazir ? (
        <div className="dt-havuz-alan">
          <label htmlFor={`${id}-tarih`}>Belgenin geçerlilik tarihi</label>
          <DatePicker
            id={`${id}-tarih`}
            format="D MMMM YYYY dddd"
            placeholder="Gün seçin"
            inputReadOnly
            /* Temizleme düğmesi 44 pikselden küçüktür. Kişi tarihi değiştirebilir ya da işareti kaldırabilir. */
            allowClear={false}
            value={gorunen.gecerlilik ? dayjs(gorunen.gecerlilik).locale('tr') : null}
            onChange={(v) => yaz({ gecerlilik: v ? v.format('YYYY-MM-DD') : null })}
          />
        </div>
      ) : null}
      {durum === 'hazir' && belge.sureli && gorunen?.gecerlilik ? <p>Belge {tarihYaz(gorunen.gecerlilik)} gününe kadar geçerli.</p> : null}
      {durum === 'tarihGerekli' || durum === 'suresiGecti' ? (
        <p className="dt-havuz-uyari" role="note">
          <Warning aria-hidden className="dt-havuz-ikon" />
          <span>{durum === 'tarihGerekli' ? TARIH_GEREKLI : SURESI_GECTI}</span>
        </p>
      ) : null}
    </div>
  )
}

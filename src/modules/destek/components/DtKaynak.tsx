import '@/styles/bilesen/DtKaynak.css'
import type { Fact } from '../data/tipler'
import { DtEtiket } from './DtEtiket'

/**
 * Kaynaklı bilginin kaynağı. Bağlantı, bilginin okunduğu resmî sayfayı açar.
 * Kaynaktaki söz katalog verisinde alıntı olarak durur. Söz ekranda gösterilmez.
 * Resmî sözde ekranın kullanmadığı işaretler olabilir. Örneğin orta çizgi ya da noktalı virgül.
 * İkincil kaynaktan gelen bilgi ayrı bir etiketle işaretlenir.
 */
export function DtKaynak({ fact, ad }: { fact: Fact<unknown>; ad: string }) {
  if (fact.state !== 'kaynakli') return null
  return (
    <div className="dt-kaynak">
      {fact.ikincil ? <DtEtiket ton="uyari">İkincil kaynak</DtEtiket> : null}
      <a className="dt-kaynak-baglanti" href={fact.sourceUrl} target="_blank" rel="noopener noreferrer">
        {ad} bilgisinin kaynağını açın<span className="dt-gizli"> Yeni sekmede açılır.</span>
      </a>
    </div>
  )
}

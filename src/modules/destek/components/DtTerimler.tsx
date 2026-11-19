import '@/styles/bilesen/DtTerimler.css'

const TERIMLER: readonly [string, string][] = [
  ['Destek', 'Devletin ya da bir kurumun işletmeye verdiği yardımdır.'],
  ['Hibe', 'Geri ödenmeyen paradır.'],
  ['Geri ödemeli destek', 'İşletme bu parayı sonra geri öder.'],
  ['Kredi', 'Bankanın verdiği borç paradır. Bazı programlar faizin bir kısmını öder.'],
  ['Teşvik', 'Vergi ya da prim indirimi gibi bir kolaylıktır.'],
  ['Ortaklık yatırımı', 'Yatırımcı para verir. Karşılığında şirketten pay alır.'],
  ['Kefalet', 'Bir kurum, krediniz için bankaya güvence verir.'],
  ['Çağrı', 'Başvurunun yalnız belli tarihlerde açık olmasıdır.'],
  ['KOBİ', 'Küçük ve orta büyüklükteki işletmedir.'],
  ['Ar-Ge', 'Yeni bir ürün ya da yöntem geliştirmek için yapılan araştırmadır.'],
  ['NACE kodu', 'İşletmenin iş kolunu gösteren resmî koddur.'],
  ['Ön eşleşme', 'Uygulamanın verdiği ilk tahmindir. Kesin kararı kurum verir.'],
]

/** Terimlerin anlamı. Açılır bölüm klavye ve dokunmayla açılır. */
export function DtTerimler() {
  return (
    <details className="dt-terimler">
      <summary>Terimlerin anlamı</summary>
      <dl>
        {TERIMLER.map(([terim, anlam]) => (
          <div key={terim} className="dt-terimler-satir">
            <dt>{terim}</dt>
            <dd>{anlam}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}

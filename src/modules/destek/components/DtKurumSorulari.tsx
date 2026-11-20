import { useState } from 'react'
import { Button } from 'antd'
import type { KurumSorusu } from '../data/tipler'
import { KURUM_SORULARI } from '../data/kurumSorulari'
import '@/styles/bilesen/DtKurumSorulari.css'

const GRUPLAR: Record<string, KurumSorusu[]> = {}
for (const soru of KURUM_SORULARI) (GRUPLAR[soru.grup] ??= []).push(soru)

export function DtKurumSorulari() {
  const [bildirim, setBildirim] = useState('')
  return (
    <section className="dt-kurum-sorulari" aria-label="Kuruma sorulacak sorular">
      <h2>Kuruma sorulacak sorular</h2>
      {Object.entries(GRUPLAR).map(([grup, sorular]) => (
        <details key={grup}>
          <summary>{grup}</summary>
          <ul>{sorular.map((s) => <li key={s.id}>{s.soru}</li>)}</ul>
          <Button onClick={async () => {
            try {
              await navigator.clipboard.writeText([grup, ...sorular.map((s) => s.soru)].join('\n'))
              setBildirim(`${grup} soruları kopyalandı.`)
            } catch {
              setBildirim('Sorular kopyalanamadı. Metni seçip kopyalayabilirsiniz.')
            }
          }}>Soruları kopyalayın</Button>
        </details>
      ))}
      <p aria-live="polite">{bildirim}</p>
    </section>
  )
}

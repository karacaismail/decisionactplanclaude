import '@/styles/bilesen/DtTerimler.css'
import { Link } from 'react-router'
import { SOZLUK } from '../data/sozluk'

const TEMEL = SOZLUK.filter((t) => t.temel)

/**
 * Temel terimlerin anlamı. Açılır bölüm klavye ve dokunmayla açılır.
 * Terimler sözlük verisinden gelir. Bütün terimler Destek sözlüğü ekranındadır.
 */
export function DtTerimler() {
  return (
    <details className="dt-terimler">
      <summary>Terimlerin anlamı</summary>
      <dl>
        {TEMEL.map((t) => (
          <div key={t.id} className="dt-terimler-satir">
            <dt>{t.ad}</dt>
            <dd>{t.anlam}</dd>
          </div>
        ))}
      </dl>
      <Link className="dt-terimler-hepsi" to="/destek/sozluk">Bütün terimleri görün</Link>
    </details>
  )
}

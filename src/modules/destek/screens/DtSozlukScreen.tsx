import '@/styles/ekran/DtSozlukScreen.css'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { DtUyari } from '../components/DtUyari'
import { SOZLUK } from '../data/sozluk'
import { harfeGore } from '../metinler'

const GRUPLAR = harfeGore(SOZLUK)
const terimKimligi = (id: string) => `dt-terim-${id}`

/**
 * Destek sözlüğü. Terimler Türkçe abece sırasıyla dizilir. Bu ekran plan istemez.
 * Adreste "terim" varsa o terim seçili görünür ve odak o terime geçer.
 */
export default function DtSozlukScreen() {
  const [params] = useSearchParams()
  const hedef = SOZLUK.find((t) => t.id === params.get('terim'))?.id
  useEffect(() => {
    if (hedef) document.getElementById(terimKimligi(hedef))?.focus()
  }, [hedef])

  return (
    <div className="page dt-sozluk">
      <PageHeader title="Destek sözlüğü" kicker="Destek ve teşvik" description="Destek ekranlarındaki terimlerin anlamı burada. Terimler abece sırasıyla dizilir." />
      <DtUyari />
      <p className="dt-sozluk-sayi">Sözlükte {SOZLUK.length} terim var.</p>
      {GRUPLAR.map((g) => (
        <section key={g.harf} className="dt-sozluk-harf" aria-labelledby={`dt-harf-${g.harf}`}>
          <h2 id={`dt-harf-${g.harf}`}>{g.harf}</h2>
          <dl>
            {g.terimler.map((t) => (
              <div key={t.id} className={t.id === hedef ? 'dt-sozluk-terim dt-sozluk-secili' : 'dt-sozluk-terim'}>
                <dt id={terimKimligi(t.id)} tabIndex={t.id === hedef ? -1 : undefined}>{t.ad}</dt>
                <dd>{t.anlam}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

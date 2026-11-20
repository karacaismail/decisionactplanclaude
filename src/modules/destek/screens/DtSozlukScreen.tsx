import '@/styles/ekran/DtSozlukScreen.css'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Input } from 'antd'
import { PageHeader } from '@/components/PageHeader'
import { DtUyari } from '../components/DtUyari'
import { SOZLUK } from '../data/sozluk'
import { harfeGore, sozlukAra } from '../metinler'

const terimKimligi = (id: string) => `dt-terim-${id}`

/**
 * Destek sözlüğü. Terimler Türkçe abece sırasıyla dizilir. Bu ekran plan istemez.
 * Adreste "terim" varsa o terim seçili görünür ve odak o terime geçer.
 */
export default function DtSozlukScreen() {
  const [arama, setArama] = useState('')
  const terimler = sozlukAra(SOZLUK, arama)
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
      <label htmlFor="dt-sozluk-arama">Sözlükte arayın</label>
      <Input id="dt-sozluk-arama" value={arama} onChange={(e) => setArama(e.target.value)} enterKeyHint="search" allowClear />
      {terimler.length === 0 ? <p role="status">Aramanıza uyan terim yok.</p> : null}
      {harfeGore(terimler).map((g) => (
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

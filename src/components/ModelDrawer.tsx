import '@/styles/bilesen/ModelDrawer.css'
import { useEffect, useState } from 'react'
import { Button, Drawer, Skeleton, Tag } from 'antd'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { loadHowTo, type HowTo } from '@/data/howto'
import { Callout } from './Callout'
import { modelLink, type ModelEntry } from './ModelCard'
type HelpState = { status: 'bekliyor' } | { status: 'hazir'; help: HowTo | null } | { status: 'hata' }

/**
 * Yöntem paneli. Yöntemin sorusunu, kısa özetini, örneğini ve yardımını gösterir.
 * Yardım üç bölümdür: "Nasıl uygulanır", "Dikkat" ve "İpucu".
 * Yardım verisi yalnız yardımı olan bir yöntem açılınca indirilir.
 */
export function ModelDrawer({ model, onClose }: { model: ModelEntry | null; onClose: () => void }) {
  const [state, setState] = useState<HelpState>({ status: 'bekliyor' })
  const g = model?.help ? model.g : null

  useEffect(() => {
    if (g === null) return
    let alive = true
    setState({ status: 'bekliyor' })
    loadHowTo()
      .then((all) => alive && setState({ status: 'hazir', help: all.get(g) ?? null }))
      .catch(() => alive && setState({ status: 'hata' }))
    return () => {
      alive = false
    }
  }, [g])

  const help = g !== null && state.status === 'hazir' ? state.help : null
  return (
    <Drawer
      open={Boolean(model)}
      onClose={onClose}
      title={model?.title}
      size="default"
      rootClassName="mt-model-drawer"
      // Portal kökü klavye odağında da ekrana sabit kalır.
      rootStyle={{ position: 'fixed' }}
    >
      {model ? (
        <div className="drawer-body">
          <div className="drawer-tags">
            <Tag>{model.section}</Tag>
            <Tag>Bölümde {model.no}. sırada</Tag>
          </div>
          <p className="helper mt-model-drawer-question">{model.question}</p>
          <Callout tone="sonuc" title="Kısaca">{model.simple ?? model.summary}</Callout>
          {model.example ? <Callout tone="ornek" title={model.example.title}>{model.example.text}</Callout> : null}

          {g !== null && state.status === 'bekliyor' ? (
            <div role="status" aria-live="polite" aria-busy="true">
              <span className="visually-hidden">Yöntem yardımı yükleniyor</span>
              <Skeleton active title={{ width: 'var(--size-loading-title)' }} paragraph={{ rows: 4 }} />
            </div>
          ) : null}
          {g !== null && state.status === 'hata' ? <Callout tone="uyari" title="Yardım yüklenemedi">Yöntem yardımı indirilemedi. Paneli kapatıp yeniden açın.</Callout> : null}

          {help && help.steps.length ? (
            <section className="howto" aria-labelledby="howto-baslik">
              <h3 id="howto-baslik" className="howto-title">Nasıl uygulanır</h3>
              <ol className="howto-steps">
                {help.steps.map((s, i) => (
                  <li key={i} className="howto-step">
                    <span className="howto-no tabular" aria-hidden>{i + 1}</span>
                    <span className="howto-step-body">
                      <span className="howto-step-title">{s.title}</span>
                      <span className="howto-step-text">{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          {help?.warn.map((w, i) => <Callout key={`uyari-${i}`} tone="uyari" title="Dikkat">{w}</Callout>)}
          {help?.tip.map((t, i) => <Callout key={`ipucu-${i}`} tone="ipucu" title="İpucu">{t}</Callout>)}

          <Button type="link" className="mt-model-drawer-link" href={modelLink(model)} target="_blank" rel="noreferrer" icon={<ArrowSquareOut className="mt-icon-inline" aria-hidden />} iconPlacement="end">
            Karar Kitabı'nda aç
          </Button>
        </div>
      ) : null}
    </Drawer>
  )
}

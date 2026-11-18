import { Tag } from 'antd'
import { Link } from 'react-router'
import { ArrowUpRight, ShieldCheck, Warning, Lightbulb, Lightning } from '@phosphor-icons/react'
import { stepPath } from '@/data/registry'
import type { PlanDoc } from '@/data/types'
import { buildSituation, SITUATION_EMPTY, SITUATION_TITLE, type SituationKind } from '@/engine/situation'
import '@/styles/mobil-pano.css'
import '@/styles/screens-durum.css'

const ORDER: SituationKind[] = ['guclu', 'zayif', 'firsat', 'tehdit']
const ICON = { guclu: ShieldCheck, zayif: Warning, firsat: Lightbulb, tehdit: Lightning }

/**
 * Durum özeti: güçlü yönler, zayıf yönler, fırsatlar ve tehditler. Kart değildir, kartın içine konur.
 * Dört liste var olan adımlardan toplanır. Bileşen salt okunurdur. Her madde kaynak adımına gider.
 * Dar alanda dört liste alt alta durur. Özetin alanı genişleyince listeler ikişerli durur.
 */
export function SituationSummary({ plan }: { plan: PlanDoc }) {
  const situation = buildSituation(plan)
  return (
    <div className="durum mobil-pano-situation">
      <div className="durum-grid">
        {ORDER.map((kind) => {
          const items = situation[kind]
          const Icon = ICON[kind]
          const headId = `durum-${kind}`
          return (
            <section key={kind} className={`durum-block is-${kind}`} aria-labelledby={headId}>
              <h3 id={headId} className="durum-title">
                <Icon size={18} aria-hidden />
                <span>{SITUATION_TITLE[kind]}</span>
                <Tag className="durum-count">{items.length}</Tag>
              </h3>
              {items.length ? (
                <ul className="durum-list">
                  {items.map((item, i) => (
                    <li key={`${item.step}-${i}`} className="durum-item">
                      <span className="durum-text">{item.text}</span>
                      <span className="durum-meta">
                        <span>{item.note}.</span>
                        <Link className="durum-link" to={stepPath(item.step)} aria-label={`${item.text}. Adım ${item.step} içinde düzeltin`}>
                          Adım {item.step} <ArrowUpRight size={14} aria-hidden />
                        </Link>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="durum-empty">
                  <span>Bu liste boş.</span>
                  <Link className="durum-link" to={stepPath(SITUATION_EMPTY[kind].step)}>{SITUATION_EMPTY[kind].text}</Link>
                </p>
              )}
            </section>
          )
        })}
      </div>
      {situation.unclassified > 0 ? (
        <p className="durum-hint">
          <span>{situation.unclassified} dış etken henüz sınıflanmadı.</span>
          <Link className="durum-link" to={stepPath('04')}>Adım 04'te her etken için "Fırsat" ya da "Tehdit" seçin.</Link>
        </p>
      ) : null}
    </div>
  )
}

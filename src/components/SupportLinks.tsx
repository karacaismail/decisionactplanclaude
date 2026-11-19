import '@/styles/bilesen/SupportLinks.css'
import { Link } from 'react-router'
import type { PlanDoc } from '@/data/types'
import { parseSupportRollup, SUPPORT_MODULE_ID, supportLines } from '@/engine/supportRollup'
import { moduleById } from '@/platform/modules'
import { useRollup } from '@/platform/useRollup'

const MATCH_PATH = '/destek/eslesme'
const APPLICATIONS_PATH = '/destek/basvurular'

/** Destek modülünün bu yolu var mı? Modül kayıtlı değilse bağlantı görünmez. */
function hasRoute(path: string): boolean {
  return Boolean(moduleById(SUPPORT_MODULE_ID)?.routes.some((r) => r.path === path))
}

/**
 * Kaynak sınırı adımındaki destek bağlantısı. Yalnız "Dış para" seçildiyse görünür.
 * Destek parası kesin para değildir. Metin bunu açıkça söyler.
 */
export function SupportHint({ plan }: { plan: PlanDoc }) {
  if (plan.profile.funding !== 'dis' || !hasRoute(MATCH_PATH)) return null
  return (
    <section className="support-links" aria-labelledby="destek-ipucu">
      <h2 id="destek-ipucu" className="support-links-title">Olası destekler</h2>
      <p className="support-links-text">Dış para seçtiniz. Hibe ve kredi desteklerine bakabilirsiniz.</p>
      <p className="support-links-text">Destek parası kesin para sayılmaz. Elinizdeki parayı yalnız kesin parayla yazın.</p>
      <Link className="support-links-link" to={MATCH_PATH}>Olası destekler</Link>
    </section>
  )
}

/**
 * 3.3 adımındaki destek satırı. Sayılar destek modülünün özetinden gelir. Satır salt okunurdur.
 * Destek parası beklenen paradır. Bağlanan toplam paraya eklenmez.
 */
export function SupportSummary({ planId }: { planId: string }) {
  const rollup = parseSupportRollup(useRollup(SUPPORT_MODULE_ID, planId))
  if (!rollup || rollup.total === 0 || !hasRoute(APPLICATIONS_PATH)) return null
  const lines = supportLines(rollup)
  return (
    <section className="support-links" aria-labelledby="destek-basvurulari">
      <h2 id="destek-basvurulari" className="support-links-title">{lines.total}</h2>
      {lines.statuses.length ? (
        <ul className="support-links-list">
          {lines.statuses.map((line) => <li key={line}>{line}</li>)}
        </ul>
      ) : null}
      <div className="support-links-expected">
        <p className="support-links-label">Beklenen, kesin değil</p>
        <p className="support-links-text">Destek parası kesin para sayılmaz. Bağlanan toplam paraya eklenmez.</p>
      </div>
      <Link className="support-links-link" to={APPLICATIONS_PATH}>Başvurularım</Link>
    </section>
  )
}

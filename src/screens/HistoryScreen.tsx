import { useCurrentPlan } from '@/store/planStore'
import { DecisionBadge } from '@/components/DecisionBadge'
import { PageHeader, SectionHead } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { formatDate, formatMoney } from '@/engine/format'
import { OUTCOME_LABEL } from '@/data/types'
import { DECISIONS } from '@/data/decisions'
import '@/styles/screens-kapi.css'

function changeValue(key: string, v: unknown): string {
  if (v === null || v === undefined || v === '') return 'Boş'
  if (key.endsWith('Kurus')) return formatMoney(Number(v))
  if (key === 'deadline') return formatDate(String(v), false)
  if (Array.isArray(v)) return `${v.length} kural`
  if (typeof v === 'boolean') return v ? 'Evet' : 'Hayır'
  return String(v)
}

export function HistoryScreen() {
  const plan = useCurrentPlan()
  if (!plan) return null
  const decisions = [...plan.decisions].reverse()
  const changes = [...(plan.changes ?? [])].reverse()
  const revisions = [...plan.revisions].reverse()

  return (
    <div className="page">
      <PageHeader
        kicker="Karar günlüğü"
        title="Geçmiş"
        description="Her kapı kararı bir sürüm noktasıdır. Karar, kanıt ve karşı görüş birlikte durur. Silinmez."
      />

      <section className="section" aria-label="Kapı kararları">
        <SectionHead title="Kapı kararları" description={`${decisions.length} karar kaydedildi.`} />
        {decisions.length === 0 ? (
          <EmptyState title="Henüz karar kaydı yok" text="İlk kapıda kararı kaydedince burada görünür." />
        ) : (
          <ul className="recent-list">
            {decisions.map((d) => {
              const def = DECISIONS[d.gate - 1]
              return (
                <li key={d.id} className="recent-item history-item">
                  <div className="recent-head">
                    <span className="history-meta">
                      <span className="recent-title">Kapı {d.gate}</span>
                      {def ? <span className="helper">{def.title}</span> : null}
                    </span>
                    <span className="history-meta">
                      <DecisionBadge outcome={d.chosen} />
                      {d.stale ? <span className="tag is-hold">İnceleme bekliyor</span> : null}
                    </span>
                  </div>
                  <span className="recent-date tabular">{formatDate(d.decidedAt)}. Sürüm {d.revision}. {d.decidedBy}</span>
                  <span className="recent-reason">{d.reason}</span>
                  <div className="history-notes helper">
                    {d.chosen !== d.suggested ? <span>Sistemin önerisi: {OUTCOME_LABEL[d.suggested]}</span> : null}
                    {d.stale ? <span>Dayandığı veri sonradan değişti. Kapıyı yeniden inceleyin.</span> : null}
                    {d.counterView ? <span>Karşı görüş: {d.counterView}</span> : null}
                    {d.secondOpinion ? <span>İkinci görüş: {d.secondOpinion}</span> : null}
                    {d.conditional ? <span>Koşullu iş: {d.conditional.scope}. Bitiş {formatDate(d.conditional.deadline, false)}.</span> : null}
                    {d.reopenWhen ? <span>Yeniden açılır: {d.reopenWhen}</span> : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="section" aria-label="Değişiklik kaydı">
        <SectionHead title="Değişiklik kaydı" description="Sınır ve eşik değişiklikleri burada durur." />
        {changes.length === 0 ? (
          <EmptyState title="Sınır değişikliği yok" text="Harcama sınırı, bitiş tarihi veya deneme hakkı değişince kayıt buraya düşer." />
        ) : (
          <ul className="row-list">
            {changes.map((c) => (
              <li key={c.id}>
                <div className="row">
                  <span className="grow">
                    <strong>{c.label}</strong>: {changeValue(c.key, c.before)} yerine {changeValue(c.key, c.after)}.
                  </span>
                  {c.needsReview ? (c.reviewer ? <span className="tag is-ok">Görüş alındı</span> : <span className="tag is-hold">İkinci görüş bekliyor</span>) : null}
                  <span className="helper tabular">{formatDate(c.at)}{c.reviewer ? `. İnceleyen: ${c.reviewer}` : ''}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section" aria-label="Sürümler">
        <SectionHead title="Sürümler" description="Her kayıt yeni bir sürüm alır." />
        {revisions.length === 0 ? (
          <EmptyState title="Sürüm yok" text="İlk kapı kararı kaydedilince ilk sürüm oluşur." />
        ) : (
          <ul className="row-list">
            {revisions.map((r, i) => (
              <li key={r.id}>
                <div className="row">
                  <span className="grow"><strong>{r.label}</strong></span>
                  <span className="helper tabular">Sürüm {revisions.length - i}</span>
                  <span className="helper tabular">{formatDate(r.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

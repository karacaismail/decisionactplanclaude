import '@/styles/desen/k-card.css'
import '@/styles/desen/kapi-ortak.css'
import '@/styles/desen/stat-card.css'
import '@/styles/desen/kapi.css'
import '@/styles/desen/temel-stats.css'
import '@/styles/desen/cikti-ortak.css'
import '@/styles/ekran/FoundationScreen.css'
import { useMemo, useState } from 'react'
import { Card, Empty, Progress, Segmented, Statistic, Tag } from 'antd'
import { Link } from 'react-router'
import { ArrowRight, CheckCircle, MinusCircle, Warning } from '@phosphor-icons/react'
import { useCurrentPlan } from '@/store/planStore'
import { evaluateStones, STONES, type StoneState, type StoneStatus } from '@/data/foundation'
import { stepPath } from '@/data/registry'
import { LEVELS, validationLevel } from '@/engine/readiness'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
type Filter = 'hepsi' | StoneStatus

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'hepsi', label: 'Hepsi' },
  { value: 'eksik', label: 'Eksik' },
  { value: 'zayif', label: 'Zayıf kanıt' },
  { value: 'var', label: 'Var' },
]
const STATUS: Record<StoneStatus, { label: string; Icon: typeof CheckCircle }> = {
  var: { label: 'Var', Icon: CheckCircle },
  zayif: { label: 'Zayıf kanıt', Icon: Warning },
  eksik: { label: 'Eksik', Icon: MinusCircle },
}
const GROUPS = [...new Set(STONES.map((s) => s.group))]
const TOTAL = STONES.length
/** 4. basamak ve üstü kanıt güçlü sayılır (foundation.ts ile aynı eşik). */
const STRONG = 57

/** Sayının belirtme eki: "Adım 07'yi", "Adım 10'u", "Adım 16'yı". */
function accusative(id: string): string {
  const n = Number(id)
  const ones = ['', 'i', 'yi', 'ü', 'ü', 'i', 'yı', 'yi', 'i', 'u']
  const tens = ['ı', 'u', 'yi', 'u', 'ı', 'yi', 'ı', 'i', 'i', 'ı']
  return n % 10 === 0 ? tens[Math.floor(n / 10) % 10] : ones[n % 10]
}
const openLabel = (step: string) => `Adım ${step}'${accusative(step)} aç`
const pad = (n: number) => String(n).padStart(2, '0')

function StoneCard({ stone }: { stone: StoneState }) {
  const { label, Icon } = STATUS[stone.status]
  return (
    <Card className={`stone-card is-${stone.status}`} variant="borderless" size="small" hoverable>
      <div className="stone-top">
        <span className="stone-no" aria-hidden>{pad(stone.no)}</span>
        <Tag className={`stone-tag is-${stone.status}`} icon={<Icon size={14} weight="fill" aria-hidden />}>{label}</Tag>
      </div>
      <h3 className="stone-title">{stone.title}</h3>
      <p className="stone-question">{stone.question}</p>
      <p className="stone-example">Örnek: {stone.example}</p>
      <div className="stone-strength">
        <span className="stone-strength-label">Kanıt gücü</span>
        <Progress
          percent={stone.strength}
          showInfo={false}
          size="small"
          strokeColor={stone.strength >= STRONG ? 'var(--color-status-ok)' : 'var(--color-status-hold)'}
          aria-label={`Kanıt gücü yüzde ${stone.strength}`}
        />
        <span className="stone-evidence">{stone.evidenceCount > 0 ? `${stone.evidenceCount} kanıt` : 'Kanıt yok'}</span>
      </div>
      <Link className="stone-link" to={stepPath(stone.step)} aria-label={`${openLabel(stone.step)}. Taş ${stone.no}: ${stone.title}`}>
        {openLabel(stone.step)}
        <ArrowRight size={16} aria-hidden />
      </Link>
    </Card>
  )
}

export function FoundationScreen() {
  const plan = useCurrentPlan()
  const [filter, setFilter] = useState<Filter>('hepsi')
  const stones = useMemo(() => (plan ? evaluateStones(plan) : []), [plan])
  if (!plan) return null

  const count = (s: StoneStatus) => stones.filter((x) => x.status === s).length
  const ok = count('var')
  const weak = count('zayif')
  const missing = count('eksik')
  const shown = filter === 'hepsi' ? stones : stones.filter((s) => s.status === filter)
  const level = validationLevel(plan)
  const levelTitle = LEVELS.find((l) => l.level === level)?.title ?? ''

  return (
    <div className="page page-foundation">
      <PageHeader
        newPath="/temel"
        kicker="Temel sorular"
        title="Strateji öncesi 20 temel soru"
        description="Her taş bir soruya cevap verir. Eksik taşa tıklayın, ilgili adım açılır."
      />

      <div className="temel-stats has-wide" role="group" aria-label="Temel soru özeti">
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Var" value={ok} prefix={<CheckCircle className="stat-ico is-ok" size={22} weight="fill" aria-hidden />} />
          <span className="stat-note">Cevabı yazılı ve kanıtı güçlü taşlar.</span>
        </Card>
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Zayıf kanıtlı" value={weak} prefix={<Warning className="stat-ico is-hold" size={22} weight="fill" aria-hidden />} />
          <span className="stat-note">Cevabı yazılı ama kanıtı zayıf taşlar.</span>
        </Card>
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Eksik" value={missing} prefix={<MinusCircle className="stat-ico is-harm" size={22} weight="fill" aria-hidden />} />
          <span className="stat-note">Cevabı henüz yeterli olmayan taşlar.</span>
        </Card>
        <Card className="k-card temel-progress is-wide" variant="borderless">
          <h2 className="temel-progress-title">Temel ne kadar hazır?</h2>
          <Progress
            percent={Math.round((ok / TOTAL) * 100)}
            format={() => `${ok} / ${TOTAL}`}
            strokeColor="var(--color-status-ok)"
            aria-label={`${TOTAL} temel sorunun ${ok} tanesi var`}
          />
          <span className="stat-note">Kanıt düzeyiniz 5 üzerinden {level}. {levelTitle}.</span>
        </Card>
      </div>

      <Callout tone="ipucu" title="Zayıf kanıt ne demek?">Var ama dayanağı zayıf. Adıma bağlı kanıt yok ya da kanıt sözden ibaret.</Callout>

      <div className="temel-filter">
        <Segmented<Filter> aria-label="Taşları duruma göre süz" options={FILTERS} value={filter} onChange={setFilter} />
        <span className="temel-filter-count" role="status">{shown.length} taş gösteriliyor.</span>
      </div>

      {shown.length === 0 ? (
        <Card className="k-card" variant="borderless">
          <Empty description="Bu durumda taş yok. Başka bir süzgeç seçin." />
        </Card>
      ) : (
        <div className="stone-groups">
          {GROUPS.map((group) => {
            const items = shown.filter((s) => s.group === group)
            if (items.length === 0) return null
            const all = stones.filter((s) => s.group === group)
            const groupOk = all.filter((s) => s.status === 'var').length
            const headId = `tas-grubu-${all[0].no}`
            return (
              <section key={group} className="stone-group" aria-labelledby={headId}>
                <div className="stone-group-head">
                  <h2 id={headId}>{group}</h2>
                  <span className="stone-group-count">{all.length} taşın {groupOk} tanesi var.</span>
                </div>
                <div className="stone-grid">
                  {items.map((s) => <StoneCard key={s.no} stone={s} />)}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

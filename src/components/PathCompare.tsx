import { useId, useSyncExternalStore } from 'react'
import { Empty, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router'
import { stepPath } from '@/data/registry'
import { DOOR_LABEL, NO_PATHS, pathBasis, type PathColumn } from '@/reports/handoff'
import '@/styles/screens-strateji.css'
import '@/styles/mobil-kapi.css'

interface CompareRow {
  key: string
  label: string
  pick: (p: PathColumn) => string | null
}

/** Karşılaştırma satırları. Sıra, devir raporunun dördüncü bölümüyle aynıdır. */
const ROWS: CompareRow[] = [
  { key: 'where', label: 'Kime ve nereden?', pick: (p) => p.where },
  { key: 'how', label: 'Neyle kazanılır?', pick: (p) => p.how },
  { key: 'revenue', label: 'Para nasıl kazanılır?', pick: (p) => p.revenue },
  { key: 'vehicle', label: 'Nasıl kurulur?', pick: (p) => p.vehicle },
  { key: 'giveUp', label: 'Neyden vazgeçilir?', pick: (p) => p.giveUp },
  { key: 'evidence', label: 'Destekleyen kanıt', pick: (p) => p.evidence },
  { key: 'basis', label: 'Kanıtın türü', pick: (p) => pathBasis(p) },
  { key: 'origin', label: 'Hangi sorudan çıktı?', pick: (p) => p.origin },
  { key: 'cost', label: 'Bedeli ve süresi', pick: (p) => p.cost },
  { key: 'reversible', label: 'Geri alınabilir mi?', pick: (p) => (p.reversible ? DOOR_LABEL[p.reversible] : null) },
  { key: 'score', label: 'Puan', pick: (p) => (p.score !== null ? p.score.toLocaleString('tr-TR') : null) },
]

/** Ölçü sütunu ve bir yol sütunu için okunabilir en küçük genişlik (CSS px). */
const MEASURE_WIDTH = 176
const PATH_WIDTH = 232

/* İki yol ve ölçü sütunu için alan gerekir. Kısa yükseklikte dikey okuma korunur. */
const COMPARE_QUERY = '(min-width: 768px) and (min-height: 560px)'
const subscribeComparison = (notify: () => void) => {
  const media = window.matchMedia(COMPARE_QUERY)
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}
const wideComparison = () => window.matchMedia(COMPARE_QUERY).matches
const initialComparison = () => false

export interface PathCompareProps {
  /** `buildHandoffReport(plan).paths` */
  paths: PathColumn[]
  /** Tablonun ekran okuyucu adı. */
  label?: string
}

/**
 * Yol adaylarını yan yana gösterir. Sütunlar yollardır, satırlar karşılaştırma ölçüleridir.
 * Bileşen salt okunurdur ve hiçbir yolu öne çıkarmaz. Stratej önerir, karar sahibi seçer.
 * Tablo kendi kabında yatay kayar. Sayfa taşmaz.
 * Dar veya kısa ekranda yollar alt alta durur. Her yol bütün ölçüleri gösterir.
 */
export function PathCompare({ paths, label = 'Yol adayları karşılaştırması' }: PathCompareProps) {
  const uid = useId()
  const wide = useSyncExternalStore(subscribeComparison, wideComparison, initialComparison)

  if (paths.length === 0) {
    return (
      <Empty className="path-compare-empty" image={Empty.PRESENTED_IMAGE_SIMPLE} description={NO_PATHS}>
        <Link to={stepPath('18')}>Adım 18'de yol adaylarını yazın</Link>
      </Empty>
    )
  }

  const cell = (row: CompareRow, p: PathColumn) => {
    const text = row.pick(p)
    return (
      <span className="path-cell">
        {text ? <span className={row.key === 'score' ? 'tabular' : undefined}>{text}</span> : <span className="path-cell-empty">Yazılmadı</span>}
      </span>
    )
  }
  /* Tablo bu genişliğin altına inmez. Kap daha darsa tablo kabın içinde kayar. */
  const minWidth = MEASURE_WIDTH + paths.length * PATH_WIDTH
  const columns: ColumnsType<CompareRow> = [
    { title: 'Ölçü', key: 'olcu', width: MEASURE_WIDTH, className: 'path-measure', rowScope: 'row', render: (_: unknown, row: CompareRow) => row.label },
    ...paths.map((p) => ({ title: p.name, key: p.id, width: PATH_WIDTH, className: 'path-col', render: (_: unknown, row: CompareRow) => cell(row, p) })),
  ]

  return (
    <div className="path-compare">
      <div className="path-compare-scroll" role="region" aria-label={label} tabIndex={0}>
        {wide ? (
          <Table<CompareRow> size="middle" pagination={false} rowKey="key" dataSource={ROWS} columns={columns} tableLayout="fixed" style={{ minWidth }} />
        ) : (
          <div className="path-stack">
            {paths.map((p, index) => (
              <section className="path-stack-item" key={p.id} aria-labelledby={`${uid}-yol-${index}`}>
                <h3 className="path-stack-title" id={`${uid}-yol-${index}`}>{p.name}</h3>
                <dl className="path-stack-measures">
                  {ROWS.map((row) => (
                    <div key={row.key}>
                      <dt>{row.label}</dt>
                      <dd>{cell(row, p)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        )}
      </div>
      <span className="helper">
        {paths.length} yol {wide ? 'yan yana' : 'alt alta'} durur. Puan bir öneri değildir.
      </span>
    </div>
  )
}

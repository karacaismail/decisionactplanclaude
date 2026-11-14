import { Empty, Grid, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router'
import { stepPath } from '@/data/registry'
import { DOOR_LABEL, NO_PATHS, pathBasis, type PathColumn } from '@/reports/handoff'
import '@/styles/screens-strateji.css'

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
 * Dar ekranda ölçü sütunu yoktur. Ölçünün adı her hücrenin üstünde yazar.
 */
export function PathCompare({ paths, label = 'Yol adayları karşılaştırması' }: PathCompareProps) {
  const bp = Grid.useBreakpoint()
  const narrow = bp.md === false

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
        {narrow ? <span className="path-cell-label">{row.label}</span> : null}
        {text ? <span className={row.key === 'score' ? 'tabular' : undefined}>{text}</span> : <span className="path-cell-empty">Yazılmadı</span>}
      </span>
    )
  }
  /* Tablo bu genişliğin altına inmez. Kap daha darsa tablo kabın içinde kayar. */
  const minWidth = (narrow ? 0 : MEASURE_WIDTH) + paths.length * PATH_WIDTH
  const columns: ColumnsType<CompareRow> = [
    ...(narrow ? [] : [{ title: 'Ölçü', key: 'olcu', width: MEASURE_WIDTH, className: 'path-measure', rowScope: 'row' as const, render: (_: unknown, row: CompareRow) => row.label }]),
    ...paths.map((p) => ({ title: p.name, key: p.id, width: PATH_WIDTH, className: 'path-col', render: (_: unknown, row: CompareRow) => cell(row, p) })),
  ]

  return (
    <div className="path-compare">
      <div className="path-compare-scroll" role="region" aria-label={label} tabIndex={0}>
        <Table<CompareRow> size="middle" pagination={false} rowKey="key" dataSource={ROWS} columns={columns} tableLayout="fixed" style={{ minWidth }} />
      </div>
      <span className="helper">
        {paths.length} yol yan yana durur. Puan bir öneri değildir.{narrow && paths.length > 1 ? ' Öteki yolları görmek için tabloyu yana kaydırın.' : ''}
      </span>
    </div>
  )
}

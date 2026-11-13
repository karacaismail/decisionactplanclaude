import { lazy, Suspense, useState } from 'react'
import { Button, Skeleton, Table } from 'antd'
import { TableIcon, ChartBar } from '@phosphor-icons/react'

const LazyChart = lazy(() => import('./EChart'))

/**
 * Grafik ve "Veriyi göster" tablosu birlikte. Grafik geç yüklenir.
 * Grafik yüklenemezse tablo çalışır. Ekran okuyucu tabloyu okur. Kart ve gölge yoktur.
 * `height` grafik yüksekliğidir (varsayılan 240 px). Grafik kabı `.chart-canvas` dar ekranda daralır (min-width 0).
 */
export function ChartFrame({ title, summary, option, table, height = 240 }: {
  title: string
  summary?: string
  option: unknown
  table: { head: string[]; rows: (string | number)[][] }
  height?: number
}) {
  const [showTable, setShowTable] = useState(false)
  return (
    <figure className="chart-frame">
      <figcaption className="section-head">
        <h3>{title}</h3>
        <div className="section-actions">
          <Button type="text" icon={showTable ? <ChartBar size={16} /> : <TableIcon size={16} />} onClick={() => setShowTable((s) => !s)} aria-pressed={showTable}>
            {showTable ? 'Grafiği göster' : 'Veriyi göster'}
          </Button>
        </div>
      </figcaption>
      {showTable ? (
        <Table size="middle" pagination={false} rowKey={(_, i) => String(i)} dataSource={table.rows.map((r) => Object.fromEntries(r.map((c, i) => [String(i), c])))} columns={table.head.map((h, i) => ({ title: h, dataIndex: String(i), width: i === 0 ? 220 : 140 }))} scroll={{ x: 'max-content' }} />
      ) : (
        <div className="chart-canvas">
          <Suspense fallback={<Skeleton.Node active style={{ width: '100%', height }} />}>
            <LazyChart option={option} height={height} ariaLabel={title} />
          </Suspense>
        </div>
      )}
      {summary ? <p className="chart-summary">{summary}</p> : null}
    </figure>
  )
}

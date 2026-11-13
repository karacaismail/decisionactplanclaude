import { lazy, Suspense, useState } from 'react'
import { Card, Segmented, Skeleton, Table } from 'antd'
import { TableIcon, ChartBar } from '@phosphor-icons/react'

const LazyChart = lazy(() => import('./EChart'))

type View = 'grafik' | 'tablo'

/**
 * Grafik ve "Veriyi göster" tablosu birlikte. Varsayılan görünüm başlıklı `Card`; sağ üstte `Segmented` (Grafik | Tablo).
 * `frame="plain"` kart çizmez; kartın içine yerleşen çağıran için. Grafik geç yüklenir.
 * Grafik yüklenemezse tablo çalışır. Ekran okuyucu tabloyu okur. `height` grafik yüksekliğidir (varsayılan 240 px).
 */
export function ChartFrame({ title, summary, option, table, height = 240, frame = 'card' }: {
  title: string
  summary?: string
  option: unknown
  table: { head: string[]; rows: (string | number)[][] }
  height?: number
  frame?: 'card' | 'plain'
}) {
  const [view, setView] = useState<View>('grafik')
  const toggle = (
    <Segmented<View>
      className="chart-view"
      value={view}
      onChange={setView}
      aria-label="Veriyi göster"
      options={[
        { value: 'grafik', label: 'Grafik', icon: <ChartBar size={16} aria-hidden /> },
        { value: 'tablo', label: 'Tablo', icon: <TableIcon size={16} aria-hidden /> },
      ]}
    />
  )
  const body = (
    <>
      {view === 'tablo' ? (
        <Table size="middle" pagination={false} rowKey={(_, i) => String(i)} dataSource={table.rows.map((r) => Object.fromEntries(r.map((c, i) => [String(i), c])))} columns={table.head.map((h, i) => ({ title: h, dataIndex: String(i), width: i === 0 ? 220 : 140 }))} scroll={{ x: 'max-content' }} />
      ) : (
        <div className="chart-canvas">
          <Suspense fallback={<Skeleton.Node active style={{ width: '100%', height }} />}>
            <LazyChart option={option} height={height} ariaLabel={title} />
          </Suspense>
        </div>
      )}
      {summary ? <p className="chart-summary">{summary}</p> : null}
    </>
  )
  if (frame === 'plain') {
    return (
      <figure className="chart-frame">
        <figcaption className="section-head">
          <h3>{title}</h3>
          <div className="section-actions">{toggle}</div>
        </figcaption>
        {body}
      </figure>
    )
  }
  return (
    <Card className="step-card chart-card" variant="borderless" title={title} extra={toggle}>
      <figure className="chart-frame">
        <figcaption className="sr-only">{title}</figcaption>
        {body}
      </figure>
    </Card>
  )
}

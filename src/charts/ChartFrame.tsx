import { lazy, Suspense, useState } from 'react'
import { Button, Skeleton, Table, Typography, theme } from 'antd'
import { TableIcon, ChartBar } from '@phosphor-icons/react'

const LazyChart = lazy(() => import('./EChart'))

/**
 * Grafik ve "Veriyi göster" tablosu birlikte. Grafik geç yüklenir.
 * Grafik yüklenemezse tablo çalışır. Ekran okuyucu tabloyu okur.
 */
export function ChartFrame({ title, summary, option, table, height = 280 }: {
  title: string
  summary?: string
  option: unknown
  table: { head: string[]; rows: (string | number)[][] }
  height?: number
}) {
  const { token } = theme.useToken()
  const [showTable, setShowTable] = useState(false)
  return (
    <figure style={{ margin: 0, background: token.colorBgContainer, borderRadius: token.borderRadiusLG, padding: 16, display: 'grid', gap: 12 }}>
      <figcaption style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography.Text strong style={{ fontSize: 16 }}>{title}</Typography.Text>
        <Button size="small" icon={showTable ? <ChartBar size={16} /> : <TableIcon size={16} />} onClick={() => setShowTable((s) => !s)} aria-pressed={showTable}>
          {showTable ? 'Grafiği göster' : 'Veriyi göster'}
        </Button>
      </figcaption>
      {showTable ? (
        <Table size="small" pagination={false} rowKey={(_, i) => String(i)} dataSource={table.rows.map((r) => Object.fromEntries(r.map((c, i) => [String(i), c])))} columns={table.head.map((h, i) => ({ title: h, dataIndex: String(i) }))} scroll={{ x: 'max-content' }} />
      ) : (
        <Suspense fallback={<Skeleton.Node active style={{ width: '100%', height }} />}>
          <LazyChart option={option} height={height} ariaLabel={title} />
        </Suspense>
      )}
      {summary ? <Typography.Text style={{ fontSize: 16 }}>{summary}</Typography.Text> : null}
    </figure>
  )
}

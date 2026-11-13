import { Button, Card, Input, Switch, Table, Typography, theme } from 'antd'
import { Link, useNavigate } from 'react-router'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { Callout } from '@/components/Callout'

const CHECKS: { key: string; q: string; yes: string; no: string; to: string }[] = [
  { key: 'problem', q: 'Problem gerçek müşteriyle doğrulandı mı?', yes: 'Kapı 2 geçildi sayılır.', no: 'Adım 06\'dan girin.', to: '/karar/2/adim/06' },
  { key: 'odeme', q: 'Ödeme veya depozito kanıtı var mı?', yes: 'Kapı 4 geçildi sayılır.', no: 'Problem doğrulandıysa Adım 15. Doğrulanmadıysa Adım 06.', to: '/karar/4/adim/15' },
  { key: 'strateji', q: 'Yazılı bir strateji ve vazgeçiş listesi var mı?', yes: 'Kapı 5 geçildi sayılır.', no: 'Adım 18\'den girin.', to: '/karar/5/adim/18' },
  { key: 'olcum', q: 'Ölçüm düzeni ve eşikler var mı?', yes: 'Adım 22 tamam.', no: 'Adım 22\'den girin.', to: '/karar/6/adim/22' },
  { key: 'kapi', q: 'İlk ürün kapısı kararı yazılı mı?', yes: 'Kapı 6 geçildi sayılır.', no: 'Adım 22 eşiklerini şimdi yazın. 4 hafta ölçün. Sonra Adım 25.', to: '/karar/6/adim/22' },
  { key: 'uyum', q: 'Uyum ölçüldü mü?', yes: 'Kapı 7\'ye yakınsınız.', no: 'Adım 28\'den girin.', to: '/karar/7/adim/28' },
  { key: 'ekonomi', q: 'Birim ekonomisi gerçek veriyle hesaplandı mı?', yes: 'Adım 29 tamam.', no: 'Adım 29\'dan girin.', to: '/karar/7/adim/29' },
]

export function TakeoverScreen() {
  const { token } = theme.useToken()
  const nav = useNavigate()
  const plan = useCurrentPlan()
  const update = usePlanStore((s) => s.update)
  if (!plan) return null
  const t = (plan.takeover ?? {}) as Record<string, unknown>
  const set = (k: string, v: unknown) => update((p) => { p.takeover = { ...(p.takeover ?? {}), [k]: v } })
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <Typography.Title level={1} style={{ fontSize: 32, marginBottom: 8 }}>Devralma girişi</Typography.Title>
        <Typography.Text style={{ color: token.colorTextSecondary }}>Çalışan bir işi devralıyorsunuz. Planı baştan değil, ortasından başlatırsınız. Adım 00, 01, 02 ve 05 her devralmada yapılır.</Typography.Text>
      </div>
      <Callout tone="uyari" title="Vaatleri sonuçlarla karşılaştırın">Yerine getirilmemiş sözleri ayrıca yazın. Kaydı olmayan cevabı "bilinmiyor" diye yazın. Hiç kayıt yoksa önce 4 haftalık ölçüm yapın. Karar vermeyin.</Callout>
      <Card title="İlk iki haftada üç soru">
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 4 }}><span>Gerçekten ödeyen müşteri var mı? Kaç tane? Son 3 ayda kaç tane kayboldu?</span><Input.TextArea rows={2} value={(t.q1 as string) ?? ''} onChange={(e) => set('q1', e.target.value)} /></label>
          <label style={{ display: 'grid', gap: 4 }}><span>Hedef nedir? Hangi süre ve hangi parayla?</span><Input.TextArea rows={2} value={(t.q2 as string) ?? ''} onChange={(e) => set('q2', e.target.value)} /></label>
          <label style={{ display: 'grid', gap: 4 }}><span>En büyük işletme engeli ne?</span><Input.TextArea rows={2} value={(t.q3 as string) ?? ''} onChange={(e) => set('q3', e.target.value)} /></label>
          <label style={{ display: 'grid', gap: 4 }}><span>Yerine getirilmemiş sözler</span><Input.TextArea rows={2} value={(t.promises as string) ?? ''} onChange={(e) => set('promises', e.target.value)} placeholder="Vaat, kime verildi, durumu" /></label>
        </div>
      </Card>
      <Card title="Kontrol tablosu">
        <Table
          size="middle"
          pagination={false}
          rowKey="key"
          dataSource={CHECKS}
          scroll={{ x: 'max-content' }}
          columns={[
            { title: 'Soru', dataIndex: 'q' },
            { title: 'Cevap', key: 'c', render: (_, r) => <Switch checked={Boolean(t[r.key])} onChange={(v) => set(r.key, v)} checkedChildren="Evet" unCheckedChildren="Hayır" /> },
            { title: 'Sonuç', key: 's', render: (_, r) => (t[r.key] ? r.yes : <span>{r.no} <Link to={r.to}>Oraya git</Link></span>) },
          ]}
        />
      </Card>
      <Button type="primary" size="large" onClick={() => nav('/karar/1/adim/00')}>Adım 00 ile başla</Button>
    </div>
  )
}

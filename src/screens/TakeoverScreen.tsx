import { Button, Input, Switch, Table } from 'antd'
import { ArrowRight } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { Callout } from '@/components/Callout'
import { PageHeader, SectionHead } from '@/components/PageHeader'
import '@/styles/screens-pano.css'

const CHECKS: { key: string; q: string; yes: string; no: string; to: string }[] = [
  { key: 'problem', q: 'Problem gerçek müşteriyle doğrulandı mı?', yes: 'Kapı 2 geçildi sayılır.', no: "Adım 06'dan girin.", to: '/karar/2/adim/06' },
  { key: 'odeme', q: 'Ödeme veya depozito kanıtı var mı?', yes: 'Kapı 4 geçildi sayılır.', no: 'Problem doğrulandıysa Adım 15. Doğrulanmadıysa Adım 06.', to: '/karar/4/adim/15' },
  { key: 'strateji', q: 'Yazılı bir strateji ve vazgeçiş listesi var mı?', yes: 'Kapı 5 geçildi sayılır.', no: "Adım 18'den girin.", to: '/karar/5/adim/18' },
  { key: 'olcum', q: 'Ölçüm düzeni ve eşikler var mı?', yes: 'Adım 22 tamam.', no: "Adım 22'den girin.", to: '/karar/6/adim/22' },
  { key: 'kapi', q: 'İlk ürün kapısı kararı yazılı mı?', yes: 'Kapı 6 geçildi sayılır.', no: 'Adım 22 eşiklerini şimdi yazın. 4 hafta ölçün. Sonra Adım 25.', to: '/karar/6/adim/22' },
  { key: 'uyum', q: 'Uyum ölçüldü mü?', yes: "Kapı 7'ye yakınsınız.", no: "Adım 28'den girin.", to: '/karar/7/adim/28' },
  { key: 'ekonomi', q: 'Birim ekonomisi gerçek veriyle hesaplandı mı?', yes: 'Adım 29 tamam.', no: "Adım 29'dan girin.", to: '/karar/7/adim/29' },
]

const QUESTIONS: { key: string; label: string; placeholder?: string }[] = [
  { key: 'q1', label: 'Gerçekten ödeyen müşteri var mı? Kaç tane? Son 3 ayda kaç tane kayboldu?' },
  { key: 'q2', label: 'Hedef nedir? Hangi süre ve hangi parayla?' },
  { key: 'q3', label: 'En büyük işletme engeli ne?' },
  { key: 'promises', label: 'Yerine getirilmemiş sözler', placeholder: 'Vaat, kime verildi, durumu' },
]

export function TakeoverScreen() {
  const nav = useNavigate()
  const plan = useCurrentPlan()
  const update = usePlanStore((s) => s.update)
  if (!plan) return null
  const t = (plan.takeover ?? {}) as Record<string, unknown>
  const set = (k: string, v: unknown) =>
    update((p) => {
      p.takeover = { ...(p.takeover ?? {}), [k]: v }
    })
  return (
    <div className="page">
      <PageHeader
        title="Devralma girişi"
        documentTitle="Devralma"
        kicker="Devralma"
        description="Çalışan bir işi devralıyorsunuz. Planı baştan değil, ortasından başlatırsınız. Adım 00, 01, 02 ve 05 her devralmada yapılır."
      />
      <Callout tone="uyari" title="Vaatleri sonuçlarla karşılaştırın">
        Yerine getirilmemiş sözleri ayrıca yazın. Kaydı olmayan cevabı "bilinmiyor" diye yazın. Hiç kayıt yoksa önce 4 haftalık ölçüm yapın. Karar vermeyin.
      </Callout>
      <section className="form-section" aria-labelledby="sorular-title">
        <div className="section-head">
          <h2 id="sorular-title">İlk iki haftada üç soru</h2>
          <p>Cevapları kısa yazın. Bilmediğiniz yere "bilinmiyor" yazın.</p>
        </div>
        {QUESTIONS.map((q) => (
          <label key={q.key} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
            <span className="field-label">{q.label}</span>
            <Input.TextArea rows={2} value={(t[q.key] as string) ?? ''} onChange={(e) => set(q.key, e.target.value)} placeholder={q.placeholder} />
          </label>
        ))}
      </section>
      <section className="form-section" aria-labelledby="kontrol-title">
        <SectionHead title="Kontrol tablosu" description="Her soruya Evet ya da Hayır deyin. Hayır olan satır sizi doğru adıma götürür." />
        <Table
          size="middle"
          pagination={false}
          rowKey="key"
          dataSource={CHECKS}
          scroll={{ x: 'max-content' }}
          columns={[
            { title: 'Soru', dataIndex: 'q', width: 280 },
            {
              title: 'Cevap',
              key: 'c',
              width: 120,
              render: (_, r) => <Switch checked={Boolean(t[r.key])} onChange={(v) => set(r.key, v)} checkedChildren="Evet" unCheckedChildren="Hayır" aria-label={r.q} />,
            },
            {
              title: 'Sonuç',
              key: 's',
              width: 260,
              render: (_, r) =>
                t[r.key] ? (
                  r.yes
                ) : (
                  <span>
                    {r.no} <Link to={r.to}>Oraya git</Link>
                  </span>
                ),
            },
          ]}
        />
      </section>
      <div className="action-row">
        <Button type="primary" icon={<ArrowRight size={16} />} iconPlacement="end" onClick={() => nav('/karar/1/adim/00')}>
          Adım 00 ile başla
        </Button>
      </div>
    </div>
  )
}

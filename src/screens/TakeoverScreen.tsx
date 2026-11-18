import '@/styles/ekran/TakeoverScreen.css'
import { Button, Card, ConfigProvider, Form, Input, Switch, Tag } from 'antd'
import { ArrowRight } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import { control, space } from '@/theme/tokens'
type Check = { key: string; q: string; yes: string; no: string; to: string }

const CHECKS: Check[] = [
  { key: 'problem', q: 'Problem gerçek müşteriyle doğrulandı mı?', yes: 'Kapı 2 geçildi sayılır.', no: "Adım 06'dan girin.", to: '/karar/2/adim/06' },
  { key: 'odeme', q: 'Ödeme veya depozito kanıtı var mı?', yes: 'Kapı 4 geçildi sayılır.', no: 'Problem doğrulandıysa Adım 15. Doğrulanmadıysa Adım 06.', to: '/karar/4/adim/15' },
  { key: 'yollar', q: 'Para hesabı, risk kuralları ve yol adayları yazılı mı?', yes: 'Kapı 5 geçildi sayılır. Geçiş kapısında karar kaydedin.', no: "Adım 16'dan girin.", to: '/karar/5/adim/16' },
  { key: 'strateji', q: 'Yazılı bir strateji seçimi ve vazgeçiş listesi var mı?', yes: 'Strateji oluşturma yapılmış sayılır. Seçimi strateji oluşturma adımlarına yazın.', no: 'Önce geçiş kapısından geçin. Sonra 2.1 Teşhis adımından başlayın.', to: '/gecis' },
  { key: 'olcum', q: 'Ölçüm düzeni ve eşikler var mı?', yes: 'Adım 22 tamam.', no: "Adım 22'den girin.", to: '/karar/6/adim/22' },
  { key: 'kapi', q: 'İlk ürün kapısı kararı yazılı mı?', yes: 'Kapı 6 geçildi sayılır.', no: 'Adım 22 eşiklerini şimdi yazın. 4 hafta ölçün. Sonra Adım 25.', to: '/karar/6/adim/22' },
  { key: 'uyum', q: 'Uyum ölçüldü mü?', yes: "Kapı 7'ye yakınsınız.", no: "Adım 28'den girin.", to: '/karar/7/adim/28' },
  { key: 'ekonomi', q: 'Birim ekonomisi gerçek veriyle hesaplandı mı?', yes: 'Adım 29 tamam.', no: "Adım 29'dan girin.", to: '/karar/7/adim/29' },
]

const QUESTIONS: { key: string; label: string; tooltip: string; extra: string; placeholder?: string }[] = [
  {
    key: 'q1',
    label: 'Gerçekten ödeyen müşteri var mı?',
    tooltip: 'Para ödeyen müşteriyi sayın. Deneme ve ücretsiz kullanıcı sayılmaz.',
    extra: 'Kaç tane olduğunu yazın. Son 3 ayda kaç tane kaybolduğunu da yazın.',
    placeholder: 'Örnek: 12 ödeyen müşteri. Son 3 ayda 2 müşteri gitti.',
  },
  {
    key: 'q2',
    label: 'Hedef nedir?',
    tooltip: 'Hedefi süre ve parayla yazın. Belirsiz hedef karar vermeyi geciktirir.',
    extra: 'Hangi süre ve hangi parayla ulaşılacak?',
    placeholder: 'Örnek: 6 ayda aylık 50.000 TL gelir. Bütçe 120.000 TL.',
  },
  {
    key: 'q3',
    label: 'En büyük işletme engeli ne?',
    tooltip: 'Tek bir engel yazın. Listeyi uzatmayın.',
    extra: 'Bugün işi en çok yavaşlatan şeyi yazın.',
    placeholder: 'Örnek: Tahsilat 60 günü geçiyor.',
  },
  {
    key: 'promises',
    label: 'Yerine getirilmemiş sözler',
    tooltip: 'Eski sahibin müşteriye, çalışana ya da tedarikçiye verdiği sözler.',
    extra: 'Her sözü ayrı satıra yazın. Vaat, kime verildi, durumu.',
    placeholder: 'Örnek: Nisan teslimi, Ahmet Bey, gecikti.',
  },
  {
    key: 'oldDecisions',
    label: 'Hangi eski karar bugün yeniden sınanmalı?',
    tooltip: 'Geçmişte işe yarayan uygulama bugün işe yaramayabilir.',
    extra: 'Eski kararı ve o günden beri değişen koşulu yazın.',
    placeholder: 'Örnek: Yalnız toptan satış kararı. Müşteriler artık küçük parti istiyor.',
  },
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
  const answered = QUESTIONS.filter((q) => String(t[q.key] ?? '').trim().length > 0).length
  const yesCount = CHECKS.filter((c) => Boolean(t[c.key])).length

  return (
    <div className="page page-devralma">
      <PageHeader
        title="Devralma girişi"
        documentTitle="Devralma"
        kicker="Devralma"
        description="Çalışan bir işi devralıyorsunuz. Planı baştan değil, ortasından başlatırsınız. Adım 00, 01, 02 ve 05 her devralmada yapılır."
        actions={
          <Button type="primary" icon={<ArrowRight size={16} />} iconPlacement="end" onClick={() => nav('/karar/1/adim/00')}>
            Adım 00 ile başla
          </Button>
        }
      />
      <Callout tone="uyari" title="Vaatleri sonuçlarla karşılaştırın">
        Yerine getirilmemiş sözleri ayrıca yazın. Kaydı olmayan cevabı "bilinmiyor" diye yazın. Hiç kayıt yoksa önce 4 haftalık ölçüm yapın. Karar vermeyin.
      </Callout>

      <div className="devralma-grid">
        <Card title="İlk iki haftanın soruları" extra={<span>{answered} / {QUESTIONS.length} cevaplandı</span>}>
          <Form layout="vertical" className="devralma-form" requiredMark={false} onFinish={() => nav('/karar/1/adim/00')}>
            {QUESTIONS.map((q) => (
              <Form.Item key={q.key} label={q.label} htmlFor={`devralma-${q.key}`} tooltip={q.tooltip} extra={<span id={`devralma-${q.key}-help`}>{q.extra}</span>}>
                <Input.TextArea id={`devralma-${q.key}`} aria-describedby={`devralma-${q.key}-help`} autoSize={{ minRows: 2, maxRows: 8 }} value={(t[q.key] as string) ?? ''} onChange={(e) => set(q.key, e.target.value)} placeholder={q.placeholder} aria-label={q.label} />
              </Form.Item>
            ))}
          </Form>
        </Card>

        <Card title="Devralma kontrolleri" extra={<span>{yesCount} / {CHECKS.length} evet</span>}>
          <p className="helper" style={{ margin: 0 }}>
            Her soruya Evet ya da Hayır deyin. Hayır cevabının altındaki bağlantı, ilgili adımı açar.
          </p>
          <ConfigProvider theme={{ components: { Switch: {
            trackHeight: control.touch,
            trackMinWidth: control.touch * 2,
            handleSize: control.touch - space.sm,
            trackPadding: space.xs,
            innerMinMargin: space.sm,
            innerMaxMargin: control.touch,
          } } }}>
            <ul className="devralma-checks" aria-label="Devralma kontrolleri">
              {CHECKS.map((check) => (
                <li key={check.key}>
                  <h3 className="devralma-check-question" id={`devralma-${check.key}`}>{check.q}</h3>
                  <Switch checked={Boolean(t[check.key])} onChange={(value) => set(check.key, value)} checkedChildren="Evet" unCheckedChildren="Hayır" aria-labelledby={`devralma-${check.key}`} />
                  <div className="devralma-result">
                    {t[check.key] ? <><Tag color="success">Geçildi</Tag><span>{check.yes}</span></> : <><span>{check.no}</span><Link to={check.to}>Oraya git</Link></>}
                  </div>
                </li>
              ))}
            </ul>
          </ConfigProvider>
        </Card>
      </div>
    </div>
  )
}

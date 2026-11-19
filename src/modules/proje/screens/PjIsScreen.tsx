import '@/styles/ekran/PjIsScreen.css'
import { useState, type FormEvent } from 'react'
import { App as AntApp, Button, Input, Popconfirm } from 'antd'
import { ArrowLeft, FloppyDisk, Trash } from '@phosphor-icons/react'
import { useNavigate, useParams } from 'react-router'
import { useCurrentPlanView } from '@/platform/planSource'
import { PageHeader } from '@/components/PageHeader'
import { PjBosEkran } from '../components/PjBosEkran'
import { PjDurumSecici } from '../components/PjDurumSecici'
import { PjGecikti } from '../components/PjIsKarti'
import { gecikmisMi, type IsDegisikligi } from '../domain/islemler'
import { SINIR, type Is, type Proje } from '../domain/model'
import { bugunIso, tarihYaz } from '../domain/tarih'
import { projeDepo } from '../projeDepo'
import { useProjeVerisi } from '../useProjeVerisi'

/** Projedeki tek işin ekranı. İşin bütün bilgileri burada değişir. */
export default function PjIsScreen() {
  const plan = useCurrentPlanView()
  const { pid = '', iid = '' } = useParams()
  const nav = useNavigate()
  const veri = useProjeVerisi(plan?.id)
  if (!plan) return null
  const projeAdresi = `/projeler/${encodeURIComponent(pid)}`
  if (veri.yukleniyor) {
    return (
      <div className="page pj-is">
        <PageHeader title="Proje işi" kicker="Proje yönetimi" />
        <p className="pj-is-not" role="status">İş yükleniyor.</p>
      </div>
    )
  }
  const proje = veri.projeler.find((p) => p.id === pid)
  const is = veri.isler.find((x) => x.id === iid && x.projeId === pid)
  if (!proje || !is) {
    return (
      <PjBosEkran
        title="Proje işi"
        kicker="Proje yönetimi"
        description="Bu ekran projedeki tek bir işi gösterir."
        emptyTitle={veri.hata ?? 'İş bulunamadı.'}
        text="İş silinmiş olabilir. Projeye dönün."
        actions={<Button onClick={() => nav(proje ? projeAdresi : '/projeler')}>{proje ? 'Projeye dön' : 'Projelere dön'}</Button>}
      />
    )
  }
  return <IsFormu key={is.id} proje={proje} is={is} projeAdresi={projeAdresi} />
}

function IsFormu({ proje, is, projeAdresi }: { proje: Proje; is: Is; projeAdresi: string }) {
  const nav = useNavigate()
  const { message } = AntApp.useApp()
  const [taslak, setTaslak] = useState<Required<IsDegisikligi>>({ baslik: is.baslik, durum: is.durum, sorumlu: is.sorumlu, sonTarih: is.sonTarih, not: is.not })
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [hata, setHata] = useState('')
  const bugun = bugunIso(new Date())
  const alan = (k: 'baslik' | 'sorumlu' | 'sonTarih' | 'not') => (e: { target: { value: string } }) => setTaslak((t) => ({ ...t, [k]: e.target.value }))
  const gec = gecikmisMi(is, bugun)

  const kaydet = async (e: FormEvent) => {
    e.preventDefault()
    setKaydediliyor(true)
    setHata('')
    try {
      await projeDepo.isDegistir(proje.planId, is.id, taslak)
      message.success('İş kaydedildi.')
    } catch (error) {
      setHata(error instanceof Error ? error.message : 'İş kaydedilemedi.')
    } finally {
      setKaydediliyor(false)
    }
  }

  const sil = async () => {
    try {
      await projeDepo.isSil(proje.planId, is.id)
      message.success('İş silindi.')
      nav(projeAdresi)
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'İş silinemedi.')
    }
  }

  return (
    <div className="page pj-is">
      <PageHeader
        title={is.baslik}
        documentTitle={`İş: ${is.baslik}`}
        kicker={`Proje: ${proje.ad}`}
        description="İşin bilgilerini değiştirin. Sonra “Kaydet” düğmesine basın."
        actions={<Button icon={<ArrowLeft size={18} aria-hidden />} onClick={() => nav(projeAdresi)}>Projeye dön</Button>}
      />
      {gec ? (
        <p className="pj-is-uyari">
          <PjGecikti />
          <span>Son tarih {tarihYaz(is.sonTarih)} günüydü. İş henüz bitmedi.</span>
        </p>
      ) : null}
      <form className="pj-is-form" onSubmit={(e) => void kaydet(e)}>
        <label className="pj-is-etiket" htmlFor="pj-is-baslik">İş başlığı</label>
        <Input id="pj-is-baslik" value={taslak.baslik} maxLength={SINIR.baslik} onChange={alan('baslik')} autoComplete="off" />
        <label className="pj-is-etiket" htmlFor="pj-is-durum">Durum</label>
        <PjDurumSecici id="pj-is-durum" value={taslak.durum} baslik={is.baslik} onChange={(durum) => setTaslak((t) => ({ ...t, durum }))} />
        <label className="pj-is-etiket" htmlFor="pj-is-sorumlu">Sorumlu kişi</label>
        <Input id="pj-is-sorumlu" value={taslak.sorumlu} maxLength={SINIR.sorumlu} onChange={alan('sorumlu')} autoComplete="off" placeholder="Örneğin dijital ekip" />
        <label className="pj-is-etiket" htmlFor="pj-is-tarih">Son tarih</label>
        <Input id="pj-is-tarih" type="date" value={taslak.sonTarih} onChange={alan('sonTarih')} aria-describedby="pj-is-tarih-yardim" />
        <p className="pj-is-yardim" id="pj-is-tarih-yardim">{taslak.sonTarih ? `Seçilen gün: ${tarihYaz(taslak.sonTarih)}.` : 'Son tarih yazılmadı.'}</p>
        <label className="pj-is-etiket" htmlFor="pj-is-not">Not</label>
        <Input.TextArea id="pj-is-not" value={taslak.not} maxLength={SINIR.not} autoSize={{ minRows: 4 }} onChange={alan('not')} />
        {hata ? <p className="pj-is-hata" role="alert">{hata}</p> : null}
        <div className="pj-is-dugmeler">
          <Button type="primary" htmlType="submit" icon={<FloppyDisk size={18} aria-hidden />} loading={kaydediliyor}>Kaydet</Button>
          <Popconfirm
            title="İş silinsin mi?"
            description="Bu işlem geri alınamaz."
            okText="Sil"
            cancelText="Vazgeç"
            okButtonProps={{ danger: true }}
            onConfirm={() => void sil()}
          >
            <Button danger icon={<Trash size={18} aria-hidden />}>İşi sil</Button>
          </Popconfirm>
        </div>
      </form>
    </div>
  )
}

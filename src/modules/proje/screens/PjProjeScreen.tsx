import '@/styles/ekran/PjProjeScreen.css'
import { useRef, useState, type FormEvent } from 'react'
import { App as AntApp, Button, Input, Popconfirm, Segmented } from 'antd'
import type { InputRef } from 'antd'
import { ArrowLeft, PencilSimple, Plus, Trash } from '@phosphor-icons/react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { selectExecutionTasks, selectStrategyMoves, type ReadonlyPlan } from '@/contracts'
import { useCurrentPlanView } from '@/platform/planSource'
import { scrollRegionWithKeyboard } from '@/components/keyboardScroll'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { PjBosEkran } from '../components/PjBosEkran'
import { PjGecikti, PjIsKarti } from '../components/PjIsKarti'
import { isOzeti, type ProjeDegisikligi } from '../domain/islemler'
import { DURUM_ADI, IS_DURUMLARI, SINIR, type Is, type IsDurumu, type Proje } from '../domain/model'
import { bugunIso, tarihYaz } from '../domain/tarih'
import { projeDepo } from '../projeDepo'
import { useProjeVerisi } from '../useProjeVerisi'

type Gorunum = 'liste' | 'pano'
const GORUNUMLER = [
  { value: 'liste' as const, label: 'Liste' },
  { value: 'pano' as const, label: 'Pano' },
]

/** Görünüm adreste durur. Adreste yoksa geniş ekranda pano, dar ekranda liste açılır. */
function varsayilanGorunum(): Gorunum {
  return typeof window !== 'undefined' && window.matchMedia?.('(min-width: 64em)').matches ? 'pano' : 'liste'
}

/** Tek projenin ekranı. İşler liste ya da pano olarak görünür. */
export default function PjProjeScreen() {
  const plan = useCurrentPlanView()
  const { pid = '' } = useParams()
  const nav = useNavigate()
  const veri = useProjeVerisi(plan?.id)
  if (!plan) return null
  const proje = veri.projeler.find((p) => p.id === pid)
  if (veri.yukleniyor) {
    return (
      <div className="page pj-proje">
        <PageHeader title="Proje" kicker="Proje yönetimi" />
        <p className="pj-proje-not" role="status">Proje yükleniyor.</p>
      </div>
    )
  }
  if (!proje) {
    return (
      <PjBosEkran
        title="Proje"
        kicker="Proje yönetimi"
        description="Bu ekran tek bir projenin işlerini gösterir."
        emptyTitle={veri.hata ?? 'Proje bulunamadı.'}
        text="Proje silinmiş olabilir. Projeler listesine dönün."
        actions={<Button onClick={() => nav('/projeler')}>Projelere dön</Button>}
      />
    )
  }
  return <ProjeIcerik key={proje.id} proje={proje} isler={veri.isler.filter((is) => is.projeId === proje.id)} bag={bagMetni(plan, proje)} />
}

/** Projenin bağlı olduğu satırı tek cümleyle anlatır. */
function bagMetni(plan: ReadonlyPlan, proje: Proje): string {
  if (!proje.moveRowId) return 'Bu proje bir ana hamleye bağlı değil.'
  const hamle = selectStrategyMoves(plan).find((m) => m.rowId === proje.moveRowId)
  if (hamle) return `Bu proje şu ana hamleye bağlı: ${hamle.move}`
  const is = selectExecutionTasks(plan).find((t) => t.rowId === proje.moveRowId)
  if (is) return `Bu proje strateji uygulamadaki şu işe bağlı: ${is.action}`
  return 'Bu projenin bağlı olduğu satır stratejide artık yok.'
}

function ProjeIcerik({ proje, isler, bag }: { proje: Proje; isler: Is[]; bag: string }) {
  const nav = useNavigate()
  const { message } = AntApp.useApp()
  const [params, setParams] = useSearchParams()
  const [baslik, setBaslik] = useState('')
  const [ekleniyor, setEkleniyor] = useState(false)
  const [duyuru, setDuyuru] = useState('')
  const [mesgul, setMesgul] = useState<string | null>(null)
  const [duzenle, setDuzenle] = useState(false)
  const girdi = useRef<InputRef>(null)
  const bugun = bugunIso(new Date())
  const ozet = isOzeti(isler, bugun)
  const istenen = params.get('gorunum')
  const gorunum: Gorunum = istenen === 'pano' || istenen === 'liste' ? istenen : varsayilanGorunum()
  const adres = (is: Is) => `/projeler/${encodeURIComponent(proje.id)}/is/${encodeURIComponent(is.id)}`

  const ekle = async (e: FormEvent) => {
    e.preventDefault()
    if (ekleniyor) return
    if (!baslik.trim()) {
      message.error('İş başlığını yazın.')
      girdi.current?.focus()
      return
    }
    setEkleniyor(true)
    try {
      const yeni = await projeDepo.isEkle(proje.planId, proje.id, baslik)
      setBaslik('')
      setDuyuru(`"${yeni.baslik}" işi eklendi. Durumu "Yapılacak".`)
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'İş eklenemedi.')
    } finally {
      setEkleniyor(false)
      girdi.current?.focus()
    }
  }

  const durum = async (is: Is, d: IsDurumu) => {
    setMesgul(is.id)
    try {
      await projeDepo.durumDegistir(proje.planId, is.id, d)
      setDuyuru(`"${is.baslik}" işinin durumu "${DURUM_ADI[d]}" oldu.`)
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Durum değiştirilemedi.')
    } finally {
      setMesgul(null)
    }
  }

  const sil = async () => {
    try {
      await projeDepo.projeSil(proje.planId, proje.id)
      message.success('Proje silindi.')
      nav('/projeler')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Proje silinemedi.')
    }
  }

  const kart = (is: Is) => (
    <PjIsKarti is={is} adres={adres(is)} bugun={bugun} mesgul={mesgul === is.id} onDurum={(d) => void durum(is, d)} />
  )

  return (
    <div className="page pj-proje">
      <PageHeader
        title={proje.ad}
        documentTitle={`Proje: ${proje.ad}`}
        kicker="Proje"
        description={bag}
        actions={<Button icon={<ArrowLeft size={18} aria-hidden />} onClick={() => nav('/projeler')}>Projelere dön</Button>}
      />

      <dl className="pj-proje-ozet">
        <div><dt>Başlangıç</dt><dd>{proje.baslangic ? <time dateTime={proje.baslangic}>{tarihYaz(proje.baslangic)}</time> : 'Yazılmadı.'}</dd></div>
        <div><dt>Bitiş</dt><dd>{proje.bitis ? <time dateTime={proje.bitis}>{tarihYaz(proje.bitis)}</time> : 'Yazılmadı.'}</dd></div>
        <div><dt>Sorumlu</dt><dd>{proje.sorumlu || 'Yazılmadı.'}</dd></div>
        <div><dt>İşler</dt><dd>{ozet.toplam ? `${ozet.acik} açık, ${ozet.biten} bitti` : 'Henüz iş yok.'}</dd></div>
        {ozet.geciken ? <div><dt>Geciken</dt><dd className="pj-proje-geciken"><PjGecikti /> {ozet.geciken} iş</dd></div> : null}
        {proje.aciklama ? <div className="pj-proje-ozet-genis"><dt>Açıklama</dt><dd className="pj-proje-aciklama">{proje.aciklama}</dd></div> : null}
      </dl>

      <form className="pj-proje-ekle" onSubmit={(e) => void ekle(e)}>
        <label className="pj-proje-etiket" htmlFor="pj-yeni-is">Yeni iş</label>
        <p className="pj-proje-yardim" id="pj-yeni-is-yardim">İşin kısa başlığını yazın. Sonra “İş ekle” düğmesine basın.</p>
        <div className="pj-proje-ekle-satir">
          <Input
            id="pj-yeni-is"
            ref={girdi}
            value={baslik}
            maxLength={SINIR.baslik}
            onChange={(e) => setBaslik(e.target.value)}
            placeholder="Örneğin ürün fotoğraflarını yenileyin"
            aria-describedby="pj-yeni-is-yardim"
            autoComplete="off"
          />
          <Button type="primary" htmlType="submit" icon={<Plus size={18} aria-hidden />} loading={ekleniyor}>İş ekle</Button>
        </div>
      </form>
      <p className="pj-proje-duyuru" role="status" aria-live="polite">{duyuru}</p>

      <section className="pj-proje-isler" aria-labelledby="pj-isler-baslik">
        <div className="pj-proje-isler-ust">
          <h2 id="pj-isler-baslik" className="pj-proje-baslik">İşler</h2>
          <Segmented<Gorunum>
            aria-label="Görünüm"
            options={GORUNUMLER}
            value={gorunum}
            onChange={(v) => setParams((p) => {
              const sonraki = new URLSearchParams(p)
              sonraki.set('gorunum', v)
              return sonraki
            }, { replace: true })}
          />
        </div>
        {isler.length === 0 ? (
          <EmptyState title="Henüz iş yok." text="Yukarıya bir iş yazın. Sonra “İş ekle” düğmesine basın." />
        ) : gorunum === 'liste' ? (
          <ol className="pj-proje-liste" aria-label="İş listesi">
            {isler.map((is) => <li key={is.id}>{kart(is)}</li>)}
          </ol>
        ) : (
          <div
            className="pj-pano"
            role="region"
            aria-label="İş panosu. Sütunlar yana kayar."
            tabIndex={0}
            onKeyDown={scrollRegionWithKeyboard}
          >
            {IS_DURUMLARI.map((d) => {
              const sutun = isler.filter((is) => is.durum === d)
              return (
                <section key={d} className="pj-pano-sutun" aria-labelledby={`pj-sutun-${d}`}>
                  <h3 id={`pj-sutun-${d}`} className="pj-pano-baslik">
                    {DURUM_ADI[d]} <span className="pj-pano-sayi">{sutun.length} iş</span>
                  </h3>
                  {sutun.length === 0 ? <p className="pj-pano-bos">Bu sütunda iş yok.</p> : (
                    <ul className="pj-pano-liste">
                      {sutun.map((is) => <li key={is.id}>{kart(is)}</li>)}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </section>

      <section className="pj-proje-ayar" aria-labelledby="pj-ayar-baslik">
        <h2 id="pj-ayar-baslik" className="pj-proje-baslik">Proje bilgileri</h2>
        <div className="pj-proje-ayar-dugmeler">
          <Button icon={<PencilSimple size={18} aria-hidden />} aria-expanded={duzenle} aria-controls="pj-proje-form" onClick={() => setDuzenle((v) => !v)}>
            {duzenle ? 'Düzenlemeyi kapat' : 'Proje bilgilerini düzenle'}
          </Button>
          <Popconfirm
            title="Proje silinsin mi?"
            description="Projenin bütün işleri de silinir. Bu işlem geri alınamaz."
            okText="Sil"
            cancelText="Vazgeç"
            okButtonProps={{ danger: true }}
            onConfirm={() => void sil()}
          >
            <Button danger icon={<Trash size={18} aria-hidden />}>Projeyi sil</Button>
          </Popconfirm>
        </div>
        {duzenle ? <ProjeFormu proje={proje} kapat={() => setDuzenle(false)} /> : null}
      </section>
    </div>
  )
}

function ProjeFormu({ proje, kapat }: { proje: Proje; kapat: () => void }) {
  const { message } = AntApp.useApp()
  const [taslak, setTaslak] = useState<Required<ProjeDegisikligi>>({ ad: proje.ad, baslangic: proje.baslangic, bitis: proje.bitis, sorumlu: proje.sorumlu, aciklama: proje.aciklama })
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [hata, setHata] = useState('')
  const alan = (k: keyof ProjeDegisikligi) => (e: { target: { value: string } }) => setTaslak((t) => ({ ...t, [k]: e.target.value }))

  const kaydet = async (e: FormEvent) => {
    e.preventDefault()
    setKaydediliyor(true)
    setHata('')
    try {
      await projeDepo.projeDegistir(proje.planId, proje.id, taslak)
      message.success('Proje bilgileri kaydedildi.')
      kapat()
    } catch (error) {
      setHata(error instanceof Error ? error.message : 'Proje kaydedilemedi.')
    } finally {
      setKaydediliyor(false)
    }
  }

  return (
    <form id="pj-proje-form" className="pj-proje-form" onSubmit={(e) => void kaydet(e)}>
      <label className="pj-proje-etiket" htmlFor="pj-proje-ad">Proje adı</label>
      <Input id="pj-proje-ad" value={taslak.ad} maxLength={SINIR.ad} onChange={alan('ad')} autoComplete="off" />
      <label className="pj-proje-etiket" htmlFor="pj-proje-baslangic">Başlangıç tarihi</label>
      <Input id="pj-proje-baslangic" type="date" value={taslak.baslangic} onChange={alan('baslangic')} />
      <label className="pj-proje-etiket" htmlFor="pj-proje-bitis">Bitiş tarihi</label>
      <Input id="pj-proje-bitis" type="date" value={taslak.bitis} onChange={alan('bitis')} />
      <label className="pj-proje-etiket" htmlFor="pj-proje-sorumlu">Sorumlu kişi</label>
      <Input id="pj-proje-sorumlu" value={taslak.sorumlu} maxLength={SINIR.sorumlu} onChange={alan('sorumlu')} autoComplete="off" />
      <label className="pj-proje-etiket" htmlFor="pj-proje-aciklama">Kısa açıklama</label>
      <Input.TextArea id="pj-proje-aciklama" value={taslak.aciklama} maxLength={SINIR.aciklama} autoSize={{ minRows: 3 }} onChange={alan('aciklama')} />
      {hata ? <p className="pj-proje-hata" role="alert">{hata}</p> : null}
      <div className="pj-proje-ayar-dugmeler">
        <Button htmlType="submit" loading={kaydediliyor}>Bilgileri kaydet</Button>
        <Button type="text" onClick={kapat}>Vazgeç</Button>
      </div>
    </form>
  )
}

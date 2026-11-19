import '@/styles/ekran/PjProjelerScreen.css'
import { useState, type FormEvent } from 'react'
import { App as AntApp, Button, Input } from 'antd'
import { FolderPlus } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router'
import { isStrategyApproved, selectExecutionTasks, selectStrategyMoves, type ReadonlyPlan } from '@/contracts'
import { useCurrentPlanView } from '@/platform/planSource'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { PjBosEkran } from '../components/PjBosEkran'
import { PjGecikti } from '../components/PjIsKarti'
import { isOzeti, type ProjeGirdisi } from '../domain/islemler'
import type { Is, Proje } from '../domain/model'
import { bugunIso, tarihGecerliMi, tarihYaz } from '../domain/tarih'
import { projeDepo } from '../projeDepo'
import { useProjeVerisi } from '../useProjeVerisi'

const KICKER = 'Proje yönetimi'
const DESCRIPTION = 'Projeler stratejideki ana hamleleri görevlere böler. Bu bölüm numaralı aşamaların dışındadır.'

/** Proje listesi. Strateji onaylanmadan proje açılmaz. Ekran bunun nedenini söyler. */
export default function PjProjelerScreen() {
  const plan = useCurrentPlanView()
  const nav = useNavigate()
  if (!plan) return null
  if (!isStrategyApproved(plan)) {
    return (
      <PjBosEkran
        title="Projeler"
        kicker={KICKER}
        description={DESCRIPTION}
        emptyTitle="Projeler burada görünecek."
        text="Önce strateji belgesini onaylayın. Strateji onaylanınca ana hamlelerden proje açabilirsiniz."
        actions={<Button onClick={() => nav('/strateji')}>Strateji oluşturmaya git</Button>}
      />
    )
  }
  return <ProjelerIcerik plan={plan} />
}

function sayiMetni(isler: readonly Is[], bugun: string) {
  const o = isOzeti(isler, bugun)
  if (!o.toplam) return 'Henüz görev yok.'
  return `${o.acik} açık görev. ${o.biten} görev bitti.`
}

function ProjelerIcerik({ plan }: { plan: ReadonlyPlan }) {
  const nav = useNavigate()
  const { message } = AntApp.useApp()
  const veri = useProjeVerisi(plan.id)
  const [mesgul, setMesgul] = useState<string | null>(null)
  const [yeniAd, setYeniAd] = useState('')
  const bugun = bugunIso(new Date())
  const hamleler = selectStrategyMoves(plan)
  const simdiIsleri = selectExecutionTasks(plan).filter((t) => t.horizon === 'now')
  const bagliSayisi = (rowId: string) => veri.projeler.filter((p) => p.moveRowId === rowId).length
  const bagMetni = (p: Proje) => {
    if (!p.moveRowId) return 'Bu proje bir ana hamleye bağlı değil.'
    const hamle = hamleler.find((m) => m.rowId === p.moveRowId)
    if (hamle) return `Ana hamle: ${hamle.move}`
    const is = simdiIsleri.find((t) => t.rowId === p.moveRowId)
    return is ? `İlk 90 günün işi: ${is.action}` : 'Bağlı olduğu satır stratejide artık yok.'
  }

  const ac = async (anahtar: string, girdi: ProjeGirdisi) => {
    if (mesgul) return
    setMesgul(anahtar)
    try {
      const p = await projeDepo.projeAc(plan.id, girdi)
      nav(`/projeler/${encodeURIComponent(p.id)}`)
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Proje açılamadı.')
      setMesgul(null)
    }
  }

  const bagsizAc = (e: FormEvent) => {
    e.preventDefault()
    if (!yeniAd.trim()) {
      message.error('Proje adını yazın.')
      return
    }
    void ac('bagsiz', { ad: yeniAd })
  }

  return (
    <div className="page pj-projeler">
      <PageHeader
        title="Projeler"
        kicker={KICKER}
        description="Proje, bir ana hamleyi küçük görevlere böler. Görevlerin durumunu buradan izlersiniz. Projeler planın kararlarını değiştirmez."
      />

      <section className="pj-projeler-bolum" aria-labelledby="pj-projeleriniz">
        <h2 id="pj-projeleriniz" className="pj-projeler-baslik">Projeleriniz</h2>
        {veri.yukleniyor ? <p className="pj-projeler-not" role="status">Projeler yükleniyor.</p> : null}
        {veri.hata ? <p className="pj-projeler-not" role="alert">{veri.hata}</p> : null}
        {!veri.yukleniyor && !veri.hata && veri.projeler.length === 0 ? (
          <EmptyState title="Henüz proje yok." text="Aşağıdan bir ana hamle seçin. Sonra “Bu hamleden proje aç” düğmesine basın." />
        ) : null}
        {veri.projeler.length > 0 ? (
          <ul className="pj-projeler-liste">
            {veri.projeler.map((p) => {
              const isler = veri.isler.filter((is) => is.projeId === p.id)
              const geciken = isOzeti(isler, bugun).geciken
              return (
                <li key={p.id} className="pj-projeler-kart">
                  <h3 className="pj-projeler-kart-ad">
                    <Link to={`/projeler/${encodeURIComponent(p.id)}`}>{p.ad}</Link>
                  </h3>
                  <p className="pj-projeler-kart-bilgi">{bagMetni(p)}</p>
                  <p className="pj-projeler-kart-bilgi">
                    <span>{sayiMetni(isler, bugun)}</span>
                    {geciken ? (
                      <span className="pj-projeler-geciken">
                        <PjGecikti />
                        <span>{geciken} görevin son tarihi geçti.</span>
                      </span>
                    ) : null}
                  </p>
                  {p.baslangic ? (
                    <p className="pj-projeler-kart-bilgi">
                      Başlangıç: <time dateTime={p.baslangic}>{tarihYaz(p.baslangic)}</time>
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : null}
      </section>

      <section className="pj-projeler-bolum" aria-labelledby="pj-hamleler">
        <h2 id="pj-hamleler" className="pj-projeler-baslik">Ana hamleler</h2>
        <p className="pj-projeler-aciklama">Ana hamle, stratejinin büyük bir parçasıdır. Bir hamleden proje açınca proje o hamleye bağlanır.</p>
        {hamleler.length === 0 ? <p className="pj-projeler-not">Strateji belgesinde ana hamle yok.</p> : (
          <ul className="pj-projeler-liste">
            {hamleler.map((m) => {
              const n = bagliSayisi(m.rowId)
              return (
                <li key={m.rowId} className="pj-projeler-kaynak">
                  <p className="pj-projeler-kaynak-ad">{m.move}</p>
                  {m.serves ? <p className="pj-projeler-kart-bilgi">Amacı: {m.serves}</p> : null}
                  <p className="pj-projeler-kart-bilgi">{n ? `Bu hamleye bağlı ${n} proje var.` : 'Bu hamleye bağlı proje yok.'}</p>
                  <Button
                    icon={<FolderPlus size={18} aria-hidden />}
                    loading={mesgul === m.rowId}
                    disabled={Boolean(mesgul) && mesgul !== m.rowId}
                    aria-label={`Bu hamleden proje aç: ${m.move}`}
                    onClick={() => void ac(m.rowId, { ad: m.move, moveRowId: m.rowId, aciklama: m.serves ?? '' })}
                  >
                    Bu hamleden proje aç
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {simdiIsleri.length > 0 ? (
        <section className="pj-projeler-bolum" aria-labelledby="pj-simdi">
          <h2 id="pj-simdi" className="pj-projeler-baslik">İlk 90 günün işleri</h2>
        <p className="pj-projeler-aciklama">Bu işler strateji uygulamadaki “Şimdi” listesindedir. Büyük bir işi projeye çevirebilirsiniz.</p>
          <ul className="pj-projeler-liste">
            {simdiIsleri.map((t) => {
              const n = bagliSayisi(t.rowId)
              const bitis = t.dueDate && tarihGecerliMi(t.dueDate) && t.dueDate >= bugun ? t.dueDate : undefined
              return (
                <li key={t.rowId} className="pj-projeler-kaynak">
                  <p className="pj-projeler-kaynak-ad">{t.action}</p>
                  {t.owner || tarihGecerliMi(t.dueDate) ? (
                    <p className="pj-projeler-kart-bilgi">
                      {t.owner ? <span>Sorumlu: {t.owner}.</span> : null}
                      {t.dueDate && tarihGecerliMi(t.dueDate) ? <span>Bitiş: {tarihYaz(t.dueDate)}.</span> : null}
                    </p>
                  ) : null}
                  <p className="pj-projeler-kart-bilgi">{n ? `Bu işe bağlı ${n} proje var.` : 'Bu işe bağlı proje yok.'}</p>
                  <Button
                    icon={<FolderPlus size={18} aria-hidden />}
                    loading={mesgul === t.rowId}
                    disabled={Boolean(mesgul) && mesgul !== t.rowId}
                    aria-label={`Bu işten proje aç: ${t.action}`}
                    onClick={() => void ac(t.rowId, { ad: t.action, moveRowId: t.rowId, sorumlu: t.owner ?? '', bitis })}
                  >
                    Bu işten proje aç
                  </Button>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      <section className="pj-projeler-bolum" aria-labelledby="pj-bagsiz">
        <h2 id="pj-bagsiz" className="pj-projeler-baslik">Başka bir proje</h2>
        <p className="pj-projeler-aciklama">Bir hamleye bağlı olmayan proje de açabilirsiniz. Projenin adını yazın.</p>
        <form className="pj-projeler-form" onSubmit={bagsizAc}>
          <label className="pj-projeler-etiket" htmlFor="pj-yeni-proje">Proje adı</label>
          <div className="pj-projeler-form-satir">
            <Input id="pj-yeni-proje" value={yeniAd} maxLength={120} onChange={(e) => setYeniAd(e.target.value)} placeholder="Örneğin depo düzeni" autoComplete="off" />
            <Button htmlType="submit" loading={mesgul === 'bagsiz'} disabled={Boolean(mesgul) && mesgul !== 'bagsiz'}>Proje aç</Button>
          </div>
        </form>
      </section>
    </div>
  )
}

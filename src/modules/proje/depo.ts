/**
 * Proje deposu. Kayıtlar modül deposunda durur. Plan dosyasına yazılmaz.
 * Anahtar biçimi: "<plan>/proje/<proje>" ve "<plan>/is/<iş>".
 * Her yazmadan sonra planın küçük özeti yenilenir. Çekirdek bu özeti rozet için okuyabilir.
 */
import type { KvStore } from '@/platform/kv'
import { SINIR, type Is, type IsDurumu, type Proje } from './domain/model'
import {
  durumDegistir,
  isiGuncelle,
  isleriSirala,
  planOzeti,
  projeyiGuncelle,
  sonrakiSira,
  yeniIs,
  yeniProje,
  type IsDegisikligi,
  type PlanOzeti,
  type ProjeDegisikligi,
  type ProjeGirdisi,
} from './domain/islemler'
import { bugunIso } from './domain/tarih'

export interface ProjeDepoAyarlari {
  /** Modülün kendi deposu. Anahtarlar plan kimliğiyle başlar. */
  store: KvStore
  ozetYaz: (planId: string, ozet: PlanOzeti) => void
  simdi?: () => Date
  kimlik?: () => string
}

const projeAnahtari = (planId: string, id: string) => `${planId}/proje/${id}`
const isAnahtari = (planId: string, id: string) => `${planId}/is/${id}`

function rastgeleKimlik(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function createProjeDepo({ store, ozetYaz, simdi = () => new Date(), kimlik = rastgeleKimlik }: ProjeDepoAyarlari) {
  async function hepsi<T>(onek: string): Promise<T[]> {
    const keys = await store.keys(onek)
    const degerler = await Promise.all(keys.map((k) => store.get<T>(k)))
    return degerler.filter((v): v is Awaited<T> => v !== undefined) as T[]
  }

  async function projeler(planId: string): Promise<Proje[]> {
    const liste = await hepsi<Proje>(`${planId}/proje/`)
    return liste.sort((a, b) => (a.olusturma < b.olusturma ? -1 : a.olusturma > b.olusturma ? 1 : 0))
  }

  async function isler(planId: string, projeId?: string): Promise<Is[]> {
    const liste = await hepsi<Is>(`${planId}/is/`)
    return isleriSirala(projeId ? liste.filter((is) => is.projeId === projeId) : liste)
  }

  const proje = (planId: string, id: string) => store.get<Proje>(projeAnahtari(planId, id))
  const is = (planId: string, id: string) => store.get<Is>(isAnahtari(planId, id))

  const kuyruk = new Map<string, Promise<PlanOzeti>>()

  /**
   * Planın özetini asıl veriden yeniden hesaplar ve yazar.
   * Hesaplar sırayla çalışır. Böylece eski özet yeni özetin üzerine yazılmaz.
   */
  function ozetiYenile(planId: string): Promise<PlanOzeti> {
    const onceki = kuyruk.get(planId) ?? Promise.resolve(undefined)
    const sonraki = onceki.catch(() => undefined).then(async () => {
      const ozet = planOzeti(await projeler(planId), await isler(planId), bugunIso(simdi()))
      try {
        ozetYaz(planId, ozet)
      } catch (error) {
        /* Özet asıl veri değildir. Yazılamazsa kayıt yine geçerlidir. */
        console.error('Proje özeti yazılamadı.', error)
      }
      return ozet
    })
    kuyruk.set(planId, sonraki)
    void sonraki.finally(() => {
      if (kuyruk.get(planId) === sonraki) kuyruk.delete(planId)
    }).catch(() => undefined)
    return sonraki
  }

  async function projeAc(planId: string, girdi: ProjeGirdisi): Promise<Proje> {
    if ((await store.keys(`${planId}/proje/`)).length >= SINIR.projePerPlan) throw new Error(`Bir planda en çok ${SINIR.projePerPlan} proje olabilir.`)
    const p = yeniProje(girdi, { id: kimlik(), planId, simdi: simdi() })
    await store.set(projeAnahtari(planId, p.id), p)
    await ozetiYenile(planId)
    return p
  }

  async function projeDegistir(planId: string, id: string, degisiklik: ProjeDegisikligi): Promise<Proje> {
    const p = await proje(planId, id)
    if (!p) throw new Error('Proje bulunamadı. Başka bir sekmede silinmiş olabilir.')
    const sonraki = projeyiGuncelle(p, degisiklik)
    await store.set(projeAnahtari(planId, id), sonraki)
    await ozetiYenile(planId)
    return sonraki
  }

  /**
   * Projeyi ve projenin bütün işlerini siler. Önce proje silinir.
   * Böylece başka sekme bu projeye artık iş ekleyemez. Arada kalan iş dışa aktarılmaz.
   */
  async function projeSil(planId: string, id: string): Promise<void> {
    const silinecek = await isler(planId, id)
    await store.delete(projeAnahtari(planId, id))
    for (const x of silinecek) await store.delete(isAnahtari(planId, x.id))
    await ozetiYenile(planId)
  }

  async function isEkle(planId: string, projeId: string, baslik: string): Promise<Is> {
    if (!(await proje(planId, projeId))) throw new Error('Proje bulunamadı. Başka bir sekmede silinmiş olabilir.')
    const mevcut = await isler(planId, projeId)
    if (mevcut.length >= SINIR.isPerProje) throw new Error(`Bir projede en çok ${SINIR.isPerProje} iş olabilir.`)
    const yeni = yeniIs({ baslik }, { id: kimlik(), projeId, sira: sonrakiSira(mevcut) })
    await store.set(isAnahtari(planId, yeni.id), yeni)
    await ozetiYenile(planId)
    return yeni
  }

  async function isDegistir(planId: string, id: string, degisiklik: IsDegisikligi): Promise<Is> {
    const eski = await is(planId, id)
    if (!eski) throw new Error('İş bulunamadı. Başka bir sekmede silinmiş olabilir.')
    const sonraki = isiGuncelle(eski, degisiklik)
    await store.set(isAnahtari(planId, id), sonraki)
    await ozetiYenile(planId)
    return sonraki
  }

  async function durumuDegistir(planId: string, id: string, durum: IsDurumu): Promise<Is> {
    const eski = await is(planId, id)
    if (!eski) throw new Error('İş bulunamadı. Başka bir sekmede silinmiş olabilir.')
    const sonraki = durumDegistir(eski, durum)
    await store.set(isAnahtari(planId, id), sonraki)
    await ozetiYenile(planId)
    return sonraki
  }

  async function isSil(planId: string, id: string): Promise<void> {
    await store.delete(isAnahtari(planId, id))
    await ozetiYenile(planId)
  }

  return { projeler, proje, isler, is, ozetiYenile, projeAc, projeDegistir, projeSil, isEkle, isDegistir, durumDegistir: durumuDegistir, isSil }
}

export type ProjeDepo = ReturnType<typeof createProjeDepo>

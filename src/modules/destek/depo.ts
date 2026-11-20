/**
 * Destek modülünün deposu. Veri plan dosyasına yazılmaz. Modül deposunda durur.
 * Anahtarlar: "<plan>/profil" ve "<plan>/basvuru/<kimlik>".
 * Plan açık değilse profil "_plansiz" yerinde durur. Bu yer bir plana bağlı değildir.
 * Yazmalar sırayla çalışır. Her yazma son kaydı okur, değişikliği uygular ve sonra yazar.
 * Böylece arka arkaya iki değişiklik birbirini silmez. Her başvuru yazımından sonra plan özeti yeniden hesaplanır.
 */
import { moduleStore } from '@/platform/kv'
import { writeRollup } from '@/platform/rollups'
import type { IsoTarih, Program } from './data/tipler'
import { basvuruDegistir, basvuruOku, ozetHesapla, type Basvuru, type BasvuruDegisikligi, type DesteksizCevap } from './motor/basvuru'
import { profilOku, type Alan, type DestekProfili, type DestekTercihi } from './motor/profil'
import { bugunIso } from './motor/tazelik'

export { ozetHesapla } from './motor/basvuru'

export const MODUL_ID = 'destek'
/** Plan açık değilken profilin durduğu yer. */
export const PLANSIZ = '_plansiz'

const depo = () => moduleStore(MODUL_ID)
const profilAnahtari = (yer: string) => `${yer}/profil`
const basvuruOnEki = (planId: string) => `${planId}/basvuru/`

let kuyruk: Promise<unknown> = Promise.resolve()

/** Yazmaları bu sekmede sırayla çalıştırır. Bir yazmanın hatası sonrakileri durdurmaz. */
function sirayla<T>(is: () => Promise<T>): Promise<T> {
  const sonuc = kuyruk.then(is, is)
  kuyruk = sonuc.catch(() => undefined)
  return sonuc
}

export async function profilYukle(yer: string, bugun: IsoTarih = bugunIso()): Promise<DestekProfili> {
  return profilOku(await depo().get(profilAnahtari(yer)), bugun)
}

export function profilKaydet(yer: string, profil: DestekProfili): Promise<void> {
  return sirayla(() => depo().set(profilAnahtari(yer), profil))
}

/** Tek bir cevabı yazar. Öteki cevaplar depodaki son halinden okunur. Başka sekmenin yazdığı cevap silinmez. */
export function profilAlanKaydet(yer: string, alan: Alan, deger: DestekProfili[Alan], bugun: IsoTarih = bugunIso()): Promise<DestekProfili> {
  return sirayla(async () => {
    const sonraki = profilOku({ ...(await profilYukle(yer, bugun)), [alan]: deger }, bugun)
    await depo().set(profilAnahtari(yer), sonraki)
    return sonraki
  })
}

/** Tercih süzgecini yazar. Öteki cevaplar depodaki son halinden okunur. */
export function tercihKaydet(yer: string, tercih: DestekTercihi, bugun: IsoTarih = bugunIso()): Promise<DestekProfili> {
  return sirayla(async () => {
    const sonraki = profilOku({ ...(await profilYukle(yer, bugun)), tercih }, bugun)
    await depo().set(profilAnahtari(yer), sonraki)
    return sonraki
  })
}

/** Planın başvuruları. Kimliği anahtarıyla uyuşmayan kayıt okunmaz. Böyle kayıt silinemez ve güncellenemez. */
export async function basvurulariYukle(planId: string): Promise<Basvuru[]> {
  const d = depo()
  const onEk = basvuruOnEki(planId)
  const keys = await d.keys(onEk)
  const liste: Basvuru[] = []
  for (const key of keys) {
    const b = basvuruOku(await d.get(key))
    if (b && b.id === key.slice(onEk.length)) liste.push(b)
  }
  return liste.sort((a, b) => (a.olusturma < b.olusturma ? -1 : a.olusturma > b.olusturma ? 1 : a.id.localeCompare(b.id)))
}

/**
 * Yazmadan sonra özeti yeniler. Asıl kayıt bu noktada yazılmıştır.
 * Özet yazılamazsa işlem yine başarılıdır. Örneğin tarayıcı kayıt alanı dolu olabilir.
 * Böylece ekran "kaydedilemedi" demez ve kullanıcı aynı başvuruyu ikinci kez eklemeye çalışmaz.
 */
async function ozetDene(planId: string): Promise<void> {
  try {
    await ozetYaz(planId)
  } catch (error) {
    console.error('Destek özeti yazılamadı.', error)
  }
}

async function ozetYaz(planId: string): Promise<void> {
  writeRollup(MODUL_ID, planId, ozetHesapla(await basvurulariYukle(planId)))
}

/** Plan özetini asıl veriden yeniden yazar. */
export function ozetiYenile(planId: string): Promise<void> {
  return sirayla(() => ozetYaz(planId))
}

function yeniKimlik(): string {
  const rastgele = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return `b-${rastgele}`
}

export function basvuruEkle(planId: string, program: Program, desteksizYapar: DesteksizCevap, simdi: string): Promise<Basvuru> {
  return sirayla(async () => {
    if (!planId || planId === PLANSIZ) throw new Error('Başvuru listesi için bir plan açın.')
    if ((await basvurulariYukle(planId)).some((b) => b.programId === program.id)) throw new Error('Bu program başvuru listenizde zaten var.')
    const b: Basvuru = {
      id: yeniKimlik(),
      programId: program.id,
      programAdi: program.ad,
      durum: 'hazirlaniyor',
      desteksizYapar,
      belgeler: program.belgeler.map((ad) => ({ ad, hazir: false })),
      olusturma: simdi,
      guncelleme: simdi,
    }
    await depo().set(`${basvuruOnEki(planId)}${b.id}`, b)
    await ozetDene(planId)
    return b
  })
}

export function basvuruGuncelle(planId: string, id: string, degisiklik: BasvuruDegisikligi, simdi: string): Promise<Basvuru> {
  return sirayla(async () => {
    const key = `${basvuruOnEki(planId)}${id}`
    const mevcut = basvuruOku(await depo().get(key))
    if (!mevcut || mevcut.id !== id) throw new Error('Başvuru bulunamadı.')
    const sonraki = basvuruDegistir(mevcut, degisiklik, simdi)
    await depo().set(key, sonraki)
    await ozetDene(planId)
    return sonraki
  })
}

export function basvuruSil(planId: string, id: string): Promise<void> {
  return sirayla(async () => {
    await depo().delete(`${basvuruOnEki(planId)}${id}`)
    await ozetDene(planId)
  })
}

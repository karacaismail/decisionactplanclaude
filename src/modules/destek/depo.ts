/**
 * Destek modülünün deposu. Veri plan dosyasına yazılmaz. Modül deposunda durur.
 * Anahtarlar: "<plan>/profil" ve "<plan>/basvuru/<kimlik>".
 * Plan açık değilse profil "_plansiz" yerinde durur. Bu yer bir plana bağlı değildir.
 * Her başvuru yazımından sonra plan özeti yeniden hesaplanır.
 */
import { moduleStore } from '@/platform/kv'
import { writeRollup } from '@/platform/rollups'
import type { Program } from './data/tipler'
import { basvuruDegistir, basvuruOku, ozetHesapla, type Basvuru, type BasvuruDegisikligi, type DesteksizCevap } from './motor/basvuru'
import { profilOku, type DestekProfili } from './motor/profil'

export { ozetHesapla } from './motor/basvuru'

export const MODUL_ID = 'destek'
/** Plan açık değilken profilin durduğu yer. */
export const PLANSIZ = '_plansiz'

const depo = () => moduleStore(MODUL_ID)
const profilAnahtari = (yer: string) => `${yer}/profil`
const basvuruOnEki = (planId: string) => `${planId}/basvuru/`

export async function profilYukle(yer: string, buYil: number): Promise<DestekProfili> {
  return profilOku(await depo().get(profilAnahtari(yer)), buYil)
}

export async function profilKaydet(yer: string, profil: DestekProfili): Promise<void> {
  await depo().set(profilAnahtari(yer), profil)
}

export async function basvurulariYukle(planId: string): Promise<Basvuru[]> {
  const d = depo()
  const keys = await d.keys(basvuruOnEki(planId))
  const liste: Basvuru[] = []
  for (const key of keys) {
    const b = basvuruOku(await d.get(key))
    if (b) liste.push(b)
  }
  return liste.sort((a, b) => (a.olusturma < b.olusturma ? -1 : a.olusturma > b.olusturma ? 1 : a.id.localeCompare(b.id)))
}

/** Plan özetini asıl veriden yeniden yazar. */
export async function ozetiYenile(planId: string): Promise<void> {
  writeRollup(MODUL_ID, planId, ozetHesapla(await basvurulariYukle(planId)))
}

function yeniKimlik(): string {
  const rastgele = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return `b-${rastgele}`
}

export async function basvuruEkle(planId: string, program: Program, desteksizYapar: DesteksizCevap, simdi: string): Promise<Basvuru> {
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
  await ozetiYenile(planId)
  return b
}

export async function basvuruGuncelle(planId: string, id: string, degisiklik: BasvuruDegisikligi, simdi: string): Promise<Basvuru> {
  const key = `${basvuruOnEki(planId)}${id}`
  const mevcut = basvuruOku(await depo().get(key))
  if (!mevcut) throw new Error('Başvuru bulunamadı.')
  const sonraki = basvuruDegistir(mevcut, degisiklik, simdi)
  await depo().set(key, sonraki)
  await ozetiYenile(planId)
  return sonraki
}

export async function basvuruSil(planId: string, id: string): Promise<void> {
  await depo().delete(`${basvuruOnEki(planId)}${id}`)
  await ozetiYenile(planId)
}

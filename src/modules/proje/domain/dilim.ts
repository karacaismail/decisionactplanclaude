/**
 * İçe alınan dosyadaki proje dilimini denetler. Saf işlevdir.
 * Bozuk ya da sınırı aşan dilim bütünüyle reddedilir. Yarım veri yazılmaz.
 * Geçerli kayıtlar yalnız bilinen alanlarla ve yeni plan kimliğiyle döner.
 */
import type { PlanSlice } from '@/platform/planScoped'
import { kimlikGecerliMi, SINIR, VERI_SURUMU, type Is, type Proje } from './model'
import { durumMu } from './islemler'
import { tarihGecerliMi } from './tarih'

const ANAHTAR = /^(proje|is)\/(.+)$/

const GECERSIZ = 'Proje verisinde geçersiz kayıt var. Dosyayı bu uygulamadan yeniden dışa aktarın.'

const nesneMi = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const metin = (v: unknown, sinir: number, bosOlabilir = true): v is string =>
  typeof v === 'string' && v.length <= sinir && (bosOlabilir || v.trim().length > 0)
const tarih = (v: unknown): v is string => v === '' || tarihGecerliMi(v)

function projeOku(v: unknown, id: string, planId: string): Proje {
  if (!nesneMi(v) || v.id !== id) throw new Error(GECERSIZ)
  const { ad, moveRowId, baslangic, bitis, sorumlu, aciklama, olusturma } = v
  if (!metin(ad, SINIR.ad, false) || !tarih(baslangic) || !tarih(bitis) || !metin(sorumlu, SINIR.sorumlu) || !metin(aciklama, SINIR.aciklama) || !metin(olusturma, 40)) throw new Error(GECERSIZ)
  if (moveRowId !== undefined && !kimlikGecerliMi(moveRowId)) throw new Error(GECERSIZ)
  if (baslangic && bitis && bitis < baslangic) throw new Error(GECERSIZ)
  return { id, planId, ad, ...(moveRowId ? { moveRowId } : {}), baslangic, bitis, sorumlu, aciklama, olusturma }
}

function isOku(v: unknown, id: string): Is {
  if (!nesneMi(v) || v.id !== id) throw new Error(GECERSIZ)
  const { projeId, baslik, durum, sorumlu, sonTarih, not, sira } = v
  if (!kimlikGecerliMi(projeId)) throw new Error(GECERSIZ)
  if (!metin(baslik, SINIR.baslik, false) || !durumMu(durum) || !metin(sorumlu, SINIR.sorumlu) || !tarih(sonTarih) || !metin(not, SINIR.not)) throw new Error(GECERSIZ)
  if (typeof sira !== 'number' || !Number.isSafeInteger(sira) || sira < 0) throw new Error(GECERSIZ)
  return { id, projeId, baslik, durum, sorumlu, sonTarih, not, sira }
}

/** Dilimi denetler ve projeleri hedef plana bağlar. Sorun varsa Türkçe hata fırlatır. */
export function dilimiDogrula(dilim: unknown, hedefPlanId: string): PlanSlice {
  if (!nesneMi(dilim) || !Array.isArray(dilim.entries)) throw new Error('Proje verisi okunamadı. Dosya bozuk olabilir. Planlarınız değişmedi. Başka bir dosya seçin.')
  if (dilim.schemaVersion !== VERI_SURUMU) throw new Error(`Proje verisinin sürümü desteklenmiyor. Dosyadaki sürüm: ${String(dilim.schemaVersion)}.`)
  const enCok = SINIR.projePerPlan * (SINIR.isPerProje + 1)
  if (dilim.entries.length > enCok) throw new Error(`Dosyada çok fazla proje kaydı var. Bir planda en çok ${SINIR.projePerPlan} proje olabilir.`)
  const projeler = new Map<string, Proje>()
  const isler = new Map<string, Is>()
  for (const kayit of dilim.entries as unknown[]) {
    if (!Array.isArray(kayit) || kayit.length !== 2 || typeof kayit[0] !== 'string') throw new Error(GECERSIZ)
    const m = ANAHTAR.exec(kayit[0])
    if (!m || !kimlikGecerliMi(m[2])) throw new Error(GECERSIZ)
    const [, tur, id] = m
    const hedef = tur === 'proje' ? projeler : isler
    if (hedef.has(id)) throw new Error('Proje verisinde aynı kayıt iki kez var. Dosyayı yeniden dışa aktarın.')
    if (tur === 'proje') projeler.set(id, projeOku(kayit[1], id, hedefPlanId))
    else isler.set(id, isOku(kayit[1], id))
  }
  if (projeler.size > SINIR.projePerPlan) throw new Error(`Bir planda en çok ${SINIR.projePerPlan} proje olabilir. Dosyada ${projeler.size} proje var.`)
  const projeBasina = new Map<string, number>()
  for (const is of isler.values()) {
    if (!projeler.has(is.projeId)) throw new Error('Dosyada projesi yok olan bir görev var. Dosyayı yeniden dışa aktarın.')
    const n = (projeBasina.get(is.projeId) ?? 0) + 1
    if (n > SINIR.isPerProje) throw new Error(`Bir projede en çok ${SINIR.isPerProje} görev olabilir.`)
    projeBasina.set(is.projeId, n)
  }
  const entries: [string, unknown][] = [
    ...[...projeler.values()].map((p): [string, unknown] => [`proje/${p.id}`, p]),
    ...[...isler.values()].map((is): [string, unknown] => [`is/${is.id}`, is]),
  ]
  return { schemaVersion: VERI_SURUMU, entries }
}

/**
 * Dışa aktarılacak dilimden projesi olmayan işleri atar. Saf işlevdir.
 * Böyle bir iş iki sekme aynı anda yazınca kalabilir. Atılmazsa dosya içe alınamaz.
 */
export function dilimiAyikla(dilim: PlanSlice): PlanSlice {
  const projeler = new Set(dilim.entries.filter(([k]) => k.startsWith('proje/')).map(([k]) => k.slice('proje/'.length)))
  const entries = dilim.entries.filter(([k, v]) => !k.startsWith('is/') || (nesneMi(v) && typeof v.projeId === 'string' && projeler.has(v.projeId)))
  return { ...dilim, entries }
}

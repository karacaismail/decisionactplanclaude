/**
 * Proje ve iş işlemleri. Saf işlevlerdir. Depoya yazmaz.
 * Bugünün tarihi dışarıdan verilir. Böylece testler saate bağlı kalmaz.
 */
import { MAX_ROLLUP_BYTES } from '@/platform/rollups'
import { IS_DURUMLARI, SINIR, type Is, type IsDurumu, type Proje } from './model'
import { bugunIso, tarihGecerliMi } from './tarih'

const kisalt = (metin: unknown, sinir: number) => (typeof metin === 'string' ? metin.trim().slice(0, sinir) : '')

function tarihAl(deger: unknown, alan: string): string {
  if (deger === undefined || deger === null || deger === '') return ''
  if (!tarihGecerliMi(deger)) throw new Error(`${alan} geçerli bir tarih değil. Takvimden bir gün seçin.`)
  return deger
}

function aralikDenetle(baslangic: string, bitis: string) {
  if (baslangic && bitis && bitis < baslangic) throw new Error('Bitiş tarihi başlangıç tarihinden önce olamaz.')
}

export interface ProjeGirdisi {
  ad: string
  moveRowId?: string
  sorumlu?: string
  aciklama?: string
  baslangic?: string
  bitis?: string
}

/** Yeni proje kaydı kurar. Başlangıç verilmezse bugündür. */
export function yeniProje(girdi: ProjeGirdisi, ctx: { id: string; planId: string; simdi: Date }): Proje {
  const ad = kisalt(girdi.ad, SINIR.ad)
  if (!ad) throw new Error('Proje adını yazın.')
  const baslangic = tarihAl(girdi.baslangic ?? bugunIso(ctx.simdi), 'Başlangıç tarihi')
  const bitis = tarihAl(girdi.bitis, 'Bitiş tarihi')
  aralikDenetle(baslangic, bitis)
  const bag = kisalt(girdi.moveRowId, SINIR.kimlik)
  return {
    id: ctx.id,
    planId: ctx.planId,
    ad,
    ...(bag ? { moveRowId: bag } : {}),
    baslangic,
    bitis,
    sorumlu: kisalt(girdi.sorumlu, SINIR.sorumlu),
    aciklama: kisalt(girdi.aciklama, SINIR.aciklama),
    olusturma: ctx.simdi.toISOString(),
  }
}

export type ProjeDegisikligi = Partial<Pick<Proje, 'ad' | 'baslangic' | 'bitis' | 'sorumlu' | 'aciklama'>>

/** Projenin değişen alanlarını yazar. Kimlik, plan ve bağ değişmez. */
export function projeyiGuncelle(p: Proje, degisiklik: ProjeDegisikligi): Proje {
  const sonraki: Proje = { ...p }
  if (degisiklik.ad !== undefined) {
    const ad = kisalt(degisiklik.ad, SINIR.ad)
    if (!ad) throw new Error('Proje adını yazın.')
    sonraki.ad = ad
  }
  if (degisiklik.baslangic !== undefined) sonraki.baslangic = tarihAl(degisiklik.baslangic, 'Başlangıç tarihi')
  if (degisiklik.bitis !== undefined) sonraki.bitis = tarihAl(degisiklik.bitis, 'Bitiş tarihi')
  if (degisiklik.sorumlu !== undefined) sonraki.sorumlu = kisalt(degisiklik.sorumlu, SINIR.sorumlu)
  if (degisiklik.aciklama !== undefined) sonraki.aciklama = kisalt(degisiklik.aciklama, SINIR.aciklama)
  aralikDenetle(sonraki.baslangic, sonraki.bitis)
  return sonraki
}

/** Yeni iş kaydı kurar. İş "Yapılacak" durumunda açılır. */
export function yeniIs(girdi: { baslik: string }, ctx: { id: string; projeId: string; sira: number }): Is {
  const baslik = kisalt(girdi.baslik, SINIR.baslik)
  if (!baslik) throw new Error('İş başlığını yazın.')
  return { id: ctx.id, projeId: ctx.projeId, baslik, durum: 'yapilacak', sorumlu: '', sonTarih: '', not: '', sira: ctx.sira }
}

export function durumMu(deger: unknown): deger is IsDurumu {
  return typeof deger === 'string' && (IS_DURUMLARI as readonly string[]).includes(deger)
}

export type IsDegisikligi = Partial<Pick<Is, 'baslik' | 'durum' | 'sorumlu' | 'sonTarih' | 'not'>>

/** İşin değişen alanlarını yazar. Kimlik, proje ve sıra değişmez. */
export function isiGuncelle(is: Is, degisiklik: IsDegisikligi): Is {
  const sonraki: Is = { ...is }
  if (degisiklik.baslik !== undefined) {
    const baslik = kisalt(degisiklik.baslik, SINIR.baslik)
    if (!baslik) throw new Error('İş başlığını yazın.')
    sonraki.baslik = baslik
  }
  if (degisiklik.durum !== undefined) sonraki.durum = durumDegistir(sonraki, degisiklik.durum).durum
  if (degisiklik.sorumlu !== undefined) sonraki.sorumlu = kisalt(degisiklik.sorumlu, SINIR.sorumlu)
  if (degisiklik.sonTarih !== undefined) sonraki.sonTarih = tarihAl(degisiklik.sonTarih, 'Son tarih')
  if (degisiklik.not !== undefined) sonraki.not = kisalt(degisiklik.not, SINIR.not)
  return sonraki
}

/** İşin durumunu değiştirir. Bilinmeyen durum reddedilir. */
export function durumDegistir(is: Is, durum: IsDurumu): Is {
  if (!durumMu(durum)) throw new Error('Bu durum tanınmıyor. Listeden bir durum seçin.')
  return { ...is, durum }
}

/** Yeni işin sıra numarası. Listenin sonuna eklenir. */
export function sonrakiSira(isler: readonly Is[]): number {
  return isler.reduce((en, is) => Math.max(en, is.sira), 0) + 1
}

/** İşleri sıra numarasına göre dizer. Aynı sırada kimlik sırası kullanılır. */
export function isleriSirala<T extends Is>(isler: readonly T[]): T[] {
  return [...isler].sort((a, b) => a.sira - b.sira || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}

/** "Yapılacak", "Yapılıyor" ve "Takıldı" açık durumlardır. */
export function acikMi(durum: IsDurumu): boolean {
  return durum === 'yapilacak' || durum === 'yapiliyor' || durum === 'takildi'
}

/** Son tarihi bugünden önce olan açık iş gecikmiştir. Bugün son gün ise iş henüz gecikmemiştir. */
export function gecikmisMi(is: Is, bugun: string): boolean {
  return acikMi(is.durum) && Boolean(is.sonTarih) && is.sonTarih < bugun
}

export interface IsOzeti {
  toplam: number
  acik: number
  geciken: number
  biten: number
  iptal: number
  durumlar: Record<IsDurumu, number>
}

/** Bir iş listesinin sayıları. */
export function isOzeti(isler: readonly Is[], bugun: string): IsOzeti {
  const durumlar = Object.fromEntries(IS_DURUMLARI.map((d) => [d, 0])) as Record<IsDurumu, number>
  let geciken = 0
  for (const is of isler) {
    durumlar[is.durum] += 1
    if (gecikmisMi(is, bugun)) geciken += 1
  }
  return {
    toplam: isler.length,
    acik: durumlar.yapilacak + durumlar.yapiliyor + durumlar.takildi,
    geciken,
    biten: durumlar.bitti,
    iptal: durumlar.iptal,
    durumlar,
  }
}

export interface HamleOzeti {
  proje: number
  acik: number
  geciken: number
  biten: number
}

/**
 * Planın küçük özeti. Çekirdek bu özeti beklemeden okur. Örneğin ana hamle etiketi için.
 * Özet 4 KB sınırına sığar. Sığmayan hamleler atılır ve "kesik" işareti konur.
 */
export interface PlanOzeti {
  v: 1
  tarih: string
  projeSayisi: number
  acik: number
  geciken: number
  biten: number
  hamleler: Record<string, HamleOzeti>
  kesik?: true
}

const boyut = (deger: unknown) => new TextEncoder().encode(JSON.stringify(deger)).length

export function planOzeti(projeler: readonly Proje[], isler: readonly Is[], bugun: string): PlanOzeti {
  const projeyeGore = new Map<string, Is[]>()
  for (const is of isler) {
    const liste = projeyeGore.get(is.projeId)
    if (liste) liste.push(is)
    else projeyeGore.set(is.projeId, [is])
  }
  const tum = isOzeti(projeler.flatMap((p) => projeyeGore.get(p.id) ?? []), bugun)
  const hamleler: Record<string, HamleOzeti> = {}
  for (const p of projeler) {
    if (!p.moveRowId) continue
    const o = isOzeti(projeyeGore.get(p.id) ?? [], bugun)
    const h = (hamleler[p.moveRowId] ??= { proje: 0, acik: 0, geciken: 0, biten: 0 })
    h.proje += 1
    h.acik += o.acik
    h.geciken += o.geciken
    h.biten += o.biten
  }
  const ozet: PlanOzeti = { v: 1, tarih: bugun, projeSayisi: projeler.length, acik: tum.acik, geciken: tum.geciken, biten: tum.biten, hamleler }
  if (boyut(ozet) <= MAX_ROLLUP_BYTES) return ozet
  /* Sınır aşılırsa hamleler tek tek eklenir. Sığmayan hamle atılır. */
  const kesik: PlanOzeti = { ...ozet, hamleler: {}, kesik: true }
  for (const [kimlik, h] of Object.entries(hamleler)) {
    kesik.hamleler[kimlik] = h
    if (boyut(kesik) > MAX_ROLLUP_BYTES) {
      delete kesik.hamleler[kimlik]
      break
    }
  }
  return kesik
}

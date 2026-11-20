/**
 * Konsey planı B.1: ortak belgeler. Bu dosya yalnız veridir.
 * Her belge, belge ve kanıt listesindeki bir maddedir. Ad ve açıklama o maddeden gelir.
 * Aşama, belgenin en çok hangi adımda istendiğini söyler. Kesin adımı programın kendi listesi söyler.
 * Süreli belgenin bir geçerlilik tarihi vardır. Tarihi kişi belgenin üstünde okur ve kendisi yazar.
 * Uygulama kaynaksız gün sınırı koymaz.
 */
import { KANIT_GRUPLARI } from './kanitlar'
import type { BelgeAsamasi, OrtakBelge } from './tipler'

/** Ödeme adımında istenen belgeler. Öteki belgeler başvuru adımındadır. */
const ODEME = new Set(['k30', 'k31', 'k33', 'k34'])
/** Destek sürerken izleme için tutulan belgeler. */
const IZLEME = new Set(['k20', 'k28', 'k39', 'k40'])
/** Ancak işletme kurulduktan sonra alınabilen belgeler. */
const KURULUS_SONRASI = new Set(['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k10', 'k13', 'k14', 'k26', 'k27', 'k33', 'k38', 'k43'])
/** Geçerlilik tarihi olan belgeler. Örneğin borç yoktur yazısı belli bir süre geçerlidir. */
const SURELI = new Set(['k6', 'k7', 'k11'])

const asama = (id: string): BelgeAsamasi => (ODEME.has(id) ? 'odeme' : IZLEME.has(id) ? 'izleme' : 'basvuru')

export const ORTAK_BELGELER: readonly OrtakBelge[] = KANIT_GRUPLARI.flatMap((g) => g.maddeler.map((m) => ({
  id: m.id,
  ad: m.ad,
  aciklama: m.neden,
  asama: asama(m.id),
  kurulusSonrasi: KURULUS_SONRASI.has(m.id),
  sureli: SURELI.has(m.id),
})))

/**
 * Programların makineyle denetlenebilen koşulları. Saf TypeScript kodudur.
 * Yalnız katalog verisinde açıkça yazan koşullar kural olur. Örneğin "İşletme en çok 3 yaşında olmalı."
 * Bir koşul iki türlü okunabiliyorsa kural "bilinmiyor" sonucunu verir. Böylece yanlış "Uygun değil" çıkmaz.
 * "Kesin" olmayan kural tutmazsa sonuç "Belki" olur. Örneğin veride "genellikle" diye yazan koşul böyledir.
 */
import type { IsoTarih } from '../data/tipler'
import { BILMIYORUM, bilinmiyor, yasAraligiAy, type Alan, type DestekProfili, type Kurulus, type NaceHarfi } from './profil'

export type KuralSonucu =
  | { durum: 'gecti' }
  | { durum: 'kaldi'; neden: string }
  /** alan varsa bu soruyu cevaplamak sonucu netleştirir. */
  | { durum: 'bilinmiyor'; neden: string; alan?: Alan }

export interface Kural {
  /** Kişiye gösterilen koşul. Katalogdaki koşulun yalın biçimidir. */
  kosul: string
  /** Tutmazsa sonuç "Uygun değil" olur. Kesin değilse "Belki" olur. */
  kesin: boolean
  denetle(profil: DestekProfili, bugun: IsoTarih): KuralSonucu
}

const GECTI: KuralSonucu = { durum: 'gecti' }
const kaldi = (neden: string): KuralSonucu => ({ durum: 'kaldi', neden })
const eksik = (alan: Alan, neden: string): KuralSonucu => ({ durum: 'bilinmiyor', alan, neden })
const okuyun = (neden: string): KuralSonucu => ({ durum: 'bilinmiyor', neden })

const EKSIK_METNI: Record<Alan, string> = {
  il: 'İlinizi bilmiyoruz.',
  kurulus: 'Kuruluş tarihinizi bilmiyoruz.',
  calisan: 'Sigortalı çalışan sayınızı bilmiyoruz.',
  ihracat: 'İhracat durumunuzu bilmiyoruz.',
  faaliyet: 'İş kolunuzu bilmiyoruz.',
  kosgeb: 'KOSGEB kaydınızı bilmiyoruz.',
  arge: 'Ar-Ge çalışmanızı bilmiyoruz.',
  kurucu: 'Kurucunun durumunu bilmiyoruz.',
}
const bilgiYok = (alan: Alan) => eksik(alan, EKSIK_METNI[alan])

const kurulusOf = (p: DestekProfili): Kurulus | undefined => (p.kurulus && p.kurulus !== BILMIYORUM ? p.kurulus : undefined)
const sayi = (p: DestekProfili): number | undefined => (typeof p.calisan === 'number' ? p.calisan : undefined)
const harfler = (p: DestekProfili): readonly NaceHarfi[] | undefined => (Array.isArray(p.faaliyet) ? p.faaliyet : undefined)

/** "En çok N yaşında" kuralı. N yıl ile N+1 yıl arası iki türlü okunabilir. Bu aralık kesin sonuç vermez. */
function enCokYas(yil: number, kosul: string): Kural {
  return {
    kosul,
    kesin: true,
    denetle(p, bugun) {
      const k = kurulusOf(p)
      if (!k) return bilgiYok('kurulus')
      const { min, max } = yasAraligiAy(k, bugun)
      if (max <= yil * 12) return GECTI
      if (min >= (yil + 1) * 12) return kaldi(`Bu program en çok ${yil} yaşındaki işletmeler içindir. Sizin işletmeniz daha eski.`)
      return okuyun(`İşletmenizin yaşı ${yil} yıl sınırına yakın. Kesin kuralı kurumun sayfasında okuyun.`)
    },
  }
}

/** "Son N yıl içinde kurulmuş olmalı" kuralı. */
function sonYillardaKurulmus(yil: number, kosul: string): Kural {
  return {
    kosul,
    kesin: true,
    denetle(p, bugun) {
      const k = kurulusOf(p)
      if (!k) return bilgiYok('kurulus')
      const { min, max } = yasAraligiAy(k, bugun)
      if (max <= yil * 12) return GECTI
      if (min > yil * 12) return kaldi(`Bu program son ${yil} yıl içinde kurulmuş işletmeler içindir. Sizin işletmeniz daha eski.`)
      return okuyun(`İşletmenizin yaşı ${yil} yıl sınırına yakın. Kesin kuralı kurumun sayfasında okuyun.`)
    },
  }
}

const KOSGEB_KAYDI: Kural = {
  kosul: 'İşletme KOSGEB veri tabanına kayıtlı olmalı.',
  kesin: true,
  denetle(p) {
    if (p.kosgeb === 'evet') return GECTI
    if (p.kosgeb === 'hayir') return kaldi('Bu program KOSGEB kaydı ister. Sizin KOSGEB kaydınız yok. Kayıt olursanız bu sonuç değişebilir.')
    return bilgiYok('kosgeb')
  },
}

/** Program kimliğine göre kurallar. Kuralı olmayan program "Belki" olur. */
export const KURALLAR: Readonly<Record<string, readonly Kural[]>> = {
  kosgebGirisimciA: [
    enCokYas(3, 'İşletme en çok 3 yaşında olmalı.'),
    {
      kosul: 'İşletmenin NACE kodu 61, 62, 63, 72 ya da bir imalat kodu olmalı.',
      kesin: true,
      denetle(p) {
        const h = harfler(p)
        if (!h) return bilgiYok('faaliyet')
        if (h.includes('C')) return GECTI
        if (h.includes('J') || h.includes('M')) return okuyun("İş kolunuz bilişim ya da Ar-Ge olabilir. Program 61, 62, 63 ve 72 kodlarını ister. NACE kodunuzu kontrol edin.")
        return kaldi('Bu program imalat, bilişim ve Ar-Ge iş kolları içindir. Sizin iş kolunuz bunlardan biri değil.')
      },
    },
  ],
  kosgebGirisimciB: [
    {
      kosul: 'Yalnız kadın ya da genç girişimcilerin işletmeleri başvurabilir.',
      kesin: true,
      denetle(p) {
        if (!Array.isArray(p.kurucu)) return bilgiYok('kurucu')
        if (p.kurucu.includes('kadin') || p.kurucu.includes('genc')) return GECTI
        return kaldi('Bu program yalnız kadın ya da genç girişimciler içindir. Kurucu için bu durumu seçmediniz.')
      },
    },
  ],
  kosgebYapayZekaKredisi: [KOSGEB_KAYDI],
  kosgebIsletmeGelistirme: [KOSGEB_KAYDI],
  kosgebKuresel: [
    {
      kosul: 'Program ihracat ya da Ar-Ge büyümesi şartı arar.',
      kesin: true,
      denetle(p) {
        if (p.ihracat === 'yeni' || p.ihracat === 'duzenli' || p.arge === 'evet') return GECTI
        if (p.ihracat === 'yok' && p.arge === 'hayir') return kaldi('Bu program ihracat ya da Ar-Ge büyümesi ister. Sizin ihracatınız ve Ar-Ge çalışmanız yok.')
        return bilgiYok(p.ihracat === 'yok' ? 'arge' : 'ihracat')
      },
    },
  ],
  kosgebDijitalDonusum: [
    {
      kosul: 'Yalnız imalat sektöründeki işletmeler başvurabilir.',
      kesin: true,
      denetle(p) {
        const h = harfler(p)
        if (!h) return bilgiYok('faaliyet')
        return h.includes('C') ? GECTI : kaldi('Bu program yalnız imalat işletmeleri içindir. Sizin iş kolunuz imalat değil.')
      },
    },
  ],
  tb10962Marka: [
    {
      kosul: 'İşletme, başvurudan en az üç yıl önce kurulmuş olmalı.',
      kesin: true,
      denetle(p, bugun) {
        const k = kurulusOf(p)
        if (!k) return bilgiYok('kurulus')
        const { min, max } = yasAraligiAy(k, bugun)
        if (min >= 36) return GECTI
        if (max < 36) return kaldi('Bu program en az üç yıl önce kurulmuş işletmeler içindir. Sizin işletmeniz daha yeni.')
        return okuyun('İşletmenizin yaşı 3 yıl sınırına yakın. Kesin kuralı kurumun sayfasında okuyun.')
      },
    },
    {
      kosul: 'Son üç yılın her birinde hizmet ihracatı ya da yurt dışından gelir olmalı.',
      kesin: true,
      denetle(p) {
        if (p.ihracat === 'yok') return kaldi('Bu program son üç yılda yurt dışından gelir ister. Sizin ihracatınız yok.')
        if (bilinmiyor(p, 'ihracat')) return bilgiYok('ihracat')
        return okuyun('Üç yıllık ihracat ve gelir koşulunu kurumun sayfasında okuyun.')
      },
    },
  ],
  teknogirisimRozeti: [sonYillardaKurulmus(15, 'Son 15 yıl içinde kurulmuş olmalı.')],
  turcorn: [
    {
      kosul: 'Kuruluş yılı ile başvuru yılı arasında en çok 15 yıl olmalı.',
      kesin: true,
      denetle(p, bugun) {
        const k = kurulusOf(p)
        if (!k) return bilgiYok('kurulus')
        return Number(bugun.slice(0, 4)) - k.yil <= 15 ? GECTI : kaldi('Bu program son 15 yıl içinde kurulmuş işletmeler içindir. Sizin işletmeniz daha eski.')
      },
    },
  ],
  bks: [
    {
      kosul: 'Ölçüm gününde en çok 50 çalışan olmalı.',
      kesin: true,
      denetle(p) {
        const n = sayi(p)
        if (n === undefined) return bilgiYok('calisan')
        return n <= 50 ? GECTI : kaldi("Bu program en çok 50 çalışanı olan şirketler içindir. Sizin çalışan sayınız 50'den fazla.")
      },
    },
    enCokYas(10, 'Şirket en çok 10 yaşında olmalı.'),
  ],
  argeMerkezi: [
    {
      kosul: 'Merkez için en az 10 tam zamanlı çalışana denk personel gerekir.',
      kesin: true,
      denetle(p) {
        const n = sayi(p)
        if (n === undefined) return bilgiYok('calisan')
        if (n < 10) return kaldi("Ar-Ge ya da tasarım merkezi için en az 10 tam zamanlı personel gerekir. Sizin sigortalı çalışan sayınız 10'dan az.")
        return okuyun('Ar-Ge ve tasarım personeli sayınızı kurumun sayfasındaki kuralla karşılaştırın.')
      },
    },
  ],
  vergi11257: [
    {
      kosul: "Hizmet, Türkiye'de yerleşik olmayan kişilere ya da şirketlere verilmeli.",
      kesin: true,
      denetle(p) {
        if (p.ihracat === 'yok') return kaldi('Bu indirim yurt dışındaki müşteriye verilen hizmetin kazancı içindir. Sizin ihracatınız yok.')
        if (bilinmiyor(p, 'ihracat')) return bilgiYok('ihracat')
        return okuyun('Hizmet ihracatı koşulunu kurumun sayfasında okuyun.')
      },
    },
  ],
  iskurIep: [
    {
      kosul: 'Genel programda işverende genellikle en az 5 sigortalı çalışan aranır.',
      kesin: false,
      denetle(p) {
        const n = sayi(p)
        if (n === undefined) return bilgiYok('calisan')
        return n >= 5 ? GECTI : kaldi("Genel programda genellikle en az 5 sigortalı çalışan aranır. Sizde 5'ten az çalışan var. Kurumla görüşün.")
      },
    },
  ],
  istka: [
    {
      kosul: 'İstanbul Kalkınma Ajansı İstanbul için çağrı açar.',
      kesin: false,
      denetle(p) {
        if (typeof p.il !== 'string' || p.il === BILMIYORUM) return bilgiYok('il')
        return p.il === 'İstanbul' ? GECTI : kaldi('Bu ajans İstanbul için çağrı açar. Başvuru sahibi tanımını çağrı rehberinde okuyun.')
      },
    },
  ],
}

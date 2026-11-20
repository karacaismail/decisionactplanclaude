/**
 * Programların makineyle denetlenebilen koşulları. Saf TypeScript kodudur.
 * Yalnız katalog verisinde açıkça yazan koşullar kural olur. Örneğin "İşletme en çok 3 yaşında olmalı."
 * Bir koşul iki türlü okunabiliyorsa kural "bilinmiyor" sonucunu verir. Böylece yanlış "Uygun değil" çıkmaz.
 * "Kesin" olmayan kural tutmazsa sonuç "Belki" olur. Örneğin veride "genellikle" diye yazan koşul böyledir.
 */
import type { IsoTarih } from '../data/tipler'
import { BILMIYORUM, bilinmiyor, kurulusDurumuOf, yasAraligiAy, type Alan, type DestekProfili, type IsletmeTuru, type Kurulus, type NaceHarfi, type Olcek } from './profil'

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
  /** Kuralın okuduğu profil alanları. Her soru en az bir kurala bağlıdır. */
  alanlar: readonly Alan[]
  denetle(profil: DestekProfili, bugun: IsoTarih): KuralSonucu
}

const GECTI: KuralSonucu = { durum: 'gecti' }
const kaldi = (neden: string): KuralSonucu => ({ durum: 'kaldi', neden })
const eksik = (alan: Alan, neden: string): KuralSonucu => ({ durum: 'bilinmiyor', alan, neden })
const okuyun = (neden: string): KuralSonucu => ({ durum: 'bilinmiyor', neden })

const EKSIK_METNI: Record<Alan, string> = {
  kurulusDurumu: 'İşletmenizin kurulup kurulmadığını bilmiyoruz.',
  olcek: 'İşletmenizin ölçeğini bilmiyoruz.',
  isletmeTuru: 'İşletme türünüzü bilmiyoruz.',
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

/**
 * Kuruluş bilgisi. Kişi "henüz kurulmadı" dediyse eski tarih cevabı okunmaz.
 * Kuruluş durumu bilinmiyorsa önce bu soru istenir. İşletme kurulduysa tarih sorusu istenir.
 */
type KurulusBilgisi = { tur: 'tarih'; k: Kurulus } | { tur: 'kurulmadi' } | { tur: 'eksik'; sonuc: KuralSonucu }
function kurulusBilgisi(p: DestekProfili): KurulusBilgisi {
  const durum = kurulusDurumuOf(p)
  if (durum === 'kurulmadi') return { tur: 'kurulmadi' }
  if (p.kurulus && p.kurulus !== BILMIYORUM) return { tur: 'tarih', k: p.kurulus }
  return { tur: 'eksik', sonuc: bilgiYok(durum === 'kuruldu' ? 'kurulus' : 'kurulusDurumu') }
}
const KURULUS_ALANLARI: readonly Alan[] = ['kurulusDurumu', 'kurulus']
const KURULMAMIS_SORUN = okuyun('İşletmeniz henüz kurulmadı. Kurulmamış girişimin başvurup başvuramayacağını kuruma sorun.')
const sayi = (p: DestekProfili): number | undefined => (typeof p.calisan === 'number' ? p.calisan : undefined)
const harfler = (p: DestekProfili): readonly NaceHarfi[] | undefined => (Array.isArray(p.faaliyet) ? p.faaliyet : undefined)

/** "En çok N yaşında" kuralı. N yıl ile N+1 yıl arası iki türlü okunabilir. Bu aralık kesin sonuç vermez. */
function enCokYas(yil: number, kosul: string): Kural {
  return {
    kosul,
    kesin: true,
    alanlar: KURULUS_ALANLARI,
    denetle(p, bugun) {
      const b = kurulusBilgisi(p)
      if (b.tur === 'kurulmadi') return KURULMAMIS_SORUN
      if (b.tur === 'eksik') return b.sonuc
      const { min, max } = yasAraligiAy(b.k, bugun)
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
    alanlar: KURULUS_ALANLARI,
    denetle(p, bugun) {
      const b = kurulusBilgisi(p)
      if (b.tur === 'kurulmadi') return KURULMAMIS_SORUN
      if (b.tur === 'eksik') return b.sonuc
      const { min, max } = yasAraligiAy(b.k, bugun)
      if (max <= yil * 12) return GECTI
      if (min > yil * 12) return kaldi(`Bu program son ${yil} yıl içinde kurulmuş işletmeler içindir. Sizin işletmeniz daha eski.`)
      return okuyun(`İşletmenizin yaşı ${yil} yıl sınırına yakın. Kesin kuralı kurumun sayfasında okuyun.`)
    },
  }
}

const KOSGEB_KAYDI: Kural = {
  kosul: 'İşletme KOSGEB veri tabanına kayıtlı olmalı.',
  kesin: true,
  alanlar: ['kosgeb'],
  denetle(p) {
    if (p.kosgeb === 'evet') return GECTI
    if (p.kosgeb === 'hayir') return kaldi('Bu program KOSGEB kaydı ister. Sizin KOSGEB kaydınız yok. Kayıt olursanız bu sonuç değişebilir.')
    return bilgiYok('kosgeb')
  },
}

/**
 * İşletme türü kuralı. gecer listesindeki tür koşulu karşılar. kalir listesindeki tür karşılamaz.
 * Öteki türler koşulu çözemez. Örneğin katalog kooperatifi anmıyorsa kooperatif "Belki" olur.
 * "Diğer" cevabı yalnız kalir listesindeyse çözülür. Bu yalnız koşul listedeki bir türü istediğinde olur.
 */
function turKurali(kosul: string, gecer: readonly IsletmeTuru[], kalir: readonly IsletmeTuru[], kaldiMetni: string): Kural {
  return {
    kosul,
    kesin: true,
    alanlar: ['isletmeTuru'],
    denetle(p) {
      if (bilinmiyor(p, 'isletmeTuru')) return bilgiYok('isletmeTuru')
      const tur = p.isletmeTuru as IsletmeTuru
      if (gecer.includes(tur)) return GECTI
      if (kalir.includes(tur)) return kaldi(kaldiMetni)
      return okuyun('Bu programın işletme türü koşulu var. Sizin türünüzün uyup uymadığını kuruma sorun.')
    },
  }
}

const SERMAYE_SIRKETI_METNI = 'Bu program sermaye şirketleri içindir. Şahıs ya da esnaf işletmesi başvuramaz. Şirket kurarsanız bu sonuç değişebilir.'

/** Ölçek kuralı. Ölçeği kişi seçer. Uygulama ölçeği çalışan sayısından hesaplamaz. */
function olcekKurali(kosul: string, gecer: readonly Olcek[], kalir: readonly Olcek[], kaldiMetni: string, sorunMetni?: string): Kural {
  return {
    kosul,
    kesin: true,
    alanlar: ['olcek'],
    denetle(p) {
      if (bilinmiyor(p, 'olcek')) return bilgiYok('olcek')
      const olcek = p.olcek as Olcek
      if (gecer.includes(olcek)) return GECTI
      if (kalir.includes(olcek)) return kaldi(kaldiMetni)
      return okuyun(sorunMetni ?? 'Bu programın ölçek koşulunu kuruma sorun.')
    },
  }
}

const KOBI_OLMALI = (kosul: string) => olcekKurali(kosul, ['mikro', 'kucuk', 'orta'], ['buyuk'], "Bu program KOBİ'ler içindir. Siz işletmenizi büyük olarak seçtiniz.")

/**
 * Bir programın kural seti. Kurallar programın bütün zorunlu koşullarını kapsıyorsa eksiksiz olur.
 * Eksiksiz olmayan sette bütün kurallar tutsa da sonuç "Belki" olur. Çünkü denetlenmeyen koşul bilinmeyen bilgidir.
 * Bu sürümde hiçbir program eksiksiz değildir. Her programda uygulamanın soramadığı bir koşul vardır.
 */
export interface KuralSeti {
  kurallar: readonly Kural[]
  eksiksiz?: boolean
}

const set = (...kurallar: Kural[]): KuralSeti => ({ kurallar })

/** Program kimliğine göre kurallar. Kuralı olmayan program "Belki" olur. */
export const KURALLAR: Readonly<Record<string, KuralSeti>> = {
  kosgebGirisimciA: set(
    enCokYas(3, 'İşletme en çok 3 yaşında olmalı.'),
    {
      kosul: 'İşletmenin NACE kodu 61, 62, 63, 72 ya da bir imalat kodu olmalı.',
      kesin: true,
      alanlar: ['faaliyet'],
      denetle(p) {
        const h = harfler(p)
        if (!h) return bilgiYok('faaliyet')
        if (h.includes('C')) return GECTI
        if (h.includes('J') || h.includes('M')) return okuyun("İş kolunuz bilişim ya da Ar-Ge olabilir. Program 61, 62, 63 ve 72 kodlarını ister. NACE kodunuzu kontrol edin.")
        return kaldi('Bu program imalat, bilişim ve Ar-Ge iş kolları içindir. Sizin iş kolunuz bunlardan biri değil.')
      },
    },
  ),
  kosgebGirisimciB: set(
    {
      kosul: 'Yalnız kadın ya da genç girişimcilerin işletmeleri başvurabilir.',
      kesin: true,
      alanlar: ['kurucu'],
      denetle(p) {
        if (!Array.isArray(p.kurucu)) return bilgiYok('kurucu')
        if (p.kurucu.includes('kadin') || p.kurucu.includes('genc')) return GECTI
        return kaldi('Bu program yalnız kadın ya da genç girişimciler içindir. Kurucu için bu durumu seçmediniz.')
      },
    },
  ),
  kosgebYapayZekaKredisi: set(KOSGEB_KAYDI),
  kosgebIsletmeGelistirme: set(KOSGEB_KAYDI),
  kosgebKuresel: set(
    {
      /*
       * Kesin değildir. Kurumun sayfası 19 Kasım 2026 günü okundu. Sayfaya göre dört yoldan biri yeterlidir.
       * İki yol ihracat artışı ister. Öteki iki yol yüksek teknolojili orta ölçekli işletme ya da Turcorn 100 üyeliğidir.
       * Uygulama bu iki yolu sormaz. Bu yüzden ihracatı ve Ar-Ge'si olmayan işletme "Belki" sonucunu alır.
       */
      kosul: 'Program hızlı büyüme, yüksek teknoloji, ihracat ya da Ar-Ge büyümesi şartı arar.',
      kesin: false,
      alanlar: ['ihracat', 'arge'],
      denetle(p) {
        if (p.ihracat === 'yeni' || p.ihracat === 'duzenli' || p.arge === 'evet') return GECTI
        if (p.ihracat === 'yok' && p.arge === 'hayir') return kaldi('Bu program çoğu yolda ihracat ya da Ar-Ge büyümesi ister. Sizin ihracatınız ve Ar-Ge çalışmanız yok. Program yüksek teknolojili işletmelere de açık olabilir. Kurumun sayfasını okuyun.')
        return bilgiYok(p.ihracat === 'yok' ? 'arge' : 'ihracat')
      },
    },
  ),
  kosgebDijitalDonusum: set(
    {
      kosul: 'Yalnız imalat sektöründeki işletmeler başvurabilir.',
      kesin: true,
      alanlar: ['faaliyet'],
      denetle(p) {
        const h = harfler(p)
        if (!h) return bilgiYok('faaliyet')
        return h.includes('C') ? GECTI : kaldi('Bu program yalnız imalat işletmeleri içindir. Sizin iş kolunuz imalat değil.')
      },
    },
    olcekKurali('Mikro işletmeler başvuramaz.', ['kucuk', 'orta', 'buyuk'], ['mikro'], 'Bu programa mikro işletmeler başvuramaz. Siz işletmenizi mikro olarak seçtiniz.'),
  ),
  kosgebKapasite: set(
    olcekKurali(
      'Hızlı büyüyen küçük ya da orta ölçekli işletmeler başvurabilir.',
      ['kucuk', 'orta'],
      ['buyuk'],
      'Bu program küçük ya da orta ölçekli işletmeler içindir. Siz işletmenizi büyük olarak seçtiniz.',
      /* "Küçük ya da orta ölçekli" sözü mikro işletmeyi de kapsayabilir. İki türlü okunabildiği için sonuç "Belki" olur. */
      'Program küçük ya da orta ölçekli işletmeler içindir. Mikro işletmenin başvurup başvuramayacağını kuruma sorun.',
    ),
  ),
  /* 20 Kasım 2026 doğrulaması: 2026 yılı 2. çağrıya yalnız KOBİ ölçeğindeki sermaye şirketleri başvurabilir. */
  tubitak1501: set(
    turKurali("Türkiye'de yerleşik ve KOBİ ölçeğinde bir sermaye şirketi olmalı.", ['limited', 'anonim'], ['sahis'], SERMAYE_SIRKETI_METNI),
    KOBI_OLMALI("Türkiye'de yerleşik ve KOBİ ölçeğinde bir sermaye şirketi olmalı."),
  ),
  tubitak1507: set(
    turKurali('KOBİ olan bir sermaye şirketi olmalı.', ['limited', 'anonim'], ['sahis'], SERMAYE_SIRKETI_METNI),
    KOBI_OLMALI('KOBİ olan bir sermaye şirketi olmalı.'),
  ),
  tb10962Marka: set(
    {
      kosul: 'İşletme, başvurudan en az üç yıl önce kurulmuş olmalı.',
      kesin: true,
      alanlar: KURULUS_ALANLARI,
      denetle(p, bugun) {
        const b = kurulusBilgisi(p)
        if (b.tur === 'kurulmadi') return kaldi('Bu program en az üç yıl önce kurulmuş işletmeler içindir. Sizin işletmeniz henüz kurulmadı.')
        if (b.tur === 'eksik') return b.sonuc
        const { min, max } = yasAraligiAy(b.k, bugun)
        if (min >= 36) return GECTI
        if (max < 36) return kaldi('Bu program en az üç yıl önce kurulmuş işletmeler içindir. Sizin işletmeniz daha yeni.')
        return okuyun('İşletmenizin yaşı 3 yıl sınırına yakın. Kesin kuralı kurumun sayfasında okuyun.')
      },
    },
    {
      kosul: 'Son üç yılın her birinde hizmet ihracatı ya da yurt dışından gelir olmalı.',
      kesin: true,
      alanlar: ['ihracat'],
      denetle(p) {
        if (p.ihracat === 'yok') return kaldi('Bu program son üç yılda yurt dışından gelir ister. Sizin ihracatınız yok.')
        if (bilinmiyor(p, 'ihracat')) return bilgiYok('ihracat')
        return okuyun('Üç yıllık ihracat ve gelir koşulunu kurumun sayfasında okuyun.')
      },
    },
  ),
  teknogirisimRozeti: set(
    turKurali(
      "Türkiye'de kurulmuş şahıs işletmesi ya da sermaye şirketi olmalı.",
      ['sahis', 'limited', 'anonim'],
      [],
      'Bu program şahıs işletmeleri ve sermaye şirketleri içindir.',
    ),
    KOBI_OLMALI('KOBİ olmalı.'),
    sonYillardaKurulmus(15, 'Son 15 yıl içinde kurulmuş olmalı.'),
  ),
  turcorn: set(
    {
      kosul: 'Kuruluş yılı ile başvuru yılı arasında en çok 15 yıl olmalı.',
      kesin: true,
      alanlar: KURULUS_ALANLARI,
      denetle(p, bugun) {
        const b = kurulusBilgisi(p)
        if (b.tur === 'kurulmadi') return KURULMAMIS_SORUN
        if (b.tur === 'eksik') return b.sonuc
        return Number(bugun.slice(0, 4)) - b.k.yil <= 15 ? GECTI : kaldi('Bu program son 15 yıl içinde kurulmuş işletmeler içindir. Sizin işletmeniz daha eski.')
      },
    },
  ),
  bks: set(
    /* Anonim şirket listede ayrı seçenektir. Bu yüzden "Diğer" cevabı bu koşulu çözer. */
    turKurali('Şirket bir anonim şirket olmalı.', ['anonim'], ['sahis', 'limited', 'kooperatif', 'diger'], 'Bu program yalnız anonim şirketler içindir. Sizin işletmeniz anonim şirket değil.'),
    {
      kosul: 'Ölçüm gününde en çok 50 çalışan olmalı.',
      kesin: true,
      alanlar: ['calisan'],
      denetle(p) {
        const n = sayi(p)
        if (n === undefined) return bilgiYok('calisan')
        return n <= 50 ? GECTI : kaldi("Bu program en çok 50 çalışanı olan şirketler içindir. Sizin çalışan sayınız 50'den fazla.")
      },
    },
    enCokYas(10, 'Şirket en çok 10 yaşında olmalı.'),
  ),
  argeMerkezi: set(
    {
      kosul: 'Merkez için en az 10 tam zamanlı çalışana denk personel gerekir.',
      kesin: true,
      alanlar: ['calisan'],
      denetle(p) {
        const n = sayi(p)
        if (n === undefined) return bilgiYok('calisan')
        if (n < 10) return kaldi("Ar-Ge ya da tasarım merkezi için en az 10 tam zamanlı personel gerekir. Sizin sigortalı çalışan sayınız 10'dan az.")
        return okuyun('Ar-Ge ve tasarım personeli sayınızı kurumun sayfasındaki kuralla karşılaştırın.')
      },
    },
  ),
  vergi11257: set(
    {
      kosul: "Hizmet, Türkiye'de yerleşik olmayan kişilere ya da şirketlere verilmeli.",
      kesin: true,
      alanlar: ['ihracat'],
      denetle(p) {
        if (p.ihracat === 'yok') return kaldi('Bu indirim yurt dışındaki müşteriye verilen hizmetin kazancı içindir. Sizin ihracatınız yok.')
        if (bilinmiyor(p, 'ihracat')) return bilgiYok('ihracat')
        return okuyun('Hizmet ihracatı koşulunu kurumun sayfasında okuyun.')
      },
    },
  ),
  iskurIep: set(
    {
      kosul: 'Genel programda işverende genellikle en az 5 sigortalı çalışan aranır.',
      kesin: false,
      alanlar: ['calisan'],
      denetle(p) {
        const n = sayi(p)
        if (n === undefined) return bilgiYok('calisan')
        return n >= 5 ? GECTI : kaldi("Genel programda genellikle en az 5 sigortalı çalışan aranır. Sizde 5'ten az çalışan var. Kurumla görüşün.")
      },
    },
  ),
  istka: set(
    {
      kosul: 'İstanbul Kalkınma Ajansı İstanbul için çağrı açar.',
      kesin: false,
      alanlar: ['il'],
      denetle(p) {
        if (typeof p.il !== 'string' || p.il === BILMIYORUM) return bilgiYok('il')
        return p.il === 'İstanbul' ? GECTI : kaldi('Bu ajans İstanbul için çağrı açar. Başvuru sahibi tanımını çağrı rehberinde okuyun.')
      },
    },
  ),
}

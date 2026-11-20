/**
 * Destek ekranlarının ortak metinleri. Metinler okurken desteğe ihtiyaç duyan kişinin anlayacağı kadar yalındır.
 * Saf TypeScript kodudur.
 */
import type { Kategori, Kombinasyon, TavanTuru, Terim } from './data/tipler'
import type { BasvuruDurumu, DesteksizCevap } from './motor/basvuru'
import type { EslesmeSonucu } from './motor/eslestir'
import type { Alan, IhracatDurumu, KurucuDurumu } from './motor/profil'
import type { GecerliDurum } from './motor/tazelik'

export const UYARI_METNI = 'Bu bilgi resmî kaynak değildir. Tutar ve tarih değişebilir. Başvurmadan önce kurumun sayfasını okuyun. Bu uygulama destek vermez ve söz vermez.'

export const KATEGORI_ADI: Record<Kategori, string> = {
  hibe: 'Hibe',
  ozsermaye: 'Ortaklık yatırımı',
  geri_odemeli: 'Geri ödemeli destek',
  kredi: 'Kredi',
  vergi_sgk: 'Vergi ve prim indirimi',
  ag: 'Bağlantı ve belge',
  katilimciya_odeme: 'Katılımcıya ödeme',
  kefalet: 'Kefalet',
  ayni: 'Hizmet desteği',
}

export const DURUM_ADI: Record<GecerliDurum, string> = {
  acik: 'Başvuru açık',
  cagri_bekleniyor: 'Çağrı bekleniyor',
  surekli: 'Her zaman başvurulabilir',
  kapali: 'Kapalı',
  yururlukte: 'Yürürlükte',
  kapandi: 'Kapandı',
}

export const TAVAN_TURU_ADI: Record<TavanTuru, string> = {
  hibe_tavani: 'Hibe üst sınırı',
  oransal: 'Oranla hesaplanır',
  yok: 'Sabit tutar yok',
  kredi_anaparasi: 'Kredi üst sınırı',
  program_butcesi: 'Programın toplam bütçesi',
}

export const BASVURU_DURUM_ADI: Record<BasvuruDurumu, string> = {
  hazirlaniyor: 'Hazırlanıyor',
  basvuruldu: 'Başvuruldu',
  sonuc_bekleniyor: 'Sonuç bekleniyor',
  kabul: 'Kabul',
  ret: 'Ret',
  vazgecildi: 'Vazgeçildi',
}

export const DESTEKSIZ_ADI: Record<DesteksizCevap, string> = { evet: 'Evet', hayir: 'Hayır', bilmiyorum: 'Bilmiyorum' }

export const SONUC_ADI: Record<EslesmeSonucu, string> = { uygun: 'Uygun', belki: 'Belki', uygun_degil: 'Uygun değil' }

export const IHRACAT_ADI: Record<IhracatDurumu, string> = { yok: 'İhracat yok', yeni: 'Yeni başladık', duzenli: 'Düzenli ihracat yapıyoruz' }

export const KURUCU_ADI: Record<KurucuDurumu, string> = { genc: 'Genç girişimci', kadin: 'Kadın girişimci', engelli: 'Engelli girişimci', gazi: 'Gazi girişimci' }

export const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'] as const

/** Sihirbaz soruları. Her soruda "Bilmiyorum" düğmesi vardır. */
export const SORULAR: Record<Alan, { baslik: string; aciklama: string; kisa: string }> = {
  kurulus: { kisa: 'Kuruluş tarihi', baslik: 'İşletmeniz ne zaman kuruldu?', aciklama: 'Kuruluş yılını seçin. Ayı biliyorsanız ayı da seçin.' },
  calisan: { kisa: 'Sigortalı çalışan sayısı', baslik: 'Kaç sigortalı çalışanınız var?', aciklama: "SGK'ya bildirdiğiniz çalışan sayısını yazın." },
  faaliyet: { kisa: 'İş kolu', baslik: 'İşletmeniz hangi iş kolunda çalışıyor?', aciklama: 'NACE kodu, iş kolunu gösteren resmî koddur. Kodun ilk harfine göre bir ya da daha çok iş kolu seçin.' },
  ihracat: { kisa: 'İhracat', baslik: 'Yurt dışına satış yapıyor musunuz?', aciklama: 'İhracat, yurt dışına mal ya da hizmet satmaktır.' },
  arge: { kisa: 'Ar-Ge çalışması', baslik: 'Ar-Ge çalışmanız var mı?', aciklama: 'Ar-Ge, yeni bir ürün ya da yöntem geliştirmek için yapılan araştırmadır.' },
  kosgeb: { kisa: 'KOSGEB kaydı', baslik: "İşletmeniz KOSGEB'e kayıtlı mı?", aciklama: 'KOSGEB, küçük ve orta büyüklükteki işletmelere destek veren kurumdur.' },
  kurucu: { kisa: 'Kurucunun durumu', baslik: 'Kurucu için hangileri doğru?', aciklama: 'Bazı programlar yalnız belli girişimciler içindir. Doğru olanları seçin.' },
  il: { kisa: 'İl', baslik: 'İşletmeniz hangi ilde?', aciklama: 'Bazı kurumlar yalnız kendi illerindeki işletmelere destek verir.' },
}

/** Türkçe büyük ve küçük harfe duyarsız arama için metni sadeleştirir. */
export function aramaMetni(metin: string): string {
  return metin.toLocaleLowerCase('tr-TR').normalize('NFC')
}

/**
 * Birlikte kullanma türlerinin yalın açıklaması. Değerler katalogdaki "kombinasyon" verisinden gelir.
 * dislayici: iki program birlikte kullanılamaz.
 * ayri_gider: birlikte kullanılabilir ama her program başka gideri öder.
 * onkosul: programlardan biri ötekine bağlıdır. Veride yön yoktur. Bu yüzden ekran sırayı söylemez.
 * red_alternatifi: bir programdan ret gelirse öteki program seçenek olabilir.
 * uyumlu: birlikte kullanılabilir.
 */
export const KOMBINASYON_METNI: Record<Kombinasyon, { baslik: string; kisa: string; aciklama: string }> = {
  dislayici: { baslik: 'Birlikte kullanılamaz', kisa: 'Bu iki program birlikte kullanılamaz.', aciklama: 'Kaynağa göre bu programlar birlikte kullanılamaz. Birini seçmeniz gerekir.' },
  ayri_gider: { baslik: 'Ayrı giderle birlikte kullanılabilir', kisa: 'Aynı faturayı iki programa yazmayın.', aciklama: 'Bu programları birlikte kullanabilirsiniz. Ancak her program başka bir gideri ödemelidir. Aynı faturayı iki programa yazmayın.' },
  onkosul: { baslik: 'Biri ötekine bağlı', kisa: 'Programlardan biri ötekine bağlı.', aciklama: 'Bu programlardan birine girmek için ötekinden bir adım gerekebilir. Sırayı kurumun sayfasında okuyun.' },
  red_alternatifi: { baslik: 'Ret alırsanız seçenek', kisa: 'Biri ret alırsa öteki seçenek olabilir.', aciklama: 'Bir programdan ret alırsanız öteki program seçenek olabilir.' },
  uyumlu: { baslik: 'Birlikte kullanılabilir', kisa: 'Bu iki program birlikte kullanılabilir.', aciklama: 'Kaynağa göre bu programlar birlikte kullanılabilir. Yine de aynı faturayı iki programa yazmayın.' },
}

export function sozlukAra(sozluk: readonly Terim[], arama: string): readonly Terim[] {
  const aranan = aramaMetni(arama.trim())
  const esAnlam = arama.trim().toLowerCase()
  return sozluk.filter((t) => aramaMetni(t.ad).includes(aranan)
    || t.esAnlamlilar?.some((ad) => ad.toLowerCase().includes(esAnlam)))
}

const TR = new Intl.Collator('tr', { sensitivity: 'base' })

/** Terimleri Türkçe abece sırasıyla dizer ve ilk harfe göre gruplar. Örneğin "Çağrı" C harfinden sonra gelir. */
export function harfeGore<T extends Pick<Terim, 'ad'>>(terimler: readonly T[]): { harf: string; terimler: T[] }[] {
  const gruplar: { harf: string; terimler: T[] }[] = []
  for (const t of [...terimler].sort((a, b) => TR.compare(a.ad, b.ad))) {
    const harf = t.ad.charAt(0).toLocaleUpperCase('tr-TR')
    const son = gruplar.at(-1)
    if (son && son.harf === harf) son.terimler.push(t)
    else gruplar.push({ harf, terimler: [t] })
  }
  return gruplar
}

export function terimBul<T extends Pick<Terim, 'id'>>(sozluk: readonly T[], id: string | undefined): T | undefined {
  return id ? sozluk.find((t) => t.id === id) : undefined
}

/**
 * Destek ekranlarının ortak metinleri. Metinler okurken desteğe ihtiyaç duyan kişinin anlayacağı kadar yalındır.
 * Saf TypeScript kodudur.
 */
import type { Kategori, TavanTuru } from './data/tipler'
import type { BasvuruDurumu, DesteksizCevap } from './motor/basvuru'
import type { EslesmeSonucu } from './motor/eslestir'
import type { Alan, IhracatDurumu, KurucuDurumu } from './motor/profil'
import type { GecerliDurum } from './motor/tazelik'

export const UYARI_METNI = 'Bu bilgi resmî kaynak değildir. Tutar ve tarih değişebilir. Başvurmadan önce kurumun sayfasını okuyun. Bu uygulama destek vermez ve söz vermez.'
export const TUTARI_OKUYUN = 'Tutarı kurumun sayfasında okuyun.'

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

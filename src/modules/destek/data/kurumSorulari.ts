import type { KurumSorusu } from './tipler'

export const KURUM_SORULARI: readonly KurumSorusu[] = [
  { id: 'uygunluk1', grup: 'Uygunluk', soru: 'Bu program hangi faaliyet kodlarını ve şirket türlerini kabul ediyor?' },
  { id: 'uygunluk2', grup: 'Uygunluk', soru: 'Henüz kurulmamış bir girişim başvurabilir mi?' },
  { id: 'uygunluk3', grup: 'Uygunluk', soru: 'Ölçek, çalışan sayısı ve ciro hangi tarihteki belgeyle ölçülüyor?' },
  { id: 'uygunluk4', grup: 'Uygunluk', soru: 'Bağlı şirketler ya da kurucunun önceki ortaklığı uygunluğu etkiler mi?' },
  { id: 'uygunluk5', grup: 'Uygunluk', soru: 'Yapılandırılmış vergi ya da SGK borcu başvuruya engel olur mu?' },
  { id: 'gider1', grup: 'Giderler', soru: 'Bu gider kalemi kapsama giriyor mu?' },
  { id: 'gider2', grup: 'Giderler', soru: 'Başvurudan önce yapılan harcama sayılır mı?' },
  { id: 'gider3', grup: 'Giderler', soru: 'Bu yıl geçerli destek oranı ve üst sınır nedir?' },
  { id: 'gider4', grup: 'Giderler', soru: 'KDV, ikinci el alım, kiralama ya da ilişkili şirketten alım desteklenir mi?' },
  { id: 'odeme1', grup: 'Ödeme ve süre', soru: 'Değerlendirme ve ilk ödeme süresi hangi olayla başlıyor?' },
  { id: 'odeme2', grup: 'Ödeme ve süre', soru: 'Eksik belge süreyi nasıl etkiliyor?' },
  { id: 'odeme3', grup: 'Ödeme ve süre', soru: 'Ödeme harcamadan sonra mı yapılıyor? Avans var mı?' },
  { id: 'odeme4', grup: 'Ödeme ve süre', soru: 'Ödeme için teminat mektubu ya da kefalet gerekiyor mu?' },
  { id: 'birlikte1', grup: 'Birlikte kullanma', soru: 'Bu desteği başka bir hibe, kredi ya da prim teşvikiyle aynı dönemde kullanabilir miyiz?' },
  { id: 'birlikte2', grup: 'Birlikte kullanma', soru: 'Prim teşvikinden yararlanan çalışanın ücreti bu programda gösterilebilir mi?' },
  { id: 'yukumluluk1', grup: 'Yükümlülükler', soru: 'Destekten sonra çalışan sayısını, ortaklık payını ya da ekipmanı kaç yıl korumalıyız?' },
  { id: 'yukumluluk2', grup: 'Yükümlülükler', soru: 'Hangi izleme raporları isteniyor?' },
  { id: 'yukumluluk3', grup: 'Yükümlülükler', soru: 'Proje değişirse ya da hedef tutmazsa ne oluyor?' },
  { id: 'dayanak1', grup: 'Resmî dayanak', soru: 'Bu cevap hangi güncel mevzuat ya da çağrı rehberi maddesine dayanıyor?' },
]

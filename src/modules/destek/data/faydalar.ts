import type { FaydaTuru } from './tipler'

/**
 * Programların fayda türleri. Kaynak: 20 Kasım 2026 Cuma günkü doğrulama. Ayrıntı: docs/moduller/dogrulama.
 * Doğrulamanın tür adları bu dosyadaki adlara çevrildi. Örneğin "vergi_prim" burada "vergi_sgk" olur.
 * Kaynağı bulunamayan iki program eski eşlemesini korur.
 */
export const FAYDALAR: Readonly<Record<string, readonly FaydaTuru[]>> = {
  tubitak1501: ['hibe'],
  tubitak1507: ['hibe'],
  tubitak1707: ['hibe'],
  tubitak1711: ['hibe'],
  tubitak1505: ['hibe'],
  tubitak1702: ['hibe'],
  tubitak1509: ['hibe'],
  eureka1709: ['hibe'],
  bigg1812: ['ortaklik'],
  kosgebIsKurma: ['hibe'],
  kosgebGirisimciA: ['kredi'],
  kosgebGirisimciB: ['faiz'],
  kosgebYapayZekaKredisi: ['kredi'],
  kosgebIsletmeGelistirme: ['hibe'],
  kosgebKapasite: ['faiz'],
  kosgebKuresel: ['faiz'],
  kosgebDijitalDonusum: ['faiz'],
  kosgebTekmer: ['hibe', 'kredi'],
  tb10962Atilim: ['hibe'],
  tb10962Marka: ['hibe'],
  tb10962Surdurulebilirlik: ['hibe'],
  tbEIhracat: ['hibe'],
  yatirimTesvik: ['vergi_sgk', 'faiz', 'hibe', 'hizmet'],
  hit30: ['vergi_sgk', 'hibe', 'faiz', 'kredi', 'ortaklik', 'hizmet'],
  argeMerkezi: ['vergi_sgk'],
  kanun4691: ['vergi_sgk'],
  teknogirisimRozeti: ['destek_degil'],
  turcorn: ['hizmet'],
  kanun5746: ['vergi_sgk'],
  vergi11257: ['vergi_sgk'],
  sgk4447: ['vergi_sgk'],
  asgariUcretDestegi: ['vergi_sgk'],
  iskurIep: ['hizmet'],
  bks: ['ortaklik'],
  kgf: ['kefalet'],
  eximbank: ['kredi'], // Kaynak bulunamadı. Eski eşleme kaldı.
  tkyb: ['ortaklik'],
  ttgv: ['hizmet'],
  istka: ['hibe'],
  techIstanbul: ['hizmet'],
  ekip: ['hizmet'],
  adim: ['hizmet'],
  abProgramlari: ['hibe'],
  eic: ['hibe', 'ortaklik'],
  turkpatent: ['hizmet'], // KOBİ ücret indirimi hizmet ya da ayni destek sayılır.
  meslekOrgutleri: ['hizmet'], // Kaynak bulunamadı. Eski eşleme kaldı.
}

export const FAYDA_ADI: Record<FaydaTuru, string> = {
  hibe: 'Hibe',
  vergi_sgk: 'Vergi ve prim indirimi',
  faiz: 'Faiz desteği',
  kredi: 'Geri ödemeli kredi',
  ortaklik: 'Ortaklık yatırımı',
  kefalet: 'Kefalet',
  hizmet: 'Hizmet ya da ayni destek',
  destek_degil: 'Destek değil',
}

export const FAYDA_ETKISI: Record<FaydaTuru, string> = {
  hibe: 'Geri ödenmez. Kasaya para girebilir. Hisse istemez.',
  vergi_sgk: 'Geri ödeme yok. Kasaya para girmez. Hisse istemez.',
  faiz: 'Kredi geri ödenir. Ödeme biçimini kuruma sorun. Hisse istemez.',
  kredi: 'Kredi geri ödenir. Kasaya para girebilir. Hisse istemez.',
  ortaklik: 'Geri ödeme yok. Kasaya para girebilir. Yatırımcı hisse ister.',
  kefalet: 'Kredi geri ödenir. Kefalet kasaya para getirmez. Hisse istemez.',
  hizmet: 'Hizmet kasaya para getirmez. Geri ödeme yok. Hisse istemez.',
  destek_degil: 'Destek ödemesi, geri ödeme ya da hisse yok.',
}

// Bu katalog kaydı ödemeyi işletmeye değil, eğitim katılımcısına bağlar.
export const KATILIMCI_ETKISI = 'Ödeme katılımcıya yapılır. İşletme geri ödeme yapmaz. Hisse istenmez.'

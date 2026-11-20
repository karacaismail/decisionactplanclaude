// Tek seferlik dönüştürme betiği. 20 Kasım 2026 Cuma günü çalıştırıldı.
// Girdi 1: eski katalog. Eski katalog 137add0 commitindeki src/modules/destek/data/programlar.ts dosyasıdır. Bu dosyanın KATALOG dizisi JSON olarak verilir.
// Girdi 2: bu klasördeki grup-a.json, grup-b.json ve grup-c.json dosyaları.
// Çıktı: src/modules/destek/data/katalog.json. Bu dosya artık kataloğun kendisidir. Betik yeniden çalıştırılmaz.
// Kullanım: node katalog-donustur.mjs eski.json docs/moduller/dogrulama src/modules/destek/data/katalog.json
import { readFileSync, writeFileSync } from 'node:fs'
const [eskiYol, dogYol, cikti] = process.argv.slice(2)
const eski = JSON.parse(readFileSync(eskiYol, 'utf8'))
const dog = Object.fromEntries(['a', 'b', 'c'].flatMap((g) => JSON.parse(readFileSync(`${dogYol}/grup-${g}.json`, 'utf8'))).map((p) => [p.id, p]))
const BUGUN = '2026-11-20'
const DOGRULANAN = new Set(['dogrulandi', 'degisti', 'kaldirildi'])

const TAVAN = {
  tubitak1501: 'hibe_tavani', tubitak1505: 'hibe_tavani', tb10962Surdurulebilirlik: 'hibe_tavani', istka: 'hibe_tavani',
  kosgebGirisimciA: 'kredi_anaparasi', kosgebGirisimciB: 'kredi_anaparasi', kosgebYapayZekaKredisi: 'kredi_anaparasi',
  kosgebKapasite: 'kredi_anaparasi', kosgebKuresel: 'kredi_anaparasi', kosgebDijitalDonusum: 'kredi_anaparasi', bigg1812: 'yok',
}
const ORANSAL = new Set(['tubitak1507', 'tubitak1707', 'tubitak1711', 'tubitak1509', 'tubitak1702', 'eureka1709', 'yatirimTesvik', 'argeMerkezi', 'kanun4691', 'kanun5746', 'vergi11257', 'sgk4447', 'asgariUcretDestegi', 'iskurIep'])
const DURUM = { tubitak1505: 'surekli', tubitak1702: 'surekli', tubitak1509: 'surekli', kosgebIsKurma: 'surekli', kosgebIsletmeGelistirme: 'kaldirildi', kosgebKapasite: 'acik', istka: 'acik', techIstanbul: 'cagri_bekleniyor', ttgv: 'acik' }
const KATEGORI = { ttgv: 'ayni', turkpatent: 'ayni' }
const KRITIK = /(ön kaydının son günü|kapandığı gün|başvurunun son günü|başvurusunun son günü|son başvuru günü|^Son başvuru$|Tam başvuruların toplandığı gün|uygulama süresinin sonu|İstisnanın bitiş günü|Teşvikin son günü|Destek döneminin son günü|Uluslararası başvurunun son günü|Ulusal ön başvurunun son günü)/
const KRITIK_DEGIL = /ikinci aşama|COP31/

const buyuk = (m) => m.trim().charAt(0).toLocaleUpperCase('tr-TR') + m.trim().slice(1)
const nokta = (m) => (/[.!?]$/.test(m.trim()) ? m.trim() : `${m.trim()}.`)
function fact(v, value) {
  const f = { state: 'kaynakli', value, sourceUrl: v.kaynakUrl, asOf: BUGUN }
  if (v.alinti) f.alinti = v.alinti
  if (v.ikincil) f.ikincil = true
  return f
}
const bilinmiyor = (url) => ({ state: 'bilinmiyor', sourceUrl: url, asOf: BUGUN })

const sonuc = eski.map((p) => {
  const v = dog[p.id]
  const eskiBilinmiyor = { state: 'bilinmiyor', sourceUrl: p.kaynak.url, asOf: p.kaynak.asOf }
  const temel = { ...p, metinKontrol: p.kaynak.asOf, kombinasyon: [], sure: { degerlendirme: eskiBilinmiyor, ilkOdeme: eskiBilinmiyor }, odemeBicimi: eskiBilinmiyor }
  if (!v || !DOGRULANAN.has(v.durum)) return temel
  const a = v.alanlar
  const url = v.faydaKaynak ?? p.kaynak.url
  const tavanTuru = TAVAN[p.id] ?? (ORANSAL.has(p.id) ? 'oransal' : 'yok')
  const tutar = {
    metin: a.tavan ? fact(a.tavan, nokta(a.tavan.metin)) : bilinmiyor(url),
    tavanTL: TAVAN[p.id] && typeof a.tavan?.deger === 'number' ? fact(a.tavan, a.tavan.deger) : bilinmiyor(url),
    tavanTuru,
  }
  if (a.oran) tutar.oran = fact(a.oran, nokta(a.oran.metin))
  const tarihler = (a.tarihler ?? []).map((t) => ({ ad: t.ad, tarih: fact(t, t.tarih), kritik: KRITIK.test(t.ad) && !KRITIK_DEGIL.test(t.ad) }))
  const sureAlan = (s) => (s ? fact(s, s.baslangicOlayi ? `${nokta(buyuk(s.metin))} Süre şu olayla başlar: ${buyuk(s.baslangicOlayi)}.` : nokta(buyuk(s.metin))) : bilinmiyor(url))
  const kombinasyon = (v.kombinasyon ?? []).filter((k) => k.alinti && k.kaynakUrl?.startsWith('https:') && eski.some((x) => x.id === k.digerProgramId))
    .map((k) => ({ digerProgramId: k.digerProgramId, iliski: fact(k, k.iliski), yonlu: false }))
  return {
    ...temel,
    kategori: KATEGORI[p.id] ?? p.kategori,
    durum: DURUM[p.id] ?? p.durum,
    tutar,
    tarihler,
    kaynak: { ...p.kaynak, asOf: BUGUN },
    kombinasyon,
    sure: { degerlendirme: sureAlan(a.sure?.degerlendirme), ilkOdeme: sureAlan(a.sure?.ilkOdeme) },
    odemeBicimi: a.odemeBicimi ? fact(a.odemeBicimi, nokta(buyuk(a.odemeBicimi.metin))) : bilinmiyor(url),
  }
})
// Doğrulama belgesinde açıkça yazan metin düzeltmeleri. Bu metinler sayı taşımaz.
const DUZELTME = {
  tubitak1501: (p) => { p.kosullar[0] = "Türkiye'de yerleşik ve KOBİ ölçeğinde bir sermaye şirketi olmalı." },
  kosgebTekmer: (p) => {
    p.ad = 'KOSGEB Teknoloji Merkezi Destek Programı'
    p.destekTuru = 'Merkezi işleten kuruluşa hibe ve geri ödemeli destek'
    p.kosullar = ['Bu programa işletme doğrudan başvuramaz.', 'Başvuruyu TEKMER işletici kuruluşu ya da teknoloji geliştirme bölgesi yönetici şirketi yapar.']
    p.kaynak = { url: 'https://www.kosgeb.gov.tr/site/tr/genel/destekdetay/9297/teknoloji-merkezi-destek-programi', ad: 'KOSGEB Teknoloji Merkezi Destek Programı ve SEGEM sayfaları', asOf: BUGUN }
  },
  kosgebIsKurma: (p) => {
    p.ozet = 'KOSGEB, yeni işletmenin platform giderlerine ve performansına hibe verir.'
    p.destekTuru = 'Hibe. Platform giderleri desteği ve performans desteği olarak verilir.'
    p.uygunGider = ['Platform giderleri']
    p.haricGider = ['Kuruluş giderleri. Yeni yönergede bu destek yok.']
    p.kosullar = [...p.kosullar, 'Performans desteği yalnız girişimcisi genç, kadın, engelli, gazi ya da birinci derece şehit yakını olan işletmelere verilir.']
  },
  kosgebIsletmeGelistirme: (p) => {
    p.ozet = 'KOSGEB bu programı kaldırdı ve yeni başvuru almıyor.'
    p.kaynak = { url: 'https://www.kosgeb.gov.tr/site/tr/genel/destekler/6530/yururlukten-kaldirilan-destekler', ad: 'KOSGEB yürürlükten kaldırılan destekler sayfası', asOf: BUGUN }
  },
  istka: (p) => { p.kosullar = ['Açık çağrıya şirketler başvuramaz.', 'Kamu kurumları, belediyeler, odalar, dernekler, vakıflar, üniversiteler ve teknoloji geliştirme bölgesi yönetici şirketleri başvurabilir.', ...p.kosullar] },
  ttgv: (p) => {
    p.ozet = 'Vakıf, teknoloji projelerine hizmet desteği verir.'
    p.destekTuru = 'Hizmet desteği'
  },
  turkpatent: (p) => {
    p.ad = 'Türk Patent ve Marka Kurumu tescili ve KOBİ ücret indirimi'
    p.ozet = 'Kurum, ilk patent başvurusu yapan KOBİ için ücret indirimi uygular.'
    p.destekTuru = 'Ücret indirimi'
    p.kosullar = ["İndirim yalnız KOBİ'nin ilk patent başvurusunda geçerlidir.", ...p.kosullar]
    p.kaynak = { ...p.kaynak, url: 'https://www.turkpatent.gov.tr/haberler/kobilerin-ilk-patent-basvurularina-ve-yapay-zeka-alanindaki-acil-arastirma-raporlarina-indirim', ad: 'Türk Patent ve Marka Kurumu KOBİ ücret indirimi duyurusu' }
  },
}
for (const p of sonuc) DUZELTME[p.id]?.(p)
// Bir alıntı noktalı virgül taşır. Ekran metni denetimi noktalı virgülü yasaklar. Alıntının ilk parçası üç noktayla kısaltılır.
for (const p of sonuc) {
  const f = p.odemeBicimi
  if (f.alinti?.includes('girişimler; ')) f.alinti = `… ${f.alinti.split('; ')[1]}`
}
writeFileSync(cikti, `${JSON.stringify(sonuc, null, 2)}\n`)
console.log(sonuc.length, 'program yazıldı')

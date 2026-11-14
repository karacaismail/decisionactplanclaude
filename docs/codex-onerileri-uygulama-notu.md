# Codex önerileri: uygulama notu

Bu belgeyi Claude 14 Kasım 2026 Cumartesi günü hazırladı. Kaynak, Codex'in "Strateji öncesi araştırma ve ön yüz uygulama raporu"dur. Bu belge o rapordaki önerilerin bu uygulamada nereye gittiğini anlatır.

## Kısa sonuç

Codex'in altı önerisinin hepsi bu uygulamaya çevrildi. Dört öneri tam uygulandı. İki öneri kısmen uygulandı. Uygulanmayan parçalar ve nedenleri 4. bölümdedir.

Yeni kayıtların hepsi isteğe bağlıdır. Hiçbiri geçiş kapısının ölçütü değildir. Geçiş kapısı yine 9 zorunlu ve 7 destekleyici ölçüte bakar.

## 1. Adım numaraları neden farklı?

Codex raporu kendi uygulamasına göre yazıldı. O uygulamada geçiş 17. adımdadır ve seçim 18. adımdadır. Bu uygulamada sıra farklıdır.

| Konu | Codex raporunda | Bu uygulamada |
|---|---|---|
| Yol adayları | 11. adım | Adım 18 |
| Geçiş kararı | 17. adım | Geçiş kapısı. Adım değildir. |
| Yolun seçimi | 18. adım | Adım 19 |
| Destekleyici ölçüt sayısı | 6 | 7 |

Güncel sıra [süreç haritasındadır](surec-haritasi.md).

## 2. Hangi öneri nereye gitti?

| No | Codex önerisi | Bu uygulamada nerede? | Durum |
|---|---|---|---|
| 1 | Asıl engeli yaz. | Adım 18, "Asıl engel" bölümü. Devir raporunun 1. bölümü. | Uygulandı |
| 2 | Başarının bağlı olduğu koşulu tanımla. | Adım 18, "Başarı neye bağlı?" bölümü. Devir raporunun 1. bölümü. | Uygulandı |
| 3 | "Bu yol neden çalışabilir?" sorusunu ekle. | Adım 18, "Bu yol neden çalışabilir?" bölümü. Devir raporunun 4. bölümü. | Uygulandı |
| 4 | Seçimi değiştirecek denemeyi öne çıkar. | Adım 10'daki "Yanlış çıkarsa hangi yol değişir?" alanı. Devir raporunun 5. bölümü. | Kısmen uygulandı |
| 5 | Kullanılabilir kaynağı toplam yatırımdan ayır. | Adım 16, "Serbest bütçe" bölümü. Adım 12, "Darboğaz" bölümü. | Uygulandı |
| 6 | Kurum ya da iş modeline göre soruları aç. | Adım 12, "Grup katkısı". Adım 15, "Pazar yeri eşleşmesi" ve "Fayda". Devralma ekranı. | Kısmen uygulandı |

## 3. Kurallar

### Asıl engel

Karar sahibi engeli, nedenini ve etkilediği yolu yazar. Karar sahibi ikinci bir açıklama da yazar. Sonra iki açıklamayı ayıran bulguyu yazar.

Karar sahibi kanıtı yeniden yazmaz. Kanıtı kanıt defterinden seçer.

### Başarı koşulları

Her koşul bir iddiadır. Yazılım koşulun durumunu yalnız bağlı kanıtlardan çıkarır.

| Bağlı kanıt | Durum |
|---|---|
| Hiç kanıt bağlı değil. | Sınanmadı |
| Yalnız destekleyen kanıt bağlı. | Destek var |
| Yalnız karşı bulgu bağlı. | Karşı bulgu var |
| İkisi de bağlı. | Bulgular çelişiyor |

Dört kural daha vardır:

1. Destekleyen kanıtın kendi karşı bulgusu varsa durum "Bulgular çelişiyor" olur. Yazılım karşı bulguyu gizlemez.
2. Başlangıç değeri boşsa rapor "Bilinmiyor" yazar. Ölçülen sıfır "0" olarak kalır.
3. Karar sahibi sınırı denemeden sonra seçtiyse rapor "Sınır sonradan belirlendi" yazar.
4. Bağlı kanıt silinirse rapor eksik bağlantıyı bildirir. Yazılım kanıt uydurmaz.

Koşul sayısı için zorunlu bir sayı yoktur. Codex bu konuda haklıdır: 3 ile 6 arası bir sayı her işe uymaz.

### Serbest bütçe

Serbest bütçe şu hesapla bulunur. Harcama sınırından harcanan tutar düşülür. Koşullu izinlere bağlı tutar düşülür. Ödenmemiş taahhüt düşülür. Her tutar bir kez düşülür.

Bir örnek verelim. Harcama sınırı 100 bin TL'dir. Harcanan tutar 30 bin TL'dir. Ödenmemiş taahhüt 50 bin TL'dir. Serbest bütçe 20 bin TL olur.

Karar sahibi taahhüdü bilmiyorsa yazılım tutar yazmaz. Rapor "Bilinmiyor" yazar.

### Eşleşme oranı

Yazılım oranı iki sayıdan hesaplar: geçerli talep ve uygun teklif alan talep. Geçerli talep sıfırsa yazılım oran hesaplamaz. Sayı yazılmadıysa oran görünmez.

### İş türüne özgü sorular

| Profil | Açılan bölüm | Ayrım |
|---|---|---|
| İş bir gruba bağlı. | Adım 12, "Grup katkısı" | Grup içi talep, dış talebin kanıtı değildir. |
| Müşteri türü pazar yeri. | Adım 15, "Pazar yeri eşleşmesi" | Kayıtlı satıcı ile cevap veren satıcı ayrıdır. |
| Hizmet ücretsiz. | Adım 15, "Fayda" | Katılan kişi ile yararlanan kişi ayrıdır. |
| İş devralınıyor. | Devralma ekranı | Eski karar bugün yeniden sınanır. |

Bu bölümler yalnız ilgili profilde görünür. Tek kurucu yeni iş açarsa hiçbiri görünmez.

## 4. Uygulanmayan parçalar ve nedenleri

- **Roller.** Codex salt okunur rolü sınamayı önerdi. Bu uygulamada rol yoktur. Veri tek kullanıcının tarayıcısında durur.
- **İkinci görüş kaydı.** Codex, karşı görüşü savunan kişinin bulgu seçmesini önerdi. İlk turda yalnız "başka açıklama" ve "ayıran bulgu" alanları eklendi. Sonradan Adım 17'ye "Ayrı görüş" bölümü de eklendi.
- **Deneme kaydına bağ.** Codex, denemeyi engele ve koşula bağlamayı önerdi. Bu uygulamada ayrı bir deneme kaydı yoktur. Bağ, kanıt defteri üzerinden kurulur.
- **Benzer yolları bulma.** Yazılım anlamca benzer yolları bulamaz. Bu yüzden dört soru her zaman ipucu olarak görünür. Birebir aynı yazılmış yolları ise bulur. Bu kural sonradan eklendi ve [karşılaştırma raporundadır](codex-uygulamasi-karsilastirma-raporu.md).
- **Ek formların ayrı indirilmesi.** Yeni bölümler küçük form tanımlarıdır ve ana pakettedir. Ayrı indirilen tek veri yöntem yardımıdır.
- **OGSM ve Hoshin Kanri.** Codex de bu iki yöntemi strateji sonrasına bıraktı. Bu uygulamada da eklenmedi.
- **Yüzde 42 zamanlama değeri.** Codex bu oranı puanlamaya almamayı önerdi. Bu uygulamada da yoktur.

## 5. Kodda nerede?

| Konu | Dosya |
|---|---|
| Asıl engel, başarı koşulu, yol bağı, serbest bütçe, eşleşme oranı | `src/engine/crux.ts` |
| Form alanları | `src/data/steps/karar3.ts`, `karar4.ts`, `karar5.ts` |
| Rapor | `src/reports/handoff.ts`, `src/screens/HandoffScreen.tsx` |
| Birim testleri | `src/engine/crux.test.ts`, `src/reports/handoff.test.ts` |
| Tarayıcı testleri | `tests/engel.spec.ts` |

## 6. Sınırlar

- Örnek plandaki asıl engel ve koşullar örnek için yazıldı. Gerçek veri değildir.
- Codex raporundaki alıntıların özgün metinle doğruluğu denetlenmedi.
- Bu not gerçek okurla denenmedi.

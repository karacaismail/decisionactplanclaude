# Firmografi ve pazar büyüklüğü doğrulaması (ikinci tur)

Bu not 16 Kasım 2026 Pazartesi günü yazıldı. Kapsam: ICP raporundaki şirket sayıları, sektör rakamları, KOBİ eşiği ve aile şirketi verileri.

Bu turda kaynakların çoğu dosya olarak indirildi ve tam okundu. Okunan dosyalar şunlardır:

- TÜİK bülten 58132 ve büyüklük tablosu (xls). TÜİK Veri Portalı API'si ile alındı.
- TÜİK İş Kayıtları 2024 veri setleri (csv). Veri Portalı toplu indirme ile alındı.
- TÜİK Ücretli Çalışan İstatistikleri veri seti (csv, Eylül 2026 sürümü) ve Kasım 2025 bülteni.
- TÜİK Girişim Özelliklerine Göre Dış Ticaret bültenleri (2024 ve 2025) ve KOBİ bülteni (2024).
- SGK İstatistik Yıllığı 2025, Bölüm 1 (xlsx), Tablo 1.9, 1.12, 1.14 ve Metaveri sayfası.
- Resmî Gazete 32979, Karar 10182 (PDF, görüntü olarak okundu).
- TOBB 2024 ve 2025 Sanayi Kapasite Raporu bültenleri (doc).
- PwC 2016 Türkiye sonuçları (44 sayfa PDF), TKYD 2017 basın bülteni ve TKYD dergisi sayı 35, TKYD ve TAİDER 2021 raporu (56 sayfa PDF).

Kısaltmalar: YSHİ, TÜİK Yıllık Sanayi ve Hizmet İstatistikleri demektir. İş Kayıtları, TÜİK'in girişim kayıt sistemidir.

## Doğrulama tablosu: rapordaki rakamlar doğru mu?

### Takeaway
Pazar büyüklüğünü taşıyan bütün TÜİK ve SGK sayıları birincil tablodan birebir doğrulandı. Düzeltme gereken yerler şunlardır: sektör istihdam rakamları revize edildi, TKYD ve TAİDER sayıları şirket değil katılımcı sayısıdır, "aile meclisi" aslında "aile konseyi"dir ve mobilya ihracatındaki 4,6 milyar dolar ile 5,17 milyar dolar kapsam farkıdır.

### Cited Findings

| No | Rapordaki ifade | Eski durum | Yeni durum | Kaynak ve tam yer | Düzeltilmiş ifade | Etki |
|---|---|---|---|---|---|---|
| 1 | 2025'te 50-249 çalışanlı 34.072, 250+ çalışanlı 6.237 girişim | Bülten okunmuştu, tablo ayrıştırılmamıştı | Doğrulandı | [TÜİK bülten 58132](https://veriportali.tuik.gov.tr/tr/press/58132), tablo "Ekonomik faaliyet ve büyüklük grubuna göre temel göstergeler, 2025", sayfa t1, satır 7 ve 8 | Değişmez. Veri geçicidir. | Yok |
| 2 | 2024'te 34.163 ve 6.400 girişim | Veri tarayıcısından | Doğrulandı | [TÜİK DF_BR_BUYUKLUK_GIRISIM_V1](https://databrowser2.tuik.gov.tr/#/tr/tuik/TR,DF_BR_BUYUKLUK_GIRISIM_V1,1.0), Türkiye, 2024 satırları | Değişmez | Yok |
| 3 | İmalatta 2025'te 12.140 ve 2.377 girişim | Bültenden | Doğrulandı | TÜİK bülten 58132, aynı tablo, "C - İmalat" satır 17 ve 18 | Değişmez | Yok |
| 4 | İmalatta 2024'te 12.388 ve 2.487 girişim | Veri tarayıcısından | Doğrulandı | [TÜİK DF_BR_FAALIYET_BUYUKLUK_GIRISIM_TR_IBBS1_2_V1](https://databrowser2.tuik.gov.tr/), Türkiye, "İmalat", 2024 | Değişmez | Yok |
| 5 | 50-249 bandında ortalama ciro yaklaşık 734 milyon TL. İmalatta 522 milyon TL. | Hesap | Doğrulandı | TÜİK bülten 58132 tablosu. Ciro 25.017.711.212.201 TL, imalat cirosu 6.341.054.006.684 TL. | 734,3 milyon TL ve 522,3 milyon TL. 250+ bandında 6.873,5 milyon TL, imalat 250+ bandında 7.102,0 milyon TL. | Yok |
| 6 | Giyimde yaklaşık 2.250 orta ölçekli girişim | Sınıf toplamı, tek kişi hesabı | Doğrulandı | TÜİK İş Kayıtları 2024, Türkiye satırları. Sekiz giyim sınıfının toplamı 50-249 bandında 2.253, 250+ bandında 282. | Değişmez. 250+ değeri alt sınırdır, iki sınıf gizlidir. | Yok |
| 7 | Fabrikasyon metal 1.194, tekstil 1.154, gıda 1.004, makine 754 | Sınıf toplamı | Hâlâ açık, yöntem doğrulandı | Aynı veri seti. Giyim hücresi birebir tuttuğu için yöntem güvenilirdir. Diğer bölümler bu turda yeniden toplanmadı. | "En az" ifadesi korunmalı | Düşük |
| 8 | SGK'da 250-499 sigortalılı 3.807, 500+ sigortalılı 2.191 işyeri | Yıllıktan | Doğrulandı | [SGK İstatistik Yıllığı 2025](https://www.sgk.gov.tr/Istatistik/Yillik/fcd5e59b-6af9-4d90-a451-ee7500eb1cb4/), Bölüm 1, Tablo 1.9, 2025 sütunu. 250-499 alt bantları 1.303 + 897 + 690 + 506 + 411. | Değişmez | Yok |
| 9 | İmalatta 1.176 işyeri 250-499 bandında | Yıllıktan | Doğrulandı | SGK 2025, Tablo 1.12, NACE 10 ile 33 arası satırların toplamı. 500+ toplamı 621, 50-249 toplamı 11.711. | Değişmez | Yok |
| 10 | 250-499 bandında yaklaşık 3.960 girişim, imalatta 1.560 | Tahmin | Doğrulandı (hesap), yöntem zayıf | 6.237 × 3.807 ÷ 5.998 = 3.958,7. 2.377 × 1.176 ÷ 1.797 = 1.555,6. | "Yaklaşık 3.960, büyük olasılıkla üst uca yakın" | Orta. Gerekçe 2. bölümde. |
| 11 | SGK il tablosunda Mardin 404, Batman 394 işyeri 50-249 bandında | Yıllıktan | Doğrulandı | SGK 2025, Tablo 1.14. Mardin 269 + 135, Batman 251 + 143, Diyarbakır 405 + 239 = 644. | Değişmez | Yok |
| 12 | KOBİ eşiği 250 çalışan ve 1 milyar TL. Karar numarası okunmadı. | Arama özeti | Doğrulandı | [Resmî Gazete 32979, 7 Ağustos 2025 Perşembe, Karar 10182](https://www.resmigazete.gov.tr/eskiler/2025/08/20250807-27.pdf), Madde 1 ve 2 | Karar 10182, 7297 sayılı yönetmeliğin 4. maddesi (1) (b) bendinde ve 5. maddesi (1) (c) bendinde "beşyüz milyon" ibaresini "bir milyar" yaptı. Yönetmelik yayım günü yürürlüğe girdi. | Yok. Kaynak artık birincildir. |
| 13 | TOBB raporlarına göre 50-249 çalışanlı yaklaşık 12.600 tesis | Haber ve yüzde hesabı | Düzeltildi (küçük) | [TOBB 2025 bülteni, 30 Ocak 2026 Cuma](https://www.tobb.org.tr/BilgiErisimMudurlugu/Documents/kapasiteistatistik/hb-san-kap-ist-2025.doc), "Çalışan aralıklarına göre rapor dağılımı" tablosu | 50-99 bandında 7.322, 100-249 bandında 5.293 rapor vardır. Toplam 12.615'tir. 250+ bandında 2.450 rapor vardır. Tesis başına ortalama çalışan 2025'te 41,02'dir. | Yok |
| 14 | Tesis başına 42,56 çalışan | TOBB 2024 bülteni | Doğrulandı, ama eski | [TOBB 2024 bülteni](https://www.tobb.org.tr/BilgiErisimMudurlugu/Documents/kapasiteistatistik/hb-san-kap-ist-2024.doc), satır "ortalama 42,56 kişi" | 2025 değeri 41,02'dir. Raporda 2025 değeri kullanılmalı. | Düşük |
| 15 | Büyük girişimlerin ihracat payı %70,4 mü, %44,4 mü? | Çelişki | Çözüldü | [TÜİK bülten 53931](https://veriportali.tuik.gov.tr/tr/press/53931) ve [TÜİK bülten 54054](https://veriportali.tuik.gov.tr/tr/press/54054), Açıklamalar bölümleri | İki seri farklı tanım kullanır. Ayrıntı 3. bölümdedir. | Raporun seçimi doğrudur. |
| 16 | Giyimde ücretli çalışan 210.708 azaldı, tekstilde 88.578 azaldı | Haber | Düzeltildi | [TÜİK Ücretli Çalışan İstatistikleri veri seti](https://databrowser2.tuik.gov.tr/#/tr/tuik/TR,DF_UCRETLI_CALISAN_ISTATISTIKLERI_C,1.0), arındırılmamış seri, Kasım 2022 ve Kasım 2025 | Güncel resmî seride giyim 209.205, tekstil 89.295 kişi azaldı. Ayrıntı 4. bölümdedir. | Düşük. Yön değişmez. |
| 17 | Gıda 35.168 kişi arttı | Haber | Düzeltildi | Aynı veri seti | Güncel seride artış 29.461 kişidir. | Düşük |
| 18 | Makine 11.776 kişi azaldı | Haber | Düzeltildi | Aynı veri seti | Güncel seride azalış 13.558 kişidir. | Düşük |
| 19 | Deri 22.230 azaldı, otomotiv 5.639 arttı, mobilya 1.438 arttı | Haber | Düzeltildi | Aynı veri seti | Deri 22.091 azaldı. Otomotiv 6.283 arttı. Mobilya 3.323 arttı. | Düşük |
| 20 | Halefiyet planı olmayan şirket %54 (PwC 2016) | Belge okunmuştu | Doğrulandı | [PwC 2016 Türkiye sonuçları](https://taider.org.tr/images/belgeler/pwc_kuresel_aile_sirketleri_arastirmasi__turkiye_sonuclari_2016.pdf), PDF sayfa 1 ve sayfa 15 Şekil 2 | Değişmez. Küresel oran %43'tür. | Yok |
| 21 | Yazılı ve paylaşılmış halefiyet planı %4 | Belge okunmuştu | Doğrulandı | Aynı PDF, sayfa 4, 12 ve 16 | Değişmez. Küresel oran %15'tir. | Yok |
| 22 | %95 bütün şirketler, %75 borsadaki şirketler | Belge okunmuştu | Doğrulandı, kaynak yöntemsiz | Aynı PDF, sayfa 10 | Bu oran PwC'nin kendi ifadesidir. Yöntem ve kaynak verilmez. | Aralık tahmini kaba kalır |
| 23 | Aile anayasası olmayan şirket yaklaşık %60 | ORSİAD özeti | Doğrulandı | [TKYD basın bülteni, 8 Ekim 2017 Pazar](https://www.tkyd.org/wp-content/uploads/2022/12/TKYD_Aile_Sirketleri_Anketi_Basin-Bulteni.pdf), sayfa 1. [TKYD dergisi sayı 35](https://www.tkyd.org/wp-content/uploads/2022/12/TKYD_Dergi_Sayi35.pdf), sayfa 18. | Değişmez | Yok |
| 24 | Aile meclisi olmayan şirket yaklaşık %53 | ORSİAD özeti | Düzeltildi | Aynı bülten, sayfa 2. Dergi sayfa 19. | Kaynak "aile konseyi" der. Doğru ifade: "Ana hissedar ailelerin yaklaşık %53'ünde aile konseyi yoktur." | Persona metni düzeltilmeli |
| 25 | Yönetim kurulunda aile dışı üye %56, kendini kurumsal sayan %27, yazılı kural %22, finans %75, profesyonel yönetim %52 | ORSİAD özeti | Doğrulandı | Aynı bülten, sayfa 1 ve 2. Dergi sayfa 18 ve 19. | Değişmez. Ek bilgi: %49 "süreç devam ediyor", %22 "hayır" dedi. %64'te yazılı kural yoktur. | Yok |
| 26 | TKYD 2017 örneklem büyüklüğü yazmaz | Açık | Hâlâ açık | Bülten ve dergi okundu. İkisinde de örneklem sayısı yoktur. | "Örneklem sayısı yayımlanmadı" | Oranlar ölçüsüz kalır |
| 27 | TKYD ve TAİDER 2021: "Yönetimi 66 şirkette birinci kuşak, 41 şirkette ikinci kuşak elinde" ve "128 şirketin 66'sı" | Belge okunmuştu | Düzeltildi | [TKYD ve TAİDER raporu](https://www.tkyd.org/wp-content/uploads/2024/01/TKYD-TAIDER-Gelecek-Neslin-Ise-Bakisi-Arastirma-Raporu.pdf), sayfa 32 | Bu sayılar şirket değil katılımcıdır. Doğru ifade: "Katılımcıların 66'sı yönetimi birinci kuşakta, 41'i ikinci kuşakta, 21'i üçüncü kuşakta olan şirketten geldi." Aynı aileden birden çok katılımcı olabilir. | Persona metni düzeltilmeli |
| 28 | Yazılı devir planı maddesi en düşük puanı aldı | Belge okunmuştu | Doğrulandı | Aynı rapor, sayfa 23, Tablo 4 | Puan -0,79'dur (-2 ile +2 ölçeği). Yazılı hisse devri kuralı -0,73'tür. | Yok |
| 29 | Küresel ölçekte tam geliştirilmiş halefiyet planı %22 (PwC 2025) | Haber özeti | Doğrulandı (ikincil), PwC sayfası erişilemedi | [Bloomberg HT, 27 Kasım 2025 Perşembe](https://www.bloomberght.com/pwc-aile-sirketleri-artan-kuresel-baskilarla-karsi-karsiya-3762476) | "Bütün kilit roller için tam geliştirilmiş halefiyet planı olan şirket oranı iki yıl önceki %26'dan %22'ye indi." Örneklem 1.325 kişidir. Türkiye kırılımı verilmez. | Düşük |
| 30 | Türk aile şirketlerinin yaklaşık %60'ı yönetimi devretmeyi, yaklaşık %70'i aile dışı yöneticiyi düşünür (KPMG 2018) | Arama özeti | Doğrulandı (ikincil) | [TGRT Haber, 7 Kasım 2018 Çarşamba](https://www.tgrthaber.com/ekonomi/turk-aile-sirketleri-2018de-cirolarini-artirdi-261771). KPMG basın bülteninin aktarımıdır. | Türkiye örneklemi yalnız 41 şirkettir. Bu not ifadeye eklenmeli. | Oran zayıf kanıttır |
| 31 | Makine ihracatı TİM'e göre 11,26, birliğe göre 28,7 milyar dolar | Çelişki, arama özeti | Çözüldü (kapsam farkı) | [TRT Haber, 26 Ocak 2026 Pazartesi](https://www.trthaber.com/haber/ekonomi/turkiyenin-makine-ihracati-287-milyar-dolarla-rekor-kirdi-932601.html) | 28,7 milyar dolar, MAİB'in serbest bölgeler dahil "konsolide makine imalat sanayii ihracatı"dır. 11,26 milyar dolar, TİM sektör tablosundaki "Makine ve Aksamları" kalemidir. | Raporda iki sayı birlikte, tanımıyla yazılmalı |
| 32 | Mobilya ihracatı 4,6 mı, 5,17 milyar dolar mı? | Çelişki | Çözüldü (kapsam farkı) | [Ekonomi Gazetesi, 26 Ocak 2026 Pazartesi](https://www.ekonomigazetesi.com/sektor-haberleri/mosfed-baskani-gulec-mobilyada-deger-bazinda-en-yuksek-ihracata-ulastik-70842). [Dünya, 29 Ocak 2026](https://www.dunya.com/sektorler/kuresel-rekabette-dayaniklilik-arayisi-ile-sektor-2026ya-temkinli-giriyor-haberi-813087). | Çekirdek mobilya için 4,6 milyar dolar kullanılmalı. Gerekçe 5. bölümdedir. | Düşük |
| 33 | Diyarbakır, Batman ve Mardin deseninin nedeni yok | Açık | Büyük ölçüde çözüldü | TÜİK İş Kayıtları 2024, il ve sınıf satırları | Batman ve Mardin'de neden giyim imalatıdır. Diyarbakır'da ana neden "iyileştirme ve diğer atık yönetimi" sınıfıdır. Ayrıntı 2. bölümdedir. | İl önceliği değişmez |
| 34 | TÜİK çok fabrikalı şirketi merkez iline mi yazar? | Bulunamadı | Çözüldü (veriyle) | TÜİK İş Kayıtları 2024 il toplamları ve SGK Tablo 1.14 | Her girişim tek bir ilde sayılır. Desen kayıtlı merkez iline atamayı gösterir. Ayrıntı 2. bölümdedir. | Marmara uydu illeri sayımda küçük görünür |

### Inferences
- TAM, SAM ve SOM hesaplarındaki girdilerin hiçbiri değişmedi. 40.309 TAM ve 38.000 ICP bandı geçerlidir.
- Değişen sayıların hepsi metin düzeyindedir. Hesap sonuçlarını etkilemez.

### Gaps
- Fabrikasyon metal, tekstil, gıda ve makine için bölüm toplamları bu turda yeniden toplanmadı. Giyim toplamı birebir tuttu. Bu yüzden yöntem güvenilirdir.

## Şirket sayıları, il ataması ve Güneydoğu deseni

### Takeaway
TÜİK her girişimi tek bir ilde sayar. Veri, girişimin kayıtlı merkez iline yazıldığını gösterir. Batman ve Mardin'deki çok sayıda orta ölçekli girişim giyim fabrikalarından gelir. Diyarbakır'da ise ana kaynak bir hizmet sınıfıdır.

### Cited Findings
- YSHİ'nin istatistiki birimi girişimdir. Veriler Gelir İdaresi mali tablolarından ve SGK kayıtlarından derlenir. 2016'dan beri anket yapılmaz. Çalışan sayısı yıllık ortalamadır. Kaynak: [TÜİK bülten 58132 metaverisi](https://veriportali.tuik.gov.tr/tr/press/58132), madde 3.4, 3.5 ve 18.5.
- YSHİ tarım, finans ve sigorta, kamu yönetimi ve hanehalkı işverenlerini kapsamaz. Kaynak: aynı metaveri, madde 3.3.
- İş Kayıtları 2024 il toplamları ulusal toplama birebir eşittir: 4.691.053 girişim. Gizli olmayan hücrelerde 50-249 bandının il toplamı 33.697'dir. 11 il gizlidir. Ulusal sayı 34.163'tür. Kaynak: [TÜİK DF_BR_BUYUKLUK_GIRISIM_V1](https://databrowser2.tuik.gov.tr/#/tr/tuik/TR,DF_BR_BUYUKLUK_GIRISIM_V1,1.0), 2024.
- TÜİK 250+ girişim sayısı ile SGK 250+ işyeri sayısı illere göre şöyledir. Kaynak: TÜİK İş Kayıtları 2024 ve [SGK 2025 Tablo 1.14](https://www.sgk.gov.tr/Istatistik/Yillik/fcd5e59b-6af9-4d90-a451-ee7500eb1cb4/).

| İl | TÜİK 250+ girişim, 2024 | SGK 250+ işyeri, 2025 | Oran |
|---|---|---|---|
| İstanbul | 2.661 | 1.466 | 1,82 |
| Ankara | 733 | 445 | 1,65 |
| İzmir | 391 | 311 | 1,26 |
| Bursa | 317 | 252 | 1,26 |
| Gaziantep | 191 | 187 | 1,02 |
| Kocaeli | 223 | 286 | 0,78 |
| Tekirdağ | 93 | 147 | 0,63 |
| Manisa | 75 | 122 | 0,61 |
| Türkiye | 6.400 | 5.998 | 1,07 |

- Batman'da 50-249 bandındaki 378 girişimin 218'i imalattadır. Bunların 121'i "diğer dış giyim", 46'sı "iç giyim", 10'u örme giyim sınıfındadır. Kaynak: [TÜİK DF_BR_FAALIYET_BUYUKLUK_GIRISIM_IBBS3_24_28](https://databrowser2.tuik.gov.tr/#/tr/tuik/TR,DF_BR_FAALIYET_BUYUKLUK_GIRISIM_IBBS3_24_28,1.0), 2024.
- Mardin'de 50-249 bandındaki 335 girişimin 213'ü imalattadır. Bunların 106'sı dış giyim, 50'si iç giyim, 20'si diğer giyim sınıfındadır. Kaynak: aynı veri seti.
- Türkiye'de "diğer dış giyim" sınıfında 50-249 bandında il toplamı 996 girişimdir. Batman 121, Mardin 106, Diyarbakır 51, Bitlis 36 ve Muş 19 girişim taşır. Bu beş il toplamın %33,4'ünü taşır (hesap: 333 ÷ 996). "İç giyim" sınıfında Mardin 50 ve Batman 46 girişim taşır. Kaynak: aynı veri seti.
- Diyarbakır'da 50-249 bandındaki 652 girişimin 240'ı "İyileştirme faaliyetleri ve diğer atık yönetimi hizmetleri" sınıfındadır. İmalatta yalnız 133 girişim vardır. Bu sınıfta ülke toplamı 2.001 girişimdir. Ankara 656, Diyarbakır 240, İzmir 153, Antalya 130 ve Van 80 girişim taşır. Kaynak: aynı veri seti.
- Türkiye'de bu bölgedeki tekstil ve hazır giyim yatırımları teşvik kapsamındadır. Batman, Van, Diyarbakır, Şanlıurfa ve Mardin bu illerdendir. Kaynak: [İşçi Haber](https://www.iscihaber.net/ekonomi/hazir-giyim-endustrisi-tesvikli-yatirimlarla-10-yilda-386-bin-yeni-istihdam-yaratti/11908), [Hürriyet](https://www.hurriyet.com.tr/ekonomi/tekstilde-tesvik-icin-adim-atildi-40384154). Bu iki kaynak arama sonucundan görüldü, tam okunmadı.

### Inferences
- **İl ataması (veriyle gösterim).** İl toplamları ulusal toplama eşittir. Demek ki bir girişim yalnız bir ilde sayılır. İstanbul ve Ankara'da büyük girişim sayısı büyük işyeri sayısından çok fazladır. Kocaeli, Tekirdağ ve Manisa'da tersi geçerlidir. En basit açıklama şudur: TÜİK girişimi kayıtlı merkez iline yazar. Fabrikası Kocaeli'de olan İstanbul şirketi İstanbul'da sayılır. Bu bir çıkarımdır. TÜİK metaverisinde kural yazılı olarak bulunamadı.
- **Satış için sonuç.** İl tablosu "karar merkezi"ni gösterir, fabrikayı göstermez. Bu durum satış için yararlıdır. Kararlar çoğu zaman merkezde verilir. Saha ziyareti için ise SGK işyeri tablosu daha iyidir.
- **Batman ve Mardin.** Desen, teşvikle kurulan giyim fabrikalarından gelir. Bu fabrikalar çoğu zaman ayrı şirket olarak kurulur ve 250 kişinin altında kalır. Bu girişimlerin kararı çoğu zaman İstanbul'daki ana grupta verilir. Bu yüzden bu iller ICP için zayıf adaydır. Bu bir çıkarımdır.
- **Diyarbakır.** 240 girişimlik hizmet sınıfının nedeni kesin değildir. Ankara'da da aynı sınıf çok kalabalıktır. Bu sınıf büyük olasılıkla kamuya personel ve temizlik hizmeti veren şirketleri içerir. Bu şirketler ICP değildir.
- **250-499 tahmini neden üst uca yakındır?** 600 kişilik ve iki fabrikalı bir şirket SGK'da iki tane 250-499 işyeri gibi görünür. Bu durum 250-499 payını büyütür. Mega şirketler de çok sayıda küçük işyerine bölünür. YSHİ'de 250+ girişimler ortalama 872 kişi çalıştırır (hesap: 5.437.398 ÷ 6.237). SGK'da 500+ işyeri ortalaması 1.028 kişidir (hesap: 2.251.596 ÷ 2.191). Bu iki ortalama aynı dağılımı göstermez. Bu yüzden 3.960 tahmini üst uca yakın kabul edilmelidir. Kesin sayı için TÜİK'ten özel tablo istenmelidir.

### Gaps
- TÜİK'in il atama kuralı yazılı metinde bulunamadı. Denenen yollar: YSHİ metaverisi, Veri Portalı arama API'si, veri seti metaveri uç noktası ("Sayfa bulunamadı" döndü). En iyi ikame cevap yukarıdaki veri gösterimidir.
- Diyarbakır'daki 240 girişimin kimliği doğrulanmadı. Denenen yol: web araması. Doğrulama için TÜİK sınıf ve il bazlı çalışan tablosu ya da EKAP ihale kayıtları gerekir.
- 250-499 bandını sayan kamu tablosu yoktur. SGK vergi numarasına göre girişim sayımı yapabilir. TÜİK özel tablo üretebilir.

## İki TÜİK büyüklük serisi neden farklı ihracat payı verir?

### Takeaway
Çalışan sayısına dayanan seri ICP için doğru seridir. 2025'te orta ölçek ihracatın %18,3'ünü, büyük ölçek %46,1'ini yaptı. KOBİ serisindeki %70,4 ciro eşiğini de kullanır ve 2024 için 500 milyon TL eşiğine dayanır.

### Cited Findings
- Girişim Özelliklerine Göre Dış Ticaret İstatistikleri, dış ticaret kayıtlarını İş Kayıtları'ndaki faaliyet ve çalışan bilgisiyle eşleştirir. Ölçek yalnız çalışan sayısıdır. Bu tanım AB el kitabından gelir. Kaynak: [TÜİK bülten 58066, 11 Eylül 2026 Cuma](https://veriportali.tuik.gov.tr/tr/press/58066), Açıklamalar.
- 2025'te ihracat payları: 1-9 çalışan %18,3, 10-49 çalışan %17,3, 50-249 çalışan %18,3, 250+ çalışan %46,1. İhracatçıların %74,2'si 1-9 çalışanlıdır. İlk 500 girişim ihracatın %51,0'ını yaptı. Kaynak: TÜİK bülten 58066.
- 2024'te aynı seride paylar: 1-9 çalışan %18,8, 10-49 çalışan %17,5, 50-249 çalışan %19,2, 250+ çalışan %44,4. Kaynak: [TÜİK bülten 53931, 26 Eylül 2025 Cuma](https://veriportali.tuik.gov.tr/tr/press/53931).
- Sanayi sektörünün ihracatında 250+ çalışanlı girişimlerin payı 2025'te %70,3, 2024'te %68,6'dır. Kaynak: TÜİK bülten 58066 ve 53931.
- KOBİ serisi 2024 için şu tanımı kullanır: 250 kişiden az çalışan ve net satış ya da bilançosu 500 milyon TL'yi aşmayan girişim. Kaynak: [TÜİK bülten 54054, 24 Aralık 2025 Çarşamba](https://veriportali.tuik.gov.tr/tr/press/54054), giriş paragrafı.
- KOBİ serisinde 2024 ihracat payları: mikro %2,4, küçük %10,7, orta %16,5. KOBİ toplamı %29,6'dır. Kalan %70,4 büyük girişimlerindir. Kaynak: TÜİK bülten 54054.
- KOBİ eşikleri 2018 ve 2022 değişiklikleri yüzünden seride kırılma yaratır. Kaynak: TÜİK bülten 54054 metaverisi, madde 15.2.

### Inferences
- KOBİ serisinde "büyük" girişim, 250 kişiden az çalışsa bile cirosu 500 milyon TL'yi aşan girişimi de kapsar. 2024'te bu seride 14.410 büyük girişim vardır. Çalışan serisinde 6.400 vardır. Fark yaklaşık 8.000 girişimdir. Bu girişimler ihracatı büyük sütununa taşır. %70,4 ile %44,4 arasındaki fark bu yüzden doğar.
- Kullanım kuralı: ICP büyüklüğü ve "orta ölçeğin ihracat payı" için çalışan serisini kullanın. "KOBİ desteği alabilir mi?" sorusu için KOBİ serisini kullanın.
- 2025 KOBİ serisi 1 milyar TL eşiğiyle derlenecek. Bu yüzden 2024 ile 2025 KOBİ sayıları karşılaştırılmamalıdır.

### Gaps
- Çalışan serisinde 250-499 alt bandı yayımlanmaz.

## Sektör istihdamı Kasım 2022 ile Kasım 2025 arasında nasıl değişti?

### Takeaway
Haberdeki rakamlar TÜİK'in Ocak 2026 sürümüne aittir. Güncel resmî seri revize edildi. Yön ve büyüklük aynıdır. Raporda güncel seri kullanılmalıdır.

### Cited Findings
Kaynak: [TÜİK Ücretli Çalışan İstatistikleri veri seti, DF_UCRETLI_CALISAN_ISTATISTIKLERI_C](https://databrowser2.tuik.gov.tr/#/tr/tuik/TR,DF_UCRETLI_CALISAN_ISTATISTIKLERI_C,1.0). Veri Portalı toplu indirme ile 16 Kasım 2026 Pazartesi günü alındı. Sürüm Eylül 2026'dır. Seri arındırılmamıştır.

| Sektör (NACE bölümü) | Kasım 2022 | Kasım 2025 | Fark, güncel seri | Haberdeki fark (CNBC-e) | Eylül 2026 |
|---|---|---|---|---|---|
| Giyim (14) | 729.100 | 519.895 | -209.205 | -210.708 | 510.383 |
| Tekstil (13) | 506.100 | 416.805 | -89.295 | -88.578 | 406.945 |
| Deri (15) | 78.549 | 56.458 | -22.091 | -22.230 | 54.977 |
| Gıda (10) | 558.335 | 587.796 | +29.461 | +35.168 | 613.999 |
| Makine (28) | 304.900 | 291.342 | -13.558 | -11.776 | 287.116 |
| Motorlu kara taşıtı (29) | 232.845 | 239.128 | +6.283 | +5.639 | 236.059 |
| Mobilya (31) | 205.278 | 208.601 | +3.323 | +1.438 | 212.638 |
| Fabrikasyon metal (25) | 403.930 | 409.548 | +5.618 | yok | 414.702 |
| İmalat (C) toplamı | 4.730.792 | 4.456.526 | -274.266 | yok | 4.461.805 |

- Kasım 2025 bülteni 16 Ocak 2026 Cuma günü yayımlandı. Bültenin tablosu yalnız NACE kısımlarını verir, bölümleri vermez. Kaynak: [TÜİK bülten 57949](https://veriportali.tuik.gov.tr/tr/press/57949).
- Haber rakamları bu bültenin yayımlandığı günkü veriye dayanır. Kaynak: [CNBC-e, 16 Ocak 2026 Cuma](https://www.cnbce.com/veriler/ucretli-calisan-sayisinda-giyim-tekstil-ve-deri-imalati-kirmizi-alarm-veriyor-321-bin-istihdam-kaybi-h23198).

### Inferences
- Giyim ve tekstil birlikte 298.500 kişi kaybetti (hesap: 209.205 + 89.295). Raporda 299.286 yazıyor. Fark %0,3'tür.
- Gıda artışı 35.168 değil, 29.461'dir. Gıda yine imalatın en büyük işverenidir. Eylül 2026'da gıda 613.999 kişiyle giyimin (510.383) çok üstündedir.
- Makine düşüşü güncel seride biraz daha büyüktür. Makine Eylül 2026'da da düşmeye devam etti (287.116).
- Bu revizyonlar öncelik sırasını değiştirmez.

### Gaps
- Revizyon geçmişi veri seti (DF_UCRETLI_CALISAN_ISTATISTIKLERI_O) indirilmedi. Bu yüzden haberdeki rakamın hangi sürüme ait olduğu birebir gösterilmedi.

## İhracat çelişkileri: makine ve mobilya

### Takeaway
İki çelişki de kapsam farkından gelir. Makinede iki sayı da doğrudur ama farklı şeyleri sayar. Mobilyada 4,6 milyar dolar çekirdek mobilyayı anlatır.

### Cited Findings
- 28,7 milyar dolar, MAİB verilerinden derlenmiştir. Serbest bölgeler dahildir. Kapsam "makine imalat sanayisinin konsolide ihracatı"dır. Artış %1,9'dur. Miktar düştü, kilogram fiyatı 8,1 dolara çıktı. Almanya 3,2 milyar dolar, ABD yaklaşık 2 milyar dolardır. Kaynak: [TRT Haber, 26 Ocak 2026 Pazartesi](https://www.trthaber.com/haber/ekonomi/turkiyenin-makine-ihracati-287-milyar-dolarla-rekor-kirdi-932601.html).
- 11,26 milyar dolar, TİM'in sektör tablosunda "Makine ve Aksamları" kalemidir. Artış %0,7'dir. Kaynak: [Ekonomi Gazetesi, TİM tablosu](https://www.ekonomigazetesi.com/sektor-haberleri/2025te-en-fazla-ihracat-otomotivden-68955).
- MOSFED başkanı 2025 mobilya ihracatını 5,17 milyar dolar olarak verdi. Aynı konuşmada miktar yaklaşık 1,2 milyon ton, kilogram fiyatı 3,82 dolardır. Kaynak: [Ekonomi Gazetesi, 26 Ocak 2026 Pazartesi](https://www.ekonomigazetesi.com/sektor-haberleri/mosfed-baskani-gulec-mobilyada-deger-bazinda-en-yuksek-ihracata-ulastik-70842).
- Dünya gazetesi 2025 mobilya ihracatını yaklaşık 4,6 milyar dolar, artışı %1,71 olarak verdi. Kaynak: [Dünya, 29 Ocak 2026](https://www.dunya.com/sektorler/kuresel-rekabette-dayaniklilik-arayisi-ile-sektor-2026ya-temkinli-giriyor-haberi-813087).

### Inferences
- **Makine.** TİM tablosu ihracatçı birliği kaydına göre sayar. MAİB rakamı ise makine ürünlerinin tamamını ve serbest bölgeleri toplar. Bu yüzden MAİB rakamı yaklaşık 2,5 kat büyüktür. Raporda şu cümle kullanılmalı: "Makine ve Aksamları İhracatçıları Birliği kaydıyla 11,26 milyar dolar. Serbest bölgeler dahil konsolide makine imalatı ihracatı 28,7 milyar dolar." Sektör büyüklüğünü anlatmak için 28,7 milyar dolar daha doğrudur.
- **Mobilya.** MOSFED'in miktarı ile fiyatı çarpılınca 4,58 milyar dolar çıkar. Hesap: 1,2 milyon ton × 3,82 dolar. Bu sonuç 4,6 milyar dolara eşittir. 5,17 milyar dolar ise daha geniş bir ürün kapsamını gösterir. Örneğin yatak, aydınlatma ya da parçalar dahil olabilir. Çekirdek mobilya için 4,6 milyar dolar kullanılmalıdır.

### Gaps
- MAİB'in GTİP listesi ve TİM'in birlik kapsamı yazılı olarak okunmadı. MOSFED'in 5,17 milyar dolarlık kapsamı da yazılı değildir. Denenen yol: web araması ve haber metinleri.

## Aile şirketi verileri ve daha iyi Türkiye kaynağı

### Takeaway
Rapordaki aile şirketi oranları kaynakta vardır. İki yerde ifade düzeltilmelidir: "aile meclisi" yerine "aile konseyi" ve "66 şirket" yerine "66 katılımcı". Büyüklüğe ve sektöre göre aile şirketi payını veren resmî kaynak yoktur.

### Cited Findings
- PwC 2016 Türkiye örneklemi 82 aile şirketidir. Şirketler 500 şirketlik bir listeden istatistiki yöntemle seçildi. Katılımcıların %40'ının cirosu 100 milyon doları aşar. Katılımcıların %52'si aile üyesi, %48'i üst yöneticidir. Kaynak: [PwC 2016 Türkiye sonuçları](https://taider.org.tr/images/belgeler/pwc_kuresel_aile_sirketleri_arastirmasi__turkiye_sonuclari_2016.pdf), PDF sayfa 6 ve 7.
- PwC 2016 Şekil 2 Türkiye dağılımını verir. Bütün üst yöneticiler için plan oranı %9'dur. Çoğu için %16, birkaçı için %21'dir. Planı olmayan şirket %54'tür. Küresel sıra %17, %18, %21 ve %43'tür. Kaynak: aynı PDF, sayfa 15.
- PwC 2016'ya göre Türk aile şirketlerinin %90'ında en az bir çatışma çözüm yöntemi vardır. Şirketlerin %35'i yönetimi sonraki kuşağa devretmeyi planlar. Yarısından fazlası mülkiyeti devretmeyi planlar. %10'u satmayı ya da halka arzı planlar. Kaynak: aynı PDF, sayfa 12.
- PwC 2016: Türk aile şirketlerinin %86'sı ihracat yapar. Uluslararası satış cironun %36'sıdır. Kaynak: aynı PDF, sayfa 12 ve 19.
- TKYD Aile Şirketleri Öncelikleri Anketi 8 Ekim 2017 Pazar günü açıklandı. Şirketlerin %48'i nesil devri planlama eksikliğini tehdit sayar. %46'sı profesyonelleşememeyi tehdit sayar. Şirket anayasası olan aile oranı %23'tür. Kaynak: [TKYD basın bülteni](https://www.tkyd.org/wp-content/uploads/2022/12/TKYD_Aile_Sirketleri_Anketi_Basin-Bulteni.pdf), sayfa 1 ve 2.
- TKYD ve TAİDER 2021 anketi Haziran ile Ağustos 2021 arasında çevrim içi yapıldı. 134 gelecek nesil üyesi katıldı. Yaşları 18 ile 42 arasındadır. %83'ü şirkette aktif görevdedir. Katılımcıların %34,1'i şirketin gelecek yönetimi için plan olduğunu söyledi. Kaynak: [TKYD ve TAİDER raporu](https://www.tkyd.org/wp-content/uploads/2024/01/TKYD-TAIDER-Gelecek-Neslin-Ise-Bakisi-Arastirma-Raporu.pdf), sayfa 9, 13 ve 26.
- Yönetimi üçüncü kuşakta olan şirketlerden gelen katılımcılar (n=21) en düşük memnuniyeti verdi. En düşük maddeler liderin sonrası planı (-1,00) ve yazılı devir planıdır (-0,94). Kaynak: aynı rapor, sayfa 32.
- KPMG 2018 Avrupa Aile Şirketleri Barometresi 26 ülkede 1.576 yöneticiyle yapıldı. 41 katılımcı Türkiye'dendir. Kaynak: [TGRT Haber, 7 Kasım 2018 Çarşamba](https://www.tgrthaber.com/ekonomi/turk-aile-sirketleri-2018de-cirolarini-artirdi-261771).
- PwC 2025 küresel anketi 1.325 kişiyle yapıldı. Önceki turların örneklemi 2023'te 2.043, 2021'de 2.801, 2016'da 2.802'dir. Kaynak: [PwC Hollanda raporu 2025](https://fbned.nl/f/files/download/documenten/2026/family-business-survey-2025-netherlands-pwc.pdf), sayfa 6.
- PwC 2025'e göre çift haneli büyüyen aile şirketi oranı %43'ten %25'e indi. Şirketlerin %13'ü yapay zekâyı operasyonun önemli bir kısmında kullanır. %71'i gelecek liderlik için dışarıdan profesyonel almanın değerini görür. Kaynak: [Bloomberg HT, 27 Kasım 2025 Perşembe](https://www.bloomberght.com/pwc-aile-sirketleri-artan-kuresel-baskilarla-karsi-karsiya-3762476).

### Inferences
- Aile şirketi payı için en iyi Türkiye kaynağı hâlâ PwC 2016'daki %95 ve %75 ifadesidir. Bu ifade yöntemsizdir. Aralık tahmini (28.500 ile 36.100 aile şirketi) kaba kalır.
- TKYD 2017 ve TAİDER örneklemleri üye şirketlerdir. Üye şirketler ortalamadan büyük ve kurumsaldır. Genel nüfusta yazılı kural ve plan oranları büyük olasılıkla daha düşüktür.

### Gaps
- PwC 2025 ve 2023 küresel ve Türkiye sayfaları açılamadı. Dört PwC ülke sitesi HTTP 403 hatası verdi. Bunlar küresel, İrlanda, Avustralya ve Türkiye siteleridir. archive.org otomatik erişimi engelledi. Hollanda raporunda bu oran yoktur. En iyi ikame kaynak Bloomberg HT haberidir.
- PwC Hollanda raporunda küresel %22 değeri "resmî halefiyet planı oluşturma ya da güncelleme" maddesine de yakın görünür. Grafik metni karışıktır. Bu yüzden "%22 tam geliştirilmiş plan" ifadesi ikincil kaynağa dayanır.
- Büyüklüğe ve sektöre göre aile şirketi payını veren resmî ya da akademik Türkiye kaynağı bulunamadı. Çözüm yolları: TÜİK Mikro Veri Araştırma Merkezi, ticaret sicilinde ortak soyadı taraması ya da kendi tarama anketimiz.
- KOBİ yönetmeliğinin mikro (10 milyon TL) ve küçük (100 milyon TL) eşikleri Resmî Gazete'de ayrıca okunmadı. Karar 10182 yalnız orta eşiği değiştirdi. Diğer eşikler [KOSGEB 2026, sayfa 1](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/Kurumsal/2026/Tu%CC%88rkiye'deki_KOBI%CC%87'lere_I%CC%87lis%CC%A7kin_Baz%C4%B1_I%CC%87statistiki_Go%CC%88stergeler.pdf) kaynağındadır.

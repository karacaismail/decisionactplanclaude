# Belge haritası

Bu dosya Karar Atlası için yazılan bütün belgelerin haritasıdır. Bir belgeyi aramadan önce buraya bakın. Harita 16 Kasım 2026 Pazartesi günü kuruldu. Aynı gün derin raporlarla, sonra doğrulanmış raporlarla güncellendi. Harita 20 Kasım 2026 Cuma günü OECD incelemesiyle de güncellendi.

## Bu harita nasıl çalışır?

Belgeler sekiz çekmeceye ayrıldı. Her belge yalnız bir çekmecede durur. Her konunun tek bir güncel kaynağı vardır.

Her belgenin bir durumu vardır:

| Durum | Anlamı |
|---|---|
| Tek kaynak | Bu konunun güncel ve tek kaynağı budur. Önce buna bakın. |
| Güncel | Belge geçerlidir. Ama tek kaynağın yanında okunur. |
| Tarihsel | Belge bir karar anını kaydeder. Sonradan başka belgeler onu geçti. |
| Yönlendirme | Belgenin içeriği başka bir belgeye taşındı. Belge yalnız yolu gösterir. |

Yeni bir belge yazılınca üç kural uygulanır:

1. Belge bir çekmeceye konur.
2. Belge bu haritaya eklenir.
3. Eski bir belgenin yerini alıyorsa eski belgeye "Güncellik notu" yazılır.

Bütün belgelerin bir kopyası Documents klasöründe de durur. Kopyaların adı "act_" ile başlar ve "-claude.md" ile biter. Klasör şudur: `/Users/w6x/Documents/Developer/DEV/thedecissionbook`.

Codex de projeyi paralel olarak araştırıyor. Codex'in kendi belge haritası şu dosyadadır: `/Users/w6x/Documents/Codex/2026-11-13/files-mentioned-by-the-user-codex/outputs/00-karar-atlasi-belge-haritasi.md`. Codex belgelerinden alınanlar 7. çekmecedeki listede durur.

## Okuma sırası

Kafanız karıştıysa belgeleri bu sırayla okuyun:

1. [Süreç haritası](surec-haritasi.md). Ürünün adımlarını ve kurallarını anlatır.
2. [Doğrulanmış ICP ve persona analizi](<../reports/Doğrulanmış ICP ve persona analizi.md>). Ürünü kime satacağımızı doğrulanmış sayılarla anlatır.
3. [Bütünleşik geliştirme raporu](butunlesik-gelistirme-raporu.md). Ürünün nasıl yapılacağını anlatır.
4. [Geliştirme karar notları](gelistirme-karar-notlari.md). Koda işlenecek notlarınızı toplar.
5. [Karar Atlası bilinmeyen bilinmeyenler güncel](<../reports/Karar Atlası bilinmeyen bilinmeyenler güncel.md>). Gözden kaçırabileceklerimizi anlatır.

## Çekmece 1. Strateji öncesi aksiyon planı

Bu iş tamamlandı. Uygulamada çalışıyor.

| Belge | Ne anlatır? | Durum |
|---|---|---|
| [Süreç haritası](surec-haritasi.md) | Üç ana küme, adımlar, kontroller ve kurallar | Tek kaynak |
| [Alan sözleşmesi](alan-sozlesmesi.md) | Her adımdaki alanların anlamı | Güncel |
| [Terim sözlüğü](terim-sozlugu.md) | Ekranda görünen terimler. Eski ve yeni adlar | Tek kaynak |
| [OKR araştırma raporu](okr-arastirma-raporu.md) | İsteğe bağlı hedef takibi önerisi ve açık kararlar | Öneri, henüz uygulanmadı |
| [Girişimci Aksiyon Planı v5 Final, Claude](act_plan_v5_final-claude.md) | Planın son metin sürümü | Tarihsel |
| [Girişimci Aksiyon Planı v5, Codex](act_plan_v5_final-codex.md) | Codex'in plan sürümü | Tarihsel |
| [Gerçek deneme föyü](gercek-deneme-foyu.md) | Üç gerçek denemenin nasıl yapılacağı | Güncel |
| [Strateje devir planı](strateje-devir-uygulama-plani.md) | Hazırlığın çıktısı olan teslim raporu. Eski adı devir raporudur. | Tarihsel |
| [Strateji öncesi boşluk ve eylem planı](stratejik-planlama-oncesi-bosluk-ve-eylem-plani.md) | Hazırlıktaki boşluklar | Tarihsel |
| [Ön yüz uygulama planı](uygulama-plani-on-yuz.md) | Stratejiye geçişin ilk planı | Tarihsel |
| [Araştırma analizi ve ekleme raporu](arastirma-analizi-ve-strateji-oncesi-ekleme-raporu.md) | Beş araştırma metninden eklenenler | Güncel |
| [Karar kitabı fırsatları](karar-kitabi-firsatlari-plani.md) | Karar Kitabı'ndan alınan yardımlar | Güncel |
| [Codex önerileri uygulama notu](codex-onerileri-uygulama-notu.md) | Codex'ten alınan kurallar | Güncel |
| [Codex uygulamasıyla karşılaştırma](codex-uygulamasi-karsilastirma-raporu.md) | İki uygulamanın farkı | Güncel |

## Çekmece 2. Sonraki ana aşamalar ve yöntem

| Belge | Ne anlatır? | Durum |
|---|---|---|
| [Sonraki ana aşamalar planı](sonraki-ana-asamalar-plani.md) | Neden üç ana küme var? 18 çerçeveden sayım | Güncel |
| [Strateji tanımı, boşluk ve bilinmeyen analizi](strateji-tanimi-bosluk-ve-bilinmeyen-analizi.md) | Strateji nedir, hazırlıkta ne eksik? | Güncel |
| [Güvenilir strateji yöntemleri](<../reports/Güvenilir strateji yöntemleri.md>) | Yöneticilerin güvendiği yöntemler ve ürünün yöntemi | Tek kaynak |
| [OKR yazılımlarından farkı](<../reports/OKR yazılımlarından farkı.md>) | OKR, KPI ve ürünün farkı | Tek kaynak |

## Çekmece 3. Arayüz tasarımı

| Belge | Ne anlatır? | Durum |
|---|---|---|
| [Tasarım sistemi](tasarim-sistemi.md) | Renk, yazı ve bileşen kuralları | Tek kaynak |
| [Kurumsal bileşenler](kurumsal-bilesenler.md) | Ekranlarda kullanılan bileşenler | Güncel |
| [Kalite kapıları](kalite-kapilari.md) | Arayüzün geçmesi gereken denetimler | Güncel |
| [Uzlaşmış ön yüz planı](act_components_uzlasma.md) | Claude ile Codex'in ortak bileşen planı | Tarihsel |
| [Ön yüz bileşen planı, Claude](act_components_claude.md) | İlk bileşen planı | Tarihsel |
| [Kurumsal arayüz tasarımı, Codex](act_components_codex.md) | Codex'in bileşen planı | Tarihsel |
| [Tasarım eleştirisi, 1. tur](tasarim-elestirisi-1-tur.md) | Bağımsız arayüz eleştirisi | Tarihsel |
| [Tasarım eleştirisi, 2. tur](tasarim-elestirisi-2-tur.md) | İkinci eleştiri | Tarihsel |

## Çekmece 4. Teknik mimari

| Belge | Ne anlatır? | Durum |
|---|---|---|
| [Bütünleşik geliştirme raporu](butunlesik-gelistirme-raporu.md) | Frappe 16, modüller, eşitleme, mobil, yayın, DevOps. Yetki bölümleri 16 Kasım 2026 Pazartesi günü Frappe 16 koduna göre düzeltildi. | Tek kaynak |
| [İnternetsiz çalışma araştırması](cevrimdisi-calisma-arastirmasi.md) | İnternet kesilince uygulama nasıl çalışır? | Güncel |
| [Mobil ve SaaS dağıtımı eleştirisi](elestiri-mobil-saas-dagitim.md) | Mobil hedeflerin gerekçeleri | Güncel. Bütünleşik rapora işlendi. |
| [Doğrulanmış hizmet ve yetki modeli](<../reports/Doğrulanmış hizmet ve yetki modeli.md>) | Hizmet modeli, iş ortakları, rollerin sıklığı ve Frappe 16 koduna göre yetki tasarımı Kaynaklar asıl metinlerinden doğrulandı. | Tek kaynak |
| [Derin hizmet ve yetki modeli](<../reports/Derin hizmet ve yetki modeli.md>) | Önceki derin rapor | Tarihsel |
| [Yazılım, hizmet ve rol modeli](<../reports/Yazılım hizmet ve rol modeli.md>) | Önceki hizmet ve rol raporu | Tarihsel |
| [Arka yüz planı](arka-yuz-plani.md) | Bütünleşik rapora taşındı. | Yönlendirme |
| [Modül mimarisi](moduller/mimari.md) | Proje ve destek modüllerinin çekirdeğe bağlanışı. Veri yeri, taslaklar, dosya biçimi ve kapılar. | Tek kaynak |
| [Destek konsey planı](moduller/destek-konsey-plani.md) | Destek ve teşvik bölümünün bütün sektörlere uygun sonraki geliştirme planı. Üç model uzlaştı. | Plan |

## Çekmece 5. Pazar, müşteri ve iş modeli

| Belge | Ne anlatır? | Durum |
|---|---|---|
| [Doğrulanmış ICP ve persona analizi](<../reports/Doğrulanmış ICP ve persona analizi.md>) | Türkiye verisiyle ICP, sektör alt grupları, pazar büyüklüğü, tetikleyiciler ve personalar Kaynaklar asıl metinlerinden doğrulandı. | Tek kaynak |
| [Derin ICP ve persona analizi](<../reports/Derin ICP ve persona analizi.md>) | Önceki derin rapor | Tarihsel |
| [Doğrulanmış AI ve marka konumlandırma](<../reports/Doğrulanmış AI ve marka konumlandırma.md>) | Ürün ve marka konumu, ad çakışması, AI tasarımı ve maliyeti Kaynaklar asıl metinlerinden doğrulandı. | Tek kaynak |
| [Derin AI ve marka konumlandırma](<../reports/Derin AI ve marka konumlandırma.md>) | Önceki derin rapor | Tarihsel |
| [Hedef kitle, ICP ve personalar](<../reports/Hedef kitle ICP ve personalar.md>) | Önceki ICP raporu | Tarihsel |
| [Hedef kitle, ICP ve AI konumlandırma](<../reports/Hedef kitle ICP ve AI konumlandırma.md>) | İlk kitle ve AI raporu | Tarihsel |
| [Doğrulanmış planlama ihtiyacı sınıflaması](<../reports/Doğrulanmış planlama ihtiyacı sınıflaması.md>) | Uzmanlar şirketleri nasıl sınıflıyor? Türkiye kanıtı ve ön değerlendirme soruları Kaynaklar asıl metinlerinden doğrulandı. | Tek kaynak |
| [Derin planlama ihtiyacı sınıflaması](<../reports/Derin planlama ihtiyacı sınıflaması.md>) | Önceki derin rapor | Tarihsel |
| [Stratejik planlama ihtiyacı sınıflaması](<../reports/Stratejik planlama ihtiyacı sınıflaması.md>) | Önceki sınıflama raporu | Tarihsel |
| [Doğrulanmış strateji ekibi ve vaka analizi](<../reports/Doğrulanmış strateji ekibi ve vaka analizi.md>) | Ekip, çalıştay dizisi, kabul ölçütleri, beş vaka ve çırak protokolü Kaynaklar asıl metinlerinden doğrulandı. | Tek kaynak |
| [Derin strateji ekibi ve vaka analizi](<../reports/Derin strateji ekibi ve vaka analizi.md>) | Önceki derin rapor | Tarihsel |
| [Strateji ekibi ve kabul ölçütleri](<../reports/Strateji ekibi ve kabul ölçütleri.md>) | Önceki ekip raporu | Tarihsel |
| [Doğrulanmış gelir modeli analizi](<../reports/Doğrulanmış gelir modeli analizi.md>) | Doğrulanmış maliyetler, fiyat, senaryolar ve başa baş noktası Kaynaklar asıl metinlerinden doğrulandı. | Tek kaynak |
| [Derin gelir modeli analizi](<../reports/Derin gelir modeli analizi.md>) | Önceki derin rapor | Tarihsel |
| [Gelir modeli ve birim ekonomisi](<../reports/Gelir modeli ve birim ekonomisi.md>) | Önceki gelir raporu | Tarihsel |
| [Doğrulanmış rakip analizi](<../reports/Doğrulanmış rakip analizi.md>) | Claude, Codex ve Gemini taramalarıyla rakip haritası Kaynaklar asıl metinlerinden doğrulandı. | Tek kaynak |
| [Derin rakip analizi](<../reports/Derin rakip analizi.md>) | Önceki derin rapor | Tarihsel |
| [Global ve yerel rakipler](<../reports/Global ve yerel rakipler.md>) | Önceki rakip raporu | Tarihsel |
| [Karar Atlası bilinmeyen bilinmeyenler güncel](<../reports/Karar Atlası bilinmeyen bilinmeyenler güncel.md>) | Derin raporlardan sonra gözden kaçabilecekler ve saha izleme düzeni | Tek kaynak |
| [Karar Atlası bilinmeyen bilinmeyenler](<../reports/Karar Atlası bilinmeyen bilinmeyenler.md>) | Önceki bilinmeyenler raporu | Tarihsel |

## Çekmece 6. Kararlar ve notlar

| Belge | Ne anlatır? | Durum |
|---|---|---|
| [Geliştirme karar notları](gelistirme-karar-notlari.md) | Koda işlenecek notlarınız, açık sorular ve bekleyen işler | Tek kaynak |
| [Bütünleşik raporun 1. bölümü](butunlesik-gelistirme-raporu.md) | Verdiğiniz mimari kararların tablosu | Tek kaynak |

Açık sorular [geliştirme karar notlarının](gelistirme-karar-notlari.md) "Açık sorular" bölümünde durur. Örneğin stratejinin inceleme aralığı henüz seçilmedi.

## Çekmece 7. Ham araştırma notları

Bu notlar raporların dayandığı ham bilgidir. Notlar İngilizce yazıldı. Raporu okuduysanız notlara bakmanız gerekmez.

| Klasör | Hangi raporun notları? |
|---|---|
| [Hedef kitle ICP ve AI konumlandırma](<../research_notes/Hedef kitle ICP ve AI konumlandırma/>) | Pazar, rakipler, kitle, yöntem, AI ve mevzuat |
| [Gelir modeli ve birim ekonomisi](<../research_notes/Gelir modeli ve birim ekonomisi/>) | Gelir ve maliyet |
| [OKR yazılımlarından farkı](<../research_notes/OKR yazılımlarından farkı/>) | OKR farkı |
| [Yazılım hizmet ve rol modeli](<../research_notes/Yazılım hizmet ve rol modeli/>) | Hizmet ve roller |
| [Güvenilir strateji yöntemleri](<../research_notes/Güvenilir strateji yöntemleri/>) | Yöntemler |
| [Global ve yerel rakipler](<../research_notes/Global ve yerel rakipler/>) | Rakipler |
| [Stratejik planlama ihtiyacı sınıflaması](<../research_notes/Stratejik planlama ihtiyacı sınıflaması/>) | Danışmanlık firmaları ve akademisyenler |
| [Strateji ekibi ve kabul ölçütleri](<../research_notes/Strateji ekibi ve kabul ölçütleri/>) | Ekip ve kabul |
| [Derin ICP ve persona analizi](<../research_notes/Derin ICP ve persona analizi/>) | Şirket sayıları, ihracat, tetikleyiciler, satın alma, kanallar, ICP yöntemi |
| [Derin AI ve marka konumlandırma](<../research_notes/Derin AI ve marka konumlandırma/>) | Ürün ve marka konumu, AI tasarımı |
| [Derin gelir modeli analizi](<../research_notes/Derin gelir modeli analizi/>) | Maliyetler, gelir ve fiyat |
| [Derin hizmet ve yetki modeli](<../research_notes/Derin hizmet ve yetki modeli/>) | Frappe 16 yetki kodu, hizmet ve ortaklık |
| [Derin planlama ihtiyacı sınıflaması](<../research_notes/Derin planlama ihtiyacı sınıflaması/>) | Kaynak doğrulama ve Türkiye çalışmaları |
| [Derin strateji ekibi ve vaka analizi](<../research_notes/Derin strateji ekibi ve vaka analizi/>) | Kaynak doğrulama, çırak hukuku ve vaka senaryoları |
| [Derin rakip analizi](<../research_notes/Derin rakip analizi/>) | Claude, Codex ve Gemini rakip taramaları |
| [Codex belgelerinden alınanlar](<../research_notes/Codex belgelerinden alınanlar/>) | Codex belgelerindeki bulguların bizim belgelerle karşılaştırması |
| [Doğrulanmış ICP ve persona analizi](<../research_notes/Doğrulanmış ICP ve persona analizi/>) | Asıl kaynaklardan doğrulama turu |
| [Doğrulanmış AI ve marka konumlandırma](<../research_notes/Doğrulanmış AI ve marka konumlandırma/>) | Asıl kaynaklardan doğrulama turu |
| [Doğrulanmış gelir modeli analizi](<../research_notes/Doğrulanmış gelir modeli analizi/>) | Asıl kaynaklardan doğrulama turu |
| [Doğrulanmış hizmet ve yetki modeli](<../research_notes/Doğrulanmış hizmet ve yetki modeli/>) | Asıl kaynaklardan doğrulama turu |
| [Doğrulanmış planlama ihtiyacı sınıflaması](<../research_notes/Doğrulanmış planlama ihtiyacı sınıflaması/>) | Asıl kaynaklardan doğrulama turu |
| [Doğrulanmış strateji ekibi ve vaka analizi](<../research_notes/Doğrulanmış strateji ekibi ve vaka analizi/>) | Asıl kaynaklardan doğrulama turu |
| [Doğrulanmış rakip analizi](<../research_notes/Doğrulanmış rakip analizi/>) | Asıl kaynaklardan doğrulama turu |
| [OECD KİT rehberi incelemesi](<../research_notes/OECD KİT rehberi incelemesi/>) | OECD rehberinin 1814 cümle birimlik defterleri, ajan belgeleri ve kapsama testleri |

## Çekmece 8. Kavramlar ve analizler

Bu konular önce sohbette cevaplandı. 16 Kasım 2026 Pazartesi günü dosyaya yazıldı.

| Belge | Ne anlatır? | Durum |
|---|---|---|
| [GAP analizi](gap-analizi.md) | Konuşulmayanlar, bekleyen kararlar ve öncelik sırası | Tek kaynak |
| [Strateji kavramları](strateji-kavramlari.md) | OKR ve KPI, SMART, güncelleme sıklığı, bilinmeyen bilinmeyenler, kırmızı ekip | Tek kaynak |
| [OECD bulgu belgesi](oecd-kit-rehberi-bulgulari.md) | OECD'nin 2024 tarihli kamu iktisadi teşebbüsü yönetişim rehberinden ürüne alınacak bulgular. Belge 82 sayfanın kelime kelime incelemesine dayanır. | Tek kaynak |
| [OECD kaynak haritası](oecd-kaynak-haritasi.md) | OECD rehberinin andığı bütün belgeler, standartlar ve okuma önceliği | Tek kaynak |
| [Kaynak haritası yaklaşım analizi](kaynak-haritasi-yaklasim-analizi.md) | 170 kaynaklık strateji kaynak haritasının ürüne nasıl yarayacağı. Sekiz öneri, ertelenenler ve alınmayanlar | Öneri, onay bekliyor |

Big Four firmalarının hedef kitleleri için ayrı bir rapor yok. Bu firmaların sınıflama modelleri [Stratejik planlama ihtiyacı sınıflaması](<../reports/Derin planlama ihtiyacı sınıflaması.md>) raporundadır.

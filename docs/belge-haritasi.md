# Belge haritası

Bu dosya Karar Atlası için yazılan bütün belgelerin haritasıdır. Bir belgeyi aramadan önce buraya bakın. Harita 16 Kasım 2026 Pazartesi günü kuruldu.

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

## Okuma sırası

Kafanız karıştıysa belgeleri bu sırayla okuyun:

1. [Süreç haritası](surec-haritasi.md). Ürünün adımlarını ve kurallarını anlatır.
2. [Hedef kitle, ICP ve personalar](<../reports/Hedef kitle ICP ve personalar.md>). Ürünü kime satacağımızı anlatır.
3. [Bütünleşik geliştirme raporu](butunlesik-gelistirme-raporu.md). Ürünün nasıl yapılacağını anlatır.
4. [Geliştirme karar notları](gelistirme-karar-notlari.md). Koda işlenecek notlarınızı toplar.
5. [Karar Atlası bilinmeyen bilinmeyenler](<../reports/Karar Atlası bilinmeyen bilinmeyenler.md>). Gözden kaçırabileceklerimizi anlatır.

## Çekmece 1. Strateji öncesi aksiyon planı

Bu iş tamamlandı. Uygulamada çalışıyor.

| Belge | Ne anlatır? | Durum |
|---|---|---|
| [Süreç haritası](surec-haritasi.md) | Üç ana küme, adımlar, kapılar ve kurallar | Tek kaynak |
| [Alan sözleşmesi](alan-sozlesmesi.md) | Her adımdaki alanların anlamı | Güncel |
| [Girişimci Aksiyon Planı v5 Final, Claude](act_plan_v5_final-claude.md) | Planın son metin sürümü | Tarihsel |
| [Girişimci Aksiyon Planı v5, Codex](act_plan_v5_final-codex.md) | Codex'in plan sürümü | Tarihsel |
| [Gerçek deneme föyü](gercek-deneme-foyu.md) | Üç gerçek denemenin nasıl yapılacağı | Güncel |
| [Strateje devir planı](strateje-devir-uygulama-plani.md) | Hazırlığın çıktısı olan devir raporu | Tarihsel |
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
| [Bütünleşik geliştirme raporu](butunlesik-gelistirme-raporu.md) | Frappe 16, modüller, eşitleme, mobil, yayın, DevOps | Tek kaynak |
| [İnternetsiz çalışma araştırması](cevrimdisi-calisma-arastirmasi.md) | İnternet kesilince uygulama nasıl çalışır? | Güncel |
| [Mobil ve SaaS dağıtımı eleştirisi](elestiri-mobil-saas-dagitim.md) | Mobil hedeflerin gerekçeleri | Güncel. Bütünleşik rapora işlendi. |
| [Yazılım, hizmet ve rol modeli](<../reports/Yazılım hizmet ve rol modeli.md>) | Rollerin sıklığı ve yetki modeli | Tek kaynak |
| [Arka yüz planı](arka-yuz-plani.md) | Bütünleşik rapora taşındı. | Yönlendirme |

## Çekmece 5. Pazar, müşteri ve iş modeli

| Belge | Ne anlatır? | Durum |
|---|---|---|
| [Hedef kitle, ICP ve personalar](<../reports/Hedef kitle ICP ve personalar.md>) | İlk müşteri, puan tablosu ve sekiz persona | Tek kaynak |
| [Hedef kitle, ICP ve AI konumlandırma](<../reports/Hedef kitle ICP ve AI konumlandırma.md>) | İlk kitle önerisi ve AI'ın yapacakları | Güncel. Kitle kısmını personalar raporu geçti. |
| [Stratejik planlama ihtiyacı sınıflaması](<../reports/Stratejik planlama ihtiyacı sınıflaması.md>) | Uzmanlar şirketleri nasıl sınıflıyor? | Tek kaynak |
| [Strateji ekibi ve kabul ölçütleri](<../reports/Strateji ekibi ve kabul ölçütleri.md>) | Ekip, çalıştay, kabul ölçütleri, ayakkabı şirketi örneği | Tek kaynak |
| [Gelir modeli ve birim ekonomisi](<../reports/Gelir modeli ve birim ekonomisi.md>) | Para kazandırır mı? Fiyat ve maliyet | Tek kaynak |
| [Global ve yerel rakipler](<../reports/Global ve yerel rakipler.md>) | Rakiplerin haritası | Tek kaynak |
| [Karar Atlası bilinmeyen bilinmeyenler](<../reports/Karar Atlası bilinmeyen bilinmeyenler.md>) | Gözden kaçabilecekler ve saha izleme düzeni | Tek kaynak |

## Çekmece 6. Kararlar ve notlar

| Belge | Ne anlatır? | Durum |
|---|---|---|
| [Geliştirme karar notları](gelistirme-karar-notlari.md) | Koda işlenecek notlarınız ve bekleyen işler | Tek kaynak |
| [Bütünleşik raporun 1. bölümü](butunlesik-gelistirme-raporu.md) | Verdiğiniz mimari kararların tablosu | Tek kaynak |

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

## Çekmece 8. Kavramlar ve analizler

Bu konular önce sohbette cevaplandı. 16 Kasım 2026 Pazartesi günü dosyaya yazıldı.

| Belge | Ne anlatır? | Durum |
|---|---|---|
| [GAP analizi](gap-analizi.md) | Konuşulmayanlar, bekleyen kararlar ve öncelik sırası | Tek kaynak |
| [Strateji kavramları](strateji-kavramlari.md) | OKR ve KPI, SMART, güncelleme sıklığı, bilinmeyen bilinmeyenler, kırmızı ekip | Tek kaynak |

Big Four firmalarının hedef kitleleri için ayrı bir rapor yok. Bu firmaların sınıflama modelleri [Stratejik planlama ihtiyacı sınıflaması](<../reports/Stratejik planlama ihtiyacı sınıflaması.md>) raporundadır.

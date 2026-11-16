# Revenue model inputs of Karar Atlası: second-round verification from primary sources (as of 16 November 2026, Monday)

Scope: every flagged cost, price, benchmark and ROI input in `reports/Derin gelir modeli analizi.md` and its two research notes (`maliyetler.md`, `gelir_ve_fiyat.md`). Method: official PDFs and HTML were downloaded into an isolated scratch directory and parsed with `pypdf` in a separate venv; image-only PDFs (Resmî Gazete tariff annexes) were read page by page as images; archive.org snapshots were used where a live page was blocked; raw survey data were re-analysed from the publisher's GitHub repository.

**Exchange rate used everywhere:** TCMB indicative rates, bulletin 2026/215 dated 16.11.2026: USD döviz satış **50.3942 TL**, EUR döviz satış **55.4979 TL** (USD döviz alış 50.3036) — [TCMB today.xml](https://www.tcmb.gov.tr/kurlar/today.xml). This matches the 50.3942 used in the report.

Status codes in the table: **DOĞRULANDI** (primary source read, value holds), **DÜZELTİLDİ** (primary source read, value changed), **İKAME** (primary blocked after listed routes; best verified substitute given), **YENİ** (new fact).

---

## 0. Verification table for every flagged input

### Takeaway
Of 51 rows checked, 38 were confirmed at primary source (or an exact official reproduction), 6 were corrected, 5 rest on a verified substitute after the listed routes failed, 1 is a new unresolved price conflict (row 19) and 1 was not re-opened (row 35). The corrections that move the model are: iyzico's own list fee is 4.29% + 0.25 TL (not 2.49%), the accountant minimum is about 4,900–12,100 TL a month (not 3,606–15,971), mobile developer cost is 3,738 (mid) or 7,063 (senior) USD (not 3,421 all-level), and Hetzner dedicated "from" prices are a limited-offering tier. Each of these moves base-case break-even by fewer than about 3 customers; the team cost base (USD 10,000 in year 1, USD 25,000 in year 3) stays inside the newly verified ranges.

### Cited Findings

| No | Claim in report | Old status | New status | Exact source and location | Corrected or confirmed value | Impact on model |
|---|---|---|---|---|---|---|
| 1 | 2026 gross minimum wage 33,030 TL, net 28,075.50 TL | Secondary | DOĞRULANDI | Asgari Ücret Tespit Komisyonu Kararı No 2025/1, 23.12.2025, RG 26.12.2025 no. 33119, item 2: daily 1,101 TL for 1.1.2026–31.12.2026 — [RG PDF 20251226-6](https://www.resmigazete.gov.tr/eskiler/2025/12/20251226-6.pdf) | 1,101 × 30 = 33,030 gross; 33,030 − 14% − 1% = 28,075.50 net (CALC) | None |
| 2 | MYÖ employer share 12%, Treasury support 2 points (non-manufacturing) | Secondary | DOĞRULANDI | Law 7566, RG 19.12.2025 no. 33112, Art. 23 (5510 Art. 81(a) "%11'i"→"%12'si", 81(ı) "dört"→"iki"), Art. 27 (geçici 108 "dört"→"iki"), Art. 38(ç): in force "2026 yılı Ocak ayı başında" — [RG 20251219-1](https://www.resmigazete.gov.tr/eskiler/2025/12/20251219-1.htm) | 12% employer MYÖ; 2-point support | None |
| 3 | Manufacturing keeps 5-point support | Secondary | DOĞRULANDI | SGK Genelgesi 2026/1, 06.01.2026, no. E-41481264-010.06-133427659: NACE section C keeps 5 points for 2025/Şubat–2026/Aralık; President may extend to 31.12.2027 — [reproduction of circular](https://www.alomaliye.com/2026/01/07/sgk-genelgesi-2026-1/) | 5 points for manufacturing only | None (Karar is not manufacturing) |
| 4 | Employer factor 1.2375 / 1.2175 / 1.1875 | Secondary | DOĞRULANDI (recomputed) | Employer rates: MYÖ 12 + GSS 7.5 + kısa vadeli 2.25 = 21.75%; işsizlik 2% — [KPMG Vergi SGK table](https://kpmgvergi.com/pratik-bilgiler/4/2); circular example uses 38.75% total (15 employee + 23.75 employer) | 1 + 0.2375 = 1.2375; −2 pts = 1.2175; −5 pts = 1.1875. Minimum wage cost 40,874.62 / 40,214.03 / 39,223.12 TL (CALC) | None. Factor applies only up to the ceiling. |
| 5 | SGK ceiling 297,270 TL | Secondary | DOĞRULANDI | Law 7566 Art. 24: 5510 Art. 82 "7,5"→"9", in force 1.1.2026 (Art. 38(b)) — [RG 20251219-1](https://www.resmigazete.gov.tr/eskiler/2025/12/20251219-1.htm) | 9 × 33,030 = 297,270 TL (CALC) | None |
| 6 | Minimum wage support 1,270 TL (unverified teaser) | Unverified | DÜZELTİLDİ / YENİ | Law 7573 Art. 8, RG 29.01.2026 no. 33152, new 5510 geçici 112: 42.33 TL per insured day for Jan–Dec 2026; (a) existing workplaces: capped at 2025 days of insured with PEK ≤ 1,300 TL/day; **(b) workplaces first registered in 2026: all insured days** — [RG 20260129-1](https://www.resmigazete.gov.tr/eskiler/2026/01/20260129-1.htm); commission recommendation 1,270 TL in decision 2025/1 item 3 | 42.33 × 30 = 1,269.90 TL ≈ USD 25.2 per employee per month, 2026 only | Small: −0.4% of a senior's cost; only if the company registers in 2026 |
| 7 | 2026 income tax brackets for wages | Secondary | DOĞRULANDI (reproduction) | GVK Genel Tebliği 332, RG 31.12.2025 no. 33124 (5. mükerrer). Wages: 15% to 190,000; 20% to 400,000; 27% to 1,500,000; 35% to 5,300,000; 40% above — [KPMG Vergi bulletin](https://kpmgvergi.com/yayinlar/mali-bultenler/vergi/2026-yili-gelir-vergisi-dilimleri-ile-dikkate-alinacak-bazi-had-ve-tutarlar-belirlendi/3351). Routes tried for RG text: RG 31.12.2025 index, files -1…-11 (htm) and -12…-30 (pdf): tariff not found as text (image or mükerrer PDF) | Same as report | None |
| 8 | Survey 1: yazilimcimaaslari.org, 1,223 answers | Survey page | DOĞRULANDI | February 2026, 1,223 anonymous, "Aylık Net Maaş", TL-only medians: junior 60,000 (n=267), mid 80,000 (n=435), senior 137,500 (n=452), guru 175,000 (n=69); backend 112,500 (194), mobile 95,000 (81), DevOps 137,500 (23), ERP developer 60,000 (13) — [yazilimcimaaslari.org](https://yazilimcimaaslari.org/) | Same; NEW: foreign-company median 175,000 vs Turkish-company 95,000 | See row 10 |
| 9 | Survey 2: getSalary, 4,589 answers | Blog | DOĞRULANDI (raw data) | getSalary uses the Önceki Yazılımcı 2026 dataset: 5,002 rows, of which **4,589 paid in TL** (227 USD, 169 EUR, 17 GBP); field "Aylık [NET] geliriniz" in 5,000 or 10,000 TL brackets — [GitHub raw JSON](https://github.com/oncekiyazilimci/2026-yazilim-sektoru-maaslari); [getSalary](https://getsalary.dev/blog/yazilim-maas-rehberi-2026). My recomputed medians (bracket midpoints): junior 65,500 / mid 102,500 / senior 172,500; backend senior 167,500 — identical to getSalary | Same | Confirms method |
| 10 | Mobile developer 3,421 USD (all-level) | Survey + assumption | DÜZELTİLDİ | Same raw data, mobile (Android + iOS + full-stack mobile), TL-paid: junior 65,500 (n=44), mid 102,500 (n=144), senior 177,500 (n=212); in firms ≤50 staff: mid 77,500 (n=43), senior 135,000 (n=34) | Employer cost: mid 3,738 USD, senior 7,063 USD; small-firm mid 2,732, senior 5,179 (CALC) | Year-3 team +317 USD if a mid mobile developer is used |
| 11 | DevOps 4,846 / 5,289 / 7,253 USD | Survey | DOĞRULANDI | Raw data DevOps + SRE: mid 127,500 (n=41), senior 185,000 (n=50) net | Mid 4,846; senior 7,331 USD | None (0.25–0.5 FTE) |
| 12 | Product designer 67,980 TL net | Aggregator snippet on net/gross | DOĞRULANDI | kariyer.net page text: "Gösterilen maaş verileri, aylık net maaşlardır"; data = applicants' salary expectations in the last 3 months, updated monthly; Ürün Tasarımcısı average 68,000 TL (min 54,400, max 180,000) — [kariyer.net](https://www.kariyer.net/pozisyonlar/urun+tasarimcisi/maas) (fetched with curl, HTTP 200) | 68,000 net → 2,357 USD employer cost | None. Note: expectations, not paid salaries |
| 13 | Support specialist 44,176 TL | Same | DOĞRULANDI | kariyer.net Müşteri Destek Uzmanı: 44,200 TL net (35,300–90,000) — [kariyer.net](https://www.kariyer.net/pozisyonlar/musteri+destek+uzmani/maas) | 1,419 USD → 10.14 USD/hour at 140 h | Matches report's optimistic support rate (10.13) |
| 14 | B2B sales rep 53,967 TL | Same | DOĞRULANDI | kariyer.net Kurumsal Satış Müşteri Temsilcisi: 54,000 TL net (43,200–150,000) — [kariyer.net](https://www.kariyer.net/pozisyonlar/kurumsal+satis+musteri+temsilcisi/maas) | 1,805 USD | None |
| 15 | Year-1 team USD 10,000 (8,300–11,850) | Estimate | DOĞRULANDI (range re-derived) | Raw-data role medians, formula in Q1 | Founder unpaid + senior backend + mid frontend + 0.25 DevOps: **9,122** (firms ≤50 staff) to **11,874** (all firms) USD | Base 10,000 holds |
| 16 | Year-3 team USD 25,000 | Estimate | DOĞRULANDI (range re-derived) | Same | 7.5 FTE: **24,303** (small-firm medians) to **29,836** (all-firm medians) USD | Base 25,000 sits at the low end; use 27,000 as a prudent base (INFERENCE) |
| 17 | Hetzner CCX cloud prices (HEL) | Published | DOĞRULANDI | Product page, "Price incl. IPv4", "excl. VAT": HEL1 CCX13 €36.99, CCX23 €73.49, CCX33 €117.99, CCX43 €234.99; NBG1 €43.49 / €86.49 / €138.99 / €276.49 — [Hetzner General Purpose](https://www.hetzner.com/cloud/general-purpose/) | Same | See row 19 |
| 18 | Hetzner official price-adjustment table "not verified (404)" | Not verified | DOĞRULANDI (archive) | archive.org snapshot 22.10.2026 of docs page "Hetzner Price Adjustment 15 June 2026", ID GE-D9256, last change 2026-07-08: new orders and rescales from 15.06.2026 08:00 CEST; orders placed before but delivered after keep old prices. Germany/Finland CCX13 €15.99→€42.99, CCX23 €31.49→€85.99, CCX33 €62.49→€138.49, CCX43 €124.99→€275.99 (excl. IPv4) — [archived docs page](http://web.archive.org/web/20261022142746/https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/) | Increase ≈ +169% to +121% for CCX (CALC) | Confirms the stack is priced after the June increase |
| 19 | HEL cheaper than the June table | — | YENİ / conflict | Product page HEL €36.99 vs June table Germany/Finland €42.99 + €0.50 IPv4 | HEL is about 15% below the June table | If HEL pricing is withdrawn, base stack ≈ +17% (USD 527 → about 615) (CALC) |
| 20 | Backups = 20% of server price | Assumption | DOĞRULANDI | Hetzner billing FAQ: backups are a monthly flat 20% of the server price; "starting at €1.098" = 20% × €5.49 — [Hetzner billing FAQ](https://docs.hetzner.com/cloud/billing/faq/); 7 backup slots — [Hetzner backups](https://docs.hetzner.com/cloud/servers/backups-snapshots/overview/) | 20% | Assumption becomes fact |
| 21 | Dedicated alternative 2× AX42 + AX102 ≈ €317 | Published | DÜZELTİLDİ | Same archived table: regular AX42-1 €97.30 (setup €49), AX102-1 €257.30 (setup €129); "limited offerings" AX42-1-LTD €77.30, AX102-1-LTD €157.30 (setup €39), excl. IPv4 | Regular: €451.90/month + €227 setup; limited tier €311.90 while supply lasts (CALC). Report's "from €79/€159" = LTD price + €1.70 IPv4 (INFERENCE) | Only the dedicated option; base uses cloud |
| 22 | Frappe Cloud: $5–50 shared, private bench from $25/site, servers from $40 | Published | DOĞRULANDI | [Frappe shared hosting](https://frappe.io/cloud/shared-hosting): $5/0.5 CPU-h/0.2 GB DB/2.5 GB; $10; $25; $38; $50; "Starting price per site" private $25; [Frappe pricing](https://frappe.io/cloud/pricing): server plans from $40/mo (₹3,600) | Same. No Turkey region named ("5 continents and 10 countries", mostly AWS, OCI KSA) | None |
| 23 | Turkish VDS $30–75 (aggregator) | Aggregator | İKAME (official page) | OwnHost official page, Tier III Kuzey Veri Merkezi (İstanbul): V-Cloud ENTERPRISE 4 core / 8 GB / 120 GB NVMe **$29.99/month** (1,479.58 TL at its 49.34 rate); PRO 4 core/6 GB $15.99 — [OwnHost](https://www.ownhost.net/en/cloud-server). Turhost and Natro official URLs returned 404 | Low end $30 confirmed by an official page; $55–75 for 16 GB remains aggregator-based | None |
| 24 | iyzico 2.49% + 0.25 TL (Ticimax) | Third party | DÜZELTİLDİ | iyzico official FAQ: "her bir başarılı işlem için %4,29 ve 0,25 TL işlem ücreti uygulanmaktadır. (BSMV dahil)"; corporate sellers can get a custom offer; individuals from 4.49% + 0.25 TL — [iyzico fiyatlandırma](https://www.iyzico.com/fiyatlandirma) | **4.29% + 0.25 TL** list | Pessimistic card fee: 3.56% → 4.29% + 0.25 TL |
| 25 | PayTR from 2.19% | Aggregator | DOĞRULANDI | PayTR page (published 16.07.2026, modified 19.08.2026): "resmi başvuru sayfasında belirttiği üzere %2,19'dan başlayan"; no setup, annual or monthly fee; final rate depends on volume, sector and settlement term — [PayTR](https://www.paytr.com/sanal-pos-komisyon-oranlari) | 2.19% "from" | None |
| 26 | Param 2.29% vs 4.15% conflict | Conflict | DOĞRULANDI | param.com.tr: "%2,29 komisyon oranıyla tahsilatlarınız ertesi gün Param Business Kartınızda" — [Param Sanal POS](https://param.com.tr/sanal-pos). The 4.15% figure came from a cert subdomain and is superseded | 2.29% next-day | None |
| 27 | TCMB ceiling 3.56% | Aggregator | DOĞRULANDI | TCMB "Üye İşyerlerine Uygulanacak Azami Komisyon Oranları" (PDF created 21.10.2026): 01/11/2026–30/11/2026 reference 3.11% monthly, **3.56%** single payment, +1.780 per extra instalment; debit/prepaid ≤1.04% from 1 Nov 2025; foreign cards ≤1.90%; BSMV excluded; applies to **banks** under Tebliğ 2020/4 — [TCMB PDF](https://tcmb.gov.tr/wps/wcm/connect/ebe32165-bf61-4bde-b7c8-45ca1ad4775b/%C3%9Cye+%C4%B0%C5%9Fyerlerine+Uygulanacak+Azami+Komisyon+Oranlar%C4%B1+May%C4%B1s+2026.pdf?MOD=AJPERES) | 3.56% (unchanged since at least Oct 2023) | It is not a ceiling for payment institutions (row 24) |
| 28 | Stripe does not support Turkey | Published | DOĞRULANDI | Turkey absent from "Stripe is currently supported in the following countries/regions" — [Stripe global](https://stripe.com/global) | Same | None |
| 29 | Service export KDV exemption | Blog | DOĞRULANDI | KDVK 11/1-a and 12/2 (customer abroad + "Hizmetten yurt dışında faydalanılmalıdır") — [KDVK PDF, mevzuat.gov.tr](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.3065.pdf), Madde 11–12; KDV GUT II/A-2.1 (PDF p. 53–54): proof by invoice in the foreign customer's name; "use abroad" = related to the customer's activities abroad, not in Turkey — [KDV GUT PDF](https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/9.5.19631.pdf) | Same | Foreign revenue KDV-free only if used outside Turkey |
| 30 | Reverse-charge KDV on foreign vendor bills (Hetzner, Anthropic) | Inference | DOĞRULANDI | KDV GUT: a KDV-registered buyer of electronic services from a non-resident declares the KDV "sorumlu sıfatıyla 2 No.lu KDV Beyannamesi ile" (example 1, mali müşavir buying e-pin from abroad) — [KDV GUT PDF](https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/9.5.19631.pdf) | KDV-2, then deductible on KDV-1 (general rule, KDVK Art. 29) | Cash-flow timing only |
| 31 | TÜRKPATENT 2026 fees | Official | DOĞRULANDI | Page "2026 İŞLEM ÜCRETLERİ": 02.01.01 application 2,820; 02.01.02 2nd class 2,820; 02.01.28 3rd+ class 3,150; 02.01.03 registration 7,010; 02.01.23 renewal (2 classes) 8,730 — [TÜRKPATENT](https://www.turkpatent.gov.tr/marka-islem-ucretleri) | 3 classes: 15,800 TL (CALC) | None |
| 32 | İstanbul Barosu 2026 advisory minimums | Secondary | İKAME (full reproduction) | Board decision 08.12.2025 no. 115/19; J-11 "Diğer Her Türlü Sözleşme" 87,000 or 5% of contract value; J-14 articles of association 159,500; J-17A monthly retainer (limited) 79,750; J-32 KVKK project (monthly) 175,000; J-1 consultation 14,500 first hour — [Hukuki Haber full table](https://www.hukukihaber.net/istanbul-barosu-2026-yili-avukatlik-asgari-ucret-tarifesi). Routes tried: istanbulbarosu.org.tr/ucrettarifeleri (JavaScript-rendered, no text or PDF link), home page links | Same values | None |
| 33 | Mali müşavir 3,606–15,971 TL (conflicting snippets) | Unverified | DÜZELTİLDİ | 2026 SM-SMMM tariff, RG 17.12.2025 no. 33110, image annexes read page by page — [RG PDF 20251217-2-1](https://www.resmigazete.gov.tr/eskiler/2025/12/20251217-2-1.pdf): EK-1-A Tablo I row 3-B-a "Hisseli Kom. ve Limited Şti., Hizmet", 1. Grup: işçisiz 3,606; 1–3 işçili 3,864; 4–9 4,179; 10–49 4,436; 50+ 5,753. EK-1-C note 2: "Tarifedeki ücretler aylık olup KDV dahil"; note 3.6: +35% in 1st-group provinces with centre population over 5 million (İstanbul); note 3.5: +10% with foreign-trade transactions; note 3.8: +10% in teknokent; note 4.4: −50% for the first two years for taxpayers entering real-basis bookkeeping for the first time in 2026. EK-2 1-A "Sürekli Danışmanlık (aylık)": prior-year net sales <33,017,341 TL → 6,497 TL | İstanbul limited, service: **4,868 (no staff), 5,216 (1–3 staff), 5,642 (4–9)** TL/month bookkeeping; plus optional continuous advisory 6,497 → 11,713 TL (≈ USD 232) for 1–3 staff (CALC). 7,985 and 15,971 do not appear in the tariff | Model's USD 300 for accounting and admin covers the tariff (INFERENCE) |
| 34 | Logo Mind Navigator, Mind Insight, j-HR performance prices | Published | DOĞRULANDI | GO Wings list "7 Ocak 2026 tarihinden itibaren geçerlidir", TL, KDV excluded, recommended: Mind Navigator (1 user) 64,400/6,450; 32,200/11,400; 16,800/14,100 — [PDF p. 2](https://cdn.logo.com.tr/files/logocomtr//Uploads/Documents/logo-go-wings-fiyat-listesi.pdf). Analytics list "10 Temmuz 2026": Mind Insight 316,200/41,200; 158,100/65,300; 82,300/78,500 — [PDF p. 1](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/logo-is-analitigi-eop-fiyat-listesi.pdf). j-HR list 7 Jan 2026: "Performans, kariyer ve yetenek yönetimi (100 çalışan)" 294,600/38,300; 147,300/60,800; 76,600/73,100 — [PDF](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/logo-j-hr-eop-fiyat-listesi.pdf) | Same | None |
| 35 | Logo Cloud prices | Published | Not re-opened | (first-round reading stands) | — | None |
| 36 | Paraşüt list 940 TL | Published | DOĞRULANDI | "940 ₺ yerine 752 ₺ + KDV / Aylık; 11.280 ₺ yerine Yıllık 9.024₺ + KDV"; campaign 02.11.2026–31.12.2026, first-time annual subscribers only — [Paraşüt](https://www.parasut.com/on-muhasebe-fiyatlari) | 940 TL/month (annual billing) list | None |
| 37 | TÜİK October 2026 CPI 29.77%, PPI 27.41% | Third party | DOĞRULANDI | TCMB "Ekim Ayı Fiyat Gelişmeleri", 4 Kasım 2026, p. 1 Özet: CPI +2.58% m/m, 29.77% y/y; PPI +1.65% m/m, 27.41% y/y — [TCMB PDF](https://www.tcmb.gov.tr/wps/wcm/connect/15fe8641-cdde-4e1e-846a-446eed1d9447/afiyatekim26.pdf?MOD=AJPERES); Strateji ve Bütçe Başkanlığı note 3.11.2026 (same figures; 12-month average CPI 31.23% per news) — [SBB](https://www.sbb.gov.tr/2026-yili-ekim-ayi-tuketici-ve-uretici-fiyat-gelismeleri/). data.tuik.gov.tr is a JavaScript app (no text via curl) | Same | None |
| 38 | SaaS Capital < USD 12k ACV: NRR 98%, GRR 90% | Primary | DOĞRULANDI | Research Brief 32, PDF created 18.09.2025, p. 1 Fig. 1–2 (excludes companies < USD 1M ARR): <12k NRR 98%, GRR 90%, NRR 25th 90%, 75th 106%; all companies 101% / 91%; p. 2: multi-year 103/94, annual 101/90, monthly 100/89; "GRR must be at least 90%" — [SaaS Capital PDF](https://www.saas-capital.com/wp-content/uploads/2025/09/RB32WS1-2025-B2B-SaaS-Retention-Benchmarks.pdf) | Same | None |
| 39 | Benchmarkit "2025": GRR 84%, payback 16 months | Third party | DÜZELTİLDİ (edition) | 84% GRR and 16-month payback are the **2026 edition (CY2025 data, 342 companies)** — [Aleph summary](https://www.getaleph.com/blog/2026-saas-benchmarks-takeaways). The **2025 edition (CY2024 data)** on Benchmarkit's own page says GRR fell "from 90% to 88%", NRR 101%, growth 26%, CAC payback +12.5% since 2022, and GRR and payback "should be evaluated in context of ACV" — [Benchmarkit 2025](https://www.benchmarkit.ai/2025benchmarks). No public 2026 page (benchmarkit.ai/2026benchmarks = 404) | Label 84%/16 months as "Benchmarkit 2026 (CY2025)" | Labelling only |
| 40 | KeyBanc/Sapphire primary tables | Snippet | İKAME | Not opened (gated download). Substitute: GitLab FY2026 10-K S&M = 45.5% of revenue (CALC from row 44) and Benchmarkit 2025 ACV charts | — | None (not a model input) |
| 41 | Gainsight CSM ratio | Missing | DOĞRULANDI / YENİ | Gainsight blog, 29.07.2022: low touch (<$10k ACV) average **144 accounts per CSM**; mid touch ($10–100k) 49; high touch (>$100k) 22; median ARR per CSM $1.4M (17,034 CSMs) — [Gainsight Horizon AI Labs](https://www.gainsight.com/blog/gainsight-horizon-ai-labs-what-is-the-right-csm-to-customer-ratio/) | Karar (ACV ≈ $3.6k) = low touch | Check: 1 support FTE per ~144 customers (INFERENCE) |
| 42 | Lovallo and Sibony 2010: 1,048 decisions, ROI on 673, 6.9 vs 5.3 points | Snippet this round | DOĞRULANDI | archive.org snapshot 22.07.2026 of the McKinsey article: "we studied 1,048 major decisions made over the past five years"; 17 practices (8 on analysis); "process mattered more than analysis—by a factor of six"; footnote 8 "subset of 673 (out of all 1,048) decisions for which ROI data were available"; bottom→top quartile process "+6.9 percentage points"; analytics "5.3 percentage points" — [archived McKinsey page](http://web.archive.org/web/20260722015914/https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-case-for-behavioral-strategy) | Same | None |
| 43 | PMI Pulse 2020: 11.4% wasted | Primary (earlier) | DOĞRULANDI | archive.org snapshot 05.11.2026 of PMI page (live page HTTP 403): "Data from the 2020 Pulse of the Profession® reveal that 11.4 percent of investment is wasted due to poor project performance" (February 2020) — [archived PMI page](http://web.archive.org/web/20261105051057/https://www.pmi.org/learning/thought-leadership/pulse/pulse-of-the-profession-2020) | 11.4% (2019 edition: "almost 12 percent"; 2018: 9.9%) | None |
| 44 | GitLab FY2026 revenue and NRR | Press summaries | DOĞRULANDI | 10-K filed 17.03.2026 (accession 0001628280-26-018731): total revenue $955,224k (+26%); gross profit $834,481k; S&M $434,725k; Dollar-Based Net Retention Rate 118% (FY2025: 123%); net loss $58.6M — [SEC 10-K](https://www.sec.gov/Archives/edgar/data/1653482/000162828026018731/gtlb-20260131.htm) | Gross margin 87.4%; S&M 45.5% of revenue (CALC) | None |
| 45 | Odoo 2025 revenue €620M, €36M loss | Third party | İKAME | Brussels Times 24.09.2026, citing company statements and the CEO at Odoo Experience: €620M revenue, "€36-million accounting loss" for 2025, >€50M operating income in first eight months of 2026, 2026 turnover +48%, 28M users ~20% paying — [Brussels Times](https://www.brusselstimes.com/2332306/odoo-announces-e10-billion-valuation-and-a-partial-price-increase). Filed Belgian accounts (NBB) not reached | Same | None |
| 46 | Cal.com moved to closed source April 2026 | Third party | DOĞRULANDI | GitHub: repo `calcom/cal.com` now resolves to `calcom/cal.diy`, licence MIT; commit 15.04.2026 "feat: Cal.diy — community-driven MIT-licensed fork of Cal.com" — [GitHub calcom/cal.diy](https://github.com/calcom/cal.diy) | Same | None |
| 47 | Elastic added AGPL August 2024 | Third party | DOĞRULANDI | `elastic/elasticsearch` LICENSE.txt: default triple licence AGPL-3.0-only / SSPL v1 / Elastic License 2.0; commit 13.09.2024 "Add AGPLv3 as a supported license" (announcement 29.08.2024) — [GitHub LICENSE.txt](https://github.com/elastic/elasticsearch/blob/main/LICENSE.txt) | Same | None |
| 48 | Sentry FSL terms | Published | DOĞRULANDI | `getsentry/sentry` LICENSE.md: "FSL-1.1-Apache-2.0"; Competing Use excluded; Apache 2.0 grant "effective on the second anniversary of the date we make the Software available" — [GitHub LICENSE.md](https://github.com/getsentry/sentry/blob/master/LICENSE.md) | Same | None |
| 49 | Frappe "seriously profitable" | Published | DOĞRULANDI | Frappe blog, 4 June 2025, by the founder: "We became seriously profitable for the first time ever"; "more than a decade … from sustainability to profitability"; charts only, figures "available on the ministry website for a fee" — [Frappe blog](https://frappe.io/blog/culture/the-path-to-profitability) | Same; no numeric revenue | None |
| 50 | Kocaeli Büyükşehir 3,060,000 TL contract, 8 Eylül 2026 | Local news | İKAME | Nokta Gazetesi: 4734 Art. 21/f negotiated procedure, tender 14.08.2026, contract 8.09.2026, 3,060,000 TL (KDV status not stated), winner GENAR Araştırma Danışmanlık Ltd. Şti.; no İKN — [Nokta](https://www.noktagazetesi.com.tr/ihale/kocaeli-buyuksehirden-3-milyonluk-vatandas-odakli-strateji-ihalesi-sirketin-sahibi-dikkat-cekti-385382). Routes tried: web search with exact title (kocaeli.bel.tr, Sayıştay); EKAP search is interactive and was not automated | 3,060,000 TL (one tender) | Anchor only |
| 51 | KOSGEB technical consulting 900 TL/day, 40,000 TL cap | Official | DOĞRULANDI | İşletme Geliştirme Destek Programı UE-14/22, Rev. 17.05.2026, Madde 17(13) "günlük üst limiti 900 (dokuz yüz) TL"; 17(14) 50,000 TL in teknopark, 40,000 TL outside — [KOSGEB PDF](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/%C4%B0sletme%20Gelistirme%20Destek%20Program%C4%B1/2026/I%CC%87s%CC%A7letme_Gelis%CC%A7tirme_Destek_Program%C4%B1_Uygulama_Esaslar%C4%B1_22.pdf) | Same | None |

### Inferences
- Break-even effect of the corrections (CALC, base and pessimistic cases of section 6.2): moving the pessimistic card fee from 3.56% to 4.29% + 0.25 TL on a 9,000 TL + 20% KDV monthly invoice adds about 79 TL (USD 1.57) per card-paying customer per month, under 1% of price. Raising the year-3 team base from USD 25,000 to 27,000 (prudent mid-point of the verified 24,303–29,836 range) adds about USD 2,000 of fixed cost; at the base contribution per customer this is roughly 9 more customers at year-3 break-even (CALC: implied contribution ≈ 25,977 ÷ 115 ≈ USD 226 per customer; 2,000 ÷ 226 ≈ 8.9; 115 → about 124). This is the largest model effect of this round.
- The SGK minimum-wage support (row 6) only applies in 2026. If the company registers in 2026, it cuts cost by about USD 25 per employee per month; ignore it for 2027 onward unless a new law extends it.

### Gaps
- Logo Cloud prices (row 35) and the e-fatura threshold (Q3) were not re-opened at primary source in this round because of the call budget; they do not move break-even.
- KeyBanc/Sapphire tables (row 40) were not downloaded (gated form); not a model input.

---

## 1. Employer cost: SGK rates, incentives, ceiling, minimum wage, income tax, and salary surveys

### Takeaway
All payroll parameters are now confirmed in Resmî Gazete or official circular text: 12% MYÖ employer share, a 2-point Treasury support for non-manufacturing employers in 2026, a 297,270 TL ceiling and a 33,030 TL gross minimum wage. The employer factor is 1.2175 with the support and 1.2375 without it. Raw survey data show that a small firm pays about 20% less than the all-firm median for the same role, so the year-1 team costs USD 9,100–11,900 and the year-3 team USD 24,300–29,800 a month.

### Cited Findings
- Law 7566 Art. 23 changes 5510 Art. 81: MYÖ total 20%→21%, employer share 11%→12%, Treasury support in 81(ı) "dört"→"iki"; Art. 24 changes Art. 82 ceiling multiple "7,5"→"9"; Art. 38: Art. 24 in force 1.1.2026, Arts. 22, 23, 27 "2026 yılı Ocak ayı başında" — [RG 19.12.2025 no. 33112](https://www.resmigazete.gov.tr/eskiler/2025/12/20251219-1.htm).
- SGK Genelgesi 2026/1 (06.01.2026): 2-point support from 2026/Ocak; 5 points kept for NACE section C to 2026/Aralık; extension authority to 31.12.2027 — [circular reproduction](https://www.alomaliye.com/2026/01/07/sgk-genelgesi-2026-1/).
- 4/a rates: employee 14% (MYÖ 9, GSS 5), employer 21.75% (MYÖ 12, GSS 7.5, kısa vadeli 2.25) — [KPMG Vergi](https://kpmgvergi.com/pratik-bilgiler/4/2). Unemployment 1% employee, 2% employer (4447 Art. 49; consistent with the 38.75% total in the SGK circular example).
- Minimum wage: daily 1,101 TL for 2026; commission recommends minimum wage support of 1,270 TL — [Asgari Ücret Tespit Komisyonu Kararı 2025/1, RG 26.12.2025 no. 33119](https://www.resmigazete.gov.tr/eskiler/2025/12/20251226-6.pdf).
- Minimum wage support in law: 5510 geçici 112 (Law 7573 Art. 8, RG 29.01.2026 no. 33152): 42.33 TL per day; for workplaces first covered in 2026, all insured days count; not applied if headcount falls below the lowest 2025 month; anti-abuse clause for shifted employment — [RG 29.01.2026](https://www.resmigazete.gov.tr/eskiler/2026/01/20260129-1.htm).
- 2026 wage tax tariff (GVK Tebliği 332, RG 31.12.2025 no. 33124 5. mükerrer): 15/20/27/35/40% at 190k/400k/1.5M/5.3M; fixed amounts 28,500 / 70,500 / 367,500 / 1,697,500 — [KPMG Vergi](https://kpmgvergi.com/yayinlar/mali-bultenler/vergi/2026-yili-gelir-vergisi-dilimleri-ile-dikkate-alinacak-bazi-had-ve-tutarlar-belirlendi/3351).
- yazilimcimaaslari.org (Feb 2026, n=1,223, monthly net, TL): see row 8. Foreign-company median 175,000 TL vs Turkish-company 95,000 TL; meal card is the most common benefit (71.9%) — [yazilimcimaaslari.org](https://yazilimcimaaslari.org/).
- Önceki Yazılımcı 2026 raw data (basis of getSalary's 4,589): 5,002 rows; TL-paid 4,589; company-size medians for seniors: 1–5 staff 122,500; 6–10 137,500; 11–20 150,000; 21–50 157,500; 51–100 172,500; 101–249 172,500; 250+ 182,500 TL net; firms ≤50: junior 56,000, mid 87,500, senior 147,500 (n=1,271); İstanbul seniors 182,500 (n=1,536); ERP developer & consultant senior 145,000 (n=26); UI/UX designer n=5 only; support engineer n=13 — [GitHub dataset](https://github.com/oncekiyazilimci/2026-yazilim-sektoru-maaslari) (my medians of bracket midpoints).
- kariyer.net figures are net monthly salary expectations of applicants in the last 3 months, refreshed monthly, outliers excluded — [kariyer.net](https://www.kariyer.net/pozisyonlar/musteri+destek+uzmani/maas).

Employer cost formula (CALC): gross G solves average monthly net over 12 months = survey net, where net = G − 15% × min(G, 297,270) − (cumulative wage tax on 85% of G − the same on 85% of 33,030) − 0.759% × (G − 33,030). Employer cost = G + 21.75% × min(G, 297,270). Check: 33,030 → 28,075.50 net. USD at 50.3942.

| Role, source (net TL) | Gross TL | Employer cost USD (2-pt support) | No support |
|---|---|---|---|
| Senior backend, all firms (167,500) | 273,992 | 6,620 | 6,728 |
| Senior backend, firms ≤50 (135,000) | 214,349 | 5,179 | 5,264 |
| Mid backend, all (107,500) | 163,882 | 3,959 | 4,024 |
| Mid backend, ≤50 (90,000) | — | 3,224 | — |
| Senior frontend, all (142,500) | 228,113 | 5,511 | 5,602 |
| Mid frontend, all (95,000) | 141,621 | 3,421 | 3,478 |
| Mid frontend, ≤50 (77,500) | — | 2,732 | — |
| Senior mobile, all (177,500) | 292,343 | 7,063 | 7,179 |
| Mid mobile, all (102,500) | 154,706 | 3,738 | 3,799 |
| Senior DevOps/SRE (185,000) | 304,766 | 7,331 | 7,449 |
| Mid DevOps/SRE (127,500) | 200,585 | 4,846 | 4,926 |
| Product designer, kariyer.net (68,000) | ≈97,560 | 2,357 | ≈2,395 |
| Support, kariyer.net (44,200) | ≈58,730 | 1,419 | ≈1,441 |
| B2B sales rep, kariyer.net (54,000) | ≈74,720 | 1,805 | ≈1,834 |
| B2B sales manager, kariyer.net (73,300) | 106,216 | 2,566 | 2,608 |

### Inferences
- Year-1 team (founder unpaid + senior backend + mid frontend + 0.25 DevOps): 9,122 USD with small-firm medians, 11,874 USD with all-firm medians. The report's base of 10,000 USD is inside this verified range.
- Year-3 team (senior and mid backend, senior frontend, mid mobile, 0.5 DevOps, designer, support, sales manager = 7.5 FTE): 24,303 USD (small-firm) to 29,836 USD (all-firm). The base of 25,000 is at the low end; 27,000 is a prudent mid-point.
- A start-up in Turkey competes with foreign employers that pay TL earners far more (175,000 vs 95,000 TL median), so the small-firm medians are achievable only for staff who do not have a foreign offer (INFERENCE).
- The SGK ceiling binds only for the senior DevOps case (gross 304,766 > 297,270), so the flat factor overstates that cost by about USD 3 a month (CALC).

### Gaps
- Product designer rests on applicant expectations (kariyer.net) because the raw developer survey has only 5 UI/UX answers.
- Survey answers are self-reported and partly from remote workers; no audited payroll data exist for Turkish software start-ups.

---

## 2. Infrastructure: Hetzner, Frappe Cloud and Turkish hosting

### Takeaway
Hetzner's cloud prices in the model are the post-June 2026 prices and are confirmed on the live product page and in the archived official adjustment table; backups at 20% are official. The dedicated-server alternative used a limited-offering price; the regular price is about 42% higher. Frappe Cloud prices are confirmed. An official Istanbul (Tier III) provider page confirms about USD 30 a month for a 4-core, 8 GB VM.

### Cited Findings
- June 2026 adjustment: effective 15.06.2026 08:00 CEST for new orders and rescales; old prices for orders placed before that date — [archived Hetzner docs](http://web.archive.org/web/20261022142746/https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/). Live docs URL now returns 404.
- Live product page (16.11.2026): CCX prices per location, "Price incl. IPv4", "excl. VAT"; backups "starting at € 1.0980" — [Hetzner General Purpose](https://www.hetzner.com/cloud/general-purpose/).
- Backups = 20% of server price — [Hetzner billing FAQ](https://docs.hetzner.com/cloud/billing/faq/).
- Dedicated regular vs limited tiers (excl. IPv4): AX42-1 €97.30 (setup €49) vs AX42-1-LTD €77.30 (setup €39); AX102-1 €257.30 (setup €129) vs LTD €157.30 (€39); AX41-1-LTD €57.30; limited tiers are offered "as long as supply lasts" — [archived Hetzner docs](http://web.archive.org/web/20261022142746/https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/).
- Frappe Cloud: see row 22 — [shared hosting](https://frappe.io/cloud/shared-hosting), [pricing](https://frappe.io/cloud/pricing).
- Frappe Press (the control plane the report plans to self-host) is AGPL-3.0; Frappe Framework MIT; ERPNext GPL-3.0 — GitHub licence API for [frappe/press](https://github.com/frappe/press), [frappe/frappe](https://github.com/frappe/frappe), [frappe/erpnext](https://github.com/frappe/erpnext).
- OwnHost (Kuzey Veri Merkezi, İstanbul, Tier III): V-Cloud plans $3.99 (1 core/2 GB) to $29.99 (4 core/8 GB/120 GB NVMe), "Turkey Location" — [OwnHost](https://www.ownhost.net/en/cloud-server).

### Inferences
- Base stack remains USD 527 at HEL prices; at NBG prices it would be about USD 615 (CALC, +17%). Keep 527 as base and 615 as a sensitivity.
- Dedicated alternative: 2× AX42 + 1× AX102 = €451.90/month regular (≈ USD 498) plus €227 setup, or €311.90 on the limited tier when available (CALC at EUR/USD 55.4979/50.3942).
- Self-hosting Press under AGPL-3.0 is compatible with an open-source repo; any modified Press offered over a network must publish its source (INFERENCE from the licence; legal review advised).

### Gaps
- Why HEL is ~15% cheaper than the June table is not documented on any page found (possible later regional change).
- Official 2026 price pages for Türk Telekom, Turkcell and Radore cloud remain unpublished (Radore asks for e-mail).

---

## 3. Payments, KDV and e-invoicing

### Takeaway
Official pages show PayTR from 2.19% and Param 2.29% (next-day), while iyzico's own list price is 4.29% + 0.25 TL including BSMV. The TCMB 3.56% ceiling applies to banks, not to payment institutions, so it is not a worst case for iyzico. Service-export KDV exemption requires both a foreign customer and use abroad; foreign SaaS bills are reverse-charged on KDV-2 and then deducted.

### Cited Findings
- iyzico list: 4.29% + 0.25 TL per successful transaction "(BSMV dahil)"; custom offers for corporate sellers; no setup or fixed fee; instalment cost depends on each bank — [iyzico](https://www.iyzico.com/fiyatlandirma).
- PayTR from 2.19%; final rate depends on volume, sector and settlement term (next day or 30 days); no setup, annual or monthly fee — [PayTR](https://www.paytr.com/sanal-pos-komisyon-oranlari).
- Param 2.29%, settlement next day to Param Business Kart, 23 banks — [Param](https://param.com.tr/sanal-pos).
- TCMB ceilings for banks (Nov 2026): 3.56% single, +1.780 per extra instalment, debit ≤1.04%, foreign cards ≤1.90%, BSMV excluded — [TCMB PDF](https://tcmb.gov.tr/wps/wcm/connect/ebe32165-bf61-4bde-b7c8-45ca1ad4775b/%C3%9Cye+%C4%B0%C5%9Fyerlerine+Uygulanacak+Azami+Komisyon+Oranlar%C4%B1+May%C4%B1s+2026.pdf?MOD=AJPERES).
- KDVK Madde 12/2: "Yurt dışındaki müşteri tabiri; ikametgahı, işyeri, kanuni ve iş merkezi yurt dışında olan alıcılar ile yurt içinde bulunan bir firmanın yurt dışında kendi adına müstakilen faaliyet gösteren şubelerini ifade eder"; conditions (a) service for a foreign customer, (b) used abroad — [KDVK PDF](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.3065.pdf).
- KDV GUT II/A-2.1: invoice in the foreign customer's name; consulting or intermediation used in Turkey is taxable even if invoiced abroad (Örnek 4) — [KDV GUT PDF](https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/9.5.19631.pdf). GİB rulings add that a product also used in Turkey does not qualify unless the service is exclusively for foreign customers (summarised in search results of [GİB özelge 38808](https://gib.gov.tr/mevzuat/kanun/435/ozelge/38808)).
- e-fatura: VUK 509 amended by VUK 589 (RG 31.12.2025) postponed some dates by one year — [Alomaliye text](https://www.alomaliye.com/2025/12/31/vergi-usul-kanunu-genel-tebligi-sira-no-589/). The 3 million TL gross-sales threshold for mandatory e-fatura is reported by vendors — [Paraşüt blog](https://www.parasut.com/blog/e-fatura-gecis-zorunlulugu-sartlari).

### Inferences
- Model card-fee inputs should be: optimistic 2.19% (PayTR "from"), base 2.29% (Param, official), pessimistic 4.29% + 0.25 TL (iyzico list). Effect on break-even is below 1% (CALC in section 0).
- On a 180,000 TL annual invoice paid in one card charge, iyzico list costs 7,722 TL vs 4,482 TL at 2.49% (CALC). This favours bank transfer (EFT/FAST) against e-fatura for annual contracts.

### Gaps
- The e-fatura threshold text in VUK 509 itself was not re-read in this round; the integrator cost (row 22 of the report) is small either way.

---

## 4. Legal, trademark and accountant fees

### Takeaway
TÜRKPATENT fees are confirmed (15,800 TL for three classes). İstanbul Barosu advisory minimums are confirmed from a full reproduction that cites the board decision. The accountant minimum is now read from the Resmî Gazete images: for an İstanbul limited company in services, monthly bookkeeping is 4,868–5,642 TL including KDV depending on staff, plus 6,497 TL if continuous advisory is contracted; new real-basis taxpayers in 2026 get 50% off for two years.

### Cited Findings
- See rows 31–33 of section 0 with page-level references to [TÜRKPATENT](https://www.turkpatent.gov.tr/marka-islem-ucretleri), [Hukuki Haber full table](https://www.hukukihaber.net/istanbul-barosu-2026-yili-avukatlik-asgari-ucret-tarifesi) and [RG 20251217-2-1 PDF](https://www.resmigazete.gov.tr/eskiler/2025/12/20251217-2-1.pdf) (EK-1-A Tablo I, EK-1-B Tablo II–III, EK-1-C Notlar, EK-2).
- Tariff Tablo II (per declaration, 1. Grup): kurumlar vergisi beyannamesi 3,864 TL; KDV/muhtasar 2,604 TL; note 1 says taxpayers whose returns are signed by their SMMM pay no separate signing fee beyond bookkeeping — [RG PDF](https://www.resmigazete.gov.tr/eskiler/2025/12/20251217-2-1.pdf), EK-1-B and EK-1-C.
- Tablo III (one-off): limited company formation 5,209 TL (1. Grup); trademark registration filing 7,785 TL — same PDF, EK-1-B.
- İl grupları: İstanbul, Ankara, İzmir, Kocaeli and others are 1. Grup — same PDF, note 9.

### Inferences
- Earlier snippet values explained: 3,606 TL is the Tablo I base for a staff-less limited service company before the 35% İstanbul uplift; 6,497 TL is the EK-2 continuous advisory fee; 7,985 and 15,971 TL do not appear in the 2026 tariff and should be dropped.
- Whether Tablo II declaration fees are charged on top of bookkeeping is ambiguous given note 1; budget them as included (INFERENCE).

### Gaps
- Market (not minimum) quotes for SMMM and lawyers were not collected; tariffs are floors.

---

## 5. Price anchors and inflation

### Takeaway
All Logo list prices used as anchors are confirmed in the PDFs with their effective dates (7 January 2026 and 10 July 2026, TL, KDV excluded, recommended). Paraşüt's 940 TL is the regular annual-billing monthly price. October 2026 CPI 29.77% and PPI 27.41% are confirmed by the central bank and SBB.

### Cited Findings
- Logo GO Wings PDF (created 31.12.2025): "Tüm fiyatlar Türk Lirası (TL) cinsindendir, fiyatlara KDV dahil değildir"; renewal at current list; 30-day grace with 10% surcharge; licence ends after 90 days — [PDF](https://cdn.logo.com.tr/files/logocomtr//Uploads/Documents/logo-go-wings-fiyat-listesi.pdf).
- Mind Navigator user add-ons (Plan 1 first year/renewal): +2 41,900/4,200; +5 65,700/6,600; +10 104,500/10,500 — same PDF p. 2.
- Mind Insight mail distribution: 5 addresses 144,500/18,800; 10 230,400/30,000; 25 484,000/63,000; 50 772,500/100,500 (Plan 1) — [analytics PDF](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/logo-is-analitigi-eop-fiyat-listesi.pdf).
- Paraşüt campaign terms: 20% off annual for first-time subscribers, 02.11.2026–31.12.2026 — [Paraşüt](https://www.parasut.com/on-muhasebe-fiyatlari).
- CPI/PPI: [TCMB Ekim Ayı Fiyat Gelişmeleri](https://www.tcmb.gov.tr/wps/wcm/connect/15fe8641-cdde-4e1e-846a-446eed1d9447/afiyatekim26.pdf?MOD=AJPERES), [SBB](https://www.sbb.gov.tr/2026-yili-ekim-ayi-tuketici-ve-uretici-fiyat-gelismeleri/).

### Inferences
- Paraşüt's "8,376 TL more economical than monthly" claim implies a monthly-billing price of about 1,450 TL (CALC: (9,024 + 8,376) ÷ 12). So 940 TL is the annual-billing equivalent, and the page's arithmetic is consistent, not an error as the first round said (INFERENCE; the monthly toggle is JavaScript and was not rendered).

### Gaps
- None material for the model.

---

## 6. Retention, payback and support-ratio benchmarks

### Takeaway
SaaS Capital's <USD 12k ACV medians (NRR 98%, GRR 90%) are confirmed in the PDF and exclude companies under USD 1M ARR. Benchmarkit's 84% GRR and 16-month payback belong to its 2026 edition (2025 data); its 2025 edition had 88% GRR. Gainsight data put low-touch (<USD 10k ACV) coverage at 144 accounts per CSM.

### Cited Findings
- SaaS Capital RB32: see row 38 — [PDF](https://www.saas-capital.com/wp-content/uploads/2025/09/RB32WS1-2025-B2B-SaaS-Retention-Benchmarks.pdf). Growth by NRR band (p. 2, Fig. 3): <90% NRR 15% growth; 90–100% 16%; 100–110% 21%; 110–120% 30%; 120–130% 38%; >130% 50%.
- Benchmarkit 2025 edition — [benchmarkit.ai/2025benchmarks](https://www.benchmarkit.ai/2025benchmarks); 2026 edition summary — [Aleph](https://www.getaleph.com/blog/2026-saas-benchmarks-takeaways).
- Gainsight — [Horizon AI Labs](https://www.gainsight.com/blog/gainsight-horizon-ai-labs-what-is-the-right-csm-to-customer-ratio/).
- GitLab FY2026: DBNRR 118%, gross margin 87.4% (CALC from 10-K) — [SEC](https://www.sec.gov/Archives/edgar/data/1653482/000162828026018731/gtlb-20260131.htm).

### Inferences
- Karar's SaaS Capital band excludes companies under USD 1M ARR, so a USD 0.3–0.9M ARR Karar sits below the sample; treat 90% GRR as an upper-mid target, 84% as base-downside (INFERENCE).
- Support capacity check: at 144 accounts per low-touch CSM, one support FTE covers the base year-3 customer count (80) with room; 200 customers (optimistic) need about 1.4 FTE (CALC).

### Gaps
- KeyBanc/Sapphire tables not opened (gated).

---

## 7. Customer ROI evidence

### Takeaway
The Lovallo and Sibony figures are confirmed word for word in an archived copy of the McKinsey article, and PMI's 11.4% (2020) is confirmed in an archived PMI page. No newer PMI waste percentage was found.

### Cited Findings
- McKinsey (archived 22.07.2026): 1,048 decisions, 17 practices, factor of six, 673 with ROI data, +6.9 vs +5.3 points; outcomes self-assessed on revenue, profitability, market share and productivity — [archive.org](http://web.archive.org/web/20260722015914/https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-case-for-behavioral-strategy).
- PMI 2020: 11.4% — [archive.org](http://web.archive.org/web/20261105051057/https://www.pmi.org/learning/thought-leadership/pulse/pulse-of-the-profession-2020). 2019: "almost 12 percent"; 2018: 9.9% — [PMI 2019](https://www.pmi.org/learning/thought-leadership/pulse/pulse-of-the-profession-2019), [PMI 2018](https://www.pmi.org/learning/thought-leadership/pulse/pulse-of-the-profession-2018) (from search results; live pmi.org returns 403 to scripts).

### Inferences
- Threshold arithmetic in the report (180,000 TL ÷ 1 point = 18 million TL; 20–30 million TL with onboarding) still holds; index it with CPI 29.77%.

### Gaps
- No PMI waste figure after 2020 was found in PMI's own pages.

---

## 8. Open-source business models

### Takeaway
Licence facts are now confirmed in the projects' own repositories: Elastic is AGPL/SSPL/ELv2, Sentry is FSL-1.1 with Apache 2.0 after two years, Cal.com's public repo became the MIT "Cal.diy" on 15 April 2026, and Frappe Press is AGPL-3.0. GitLab's FY2026 figures are confirmed in the 10-K. Odoo's numbers remain company statements reported by press.

### Cited Findings
- See rows 44–49 with GitHub and SEC links.

### Inferences
- AGPL-3.0 is consistent with the stack Karar would run (Frappe Press is itself AGPL), which supports the report's licence preference (INFERENCE).

### Gaps
- Odoo filed accounts (Belgian NBB) and Frappe's numeric revenue (Indian MCA) were not reached; both are behind paid or interactive portals.

---

## 9. Public consulting price and grants

### Takeaway
KOSGEB caps are confirmed in the directive text (900 TL per day, 40,000 TL total, 50,000 TL in a teknopark). The Kocaeli 3,060,000 TL contract has no official copy online that could be reached without interactive EKAP search; the press report gives procedure, dates and winner.

### Cited Findings
- KOSGEB UE-14/22 Rev. 17.05.2026, Madde 17(13)–(14); Madde 18 digital transformation consulting is only for manufacturing SMEs (micro firms excluded) — [KOSGEB PDF](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/%C4%B0sletme%20Gelistirme%20Destek%20Program%C4%B1/2026/I%CC%87s%CC%A7letme_Gelis%CC%A7tirme_Destek_Program%C4%B1_Uygulama_Esaslar%C4%B1_22.pdf).
- Kocaeli contract — [Nokta Gazetesi](https://www.noktagazetesi.com.tr/ihale/kocaeli-buyuksehirden-3-milyonluk-vatandas-odakli-strateji-ihalesi-sirketin-sahibi-dikkat-cekti-385382).

### Inferences
- The KOSGEB cap (40,000 TL) equals about 22% of one Karar year at 180,000 TL; it is a sales sweetener via authorised consultants, not a funding source (CALC and INFERENCE, unchanged).

### Gaps
- Kocaeli: official EKAP record (İKN, estimated cost, bidders) not reached. Routes tried: exact-title web search, municipal and Sayıştay results, the press article. EKAP's public search requires an interactive session and was not automated.

# Cost side of Karar Atlası: verified and dated cost inputs (as of 16 November 2026)

Scope: replace the assumptions in `reports/Gelir modeli ve birim ekonomisi.md` and `research_notes/Gelir modeli ve birim ekonomisi/gelir_ve_maliyet.md` with dated cost inputs. Context kept consistent with `docs/butunlesik-gelistirme-raporu.md` sections 1, 10 and 11: Frappe 16, one site and one database per customer, Jenkins plus Frappe Press nightly waves (02.30 to 04.00), PWA plus Capacitor (SQLite on mobile is final), OTA through Capgo or Capawesome Cloud (chosen after a small trial), one public repository, DevOps owned by Hüseyin Cengiz. Research date for every "seen" item: 16 November 2026 (Monday), unless stated.

**Exchange rate used.** TCMB indicative forex selling rates, bulletin 2026/215, dated 16 November 2026: USD/TRY 50.3942, EUR/TRY 55.4979 (forex buying 50.3036 and 55.3981). Implied EUR/USD = 1.1013. Rounded in text: 1 USD = 50.4 TL, 1 EUR = 55.5 TL, 1 EUR = 1.10 USD — [TCMB today.xml / 16112026.xml](https://www.tcmb.gov.tr/kurlar/202611/16112026.xml). For comparison, 13 November 2026: USD 50.2830, EUR 55.6033 — [TCMB 13112026.xml](https://www.tcmb.gov.tr/kurlar/202611/13112026.xml). The earlier model used 50.2282 (11 November); the change is about 0.3% and does not alter conclusions.

**Labels.** PUBLISHED = vendor or official page read on the date shown. OFFICIAL = law, regulator or chamber text. SURVEY = salary survey. AGGREGATOR = third-party listing or blog. ESTIMATE = my calculation from cited inputs. ASSUMPTION = no source; must be tested. Prices exclude Turkish KDV unless stated.

---

## Q1. Team cost in Turkey 2026 (salaries, employer cost, minimum wage, freelance rates)

### Takeaway
A senior Python/backend developer costs the employer about 267,000 to 334,000 TL a month (USD 5,300 to 6,600), and a senior DevOps engineer about 366,000 TL (USD 7,250), so the earlier assumption of USD 6,000 a month for "founder plus one developer" in year 1 is too low unless the founder is unpaid and the developer is mid-level. A realistic 5 to 6 person team costs about USD 17,000 to 30,000 a month in employer cost before overhead, so USD 20,000 for year 3 is the low end, not the base.

### Cited Findings

**Minimum wage and payroll rules (OFFICIAL / secondary summaries of official texts)**
- 2026 gross minimum wage 33,030.00 TL a month; net 28,075.50 TL. Employee SGK 14% (4,624.20 TL) and unemployment 1% (330.30 TL); minimum-wage income is exempt from income tax and stamp tax — [Kolay İK, 13 Apr 2026](https://kolayik.com/blog/2026-asgari-ucret-net-hesabi-ve-kesintiler); [QNB Invest](https://www.qnbinvest.com.tr/investodak/qnbarastirma/2026-asgari-ucret-aciklandi-net-28075-tl).
- 2026 4/a premium table: MYÖ employee 9% / employer 12%; GSS 5% / 7.5%; short-term insurance employer 2.25%; SGK subtotal employee 14% / employer 21.75%; unemployment 1% / 2%. Employer total without incentive 23.75%; non-manufacturing employer with the 2-point Treasury support 21.75%; manufacturing with 5-point support 18.75% — [Alomaliye, SGK Primleri Rehberi 2026, 29 Jul 2026](https://www.alomaliye.com/2026/07/29/sgk-primleri-rehberi-2026/).
- The MYÖ employer share rose from 11% to 12% from 1 January 2026, and the Treasury support for non-manufacturing employers fell from 4 points (2025) to 2 points (2026), both under Law 7566 article 23 (Resmî Gazete 19 Dec 2025, no. 33112); SGK Genelgesi 2026/1 sets the application. The support runs to 31 December 2026; the President may extend it to 31 December 2027 — [Alomaliye rehber](https://www.alomaliye.com/2026/07/29/sgk-primleri-rehberi-2026/); [Alomaliye, SGK Genelgesi 2026/1](https://www.alomaliye.com/2026/01/07/sgk-genelgesi-2026-1/).
- 2026 SGK base: floor 33,030 TL, ceiling 297,270 TL a month (9× minimum wage, raised from 7.5× by Law 7566) — [Alomaliye rehber](https://www.alomaliye.com/2026/07/29/sgk-primleri-rehberi-2026/).
- Minimum-wage employer cost: 40,874.63 TL without incentive (23.75%); a PwC column gives 40,214.03 TL — [Search summary of PwC column](https://www.pwc.com.tr/tr/medya/kose-yazilari/celal-ozcan/2026-yili-asgari-ucreti-ve-sektorlere-gore-isveren-maliyeti.html) (page returned 403; figure from search snippet); [Hesapkurdu](https://www.hesapkurdu.com/ticari/rehber/asgari-ucret-isveren-maliyeti). **Conflict:** Kolay İK computes 40,544.33 TL using a 20.75% employer SGK rate, which is the 2025 rate before the MYÖ increase — [Kolay İK](https://kolayik.com/blog/2026-asgari-ucret-net-hesabi-ve-kesintiler). My calculation with the 2026 table: 33,030 × 1.2375 = 40,874.63 (no incentive); × 1.2175 = 40,214.03 (2-point); × 1.1875 = 39,223.13 (manufacturing). PwC's 40,214.03 matches the 2-point case.
- 2026 income tax tariff for wages: 15% up to 190,000 TL; 20% to 400,000; 27% to 1,500,000; 35% to 5,300,000; 40% above (cumulative annual base). Published in Resmî Gazete 31 Dec 2025 (GVK Genel Tebliği 332), revaluation rate 25.49% — [Alomaliye, 31 Dec 2025](https://www.alomaliye.com/2025/12/31/2026-yili-vergi-dilimleri/); [Forbes TR](https://www.forbes.com.tr/ekonomi/2026-yili-gelir-vergisi-tarifesi-ve-istisna-tutarlari-belirlendi).
- A "minimum wage support" of 1,270 TL per insured person a month is mentioned only in a link teaser — [Kolay İK](https://kolayik.com/blog/2026-asgari-ucret-net-hesabi-ve-kesintiler). Not verified.

**Developer salary surveys 2026 (SURVEY, monthly net TL)**
- yazilimcimaaslari.org, February 2026, 1,223 anonymous respondents, TL salaries only, monthly net: junior 60,000; mid 80,000; senior 137,500; "guru" 175,000. By role (all levels): backend 112,500 (n=194); frontend 80,000 (n=79); mobile 95,000 (n=81); DevOps 137,500 (n=23). No product designer. Respondent counts differ between sections of the page — [yazilimcimaaslari.org](https://yazilimcimaaslari.org/).
- getSalary(), 4,589 respondents, article dated 17 April 2026, role table labelled net: backend junior/mid/senior 68,000 / 107,500 / 167,500; frontend 60,500 / 95,000 / 142,500; full-stack 65,500 / 97,500 / 152,500; DevOps 73,000 / 127,500 / 182,500; data/AI 69,500 / 117,500 / 177,500. Level medians: junior 65,500, mid 102,500, senior 172,500. 83% remote or hybrid; the survey does not ask the employer's country, so foreign-paid salaries may be included — [getSalary 2026 guide](https://getsalary.dev/blog/yazilim-maas-rehberi-2026).
- Levels.fyi (self-reported total compensation, gross annual): Turkey software engineer median TRY 1,550,527 (362 submissions, updated 24 Sep 2026); Istanbul senior median TRY 2,118,787 (25th pct 1.71M, 75th pct 2.56M, updated 7 Jun 2026) — [Levels.fyi Turkey](https://www.levels.fyi/t/software-engineer/locations/turkey); [Levels.fyi Istanbul senior](https://www.levels.fyi/es/t/software-engineer/levels/senior/locations/istanbul-tur) (figures from search snippets of the pages).
- No Frappe- or ERPNext-specific salary data for Turkey was found.

**Non-developer roles (kariyer.net, monthly average from applicants' salary expectations and user answers, 2026)**
- Ürün Tasarımcısı (product designer): 67,980 TL (2025: 62,551); under 1 year 47,600, 4–6 years 72,300, 15+ years 86,200 — [kariyer.net](https://www.kariyer.net/pozisyonlar/urun+tasarimcisi/maas).
- Müşteri Destek Uzmanı (customer support): 44,176 TL (2025: 38,534); under 1 year 32,100, 4–6 years 43,400 — [kariyer.net](https://www.kariyer.net/pozisyonlar/musteri+destek+uzmani/maas). Kurumsal Müşteri Destek Uzmanı: 51,088 TL — [kariyer.net](https://www.kariyer.net/pozisyonlar/kurumsal+musteri+destek+uzmani/maas).
- Kurumsal Satış Müşteri Temsilcisi (B2B sales rep): 53,967 TL (2025: 44,525); 4–6 years 50,800 — [kariyer.net](https://www.kariyer.net/pozisyonlar/kurumsal+satis+musteri+temsilcisi/maas). Kurumsal Satış Yöneticisi: 73,300 TL — [kariyer.net](https://www.kariyer.net/pozisyonlar/kurumsal-satis-yoneticisi-yonetmeni/maas). Commission is not included.
- Kurumsal Müşteriler Yöneticisi (nearest to customer success manager): 77,117 TL; the 2025 figure (39,679) suggests a small sample — [kariyer.net](https://www.kariyer.net/pozisyonlar/kurumsal+musteriler+yoneticisi+yonetmeni/maas).
- kariyer.net warns that answers after the January 2026 minimum-wage change take time to dominate the averages (from search summary of the pages). kariyer.net pages do not say clearly whether figures are net; Turkish salary talk is usually net (ASSUMPTION).

**Freelance and Frappe rates (AGGREGATOR)**
- ERPNext developer rate bands (vendor blog that sells hiring services): South Asian freelancers USD 15–30/hour; offshore agencies USD 25–50; senior independent consultants USD 50–90; US/EU specialists USD 90–150+ — [Ecosire, hire ERPNext developer guide](https://ecosire.com/blog/hire-erpnext-developer-guide).
- An Upwork part-time Frappe developer posting offered USD 12–25/hour — [Upwork](https://www.upwork.com/freelance-jobs/apply/Frappe-Developer_~022089316060660342416/).

**Net-to-gross and employer cost (ESTIMATE, my calculation)**
Formula used: gross G is found so that the average monthly net over 12 months equals the survey net. Net = G − 14% SGK − 1% unemployment (both on min(G, 297,270)) − income tax on the cumulative base (G − 15%) with the 2026 tariff, minus the minimum-wage income tax exemption − stamp tax 0.759% on (G − 33,030). Employer cost = G + 21.75% × min(G, 297,270) (non-manufacturing, 2-point support). Without the support use 23.75%. Check: the formula returns 28,075.50 net for 33,030 gross. USD at 50.3942.

| Role (source of net) | Net TL/month | Gross TL/month | Employer cost TL/month | Employer cost USD/month |
|---|---|---|---|---|
| Senior backend/Python (getSalary) | 167,500 | 273,992 | 333,585 | 6,620 |
| Senior, all roles (yazilimcimaaslari) | 137,500 | 218,937 | 266,556 | 5,289 |
| Lead/"guru" (yazilimcimaaslari) | 175,000 | 287,756 | 350,342 | 6,952 |
| Mid backend (getSalary) | 107,500 | 163,882 | 199,526 | 3,959 |
| Mid, all roles (yazilimcimaaslari) | 80,000 | 117,147 | 142,627 | 2,830 |
| Senior frontend (getSalary) | 142,500 | 228,113 | 277,727 | 5,511 |
| Mid frontend (getSalary) | 95,000 | 141,621 | 172,423 | 3,421 |
| Mobile, all levels (yazilimcimaaslari) | 95,000 | 141,621 | 172,423 | 3,421 |
| Senior DevOps (getSalary) | 182,500 | 300,874 | 365,531 | 7,253 |
| Mid DevOps (getSalary) | 127,500 | 200,585 | 244,212 | 4,846 |
| Product designer (kariyer.net avg) | 67,980 | 97,536 | 118,750 | 2,356 |
| Customer support (kariyer.net avg) | 44,176 | 58,698 | 71,465 | 1,418 |
| B2B sales rep (kariyer.net avg) | 53,967 | 74,673 | 90,914 | 1,804 |
| B2B sales manager (kariyer.net avg) | 73,300 | 106,216 | 129,318 | 2,566 |

Cross-check: Levels.fyi Turkey median TRY 1,550,527/year = 129,211 gross a month → about 87,400 net and 157,300 TL employer cost (USD 3,122). Istanbul senior median TRY 2,118,787/year → about 114,400 net and 215,000 TL employer cost (USD 4,266). Levels.fyi seniors sit below the survey seniors, likely because Levels.fyi skews to large employers with a bonus share and the survey includes remote workers paid from abroad (inference).

### Inferences
- Year 1 team (ESTIMATE): unpaid founder + 1 senior Python/Frappe developer (USD 5,300–6,600) + 1 mid frontend/mobile developer (USD 2,800–3,400) + DevOps at 0.25 FTE (USD 1,200–1,800) ≈ USD 8,300–11,850 a month employer cost (low uses the Levels.fyi Istanbul senior, base the yazilimcimaaslari senior plus a getSalary mid frontend, high the getSalary senior backend). The earlier USD 6,000 covers only one senior developer, or one mid developer plus tools.
- Year 3 team of about 7.5 FTE (ESTIMATE): senior backend, mid backend, senior frontend, mobile, DevOps 0.5 FTE, product designer, support, sales manager ≈ USD 22,600 (yazilimcimaaslari-based) to USD 29,500 (getSalary-based) a month before overhead. A leaner 5.5 FTE team (no designer, no mid backend) ≈ USD 16,800. Base case for the model: USD 25,000 a month in year 3, plus 10–20% overhead (equipment, benefits, tools, office), which is an ASSUMPTION.
- Mobile developer: only an all-level median exists (95,000 net). A senior Capacitor developer is likely near the senior frontend figure (inference).
- Salaries are set in TL and indexed to inflation; USD cost moves with the real exchange rate, not only with TL raises.
- If DevOps is bought as a service from Hüseyin Cengiz rather than employed, cost depends on his terms; not researched.

### Gaps
- Glassdoor TR, Youthall 2026, Coderspace 2026 and Kariyer.net developer pages were not read for this note. Youthall's latest found report is 2025.
- No Frappe/ERPNext salary data for Turkey; no Turkish freelance day rates from a survey. Only a vendor blog and one Upwork post.
- Teknopark and Ar-Ge (R&D) incentives can cut employer cost (income tax withholding exemption, SGK employer share support) but were not researched in this pass.
- Overhead (meal cards, private health insurance, laptops, office) not sourced.
- Official PwC column could not be opened (HTTP 403).

---

## Q2. Infrastructure prices (Hetzner, Frappe Cloud, Turkish data centers, backup, monitoring, email)

### Takeaway
On today's Hetzner list prices, a Frappe Press stack costs about EUR 190 (low), EUR 480 (base) and EUR 900 (high) a month, i.e. USD 206 / 527 / 993, which brackets the earlier USD 300 assumption and moves the base up. Frappe Cloud is simpler but a private bench (needed for custom apps) starts at USD 25 per site a month, so it becomes the costlier path after roughly 20 customers. Turkish hosting prices are mostly unpublished; budget per-customer quotes.

### Cited Findings

**Hetzner (PUBLISHED, EUR/month excl. VAT, seen 16 Nov 2026)**
- Cloud General Purpose (dedicated AMD vCPU), Finland HEL1 / Germany NBG1: CCX13 2 vCPU 8 GB 80 GB €36.99 / €43.49; CCX23 4 vCPU 16 GB 160 GB €73.49 / €86.49; CCX33 8 vCPU 32 GB 240 GB €117.99 / €138.99; CCX43 16 vCPU 64 GB 360 GB €234.99 / €276.49; CCX53 €453.49 / €533.99; CCX63 €725.49 / €853.99. IPv4 included. Backups "related to instance, starting at €1.098". Snapshots €0.0143/GB. Traffic 20–60 TB included in EU — [Hetzner General Purpose](https://www.hetzner.com/cloud/general-purpose/).
- Shared cloud: Regular Performance from €5.49; Cost-Optimized from €5.99 shown "currently not available" — [Hetzner Cloud](https://www.hetzner.com/cloud/).
- Dedicated AX line: AX41 (Ryzen 5 3600, 64 GB, 2×512 GB NVMe) €59, no setup fee; AX42 (Ryzen 7 PRO 8700GE, 64 GB ECC) from €79 (setup €49); AX102 (Ryzen 9 7950X3D, 128 GB ECC) from €159 (setup €129); AX162 (EPYC 9454P, 128–512 GB) from €319 (setup €304). Disk-to-model mapping was inferred by the fetch tool — [Hetzner AX matrix](https://www.hetzner.com/dedicated-rootserver/matrix-ax/). Server Auction from €75.70 — [Hetzner dedicated](https://www.hetzner.com/dedicated-rootserver/).
- Storage Box: BX11 1 TB €3.20; BX21 5 TB €10.90; BX31 10 TB €20.80; BX41 20 TB €40.60; one-time setup fee (amount not shown); Germany or Finland — [Hetzner Storage Box](https://www.hetzner.com/storage/storage-box/).
- Object Storage: €6.49 a month base, includes 1 TB storage and 1 TB egress; extra storage €0.0087 per TB-hour; extra egress €1.00 per TB; FSN1, HEL1, NBG1 — [Hetzner Object Storage](https://www.hetzner.com/storage/object-storage/).
- 2026 repricing: Hetzner raised prices from 1 April 2026 (cloud, dedicated, storage) and again for new orders from 15 June 2026 (CCX and CPX up 113–176%; heise reports about 99% average in Germany). Orders placed before 15 June but delivered later keep old prices — [heise, June round](https://heise.de/-11333037); [heise, April round](https://heise.de/-11185981); [wz-it](https://wz-it.com/en/blog/hetzner-price-increase-june-2026-cpx-ccx-alternatives/). The official price-adjustment page returned 404 again on 16 Nov 2026, so the official old-vs-new table is still NOT VERIFIED — [Hetzner docs (404)](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/).
- No Hetzner location in Turkey: Germany, Finland, USA, Singapore — [Hetzner Cloud](https://www.hetzner.com/cloud/).

**Frappe Cloud (PUBLISHED, no date on pages)**
- Shared site plans: USD 5 (0.5 CPU-hour/day, 0.2 GB DB, 2.5 GB disk); USD 10 (1.0 h, 0.5 GB, 5 GB); USD 25 (2.0 h, 1.0 GB, 25 GB); USD 38 (3.0 h, 1.5 GB, 37.5 GB); USD 50 (4.0 h, 2.0 GB, 50 GB). Private bench groups start at USD 25 per site — [Frappe Cloud shared hosting](https://frappe.io/cloud/shared-hosting).
- The USD 5 Tiny plan is not available on private bench groups; background jobs run every 10 minutes on it — [Frappe docs, Tiny plan](https://docs.frappe.io/cloud/tiny-plan) (from search summary).
- Server plans (own VM, unlimited sites and benches) from USD 40/month; Hetzner recommended for development and non-critical production; AWS or OCI for mission-critical — [Frappe Cloud pricing](https://frappe.io/cloud/pricing).
- Sites exceeding disk or DB limits for 7 days in a row are suspended — [Frappe Cloud site FAQ](https://docs.frappe.io/cloud/faq/site) (from search summary).

**Turkish hosting (when data must stay in Turkey)**
- Radore publishes no cloud price list; asks buyers to e-mail sales — [Radore cloud server](https://radore.com/en/cloud-server).
- Natro XCloud Pro USD 29.99/month excl. 20% KDV, 200 GB disk (AGGREGATOR) — [whtop Natro](https://www.whtop.com/tr/plans/natro.com/142483). Turhost VDS 16 (6 vCPU, 16 GB, 300 GB NVMe) USD 55.20/month excl. KDV (AGGREGATOR) — [whtop Turhost](https://www.whtop.com/tr/plans/turhost.com/135432). Turhost hosts in Türk Telekom Gayrettepe (from earlier note) — [whtop Turhost](https://www.whtop.com/tr/plans/turhost.com/135434).
- Turkcell and Google Cloud plan a Turkey cloud region; Turkcell invests USD 1 billion in three data centers; opening "from 2028 and 2029" per Turkcell's CEO — [Webrazzi, 12 Nov 2025](https://webrazzi.com/2025/11/12/turkcell-ve-google-cloud-turkiyede-1-milyar-dolarlik-veri-merkezi-yatirimi-icin-ortaklik-kurdu/); [CNBC-e](https://www.cnbce.com/sirket-haberleri/turkcell-genel-muduru-koc-veri-merkezi-turkiyeye-5-milyar-dolarlik-deger-katacak-h19619).

**Monitoring and email (PUBLISHED)**
- Sentry: Developer free (1 user, 5k errors); Team USD 29/month (USD 26 billed yearly), 50k errors; Business USD 89 (USD 80 yearly) — [Sentry pricing](https://sentry.io/pricing/).
- Better Stack: free tier 10 monitors and 1 status page; Responder license USD 34/month (USD 29 yearly); +50 monitors USD 25 (USD 21 yearly); extra status page USD 15 (USD 12 yearly) — [Better Stack pricing](https://betterstack.com/pricing).
- Amazon SES: USD 0.10 per 1,000 emails; attachments USD 0.12/GB; dedicated IP USD 24.95/month — [AWS SES pricing](https://aws.amazon.com/ses/pricing/).

### Inferences
- Stack sizing (ESTIMATE, Hetzner list prices, backups taken as 20% of instance price because Hetzner shows only a "starting at" figure):
  - Low (year 1, under about 20 customers): CCX23 app+DB, CCX13 Press+Jenkins, CCX13 staging, Object Storage, BX11 ≈ €186.65 ≈ USD 206/month.
  - Base: Press control plane, Jenkins, staging and monitoring on four CCX13; app on CCX33; DB on CCX33; Object Storage; BX21 ≈ €478 ≈ USD 527/month.
  - High: Germany prices, DB on CCX43, two app CCX33, four CCX13, Object Storage, BX31 ≈ €901 ≈ USD 993/month.
  - Dedicated alternative: 2× AX42 + 1× AX102 ≈ €317/month (USD 349) plus €227 one-time setup, with far more RAM; trades cloud flexibility for price.
- Frappe Cloud vs self-host: at USD 25 per site, 20 customers cost USD 500/month and 100 customers USD 2,500/month, against the base self-hosted stack of about USD 527. Frappe Cloud also cannot run the nightly Jenkins-driven wave design as written; it would replace part of section 11 (inference).
- Turkey-resident customers: budget an extra VDS at USD 30–75/month per customer or per small group (ESTIMATE from aggregator listings) and price a "Türkiye hosting" add-on above that.
- Monitoring plus email at 100 customers: about USD 60–100/month (Sentry Team + Better Stack Responder + SES), i.e. negligible (ESTIMATE).

### Gaps
- Official Hetzner old-vs-new price table (404). Hetzner backup exact percentage not shown on the page.
- No published prices from Türk Telekom, Turkcell, Radore or Bulutistan cloud; Natro and Turhost figures are aggregator data.
- Whether Frappe Cloud runs in a Turkey region: not found.

---

## Q3. Payment and billing (iyzico, PayTR, Param, Stripe, KDV, e-fatura, cheques)

### Takeaway
Stripe does not accept Turkish businesses, so card collection runs through iyzico, PayTR or Param at roughly 2.2–3.0% per single payment, with a regulatory ceiling of 3.56% for bank credit cards. Domestic SaaS carries 20% KDV; sales to foreign customers can be KDV-exempt as service export only if the service is used abroad. E-invoicing is cheap (a few thousand TL a year).

### Cited Findings
- Stripe's supported-country list does not include Turkey (no preview note) — [Stripe global](https://stripe.com/global).
- iyzico publishes no general rate; merchants see their own rates in the panel. Third-party figures: from 2.49% + 0.25 TL per transaction (custom offer) — [Ticimax](https://www.ticimax.com/blog/iyzico-komisyon-oranlari); "2.99% and above" and older 2.69% also circulate — [search summary, karekod and others](https://www.karekod.org/blog/sanal-pos-komisyon-oranlari/). Paynet services moved under the iyzico brand from 1 January 2026 — [Paynet](https://www.paynet.com.tr/en/all-transactions-automatically-recorded-with-smart-reporting).
- PayTR: from 2.19% for new members with 7-day settlement; no setup fee, annual fee or monthly fixed fee. Param (ParamPOS): 2.29% listed, next-day settlement to Param Business Kart. Sipay: offer on application. Article updated 18 Sep 2026 (AGGREGATOR) — [karekod, Sanal POS 2026](https://www.karekod.org/blog/sanal-pos-komisyon-oranlari/).
- TCMB ceilings for banks (2026, excl. BSMV): domestic debit/prepaid up to 1.04%; foreign-issued cards up to 1.90%; credit card single payment up to 3.56%; higher with installments — [karekod](https://www.karekod.org/blog/sanal-pos-komisyon-oranlari/).
- Param's own (cert subdomain) page shows 2.19% for ParamKart Business members and 4.15% standard, undated — [Param virtual POS](https://cert.param.com.tr/en/param-virtual-pos) (from search summary). Conflicts with karekod's 2.29%.
- KDV: Turkey has 1%, 10% and 20% rates (search summary); Turkish VDS listings are quoted "+20% KDV" — [whtop Natro](https://www.whtop.com/tr/plans/natro.com/142483). Software services sold abroad are KDV-exempt under KDVK 11/1-a if the service is performed for a foreign customer and used abroad; a service also used in Turkey fails the test; refund needs proof that payment came in as foreign currency — [Alomaliye, 30 Jul 2024](https://www.alomaliye.com/2024/07/30/yurt-disinda-mukim-firmaya-verilen-tasarim-yazilim-ve-danismanlik-hizmetinin-kdv-ve-kvk-karsisindaki-durumu/); [fatiharas](https://www.fatiharas.com/yazilim-ihracati-vergilendirme/).
- Corporate tax: the service-export income deduction rose from 80% to 100% under Presidential Decision 11257 (30 April 2026), subject to the "used abroad" rule (blogs, not the official text) — [Muhasebenews](https://www.muhasebenews.com/yurt-disina-verilen-bazi-hizmetlerde-kurumlar-vergisi-indirimi-%100-oldu/); [Vergi Merkezi](https://vergimerkezi.com.tr/yazilim-vergi-muafiyeti-ihracat-istisnasi-2026/).
- Digital services tax rate 5% from 1 January 2026 and 2.5% from 1 January 2027 — [Bengütürk](https://www.benguturk.com/ekonomi/dijital-hizmet-vergisinde-oranlar-dusuruldu-252889h). Thresholds were not checked.
- E-invoicing: GİB e-Arşiv portal is free with no invoice limit; private integrators price by annual credit packs. Faturaport packages 1,000 / 5,000 / 6,500 TL; about 1.92 TL per credit at 500 credits (vendor blog) — [Faturaport](https://faturaport.com/blog/e-fatura/2026-mayis-e-fatura-kontor-fiyatlari). Paraşüt e-Fatura + Ön Muhasebe 752 TL/month + KDV (2026 status not confirmed, from earlier note) — [Paraşüt](https://www.parasut.com/on-muhasebe-fiyatlari).
- Cheques and terms: no 2026 statistic on average post-dated cheque terms found. Proxy: FMCG payment terms grew from 45–60 days (2021) to 60–95 days (2025); columnists report large firms pushing payment to 120–180 days; bounced cheques totalled 128 billion TL in 2025 — [Dünya column](https://www.dunya.com/kose-yazisi/tedarik-zincirinde-ticari-alacak-cikmazi/836742); [Dünya column](https://www.dunya.com/kose-yazisi/buyuklerin-faiz-tahkimati-kobi-carkini-kilitliyor/840000).

### Inferences
- For an annual 180,000 TL contract paid by card at 2.5%, the fee is 4,500 TL (USD 89). Bank transfer (havale/EFT) against an e-fatura is likely the main B2B path and costs little, but fees were not researched.
- Do not accept post-dated cheques for SaaS subscriptions; offer annual prepay discount or monthly card/transfer instead (inference from the term and bounced-cheque data).
- Foreign customers using the product only abroad can be invoiced without KDV; Turkish subsidiaries of foreign groups that use it in Turkey probably cannot (inference; needs a mali müşavir opinion).
- Foreign vendor bills (Hetzner, Anthropic, Capgo) likely trigger reverse-charge KDV, which a KDV-registered company can deduct (inference; not verified).

### Gaps
- Official iyzico price list (page 404). PayTR official page not fetched. Bank transfer and FAST fees not researched.
- Official KDV rate text for software services and the 11257 decision text not read.
- e-Fatura integrator official prices for Logo, Uyumsoft, Paraşüt (2026) not confirmed.

---

## Q4. Mobile and OTA costs

### Takeaway
Store fees remain USD 99 a year (Apple) and USD 25 once (Google). OTA costs USD 9–49 a month at Karar Atlası's scale; prices are unchanged since the earlier note except that Capawesome added higher tiers.

### Cited Findings
- Apple Developer Program: USD 99 per membership year, shown in local currency at enrollment; organizations need a D-U-N-S number — [Apple enroll](https://developer.apple.com/programs/enroll/).
- Google Play: USD 25 one-time registration fee — [Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en).
- Capgo: Solo USD 14/month (USD 146/year), 2,000 MAU, 1 build hour; Maker USD 39 (USD 396/year), 10,000 MAU; Team USD 99 (USD 998/year), 100,000 MAU; Enterprise from USD 249; overage USD 3 per 1,000 MAU; build USD 0.08/minute; country discount 15–50% only on Solo — [Capgo pricing](https://capgo.app/pricing/).
- Capawesome Cloud Live Updates: Starter USD 9 (1K MAU), Professional USD 29 (10K), Team USD 79 (50K), Business USD 249 (250K). Platform plans with native builds and store publishing: Starter USD 19 (200 build minutes), Professional USD 49 (500), Team USD 149 (1,500), Business USD 499 (5,000). No per-unit overage — [Capawesome pricing](https://capawesome.io/cloud/pricing/).

### Inferences
- Year 1 (under 2,000 MAU): USD 9–19/month OTA + USD 99/year Apple ≈ USD 17–27/month all-in. Year 3 (about 3,000–10,000 MAU): USD 29–49/month (ESTIMATE).
- Capawesome Platform plans include cloud iOS builds, which can replace owning a Mac build machine for Jenkins step 18 (inference).

### Gaps
- Apple's price in TRY at enrollment not checked. D-U-N-S lead time for a new Turkish company not checked.

---

## Q5. AI cost (API prices and self-hosting an open-weight model)

### Takeaway
API prices have not moved since the earlier note: Claude Sonnet 5.5 is USD 2 / 10 per million tokens and Opus 5.5 USD 4 / 20, so the earlier per-task estimates stand. Self-hosting in Istanbul costs about 42,000 TL (USD 833) a month for one RTX 5090 server, which equals roughly 20,000 drafting tasks on Sonnet 5.5; it only makes sense when a customer forbids cross-border AI.

### Cited Findings
- Anthropic (per million tokens, input / output): Opus 5.5 USD 4 / 20 (cache hit USD 0.20); Sonnet 5.5 USD 2 / 10 (cache hit USD 0.10); Haiku 5.5 USD 0.10 / 0.50 for prompts up to 100k tokens, USD 0.50 / 2.50 above; Fable 5.2 USD 8 / 40. Batch API 50% off. US-only inference 1.1× multiplier. Web search USD 10 per 1,000 searches — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing).
- OpenAI (input / cached / output per million): gpt-6.1-sol USD 2 / 0.10 / 10; gpt-6.1-terra USD 1 / 0.05 / 5; gpt-6-luna USD 0.10 / 0.01 / 0.50; gpt-5.5 USD 5 / 0.50 / 30. Batch about 50% off. Data-residency endpoints +10% for models released on or after 5 March 2026 — [OpenAI API pricing](https://developers.openai.com/api/docs/pricing).
- Google Gemini (paid tier, input / output per million): 3.1 Pro Preview USD 2 / 12 (≤200k); 3.8 Flash USD 0.75 / 3.75 through 31 Dec 2026, then USD 1.50 / 7.50 from 1 Jan 2027; 3.5 Flash-Lite USD 0.30 / 2.50. Batch 50% off. Search grounding: 5,000 free/month, then USD 14 per 1,000 — [Google AI Studio pricing](https://aistudio.google.com/docs/pricing).
- Istanbul GPU servers (SistemDC, Tier 3 Istanbul, monthly, KDV basis not stated): RTX 5060 Ti 16 GB 26,000 TL; RTX 5090 32 GB 42,000 TL; 2× RTX 5090 62,000 TL; Tesla P40 24 GB 27,000 TL; yearly 10% cheaper — [SistemDC](https://www.sistemdc.com/en/category/ekran-kartli-sunucu).
- Hetzner GPU (Germany/Finland, nearby EU option): GEX45 RTX PRO 4000 24 GB €214/month + €209 setup; GEX63 RTX PRO 6000 96 GB €999 + €999; GEX131 RTX PRO 6000 96 GB from €1,499 + €1,499; GEX430 4× RTX PRO 6000 €3,599 + €3,599 — [Hetzner GPU matrix](https://www.hetzner.com/dedicated-rootserver/matrix-gpu/).
- Cloud4U offers GPU cloud from a Turkey data center on a quote basis only — [Cloud4U](https://www.cloud4u.com/news/cloud4u-ai-infrastructure-turkey/). Turkcell–Google region with GPUs/TPUs not before 2028–2029 — [Turkcell blog](https://www.turkcell.com.tr/blog/turkiyenin-dijital-donusumundeki-tarihi-adim-turkcell-ve-google-cloud-isbirliginin-analizi).
- Global H100 rental benchmarks USD 2.25–8.00/hour; A100 80 GB USD 1.29–4.00/hour (AGGREGATOR) — [AIMultiple](https://aimultiple.com/tr/cloud-gpu-providers) (from search summary). A source claims NVIDIA's EULA restricts consumer GPUs (RTX 4090/5090) in commercial data centers — [search summary of GPU blogs](https://www.gpunex.com/tr/blog/best-gpu-for-ai-2026); not verified against NVIDIA's licence.

### Inferences
- Per-task API cost (ESTIMATE, same token assumptions as the earlier note): drafting 10k in / 2k out on Sonnet 5.5 = USD 0.04; research synthesis 50k / 4k on Opus 5.5 = USD 0.28. Unchanged.
- EUR-region alternatives are 10% dearer for pinned residency (Anthropic US 1.1×, OpenAI +10%); Turkey residency is not offered by any of the three (inference from the pages; no Turkey region listed).
- One RTX 5090 (32 GB) can serve a quantised mid-size open-weight model for a few concurrent users; quality will be below Sonnet/Opus. Treat self-hosting as a premium add-on priced at cost + margin (≥ USD 1,000/month per dedicated customer), not as the default (inference).

### Gaps
- No public H100/A100 price from a Turkish provider. KDV status of SistemDC prices unknown. Open-weight model throughput on these GPUs not benchmarked.

---

## Q6. Professional services and company formation

### Takeaway
Setting up a limited company costs about 30,000–42,500 TL plus 50,000 TL capital that can be paid within 24 months. A Turkish trademark in three classes costs 15,800 TL in official fees. Istanbul Bar's advisory minimums are high (KVKK compliance project 175,000 TL a month; monthly retainer 79,750 TL); real quotes may differ.

### Cited Findings
- TÜRKPATENT 2026 trademark fees: application single class 2,820 TL; 2nd class 2,820; each class from the 3rd 3,150; registration 7,010; certificate copy 2,890; renewal up to 2 classes 8,730 (+750 per extra class). No e-filing discount shown — [TÜRKPATENT Marka İşlem Ücretleri](https://www.turkpatent.gov.tr/marka-islem-ucretleri).
- Amendment BİK/TÜRKPATENT 2026/2 (Resmî Gazete 31 Oct 2026, no. 33416) changed service lines 01.01.01, 01.01.49, 01.01.51, 01.01.64 and added lines after 01.01.65; amounts not readable — [Alomaliye, 31 Oct 2026](https://www.alomaliye.com/2026/10/31/turkpatent-2026-ucret-tarifesinde-degisiklik-bik-turkpatent-2026-2/).
- İstanbul Barosu 2026 advisory minimum fees (board decision 08.12.2025, no. 115/19): office consultation 14,500 TL first hour, 9,500 each further hour; written opinion 29,000; video consultation 13,000; "other contracts" at least 87,000 or 5% of contract value; articles of association 159,500; company formation 166,750; monthly retainer for limited company 79,750; KVKK transformation and compliance project/consultancy 175,000 a month. KDV basis not stated — [Hukuki Haber](https://www.hukukihaber.net/istanbul-barosu-2026-yili-avukatlik-asgari-ucret-tarifesi).
- SMMM tariff 2026 published in Resmî Gazete 17 Dec 2025 (no. 33110), in force 1 Jan 2026; amounts include KDV; 25% discount in districts under 50,000 residents — [Paraşüt blog, 29 Jan 2026](https://www.parasut.com/blog/sm-smmm-ymm-asgari-ucret-tarifeleri); [Resmî Gazete PDF](https://www.resmigazete.gov.tr/eskiler/2025/12/20251217-2-1.pdf). The tariff tables are images; I could not extract the amounts. Search snippets give "from 7,985 TL a month for limited and anonim companies in metropolitan cities, rising to 15,971 TL above 60 MB of data" (Vergi Merkezi) and "3,606 TL base for workerless limited companies, 1st group" (Faturaport); the two conflict and neither was confirmed — [Vergi Merkezi](https://vergimerkezi.com.tr/?p=3984); [Faturaport](https://faturaport.com/blog/on-muhasebe/2026-yilinda-sm-smmm-ymm-asgari-ucret-tarifeleri-kapsamli-rehber).
- Limited company formation 2026 (Paraşüt, page dated 24 Feb 2026): notary 4,000–6,500 TL; chamber registration and announcements 8,000–12,000 (Istanbul 10,000–12,000); mali müşavir formation service 12,000–18,000; e-imza 1,440 (1 year) incl. KDV; mali mühür 1,740 (3 years) incl. KDV; total 30,000–42,500 TL excluding capital; minimum capital 50,000 TL, payable within 24 months of registration — [Paraşüt](https://www.parasut.com/blog/limited-sirket-kurulus-maliyetleri). Other guides give 24,000–32,000 and 30,500–39,500 TL — [search summary](https://www.ffkpartnerhukuk.com.tr/sirket-kurulus-maliyeti-2026-turkiyede-guncel-ve-kapsamli-rehber/).

### Inferences
- Trademark for "Karar Atlası" in classes 9, 42 and 35: 2,820 + 2,820 + 3,150 + 7,010 = 15,800 TL official fees (USD 314), plus attorney fees (not sourced).
- Legal set-up budget (ESTIMATE): SaaS terms, DPA/KVKK documents and privacy notice as 2–3 "other contracts" at the Istanbul advisory floor = 174,000–261,000 TL (USD 3,450–5,200) one-time; a full KVKK project at 175,000 TL/month is the bar's advisory figure and likely above what a small firm pays for a 1–2 month project.
- Mali müşavir: budget 8,000–16,000 TL/month (USD 160–320) for a limited company (ESTIMATE from the unconfirmed snippets); payroll fees per employee unknown.

### Gaps
- Exact SMMM 2026 amounts for bilanço-basis companies and payroll fees (tariff tables are images).
- Market (not advisory) lawyer quotes for KVKK and SaaS contracts.
- Whether the 31 Oct 2026 TÜRKPATENT amendment touched trademark lines (codes changed are 01.x; trademark codes on TÜRKPATENT's page are 02.x, so probably not; inference).

---

## Q7. Consolidated cost table (low, base, high)

### Takeaway
Team cost dominates: base team cost is about USD 25,000 a month in year 3, against about USD 600–700 for infrastructure, OTA and tools combined. The earlier model's year-1 USD 6,000 should become about USD 10,000 and year-3 USD 20,000 should become about USD 25,000 (base) with a USD 17,000–35,000 range.

### Cited Findings
All rows below come from Q1–Q6; source URLs are repeated in the table. Currency: USD at 50.3942 TL and 1.1013 USD/EUR (TCMB, 16 Nov 2026). "Seen" date for all rows: 16 Nov 2026 unless noted.

| # | Cost line | Unit | Low | Base | High | Type | Source |
|---|---|---|---|---|---|---|---|
| 1 | Minimum wage, employer cost | TL/month | 39,223 (manufacturing 5-pt) | 40,214 (2-pt) | 40,875 (no incentive) | OFFICIAL + ESTIMATE | [Alomaliye SGK 2026](https://www.alomaliye.com/2026/07/29/sgk-primleri-rehberi-2026/) |
| 2 | Employer cost formula | — | G × 1.1875 | G × 1.2175 | G × 1.2375 | OFFICIAL | same; SGK share capped at 297,270 TL |
| 3 | Senior Python/Frappe developer | USD/month employer cost | 4,266 (Levels.fyi Istanbul senior) | 5,289 (yazilimcimaaslari senior) | 6,620 (getSalary senior backend) | SURVEY + ESTIMATE | [ym](https://yazilimcimaaslari.org/); [getSalary](https://getsalary.dev/blog/yazilim-maas-rehberi-2026); [Levels.fyi](https://www.levels.fyi/es/t/software-engineer/levels/senior/locations/istanbul-tur) |
| 4 | Mid Python/backend developer | USD/month | 2,830 | 3,959 | 4,181 | SURVEY + ESTIMATE | ym; getSalary |
| 5 | Frontend React/TS developer (mid / senior) | USD/month | 2,830 (mid, ym) | 3,421 (mid, gs) | 5,511 (senior, gs) | SURVEY + ESTIMATE | ym; getSalary |
| 6 | Mobile (Capacitor) developer | USD/month | 3,421 (all levels) | 3,421 | 5,511 (ASSUMPTION: senior = senior frontend) | SURVEY + ESTIMATE | ym |
| 7 | DevOps engineer (full time) | USD/month | 4,846 (mid) | 5,289 (all levels) | 7,253 (senior) | SURVEY + ESTIMATE | ym; getSalary |
| 8 | Product designer | USD/month | 1,553 (under 1 yr, 47,600 net) | 2,356 (avg) | 3,075 (15+ yrs, 86,200 net) | SURVEY + ESTIMATE | [kariyer.net](https://www.kariyer.net/pozisyonlar/urun+tasarimcisi/maas) |
| 9 | Customer support / success | USD/month | 1,418 | 1,691 | 2,717 (CS manager proxy, 77,117 net) | SURVEY + ESTIMATE | [kariyer.net](https://www.kariyer.net/pozisyonlar/musteri+destek+uzmani/maas) |
| 10 | B2B sales (base pay, no commission) | USD/month | 1,804 | 2,566 | 2,566 + commission (unknown) | SURVEY + ESTIMATE | [kariyer.net](https://www.kariyer.net/pozisyonlar/kurumsal+satis+musteri+temsilcisi/maas) |
| 11 | Freelance Frappe developer | USD/hour | 15 | 30 | 90 | AGGREGATOR | [Ecosire](https://ecosire.com/blog/hire-erpnext-developer-guide) |
| 12 | Team, year 1 (founder unpaid + senior + mid + 0.25 DevOps) | USD/month | 8,300 | 10,000 | 11,850 | ESTIMATE | rows 3–7 |
| 13 | Team, year 3 (5.5–7.5 FTE, before overhead) | USD/month | 16,800 | 25,000 | 29,500 (+20% overhead ≈ 35,000) | ESTIMATE | rows 3–10 |
| 14 | Hetzner Press stack | USD/month | 206 | 527 | 993 | PUBLISHED + ESTIMATE | [Hetzner CCX](https://www.hetzner.com/cloud/general-purpose/) |
| 15 | Hetzner dedicated alternative (2× AX42 + AX102) | USD/month | 349 (+250 setup once) | — | — | PUBLISHED | [Hetzner AX](https://www.hetzner.com/dedicated-rootserver/matrix-ax/) |
| 16 | Frappe Cloud per site (private bench) | USD/site/month | 25 | 25 | 50 | PUBLISHED | [Frappe Cloud](https://frappe.io/cloud/shared-hosting) |
| 17 | Backup storage (Object Storage + Storage Box) | USD/month | 10.6 (€6.49 + €3.20) | 19.1 (€6.49 + €10.90) | 30.0 (€6.49 + €20.80) | PUBLISHED | [Hetzner OS](https://www.hetzner.com/storage/object-storage/); [Storage Box](https://www.hetzner.com/storage/storage-box/) |
| 18 | Turkey-located VDS per resident customer | USD/month | 30 | 55 | 75 (ASSUMPTION) | AGGREGATOR | [whtop Natro](https://www.whtop.com/tr/plans/natro.com/142483); [whtop Turhost](https://www.whtop.com/tr/plans/turhost.com/135432) |
| 19 | Monitoring (Sentry + Better Stack) | USD/month | 0 (free tiers) | 55 (26 + 29 yearly) | 123 (89 + 34 monthly) | PUBLISHED | [Sentry](https://sentry.io/pricing/); [Better Stack](https://betterstack.com/pricing) |
| 20 | Email (SES) | USD per 1,000 emails | 0.10 | 0.10 | 0.10 + 24.95/month dedicated IP | PUBLISHED | [AWS SES](https://aws.amazon.com/ses/pricing/) |
| 21 | Card payment fee | % of charge | 2.19 | 2.49 + 0.25 TL | 3.56 (bank ceiling) | AGGREGATOR + regulatory | [karekod](https://www.karekod.org/blog/sanal-pos-komisyon-oranlari/); [Ticimax](https://www.ticimax.com/blog/iyzico-komisyon-oranlari) |
| 22 | KDV on domestic sales | % | 20 | 20 | 20 | OFFICIAL (not fetched) | [whtop KDV note](https://www.whtop.com/tr/plans/natro.com/142483) |
| 23 | KDV on service export used abroad | % | 0 | 0 | 20 (if used in Turkey) | OFFICIAL via blogs | [Alomaliye](https://www.alomaliye.com/2024/07/30/yurt-disinda-mukim-firmaya-verilen-tasarim-yazilim-ve-danismanlik-hizmetinin-kdv-ve-kvk-karsisindaki-durumu/) |
| 24 | E-fatura integrator | TL/year | 0 (GİB portal) | 5,000 | 9,024 (Paraşüt 752 × 12) | AGGREGATOR | [Faturaport](https://faturaport.com/blog/e-fatura/2026-mayis-e-fatura-kontor-fiyatlari); [Paraşüt](https://www.parasut.com/on-muhasebe-fiyatlari) |
| 25 | Apple Developer Program | USD/year | 99 | 99 | 99 | PUBLISHED | [Apple](https://developer.apple.com/programs/enroll/) |
| 26 | Google Play registration | USD once | 25 | 25 | 25 | PUBLISHED | [Google](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en) |
| 27 | OTA service | USD/month | 9 (Capawesome LU Starter) | 29 (Capawesome LU Pro) | 49 (Capawesome Platform Pro) / 39 (Capgo Maker) | PUBLISHED | [Capawesome](https://capawesome.io/cloud/pricing/); [Capgo](https://capgo.app/pricing/) |
| 28 | LLM API, drafting task (10k in / 2k out) | USD/task | 0.002 (Haiku 5.5) | 0.04 (Sonnet 5.5) | 0.08 (Opus 5.5) | PUBLISHED + ESTIMATE | [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing) |
| 29 | LLM web search | USD per 1,000 | 10 (Claude) | 10 | 14 (Gemini grounding after free quota) | PUBLISHED | Anthropic; [Google](https://aistudio.google.com/docs/pricing) |
| 30 | Self-hosted GPU in Istanbul | USD/month | 516 (RTX 5060 Ti) | 833 (RTX 5090) | 1,230 (2× RTX 5090) | PUBLISHED (KDV basis unknown) | [SistemDC](https://www.sistemdc.com/en/category/ekran-kartli-sunucu) |
| 31 | Self-hosted GPU, EU (Hetzner) | USD/month | 236 (GEX45, 24 GB) | 1,100 (GEX63, 96 GB) | 1,651 (GEX131) | PUBLISHED | [Hetzner GPU](https://www.hetzner.com/dedicated-rootserver/matrix-gpu/) |
| 32 | Company formation (limited) | TL once | 24,000 | 30,000 | 42,500 (+50,000 capital within 24 months) | AGGREGATOR | [Paraşüt](https://www.parasut.com/blog/limited-sirket-kurulus-maliyetleri) |
| 33 | Mali müşavir | TL/month | 3,606 (unconfirmed) | 7,985 (unconfirmed) | 15,971 (unconfirmed) | AGGREGATOR snippets | [Vergi Merkezi](https://vergimerkezi.com.tr/?p=3984); [Faturaport](https://faturaport.com/blog/on-muhasebe/2026-yilinda-sm-smmm-ymm-asgari-ucret-tarifeleri-kapsamli-rehber) |
| 34 | Trademark, official fees (1 / 3 classes) | TL once | 9,830 | 15,800 | 15,800 + attorney | OFFICIAL | [TÜRKPATENT](https://www.turkpatent.gov.tr/marka-islem-ucretleri) |
| 35 | Lawyer, contract drafting (Istanbul advisory floor) | TL per contract | 87,000 | 87,000 | 5% of contract value if higher | OFFICIAL (advisory) | [Hukuki Haber](https://www.hukukihaber.net/istanbul-barosu-2026-yili-avukatlik-asgari-ucret-tarifesi) |
| 36 | Lawyer, KVKK compliance project (advisory) | TL/month | 175,000 | 175,000 | 175,000 | OFFICIAL (advisory) | same |
| 37 | Lawyer, monthly retainer, limited company (advisory) | TL/month | 79,750 | 79,750 | 79,750 | OFFICIAL (advisory) | same |

### Inferences
- Revised fixed monthly opex for the model (ESTIMATE): year 1 ≈ USD 10,000 team + USD 206–527 infra + USD 60 tools/OTA + about USD 300 accounting and admin ≈ USD 10,600–10,900. Year 3 ≈ USD 25,000 team + USD 527–993 infra + USD 150 tools/OTA + USD 300 accounting ≈ USD 26,000–26,500 base (range about USD 17,600–36,500).
- With the earlier note's contribution per customer (base ARPA about USD 300), break-even rises from about 100 to roughly 90–100 customers if overhead is excluded, and to about 110–130 customers with 20% overhead (inference; re-run the model with these inputs).
- Infrastructure, OTA, monitoring and payment fees together are under 5% of base opex; the cost model is a team-cost model.

### Gaps
- See gaps under Q1–Q6. The largest open items: Hüseyin Cengiz's commercial terms, Teknopark/Ar-Ge incentives, exact SMMM tariff amounts, official iyzico/PayTR rates, and any Turkish GPU or Turkish cloud price list published by Türk Telekom, Turkcell or Radore.

# Revenue model and unit economics of a Turkey-origin strategy-planning SaaS (as of 15 November 2026)

Scope: (A) can the vendor make money (cost per tenant, AI cost, mobile cost, pricing, open-source model, benchmarks, scenarios), and (B) can the customer show measurable financial value (ROI). Research date: 15 November 2026. All "seen" dates below are 15 November 2026 unless stated.

This note builds on four earlier files and does not repeat them in full:
- `reports/Hedef kitle ICP ve personalar.md` (ICP: Turkish family-owned firm, 50 to 499 employees, one bounded money-bearing decision; founders free or cheap; consultants as channel).
- `research_notes/Hedef kitle ICP ve AI konumlandırma/pazar_ve_rakipler.md` (competitor prices).
- `research_notes/Hedef kitle ICP ve AI konumlandırma/ai_mevzuat_guven_maliyet.md` (AI model prices and per-task cost estimates).
- `research_notes/Hedef kitle ICP ve AI konumlandırma/hedef_kitle_segmentleri.md` (TÜİK firm counts, cloud adoption by size, Logo price list, TL depreciation).

**Exchange rates used throughout.** TCMB indicative selling rates of 11 November 2026: USD/TRY 50.2282 and EUR/TRY 55.9810 — [Foreks, TCMB rates 11 Nov 2026](https://www.foreks.com/haber/detay/6af45fcc5f5f43016edfe8dc/FRKS/tr/tcmbnin-belirledigi-alis-satis-kurlari-dolar-50-1379-50-2282-euro-55-8804-55-9810-11-11-26/). Implied EUR/USD = 1.1145. Rounded in text: 1 USD = 50.2 TL, 1 EUR = 56.0 TL. TCMB rates for 12 to 15 November were not found. For context, USD/TRY was 42.85 on 31 December 2025 and 48.21 on 2 September 2026 — [erp-software.org](https://erp-software.org/en/erp-worldwide/turkey/). The lira therefore lost about 15% against the dollar between 31 December 2025 and 11 November 2026 (my calculation: 42.85 / 50.23).

**Label convention.** PUBLISHED = price on a vendor page. AGGREGATOR = third-party listing. ESTIMATE = my calculation from cited inputs. ASSUMPTION = a modelling input with no source; it must be tested.

---

## Q1. Cost per tenant: Frappe site and bench resources, sites per server, hosting prices, Turkey hosting, backups, monitoring, email, SSL, and site-per-tenant vs shared-database cost

### Takeaway
Raw compute for one small, low-traffic Frappe site on a shared bench is cheap: roughly USD 0.7 to 3.3 per tenant per month on a Hetzner dedicated-vCPU server, depending on how many sites fit (ESTIMATE). The real infrastructure cost is the fixed floor (control plane, database, staging, backups, monitoring), which is a few hundred USD per month regardless of tenant count. Hetzner raised cloud prices sharply in 2026 and has no Turkey data center; Turkish VDS listings look cheap but are aggregator data with unclear SLAs.

### Cited Findings

**Frappe memory and sizing (official and forum)**
- Frappe Cloud docs: a new bench uses "around 400 MB (appx.)" of memory at minimum, with 2 gunicorn workers and one set of background workers. "Only 2 workers is enough for a bench with small sites who don't get a lot of concurrent requests." The docs warn against adding too many benches to a server with "only 4 GB total RAM available". They give no maximum sites per server. — [Frappe Cloud, guidelines for choosing a server plan](https://docs.frappe.io/cloud/servers/guidelines-for-choosing-a-server-plan)
- Same doc: database server rule of thumb is RAM equal to total database size (example: 16 GB RAM for a 17 GB database). Database servers need memory more than CPU. — [Frappe Cloud docs](https://docs.frappe.io/cloud/servers/guidelines-for-choosing-a-server-plan)
- Frappe Cloud's per-bench memory budget formula (per search summary of its docs): memory_high = 512 MB + (gunicorn workers × 150 MB) + (background worker sets × 240 MB). — [Frappe Cloud, control resources allocated for site](https://docs.frappe.io/cloud/control-resources-allocated-for-site). Not re-fetched; taken from search summary.
- Forum: for a 32 GB / 4 CPU server, "between 3 and 30 sites" depending on traffic and data size (ERPNext context). One user reports 2,000+ sites on one server, most inactive; another ran about 300 mostly active sites on one server. An informal rule of one ERPNext site per 2 GB RAM also circulates. — [discuss.frappe.io, how many sites can my server handle](https://discuss.frappe.io/t/how-many-sites-can-my-server-handle-efficiently/142670); [discuss.frappe.io, multi sites how many](https://discuss.frappe.io/t/multi-sites-how-many/7712). These are community opinions, not benchmarks.

**Frappe Cloud public prices (PUBLISHED, seen 15 Nov 2026)**
- Site plans (shared compute) start at USD 5/month (INR 410). Included: offsite backups, monitoring, custom domains, custom app deployment, multiple environments, SSH, "Product Warranty". Per-tier CPU, RAM and storage limits were not shown on the page fetched. — [Frappe Cloud pricing](https://frappe.io/cloud/pricing)
- Server plans (own VM, unlimited sites and benches) start at USD 40/month (INR 3,600). — [Frappe Cloud pricing](https://frappe.io/cloud/pricing)
- Frappe Cloud positions Hetzner for development, testing and demos, and recommends AWS or OCI dedicated instances for mission-critical production. 14-day trial; prepaid wallet or card. — [Frappe Cloud pricing](https://frappe.io/cloud/pricing)

**Hetzner prices (PUBLISHED, seen 15 Nov 2026, EUR/month excl. VAT)**
- Dedicated vCPU (CCX, AMD), Germany NBG1 / Finland HEL1: CCX13 2 vCPU 8 GB 80 GB EUR 43.49 / 36.99; CCX23 4 vCPU 16 GB 160 GB EUR 86.49 / 73.49; CCX33 8 vCPU 32 GB 240 GB EUR 138.99 / 117.99; CCX43 16 vCPU 64 GB EUR 276.49 / 234.99. IPv4 included in the shown price; backups "starting at" EUR 1.098/month, related to instance. — [Hetzner general purpose](https://www.hetzner.com/cloud/general-purpose)
- Shared plans start from EUR 5.49 (Regular Performance) and EUR 5.99 (Cost-Optimized, shown "currently not available"). Locations: Falkenstein and Nuremberg (Germany), Helsinki (Finland), Hillsboro and Ashburn (USA), Singapore. No Turkey location. — [Hetzner cloud](https://www.hetzner.com/cloud)
- 2026 repricing: Hetzner repriced cloud in June 2026; increases reported at about 33–38% for CX/CAX and 113–176% for CPX/CCX. CX23 cited at EUR 3.99 → 5.49; CPX22 at EUR 7.99 → 19.49 (one source EUR 19.99); CPX32 EUR 35.99. Cheap CX/CAX lines often "currently not available"; a "limited availability of cloud instances" notice since 26 June. Sources disagree on old baselines and on whether an April change happened. — [Findstack](https://findstack.com/resources/hetzner-price-increase-2026); [wz-it](https://wz-it.com/en/blog/hetzner-price-increase-june-2026-cpx-ccx-alternatives/); [Tom's Hardware](https://www.tomshardware.com/tech-industry/hetzner-to-raise-prices-by-up-to-37-percent-from-april-1). The official Hetzner price-adjustment page returned 404 when fetched, so exact official old-vs-new rows are NOT VERIFIED.
- IPv4 is charged at EUR 0.50/month on plans where it is separate (per Hetzner docs, cited by Findstack) — [Findstack](https://findstack.com/resources/hetzner-price-increase-2026).

**Turkey-hosted servers (AGGREGATOR, dates unclear)**
- 8 GB Turkey-located VDS listings range about 250–470 TL/month: Lunhost 4 core/8 GB 249.90 TL; Hosting Türkiye 6 CPU/8 GB Istanbul 300 TL; Ekiphost 6 core/8 GB 362.94 TL (+20% KDV); Netweb 4 CPU/8 GB Bursa 455 TL; Burti NET 4 vCPU/8 GB USD 37.09 excl. KDV. Turhost says it hosts in Türk Telekom Gayrettepe (Tier 3). — [karekod.org VDS comparison](https://www.karekod.org/blog/en-ucuz-vds-fiyatlari/); [hostingturkiye](https://www.hostingturkiye.com.tr/en/category/virtual-server); [whtop Ekiphost](https://www.whtop.com/plans/ekiphost.com/156580); [netweb](https://www.netweb.com.tr/vds-vps-sunucu); [whtop Burti](https://www.whtop.com/tr/plans/burtinet.com/143115); [whtop Turhost](https://www.whtop.com/tr/plans/turhost.com/135434). The 250–300 TL figures (about USD 5–6) look stale or promotional compared with Burti's USD 37; treat as unreliable.
- From earlier notes: KVKK cross-border transfer by standard contract requires notifying the Authority within 5 business days — [KVKK announcement](https://www.kvkk.gov.tr/Icerik/8170/Yurt-Disina-Kisisel-Veri-Aktariminda-Kullanilacak-Standart-Sozlesmelerde-Dikkat-Edilmesi-Gereken-Hususlara-Iliskin-Kamuoyu-Duyurusu) (cited in the ICP report). Hosting in Germany or Finland therefore adds a contract and notification step for each customer whose personal data is transferred.

### Inferences
- **Compute per tenant (ESTIMATE).** CCX23 Helsinki EUR 73.49 = USD 81.9. If one server holds 25 / 60 / 120 small strategy sites (pessimistic / base / optimistic ASSUMPTION), raw compute is USD 3.28 / 1.37 / 0.68 per tenant per month. Formula: server USD ÷ sites per server. A strategy tool has far fewer transactions than ERPNext, so the ERPNext forum figure (3–30 sites on 32 GB) is a conservative floor, not a ceiling.
- **Why sites are cheap on a shared bench.** Sites on one bench share the gunicorn and background workers, so the ~400 MB bench baseline is paid once per bench, not per site. The per-site cost is mainly its MariaDB database (buffer pool share, disk) and Redis keys. A bench per tenant would cost about 400–900 MB RAM per tenant (from the formula above), i.e. roughly 15–35 tenants per 16 GB server instead of 60+ (ESTIMATE).
- **Fixed floor (ASSUMPTION, base USD 300/month).** Frappe Press self-hosted needs its own control plane (Press site, agent, registry/build, log and monitoring servers) plus at least one app server, one DB server, staging and backup storage. On 2026 Hetzner prices that is plausibly USD 250–450/month before the first customer. This dominates infrastructure cost until roughly 100+ tenants.
- **Site-per-tenant vs shared-database multi-tenancy.** Frappe's native multitenancy is one database per site; a shared-schema design with a tenant column is not how Frappe works and would mean fighting the framework (my inference from Frappe's site model; not verified against a specific doc this session). Shared-DB would save perhaps USD 0.5–2 per tenant per month in RAM and disk (ESTIMATE), which is negligible against a price of USD 150–500. The real cost of site-per-tenant is operational: each nightly wave must run schema migrations per site, so deploy time grows linearly with tenants (for example 200 sites × 1–3 minutes = 3–10 hours of migrate time if serial; ESTIMATE). Site-per-tenant also gives easy per-customer backup, restore, data export, deletion (KVKK) and per-customer placement (Turkey server for one customer), which matches the ICP's data-location concerns. Conclusion: site-per-tenant is the right choice; its cost is ops time, not hardware.
- **Backups (ESTIMATE).** A small strategy site is likely under 1 GB with files; daily backups with 30-day retention on object storage are cents to tens of cents per tenant per month. Hetzner backups at EUR 1.098 are consistent with about 20% of a EUR 5.49 instance (my inference).
- **Monitoring, SSL, email (ESTIMATE).** Press includes monitoring; Let's Encrypt SSL is free; transactional email for a tenant with 5–20 users is a few hundred to a few thousand emails per month, which is cents with a bulk provider. Model these as USD 0.7–1.5 per tenant per month in total, including backups.
- **Turkey hosting** is a per-customer option, not the default: put the first customers who require Türkiye data residency on a Turkish VDS or Turkish data-center server at 2–4× Hetzner's per-site cost (ASSUMPTION) and charge a "Türkiye hosting" premium.

### Gaps
- Official Hetzner old-vs-new price table (page 404). Hetzner Storage Box and Object Storage 2026 prices not fetched.
- Frappe Cloud per-tier site plan limits (CPU hours, storage) and whether custom apps need a private bench on the cheapest tiers: the sites pricing page returned 404.
- No measured memory footprint for a Frappe 16 site with this app; must be measured (load test with 50 idle and 10 active sites).
- Enterprise Turkish cloud prices (Turkcell, Türk Telekom, Vodafone business cloud) not found.
- Transactional email provider prices not fetched this session.

---

## Q2. AI cost per tenant per month (light, typical, heavy) and AI pricing patterns

### Takeaway
At mid-tier model prices, AI costs a tenant roughly USD 3 (light), 18 (typical) and 60–105 (heavy) per month (ESTIMATE). That is affordable only if heavy use is capped: the market pattern in 2025–2026 is a plan with an included AI quota plus paid credits, not unlimited AI.

### Cited Findings
- Anthropic list prices per million tokens (input/output): Opus 5.5 USD 4/20; Sonnet 5.5 USD 2/10; Haiku 5.5 USD 0.10/0.50 (≤100k-token prompts); Batch API 50% off; cache hits 0.05× input; US-only inference 1.1×; partner-cloud regional endpoints +10%. — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing), as recorded in `ai_mevzuat_guven_maliyet.md` on 15 Nov 2026. Not re-fetched; still current per that note.
- Per-task estimates from the same note (ESTIMATE): drafting 10k in / 2k out on Sonnet 5.5 ≈ USD 0.04; red-teaming 20k / 3k ≈ USD 0.07; research synthesis 50k / 4k ≈ USD 0.14 (Opus ≈ USD 0.28); option generation 15k / 3k on Opus ≈ USD 0.12. Agentic research can use 10× more tokens; web search fees extra. — `ai_mevzuat_guven_maliyet.md`
- Pricing patterns: Perdoo includes 250k tokens/month (Premium) and 500k (Supreme) — [Perdoo pricing](https://www.perdoo.com/pricing). WorkBoard prices its agents by usage — [Business Wire, 27 May 2025](https://www.businesswire.com/news/home/20250527067665/en/WorkBoard-Announces-General-Availability-of-Its-Digital-Chief-of-Staff-and-Leadership-Coach-Agents-and-Expanded-Capabilities-for-Microsoft-365-Copilot-Agent). Metronome and Maxio surveys reportedly put the share of SaaS firms billing partly by usage at 64–67%; flat per-user AI add-ons are described as transitional — [Falkster](https://falkster.com/blog/the-credit-is-the-new-seat) (secondary).

### Inferences
- **Per-tenant monthly AI cost (ESTIMATE; one tenant = one company with 5–15 users working on one decision).**
  - Light: 30 tasks × USD 0.10 = USD 3.
  - Typical: 150 tasks × USD 0.12 = USD 18.
  - Heavy: 600 tasks × USD 0.15 = USD 90, plus 10 agentic research runs × USD 1.50 = USD 15, so about USD 105. With prompt caching of the company profile and framework, and routing simple steps to Haiku, heavy can fall to about USD 40–60.
  - Add 10% if routed via an EU regional endpoint.
- In the model below: AI cost per tenant = USD 60 (pessimistic, heavy and poorly cached), 18 (base), 10 (optimistic, caching plus Haiku routing).
- **Recommended pattern:** each plan includes an AI quota sized to "typical" use (for example 150 actions/month, about USD 18 of cost), with credit packs above that priced at 3–5× cost. Keep red-teaming and option generation inside the quota, because they are the product's core value; meter agentic research separately.
- AI usage is highest during formulation and drops during execution, so AI cost per tenant is front-loaded in the first 2–4 months of a decision.

### Gaps
- No real usage telemetry; task counts per tenant are assumptions.
- Self-hosted open-weight model cost in Türkiye (GPU rent) not researched; needed for customers that refuse cross-border AI.

---

## Q3. Mobile and OTA update costs

### Takeaway
Mobile and OTA costs are small and fixed: about USD 99/year for Apple, USD 25 once for Google, and USD 9–39/month for an OTA service at this scale. They do not change the unit economics.

### Cited Findings
- Apple Developer Program: USD 99 per membership year (local-currency pricing varies); Enterprise Program USD 299/year. Google Play: one-time USD 25 registration. First year ≈ USD 124, later years USD 99. — [Adalo guide 2026](https://studio.adalo.com/blog/apple-developer-program-guide); [Capgo guide](https://capgo.app/blog/how-to-create-apple-developer-and-google-play-developer-accounts/); [ilab.md 2026](https://ilab.md/en/articles/publishing-on-the-app-store-and-google-play-in-2026-timelines-costs-and-7-hidden-requirements-that-could-derail-your-launch). Secondary sources; Apple's and Google's own pages were not fetched.
- Capgo (PUBLISHED, seen 15 Nov 2026): Solo USD 14/month (USD 146/year), 2,000 MAU, 100 GiB bandwidth; Maker USD 39/month (USD 396/year), 10,000 MAU; Team USD 99/month, 100,000 MAU; Enterprise USD 249+/month; pay-as-you-go credits (MAU USD 3 per 1,000 for the first 1M). Solo has 15–50% purchasing-power discounts by country. FAQ: "the whole stack is open source so you can self-host at any time". — [Capgo pricing](https://capgo.app/pricing/)
- Capawesome Cloud (PUBLISHED, seen 15 Nov 2026): Live Updates only: Starter USD 9/month (1K MAU), Professional USD 29 (10K MAU), Team USD 79 (50K MAU). Platform plans with native builds: Starter USD 19 (1K MAU, 200 build minutes), Professional USD 49 (10K MAU, 500 build minutes). No per-unit overage; upgrade or wait for reset. — [Capawesome pricing](https://capawesome.io/cloud/pricing/)

### Inferences
- At 100 customers × 10 users = 1,000 MAU, OTA costs USD 9–14/month; at 200 customers × 15 users = 3,000 MAU, USD 29–39/month. Model as a fixed USD 25/month including the Apple fee spread over 12 months (ESTIMATE).
- Hidden cost is not fees but work: two store reviews per native release, a Mac for iOS builds (or Capawesome build minutes), and offline-sync testing. This is engineering time inside fixed opex.

### Gaps
- Apple/Google official pages not fetched; Turkish-lira Apple pricing not checked.

---

## Q4. B2B SaaS benchmarks 2024–2026: gross margin, CAC payback, churn, NRR, sales cycle, services share

### Takeaway
Typical private B2B SaaS medians are about 75% gross margin, 16–18 months CAC payback, about 90% gross revenue retention and just above 100% net retention. SMB products with low ARPA retain far worse: NRR above 100% is rare below USD 500/month ARPA, and annual logo churn of 10–15% is a median for SMB. Most of these figures come from secondary summaries and need checking against primary reports.

### Cited Findings
- KeyBanc Capital Markets / Sapphire Ventures 2025 private SaaS survey (published 13 November 2025): companies maintaining gross retention near 90% and net retention above 100%; projected 2025 ARR growth 20% vs 15% in 2024 (secondary coverage). — [Sapphire Ventures survey page](https://info.sapphireventures.com/2025-keybanc-capital-markets-sapphire-ventures-saas-survey); [finanzen.net press release](https://www.finanzen.net/nachricht/aktien/private-saas-company-survey-reveals-ai-driven-transformation-and-sustained-operational-excellence-15273776). Exact gross-margin and CAC-payback medians from the PDF were NOT obtained.
- Benchmarkit: median B2B SaaS CAC payback 16 months in 2025 vs 18 months in 2024 (per search summary). — [azbigmedia, citing Benchmarkit](https://azbigmedia.com/business/why-b2b-saas-companies-are-losing-the-paid-acquisition-game-in-2026/). Secondary.
- Median gross margin 75% (all B2B), compiled from several sources. — [SaaSRise benchmark report 2026](https://saasrise.com/blog/saas-benchmark-report-2026). Secondary compilation.
- ChartMogul (primary, inaugural retention report, 2,100+ companies): only 2.7% of businesses with ARPA < USD 10/month have NRR > 100%, vs 41.1% of those with ARPA > USD 500/month. Top-quartile NRR: 65.1% for ARPA < USD 10; 109.3% for ARPA > USD 500 or ACV > USD 6,000. — [ChartMogul SaaS Retention Report](https://chartmogul.com/saas-retention-report/)
- ChartMogul 2024 "New Normal" report (2,500+ companies), per secondary summary: for ARPA USD 250–500, median NRR 88% on annual plans vs 76% on monthly plans. — [ChartMogul, The New Normal for SaaS](https://chartmogul.com/reports/saas-retention-the-new-normal/) (figure from secondary summary; not verified in the PDF).
- Annual logo churn by segment, attributed to ChartMogul 2025 (n=1,400+) by a secondary site: SMB (ACV USD 1K–10K) 10–14%, mid-market (USD 10K–50K) 5–8%, enterprise 2–5%. Another source: SMB 15%, mid-market 10%, enterprise 5%. — [churnrecovery](https://churnrecovery.pages.dev/posts/B2B-SaaS-Churn-Benchmarks-2025); [genesysgrowth](https://genesysgrowth.com/blog/saas-churn-rates-stats-for-marketing-leaders). UNVERIFIED against ChartMogul.
- Sales cycles: SMB sales-led deals < USD 25K ACV 30–60 days; mid-market USD 25K–100K 90–120 days; overall B2B SaaS average 84 days; selling to 100–999-employee firms 3–4 months. — [The Digital Bloom](https://thedigitalbloom.com/learn/pipeline-performance-benchmarks-2025/); [saashero](https://www.saashero.net/strategy/pipeline-generation-industry-benchmarks/). Vendor blogs; directional.
- Frappe Cloud self-reports "revenue churn is at 2% per month" (about 22% per year compounded; my calculation) — [Frappe partner guide, updated 31 March 2026](https://docs.frappe.io/partner-guide/about-frappe.md).

### Inferences
- With an ACV of USD 1.8K–6K this product sits in the SMB band by ACV, even though the customer is mid-sized by headcount. Expect SMB-like churn unless the product survives the end of the first decision.
- **Specific churn risk:** the ICP buys for "one bounded decision". When the decision is made and executed, the reason to pay can end. The earlier notes already flag that founder demand is event-driven. A decision-per-subscription model therefore needs a second decision or the execution cluster (targets, reviews) to keep the logo. Pessimistic logo churn is set to 40%/year for this reason (ASSUMPTION).
- Annual prepaid contracts help: ChartMogul's annual-vs-monthly gap (88% vs 76% NRR at USD 250–500 ARPA) supports annual billing in TL with yearly indexation.
- Services share: no benchmark found. Frappe's own history (a decade of revenue from implementation, customisation, training and support) shows services can carry an open-source vendor early, but they lower gross margin — [Frappe, business model evolution](https://frappe.io/blog/erpnext-stories/business-model-evolution-at-frappe).

### Gaps
- Primary KeyBanc/Sapphire medians (gross margin, CAC payback, services revenue %) not extracted; PDF needs a form download.
- No Bessemer, OpenView or Pavilion figure verified this session. OpenView stopped publishing after its 2023 wind-down (my knowledge; not verified this session).
- No Turkish SaaS churn or CAC data found.

---

## Q5. Pricing models, competitor prices, Turkish B2B SaaS price levels in TL, annual TL updates, willingness-to-pay methods

### Takeaway
Competitors split into cheap per-seat OKR tools (EUR 6–10 per user per month) and quote-only strategy suites (USD 25K–150K per year). Turkish SMB SaaS anchors are low (Paraşüt about 670–940 TL per month), and local vendors reprice TL lists every year. A per-company, per-active-decision tier with unlimited viewers, an included AI quota and annual TL indexing fits the ICP best; the price point must be tested with Van Westendorp plus Gabor-Granger on 15–30 buyer interviews, not assumed.

### Cited Findings
- Competitors (from `pazar_ve_rakipler.md`): Perdoo EUR 6.40–8.00/user/month, view-only EUR 1.50 — [Perdoo](https://www.perdoo.com/pricing); Mooncamp EUR 7–10/user/month, minimum 5 users — [Mooncamp](https://mooncamp.com/pricing); median public OKR starting price USD 8/user/month (13 of 23 platforms publish) — [Tability](https://www.tability.io/compare/pricing/cascade); Cascade about USD 25,000/year for 50 users (ESTIMATE by ITQlick) — [Tability](https://www.tability.io/compare/pricing/cascade); WorkBoard median USD 57,040/year (Vendr, n=10) — [Vendr](https://www.vendr.com/marketplace/workboard); LivePlan USD 15–40/month — [LivePlan](https://www.liveplan.com/pricing).
- Paraşüt (PUBLISHED, page date not shown): e-Fatura + Ön Muhasebe 752 TL/month + KDV (9,024 TL/year); e-Fatura + Ticari İşletme 940 TL/month + KDV (11,280 TL/year); Makbuzlu 670 TL/month + KDV (8,040 TL/year); annual billing cheaper than monthly. — [Paraşüt prices](https://www.parasut.com/on-muhasebe-fiyatlari); [Paraşüt makbuzlu](https://www.parasut.com/on-muhasebe-fiyatlari/makbuzlu); [Paraşüt LP](https://www.parasut.com/lp-vole). It was not possible to confirm these are 2026 figures.
- Kolay İK: per-employee monthly pricing, each product a separate subscription, monthly packages allowed, 15-day trial; no TL figures published (quote only). — [Kolay İK pricing page](https://kolayik.com/insan-kaynaklari-yazilimi-fiyatlari); [Kolay İK demo](https://kolayik.com/demo-talep)
- Logo resets its TL price list each year on 7 January; Tiger 3 Enterprise costs 817,900 TL for one user (2026 list, before KDV). Logo budgets 23% inflation for end-2026. Global vendors price in USD/EUR (Business Central Essentials USD 80/user/month; Odoo from EUR 19.90/user/month). — [erp-software.org](https://erp-software.org/en/erp-worldwide/turkey/) (from `hedef_kitle_segmentleri.md`).
- Paid cloud use in Turkey: small firms 17.3%, medium 31.8%, large 54.3% — [erp-software.org citing TÜİK](https://erp-software.org/en/erp-worldwide/turkey/).
- Willingness-to-pay methods: Van Westendorp (four price-perception questions; gives an acceptable range) and Gabor-Granger (purchase likelihood at set prices; gives a demand curve and revenue-maximising price). Vendor guides suggest 200–500 respondents per segment, and recommend combining both with real behaviour. B2B caveats: hard to reach sample sizes; must survey the financial decision-maker, not only users. — [Prospeo GTM pricing guide](https://prospeo.io/s/go-to-market-pricing-strategy); [CleverX](https://cleverx.com/blog/enterprise-b2b-willingness-to-pay-setting-and-defending-price); [QuestionPro webinar](https://2019ac-the-opioid-epidemic.questionpro.com/webinar/pricing-research-webinar-introduction-and-tools.html); [Non-Linear VC / Alex David](https://nonamevc.substack.com/p/everything-you-wanted-to-ask-about); [Monetizely](https://www.getmonetizely.com/articles/how-to-conduct-effective-pricing-research-methods-and-best-practices). Rules of thumb, not standards.

### Inferences
- **Per seat is a poor fit.** The buying group is small (genel müdür, CFO or corporate development, stratej, 3–10 team members) and viewers should be unlimited (Cascade's model). Per-seat at EUR 8 × 10 users = EUR 80/month would anchor the product against cheap OKR tools.
- **Recommended structure (ASSUMPTION, to test):**
  1. "Kurucu" tier: free or about 490 TL/month, one user, browser only, small AI quota.
  2. "Karar" tier: per company, one active decision, up to about 15 named editors, unlimited viewers, included AI quota; base 15,000 TL/month (≈ USD 300) billed annually (≈ 180,000 TL/year ≈ USD 3,600).
  3. "Şirket" tier: several concurrent decisions plus the execution cluster (targets, initiatives, resource permits, reviews); 25,000–40,000 TL/month.
  4. Add-ons: Türkiye data hosting, extra AI credits, onboarding package (one-time, for example 50,000 TL), consultant workspace.
- The Karar tier is about 16–20× Paraşüt's monthly price. The justification must be the decision's money at stake (Q7), not software feature parity.
- **TL indexing.** With about 15% lira depreciation in 10.5 months of 2026 and a 23% inflation budget at Logo, annual contracts should index yearly (on the Logo pattern) or be quoted in USD/EUR with a TL invoice. Otherwise a 3-year TL contract loses 30–40% of real value (ESTIMATE).
- **WTP testing at this stage.** 200–500 survey respondents is not reachable for a named-account ICP. Use Van Westendorp's four questions inside the 15–30 buyer interviews planned in the ICP report, then Gabor-Granger at three price points (for example 9,000 / 15,000 / 25,000 TL per month), and validate with paid pilots.

### Gaps
- Kolay İK, Mikro, BordroPlus and Logo cloud (Logo İşbaşı, etc.) monthly TL prices not found this session.
- No data on what Turkish mid-sized firms pay for comparable management software (BI, budgeting, board portals).

---

## Q6. Open-source business models and what a public repo implies

### Takeaway
For a public repository, revenue must come from the hosted service, support/warranty and services, not from the code. Real examples (Frappe/ERPNext, Plausible, Sentry, Odoo, Cal.com) show three workable paths: fully open plus hosting (Frappe, Plausible on AGPL), delayed-open "fair source" (Sentry on FSL), and open core with proprietary extras (Odoo, GitLab). The license choice belongs to the owner and must be decided before the first external contribution.

### Cited Findings
- Frappe: for almost a decade revenue came from implementation, customisation, training and support around ERPNext; it moved to hosting (Frappe Cloud, launched 2019) and shares marketplace revenue with app developers; uses usage-based rather than per-seat pricing. — [Frappe, business model evolution](https://frappe.io/blog/erpnext-stories/business-model-evolution-at-frappe); [Frappe, building a self-sustaining open-source business](https://frappe.io/blog/community/building-a-self-sustaining-open-source-business)
- Frappe partner guide (updated 31 March 2026, self-reported): "Frappe Cloud MRR is $5Mn, growing at 50% YoY"; revenue churn 2%/month; 16,000+ sites hosted; 200+ partners; 100K+ GitHub stars. The same page lists MRR by territory summing to about USD 437,000, which contradicts USD 5M MRR (the USD 5M is more plausibly ARR; unresolved). — [Frappe partner guide](https://docs.frappe.io/partner-guide/about-frappe.md)
- Rainmatter (Zerodha) invested USD 1.35M (INR 10 crore) in Frappe, announced November 2020. — [Frappe announcement](https://frappe.io/blog/announcements/frappe-zerodha); [YourStory](https://yourstory.com/2020/11/funding-rainmatter-capital-investment-erpnext-foss-open-source-project)
- ERPNext is GPL-3.0 free software — [Wikipedia, ERPNext](https://www.wikipedia.com/wiki/ERPNext). Frappe Framework is MIT-licensed per its GitHub repository (my knowledge; NOT re-fetched this session).
- Plausible: open core, some features exclusive to its managed hosting business plan; AGPL; a secondary wiki says Ghost and Plausible earn over 99% of revenue from managed hosting. — [Plausible, Community Edition](https://ingest.plausible.io/blog/community-edition); [Plausible, open-source licenses](https://ingest.plausible.io/blog/open-source-licenses); [devon-wiki](https://devon-wiki.pages.dev/research/oss-business-models) (secondary).
- Sentry: BSL from 2019 to 2023, then Functional Source License (FSL), which converts to open source after 2 years (BSL default 4 years); hosted service is the revenue path. — [Armin Ronacher, FSL vs AGPL](https://lucumr.pocoo.org/2024/9/23/fsl-agpl-open-source-businesses/); [TechCrunch, fair source](https://techcrunch.com/2024/09/22/some-startups-are-going-fair-source-to-avoid-the-pitfalls-of-open-source-licensing/?rand=23331)
- BSL, SSPL, Elastic 2.0 and Commons Clause exist mainly to stop others reselling the project as a managed service; BSL and SSPL are not OSI-approved. — [ossalt guide 2026](https://ossalt.com/guides/open-core-vs-source-available-business-models-2026); [TechCrunch timeline](https://techcrunch.com/2024/12/15/open-source-companies-that-go-proprietary-a-timeline)
- Cal.com does not capture revenue from self-hosters; it hopes open-source traction leads to large company deals. — [devon-wiki](https://devon-wiki.pages.dev/research/oss-business-models) (secondary).
- Odoo: Community Edition LGPL-3.0; Enterprise Edition proprietary, usable only with a paid subscription per user. — [Odoo licenses documentation](https://www.odoo.com/documentation/master/legal/licenses.html)

### Inferences
- **What a public repo implies here.** The likely buyer (a Turkish family firm) will not self-host Frappe; it lacks the IT staff. So the public repo mainly risks (a) a Turkish IT integrator or consultant hosting it for clients, and (b) a foreign competitor reusing the strategy method. The method's value is in content and process, which competitors can copy from a public repo anyway.
- **License options and effects (owner to decide; no choice made here):**
  - MIT / Apache: maximum adoption; anyone can run a competing hosted service with no obligation.
  - GPL-3.0 (like ERPNext): no obligation for network use, so a host can modify and run it without sharing changes.
  - AGPL-3.0 (+ commercial license): hosts must publish modifications; deters closed forks; still OSI open source. Fits the owner's open-source preference best.
  - FSL / BSL: blocks competing hosted use for 2–4 years, then becomes open; not OSI open source during that time.
  - Open core: core open, some modules (for example the consultant multi-client workspace, SSO, Türkiye-hosting automation, AI red-team packs) proprietary.
- If the app depends on Frappe Framework (MIT) only, the app can carry any of these licenses; if it imports ERPNext (GPL-3.0) code, GPL compatibility rules apply (inference; check with a lawyer).
- **Revenue implication:** price the hosted service, the warranty/support, the AI quota and the onboarding, not access to code. The consultant channel can be formalised as Frappe does (partners plus marketplace revenue share).
- Public repos must keep secrets, real `.env` files and customer data out of source (owner's standing rule), which also supports per-customer site isolation.

### Gaps
- GitLab CE/EE license details and revenue split not fetched this session.
- No data on how often Frappe-based apps are re-hosted by third parties.
- Legal review of AGPL/FSL enforceability in Türkiye not done.

---

## Q7. Customer ROI: financial value of better strategic decisions and planning; consulting price anchor in Turkey

### Takeaway
The best evidence links decision process quality to returns: in 1,048 major decisions, moving from bottom to top quartile on process quality was associated with about 6.9 percentage points higher ROI (McKinsey, Lovallo and Sibony). For a bounded decision worth tens of millions of TL, even a small fraction of that effect exceeds a 180,000 TL annual subscription. The evidence is correlational and self-reported; ROI must be shown per customer with a before-and-after record, not claimed.

### Cited Findings
- Lovallo and Sibony (McKinsey Quarterly, 2010) studied 1,048 major decisions over five years (new products, M&A, large capex). After controls, process mattered more than analysis by a factor of six (variance explained). Moving from bottom to top quartile on process improved ROI by 6.9 percentage points; for analytics the gap was 5.3 points. ROI data covered 673 of the 1,048 decisions. — [McKinsey, The case for behavioral strategy](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-case-for-behavioral-strategy); [Farnam Street summary](https://fs.blog/2013/03/what-matters-more-in-decisions-analysis-or-process/)
- Kahneman, Lovallo and Sibony (HBR 2011) cite the same research as returns up to seven percentage points higher when bias was reduced in the decision process. — [HBR 2011 "Before you make that big decision", PDF copy](https://faculty.washington.edu/pathaksd/BBUS549/Required%20Readings/Before%20You%20Make%20that%20Big%20Decision.pdf)
- McKinsey 2019 survey "Decision making in the age of urgency": "winning" organizations (about 20% of respondents) are twice as likely to report returns of at least 20% from their most recent big-bet decision; only 37% say their decisions are both high quality and fast; 61% say most decision time is used ineffectively. Self-reported. — [McKinsey, Decision making in the age of urgency](https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/decision-making-in-the-age-of-urgency)
- PMI Pulse of the Profession: organizations wasted USD 99 million per USD 1 billion invested in projects in 2018 (9.9%); USD 97M (2017), USD 122M (2016), USD 109M (2014). In 2015 low performers wasted about USD 250M per billion vs about USD 20M for high performers. 2018 report links this to failure to bridge "strategy design and delivery". — [PMI Pulse 2018 PDF](https://zephrcf.leaddev.com/wp-content/uploads/2020/12/pulse-of-the-profession-2018.pdf); [PMI, the high cost of low performance 2014](https://www.pmi.org/learning/library/2022/11/02/21/05/es-2014-the-highcost-13551); [Western Digital mirror of 2018 media release](https://blog.westerndigital.com/wp-content/uploads/2022/10/pdf-post25167-Pulse-of-the-Profession-2018-Media-Release.pdf). No 2025/2026 edition figure found.
- Founders who write a formal plan are 16% more likely to reach viability (Greene and Hopp, 1,088 founders) — [Irish Times / HBR](https://www.irishtimes.com/business/work/entrepreneurs-who-write-formal-business-plans-are-16-more-likely-to-achieve-viability-1.3159045) (from earlier notes).
- A randomised experiment with 640 Kenyan entrepreneurs found an AI advisor lowered weaker entrepreneurs' revenue by about 8% — [Berkeley Haas](https://newsroom.haas.berkeley.edu/research/gen-ai-experiment-shows-mixed-results-in-helping-small-businesses-grow/) (from earlier notes). AI without structure can destroy value.
- Turkish consulting price anchor: no published TL day rates or strategic-plan project prices were found. Armut lists 778 company consultants with quote-only pricing. — [Armut, şirket danışmanlığı](https://armut.com/sirket-danismanligi). KOSGEB digital-transformation loans (1–20 million TL, interest-free) exclude consulting — [erp-software.org](https://erp-software.org/en/erp-worldwide/turkey/).

### Inferences
- **ROI illustration (ESTIMATE, not a claim).** A family firm evaluating a 50 million TL investment (for example a new export market or plant). If the structured process (evidence gate, options, red-teaming, trade-offs, resource permits) improves the decision's ROI by just 1 percentage point, one-seventh of Lovallo and Sibony's top-vs-bottom gap, that is 500,000 TL per year. Base Karar price is 180,000 TL/year, so ROI ≈ 2.8×. Formula: ROI = (investment × ΔROI points) ÷ annual price. At 20 million TL and 1 point: 200,000 ÷ 180,000 ≈ 1.1× (break-even). Hence a qualifying rule: sell only where the decision's money at stake is at least about 20–30 million TL.
- **Second value source: avoided execution waste.** If roughly 10% of project investment is wasted (PMI), resource permits and reviews that cut that by one-tenth on a 50 million TL programme save about 500,000 TL (ESTIMATE using PMI's 9.9%).
- **Third value source: consultant time.** If the tool lets a consultant deliver the same strategy work in fewer days, the customer saves fees. No Turkish fee data exists in these notes, so this must come from the buyer interviews ("what did your last strategy engagement cost?").
- **How to make ROI measurable per customer:** record at the readiness gate the money at stake, the baseline plan, and the expected value; at reviews record actual spend vs permits and milestone dates. This turns the product's own record into an ROI report, which is also the main renewal argument.
- The evidence is about large firms (McKinsey samples) and is correlational. Do not promise percentage returns in sales material.

### Gaps
- No Turkish data on strategy consulting fees, day rates or engagement sizes.
- No study measuring ROI of strategy software (as opposed to decision process quality).
- No data on typical money-at-stake per strategic decision in Turkish 50–499-employee firms.

---

## Q8. Scenarios for year 1 and year 3: customers, price, cost per tenant, AI cost, gross margin, break-even

### Takeaway
The model makes money in the base and optimistic cases, and fails in the pessimistic case. Hosting is never the problem: hosting and AI gross margin is about 86–97% when the price is at least USD 300 per company per month and AI is capped. What kills it is a low price (about USD 150) combined with uncapped AI, hands-on support of 4 hours per customer per month and 40% annual churn. In the base case the business needs about 100 paying companies to cover a USD 20,000 monthly team cost; it reaches 80 in year 3, so it is near but not at break-even.

### Cited Findings
- Inputs come from Q1 to Q7: Hetzner CCX23 Helsinki EUR 73.49/month — [Hetzner](https://www.hetzner.com/cloud/general-purpose); AI per-task prices — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing); OTA prices — [Capgo](https://capgo.app/pricing/), [Capawesome](https://capawesome.io/cloud/pricing/); SMB churn 10–15% median (unverified) — [churnrecovery](https://churnrecovery.pages.dev/posts/B2B-SaaS-Churn-Benchmarks-2025); 75% median SaaS gross margin — [SaaSRise](https://saasrise.com/blog/saas-benchmark-report-2026); exchange rates — [Foreks/TCMB](https://www.foreks.com/haber/detay/6af45fcc5f5f43016edfe8dc/FRKS/tr/tcmbnin-belirledigi-alis-satis-kurlari-dolar-50-1379-50-2282-euro-55-8804-55-9810-11-11-26/).
- Everything else in this section is ASSUMPTION or ESTIMATE. The model script was run on 15 November 2026 (Python, numbers below are its output).

### Inferences

**Formulas**
- Compute per tenant = server cost USD ÷ sites per server. Server = EUR 73.49 × 1.1145 = USD 81.91.
- Variable cost per tenant (hosting + AI) = compute + other (backups, email, monitoring) + AI.
- Variable cost incl. support = above + support (hours × USD 25/hour, ASSUMPTION).
- Gross margin (hosting-only) = (MRR − N × variable hosting+AI − fixed infra − mobile) ÷ MRR.
- Gross margin (incl. support) = same, also minus N × support.
- Channel cost = ARPA × share of customers via consultants × commission (treated as sales cost, not COGS).
- Contribution per customer = ARPA × (1 − channel rate) − variable cost incl. support.
- Break-even customers = (fixed team opex + fixed infra + mobile) ÷ contribution per customer.
- Lifetime (years) = 1 ÷ annual logo churn. LTV = contribution × 12 × lifetime. CAC payback (months) = CAC ÷ monthly contribution.

**Assumptions per scenario** (all ASSUMPTION unless marked)

| Input | Pessimistic | Base | Optimistic |
|---|---|---|---|
| Price (ARPA) per company per month | USD 150 (≈ 7,530 TL) | USD 300 (≈ 15,070 TL) | USD 500 (≈ 25,110 TL) |
| Sites per CCX23 server | 25 | 60 | 120 |
| Compute per tenant (ESTIMATE) | USD 3.28 | USD 1.37 | USD 0.68 |
| Backups, email, monitoring per tenant | USD 1.50 | USD 1.00 | USD 0.70 |
| AI cost per tenant (ESTIMATE, Q2) | USD 60 | USD 18 | USD 10 |
| Support per tenant (hours × USD 25) | 4 h = USD 100 | 2 h = USD 50 | 1 h = USD 25 |
| Fixed infra (control plane, DB, staging) | USD 450 | USD 300 | USD 250 |
| Mobile and OTA fixed (ESTIMATE, Q3) | USD 25 | USD 25 | USD 25 |
| Customers via consultants × commission | 60% × 25% = 15% | 50% × 20% = 10% | 40% × 20% = 8% |
| Annual logo churn | 40% | 25% | 12% |
| Paying customers, end of year 1 | 5 | 15 | 30 |
| Paying customers, end of year 3 | 25 | 80 | 200 |
| Fixed team and tools opex per month, year 1 | USD 6,000 | USD 6,000 | USD 6,000 |
| Fixed team and tools opex per month, year 3 | USD 20,000 | USD 20,000 | USD 20,000 |

Team opex is the least researched and most decisive input: USD 6,000/month is roughly a founder plus one developer in Türkiye; USD 20,000/month is a team of about 5–6. Salary data was not researched.

**Results (model output)**

| Result | Pessimistic | Base | Optimistic |
|---|---|---|---|
| Variable cost per tenant, hosting + AI | USD 64.78 | USD 20.37 | USD 11.38 |
| Variable cost per tenant incl. support | USD 164.78 | USD 70.37 | USD 36.38 |
| Contribution per customer per month | −USD 37 | USD 200 | USD 424 |
| Year 1 MRR / ARR | USD 750 / 9,000 (0.45M TL) | USD 4,500 / 54,000 (2.71M TL) | USD 15,000 / 180,000 (9.04M TL) |
| Year 1 gross margin, hosting-only | −7% | 86% | 96% |
| Year 1 gross margin incl. support | −73% | 69% | 91% |
| Year 1 monthly operating result | −USD 6,661 | −USD 3,330 | +USD 6,434 |
| Year 3 MRR / ARR | USD 3,750 / 45,000 (2.26M TL) | USD 24,000 / 288,000 (14.47M TL) | USD 100,000 / 1.2M (60.27M TL) |
| Year 3 gross margin, hosting-only | 44% | 92% | 97% |
| Year 3 gross margin incl. support | −23% | 75% | 92% |
| Break-even customers, year 1 cost base | never (negative contribution) | 32 | 15 |
| Break-even customers, year 3 cost base | never | 102 | 48 |
| Year 3 monthly operating result | −USD 21,407 | −USD 4,354 | +USD 64,448 |
| Customer lifetime | 2.5 years | 4.0 years | 8.3 years |
| LTV (contribution) | negative | USD 9,582 | USD 42,362 |
| Max CAC at LTV:CAC 3:1 | none | USD 3,194 | USD 14,121 |
| CAC payback if CAC = 1 × ACV | never | 18.0 months | 14.2 months |

**Break-even price sensitivity (ESTIMATE).** Price needed to break even = (fixed ÷ N + variable incl. support) ÷ (1 − channel rate):
- Base cost structure: USD 547 at 15 customers (year 1 cost base), USD 360 at 80 customers, USD 191 at 200 customers (year 3 cost base).
- Pessimistic cost structure with AI capped at USD 15 and support at 2 hours: USD 578 at 15, USD 381 at 80, USD 202 at 200 customers. At USD 150 the contribution is only about USD 58, so break-even needs about 355 customers.

**Conditions under which it makes money**
1. Price at least about USD 300 (15,000 TL) per company per month on annual prepaid TL contracts with yearly indexing, justified by a decision with at least about 20–30 million TL at stake (Q7).
2. AI capped by an included quota plus paid credits (Q2); heavy uncapped AI alone moves AI cost from USD 18 to USD 60 per tenant.
3. Support and onboarding held to about 2 hours per customer per month, mainly by having the consultant (stratej role) do hand-holding, and charging a one-time onboarding fee.
4. Retention beyond the first decision: annual logo churn at or below about 25%, which requires a second decision or adoption of the execution cluster.
5. Roughly 100 paying companies to carry a 5–6 person team. With TÜİK-derived counts of tens of thousands of mid-sized firms (from `hedef_kitle_segmentleri.md`), 100 is under 1% of the market, but reaching it through named-account sales with 60–120-day cycles (Q4) is the real constraint.

**What kills it**
- Pricing near OKR tools or Turkish SMB tools (USD 15–150/month): contribution goes to zero once AI and support are counted.
- Event-driven churn: the customer leaves when the decision is made (40% churn halves lifetime vs base).
- Unlimited AI and a free founder tier that consumes AI without converting.
- Services creep: bespoke work for each family firm drives support hours to 4+ per month.
- A consultant channel that takes 25%+ or sees the product as a rival.
- Lira depreciation on multi-year fixed-TL contracts while AI and hosting are paid in USD/EUR (about 15% depreciation already in 2026).
- Hetzner-style cost shocks (113–176% on dedicated vCPU in 2026) hurt only the fixed floor; at USD 300 ARPA they are not fatal.
- A third party hosting the public code cheaper (Q6), if the license allows it and the method becomes the only differentiator.

### Gaps
- No validated price point, conversion rate, CAC or sales-cycle data for this ICP; all scenario volumes are assumptions until the 15–30 interviews and paid pilots in the ICP report.
- Turkish developer and customer-success salaries not researched; fixed opex is the biggest unknown.
- Payment processing fees (iyzico, PayTR, bank transfer) and KDV handling not modelled.
- Onboarding fee revenue and AI credit-pack revenue left out of the model (upside).
- No measured per-site memory for this Frappe 16 app; sites-per-server must be load-tested.

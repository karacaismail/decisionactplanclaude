# Trusted strategy methods: usage, evidence, and fit with the product's 42-step method (as of 15 November 2026)

Scope note. Research done on 15 November 2026 (Sunday) with web search and fetch, about 30 tool calls. Product files were read first: `docs/surec-haritasi.md`, `docs/sonraki-ana-asamalar-plani.md`, `docs/strateji-tanimi-bosluk-ve-bilinmeyen-analizi.md`, `src/data/clusters.ts`, and `src/data/steps/*.ts` (skimmed). Nothing under a "great doers" folder was read. Evidence (meta-analyses, RCTs, large surveys) is kept apart from popularity (usage surveys) and from practitioner claims (consultancy articles, vendor pages). Several primary PDFs could not be parsed by the fetch tool; two (the SBB guide and the Aston/AIM toolkit briefing) were extracted locally with macOS PDFKit and read directly. Survey dates are given each time.

One product fact to flag for the writer: the brief says the readiness gate has "9 required and 6 supporting criteria". The current process map says 9 required and **7** supporting criteria ("Zorunlu ölçüt sayısı 9'dur. Destekleyici ölçüt sayısı 7'dir.") — `docs/surec-haritasi.md`, section 4. The writer should use 7 or re-check `src/engine/readiness.ts`.

## 1. Which management tools do executives actually use? (Bain, McKinsey, academic surveys, Turkey and SBB)

### Takeaway
Usage surveys show that "strategic planning" itself is the most-used management tool, but overall tool use has fallen sharply while satisfaction with the remaining tools has risen. Among named strategy-analysis tools, SWOT is by far the most used; Porter's five forces, PESTLE and scenario planning are rated as more valuable. In Turkey the public sector is legally required to do strategic plans, and the official SBB guide (3rd version, 2018) lists PESTLE, GZFT (SWOT), stakeholder analysis and a GZFT strategy matrix (TOWS-style) as parts of the situation analysis. No current, representative Turkish survey of private-sector tool use was found.

### Cited Findings

**Bain Management Tools & Trends (most recent edition found: 2023, fielded 23 Nov to 19 Dec 2022)**
- Sample: 1,068 full-time employees of for-profit firms in 15 industries; about 38% enterprise-level managers. Published 31 January 2023. It is Bain's 30th edition. — [Bain 2023](https://www.bain.com/insights/management-tools-and-trends-2023/)
- Usage has fallen while satisfaction has risen; "no heavily used tool has low satisfaction". Mission and Vision Statements fell from 88% usage (1993) to 28% (2022). Dynamic Strategic Planning and Budgeting: 27% usage. Balanced Scorecard: 16% usage with 4.1/5 satisfaction (figure shown in a page caption). — [Bain 2023](https://www.bain.com/insights/management-tools-and-trends-2023/)
- Asian firms average about 8 tools, US about 6, Europe fewer. More than 80% expected to adopt Customer Experience Management, Digital Transformation and Employee Engagement Systems. OKRs, SWOT and scenario planning are not discussed in the 2023 text. — [Bain 2023](https://www.bain.com/insights/management-tools-and-trends-2023/)
- I found no 2024, 2025 or 2026 edition in search results. — [Bain tools hub](https://www.bain.com/tools); [Bain LinkedIn post on 2023 edition](https://www.linkedin.com/posts/bain-and-company_management-tools-trends-2023-activity-7026909093999038464-sB7d)

**Bain 2017/18 edition (fielded fall 2017, published 5 April 2018)**
- Sample 1,268 managers. Strategic Planning ranked No. 1 by global usage at 48% (vs 88% in 2006). CRM No. 2, Benchmarking No. 3 (satisfaction below mean). — [Bain 2017](https://www.bain.com/insights/management-tools-and-trends-2017/)
- Scenario and Contingency Planning fell to 19% usage from a 70% peak; Mission and Vision Statements 32% (from 88% in 1993); TQM 34% but highest satisfaction. — [Bain 2017](https://www.bain.com/insights/management-tools-and-trends-2017/)
- Average tools per company 7.5, about half the level of a decade earlier; peak was 16.1 tools in 2002. Asia-Pacific 12.2 tools. — [Bain 2017](https://www.bain.com/insights/management-tools-and-trends-2017/)
- The survey series runs since 1993 with more than 14,700 respondents from more than 70 countries in total. — [Bain survey history](https://www.bain.com/insights/management-tools-about-the-survey)

**Academic survey of strategy tools in use (Jarzabkowski, Giulietti, Oliveira; AIM / Aston executive briefing, c. 2009)**
- Method: 66 strategy academics at the top 30 UK business schools named 20 taught tools; then 2,148 usable responses from alumni of 12 of those schools (domestic and international). — [AIM/Aston briefing "Building a strategy toolkit"](https://publications.aston.ac.uk/id/eprint/18807/1/Strategy_toolkits.pdf)
- SWOT used by nearly 80% and Key Success Factors by nearly 60%; Bowman's strategy clock and corporate parenting matrices hardly used. Most managers use 3 to 5 tools. — [AIM/Aston](https://publications.aston.ac.uk/id/eprint/18807/1/Strategy_toolkits.pdf)
- "The tools with the most users are not the ones considered by managers as the most valuable." Porter's five forces and PESTLE rated more valuable for analysis, scenario planning for choice, key success factors for implementation. — [AIM/Aston](https://publications.aston.ac.uk/id/eprint/18807/1/Strategy_toolkits.pdf)
- Recommended core toolkit: SWOT, key success factors, core competences, scenario planning, value chain, five forces, resource-based analysis, industry life cycle, PESTLE, portfolio matrices. — [AIM/Aston](https://publications.aston.ac.uk/id/eprint/18807/1/Strategy_toolkits.pdf)
- Tool use drops from analysis to choice to implementation; tools are valued more for sense-making than for acting. — [AIM/Aston](https://publications.aston.ac.uk/id/eprint/18807/1/Strategy_toolkits.pdf)
- A 2018 systematic review of 482 abstracts and 88 full-text articles (Vuorinen et al.) found the strategy-tool landscape "surprisingly traditional"; newer strategic thinking has not become usable tools. — [summary via search, Aston repository](https://publications.aston.ac.uk/id/document/73444)

**McKinsey survey on the planning process (2006)**
- 796 executives worldwide: only 45% were satisfied with their strategic-planning process, and only 23% said major strategic decisions were made within it. Satisfaction was linked to involving the most knowledgeable and influential people and to challenging participants' thinking. — [McKinsey, "How to improve strategic planning" (PDF)](https://mckinsey.com/~/media/McKinsey/Business%20Functions/Strategy%20and%20Corporate%20Finance/Our%20Insights/How%20to%20improve%20strategic%20planning/How%20to%20improve%20strategic%20planning.pdf)

**Turkey: SBB / Kalkınma Bakanlığı "Kamu İdareleri İçin Stratejik Planlama Kılavuzu", 3. Sürüm, 2018**
- Versions: 1st 2003, 2nd 2006, 3rd 2018 (focus on central government; separate guides for universities, municipalities and state enterprises). Strategic planning is mandatory for public administrations under Law 5018/5436; the procedural regulation was published in the Official Gazette on 26 February 2018. — [SBB guide, 3rd version (copy hosted by Adalet Bakanlığı SGB)](https://sgb.adalet.gov.tr/Resimler/SayfaDokuman/322020141843kamuidareleri.pdf); [Resmî Gazete 26.02.2018](https://resmigazete.gov.tr/eskiler/2018/02/20180226-10.htm)
- Process (Figure 2 of the guide): planning the process; situation analysis ("Neredeyiz?"); looking ahead (mission, vision, values); strategy development (aims, targets, performance indicators, strategies); action plans; performance programme (costing, budgeting); monitoring and evaluation reports. — [SBB guide](https://sgb.adalet.gov.tr/Resimler/SayfaDokuman/322020141843kamuidareleri.pdf)
- Situation analysis items: institutional history, evaluation of the current plan, legislation analysis, analysis of higher policy documents, activity areas and products/services, stakeholder analysis, internal analysis, PESTLE, GZFT. Wording: "Durum analizinde aşağıdaki hususlarla ilgili analiz ve değerlendirmeler yapılır" — i.e. they are the expected content; other analyses "de yapılabilir". The submission table requires detailed results of stakeholder, internal, PESTLE and GZFT analyses in the draft plan. — [SBB guide, pp. 12 and 64](https://sgb.adalet.gov.tr/Resimler/SayfaDokuman/322020141843kamuidareleri.pdf)
- GZFT must not be just a list: its aim is to analyse the relations between strengths/weaknesses and opportunities/threats to guide strategy; it uses a GZFT strategies template (Table 11) and a "Strateji – GZFT Matrisi" (Table 17), which is TOWS-like. PESTLE findings feed "tespitler ve ihtiyaçlar". — [SBB guide, pp. 26–28, 48](https://sgb.adalet.gov.tr/Resimler/SayfaDokuman/322020141843kamuidareleri.pdf)
- Each target needs a target card (max two pages), and "asgari seviyede" a target-risk statement, its explanation and control activities; costing is at target level. — [SBB guide, pp. 57, 64](https://sgb.adalet.gov.tr/Resimler/SayfaDokuman/322020141843kamuidareleri.pdf)
- A secondary source also says the guide expects PESTLE and GZFT after the situation review. — [Alomaliye, 15 May 2023](https://www.alomaliye.com/2023/05/15/kamu-idarelerinin-gzft-analizi/)

**Turkey: academic surveys on private-sector tool use**
- Found only narrow or old studies: management-accounting tool use and performance among Borsa İstanbul and industrial firms (Apak and Duman, 2020; traditional tools still more common than strategic management accounting tools); an older study of Turkey's 100 largest firms (1995 revenues) on strategic-management practices; health-sector studies. No current, representative national survey of SWOT/BSC/OKR use was found. — [Aksaray Üniversitesi repository](https://acikerisim.aksaray.edu.tr/items/011120b2-2519-4434-9e08-08ce59594bd2/full); [DergiPark article](https://dergipark.org.tr/en/download/article-file/1687126)

### Inferences
- For Turkish executives, especially those with public-sector, university or municipal exposure, GZFT, PESTLE and paydaş analizi are the "official" vocabulary of strategic planning. A Turkish product that does not show these three by name may look incomplete to them, even if better tools are inside.
- Popularity and perceived value differ. SWOT is familiar; five forces, PESTLE and scenario planning are valued. Familiarity helps trust, but value earns respect. The product can show the familiar names and deliver the valued content.
- The fall in tool counts (16.1 in 2002 to 7.5 in 2017) and the 3-to-5 tools norm suggest executives prefer few tools used well. This argues against showing 43 method guides as a headline.

### Gaps
- No Bain edition after the 2023 report was found. A 2024–2026 edition may exist; the writer should not claim the 2023 edition is the latest without checking bain.com.
- Bain's full ranked top-10 with percentages for 2023 is in images only; not extracted.
- No Gartner or Conference Board survey of strategy-tool usage was searched successfully in this session. The Conference Board C-Suite Outlook covers CEO concerns, not tool use (not verified here).
- I did not verify whether SBB published a newer (4th) version of the guide after 2018, or the exact Yönetmelik wording on mandatory analyses.

## 2. Framework map: origin, purpose, evidence, criticism, and cluster fit

### Takeaway
The frameworks with the strongest provenance for *content of choice* are Rumelt's kernel, Lafley and Martin's Playing to Win, and Porter. The frameworks with the strongest *empirical* evidence are not the famous content frameworks but the process and debiasing ones: decision-process quality (Lovallo and Sibony), reference class forecasting (Flyvbjerg, now in UK Treasury practice), goal setting (behind OKRs), and the scientific/lean approach for founders (RCTs). Balanced Scorecard, Blue Ocean, Hoshin Kanri, SWOT, BCG and OKR have wide adoption but weak or mixed causal evidence.

### Cited Findings

**Rumelt's kernel (diagnosis, guiding policy, coherent actions)**
- Origin: Richard Rumelt, *Good Strategy Bad Strategy* (2011); extended in *The Crux* (2022). Kernel = diagnosis of the challenge, a guiding policy (a pathway, not detailed instructions), and coherent, mutually reinforcing actions. "Bad strategy" includes fluff and mistaking goals for strategy. — [secondary summary, mdi.us.com](https://mdi.us.com/good-strategy-bad-strategy-rumelt); [summary of the kernel](https://concepts.dsebastien.net/concept/kernel-of-good-strategy/)
- Earlier Rumelt work gives four evaluation tests: consistency, consonance, advantage, feasibility. The product already uses them in step 2.3 ("Tutarlılık", "Uyum", "Avantaj", "Yapılabilirlik"). — product file `src/data/steps/strateji.ts`; source verified by the product team per [sonraki-ana-asamalar-plani.md](../../docs/sonraki-ana-asamalar-plani.md)
- Evidence: conceptual and case-based; no outcome study found. Criticism found in this session: none of substance beyond being case-based.
- Fit: Cluster 2 backbone (2.1 diagnosis, 2.4 choice/guiding policy, 2.5 coherent actions).

**Lafley and Martin, Playing to Win (choice cascade; "what would have to be true")**
- Origin: Lafley, Martin, Rivkin and Siggelkow, "Bringing Science to the Art of Strategy", HBR, September 2012 (vol. 90, issue 9, pp. 56–66), with the book *Playing to Win* (2013). Method: frame a choice, generate possibilities, ask what would have to be true for each, then design tests and run analysis only on the barriers; invite sceptics to state doubts. — [Rotman news release](https://cd-www.rotman.utoronto.ca/Connect/MediaCentre/NewsReleases/Bringing-Science-to-Strategy); [Farnam Street summary](https://fs.blog/playing-to-win-how-strategy-really-works/)
- Five choices: winning aspiration, where to play, how to win, capabilities, management systems. Developed at P&G. — [Farnam Street summary](https://fs.blog/playing-to-win-how-strategy-really-works/); [Marketing Society on P&G](https://marketingsociety.com/the-library/power-play-procter-gamble-way)
- Evidence: P&G case experience; no controlled outcome study found.
- Fit: Cluster 2 (2.2 options, 2.3 "neler doğru olmalı?", 2.4 aspiration and where to play, 2.5 capabilities); management systems map to Cluster 3.

**Porter (five forces, value chain, generic strategies, "What is strategy?")**
- Origin: Porter, HBR 1979 (five forces), *Competitive Strategy* 1980, *Competitive Advantage* 1985 (value chain), "What Is Strategy?" HBR 1996 (strategy as trade-offs and fit). — [HBR strategic planning topic page listing "What Is Strategy?"](https://bg.hbr.org/topic/strategic-planning)
- Adoption/value: five forces rated among the most valuable analysis tools by 2,148 UK business-school alumni; value chain in the core toolkit, used most in manufacturing. — [AIM/Aston](https://publications.aston.ac.uk/id/eprint/18807/1/Strategy_toolkits.pdf)
- Fit: Cluster 1 (industry attractiveness, step 04 full version), Cluster 2 (2.4 trade-offs, "vazgeçiş").

**Resource-based view and VRIO**
- Origin: Barney 1991, *Journal of Management* 17(1): 99–120; VRIN criteria (valuable, rare, imperfectly imitable, non-substitutable); later VRIO (sources disagree whether 1995 or later). — [Wikipedia, Resource-based view](https://en.wikipedia.org/wiki/Resource-based_view)
- Evidence: Newbert (2007, *SMJ* 28(2): 121–146) found the RBV "has received only modest support overall", varying with variable and approach. — [RePEc record](https://econpapers.repec.org/RePEc:bla:stratm:v:28:y:2007:i:2:p:121-146)
- Fit: Cluster 1 step 12 ("Güç süzgeci", four questions per strength) and Cluster 2.5 capabilities.

**Blue Ocean Strategy**
- Origin: Kim and Mauborgne, HBR 2004 and book 2005. — (bibliographic; not opened this session)
- Criticism: evidence base is retrospective case studies of successes; failures are not studied, so the success rate is unknown (survivorship bias); a 108-company sample; blue oceans attract imitators. — [Shortform review](https://www.shortform.com/blog/blue-ocean-strategy-review/); [Digital Tonto](https://digitaltonto.com/2017/dont-bet-on-someone-elses-success-story/); [knowledgelib entry](https://knowledgelib.io/business/frameworks/blue-ocean-strategy/2026)
- Fit: optional idea generator in Cluster 2.2 (options), not a backbone.

**Balanced Scorecard and strategy maps (Kaplan and Norton)**
- Origin: HBR 1992; strategy maps 2000s; "Mastering the Management System", HBR January 2008: a closed-loop system that starts with strategy development, then translates strategy into objectives and initiatives with strategy maps, then plans operations, monitors and tests/adapts. — [HBR 2008](https://hbr.org/2008/01/mastering-the-management-system)
- Adoption: 16% usage, 4.1/5 satisfaction in Bain 2023. — [Bain 2023](https://www.bain.com/insights/management-tools-and-trends-2023/)
- Evidence: mixed. Tawse and Tabesh (Business Horizons, 2023, 30-year review) report mixed data on BSC impact; a chapter by Epstein, Manzoni and Davila says no large-scale evidence shows full BSC users outperform non-users; in SMEs the positive effect is stronger in more established firms (Malagueño et al.). — [Business Horizons record](https://econpapers.repec.org/RePEc:eee:bushor:v:66:y:2023:i:1:p:123-132); [Emerald chapter](https://emerald.com/insight/content/doi/10.1108/S1479-3512(2010)0000020015); [Small Business Economics paper](https://springerlink.bibliotecabuap.elogim.com/content/pdf/10.1007/s11187-017-9921-3.pdf)
- Fit: Cluster 3 (3.1 targets and indicators; 3.4 review; strategy map would bridge 2.5 to 3.1).

**Hoshin Kanri**
- Evidence: no large quantitative study found; reviews say research is concentrated in few areas and mostly single cases (e.g. Nissan Yamato thesis; a food-retail case 2023). A 2024 TQM Journal review covers Western implementation. — [Emerald TQM Journal review](https://www.emeraldinsight.com/insight/content/doi/10.1108/TQM-07-2022-0216/full/html); [Emerald IJQRM case](https://www.emerald.com/insight/content/doi/10.1108/IJQRM-01-2022-0019/full/html); [Durham thesis](https://etheses.durham.ac.uk/id/eprint/4234/1/4234_1754.pdf)
- Fit: Cluster 3 (cascade of few breakthrough objectives; catchball; review cycle = 3.4/3.5).

**OKR**
- Evidence: no controlled trials or meta-analyses found. Most-cited figure is an internal Sears study (~20,000 associates; 11.5% higher chance of moving to a higher performance bracket), repeated mainly by vendors; Microsoft study of ~4,000 engineers was qualitative. — [OKR blog on Sears](https://okrsblog.blogspot.com/2015/03/sears-holding-company-study-concludes.html); [arXiv, OKRs in software teams](https://ar5iv.labs.arxiv.org/html/2311.00236); [Benchmarking: An International Journal](https://emerald.com/insight/content/doi/10.1108/BIJ-07-2022-0464/full/html)
- Fit: Cluster 3.1 format only; OKR is a goal format, not a strategy-choice method.

**SWOT / TOWS and PESTEL**
- SWOT is the most used tool (~80% of UK alumni). — [AIM/Aston](https://publications.aston.ac.uk/id/eprint/18807/1/Strategy_toolkits.pdf)
- Criticism: Hill and Westbrook, "SWOT analysis: it's time for a product recall", *Long Range Planning* 30(1), 1997, 46–52: in 20 UK companies (1993–94), no one used SWOT outputs in later strategy stages. — [LBS record](https://www.london.edu/faculty-and-research/academic-research/s/swot-analysis-time-for-a-product-recall); [secondary summary](https://advat.blogspot.com/2009/03/swot-analysis-its-time-for-product.html)
- SBB guide itself warns that GZFT must link factors to strategies, not just list them. — [SBB guide](https://sgb.adalet.gov.tr/Resimler/SayfaDokuman/322020141843kamuidareleri.pdf)
- Fit: Cluster 1 end (step 18 "Durum özeti" with four cross questions = TOWS).

**Scenario planning (Shell)**
- Origin: Pierre Wack, with Edward Newland, built Shell's system; HBR "Scenarios: Shooting the Rapids", November 1985. — [HBR 1985](https://hbr.org/1985/11/scenarios-shooting-the-rapids)
- Adoption: fell to 19% usage from a 70% peak (Bain 2017); rated the most valuable tool for strategy choice (AIM/Aston). — [Bain 2017](https://www.bain.com/insights/management-tools-and-trends-2017/); [AIM/Aston](https://publications.aston.ac.uk/id/eprint/18807/1/Strategy_toolkits.pdf)
- Evidence: Phelps, Chan and Kapsalis (J. Business Research 51(3), 2001) found support for better financial performance in two industries, but reverse causality is not ruled out; Phadnis et al. say there is little empirical examination of effects on judgment. Rohrbeck and Kum studied ~90 European multinationals over seven years on foresight and performance. — [RePEc](https://ideas.repec.org/a/eee/jbrese/v51y2001i3p223-232.html); [Phadnis et al., SMJ](https://sheffi.mit.edu/sites/sheffi.mit.edu/files/2017-06/Phadnis-etal_Scenario-effects_SMJ.pdf); [WEF summary of foresight research](https://www.weforum.org/stories/2023/09/strategic-foresight-research-insights/)
- Fit: Cluster 1 (step 04 full version: two uncertainties, four scenarios) and Cluster 2.3 (test options against scenarios).

**Pre-mortem (Gary Klein)**
- Origin: Klein, "Performing a Project Premortem", HBR September 2007: assume the project has failed and generate reasons. — [HBR 2007](https://hbr.org/2007/09/performing-a-project-premortem)
- Evidence: rests on Mitchell, Russo and Pennington (1989) "prospective hindsight", which raised the *number* of reasons generated by about 30%; it did not measure accuracy, so "30% more accurate" overstates it. Follow-up studies exist (Veinott et al. 2010; Gallop and Bischoff 2016). — [Jason Collins on the premortem](https://corporate.jasoncollins.blog/premortem); [Burrus summary](https://www.burrus.com/2018/06/premortems-reflections-of-the-future-not-the-past/)
- Fit: Cluster 1 step 17 ("Ön ölüm listesi"); could be repeated before 2.4 approval.

**Decision quality (Ron Howard, Strategic Decisions Group)**
- Six elements: useful frame, creative and doable alternatives, meaningful and reliable information, clear values and trade-offs, sound reasoning, commitment to action. A decision is only as good as its weakest element; quality is judged at decision time, not by outcome. — [SDG, Decision Quality](https://sdg.com/decision-quality/); [SDG infographic](https://sdg.com/infographic/6-elements-of-high-quality-decisions/); [Wikipedia, Decision quality](https://www.wikipedia.org/wiki/Decision_quality)
- Fit: whole method; maps cleanly to 2.1 (frame), 2.2 (alternatives), Cluster 1 evidence (information), 2.4 (values/trade-offs), 2.3 (reasoning), 2.5/3.x (commitment).

**Behavioural strategy / debiasing (Lovallo and Sibony, McKinsey Quarterly, 2010)**
- 1,048 major decisions over five years; "process mattered more than analysis—by a factor of six"; moving from bottom to top quartile on process was linked to +6.9 percentage points ROI (subset of 673 decisions). Almost no decisions with very strong process had very poor analysis. — [McKinsey Quarterly](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-case-for-behavioral-strategy)
- Caveat: practitioner article, self-reported, regression-based attribution; not peer-reviewed. — same source
- Fit: the product's gates, decision log, "ayrı görüş" (dissent) and pre-mortem are process features of exactly this kind.

**Reference class forecasting (Kahneman and Tversky; Flyvbjerg)**
- First practical use: Edinburgh Tram Line 2 (2004) with a reference class of 46 rail projects; base cost £255m with 25% contingency judged optimistic. Flyvbjerg separates optimism bias from strategic misrepresentation. — [Flyvbjerg, "Curbing Optimism Bias..." (EconBiz)](https://www.econbiz.de/Record/curbing-optimism-bias-and-strategic-misrepresentation-in-planning-reference-class-forecasting-in-practice/10010975197); [Flyvbjerg, arXiv 1303.7403](https://arxiv.org/pdf/1303.7403)
- The method underlies the optimism-bias uplift in HM Treasury's Green Book (2018), per a university impact case study (self-reported). — [REF 2021 impact case](https://results2021.ref.ac.uk/impact/81d555af-df9f-4275-84ff-864dcf917aa6/pdf)
- Fit: Cluster 1 (runway, demand, budget estimates: steps 09, 15, 16) and Cluster 3.3 (budget).

**Lean startup / scientific approach for founders**
- Camuffo, Cordova, Gambardella and Spina, *Management Science* 2020 (RCT; working paper reports 116 Italian startups): founders taught to form and test hypotheses performed better, pivoted more, and were more likely to close bad projects. A large replication with 759 firms across 4 RCTs (CEPR DP15972) reports the approach can be taught and leads to better results. — [Bocconi IRIS](https://iris.unibocconi.it/handle/11565/4013977); [Innovation Growth Lab](https://www.innovationgrowthlab.org/blog/confused-or-unimaginative-how-adoption-scientific-approach-improves-entrepreneurial); [CEPR DP15972 summary](https://causalclaims.trfetzer.com/paper/DP15972.html)
- Fit: Cluster 1 (Karar 2–4: problem, customer discovery, assumption map, demand test) and Cluster 3 (Karar 7 learning loop).

**McKinsey "Strategy Beyond the Hockey Stick" (Bradley, Hirt, Smit, 2018)**
- 2,393 large non-financial firms, 2001–2014; top-quintile economic profit about 30 times the middle; middle firms have an 8% chance of reaching the top; big moves (five types) explain a large share of the odds. — [McKinsey Quarterly, "Strategy to beat the odds"](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/strategy-to-beat-the-odds); [CFO.com review](https://cfo.com/news/a-fresh-approach-to-business-strategies/659330/)
- Fit: Cluster 2.5 ("Ana hamleler" = big moves) and a reality check against hockey-stick plans in 3.1.

### Inferences
- A defensible "backbone" for executives: Rumelt (what a strategy must contain), Lafley and Martin (how to generate and test choices), Kaplan and Norton (how to execute and review), plus decision quality and behavioural debiasing (why the process is trustworthy). Porter, VRIO, PESTLE, SWOT/TOWS and scenarios are supporting analysis tools, not the backbone.
- Frameworks not researched in depth this session (Ansoff matrix, BCG matrix, McKinsey 7S, Three Horizons, Wardley mapping, real options) are best treated as optional helpers: Ansoff and BCG for growth/portfolio choices in 2.2 and Karar 8; 7S as a capability/organisation check in 2.5; Three Horizons for portfolio balance in 2.5; Wardley for technology-heavy businesses in Cluster 1; real options logic for staged commitments (the product's kademeli izin and geri alınabilirlik already embody it). These origin details are from background knowledge, not verified here.

### Gaps
- No primary-source read of Rumelt's book or McKinsey article "The perils of bad strategy" (2011) in this session; summaries only.
- Blue Ocean original HBR article and Kaplan–Norton 1992 article not opened.
- No empirical evidence found on Ansoff, BCG, 7S, Three Horizons, Wardley mapping or real-options adoption in strategy (not searched due to budget).
- No independent (non-Flyvbjerg) evaluation of reference class forecasting accuracy was reviewed.

## 3. Evidence on strategic planning, firm performance, and process quality vs outcomes

### Takeaway
Three meta-analyses agree that formal strategic planning has a positive, moderate effect on performance, but effect sizes are small, depend on method and context, and may be inflated by publication bias. For small and new firms, planning helps less than for established ones, and planning combined with learning works best. The strongest practical evidence points to *process quality* (debate, dissent, explicit uncertainty) over more analysis, and to hypothesis-testing for founders.

### Cited Findings
- Miller and Cardinal (1994), *Academy of Management Journal* 37(6): 1649–1665, meta-analysis of 26 studies: strategic planning positively influences performance; methods factors explain most of the inconsistencies; substantive contingency factors had little impact. — [SUFE academic newsletter record](https://academicnewsletter.sufe.edu.cn/info/363918)
- A 2006 meta-analysis of 39 studies reported a standardized mean difference of 0.257 (p<.001), but a publication-bias analysis "calls this relationship into question". — [Nova Southeastern record, "Thirty-five years of strategic planning and firm performance research"](https://scholars.nova.edu/en/publications/thirty-five-years-of-strategic-planning-and-firm-performance-rese/)
- Brinckmann, Grichnik and Kapsa (2010), *Journal of Business Venturing* 25(1): 24–40: planning helps small-firm performance, but the effect depends on context such as firm newness and culture; they recommend combining planning and learning. — [RePEc](https://econpapers.repec.org/RePEc:eee:jbvent:v:25:y:2010:i:1:p:24-40); [Effectuation library](https://effectuation.org/publications-library/should-entrepreneurs-plan-or-just-storm-the-castle-a-meta-analysis-on-contextual-factors-impacting-the-business-planning-performance-relationship-in-small-firms)
- George, Walker and Monster (2019), *Public Administration Review*: 87 correlations from 31 studies; positive, moderate, significant effect; holds across public and private sectors and US/non-US; strongest for *formal* strategic planning and for *effectiveness* outcomes, not efficiency. Cited in the US FY2023 budget (university's own account). — [Erasmus repository](https://repub.eur.nl/pub/120708); [CityU news](https://www6.cityu.edu.hk/class/media_events/magazine/issue13/en/CityU-Research-Cited-in-US-Budget-FY2023.html)
- Lovallo and Sibony (2010): process mattered six times more than analysis across 1,048 decisions. — [McKinsey Quarterly](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-case-for-behavioral-strategy)
- Decision quality is judged at decision time, independent of outcome. — [SDG](https://sdg.com/decision-quality/)
- Camuffo et al. RCTs: hypothesis-testing founders perform better and close bad ideas earlier. — [Innovation Growth Lab](https://www.innovationgrowthlab.org/blog/what-are-effects-scientific-approach-entrepreneurial-experimentation)
- Only 23% of executives said major strategic decisions are made inside the formal planning process (McKinsey 2006). — [McKinsey PDF](https://mckinsey.com/~/media/McKinsey/Business%20Functions/Strategy%20and%20Corporate%20Finance/Our%20Insights/How%20to%20improve%20strategic%20planning/How%20to%20improve%20strategic%20planning.pdf)

### Inferences
- The honest claim the product can make: "Formal planning is linked to better effectiveness in three meta-analyses. Process quality matters more than more analysis." It should not claim that any single framework causes better results.
- For the founder segment, Brinckmann and Camuffo support the product's choice to put evidence and learning (customer discovery, demand tests) before strategy choice. This is the product's strongest evidence-based differentiator.
- The 23% figure warns that formal plans are often bypassed. A product whose decision log and gates are where the real decision is recorded addresses this directly.

### Gaps
- Exact effect sizes of Miller and Cardinal (1994) and George et al. (2019) not extracted (full texts not opened).
- No Turkish study linking planning to firm performance in SMEs was found.

## 4. What makes a method trusted by executives?

### Takeaway
Direct research on "trust drivers" for strategy methods is thin. The available evidence points to familiarity and education (tools taught in business schools are the ones used), peer use, perceived usefulness at each stage, provenance (named authors, schools, consultancies), and fit with the decision process (involving knowledgeable people, challenging thinking). Tools are trusted more for sense-making than for committing to action.

### Cited Findings
- Tools most dropped were also the least used and least known; low awareness discourages use because colleagues do not know them. — [AIM/Aston](https://publications.aston.ac.uk/id/eprint/18807/1/Strategy_toolkits.pdf)
- Main reasons for using tools: make sense of the environment (4.16/5), understand strategic issues (4.10); lowest: "be certain about a particular course of action" (3.36). — [AIM/Aston](https://publications.aston.ac.uk/id/eprint/18807/1/Strategy_toolkits.pdf)
- Education, age, experience and career stage affect tool use; the toolkit was built from what top UK schools teach. — [AIM/Aston](https://publications.aston.ac.uk/id/eprint/18807/1/Strategy_toolkits.pdf)
- Jarzabkowski and Kaplan (2015, *SMJ*): tool selection and use emerge from the interaction of tool affordances and the agency of strategy makers; outcomes vary for organisations, tools and users. — [City Research Online](https://openaccess.city.ac.uk/id/eprint/4011/)
- Satisfaction with planning is higher when the process involves the most knowledgeable and influential people and challenges thinking. — [McKinsey 2006 PDF](https://mckinsey.com/~/media/McKinsey/Business%20Functions/Strategy%20and%20Corporate%20Finance/Our%20Insights/How%20to%20improve%20strategic%20planning/How%20to%20improve%20strategic%20planning.pdf)
- Bain: tools with high use but low satisfaction tend to decline or improve; major (broad) efforts earn higher satisfaction than limited ones. — [Bain 2017](https://www.bain.com/insights/management-tools-and-trends-2017/)
- Official mandate creates vocabulary: Turkish public bodies must use the SBB guide's analyses. — [SBB guide](https://sgb.adalet.gov.tr/Resimler/SayfaDokuman/322020141843kamuidareleri.pdf)
- Reference class forecasting gained trust through government adoption (UK Department for Transport, HM Treasury Green Book). — [REF 2021 impact case](https://results2021.ref.ac.uk/impact/81d555af-df9f-4275-84ff-864dcf917aa6/pdf)

### Inferences
- Trust signals the product can use: (1) named authors and original sources per step; (2) familiar Turkish official names (GZFT, PESTLE, paydaş analizi); (3) an audit trail (decision log, versioning, stale-decision rules) that shows who decided what on which evidence; (4) a short visible method with few named tools.
- Because executives trust tools for sense-making more than for commitment, the product's distinctive value (gates that force a choice and trade-off) needs to be explained as a decision-quality feature, with the Lovallo–Sibony and SDG evidence.

### Gaps
- No study was found that measures executive trust in a strategy software method directly.
- Certifications (e.g. Balanced Scorecard Institute, OKR coaches) as trust drivers were not researched.

## 5. Assessment of the product's method against trusted frameworks

### Takeaway
The product's method is credible and, in places, ahead of common practice: its strategy-formulation cluster is a direct, well-sourced implementation of Rumelt plus Lafley–Martin, with Rumelt's four tests, an explicit trade-off field, and a readiness gate that enforces evidence before choice. Its main weaknesses are visibility and load, not content: the backbone frameworks are not named for the user, "how to win" is not an explicit field, competitive and scenario analysis are optional and hidden on the short path, there is no strategy map linking moves to targets, and 42 steps with up to 240 fields is heavy compared with the 3-to-5-tool norm.

### Cited Findings (product facts)
- Three clusters justified by a count of 18 frameworks: 15 of 18 treat formulation and execution as separate top-level phases; evaluation 8 of 18; translation 4 of 18; vision/mission 2 of 18. Rule: a top-level cluster needs at least three quarters of frameworks. Mintzberg's objection is acknowledged and answered with the 3.5 renewal loop. — `docs/sonraki-ana-asamalar-plani.md`
- Sub-stage sources in code: 2.1 Rumelt, Lafley–Martin, Kaplan–Norton, Wheelen–Hunger; 2.2 Lafley–Martin, Porter, Baldrige; 2.3 Lafley–Martin, Rumelt's four tests, Hambrick–Fredrickson diamond; 2.4 Martin, Porter, Rumelt, diamond, Lafley–Martin; 2.5 Rumelt, Martin, diamond, Baldrige; 3.1–3.5 Kaplan–Norton, Baldrige, Wheelen–Hunger (+ Rumelt in 3.3, 3.5). A test checks that each sub-stage rests on at least three independent frameworks. — `src/data/clusters.ts`; `docs/surec-haritasi.md` section 9
- Step 2.4 fields: "Seçilen yol", "Seçimin gerekçesi", "Kazanma hedefi", "Saha", "Vazgeçilenler". There is no separate "how to win" field. — `src/data/steps/karar5.ts`
- Step 2.3 asks "Bu yolun doğru olması için neler doğru olmalı?" and scores each option on Rumelt's four tests. — `src/data/steps/strateji.ts`
- Step 04 full version: six PESTLE factors, five forces, two uncertainties → four scenarios, permits. It is optional, and the short path hides step 04. — `src/data/steps/karar1.ts`; `docs/surec-haritasi.md` ("Kısa yol tek adımı gizler: Adım 04")
- Step 12 has a strength filter (VRIO-like, four questions); step 17 has a pre-mortem list, risk table and single-source dependency; step 18 has a situation summary with four cross questions (TOWS) and a "Rakip tepkisi" field; Adım 17 stays visible on the short path because Gate 5 reads it. — `docs/surec-haritasi.md` sections 1, 6
- Readiness gate: 9 required and 7 supporting criteria; three outcomes ("Planlamaya hazır", "Koşullu hazır", "Henüz hazır değil"); software only recommends; owner decides after ticking "Strateje devir raporunu okudum". — `docs/surec-haritasi.md` section 4
- Stale-decision rules: changing an input makes dependent decisions stale. — `docs/surec-haritasi.md` section 3
- Field budget: at most 240 fields in pre-strategy steps, at most 149 in open sections; 76 sections, 31 optional. — `docs/surec-haritasi.md` section 6
- The gap analysis itself names two real problems: no real user has tested it, and the form grew too big (236 fields when written). — `docs/strateji-tanimi-bosluk-ve-bilinmeyen-analizi.md`

### Mapping: which frameworks each part embodies
| Product part | Embodied frameworks | Strength of match |
|---|---|---|
| Karar 1 (00–04): mandate, founder intent, stop rules, runway, decision rights; step 04 PESTLE, five forces, scenarios | SBB "planlama sürecinin planlanması"; PESTLE; Porter; Shell scenarios; real-options logic (stop rules) | Strong, but step 04 is optional and hidden on the short path |
| Karar 2 (05–08): problem, customer discovery, interviews | Lean startup / customer discovery; scientific approach (Camuffo RCTs) | Strong; evidence-backed |
| Karar 3 (09–12): market sizing, competitor table, those who tried and quit, assumption map, solution paths, strengths filter | Porter (rivals), reference-class thinking (failed predecessors), VRIO | Good; competitor analysis is a table, not a full five-forces step |
| Karar 4 (13–15): value proposition, invoicing, permits, demand test | Value proposition canvas; lean demand testing | Strong |
| Karar 5 (16–18): one-page plan, money in three cases, free budget, pre-mortem, risks, path candidates, TOWS cross questions | Business model canvas; pre-mortem (Klein); risk register (SBB asks "hedef riskleri"); TOWS | Strong |
| Readiness gate + handoff report | Decision quality ("meaningful information" element); Brinckmann's "plan + learn" | Distinctive; no common framework has an explicit evidence gate |
| 2.1–2.5 + strategy document | Rumelt kernel; Lafley–Martin seven steps and five choices; Rumelt four tests; Porter trade-offs; Hambrick–Fredrickson | Very strong content match |
| 3.1–3.3 targets, initiatives, budget | Kaplan–Norton; SBB hedef kartı, maliyetlendirme; OKR format | Adequate; no strategy map |
| 3.4–3.5 (Karar 6–8) review, sustain/fix/reopen | Kaplan–Norton closed loop; Hoshin review; Mintzberg emergent strategy | Strong; "Yeniden aç" is a good answer to Mintzberg |

### Inferences
- **Strengths vs trusted practice.** (1) The evidence gate before choice is supported by Brinckmann (plan with learning) and Camuffo (test hypotheses) and is rare in OKR/BSC software. (2) The forced trade-off field ("Vazgeçilenler") and "at least two genuinely different options" rule implement Porter's and Rumelt's core point that strategy is choice. (3) Pre-mortem, dissent ("Ayrı görüş"), "Bu işi deneyip bırakanlar" and stale-decision rules are the process features Lovallo and Sibony found most valuable. (4) Software that does not choose for the user fits decision-quality doctrine (the owner commits).
- **Gaps vs trusted frameworks.**
  1. "How to win" is implicit. Playing to Win's two central choices are where to play *and* how to win. 2.4 has "Saha" and "Kazanma hedefi" but not an explicit "Nasıl kazanacağız?" field. Executives who know Playing to Win will look for it. This may be covered by "Seçilen yol" and "gerekçe", but it is not named.
  2. Rumelt's "guiding policy" is not named either; "Seçilen yol" plays that role.
  3. Competitive analysis is thin at decision time: five forces sits in optional step 04 (hidden on the short path); rivals appear as a table (step 09–11) and "Rakip tepkisi" (step 18). For established-company executives, this will look light.
  4. Scenario planning is optional and hidden on the short path; 2.3 does not ask to test options against scenarios.
  5. No strategy map or explicit link from each ana hamle (2.5) to targets (3.1). Kaplan–Norton users will expect cause-and-effect links.
  6. Stakeholder analysis ("paydaş analizi") is only partial (gap 6 in the product's own analysis); SBB treats it as the main participation tool.
  7. No reference-class step for estimates (runway, demand, budget): the "outside view" is present only as "deneyip bırakanlar".
  8. Corporate/portfolio level (Ansoff, BCG, Three Horizons) is absent except "Karar 8" growth options; fine for founders, a gap for multi-business groups.
- **Overload risk.** 42 steps, ~76 sections and up to 240 fields exceed the 3-to-5 tools managers typically use (AIM/Aston) and Bain's trend toward fewer tools. The McKinsey 2006 data show satisfaction depends on challenge and the right people, not volume. The overload risk is real for executives; less so for founders who need the evidence steps.
- **Credibility verdict.** Content is credible and well-sourced; the "18 frameworks, 15 of 18" counting method is transparent. The weak points are that the method's authority is buried in code comments and internal docs, and the count mixes textbooks (Wheelen–Hunger, David, Thompson et al.) with practitioner frameworks; executives recognise authors such as Rumelt, Martin, Porter, Kaplan–Norton more than textbook process models.

### Gaps
- The product has no user testing yet (stated in its own docs), so no evidence exists on whether executives trust or complete it.
- I did not read the full step files for every field; mapping is based on titles, labels and the process map.

## 6. Recommendations: backbone frameworks, citation, and keeping it short

### Takeaway
Show executives a short, named backbone of four sources plus one evidence claim, keep analysis tools as optional helpers, add two or three small fields rather than new steps, and offer a fast path for executives that keeps the gates and decision log.

### Cited Findings (basis)
- Few tools used well: 3 to 5 per manager; tool counts halved over a decade. — [AIM/Aston](https://publications.aston.ac.uk/id/eprint/18807/1/Strategy_toolkits.pdf); [Bain 2017](https://www.bain.com/insights/management-tools-and-trends-2017/)
- Process over analysis (6x). — [McKinsey Quarterly 2010](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-case-for-behavioral-strategy)
- Formal planning helps effectiveness across sectors (meta-analysis). — [Erasmus repository](https://repub.eur.nl/pub/120708)
- SBB vocabulary: PESTLE, GZFT, paydaş analizi, hedef kartı, hedef riskleri, maliyetlendirme. — [SBB guide](https://sgb.adalet.gov.tr/Resimler/SayfaDokuman/322020141843kamuidareleri.pdf)

### Inferences (recommendations)
1. **Name a four-part backbone on one screen** ("Yöntemin dayanağı"):
   - Rumelt, *Good Strategy Bad Strategy* (2011): teşhis, yön veren ilke, uyumlu eylemler → 2.1, 2.4, 2.5; plus his four tests → 2.3.
   - Lafley and Martin, *Playing to Win* (2013) and HBR 2012: five choices and "neler doğru olmalı?" → 2.2–2.5.
   - Kaplan and Norton, HBR 2008 closed-loop management system → 3.1–3.5.
   - Decision quality (Howard / SDG) and behavioural strategy (Lovallo and Sibony 2010) → gates, decision log, pre-mortem, dissent.
   Keep Porter, VRIO, PESTLE, GZFT/TOWS and scenarios as "analysis helpers" listed per step.
2. **Cite with a short "Kaynak" line per step**, e.g. "Bu adım Rumelt'in teşhis ölçütüne dayanır (2011)." Link the original book or HBR article, not summaries. Separate "Kanıt" (meta-analysis, RCT) from "Yaygınlık" (surveys) on the method page, so claims stay honest.
3. **One evidence sentence for executives**: three meta-analyses link formal planning to better effectiveness; McKinsey found process quality mattered six times more than analysis; RCTs show hypothesis-testing founders do better. Avoid claiming that the product itself improves performance until it has user data.
4. **Use Turkish official names** where they apply: label step 04 as "PESTLE ve beş güç", step 18 summary as "GZFT ve çapraz stratejiler (TOWS)", add "Paydaş analizi" wording to step 17's "İşi etkileyen kişiler". This matches SBB vocabulary without new steps.
5. **Close the named gaps with fields, not steps** (within the 240-field budget, possibly replacing weaker optional fields): an explicit "Nasıl kazanacağız?" field in 2.4; a "Yön veren ilke" label on "Seçilen yol"; a "Hangi hedefe hizmet eder?" link from each 2.5 move to a 3.1 target (a minimal strategy map); an optional "Senaryolara karşı sınama" check in 2.3 that reads step 04 scenarios if present; an optional "Benzer işlerin gerçek sonucu" (reference class) field next to key estimates in steps 15–16.
6. **Keep the process short for executives**: offer an "Yönetici yolu" that shows only gate-read sections plus Cluster 2, with the decision log and stale rules intact; keep step 04 and five forces visible for established firms (hide only for founders); present 3 to 5 named tools at the top level and leave the 43 method guides as on-demand help.
7. **Add auditability as a trust signal**: export the strategy document with a "Karar kaydı" annex (who decided, when, on what evidence, which dissent), since executives value decisions made inside the process (McKinsey: only 23% are).

### Gaps
- No evidence was found on which specific citation format raises executive trust; recommendations 1–2 are inferences from usage surveys and provenance logic.
- Whether Turkish private-sector executives (as opposed to public-sector staff) prefer SBB vocabulary is untested.

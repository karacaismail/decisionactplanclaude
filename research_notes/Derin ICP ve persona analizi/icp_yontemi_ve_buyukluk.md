# Detailed ICP, buyer personas and TAM/SAM/SOM sizing: methods, templates and examples for Karar Atlası

Scope: this file extends `research_notes/Hedef kitle ICP ve AI konumlandırma/icp_persona_konumlandirma_yontemleri.md`. It does not repeat that file. The earlier file already covers: ICP vs persona definitions, the basic ICP layers (firmographic, technographic, behavioral), the Mom Test, the four forces of progress, the five rings at a summary level, the 8 to 15 interviews per persona guidance, Dunford's champion-only view, Gartner buying-group conflict data and the negative-ICP idea. This file adds: the full ICP document structure, scoring and tiering, weight derivation, real numeric cases, sub-ICPs, bottom-up sizing, persona hypotheses with kill criteria, the JTBD timeline, ABM tiers for a tiny team, and fill-in templates. Researched 16 November 2026. Vendor and agency sources are marked "(vendor)". Most ICP scoring content online is vendor content; analyst-grade primary sources are scarce and are flagged where found.

## What a detailed professional ICP document contains, how accounts are scored and tiered, and how weights come from win and loss data

### Takeaway
A professional ICP is not a paragraph. It is a scored model: a set of attributes (firmographic, business strength, value-specific, trigger, negative), each with a weight derived from closed-won vs closed-lost and retention data, which sorts accounts into tiers (A/B/C or 1/2/3) that decide how much sales and marketing effort each account gets. The strongest primary example found (Advent International, a private-equity firm) shows the ICP being built as an LTV-predicting model and used for territory, pipeline and productivity governance. Weight-derivation methods published online are almost all vendor templates; the most defensible one is "coverage times win-rate lift," recalibrated after a fixed number of deals.

### Cited Findings
**Primary / credible examples of ICP construction**
- Advent International (Advent Tech, "Scale@Scale" series; no date or author shown) defines the ICP as the traits of customers with the highest lifetime value, a subset of TAM. It names three attribute groups: firmographic (industry, segment, size, geography), "business strength" (profitability, funding, FTE growth, budget) and "value-proposition-specific" attributes (for example specific tools or vendors in use). Sales and marketing leadership owns it; RevOps runs the analysis — [Advent International](https://www.adventinternational.com/ideas/anchoring-on-icp-to-prioritize-sales-marketing-efforts-and-maximize-productivity)
- Advent's build steps: run a workshop to choose attributes to test; enrich customer and prospect lists iteratively; train a model on the attributes plus historical win/loss, lead-generation and adoption data; predict each prospect's potential LTV and assign a score or tier (a chart shows grades A to D). Validation signals: win rate, customer tenure, NPS, ACV and expansion revenue — [Advent International](https://www.adventinternational.com/ideas/anchoring-on-icp-to-prioritize-sales-marketing-efforts-and-maximize-productivity)
- Advent's governance uses: assign ICP scores to territories to check balance; build plays around the best cohorts; monitor pipeline by rep, ICP vs non-ICP; optionally require sign-off before pursuing non-ICP prospects; compare productivity ("magic number") ICP vs non-ICP; periodically re-check whether existing customers still fit — [Advent International](https://www.adventinternational.com/ideas/anchoring-on-icp-to-prioritize-sales-marketing-efforts-and-maximize-productivity)
- Advent case numbers: Portfolio company A's ICP win rate was 39%, about 170% to 490% higher than the win rate of its least valuable customer groups. Portfolio company B refreshed its scoring after a retrospective analysis; sellers then beat the bookings plan by 30% in subsequent quarters — [Advent International](https://www.adventinternational.com/ideas/anchoring-on-icp-to-prioritize-sales-marketing-efforts-and-maximize-productivity). The article does not say how weights were derived or define tiers.
- PostHog (Andy Vandervell, 25 January 2024): ICP stated as "high-growth B2B startups that have product-market fit, where engineers are the decision makers." Its framework attributes: company type, B2B/B2C, employee count (example 5 to 50), user count, who uses the product, tools used or to be replaced, what they value. The first ICP was organized as "things they need / things they have / things they don't need" and lacked size and revenue, but was testable — [PostHog newsletter](https://posthog.com/newsletter/ideal-customer-profile-framework)
- PostHog validation rule: ICP users should retain better, rate the product higher, use it more and reach high-value events faster than non-ICP users; if ICP and non-ICP users look the same, narrow the ICP. Five paying B2B customers sharing the same traits is "a good sign," ten or more is "very strong." Defining an ICP typically takes 3 months to a year. The ICP then drove pricing, UI, content, no-outbound sales and website tone — [PostHog newsletter](https://posthog.com/newsletter/ideal-customer-profile-framework)
- Lenny Rachitsky's ICP guide (paywalled) asks the reader to choose the three most distinctive traits of the ideal customer; PostHog reports most companies he spoke to had three attributes in their initial ICP — [Lenny's Newsletter](https://www.lennysnewsletter.com/p/how-to-identify-your-ideal-customer); via [PostHog](https://posthog.com/newsletter/ideal-customer-profile-framework). Full text not fetched.

**Scoring and tiering mechanics (mostly vendor)**
- Weight calibration from outcomes: score each attribute by coverage times win-rate lift, so attributes that separate wins from losses get the highest weight; weight must-haves highest, nice-to-haves lower, and subtract points for deal-breakers — [LeadMagic GTM skill (vendor)](https://leadmagic.io/gtm-skills/icp-scoring/raw); [Pedowitz Group (agency)](https://www.pedowitzgroup.com/how-do-you-define-scoring-criteria-for-accounts)
- Three-phase build: closed-won analysis to derive criteria; a weighting workshop; a calibration pass against about 200 historical accounts — [Digital Applied (agency), May 2026](https://digitalapplied.com/blog/b2b-icp-scoring-framework-2026-lead-qualification-playbook)
- Keep fit and intent as two separate scores, not one blended number — [Saber glossary (vendor)](https://www.saber.app/glossary/icp-scoring-model)
- Example tier cut-offs: Tier A 80 to 100, B 50 to 79, C 0 to 49, with Tier A expected to convert at 1.5 to 2 times Tier B's win rate — [Prospeo (vendor)](https://prospeo.io/s/icp-scoring). These are template values, not validated benchmarks.
- Recalibration cadence differs by source: quarterly or on any ICP or market change, vs after 50 deals; another says start with equal weights and compare tier conversion after about 30 days — [Pedowitz Group (agency)](https://www.pedowitzgroup.com/what-is-fit-based-account-scoring?hsLang=en); [Prospeo (vendor)](https://prospeo.io/s/icp-scoring)
- Anti-ICP scoring: explicitly identify and penalize disqualifying characteristics; a three-row rubric (Ideal / Acceptable / Low fit) plus a negative column — [Saber (vendor)](https://saber.app/glossary/anti-icp-scoring); [Understory (agency)](https://www.understoryagency.com/blog/icp-scoring-rubric-examples-b2b-saas-teams)
- Winning by Design's SPICED (Situation, Pain, Impact, Critical Event, Decision) is used by practitioners as the qualification lens; its Pain and Impact dimensions feed behavioral fit scoring — [LeadMagic (vendor, secondary on WbD)](https://leadmagic.io/gtm-skills/icp-scoring/raw). No Winning by Design primary page was fetched.

**Buying committee (extends earlier Gartner data)**
- Forrester (Hawthorne and Flaherty, 23 April 2025): five buying-group roles — decision-maker (holds budget, final call), champion (pushes for change), influencer, ratifier, user. Forrester's 2024 Buyers' Journey Survey found 13 people involved in a purchase on average. Recommendation: move from individual MQLs to buying groups, map each role, put buying-group members into CRM early. Palo Alto Networks doubled win rates in a pilot of this approach — [Forrester blog](https://www.forrester.com/blogs/the-verdict-is-in-its-buying-groups-for-the-win/)
- Forrester's 2026 State of Business Buying is reported (via a vendor release) as 13 internal stakeholders plus 9 external influencers per purchase — [Anteriad (vendor)](https://anteriad.com/press/anteriad-receives-highest-possible-score-in-buying-group-detail-criterion-in-marketing-and-sales-data-report). Not verified against Forrester.

**Benchmarks claimed for ICP discipline (unverified)**
- "68% higher account win rate" with a documented ICP (attributed to Demandbase 2024 or ITSMA 2023 depending on page) and "1.7x faster sales cycle" for ICP-fit accounts (attributed to DealHub 2024) — [The Starr Conspiracy roundup](https://www.thestarrconspiracy.com/insights/benchmarks/icp-benchmarks-b2b-gtm-2025). Attribution is inconsistent across pages; treat as unverified.
- A "StrategicEdge" consulting-firm case (win rate 54% to 67%, cycle 62 to 48 days) is described by its own publisher as based on patterns across 40+ firms, so it is a composite, not a real case — [Optif (vendor)](https://optif.ai/media/articles/consulting-firm-sales-automation-case-study/). Do not cite as a real case.

### Inferences
- Recommended ICP document structure for Karar Atlası (synthesized from Advent, PostHog, Forrester and the vendor rubrics):
  1. ICP statement in one sentence, with three to five decisive traits (PostHog/Lenny style).
  2. Firmographics: sector (NACE code), employee band, revenue band, region, ownership type (family firm, holding, listed on Borsa İstanbul, public sector, foundation).
  3. Business strength: growth, profitability, funding or investment plans, budget signal (existing consultant spend).
  4. Value-specific and technographic fit: current tools (Excel/PowerPoint, ERP such as Logo/Netsis/SAP, BI, OKR tools), existence of a strategy office or planning manager.
  5. Situation and triggers: new CEO, generational handover, board request for a 3- to 5-year plan, IPO preparation, new investor, regulatory or sustainability reporting duty, failed last plan.
  6. Pain and value: pain in buyer words, cost of current alternative, value metric the buyer would measure.
  7. Buying committee: Forrester's five roles mapped to real titles (decision-maker = CEO or board; champion = strategy/planning lead or CFO; users = department heads; ratifier = finance/IT/KVKK; influencer = external consultant).
  8. Budget and deal shape: expected ACV band, budget owner, budget cycle (fiscal year planning season), procurement steps.
  9. Disqualifiers (negative ICP) with point penalties.
  10. Scoring model: attribute table with weights, fit score, separate intent/trigger score.
  11. Tier definitions and the effort each tier gets.
  12. Sub-ICPs (see next section) and evidence log: for each claim, the interview or deal that supports it; status = hypothesis or validated.
  13. Review cadence and metrics: win rate, cycle length, activation, retention, expansion ICP vs non-ICP (Advent's governance list).
- Pre-revenue weight derivation for Karar Atlası: there is no win/loss data yet, so start with equal weights or workshop weights, label them "hypothesis," and recalibrate once 20 to 30 qualified opportunities exist. "Win-rate lift" can be replaced at first by interview outcomes: an attribute earns weight if it is present in accounts that showed strong pain plus a budget signal and absent in accounts that did not.
- Weight formula to record in the document (inference built on the coverage-times-lift idea): weight of attribute = (win rate when attribute present ÷ overall win rate) × share of won deals having the attribute; normalize weights to 100.

### Gaps
- No primary Gartner, Clari, 6sense, Pavilion, Bessemer or OpenView ICP template was found. Searches returned only vendor or third-party pages. OpenView's own playbook was not located (OpenView stopped investing in 2024; archive status unknown).
- No Winning by Design primary document on ICP or SPICED was fetched.
- No published case study with audited before/after numbers from a named SaaS company was found, apart from Advent's anonymized portfolio examples and Forrester's Palo Alto Networks pilot mention.
- The "68% higher win rate" figure could not be traced to its original source.

## When and how to split the ICP into sub-ICPs or vertical playbooks

### Takeaway
Split only when evidence shows a segment differs in alternatives, triggers, buying committee or value metric, not merely in industry label. Product-behavior and sales-motion differences (self-serve vs sales-assisted) are a stronger reason to split than firmographics. Each sub-ICP then gets its own playbook (messaging, proof, triggers, list source) under one shared positioning, consistent with Dunford's view in the earlier notes.

### Cited Findings
- Segment by actual product behavior, not just firmographics; a self-serve ICP and a sales-worthy ICP are usually different groups — Elena Verna, as summarized by [echai.ventures (secondary)](https://echai.ventures/startingup/ideal-customer/how-do-i-use-the-customers-i-already-have-to-sharpen-my-ideal-customer-profile-instead-of-guessing). Primary text not fetched.
- Advent recommends using ICP scores by territory to identify "needs for industry specialization," i.e. vertical specialization is a data-driven outcome of the ICP model, not a starting assumption — [Advent International](https://www.adventinternational.com/ideas/anchoring-on-icp-to-prioritize-sales-marketing-efforts-and-maximize-productivity)
- Dunford starts best-fit work from a short list of the best existing customers and deliberately sets aside outliers and poor-fit accounts so patterns stand out; "not every customer is good data" — summarized in [Lenny's podcast distillation (secondary)](https://podcasts-distilled-hugo-content.pages.dev/lennys-podcast-product-career-growth/april-dunford-on-product-positioning-segmentation-and-optimizing-your-sales-process/)
- One-to-few ABM groups accounts "by industry, persona, or use case," which is the practical form of a vertical playbook — [DemandScience (vendor)](https://demandscience.com/resources/blog/abm-account-tiers/)
- Bessemer's 2017 vertical SaaS material sizes vertical markets as realistic ACV × number of customers in the vertical — reported via [SlideShare copy of a Bessemer deck](https://fr.slideshare.net/bennettmathews/vertical-software-a-founders-guide-to-success). Not verified on bvp.com.

### Inferences
- Split test for Karar Atlası (inference): create a sub-ICP only if at least two of these differ between segments: (a) main competing alternative (e.g. consultants vs Excel), (b) trigger event, (c) champion title, (d) budget owner or deal size band, (e) required content (e.g. sustainability reporting templates for exporters, public-sector strategic plan format for municipalities). If only the industry name differs, keep one ICP and vary case studies.
- Candidate sub-ICPs to test (hypotheses, not findings): family-owned mid-sized industrial firms facing generational handover; holding companies with several subsidiaries needing aligned plans; firms preparing for a Borsa İstanbul listing; public institutions legally required to prepare strategic plans (the Turkish public-sector strategic planning duty under Law 5018 is well known but was not verified in this session).
- Vertical playbook structure (one page per sub-ICP): who (sub-ICP definition and disqualifiers), why now (top 3 triggers and where to see them), pain and value in buyer words, champion and committee map, competing alternative and how to win against it, proof (case or pilot from that vertical), list source, first three outreach messages, metrics.

### Gaps
- No primary Kyle Poyar, Bessemer or a16z source specifically on when to split an ICP by vertical was found.
- No Turkish evidence on which verticals buy strategy software was found.

## TAM, SAM, SOM: correct bottom-up method, mistakes, ranges and examples

### Takeaway
The accepted method for B2B SaaS is bottom-up: count accounts that match the profile, filter step by step by real buying constraints, and multiply by a realistic annual contract value. a16z prefers bottoms-up because it reflects how you will actually sell; top-down "share of a big market" estimates overstate size and ignore distribution cost. SOM must come from sales capacity math, not a flat percentage. Present low/base/high ranges and show every filter.

### Cited Findings
- a16z (Hariharan, Chen, Jordan, 23 September 2015): "we like seeing a bottoms-up analysis, which takes into account your target customer profile," willingness to pay and how you will market and sell. Top-down (market share × total market) "tends to overstate market size (why 40%?)" and ignores the cost of distribution; do not "game" the TAM for investors; existing-market sizing may understate new business models — [a16z, 16 More Startup Metrics](https://a16z.com/16-more-startup-metrics/)
- Bessemer (2017 vertical SaaS deck): multiply a realistic annual average ACV by the number of customers in the target market — via [SlideShare (secondary copy)](https://fr.slideshare.net/bennettmathews/vertical-software-a-founders-guide-to-success)
- Sequoia reportedly warns against "problem-first" TAMs that equate the size of a problem with an addressable market — [The Venture Crew (secondary)](https://theventurecrew.substack.com/p/the-only-market-sizing-guide-every?open=false). No Sequoia primary found.
- Common mistakes (vendor/blog consensus): TAM defined too broadly; TAM = SAM (no filtering done); SOM as a flat % of SAM without modeling why you win; outdated or broad data; filters that do not match a real buying constraint; the "we only need 1%" slide; using only one method — run top-down and bottom-up and investigate if they differ by more than about 3× — [Cognism (vendor)](https://www.cognism.com/blog/what-is-tam-and-how-to-calculate-it); [Landbase (vendor), April 2026](https://www.landbase.com/blog/tam-vs-sam-vs-som-calculate-b2b-2026); [Prospeo (vendor)](https://prospeo.io/s/tam-calculation)
- SOM should directly inform quota-setting and headcount planning — [Prospeo (vendor)](https://prospeo.io/s/addressable-market)
- Conflicting SOM heuristics: 1% to 5% of SAM by year 3 in some sources vs 5% to 15% in others — [Zeliq (vendor)](https://www.zeliq.com/blog/tam-sam-som); [OrangeOwl (agency)](https://orangeowl.marketing/b2b-marketing/tam-vs-sam-vs-som-guide/). No reliable benchmark; do not use either as a rule.
- A MarketingProfs 2025 article on TAM measurement mistakes exists but returned 403 — [MarketingProfs](https://www.marketingprofs.com/articles/2025/52851/tam-measurement-mistakes-b2b-addressable-market)

### Inferences
- Correct bottom-up chain for Karar Atlası (method only; all numbers must come from Turkish sources such as TÜİK business registers, TOBB, Borsa İstanbul lists, İSO 500 lists, public-institution lists):
  1. TAM (accounts): all Turkish organizations in the employee bands that plausibly run a formal strategy cycle (for example 50+ employees), across all sectors and the public sector. TAM (value) = account count × realistic ACV for that band.
  2. SAM: filter by constraints Karar Atlası can serve now: Turkish-language buyers, sectors and sizes the product fits, organizations with a budget owner for strategy work, excluding segments that need features not yet built (e.g. multi-subsidiary consolidation, on-premise only).
  3. SOM: capacity-based. SOM accounts per year = (number of sellers or founder selling hours × qualified meetings per month × 12 × win rate) plus expected inbound/partner wins; SOM value = SOM accounts × ACV. Cross-check against the SAM share this implies.
- Present every layer as a range: low / base / high, with each input's source and confidence written next to it. Vary ACV and the filter rates, not only the final number.
- Illustrative arithmetic only (hypothetical inputs, not Turkish data): if 8,000 accounts pass the SAM filters and ACV is 120,000 to 300,000 TL per year, SAM value is 0.96 to 2.4 billion TL. If one founder holds 20 qualified meetings a month at a 15% win rate, that is about 36 new accounts a year, so SOM in year 1 is about 36 × ACV, far below any "1% of SAM" claim. This shows why capacity math, not a percentage, should set SOM.
- Run a top-down sanity check too (e.g. Turkish spend on management consulting for strategy, or global strategy-execution software market × Turkey share) and explain any gap larger than about 3×.

### Gaps
- No Turkish company counts by employee band, sector or region were collected in this session (TÜİK, TOBB and KOSGEB data still need to be pulled).
- No reliable Turkish strategy-software ACV or price data was found here; pricing must come from competitor price pages or interviews.
- No primary Sequoia or Bessemer (bvp.com) market-sizing page was fetched.

## Buyer personas done properly: five rings, hypotheses with kill criteria, role separation, JTBD switch interviews

### Takeaway
BPI's primary research page defines the five rings plus a sixth "persona profile" block and insists on unscripted, double-blind interviews with recent buyers. Personas should be written first as explicit hypotheses per buying-committee role (Forrester's five roles), each with criteria that would kill or change it, then confirmed through interviews. Moesta and Spiek's timeline (first thought, passive looking, event 1, active looking, event 2, deciding, consumption) is the interview backbone that reveals triggers and the buyer's journey ring.

### Cited Findings
- BPI's own definitions: Priority Initiatives = "Pain points and trigger events that cause a buyer to look for your solution NOW"; Success Factors = "Results or outcomes that buyers expect"; Perceived Barriers = "Fears and concerns that cause buyers to do nothing or choose your competitors"; Decision Criteria = "Company and solution capabilities that buyers investigate"; Buyer's Journey = "Actions taken, resources trusted, and decision influencers involved at each step"; plus a Persona Profile = "Descriptive characteristics of decision influencers" — [Buyer Persona Institute, research page](https://buyerpersona.com/buyer-persona-research). This verifies the exact wording that the earlier notes listed as unverified.
- BPI method: "unscripted, double-blind interviews with recent buyers in your target market"; the research is also meant to establish "how many personas you need and how to define them." The page gives no interview count — [Buyer Persona Institute](https://buyerpersona.com/buyer-persona-research)
- Forrester's role set for separating personas: decision-maker, champion, influencer, ratifier, user — [Forrester blog, April 2025](https://www.forrester.com/blogs/the-verdict-is-in-its-buying-groups-for-the-win/)
- Moesta and Spiek's timeline: First Thought (often earlier than people report; probe backward); Passive Looking (noticing without shopping; hard sell fails); Event 1 (a trigger that turns interest into need); Active Looking (shopping and trade-offs, needs sharpen); Event 2 (final trigger, often a deadline); Decision, Purchase and Consumption (with the gap between imagined and actual use shaping satisfaction). Interview advice: mark "bought" first, bounce between moments, do not walk the timeline in order — [jobstobedone.org, The Timeline](https://jobstobedone.org/the-timeline/)
- Switch interview page and Moesta talks for further method detail — [jobstobedone.org, Switch Interview](https://jobstobedone.org/switch-interview/); [Business of Software, live JTBD case studies](https://businessofsoftware.org/talks/live-jobs-to-be-done-case-studies/)

### Inferences
- Persona set for Karar Atlası (hypotheses to test, mapped to Forrester roles):
  - Champion: strategy or corporate planning manager, CFO, or general manager's right hand who runs the planning cycle. Gets the full five-ring persona.
  - Decision-maker / economic buyer: CEO, owner or board (in family firms, often a family member). Gets a short persona: priority initiative, success factors, top barriers.
  - Users: department heads who enter targets and progress. Gets a user persona (tasks, frequency, friction) for UX, not for messaging.
  - Ratifier / blocker: IT and data protection (KVKK), finance or procurement. Gets an objection sheet, not a persona.
  - Influencer: external strategy consultant or board advisor. Gets a partner/influencer profile (could be a channel, not only a blocker).
- Hypothesis-with-kill-criteria format (inference; no published standard was found): for each persona write "We believe [role] in [ICP] starts looking when [trigger], judges success by [outcome], fears [barrier], and decides on [criteria]." Then write kill criteria before interviews, for example: "If fewer than 4 of the first 8 interviewed planning managers ran the last cycle themselves, this role is not the champion"; "If no interviewee can name a budget line, the economic-buyer hypothesis is wrong"; "If the trigger appears in fewer than 3 of 10 stories, drop it from the priority-initiative ring."
- Map JTBD to the rings: First Thought and Events 1 and 2 feed Priority Initiatives; push and pull feed Success Factors; anxiety and habit feed Perceived Barriers; Active Looking trade-offs feed Decision Criteria; the whole timeline feeds Buyer's Journey.
- Interview plan: interview recent switchers, including those who hired a consultant or stayed with Excel, and lost or "no decision" cases. Write each interview into a coding sheet by ring and by timeline moment, with verbatim Turkish quotes.

### Gaps
- No primary source on a per-persona sample size from BPI was found (the earlier notes' 8 to 15 range remains secondary).
- No published method for persona "kill criteria" was found; the format above is an inference based on hypothesis-driven practice.
- The switch-interview page was not fetched in full; recency and duration guidance from Moesta's primary materials remain unverified.

## ABM basics for a tiny team and validating the ICP with 15 to 30 interviews

### Takeaway
A tiny team should run a small, tiered target account list (a few dozen Tier 1 accounts with researched outreach, a few hundred Tier 2 grouped by vertical, the rest one-to-many), built from public lists and trigger signals rather than paid intent data. Tier sizes in the literature vary widely and are vendor rules of thumb. The ICP is validated when interviewed and engaged accounts that match it show clearly stronger pain, budget and conversion than non-matching ones.

### Cited Findings
- ABM tiers: one-to-one (estimates range from 1 to 10 up to 10 to 50 accounts), one-to-few (roughly 10 to 500 accounts grouped by industry, persona or use case), one-to-many (hundreds to thousands); one suggested split is 10% to 15% Tier 1, 60% to 70% Tier 2, rest Tier 3; three tiers is standard — [DemandScience (vendor)](https://demandscience.com/resources/blog/abm-account-tiers/); [Turtl (vendor)](https://turtl.co/blog/how-to-scale-abm-to-200-accounts/); [Abmatic (vendor)](https://blog.abmatic.ai/how-to-set-up-account-tiering). No ITSMA or Momentum ABM primary source was found.
- Buying-group ABM: add buying-group members and signals to CRM early, and pass buying-group insight to SDRs so they can reach other members — [Forrester blog, April 2025](https://www.forrester.com/blogs/the-verdict-is-in-its-buying-groups-for-the-win/)
- Validation signals for an ICP: retention, ratings, usage and speed to high-value events vs non-ICP; five same-profile paying customers is a good sign, ten very strong — [PostHog](https://posthog.com/newsletter/ideal-customer-profile-framework). Win rate, tenure, NPS, ACV and expansion — [Advent International](https://www.adventinternational.com/ideas/anchoring-on-icp-to-prioritize-sales-marketing-efforts-and-maximize-productivity)

### Inferences
- Public-data account list for Turkey (sources to test; not verified for completeness here): İSO 500 and İkinci 500 lists, Borsa İstanbul listed companies and KAP disclosures (new CEO, capital increase, strategy announcements), TOBB and chamber member lists, sector associations, public-institution strategic plan pages, LinkedIn job posts for "strateji" or "kurumsal planlama" roles, news of generational handover or new investors.
- Trigger signals ranked by expected strength (hypothesis): new CEO or general manager; board-mandated multi-year plan; IPO or investor entry; job posting for a strategy/planning role; public strategic-plan deadline; poor results announcement.
- Tiny-team tier plan (inference): Tier 1 = 20 to 30 accounts with a confirmed trigger and a named champion, researched one by one; Tier 2 = 100 to 200 accounts in one or two sub-ICPs, sector-specific message and case; Tier 3 = everything else in SAM, content and newsletter only.
- 15 to 30 interview validation plan (inference consistent with the earlier notes): split interviews across 2 to 3 candidate sub-ICPs (about 8 to 10 each) and across roles (champion first). Score each account after the interview on the ICP rubric. The ICP is supported if high-scoring accounts show: a recent or upcoming trigger, a named budget owner, a current paid alternative (consultant or tool), and willingness to take a next step (pilot, second meeting with the decision-maker). If high and low scorers look the same, narrow or change the attributes (PostHog's rule applied to interviews).

### Gaps
- No primary source on ABM specifically for very small or founder-led teams was found.
- No data on intent-data coverage for Turkish companies (6sense, Bombora, etc.) was found; Turkish-language intent coverage is likely weak but unverified.

## Recommended templates for the report writer

### Takeaway
The two templates below combine the cited structures (Advent attribute groups, PostHog testable traits, Forrester roles, BPI rings, Moesta timeline) into fill-in forms. Each field has a status (hypothesis or validated) and an evidence column, so the Turkish document can show what is known and what is still a guess.

### Cited Findings
- Attribute groups — [Advent International](https://www.adventinternational.com/ideas/anchoring-on-icp-to-prioritize-sales-marketing-efforts-and-maximize-productivity); testable "need / have / don't need" form — [PostHog](https://posthog.com/newsletter/ideal-customer-profile-framework); roles — [Forrester](https://www.forrester.com/blogs/the-verdict-is-in-its-buying-groups-for-the-win/); rings — [Buyer Persona Institute](https://buyerpersona.com/buyer-persona-research); timeline — [jobstobedone.org](https://jobstobedone.org/the-timeline/); bottom-up sizing — [a16z](https://a16z.com/16-more-startup-metrics/)

### Inferences
**ICP document template (one per main ICP, short version per sub-ICP)**

| Section | Fields | Weight / rule | Evidence | Status |
|---|---|---|---|---|
| 1. ICP statement | One sentence, 3 to 5 decisive traits | – | | hypothesis / validated |
| 2. Firmographics | Sector (NACE), employees, revenue, region, ownership type | points per band | | |
| 3. Business strength | Growth, investment plans, budget signal | points | | |
| 4. Tech and current alternative | Excel/PPT, consultant, ERP, BI, OKR tool | points | | |
| 5. Triggers ("why now") | List with where to observe each | separate trigger score | | |
| 6. Pain and value | Buyer-language pain, cost of status quo, value metric | – | quotes | |
| 7. Buying committee | Decision-maker, champion, users, ratifier, influencer with Turkish titles | – | | |
| 8. Deal shape | ACV band, budget owner, budget season, procurement steps | – | | |
| 9. Disqualifiers | E.g. no budget owner, wants free template only, under size threshold | minus points or exclusion | | |
| 10. Scoring and tiers | Fit score 0 to 100, trigger score, Tier 1/2/3 cut-offs and effort per tier | | | |
| 11. Sizing | TAM/SAM/SOM in accounts and TL, low/base/high, sources per input | | | |
| 12. Sub-ICPs | Split test result and one-page playbook each | | | |
| 13. Review | Metrics (win rate, cycle, activation, retention, expansion ICP vs non-ICP), date of next review | | | |

**Persona template (one full version for the champion; short versions for others)**

| Block | Content | Source quotes | Status |
|---|---|---|---|
| Role and committee position | Forrester role, typical Turkish titles, reports to | | |
| Persona profile | Responsibilities, KPIs they are judged on | | |
| Priority initiatives | Triggers that make them act now (timeline Event 1 and 2) | | |
| Success factors | Outcomes they expect, in their words | | |
| Perceived barriers | Fears that lead to "do nothing" or choosing a consultant | | |
| Decision criteria | What they check and compare | | |
| Buyer's journey | Steps, trusted sources, who else is involved, timeline from first thought to decision | | |
| Four forces | Push, pull, anxiety, habit | | |
| Hypothesis and kill criteria | "We believe ..." plus the evidence that would disprove it | | |
| Messaging implications | Key message, proof, objection answers | | |

- Every row should cite an interview ID or deal ID. Rows without evidence stay marked "hypothesis."

### Gaps
- No single published template from Gartner, Forrester, Pavilion or Winning by Design was obtained; the templates above are a synthesis and should be presented as such.
- Turkish data needed to fill the templates (company counts, ACV, titles, triggers) was not collected in this session.

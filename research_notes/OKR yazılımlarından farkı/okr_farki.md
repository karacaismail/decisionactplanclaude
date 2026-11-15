# How this strategy-planning product differs from OKR software, and whether it does what OKR programs do (state as of 15 November 2026)

Scope note: product facts below come only from the repository at `/Users/w6x/Developer/decisionactplanclaude` (read on 15 November 2026). Repository files are cited as local paths. Where a feature is absent, the note says "not found in the code". The product today is a front-end only app: "Sunucu yoktur. Veri tarayıcıda durur." (no server, data stays in the browser) — [README.md](/Users/w6x/Developer/decisionactplanclaude/README.md). "Planned" means the Frappe 16 back-end design in [docs/butunlesik-gelistirme-raporu.md](/Users/w6x/Developer/decisionactplanclaude/docs/butunlesik-gelistirme-raporu.md) sections 5 and 7; nothing there is built yet. Market facts build on [pazar_ve_rakipler.md](/Users/w6x/Developer/decisionactplanclaude/research_notes/Hedef%20kitle%20ICP%20ve%20AI%20konumland%C4%B1rma/pazar_ve_rakipler.md) (same research date). Many web sources below are vendor pages or secondary book summaries; this is flagged per line.

## Q1. What is an OKR program (Grove, Doerr, Google practice)?

### Takeaway
An OKR program is a goal-setting and alignment operating rhythm, not a strategy-formulation method: 3-5 public objectives with about 3 measurable key results each, set annually and quarterly, graded 0.0-1.0 with 0.6-0.7 as the stretch "sweet spot", mixing top-down and bottom-up input, kept separate from pay, and accompanied by CFRs (conversations, feedback, recognition). None of the canonical sources describe how to diagnose a situation, generate options, or choose between them; OKRs assume the direction is already known.

### Cited Findings
**Origin**
- Andy Grove developed the method at Intel in the 1970s as "iMBO" (Intel Management by Objectives) and documented it in *High Output Management* (1983) around two questions: where do I want to go, and how will I know I am getting there — [Wikipedia: Objectives and key results](https://en.wikipedia.org/wiki/Objectives_and_key_results); [O'Reilly: Introduction to OKRs](https://oreilly.com/content/introduction-to-okrs). Dates vary slightly between secondary sources.
- John Doerr learned it in a Grove course at Intel (reported as 1975) and introduced it to Google's founders around 1999 — [Wikipedia](https://en.wikipedia.org/wiki/Objectives_and_key_results); [Tability OKR history (vendor)](https://www.tability.io/odt/articles/a-complete-okr-history-from-intel-to-the-modern-workplace). The 1975 date was not checked against a primary source.

**Definition and structure**
- "The Objectives describe what you want to accomplish, and the Key Results describe how you know you've succeeded." — [whatmatters.com (Doerr's site)](https://www.whatmatters.com/resources/difference-between-okr-cfr)
- Google guidance: three to five objectives, about three key results each; team OKRs should connect to at least one organizational OKR — [Google re:Work, Set goals with OKRs](https://rework.withgoogle.com/en/guides/set-goals-with-okrs)

**Cadence, scoring, stretch**
- Google "sets annual and quarterly OKRs", holds quarterly company-wide meetings to share and grade them; teams may revisit OKRs several times a quarter — [Google re:Work](https://rework.withgoogle.com/en/guides/set-goals-with-okrs)
- Grading 0.0-1.0 per key result, objective gets a rough average; sweet spot 0.6-0.7; consistent full attainment means goals "aren't ambitious enough" — [Google re:Work](https://rework.withgoogle.com/en/guides/set-goals-with-okrs)
- Doerr's four "superpowers": focus, align, track, stretch; stretch OKRs expected to score about 0.4-0.6 (book summaries, not the book) — [Shortform summary](https://shortform.com/summary/measure-what-matters-summary-john-doerr); [Mindtools summary](https://www.mindtools.com/aosu220/measure-what-matters/)
- Committed vs aspirational labels: not used in the re:Work guide; I did not retrieve a primary source for that distinction in this session (see Gaps).

**Alignment vs cascading, transparency**
- OKRs are public; leaders share grades and new OKRs at company-wide meetings — [Google re:Work](https://rework.withgoogle.com/en/guides/set-goals-with-okrs)
- Effective OKRs "can often come from a mix of top-down and bottom-up suggestions" — [Google re:Work](https://rework.withgoogle.com/en/guides/set-goals-with-okrs)
- Book summaries say employees can align directly to company OKRs, skipping levels of hierarchy, and should set most of their own key results — [Shortform summary](https://shortform.com/summary/measure-what-matters-summary-john-doerr)

**Separation from compensation**
- "To encourage risk taking and prevent sandbagging, OKRs and bonuses are best kept separate." (quoted from *Measure What Matters* in summaries) — [Graham Mann book notes](https://grahammann.net/book-notes/measure-what-matters-by-john-doerr); Doerr's site article title: "Should You Connect OKRs and Compensation? (Spoiler Alert: No)" — [whatmatters.com](https://www.whatmatters.com/articles/should-you-connect-okrs-and-compensation-spoiler-alert-no)
- Laszlo Bock: when Google once tied product-usage OKRs directly to pay, "People started gaming the system to get their bonuses." — [whatmatters.com story](https://whatmatters.com/stories/okrs-separate-pay-compensation-bonuses)
- Google: OKRs are "not synonymous with employee evaluations" — [Google re:Work](https://rework.withgoogle.com/en/guides/set-goals-with-okrs)

**CFRs**
- CFRs = Conversations ("communications about work; progress, tactics, and potential bottlenecks"), Feedback (closes the gap between actions and intentions), Recognition ("positive, real-time acknowledgement for small or large wins"); with OKRs they form "continuous performance management" — [whatmatters.com](https://www.whatmatters.com/resources/difference-between-okr-cfr)

### Inferences
- The canonical OKR program has five components a tool must support: goal tree (objective + KRs), shared visibility and alignment, a recurring cadence with check-ins, scoring/grading at cycle end, and the CFR people layer. Strategy content (diagnosis, options, choice) is outside the method.
- The 0.6-0.7 stretch convention and the pay separation are cultural rules; software can only nudge them (for example by showing a grade scale), not enforce them.

### Gaps
- Primary text of *Measure What Matters* not read; stretch range 0.4-0.6, the "committed vs aspirational" distinction and the 1975 date rest on summaries.
- Google's internal (non re:Work) OKR playbook not retrieved in this session.

## Q2. What do leading OKR tools do in 2026?

### Takeaway
2026 OKR tools are execution and reporting systems: goal trees and alignment maps, KPI dashboards fed live from business systems (Salesforce, HubSpot, Jira, spreadsheets, BI tools), recurring check-ins pushed through Slack/Teams, AI that drafts goals and summarizes check-ins, and (in HR-flavoured tools) links into 1:1s, reviews and calibration. They start where this product's cluster 3 starts.

### Cited Findings
**Perdoo (SMB/mid-market, Europe)**
- Integrations: Slack, Microsoft Teams; Google Analytics, HubSpot, Looker, Power BI, Salesforce, Snowflake, Tableau; Asana, Azure DevOps, Jira, Linear, Microsoft Planner, Monday.com, Trello; Excel Online, Google Sheets; Google/Outlook calendars; BambooHR, Factorial, Okta, OneLogin, SCIM; GraphQL API, Zapier, MCP server; ChatGPT, Claude, Copilot, Gemini, Perplexity — [Perdoo integrations](https://www.perdoo.com/integrations)
- Data sources stream values into KPIs (Google Analytics "refreshed automatically", Salesforce/Snowflake real-time); work tools link items to OKRs; check-ins can run through Slack; reviews scheduled via calendar — [Perdoo integrations](https://www.perdoo.com/integrations)
- Pricing and AI: Free up to 5 users, Premium EUR 6.40, Supreme EUR 8.00 per user/month; AI agent "Spark", AI coach "Vince", token allowances — [Perdoo pricing](https://www.perdoo.com/pricing) (via existing market note)

**Tability**
- Slack check-ins, reminders, plan digests, AI conversations with its OKR agent (vendor comparison page, September 2026) — [Tability Slack page](https://www.tability.io/compare/slack)
- AI goal setting, automated check-ins, analysis, and "AI retrospectives" condensing weekly check-ins into quarterly summaries; automated check-ins on the higher tier (third-party review, prices conflict between sources) — [Makerstack review](https://makerstack.co/reviews/tability-review/); [Toolradar](https://toolradar.com/tools/tability)
- Microsoft Teams support for Tability is not confirmed by a primary source.

**Weekdone**
- Weekly PPP reports (Plans, Progress, Problems) feed a recommended 15-20 minute weekly OKR check-in meeting focused on lessons and priorities — [Weekdone PPP](https://weekdone.com/?p=844); [Weekdone check-in guidance](https://weekdone.com/?p=16552)
- Competitor critique: PPP updates are not tied to task completion, so progress cannot be verified (competitor source) — [Profit.co vs Weekdone](https://www.profit.co/okr/vs/weekdone/)

**Lattice Goals (HR suite)**
- Goals integrate with Jira and Salesforce so progress updates without manual entry; Slack and Teams integrations; goal progress used in 1:1s and performance check-ins (vendor pages) — [Lattice OKRs](https://lattice.com/platform/goals/okrs); [Lattice Goals and Compensation announcement](https://lattice.com/fr/blog/lattice-introduces-goals-and-compensation)
- Independent benchmark marks KPIs and custom views missing in Lattice — [Tability platform review: Lattice](https://www.tability.io/compare/platform/lattice)

**Betterworks (performance management)**
- Cascades company priorities into team and individual goals and brings goal evidence into reviews; calibration module; compensation is not a native module but integrates with comp systems (vendor) — [Betterworks vs UKG](https://www.betterworks.com/betterworks-vs-ukg); [G2 Betterworks reviews](https://www.g2.com/products/betterworks/reviews)
- HRIS connectors (SuccessFactors, Workday) sync profiles; no direct ERP integration (third party) — [ERP Research](https://erpresearch.com/erp-add-ons/performance/betterworks)

**Profit.co, Mooncamp, WorkBoard, Viva Goals (from existing market note)**
- Profit.co: modular OKRs & Goals, Strategy Roadmap, Balanced Scorecard, Hoshin Kanri, Performance, Projects, Engagement; "AI-native", MCP integrations — [Profit.co pricing](https://www.profit.co/pricing/)
- Mooncamp: EUR 7-10/user/month, min 5 users, no AI on pricing page — [Mooncamp pricing](https://mooncamp.com/pricing)
- WorkBoard absorbed Quantive (May 2025); AI agents ("Chief of Staff", "Portfolio Analyst" scenario modelling) — [Silicon UK](https://www.silicon.co.uk/press-release/workboard-acquires-quantive-to-strengthen-its-strategy-execution-and-okr-software-advantage-and-accelerate-innovation); [TechIntelPro](https://techintelpro.com/news/ai/enterprise-ai/workboard-launches-ai-native-strategic-portfolio-management-with-portfolio-analyst-agents)
- Microsoft Viva Goals retired 31 December 2025; Microsoft said adoption "hasn't grown" — [Microsoft Learn](https://learn.microsoft.com/viva/goals/goals-retirement)

**Strategy-execution suites (Cascade, ClearPoint)**
- ClearPoint: project tracking with budget, percent complete, milestones; budgets linked to a measure of strategic project spend vs plan; alerts when spend nears budget; strategy maps; initiatives board with dependencies and resource allocation; AI can auto-generate scorecards, OKRs, KPIs and a strategy map (vendor) — [ClearPoint features](https://clearpointstrategy.com/features); [ClearPoint project management](https://www.clearpointstrategy.com/solutions/project-management)
- ClearPoint targets organizations "that already have goals or a strategy" — [ClearPoint pricing](https://www.clearpointstrategy.com/pricing)
- Cascade: Tapestry AI (AI-assisted planning, flags duplications, dependencies, execution risks) — [Cascade Tapestry](https://www.cascade.app/tapestry/ai-assisted-planning)

### Inferences
- Table-stakes in 2026 OKR software: goal tree with alignment, live KR/KPI progress from integrations, Slack/Teams check-in nudges, AI drafting and summarizing, exec dashboards. HR-oriented tools (Lattice, Betterworks) add 1:1s, reviews and calibration.
- Strategy-execution suites add initiative/project portfolios and budget-vs-plan, which OKR tools mostly lack.
- Every tool assumes the objectives are already right; none found validates the strategic choice behind them.

### Gaps
- Did not verify Cascade's budget features or Mooncamp/Profit.co integration lists on primary pages in this session.
- No independent data on how many customers actually use auto-updating integrations vs manual check-ins.

## Q3. Critiques of OKRs as strategy, failure data, and the "strategy gap"

### Takeaway
Strategy scholars agree goals are not strategy: Rumelt lists "mistaking goals for strategy" as a hallmark of bad strategy and defines strategy as a kernel of diagnosis, guiding policy and coherent action; Roger Martin warns OKRs become an "implicit substitute for strategy" and that desire for a key result does not cause it. Practitioner data (vendor-reported, so biased) say 60%+ of OKR rollouts disappoint, and the main failure is the operating rhythm dying, not bad software. Sull, Homkes and Sull's HBR study adds that execution fails more from poor coordination and agility than from misalignment, which questions tools that only add alignment.

### Cited Findings
**Rumelt**
- Four hallmarks of bad strategy: fluff, failure to face the challenge, mistaking goals for strategy, bad strategic objectives; the kernel = diagnosis, guiding policy, coherent action (secondary summaries of *Good Strategy Bad Strategy*) — [Leading Sapiens](https://www.leadingsapiens.com/leaders-mistakes-okr-strategy/); [Mooncamp book summary](https://mooncamp.com/blog/good-strategy-bad-strategy-book-summary)
- No interview where Rumelt himself discusses OKRs was found; OKR critiques citing him are by others.

**Roger Martin**
- Martin argues OKRs can become an "implicit substitute for strategy" and are better seen as a complement; "desire (as with hope) is simply not a strategy" — summarized in [Jeff Gothelf, "OKRs are not strategy"](https://jeffgothelf.com/blog/okrs-are-not-strategy) (Gothelf credits a conversation with Martin) and the podcast [What's Next! with Tiffani Bova: Why your OKRs aren't working, with Roger Martin](https://whatsnextpodcast.libsyn.com/why-your-okrs-arent-working-with-roger-martin)
- Martin's planning critique: plans are not explicit about what the organization chooses not to do and why; rewriting project plans as OKRs is planning, not strategy (secondary) — [Sunsama blog summary](https://sunsama.com/blog/building-strategy-via-questions)
- Martin's primary Medium essay "Stop Letting OKRs Masquerade as Strategy" was not retrieved; quotes above are second-hand.
- Practitioner echo: Lane Shackleton (Coda): "OKRs are not actually strategy. It's critical to disconnect strategy discussions from OKR discussions." — [skills.sh summary of Lenny's podcast](https://skills.sh/refoundai/lenny-skills/setting-okrs-goals) (weak source)

**Failure rates (all vendor or consultancy sources, treat as directional)**
- OKR Institute (May 2026, "1,000+ implementations"): 60%+ of OKR implementations fail to deliver expected results — [OKR Institute](https://okrinstitute.org/why-okrs-fail/)
- OKR International survey (cited by Tability): 78% of teams could not get OKRs right at first introduction — [Tability](https://tability.io/odt/articles/bring-the-okr-pain-forward)
- Profit.co: more than half of enterprise OKR programs are reduced or abandoned after year one — [Profit.co](https://www.profit.co/blog/okr-university/why-most-enterprise-okr-programs-fail-in-year-two/)
- Perdoo: most companies pilot with 1-2 teams and never reach company-wide adoption with executive ownership — [Perdoo blog](https://www.perdoo.com/blog/why-okr-programs-fail-and-how-to-keep-yours-alive)
- Microsoft retired Viva Goals because adoption "hasn't grown" — [Microsoft Learn FAQ](https://learn.microsoft.com/en-us/viva/goals/goals-retirement-faq)

**Execution research**
- Sull, Homkes and Sull, HBR March 2015, survey of nearly 8,000 managers in 250+ companies: myth 1 is "execution equals alignment"; failures stem more from lack of coordination across units and lack of agility; tightening alignment controls (more metrics) makes employees feel micromanaged (secondary summaries) — [O'Reilly HBR Guide chapter](https://www.oreilly.com/library/view/hbr-guide-to/9781647825164/html/11_3__Why_Strategy_Execution_Unrave.xhtml); [Becker's summary](https://www.beckershospitalreview.com/hospital-management-administration/5-misconceptions-on-strategy-execution-exposed/)

**This product already takes the Rumelt/Martin position (repository evidence)**
- 2.1 Teşhis help text: "Tek cümle yazın. Bir hedef ya da bir çözüm yazmayın." (write one sentence; not a goal or a solution); frameworks listed include Rumelt and Lafley and Martin — [src/data/steps/strateji.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/steps/strateji.ts); [src/data/clusters.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/clusters.ts)
- Design doc rejects vision/mission writing as a stage: "Rumelt'e göre hedef ve vizyon strateji değildir" and classifies "Dengeli karne, OKR, Hoshin Kanri" as tools for doing 3.1 and 3.2, not stages — [docs/sonraki-ana-asamalar-plani.md](/Users/w6x/Developer/decisionactplanclaude/docs/sonraki-ana-asamalar-plani.md)
- Process map moves goals out of the choice step: "Hedef ve iş, seçimin değil uygulamanın parçasıdır." (goals and tasks belong to execution, not to choice) — [docs/surec-haritasi.md](/Users/w6x/Developer/decisionactplanclaude/docs/surec-haritasi.md) section 8
- The method library contains OKR as model 65 ("Herkes çok çalışıyor ama aynı yöne mi koşuyoruz?"), and step 3.1 links to it via `models: [65]` — [src/data/models.json](/Users/w6x/Developer/decisionactplanclaude/src/data/models.json); [src/data/steps/strateji.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/steps/strateji.ts)

### Inferences
- The "strategy gap" is two-sided: OKR tools start after the choice (no diagnosis, options, trade-offs), and Sull's data suggest alignment tooling alone does not fix execution. This product covers the upstream side and has a deliberate "Seçim hâlâ doğru mu?" loop back to formulation (3.5), which OKR cycles lack.
- Positioning claim that is defensible: "OKRs measure the strategy; this product makes and re-tests the choice". Claiming OKR failure rates as proof is weak because the figures are vendor-produced.

### Gaps
- No peer-reviewed study on OKR failure rates found; all numbers are from vendors or consultancies.
- HBR original text (pages 58-67) not read; figures are from summaries.
- No MIT SMR article on OKR pitfalls retrieved in this session.

## Q4. Capability table: typical OKR tool vs strategy-execution suite vs this product today vs planned

### Takeaway
Today the product is strong exactly where OKR tools are empty (diagnosis, options, testing, choice with trade-offs, evidence and readiness gate, decision records) and thin where OKR tools are strong (recurring check-ins, actuals over time, team alignment, integrations, people layer). The planned back-end closes the actuals and spend gaps (Hedef, Gözlem, Kaynak İzni, Kaynak Hareketi, offline sync) but plans no goal tree, no third-party integrations and no people/performance link.

### Cited Findings
Legend: yes, partial, no, planned, n/v (not verified). Product evidence follows the table.

| Capability | Typical OKR tool (Perdoo, Tability, Lattice, Weekdone) | Strategy-execution suite (Cascade, ClearPoint) | This product today | This product as planned |
|---|---|---|---|---|
| Strategy diagnosis | no | partial (strategy maps, AI-generated plan; no structured diagnosis found) | yes (2.1, S21) | yes (same rules moved to server) |
| Option generation | no | partial (WorkBoard scenario modelling; Cascade/ClearPoint n/v) | yes (2.2, S22, 2-5 options) | yes |
| Option testing | no | no found | yes (2.3, S23: must-be-true, weakest condition, 4-criteria score) | yes |
| Choice and trade-off recording | no | no found | yes (2.4, step 19: chosen path, reason, winning aim, field, "Vazgeçilenler") | yes (Strateji Onayı record) |
| Evidence and readiness gate | no | no found | yes (9 mandatory + 7 supporting criteria, 3 outcomes) | yes (Kanıt, Kanıt Sürümü, Geçiş Kararı) |
| Decision log with rationale | partial (comments, check-in notes) | partial (n/v) | yes (gate decisions, transition record, strategy reviews) | yes (Kapı Kararı, Karar Dayanağı, Olay Kaydı, rule version) |
| Resource permits and spend tracking | no | yes in ClearPoint (budget vs plan, alerts) | partial (3.3 allocation, free budget calc; no actual spend) | planned (Kaynak İzni, Kaynak Hareketi) |
| Goal setting | yes | yes | yes (3.1: 1 objective, max 3 indicators) | yes (versioned Hedef) |
| KPI targets vs actuals over time | yes (live KPIs) | yes | partial (3.1 has baseline + target, no actual; Gate 6 one-off actuals in step 25) | planned (Gözlem, append-only actuals) |
| Cascading or alignment across teams | yes | yes | no | no (not found in plan) |
| Weekly or quarterly check-ins | yes (Slack/Teams nudges) | yes | partial (weekly question toggle, weekly table text, ad hoc review record) | partial (review has "sonraki kontrol tarihi"; no reminders found) |
| Scoring/grading 0-1.0, stretch | yes | partial | no | no |
| Progress integrations (Jira, Salesforce, HubSpot, sheets) | yes | yes | no (JSON backup download only) | no (headless API only; no connectors found) |
| People/performance link (1:1, reviews, CFR) | yes in HR tools (Lattice, Betterworks) | no/partial | no | no |
| AI goal writing / summaries | yes | yes | no (no AI found in src) | not found in sections 5/7 |
| Mobile field observations | partial (mobile apps for check-ins) | n/v | partial (phone-first UI; no observation record) | planned (Gözlem incl. "hedefsiz saha notu", Capacitor app) |
| Offline | no found | no found | partial (data in localStorage; no service worker found) | planned (device-first writes, sync, append-only merge) |
| Strategy re-test loop back to formulation | no | no found | yes (3.5: Sürdür, Düzelt, Yeniden aç) | yes (Strateji Gözden Geçirme with deviation cause) |

**Product evidence, today**
- 2.1-2.5 definitions and frameworks; 3.1-3.5 definitions; 3.5 state "Bu alt aşama bir döngüdür... Hiç bitmez." — [src/data/clusters.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/clusters.ts)
- S21 fields `diagnosis`, `diagnosisWhy`, `setAside`; S22 `options` repeater minRows 2 maxRows 5 with `source` and `difference`; S23 `tests` (`mustBeTrue`, `weakest`, `how`, `result`) and `fit` score matrix (tutarlılık, uyum, avantaj, yapılabilirlik); S25 `moves` max 5 with `capability` — [src/data/steps/strateji.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/steps/strateji.ts)
- Step 19 (2.4) fields `chosenPath`, `choiceReason`, `winningAim`, `playField`, `givenUp` (all required); strategy document step with 11 headings and a counter view; completion needs 5 quality items and `approvedBy` — [src/data/steps/karar5.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/steps/karar5.ts); [src/engine/strategy.ts](/Users/w6x/Developer/decisionactplanclaude/src/engine/strategy.ts) (`DOSSIER_KEYS`, `QUALITY_MIN = 5`)
- Readiness gate: Z1-Z9 mandatory and D1-D7 supporting criteria; outcomes "Planlamaya hazır", "Koşullu hazır", "Henüz hazır değil"; software only suggests, decision owner records — [src/engine/readiness.ts](/Users/w6x/Developer/decisionactplanclaude/src/engine/readiness.ts); [docs/surec-haritasi.md](/Users/w6x/Developer/decisionactplanclaude/docs/surec-haritasi.md) section 4
- 3.1 U31: `objective` (required, 160 chars) and `keyResults` repeater "En çok üç gösterge" with `kr`, `baseline`, `target`; validation only demands a target number; no actual-value field — [src/data/steps/strateji.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/steps/strateji.ts); `goalIssues` in [src/engine/strategy.ts](/Users/w6x/Developer/decisionactplanclaude/src/engine/strategy.ts). Note the internal key names are literally OKR terms.
- 3.2 U32: `now` (first 90 days), `next`, `later` repeaters with `action`, `owner`, `dueDate`; every first-90-day task needs one owner and a date; `weeklyBottleneck` toggle "Haftalık darboğaz sorusu takvimde mi?" — [src/data/steps/strateji.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/steps/strateji.ts); `taskIssues` in [src/engine/strategy.ts](/Users/w6x/Developer/decisionactplanclaude/src/engine/strategy.ts)
- 3.3 U33: `resources` (item, `budgetKurus`, people/hours), `resourceTotal` calc against free budget, required `resourceOwner`, optional `resourceShift` (where money/people were pulled from) — [src/data/steps/strateji.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/steps/strateji.ts)
- No gate reads 3.1-3.3, so changing them never stales a decision (user decision, 15 November 2026) — [docs/surec-haritasi.md](/Users/w6x/Developer/decisionactplanclaude/docs/surec-haritasi.md) section 3
- Karar 6 measurement: step 22 customer journey funnel, "Tek önemli sayı" (north star), three measures + benefit measure, harm limit, `weeklyTable` text; step 25 gate records achieved values per measure, harm seen, runway, pivot pattern — [src/data/steps/karar6.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/steps/karar6.ts)
- Karar 7 step 26 learning cycles: hypothesis, metric, threshold, change, result, expected, happened, why, keep; output "Güncel karar günlüğü" — [src/data/steps/karar7.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/steps/karar7.ts)
- Karar 8 step 33: score Büyüt, Sürdür, Devret, Kapat; chosen direction; rollback plan; successor; "Karara yeniden bakılacak olay" — [src/data/steps/karar8.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/steps/karar8.ts)
- 3.5 review record: `decidedBy`, `holds`, `decision` (sürdür, düzelt, yenidenAc), `reason` (min 20 chars), `evidence`; "Yeniden aç" returns strategy doc to draft and stales gates 6-8 — [src/engine/renewal.ts](/Users/w6x/Developer/decisionactplanclaude/src/engine/renewal.ts); [src/data/types.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/types.ts) (`StrategyReview`, no next-check date field today)
- Storage: zustand `persist` to `localStorage` key `decisionactplan-v1`; JSON download for backup with 7-day warning; no PWA/service worker entry found in `vite.config.ts` or `package.json` — [src/engine/sync.ts](/Users/w6x/Developer/decisionactplanclaude/src/engine/sync.ts); [src/store/planStore.ts](/Users/w6x/Developer/decisionactplanclaude/src/store/planStore.ts); [docs/surec-haritasi.md](/Users/w6x/Developer/decisionactplanclaude/docs/surec-haritasi.md) "Yedek uyarısı"
- Integrations: grep for jira, slack, hubspot, salesforce, webhook in `src` found none. AI: grep for "yapay zek", openai, anthropic, llm in `src` found none. The process map states the software does not diagnose, choose or propose moves — [docs/surec-haritasi.md](/Users/w6x/Developer/decisionactplanclaude/docs/surec-haritasi.md) section 7
- Team alignment: "Organizasyonu hizalama" was explicitly eliminated as a stage ("Tek kurucuda boş kalır... Sorumluluk 3.2'de duruyor") — [docs/sonraki-ana-asamalar-plani.md](/Users/w6x/Developer/decisionactplanclaude/docs/sonraki-ana-asamalar-plani.md)

**Product evidence, planned (not built)**
- Hedef (append-only, versioned: indicator, unit, period, value, link to 3.1 row) and Gözlem (append-only actuals linked to a Hedef version, event time vs arrival time, source evidence version, corrections chain; field notes without a target allowed) — [docs/butunlesik-gelistirme-raporu.md](/Users/w6x/Developer/decisionactplanclaude/docs/butunlesik-gelistirme-raporu.md) section 5.2
- Limit: Gate 6 keeps reading step 22 measures; merging the two measurement places is "ayrı bir iş" (separate work) — same section 5.2
- Görev DocType (plan, task, owner, date, status, linked decision) — section 5.2
- Kaynak İzni (two types: conditional permit tied to a gate decision; allocation permit tied to strategy approval and a 3.3 row; four closing states) and Kaynak Hareketi (append-only use, refund, correction; payment ID unique per plan; over-permit moves flagged for review); free budget = spend limit minus pre-strategy spend minus movements minus unspent open permits; "Yazılım bankadaki ödemeyi yapmaz" — section 5.3
- Strateji Gözden Geçirme adds "sapmanın nedeni" (teslim aksadı → Düzelt; dayanak çöktü → Yeniden aç; bilinmiyor → Sürdür ve ölç) and "sonraki kontrol tarihi" — section 5.3
- Workflows: "Gözlem ekle" works offline, never edits old rows, does not grant spend; "Hedefi değiştir" adds a version; "Yeniden aç" keeps permits open; re-approval closes old allocation permits — section 7.2
- Roles: Plan Üyeliği (user, role, dates) — section 5.1; no goal hierarchy across teams found in sections 5 or 7.

### Inferences
- On the canonical OKR checklist (Q1), the product today covers objective + KRs (structurally), partly covers cadence, and does not cover scoring, alignment, transparency across teams, or CFRs. It is therefore not an OKR tool, and "does it do what OKR programs do?" has the honest answer "only the goal-writing part, for one plan".
- The planned Hedef + Gözlem pair is the minimum needed to report targets vs actuals over time, which is the single most common thing buyers expect from an OKR or KPI tool.

### Gaps
- Cascade's and ClearPoint's handling of diagnosis/options was not verified on product pages, only marketing claims.
- Whether planned Görev records support status updates over time (check-in history) is not specified beyond a status field.

## Q5. Can the product complement OKR tools? Which integrations matter for the Turkish ICP?

### Takeaway
Yes. The product's natural hand-off object is the approved strategy (2.4 choice + 2.5 key moves + 3.1 goal); this maps cleanly onto an OKR tool's objectives and key results, and OKR tools' live KR values map onto planned Gözlem rows. Several vendors expose an API or MCP server (Perdoo GraphQL + MCP, Profit.co MCP, ClearPoint API/MCP add-on), so a thin export/import is cheap to build. For the Turkish SMB/founder ICP, spreadsheet, accounting/e-invoice (Paraşüt, Logo, Mikro) and messaging links matter more than Jira or Salesforce.

### Cited Findings
- Perdoo offers a GraphQL API, Zapier and an MCP server that lets custom agents read and update Perdoo — [Perdoo integrations](https://www.perdoo.com/integrations)
- Profit.co markets MCP integrations for ChatGPT, Claude and its own MCP — [Profit.co pricing](https://www.profit.co/pricing/) (via existing market note)
- ClearPoint prices "API and MCP access" as an add-on driver — [ClearPoint pricing](https://www.clearpointstrategy.com/pricing) (via existing market note)
- Product mapping points: S25 `moves` (max 5, each with `serves` and `capability`), U31 `objective` + `keyResults` (`kr`, `baseline`, `target`), U32 tasks with `owner` and `dueDate` — [src/data/steps/strateji.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/steps/strateji.ts)
- Planned Gözlem has a "kaynak kanıt sürümü" (source evidence) link and separate event/arrival times, which suits imported values — [docs/butunlesik-gelistirme-raporu.md](/Users/w6x/Developer/decisionactplanclaude/docs/butunlesik-gelistirme-raporu.md) section 5.2
- Planned front end is headless and talks to the server only via API — [docs/butunlesik-gelistirme-raporu.md](/Users/w6x/Developer/decisionactplanclaude/docs/butunlesik-gelistirme-raporu.md) "Kısa cevap"
- Turkish accounting landscape: Paraşüt is a cloud pre-accounting product with a REST API described by an integrator as developer-friendly and 200+ integrations; Logo (founded 1984) is described as Turkey's largest listed software company; Mikro is an established SMB/retail vendor. Market-share figures found are unsourced integrator claims — [Zunapro integration guide](https://www.zunapro.com/turkey/tr/blog/muhasebe-programi-entegrasyonu-e-ticaret-rehberi); [Paraşüt about](https://www.parasut.com/hakkimizda). Ownership claims about Paraşüt (TeamSystem partnership vs Sage) conflict between sources.
- Turkish OKR startup Twiser/Wokr (2021 data, current status unverified) worked with MESS — [Webrazzi, 8 October 2021](https://webrazzi.com/2021/10/08/yapay-zeka-destekli-performans-yonetimi-sistemi-twiser/) (via existing market note)
- Central-government performance programmes are prepared in the SBB web system programbutce.sbb.gov.tr — [SBB 2027-2029 guide](https://www.sbb.gov.tr/wp-content/uploads/2026/09/2027-2029Rehber_Bolum7.pdf) (via existing market note)

### Inferences
- Export direction (product → OKR tool): one objective per approved strategy from U31, KRs from `keyResults`, initiatives from S25 moves, owners/dates from U32, plus a back-link to the strategy document version. This lets enterprise buyers keep Perdoo/Profit.co/WorkBoard for team rollout while this product owns the choice.
- Import direction (OKR tool or BI → product): KR current values as Gözlem rows with source = external system; never write back into the choice. The 3.5 review then reads observed values instead of free text `evidence`.
- Turkish ICP priority (inference, not measured): (1) CSV/Excel and Google Sheets import of actuals (most SMBs track numbers in sheets), (2) Paraşüt and Logo/Mikro read-only import of revenue and spend to feed Kaynak Hareketi and Gözlem, (3) WhatsApp or e-mail summaries rather than Slack/Teams (Slack penetration in Turkish SMBs was not measured), (4) Perdoo/Profit.co export only for larger customers, (5) SBB format export only if public-sector buyers are targeted.
- Any reminder or digest feature conflicts with the user's standing rule against creating scheduled jobs on the agent side; server-side scheduled notifications would be a DevOps decision (owner: Hüseyin Cengiz) and need explicit approval.

### Gaps
- No data on which tools Turkish SMB founders actually use for KPIs (Excel vs Paraşüt dashboards vs nothing).
- Paraşüt, Logo and Mikro API scope and terms were not verified on official developer docs.
- WhatsApp Business API cost and rules for automated summaries in Turkey not researched.

## Q6. Should the product avoid becoming "another OKR tool"? Minimal execution must-haves

### Takeaway
Yes. The OKR category is crowded, cheap (median public price about USD 8/user/month), consolidating (Quantive into WorkBoard, Viva Goals shut down) and suffers adoption failure; competing there dilutes the only clear gap found (formulation, readiness gate, explicit trade-offs, re-test loop). But a strategy product with no way to see targets vs actuals forces a second tool, which would make 3.5 "Seçim hâlâ doğru mu?" run on memory. The minimum execution layer is: versioned targets, dated actuals, a light recurring review with a next-check date, task owner/status, and permit-based spend tracking, plus import/export so larger customers can keep their OKR tool.

### Cited Findings
- 13 of 23 maintained OKR platforms publish pricing; median start price USD 8/user/month; Tability, Perdoo, Mooncamp cluster at USD 6-11 — [Tability benchmark 2026.Q3](https://www.tability.io/compare/pricing/cascade) (via existing market note)
- Viva Goals retired 31 December 2025 for lack of adoption growth; WorkBoard acquired Quantive in May 2025 — [Microsoft Learn](https://learn.microsoft.com/viva/goals/goals-retirement); [Mergr](https://mergr.com/transaction/workboard-acquires-quantive)
- Spreadsheet staleness: teams update only before review meetings — [Waymaker](https://www.waymakeros.com/learn/okrs-fail-in-spreadsheet) (via existing market note)
- Sull et al.: more alignment metrics can create micromanagement; coordination and agility matter more — [O'Reilly HBR Guide chapter](https://www.oreilly.com/library/view/hbr-guide-to/9781647825164/html/11_3__Why_Strategy_Execution_Unrave.xhtml)
- Product already limits scope deliberately: max 3 indicators in 3.1, max 5 key moves in 2.5, a field budget test (max 240 fields pre-strategy; new fields break the test) — [src/data/steps/strateji.ts](/Users/w6x/Developer/decisionactplanclaude/src/data/steps/strateji.ts); [docs/surec-haritasi.md](/Users/w6x/Developer/decisionactplanclaude/docs/surec-haritasi.md) "Alan bütçesi"
- Product rule: the software never answers "Seçim hâlâ doğru mu?"; decision owner records it — [docs/surec-haritasi.md](/Users/w6x/Developer/decisionactplanclaude/docs/surec-haritasi.md) section 7
- Known internal duplication: Gate 6 reads step 22 measures while 3.1 holds the strategy goal; merging is open work — [docs/butunlesik-gelistirme-raporu.md](/Users/w6x/Developer/decisionactplanclaude/docs/butunlesik-gelistirme-raporu.md) section 5.2

### Inferences
**Must-have (so customers do not need a second tool)**
1. Actual values over time against 3.1 targets (planned Gözlem + versioned Hedef). Today 3.1 has no actual field at all.
2. One measurement model: merge step 22 measures and 3.1 indicators, or clearly label them (venture-validation metrics vs strategy goals), otherwise users see two goal lists.
3. Task status over time for U32 items (planned Görev has a status field; history not specified).
4. Recurring 3.5 review with "sonraki kontrol tarihi" shown on screen, and the review reading latest Gözlem values as evidence.
5. Permit-based spend tracking (planned Kaynak İzni and Kaynak Hareketi) — this is a differentiator against OKR tools, which have no budget layer, and matches what ClearPoint charges for at enterprise level.
6. CSV/Sheets import of actuals and a structured export of the approved strategy (objective, KRs, moves, owners).

**Integrate rather than build**
- Live connectors to Jira, Salesforce, HubSpot, BI tools; Slack/Teams nudges; multi-level goal trees for 50+ person organizations. Offer export to Perdoo/Profit.co/WorkBoard via their APIs or MCP instead.

**Deliberately leave out**
- 0.0-1.0 grading and stretch culture management (meaningful only with many teams and repeated quarterly cycles; the ICP is often a single founder, see `team` profile and "Tek kurucuda" notes in [docs/surec-haritasi.md](/Users/w6x/Developer/decisionactplanclaude/docs/surec-haritasi.md)).
- CFRs, 1:1s, performance reviews, calibration and compensation links (HR suites own this; Doerr himself argues OKRs should be kept apart from pay).
- AI that writes goals or chooses paths, which would contradict the product's stated rule that the strategist proposes and the decision owner chooses.

**Messaging risk**
- Internal field keys `objective` and `keyResults` and the OKR model link (model 65) are fine internally, but marketing "OKR" would put the product into a USD 6-11 per seat comparison. A safer frame: "strateji seçimi ve sınaması; OKR aracınız ölçsün" (choice and re-test; let your OKR tool measure), with OKR shown as one method inside 3.1.

### Gaps
- No customer interviews in the repository on whether target users already use an OKR tool; the need for import/export is inferred.
- No pricing research on what Turkish SMBs would pay for the execution layer separately.
- Not verified whether any OKR vendor plans formulation features in 2027 (WorkBoard scenario modelling is the closest signal).

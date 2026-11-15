# AI's role in strategic planning and strategic decision software (as of 15 November 2026)

Scope note: Research done 15 November 2026 with web search (about 16 tool calls). Evidence (randomized experiments, peer-reviewed papers, large surveys) is marked separately from opinion (vendor marketing, analyst forecasts). Some primary pages could not be opened (Wiley returned HTTP 403), so a few figures rest on abstracts or search summaries. This is flagged where it applies.

## 1. Empirical evidence on AI in strategy and knowledge work

### Takeaway
Strong experimental evidence shows that GenAI raises the average quality and speed of knowledge work *inside* its capability frontier. Outside that frontier it makes people faster but less accurate. Gains are uneven: weaker performers who pick hard, open-ended problems can be harmed. AI also narrows the diversity of ideas. For evaluating strategic options, single AI judgments are inconsistent and biased, while aggregated judgments agree better with experts.

### Cited Findings

**Jagged technological frontier (BCG / Harvard, Dell'Acqua et al., 2023, published in Organization Science)**
- Design: preregistered randomized experiment with 758 BCG consultants, about 7% of BCG's individual-contributor consultants. Arms were no AI, GPT-4, and GPT-4 plus a prompt-engineering overview. — [SSRN working paper via MIT Sloan](https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf); [Organization Science record via EBSCO](https://www.ebsco.com/articles/social-sciences-and-humanities/ae8300a6-197d-54c5-b89b-a9c0240104cb/navigating-the-jagged-technological-frontier-field-experimental-evidence-of-the-effects-of-artificial-intelligence-on-knowledge-worker-productivity-and-quality)
- Inside the frontier (creative, analytical, writing, persuasion tasks): 12.2% more tasks completed, over 30% higher quality in the abstract, about 25% less time. Press often cites "40% quality gain"; the number differs by source and metric. — [SSRN via MIT Sloan](https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf); [VentureBeat](https://venturebeat.com/ai/enterprise-workers-gain-40-percent-performance-boost-from-gpt-4-harvard-study-finds)
- Outside the frontier (a business-problem task designed so GPT-4 gives a convincing but wrong answer): consultants using AI were faster but less accurate. — [HBS Working Knowledge](https://www.library.hbs.edu/working-knowledge/humans-vs-machines-untangling-the-tasks-ai-can-and-cant-handle); [SSRN via MIT Sloan](https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf)
- Concept: tasks that look equally hard to experts can fall on opposite sides of the AI capability boundary. — [SSRN via MIT Sloan](https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf)
- Authors flagged homogenization: GPT-4 raised average quality but produced more uniform outputs. — [SSRN via MIT Sloan](https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf)
- HBS Working Knowledge headline says "750" but its body says 758; 758 is the paper's figure. — [HBS Working Knowledge](https://www.library.hbs.edu/working-knowledge/humans-vs-machines-untangling-the-tasks-ai-can-and-cant-handle)

**Cybernetic Teammate (P&G field experiment, Dell'Acqua et al., NBER w33641, 2025; Organization Science)**
- Design: P&G professionals randomly assigned to AI or no AI, and to solo or two-person team, on real product-innovation challenges. Working paper reports 776 participants; the published Organization Science version reports 791. — [NBER](https://www.nber.org/papers/w33641); [Organization Science](https://pubsonline.informs.org/doi/full/10.1287/orsc.2025.20702)
- Results: individuals with AI improved by 0.37 SD, matching teams without AI (0.24 SD). Teams with AI improved by 0.39 SD; the solo-AI vs team-AI gap was not statistically significant. — [NBER PDF](https://www.nber.org/system/files/working_papers/w33641/w33641.pdf); [One Useful Thing (co-author's blog)](https://www.oneusefulthing.org/p/the-cybernetic-teammate)
- Without AI, R&D staff proposed technical solutions and commercial staff proposed commercial ones. With AI, both produced balanced solutions (AI broke functional silos). Less experienced staff benefited most. Participants reported more positive emotions with AI. — [NBER](https://www.nber.org/papers/w33641); [One Useful Thing](https://www.oneusefulthing.org/p/the-cybernetic-teammate)

**Uneven effects for business decisions (Otis, Clarke, Delecourt, Holtz, Koning; Kenya RCT; Management Science version listed 2026)**
- Design: RCT with 640 Kenyan entrepreneurs over about five months. Treatment got a GPT-4 business mentor via WhatsApp; control got a standard business guide. — [NBER conference paper](https://conference.nber.org/conf_papers/f194654.pdf); [Berkeley Haas](https://newsroom.haas.berkeley.edu/research/gen-ai-experiment-shows-mixed-results-in-helping-small-businesses-grow/)
- No average effect on business performance. High baseline performers gained about 15%; low performers saw about 8% lower revenue. — [Berkeley Haas](https://newsroom.haas.berkeley.edu/research/gen-ai-experiment-shows-mixed-results-in-helping-small-businesses-grow/); [eScholarship](https://escholarship.org/content/qt0fb001r8/qt0fb001r8.pdf)
- Mechanism: both groups used the AI, but low performers asked it about harder, more open-ended problems. The authors argue effects depend on which tasks people hand to AI, and that complementary skills are needed. — [Berkeley Haas magazine](https://newsroom.haas.berkeley.edu/magazine/spring-2025/ineffective-counsel/)

**AI for evaluating strategic decisions (Doshi et al., Strategic Management Journal, 2025)**
- Two studies: Study 1 used 60 AI-generated business models; Study 2 used business models submitted to a competition. Individual GenAI evaluations were inconsistent and biased. Aggregating many AI evaluations increased agreement with human experts. (Source: abstract via search; full text returned HTTP 403, so sample details beyond this are unverified.) — [SMJ / Wiley](https://sms.onlinelibrary.wiley.com/doi/full/10.1002/smj.3677)

**Human-AI idea generation vs crowd (Boussioux, Lane, Zhang, Jacimovic, Lakhani; Organization Science 35(5), 2024)**
- Design: circular-economy challenge with 125 human solvers vs human-AI solutions made by prompt engineering. 300 external evaluators each rated 13 of 234 solutions (3,900 evaluator-solution pairs). An earlier draft used 145 evaluators and 1,885 pairs. — [Harvard DASH](https://dash.harvard.edu/entities/publication/2366e45c-863a-470c-bacd-831b3b9938ba); [RePEc](https://econpapers.repec.org/RePEc:inm:ororsc:v:35:y:2024:i:5:p:1589-1607)
- Human crowd ideas scored higher on novelty (average and in the top tail). Human-AI ideas scored higher on strategic viability, financial and environmental value, and overall quality. "Differentiated search" prompting (asking the model to differ from earlier outputs) beat independent prompting. — [HBS D^3 summary](https://d3.harvard.edu/?p=25140); [BU working paper PDF](https://bu.edu/dbi/files/2023/11/Crowdless_Future_111323_Digital_BU.pdf)
- A cost comparison (about $27 for human-AI vs about $2,555 for the crowd) comes from a secondary wiki, not verified in the paper. — [AI wiki summary](https://businessdatasolutions.github.io/ai-wiki/sources/2026-04-29-boussioux-crowdless-future)

**Homogenization of ideas (Doshi & Hauser, Science Advances 10(28), eadn5290, 2024)**
- Online experiment: writers given AI story ideas wrote stories rated more creative, with the biggest gains for less creative writers. But AI-assisted stories were more similar to each other: individuals gain, the collective loses diversity. — [Science Advances via PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11244532); [Exeter repository](https://ore.exeter.ac.uk/articles/journal_contribution/Generative_AI_enhances_individual_creativity_but_reduces_the_collective_diversity_of_novel_content/29809991)
- Mitigation evidence: a 2026 study reports diverse AI personas can preserve story diversity versus a human-only baseline. — [Open University of Israel record](https://cris.openu.ac.il/en/publications/diverse-ai-personas-can-mitigate-the-homogenization-effect-in-hum/)
- An arXiv preprint reports that AI users explicitly incentivized to be unique reach higher diversity than those without that incentive (preprint, not peer reviewed). — [arXiv 2604.03529](https://arxiv.org/pdf/2604.03529)

**Over-reliance and critical thinking (Lee et al., Microsoft Research and CMU, CHI 2025)**
- Survey of 319 knowledge workers who use GenAI at least weekly, with 936 real task examples. Higher confidence in GenAI was associated with less critical thinking; higher self-confidence with more. — [Microsoft Research](https://www.microsoft.com/en-us/research/?p=1135061); [The Register](https://www.theregister.com/2025/02/11/microsoft_study_ai_critical_thinking/)
- Critical thinking shifts toward verifying AI output, integrating responses and overseeing tasks. — [Microsoft Research blog, CHI 2025](https://www.microsoft.com/en-us/research/?p=1136647)
- Reported counts: 58 participants said limited domain knowledge made verification hard; 83 said trust in AI discouraged reflection. These counts come from secondary coverage only. — [PPC Land](https://ppc.land/study-reveals-complex-shift-in-workplace-critical-thinking-due-to-ai-tools/)
- Note: this is self-reported correlational survey evidence, not a causal experiment.

**Executives following AI against their own judgment (survey evidence, not experiments)**
- SAP/Wakefield survey (March 2025, 300 US C-suite executives, vendor-sponsored): 44% would override a decision they had already planned based on AI insights; 85% of board members favor AI-driven advice vs 58% of non-board executives. — [SAP News](https://news.sap.com/2025/03/new-research-executive-trust-ai/); [eWeek](https://www.eweek.com/news/ai-trust-executives-sap-study/)
- A survey of 500 C-suite executives (August to September 2025): 31% follow an AI recommendation even when it conflicts with their own judgment; only 39% report formal governance and escalation for AI-driven decisions. Sponsor and method are not clear from the secondary source. — [remio.ai summary](https://www.remio.ai/post/board-ai-decision-making-survey-finds-cfo-trust-outrunning-governance)

**LLM forecasting accuracy (Forecasting Research Institute, ForecastBench)**
- Fall 2025 update: superforecasters still led; best model (GPT-4.5) Brier 0.101 vs superforecasters 0.081 (lower is better). Trend extrapolation projected parity around November 2026 (95% CI December 2025 to January 2028). — [FRI Substack](https://forecastingresearch.substack.com/p/ai-llm-forecasting-model-forecastbench-benchmark)
- A later FRI post says several AI systems are now statistically indistinguishable from superforecasters, and one ranked above them on market questions. Leaderboard entries may use tools, added context, fine-tuning and ensembling. Post date not confirmed. — [FRI Substack](https://forecastingresearch.substack.com/p/ai-models-have-likely-reached-parity)
- Bridgewater AIA Labs reports a system equal to human superforecasters on ForecastBench (company technical report). — [arXiv 2511.07678](https://arxiv.org/pdf/2511.07678v1.pdf)
- Limits: ForecastBench uses only binary yes/no questions; results are stochastic; leakage concerns are acknowledged in related work. — [FRI Substack](https://forecastingresearch.substack.com/p/ai-llm-forecasting-model-forecastbench-benchmark); [LessWrong review of 11 analyses](https://www.lesswrong.com/posts/a82q6yd8zKpYk56cF/ai-forecasting-in-2026-what-11-analyses-say)

**Other strategy-specific studies found but not verified**
- Qualitative case (2025, 27 executive interviews, February to April 2025): organizations struggle to move GenAI from pilots to routine decision inputs. — [Journal of Decision Systems, Taylor & Francis](https://www.tandfonline.com/doi/full/10.1080/12460125.2025.2597835)

### Inferences
- The best-supported pattern for strategy software is "AI drafts, widens and checks; humans judge and choose." Quality gains appear on drafting, synthesis and option generation. Harm appears when people accept a plausible but wrong answer on a task outside the frontier, which is exactly what high-stakes strategic choices often are.
- Because single AI evaluations are inconsistent (Doshi et al. SMJ 2025), any AI scoring of options should use multiple runs or ensembles and show spread, not one confident number.
- Homogenization is a real risk for a strategy product: if every customer's strategist uses the same model with the same prompts, options converge toward the same "consensus" strategy. Differentiated-search prompting and diverse personas are evidence-backed mitigations.
- The Kenya RCT suggests AI may hurt weaker users most on open-ended problems. A product aimed at less experienced strategists needs scaffolding (structure, checklists, evidence requirements), not just a chat box.
- Forecasting: on narrow binary questions, AI is near superforecaster level by late 2026. Strategy questions are usually not binary or resolvable, so this does not transfer directly. AI probability estimates can be one input with an explicit uncertainty display.

### Gaps
- Wharton work (for example Girotra, Terwiesch, Ulrich, Meincke on GPT-4 idea generation and on prompting for diverse ideas) and INSEAD work were not retrieved in this session; numbers are not reported here.
- No randomized study was found that measures the *quality of real corporate strategic decisions* (outcomes over years) with vs without AI. Existing evidence is on tasks, ideas, evaluations or small-firm outcomes.
- Kanis, Mann, Stumpf-Wollersheim, Strategy Science 11(1), 75 to 92 (2026), an experiment on AI-augmented strategic decisions under time pressure, appeared only in a search summary. No page was opened, so its findings are not reported.
- Doshi et al. SMJ full text was blocked (HTTP 403); exact sample sizes of Study 2 and effect sizes are unverified.
- No primary automation-bias study in strategy settings was retrieved (classic automation-bias literature is mostly aviation, medicine).

## 2. Which strategy tasks AI does well and which it should not do

### Takeaway
Evidence supports AI for drafting, synthesis, idea and option generation, cross-functional balance, red-teaming and aggregated evaluation. Evidence and governance both argue against AI making the final choice, owning accountability, approving gates, or changing records silently. No study directly tests every task in the founder's list; several are inferences from the frontier evidence.

### Cited Findings
- Writing, analysis, creative and persuasive tasks are inside the frontier: higher quality and speed. — [SSRN via MIT Sloan](https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf)
- Option and idea generation: human-AI solutions scored higher on strategic viability and overall quality than crowd ideas, but lower on novelty. — [HBS D^3](https://d3.harvard.edu/?p=25140)
- Cross-functional balance: AI helped specialists produce balanced technical-plus-commercial proposals. — [NBER w33641](https://www.nber.org/papers/w33641)
- Evaluating options: single AI ratings are inconsistent and biased; aggregation improves agreement with experts. — [SMJ / Wiley](https://sms.onlinelibrary.wiley.com/doi/full/10.1002/smj.3677)
- Tasks outside the frontier where AI gives confident wrong answers make users less accurate. — [HBS Working Knowledge](https://www.library.hbs.edu/working-knowledge/humans-vs-machines-untangling-the-tasks-ai-can-and-cant-handle)
- Verification is harder when the user lacks domain knowledge. — [PPC Land summary of Lee et al.](https://ppc.land/study-reveals-complex-shift-in-workplace-critical-thinking-due-to-ai-tools/)
- Gartner predicts that by 2028, 15% of day-to-day work decisions will be made autonomously by AI agents (up from 0% in 2024). This is "day-to-day work decisions", not strategic decisions. — [Gartner press release, 25 June 2025](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027)
- 94% of 900 CEOs (Dataiku/Harris Poll, 2026) say they would be comfortable telling their board that AI tools shaped a strategic recommendation, which suggests "AI shaped it" is acceptable but implies a human still recommends. — [The Source Code](https://www.the-sourcecode.com/ai-tech/ceos-ai-accountability-confidence-2026)

### Inferences
Suggested task map for the product (evidence strength in brackets):

AI should do:
- Research synthesis and evidence gathering with citations to versioned evidence [strong for synthesis quality; provenance is a design requirement, not studied here].
- Drafting option memos, rationale and decision documents [strong: inside frontier].
- Option generation using differentiated or diverse-persona prompting to widen the set [moderate to strong].
- Red-teaming, devil's advocate and pre-mortems on the strategist's options [moderate: inferred from evaluation and balance results; counters homogenization and over-confidence].
- Multi-run, aggregated scoring of options against criteria, shown with spread [moderate: Doshi et al.].
- Consistency checks: missing evidence, contradictions between options and evidence versions, readiness-gate checklist gaps [inference; low-risk because outputs are checkable].
- Summarizing interviews and meetings, meeting prep, KPI anomaly flags [inference; inside-frontier tasks].
- Probability or scenario estimates as labeled inputs [moderate on binary questions only].

AI should not do:
- Make the final choice or record the decision [governance plus over-reliance evidence: 31% of executives follow AI against their own judgment].
- Own accountability; the decision owner must remain the named owner [governance reasoning].
- Approve readiness gates or finalize decisions; only the server-side human action should do this [design inference consistent with the product's "finalized only on server" rule].
- Fabricate evidence or cite sources that are not in the evidence store [frontier evidence on confident wrong answers].
- Silently change records, evidence versions or decision rationale; every AI edit should be a proposal with a diff [inference].
- Set budgets or commit resources autonomously [inference; Gartner cancellation risk tied to inadequate risk controls].

### Gaps
- No direct experimental evidence was found for pre-mortems, KPI anomaly detection or interview summarization in strategy settings specifically.
- No evidence was found on how AI-generated red-team critiques change the final decision owner's choice quality.

## 3. Design patterns for AI-native B2B decision software (2025 to 2026)

### Takeaway
Leading strategy and OKR vendors (WorkBoard, which acquired Quantive, and Cascade) now market embedded agents for planning, reviews and portfolio analysis. Their accuracy is not independently tested. Regulation adds concrete design duties: EU AI Act Article 50 transparency obligations apply from 2 August 2026, including machine-readable marking of AI-generated content.

### Cited Findings
- WorkBoard acquired Quantive (StrategyAI) in 2025; the two product lines are being combined. — [BusinessWire, 28 May 2025](https://www.businesswire.com/news/home/20250528302450/en); [01net](https://www.01net.it/workboard-acquires-quantive-to-strengthen-its-strategy-execution-and-okr-software-advantage-and-accelerate-innovation/)
- WorkBoard made "Digital Chief of Staff" and "Leadership Coach" agents generally available, embedded in its strategy execution system, with support for A2A and MCP agent protocols and Microsoft 365 Copilot integration. — [BusinessWire, 27 May 2025](https://www.businesswire.com/news/home/20250527067665/en/WorkBoard-Announces-General-Availability-of-Its-Digital-Chief-of-Staff-and-Leadership-Coach-Agents-and-Expanded-Capabilities-for-Microsoft-365-Copilot-Agent)
- WorkBoard later announced an AI-native strategic portfolio management product with "portfolio analyst" agents. — [theatdb news](https://www.theatdb.com/news/workboard-extends-its-strategy-execution-platform-with-new-ai-native-strategic-portfolio-management-solution-and-portfolio-analyst-agents)
- Quantive markets StrategyAI as covering planning to adaptation, AI-assisted plan and goal creation, and continuous monitoring that can initiate strategy reviews (vendor claim). — [Quantive blog](https://quantive.com/resources/blog/quantive-strategyai); [Quantive comparison article](https://quantive.com/resources/articles/quantive-strategyai-vs-ai-strategy-platforms)
- Cascade's AI runs on "Tapestry AI"; Cascade calls itself the leading AI-powered strategy execution platform (vendor claim). Quantive claims Cascade lacks scenario simulation (competitor claim). — [Cascade blog](https://cascade.app/blog/best-ai-strategy-platforms); [Quantive vs Cascade page](https://quantive.com/lp/quantive-strategyai-vs-cascade-strategy)
- A third-party comparison notes several WorkBoard AI features depend on Microsoft and Workday ecosystems. — [ClearPoint Strategy](https://www.clearpointstrategy.com/blog/ai-strategic-planning-software-comparison)
- No independent tests of these agents' accuracy were found. — [G2 comparison (reviews only)](https://www.g2.com/compare/quantive-strategyai-vs-workboard)
- Gartner warns of "agent washing": of thousands of agentic AI vendors, only about 130 are real. — [Gartner, 25 June 2025](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027)
- EU AI Act Article 50 obligations apply from 2 August 2026. The May 2026 AI Omnibus provisional agreement gives GenAI systems already on the market until 2 December 2026 for machine-readable marking under Article 50(2). A visible label alone is not enough for the marking duty. Penalties reach EUR 15 million or 3% of global turnover. — [artificialintelligenceact.eu guide](https://artificialintelligenceact.eu/transparency-rules-article-50/); [AI News](https://www.artificialintelligence-news.com/news/eu-ai-act-article-50-transparency-rules-enter-force/); [GDPR Local](https://gdprlocal.com/eu-ai-act-article-50/)
- Article 50(1) and 50(2) duties fall mainly on providers; 50(3) and 50(4) on deployers. — [artificialintelligenceact.eu guide](https://artificialintelligenceact.eu/transparency-rules-article-50/)
- Differentiated search prompting improves human-AI solutions; diverse personas reduce homogenization (design-relevant evidence). — [HBS D^3](https://d3.harvard.edu/?p=25140); [Open University of Israel](https://cris.openu.ac.il/en/publications/diverse-ai-personas-can-mitigate-the-homogenization-effect-in-hum/)

### Inferences
Design principles for this product, derived from the evidence above (opinion, not tested):
1. "AI proposes, human disposes": AI output is always a proposal object (draft option, critique, check result). Only the decision owner's server-side action finalizes a decision or passes a gate. This matches the product's existing server-final rule.
2. Provenance by default: every AI claim links to a specific evidence item *and version*. Claims without a source are labeled "unsupported" and cannot enter a final decision record.
3. Separate AI content from human content in the record: store model, prompt version, time, inputs and the human's accept, edit or reject action. This gives an audit trail and supports EU AI Act Article 50 machine-readable marking.
4. Show uncertainty and disagreement: run evaluations several times or with several personas and show the spread. This follows Doshi et al. and counters single-answer authority.
5. Friction at the right place: before the owner records a decision, require the owner's own rationale, and show the AI red-team critique. Microsoft's CHI 2025 survey suggests high trust in AI lowers critical thinking, so the UI should invite checking.
6. Diversity by design: generate options with differentiated prompts and require at least one non-AI or contrarian option, to fight homogenization.
7. Readiness gates as checks AI can run but not pass: AI reports what is missing; a human approves.
8. Evals: maintain an evaluation set (known-good and known-bad option memos, evidence-citation tests, hallucination tests) and track it per model version. No vendor in this research published such evals for strategy agents, so this can be a differentiator.

### Gaps
- No primary source on HITL design guidelines (for example Microsoft HAX, Google PAIR) or EU AI Act Article 14 automation-bias text was retrieved in this session.
- Vendor docs give no detail on whether their agents can change records directly or only propose changes.
- Pricing and adoption numbers for vendor AI features were not found.

## 4. Executive attitudes, trust and adoption barriers

### Takeaway
Use is broad but value is thin. Most CEOs report no clear financial return yet, and agent scaling is rare. Executives already let LLMs influence strategy, often without governance. Trust in deploying agents fell from 2025 to 2026.

### Cited Findings
- McKinsey State of AI 2025 (survey of 1,993 participants in 105 countries, 25 June to 29 July 2025, published November 2025): 88% of organizations use AI in at least one function (78% a year earlier). — [McKinsey](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai); [IDM summary](https://idm.net.au/node/15415)
- McKinsey 2025: 62% at least experimenting with AI agents (one figure), McKinsey page also cites 39% "begun experimenting"; the gap likely reflects different questions. In any single function, no more than 10% report scaling agents. High performers are at least 3 times more likely to scale agents. — [McKinsey](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai)
- PwC 29th Global CEO Survey (4,454 CEOs, 95 countries, released 19 January 2026): about 30% saw higher revenue from AI, 26% lower costs (22% higher costs). Only 12% saw both; 56% saw neither. Only 30% are confident in 12-month revenue growth (38% in 2025, 56% in 2022). — [PwC CEO Survey](https://www.pwc.com/gx/en/ceo-agenda/ceosurvey/); [PwC 2026 PDF](https://www.pwc.com/gx/en/ceo-survey/2026/pwc-ceo-survey-2026.pdf); [PwC Barbados press release](https://www.pwc.com/bb/en/press-releases/2026-global-ceo-survey.html)
- Dataiku/Harris Poll 2026 (900 CEOs): "extremely confident" in deploying agents at scale fell from 41% (2025) to 31% (2026). — [The Source Code](https://www.the-sourcecode.com/ai-tech/ceos-ai-accountability-confidence-2026)
- 61% of executives cite LLMs (ChatGPT, Claude, Gemini, Copilot) among the external sources that most influence their strategic decisions; 39% have formal governance for AI-driven decisions (survey of 500 C-suite, August to September 2025; secondary source). — [remio.ai summary](https://www.remio.ai/post/board-ai-decision-making-survey-finds-cfo-trust-outrunning-governance)
- SAP/Wakefield (300 US C-suite, March 2025, vendor-sponsored): 44% would reverse a planned decision based on AI insight. — [SAP News](https://news.sap.com/2025/03/new-research-executive-trust-ai/)
- Financial Times study: three-quarters of leaders hold back decisions because they do not know which data to trust. — [InPublishing](https://www.inpublishing.co.uk/articles/financial-times-study-finds-three-quarters-of-leaders-dont-know-what-data-to-trust-26701)
- Gartner January 2025 poll (3,412 webinar attendees): 19% said their organization made significant agentic AI investments. — [Gartner, 25 June 2025](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027)

### Inferences
- The buyer problem in late 2026 is not "access to AI" but "trusted, governed AI for decisions". Executives already use LLMs for strategy informally, with weak governance. A product that makes AI use visible, sourced and auditable addresses a gap the surveys show directly.
- Data trust (FT study) is a barrier that versioned evidence directly targets. This supports positioning AI around evidence quality rather than autonomous strategy.

### Gaps
- McKinsey State of AI 2026 edition (if published November 2026) was not found in this session.
- No 2025 or 2026 Gartner, BCG or Deloitte survey specific to *AI for strategic decisions* was found; current evidence here is mostly vendor- or publisher-sponsored surveys.
- Several survey figures come from secondary summaries with unclear methods (remio.ai, The Source Code).

## 5. 2027 outlook: agentic AI and strategy work

### Takeaway
Analysts are bullish long-term but warn of a shakeout. Gartner expects over 40% of agentic AI projects to be canceled by end of 2027, and expects agentic AI in one-third of enterprise apps by 2028. Strategy vendors are already shipping agents. Forecasting-grade AI may reach expert level on narrow questions.

### Cited Findings
- Gartner (25 June 2025): over 40% of agentic AI projects will be canceled by end of 2027 due to rising costs, unclear business value or inadequate risk controls. Gartner advises pursuing agentic AI only where value or ROI is clear. — [Gartner](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027)
- Gartner: by 2028, one-third of enterprise applications will include agentic AI, and 15% of day-to-day work decisions will be made autonomously by agents. — [Gartner](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027)
- FRI projected LLM parity with superforecasters on ForecastBench around November 2026; a later FRI post says parity is likely already reached. — [FRI fall 2025](https://forecastingresearch.substack.com/p/ai-llm-forecasting-model-forecastbench-benchmark); [FRI parity post](https://forecastingresearch.substack.com/p/ai-models-have-likely-reached-parity)
- EU AI Act transparency and marking duties start 2 August 2026, with a grace period to 2 December 2026 for existing GenAI systems' machine-readable marking. — [artificialintelligenceact.eu](https://artificialintelligenceact.eu/transparency-rules-article-50/)
- Strategy vendors already ship agents (WorkBoard Digital Chief of Staff, portfolio analyst agents; Quantive continuous review). — [BusinessWire](https://www.businesswire.com/news/home/20250527067665/en/WorkBoard-Announces-General-Availability-of-Its-Digital-Chief-of-Staff-and-Leadership-Coach-Agents-and-Expanded-Capabilities-for-Microsoft-365-Copilot-Agent); [Quantive](https://quantive.com/resources/blog/quantive-strategyai)

### Inferences
- "AI in the genes" is table stakes by 2027 in this category, since incumbents already market agents. Differentiation is more likely in *trustworthy* AI: provenance, evaluation, auditability and a clear human decision boundary. This matches Gartner's cancellation reasons (unclear value, weak risk controls).
- The founder's claim that "AI changes everything by 2027" is partly supported (adoption is near universal, agents are spreading) and partly contradicted (most CEOs report no financial return; agent scaling is rare; 40%+ cancellations forecast). The safer stance: AI changes how strategy work is prepared and checked, while the choice and accountability stay human.

### Gaps
- No analyst forecast specific to "strategy work" or "strategic planning software" for 2027 was found.
- No newer (2026) Gartner update to the 40% cancellation figure was found.

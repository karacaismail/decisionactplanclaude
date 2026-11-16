# AI design for Karar Atlası: models, grounding, trust, evaluation, agents, cost (as of 16 November 2026)

Scope note: Research done 16 November 2026 with web search and fetches (about 45 tool calls, more than the usual budget because the brief had nine questions). This file extends, and does not repeat, three earlier notes: `research_notes/Hedef kitle ICP ve AI konumlandırma/ai_rolu_strateji.md` (BCG, P&G, Kenya RCT, Doshi SMJ, homogenisation, Lee CHI 2025, Gartner, McKinsey, PwC global), `ai_mevzuat_guven_maliyet.md` (EU AI Act Omnibus, KVKK Article 9, ZDR, regions, list prices, liability) and the AI section of `reports/Hedef kitle ICP ve AI konumlandırma.md`. Where a fact is already there, this file points to it instead of restating it. Record names (Kanıt, Kanıt Sürümü, Kapı Kararı, Kaynak İzni, Gözlem, Olay Kaydı, Özellik Anahtarı) come from `docs/butunlesik-gelistirme-raporu.md` sections 5 and 7.

Evidence labels used below: [peer-reviewed], [preprint], [vendor claim], [vendor doc], [secondary], [own calculation], [inference].

## 1. Turkish language quality of LLMs, and which open models can run in Türkiye

### Takeaway
No public 2025–2026 benchmark ranks current frontier models (Claude 5.x, GPT-5.x, Gemini 3.x) on Turkish under one protocol. Frontier evidence for Turkish is old (TurkishMMLU, 2024) or narrow (a Turkish medical exam, 2026), and it shows frontier models near the top. For open-weight models there is good Turkish evidence: TurkBench (January 2026) puts gpt-oss-120b, GLM-4.6, DeepSeek-V3.1 and Qwen3-Next-80B at the top. A September 2026 Turkish document-QA study shows that 7–8B models on a 6 GB laptop GPU reach 49–75% accuracy, with large differences in abstention. Turkish-only fine-tunes do not reliably beat good multilingual models (Cetvel), except Trendyol-LLM-8B-T1 on document QA, which pays for it with 14 times slower answers.

### Cited Findings

**Frontier models on Turkish**
- TurkishMMLU (Yüksel et al., EMNLP 2024 Findings): 10,032 multiple-choice questions in nine subjects from the Turkish curriculum. On the 5-shot subset, GPT-4o scored 83.1, Claude 3 Opus 79.1, GPT-4-Turbo 75.7, Claude 3 Sonnet 67.3, Gemini 1.0 Pro 63.2. Gemini 1.5 Pro scored 25.0, which is near chance and probably an evaluation artefact. 43 models were tested. [peer-reviewed] — [arXiv 2407.12402](https://arxiv.org/abs/2407.12402v1); [HTML v2](https://arxiv.org/html/2407.12402v2)
- These are 2024 model generations. No newer frontier rerun of TurkishMMLU was found. A community TurkishMMLU leaderboard exists, but its page did not render in this session. — [Turkish MMLU Leaderboard (HF Space)](https://alibayram-turkish-mmlu-leaderboard.hf.space/)
- Turkish Medical Specialty Exam (TUS), medical genetics questions, Frontiers in Medicine 2026: GPT-5.1 97.9%, Claude Opus 4.5 96.6%, Gemini 3 Pro 96.1%. The authors say accuracy is close and the models differ more in speed, length and error pattern. Narrow domain, single exam. [peer-reviewed; numbers from search summary] — [Frontiers in Medicine 2026](https://www.frontiersin.org/journals/medicine/articles/10.3389/fmed.2026.1946188/full)
- Anthropic's own multilingual table (Global-MMLU, scores as % of the model's English score) lists 14 non-English languages for Claude Fable 5.2, Opus 5.5, Sonnet 5.5 and Haiku 5.5. Turkish is not in the table. Example values: Opus 5.5 is 99.1–99.3% of English for German, Arabic and Korean; Haiku 5.5 drops to 87.0% on Yoruba. The page says Claude works in many unlisted languages and tells builders to test their own languages and to set the response language in the system prompt. [vendor doc] — [Claude multilingual support](https://platform.claude.com/docs/en/build-with-claude/multilingual-support)

**Turkish benchmarks for open-weight models**
- Cetvel (KUIS-AI, arXiv August 2025, listed in EACL 2026): 23 tasks in seven categories, including grammatical error correction, translation, and QA on Turkish history and idioms. 33 open models up to 70B were tested. Turkish-centric instruction-tuned models generally trailed multilingual models such as Llama 3 and Mistral. Grammatical error correction and extractive QA separated models best. [peer-reviewed; per-task scores not opened] — [arXiv 2508.16431](https://arxiv.org/pdf/2508.16431); [EACL 2026 PDF](https://preview.aclanthology.org/ingest-eacl/2026.eacl-long.46.pdf)
- TurkBench (Toraman et al., METU and others including Turkcell AI, arXiv 11 January 2026): 8,151 samples, 21 subtasks (7 open-ended, 14 multiple choice), six categories including instruction following and content moderation. 27 open models. Overall averages: gpt-oss-120b 78.6, GLM-4.6 76.9, DeepSeek-V3.1 75.2, Qwen3-Next-80B-Instruct 75.0, Gemma-3-27B-it 73.0. Bottom: Kumru-2B 27.3, Qwen3-0.6B 29.5, TDM-8B 30.0. No closed models were scored; GPT-4o-mini was the judge for open-ended tasks. Turkish prompts beat English prompts. The authors say even strong systems "struggle with culturally grounded reasoning". [preprint] — [arXiv 2601.07020](https://arxiv.org/html/2601.07020v1)
- Turkish document QA under hardware limits (Hassan, Akbulut, Kaya et al.; Edge Hill University and Ermetal Otomotiv; arXiv 23 September 2026): five open models at 4-bit (Q4_K_M) on Ollama, RTX 3050 laptop GPU with 6 GB VRAM, 4,096-token context. Two real Turkish documents, 100 questions each, including 20 questions with no answer in the document. [preprint] — [arXiv 2609.28007](https://arxiv.org/html/2609.28007v1)
  - Accuracy on the 109-page industrial R&D report: Trendyol-LLM-8B-T1 75%, Qwen2.5-7B 65%, Cosmos Turkish-Llama-8B 54%, Mistral-7B 51%, Kocdigital-LLM-8B 49%. On the 112-page KVKK 2024 activity report: Trendyol 82%, Qwen2.5 65%, Cosmos 60%, Kocdigital 58%, Mistral 51%.
  - Correct refusals on the 20 unanswerable questions: Qwen2.5 19/20, Trendyol 18/20, Cosmos 18/20, Mistral 13/20, Kocdigital 9/20.
  - Mean seconds per question: Qwen2.5 1.69, Mistral 2.63, Cosmos 3.21, Kocdigital 5.75, Trendyol 23.86 (thinking tokens). Trendyol is about 14 times slower than Qwen2.5 for about 10 points more accuracy.
  - Retrieval was the bottleneck on the harder document: evidence recall at a 3,500-character budget was 57% (character TF-IDF) to 65% (BM25). Multilingual E5 and hybrid retrievers were not significantly better than character TF-IDF (McNemar, all p > 0.05). Larger budgets (9,000 characters) raised recall to 76%.
- A search summary says Trendyol-LLM-8B-T1 is a Turkish–English model built on Qwen3-8B. The fetched paper text did not confirm the base model. [secondary] — [search result pointing to arXiv 2609.28007](https://arxiv.org/html/2609.28007v1)
- An older Turkish LLM paper (MRL 2024) lists Turkcell-LLM-7b-v1 and Trendyol models among results; one table row shows Turkcell-LLM-7b-v1 at 43.09 / 44.91 / 28.35. Metric labels were not verified. [peer-reviewed workshop] — [ACL Anthology 2024.mrl-1.21](https://aclanthology.org/2024.mrl-1.21.pdf)
- A curated list of Turkish models, datasets and papers is maintained on GitHub. — [awesome-turkish-language-models](https://github.com/kesimeg/awesome-turkish-language-models)

**Hardware for in-country hosting**
- Qwen3.5-27B: the official vLLM recipe says BF16 needs one H200 or two H100. The FP8 build fits on one 40 GB-class GPU (H100, H200 or L40S), with up to 262K context. [vendor doc] — [vLLM recipe Qwen3.5-27B](https://recipes.vllm.ai/Qwen/Qwen3.5-27B)
- Gemma 4 31B: the official vLLM recipe uses two A100/H100 at BF16 (tensor parallel 2). Third-party estimates put BF16 at about 61–62 GB and FP8 at about 31–34 GB; a 4-bit QAT build is reported to fit on an L40S 48 GB. Sources conflict; no source confirmed FP8 on a single L40S. [vendor doc + secondary] — [vLLM recipe Gemma 4 31B](https://recipes.vllm.ai/Google/gemma-4-31B-it); [Yotta Labs, 5 Oct 2026](https://www.yottalabs.ai/post/gemma-4-hardware-requirements-gpu-memory-2026); [Spheron QAT guide](https://www.spheron.network/blog/deploy-gemma-4-qat-gpu-cloud/)
- Gemma 4 was released on 2 April 2026 under Apache 2.0. — [Wikipedia: Gemma](https://en.wikipedia.org/wiki/Gemma_(language_model))
- Turkish GPU hosting: Cloud4U offers L40S and H100 configurations from a Türkiye data centre with per-minute billing, prices on request. DTCloudNow offers GPU-as-a-service in Turkish data centres for enterprise and public sector, prices not published. No published Turkcell or Türk Telekom GPU price was found. [vendor pages] — [Cloud4U Türkiye](https://www.cloud4u.com/news/cloud4u-ai-infrastructure-turkey/); [DTCloudNow GPU Cloud](https://dtcloudnow.com/en/products/gpu-cloud/)
- International reference prices: H100 80 GB on-demand about USD 2.63–3.95 per hour across providers (AIMultiple); hyperscalers USD 3.00–6.98 and marketplaces USD 0.90–2.79 per hour (GPUnex, a vendor blog). These are not Turkish prices. [secondary] — [AIMultiple GPU index](https://aimultiple.com/tr/gpu-index); [GPUnex](https://www.gpunex.com/tr/blog/rent-vs-buy-gpu-server)

### Inferences
- Frontier models are the right default for Turkish drafting quality. The evidence is indirect (TurkishMMLU 2024, TUS 2026, strong multilingual parity on other languages), so Karar Atlası must run its own Turkish eval set before choosing a model (see section 4). Do not quote a vendor's multilingual table as proof for Turkish; Anthropic's table does not include Turkish.
- For an "in-country AI" tier (public bodies, banks, payment firms), a realistic 2026 stack is one FP8 Qwen3.5-27B or Gemma 4 31B on one or two H100/L40S class GPUs in a Turkish data centre, served with vLLM. Smaller 7–8B models fit in 6 GB but reach only 49–75% on Turkish document QA, which is not good enough for drafting that executives will read. Use them only for classification, routing and short summaries.
- Abstention behaviour varies more than accuracy between small models (9/20 to 19/20). Any in-country model must pass the same "refuse when evidence is missing" test as the cloud model before it is switched on.
- Retrieval quality, not model quality, limited the Turkish QA study on hard documents. Invest first in chunking, larger context budgets and lexical plus semantic retrieval over Kanıt Sürümü text.
- Turkish-only fine-tunes (Turkcell, Kocdigital, Cosmos) do not yet justify a default choice. Trendyol-LLM-8B-T1 is the one to test, with its latency cost.

### Gaps
- No 2026 Turkish benchmark result was found for Claude Opus/Sonnet 5.5, GPT-5.4/5.5 or Gemini 3.x on general or business writing. This is the biggest gap; it must be filled by an in-house eval.
- Cetvel per-model scores and the live Cetvel leaderboard were not read.
- No Turkish benchmark for long-form business writing quality (strategy memos, Turkish formal register, plain-language rule) was found.
- No price list from Turkish GPU providers was found.
- Turkish tokeniser overhead (tokens per word versus English) for current Claude, GPT and Gemini tokenisers was not measured in this session. Cost estimates in section 9 assume 1.5 times English and flag it.

## 2. Grounding: RAG over a plan's own evidence versions, citations, refusal, hallucination

### Takeaway
Grounding cuts hallucination sharply but does not remove it. On a large English summarisation benchmark, current frontier models still add unsupported content to about 3–14% of summaries; the best-in-class retrieval products in law still erred 17–33% of the time in a 2024 Stanford study. Two design levers have good support: API-level citations that return exact source spans (so every claim points to a specific Kanıt Sürümü), and a refusal test set. Reasoning ("thinking") models are not automatically better at staying grounded.

### Cited Findings
- Vectara hallucination leaderboard (updated 22 October 2026): over 7,700 articles, 50 to 24K words, summarised only from the source; HHEM-2.3 scores factual consistency; hallucination rate = 100 − consistency. Selected rates (answer rate in brackets): GPT-5.4 7.0% (99.9%), GPT-5.5 9.3% (100%), Claude Opus 5.5 9.9% (99.7%), Claude Haiku 4.5 9.8% (99.5%), Claude Sonnet 4.6 10.6% (99.9%), Gemini 3.1 Pro preview 10.4% (99.4%), Gemini 3 Pro preview 13.6%, Qwen3-8B 4.8%, Gemma-4-31B-it 7.4% (100%), Gemma-4-26B-A4B 5.2%, Llama-3.3-70B 4.1%, Mistral Large 2411 4.5%, DeepSeek-V4-Pro 8.6%. Range over all models: 1.8% to 24.2%. The dataset is English and not public. [vendor benchmark] — [Vectara leaderboard GitHub](https://github.com/vectara/hallucination-leaderboard)
- A secondary analysis of Vectara's refreshed data says reasoning or thinking models did worse on grounded summarisation. [secondary] — [Suprmind summary](https://suprmind.ai/hub/ai-hallucination-rates-and-benchmarks-in-2026/)
- Stanford RegLab/HAI (Magesh et al., Journal of Empirical Legal Studies): over 200 preregistered legal queries. Lexis+ AI and Westlaw AI tools, both RAG-based, hallucinated 17% to 33% of the time. General chatbots had 58–82% in an earlier Stanford study. A citation can exist and still be wrong if it does not support the claim. Vendors disputed the method. [peer-reviewed] — [Stanford HAI](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries); [paper PDF](https://dho.stanford.edu/wp-content/uploads/Legal_RAG_Hallucinations.pdf); [Legal Dive on vendor response](https://www.legaldive.com/news/legal-genai-tools-mislead-17-percent-of-time-stanford-HAI-hallucinations-incorrect-law-citations/717128/)
- Anthropic Citations API: documents can be plain text (sentence-chunked, character ranges), PDF (sentence-chunked, page ranges) or "custom content" (the builder's own blocks, cited by block index, no further chunking). Citations "are guaranteed to contain valid pointers to the provided documents"; `cited_text` does not count toward output or later input tokens. The API does not guarantee that every claim has a citation; the docs tell builders to check that. Citations work with prompt caching and batch, but cannot be combined with structured outputs (strict JSON). Images in PDFs cannot be cited. ZDR-eligible except Covered Models. [vendor doc] — [Claude Citations docs](https://platform.claude.com/docs/en/build-with-claude/citations)
- Turkish document QA: correct refusal on unanswerable questions ranged from 9/20 to 19/20 across five open 7–8B models; evidence recall at a 3,500-character budget was 57–65% on a hard report. [preprint] — [arXiv 2609.28007](https://arxiv.org/html/2609.28007v1)
- KVKK's generative AI guide asks for monitoring, filtering and human oversight against hallucination under the accuracy principle (Q8). [secondary summary of the guide] — [İmer summary of KVKK guide](https://imer.av.tr/kvkk-araclari/uretken-yapay-zeka-kisisel-veri-rehberi)
- ClearPoint lets customers upload documents to an "AI Knowledge Base" and says answers cite the source used. [vendor claim] — [ClearPoint blog](https://www.clearpointstrategy.com/blog/clearpoint-next-ai)

### Inferences
Concrete grounding design for Karar Atlası (opinion based on the findings above):
1. Retrieval unit = one Kanıt Sürümü. Index only the latest non-withdrawn version by default, but keep old versions retrievable when the user asks "what did we know at decision time". Pass each retrieved chunk as a custom-content document whose metadata carries `kanıt`, `sürüm`, `tür`, `tarih`, `kaynak`. Then every citation resolves to a block index, and the server maps it back to `(Kanıt, sürüm)`. This uses the guaranteed-valid-pointer property.
2. Store citations in a new append-only child table "AI Dayanağı" on the AI proposal record: claim text span, Kanıt, sürüm, cited text, retrieval score. This mirrors the existing Karar Dayanağı table.
3. Unsupported-claim rule: after generation, a cheap second pass (small model) checks each sentence for a citation. Sentences without one get the label "desteksiz" in the UI and cannot be copied into Kapı Kararı gerekçe without the human editing them. The earlier report already set this rule; the API detail above makes it enforceable.
4. Refusal: when retrieval returns nothing above a threshold for a step, the system answers "Bu adım için kanıt yok" and lists which evidence types the step usually needs. It does not draft from model memory. Model memory is allowed only in clearly separate "genel bilgi" blocks with no citation and a visible label.
5. Staleness: when a cited Kanıt gets a new version, the existing "dayanağı değişti" flag (section 5.3) should also fire on AI proposals, and the proposal is marked stale.
6. Because citations cannot be combined with strict JSON outputs on Claude, keep two passes: a cited prose pass, and (if needed) a separate structured extraction pass.
7. Expect a residual error rate of roughly 5–15% unsupported content even with grounding, based on Vectara and Stanford. The UI must therefore keep human verification as a step, not as a disclaimer.

### Gaps
- No Turkish-language hallucination benchmark for frontier models was found; Vectara is English.
- No study measured how often citation-enabled answers cite a passage that does not actually support the claim ("valid pointer, wrong support") for Claude, GPT or Gemini in 2026.
- OpenAI and Google equivalents of span-level citations were not checked in this session.

## 3. Human–AI decision support: reliance, explanations, forcing functions, uncertainty, devil's advocate, deliberation

### Takeaway
The evidence favours three mechanisms over "explain the AI": make people think before they see the AI (cognitive forcing), state uncertainty in first-person words, and use the AI as a structured critic. Each has costs: forcing functions are disliked and help high "need for cognition" users most; uncertainty wording must be precise; devil's-advocate agents improve satisfaction and reliance in small studies but the evidence base is thin. Explanations alone rarely produce better joint decisions.

### Cited Findings
- Buçinca, Malaya, Gajos (CSCW 2021, "To Trust or to Think"): 199 Mechanical Turk participants; three cognitive forcing designs versus two explanation designs and a no-AI baseline. Forcing functions significantly reduced over-reliance compared with simple explanations, but did not remove it. The most effective designs got the worst subjective ratings. Benefits were largest for people high in Need for Cognition. [peer-reviewed] — [arXiv 2102.09692](https://arxiv.org/pdf/2102.09692); [Harvard author page](https://www.eecs.harvard.edu/~kgajos/papers/2021/bucinca2021trust.shtml)
- Kim, Liao, Vorvoreanu, Ballard, Wortman Vaughan (FAccT 2024): preregistered experiment, 404 participants, medical questions with a fictional LLM search engine. First-person hedges ("I'm not sure, but…") lowered agreement with the system and improved accuracy by reducing over-reliance on wrong answers. General-perspective hedges ("It's not clear, but…") had weaker, non-significant effects. Wording matters. [peer-reviewed] — [FAccT 2024 paper](https://facctconference.org/static/papers24/facct24-56.pdf); [Microsoft Research](https://www.microsoft.com/en-us/research/?p=1030965)
- Microsoft Research synthesis on appropriate reliance on GenAI (2024): defines appropriate reliance as accepting correct and rejecting incorrect outputs; proposes explanations, uncertainty expressions and AI self-critique as ways to cut verification cost. [research synthesis] — [Microsoft Research PDF](https://microsoft.com/en-us/research/uploads/prodnew/2024/03/GenAI_AppropriateReliance_Published2024-3-21.pdf)
- Explanations rarely give complementary performance: a review finds explanations seldom make human+AI better than either alone and sometimes worsen reliance. [preprint review] — [arXiv 2305.07722](https://arxiv.org/pdf/2305.07722)
- Meta-analyses disagree: Schemmer et al. (2022) find a positive XAI effect on performance; Haag (Journal of Decision Systems, 2026) finds the benefit of explanations over AI-only support is small, and higher-risk-of-bias studies report larger effects. [peer-reviewed] — [KIT repository](https://publikationen.bibliothek.kit.edu/1000147671/149214046); [Bamberg repository](https://fis.uni-bamberg.de/bitstreams/5d6558fa-c440-4b29-b4b8-d9c7dab96d7e/download)
- An ICIS 2025 paper reports that moderate, cognitively optimised uncertainty communication best supports appropriate reliance in high-stakes settings. Abstract-level only. [peer-reviewed conference] — [AIS eLibrary](https://aisel.aisnet.org/icis2025/hti/hti/1/)
- Chiang, Lu, Li, Yin (Purdue, IUI 2024, "Enhancing AI-Assisted Group Decision Making through LLM-Powered Devil's Advocate"): randomized experiment in which an LLM devil's advocate argues against the AI recommendation (static versus interactive). The abstract reports that a devil's advocate arguing against the AI's recommendation helped groups rely on AI more appropriately, without a meaningful rise in perceived workload. Exact sample size and effect sizes were not read (PDF unreadable in this session). [peer-reviewed; abstract level] — [NSF PAR copy](https://par.nsf.gov/servlets/purl/10524816); DOI 10.1145/3640543.3645199
- Lee et al. (CHI 2025 late-breaking work): an LLM devil's advocate in power-imbalanced groups, 48 participants in 12 four-person groups. Process and outcome satisfaction rose, especially for junior members; psychological safety change was not significant (p = 0.19). [extended abstract] — [arXiv 2503.14263](https://arxiv.org/html/2503.14263v1); [CHI 25 poster](https://soohwan-lee.github.io/files/CHI25-Poster-FInal.pdf)
- "Amplifying Minority Voices" (arXiv February 2025) proposes an AI-mediated devil's advocate that relays minority views anonymously. [preprint] — [arXiv 2502.06251](https://arxiv.org/html/2502.06251v1)
- Ma, Zhang, Wang, Ma, Yin (arXiv March 2024): AI as Recommender versus Analyzer versus Devil's Advocate at two AI accuracy levels. The Recommender role is "not always the most effective"; when AI accuracy is low, the Analyzer role may be better. [preprint] — [arXiv 2403.01791](https://arxiv.org/abs/2403.01791)
- Alsobay et al. (CSCW): an LLM facilitator increased the breadth of information shared in groups, but more sharing did not translate directly into better final decisions. [peer-reviewed, per search summary] — [arXiv 2508.08242](https://arxiv.org/pdf/2508.08242)
- Homogenisation and diversity mitigations are covered in the earlier note (Doshi & Hauser 2024; diverse personas; differentiated search). — see `ai_rolu_strateji.md` section 1.
- Microsoft HAX Guidelines (Amershi et al., CHI 2019): 18 guidelines synthesised from over 150 recommendations, tested by 49 design practitioners against 20 AI products; grouped as initially, during interaction, when wrong, over time; not meant as a checklist. The HAX Toolkit adds a workbook, design patterns and a playbook for failure scenarios. [peer-reviewed + vendor toolkit] — [Microsoft Research](https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/); [HAX Toolkit guidelines](https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/)

### Inferences
Design rules for Karar Atlası (opinion; each tied to a finding above):
1. Owner first, AI second (cognitive forcing). At Kapı Kararı and Strateji Onayı, the karar sahibi writes a short own view or provisional choice before the AI critique and scores appear. Keep the friction to one field, because forcing functions are disliked. Do not use forcing on low-stakes steps (observation summaries, status drafts).
2. AI as critic, not recommender. The AI never shows a "recommended option". It shows: strongest counter-argument per option, a pre-mortem, and gaps. This follows the devil's-advocate and Analyzer-role findings and the product rule "AI never chooses".
3. Uncertainty in first person and in numbers. Write AI text as "Bu konuda emin değilim, çünkü kanıt 2 kaynağa dayanıyor" rather than impersonal hedges. For multi-run scores, show the range and the run count (for example "5 çalıştırma, puan 3–7") rather than a mean alone. Keep wording consistent; test it with the plain-language reader rule.
4. Explanations are not enough. Do not rely on "why the AI said this" text to create trust. Rely on citations to evidence versions and on the spread of scores.
5. Group meetings: when the AI acts as devil's advocate in a review meeting, address the critique to the option, not to a person, and let it voice the minority view anonymously. This protects junior members, which matters in hierarchical, family-owned Turkish firms (inference; no Turkish study found).
6. Facilitation increases information but not automatically decision quality. Pair AI summaries with the existing gate criteria so that more information is checked against explicit criteria.

### Gaps
- Chiang et al. IUI 2024 sample size and effect sizes were not verified.
- No study of AI devil's advocates in real corporate strategy meetings, or in Turkish or high power-distance cultures, was found.
- Google PAIR People + AI Guidebook content was not retrieved in this session.
- No study was found on how forcing functions affect senior executives specifically.

## 4. Evaluation: how B2B AI features are evaluated, and an eval set for strategy drafting

### Takeaway
Production practice is: a versioned eval set built from real or realistic cases, code-based checks where possible, LLM-as-judge only after it is calibrated against human grades, and a regression run on every model or prompt change. Research warns that evaluation criteria drift as people grade outputs, so the eval set and rubric must be revised in cycles. No strategy-software competitor publishes evals.

### Cited Findings
- Shankar, Zamfirescu-Pereira, Hartmann, Parameswaran, Arawjo (UIST 2024, "Who Validates the Validators?"): EvalGen aligns LLM-generated evaluators with human grades. Key concept "criteria drift": people need criteria to grade, but grading changes their criteria; criteria cannot be fully fixed before seeing outputs. Participants changed earlier grades. [peer-reviewed] — [arXiv 2404.12272](https://arxiv.org/abs/2404.12272); [UIST PDF](https://people.eecs.berkeley.edu/~bjoern/papers/shankar-validators-uist2024.pdf)
- TurkBench used GPT-4o-mini as the judge for its seven open-ended Turkish tasks, an example of LLM-as-judge in Turkish evaluation. [preprint] — [arXiv 2601.07020](https://arxiv.org/html/2601.07020v1)
- Anthropic's docs point builders to define success criteria and build evaluations per language they support. [vendor doc] — [Claude multilingual support](https://platform.claude.com/docs/en/build-with-claude/multilingual-support)
- Doshi et al. (SMJ 2025): single AI evaluations of business models are inconsistent; aggregation agrees better with experts. — see `ai_rolu_strateji.md` section 1.
- Frontiers TUS study authors argue evaluation should cover speed, length and error pattern, not accuracy alone. [peer-reviewed] — [Frontiers 2026](https://www.frontiersin.org/journals/medicine/articles/10.3389/fmed.2026.1946188/full)
- No strategy-software vendor publishing an eval of its agents was found (earlier note: G2 shows reviews only). — [G2 comparison](https://www.g2.com/compare/quantive-strategyai-vs-workboard)

### Inferences
Proposed eval set "Karar Atlası Değerlendirme Seti" (opinion). Start with about 150 cases, written in Turkish, from anonymised real plans plus synthetic plans:
1. Grounding cases (40): a plan with 10–30 Kanıt Sürümü records and a question. Gold = the set of evidence versions that support the answer. Metrics: citation precision (cited span really supports the sentence), citation recall, unsupported-sentence rate. Code-checkable in part.
2. Refusal cases (20): questions with no supporting evidence, or evidence only in a withdrawn or superseded version. Gold = refuse and name the missing evidence type. Metric: correct refusal rate (target at least 18/20, which open 7–8B models reached in the Turkish study).
3. Version-trap cases (10): the latest Kanıt Sürümü contradicts an older one. The answer must use the latest unless asked about decision time.
4. Option-widening cases (20): a plan with 2 human options. Gold = expert list of reasonable alternatives. Metrics: coverage of expert alternatives, number of genuinely distinct options (pairwise similarity), and absence of options that violate stated limits (budget, Sınırlar).
5. Counter-argument and pre-mortem cases (20): Gold = expert-written key risks. Metric: recall of key risks; judged by a calibrated LLM judge plus spot human review.
6. Score-spread cases (10): run scoring 5 times; check that the spread is reported and that the same inputs give a stable range.
7. Boundary cases (15): prompts that ask the AI to choose an option, approve a gate, grant a Kaynak İzni or rate an employee. Gold = refusal with the correct redirect. Must be 100%.
8. Prompt-injection cases (15): evidence files with hidden instructions (see section 5). Gold = the instruction is quoted as content, not followed; no tool call results.
9. Turkish language quality (all cases): a rubric for correct Turkish, formal but plain register, no "-mektedir" chains, sentence length, correct date format. Graded by a judge calibrated on about 50 human-graded examples, re-calibrated each quarter because of criteria drift.
Regression rule: every model, prompt or retrieval change runs the full set; a release is blocked if boundary or injection cases drop below 100%, or if citation precision or refusal rate falls by more than an agreed margin. Store results per model version in the product's own records so customers can see them; this is a differentiator because no competitor publishes evals.

### Gaps
- No public, peer-reviewed eval set for strategy drafting exists that was found.
- No published data on LLM-as-judge reliability in Turkish was found beyond TurkBench's use of a judge.
- Classic LLM-as-judge bias studies (position bias, self-preference) were not re-fetched in this session.

## 5. Agents: safe actions, human-only actions, MCP, and prompt injection from evidence files

### Takeaway
Security research in 2025–2026 converges on one rule: once an agent has read untrusted content, that content must not be able to trigger consequential actions. Evidence files uploaded to Karar Atlası are untrusted content. So agents may read, search, summarise and draft, and may write only to proposal records; any write to a decision, approval or permit is a server workflow started by a named human. KVKK's March 2026 agentic AI document asks for defined scope, extra human review for high-risk actions and traceability.

### Cited Findings
- Beurer-Kellner, Tramèr and 11 co-authors (arXiv June 2025, "Design Patterns for Securing LLM Agents against Prompt Injections"): propose design patterns with provable resistance, such as plan-then-execute and dual LLM (a privileged model that never sees untrusted text, and a quarantined model that does). Core principle: after reading untrusted input, the agent should be unable to take consequential actions. The authors say general-purpose agents are unlikely to give reliable guarantees with current models. Ten case studies. [preprint] — [arXiv 2506.08837](https://arxiv.org/abs/2506.08837v3)
- OWASP Top 10 for LLM Applications 2025: LLM01 prompt injection (direct and indirect, for example hidden in a document the model summarises) and LLM06 excessive agency (too much functionality, permission or autonomy). Mitigations include least privilege for tools and human approval for high-impact actions. [industry standard via secondary pages] — [Invicti](https://invicti.com/blog/web-security/owasp-top-10-risks-llm-security-2025); [HackerOne](https://www.hackerone.com/ai/owasp-top-10-llms-2025)
- KVKK "Etken Yapay Zekâ (Agentic AI)" document, announced 12 March 2026: defines agentic systems as systems that assess their environment and start actions autonomously. A law-firm summary (which dates the study February 2026) lists risks: scope creep in data needs, weakening legal basis, profiling, re-identification, poor traceability in multi-step flows, hallucinations passed downstream, unclear responsibility, wider attack surface through integrations and input manipulation. Recommended oversight at three stages: define and test which data and decisions the system may access at development; add extra human review for high-risk actions at deployment; monitor after use. [regulator doc + secondary] — [KVKK announcement](https://www.kvkk.gov.tr/Icerik/8683/etken-yapay-zeka-agentic-ai); [İmer checklist summary](https://imer.av.tr/kvkk-araclari/etken-yapay-zeka-uyum-kontrol-listesi)
- KVKK generative AI guide Q13 lists controls against prompt injection, jailbreaks, model inversion and membership inference, plus red teaming and secure logs, and names a data protection impact assessment (VKED) as an example measure. [secondary summary of guide] — [İmer summary](https://imer.av.tr/kvkk-araclari/uretken-yapay-zeka-kisisel-veri-rehberi)
- Competitors already expose MCP: Perdoo has an MCP server that connects ChatGPT and Claude to goals; WorkBoard supports A2A and MCP (earlier note). [secondary + vendor claim] — [Tability on Perdoo](https://www.tability.io/compare/best-perdoo-alternatives); see `ai_rolu_strateji.md` section 3.
- ClearPoint's assistant "does not automatically save changes"; users review and apply suggestions manually; a global switch disables all AI features. [vendor doc] — [ClearPoint support](https://next-support.clearpointstrategy.com/en/articles/13183655-ai-assistant-to-analyze-your-data); [ClearPoint release notes](https://news.clearpointstrategy.com/129940-clearpoint-next-16-5-48-release-highlights)

### Inferences
Action classes for Karar Atlası agents (opinion, consistent with section 7 workflows):

| Class | Examples | Who executes | Gate |
|---|---|---|---|
| Read | search Kanıt Sürümü, read Adım Kaydı, read Gözlem, read Hedef sürümleri | agent | plan membership of the requesting user |
| Draft (proposal only) | evidence summary, option draft, counter-argument, pre-mortem, score runs, gap list, status update draft, review-meeting pack | agent writes to a new append-only "AI Önerisi" record | none to create; human accept, edit or reject to use |
| Suggest a change | "add this Görev", "mark this evidence for review" | agent creates a pending suggestion | human click applies it through the normal API as that human |
| Human-only | Kapı Kararı, Geçiş Kararı, Strateji Onayı, Strateji Gözden Geçirme, Kaynak İzni, Kaynak Hareketi review, Sınır Değişikliği, membership and role changes | only the server workflow, started by the named owner's session | existing section 7.2 workflows; AI service account has no permission on these DocTypes |
| Never | scoring employees, sending external messages, deleting or withdrawing evidence, exporting plan data outside the site | nobody via AI | blocked by role and by tool list |

Technical rules:
1. Give the AI a dedicated Frappe role with read access to plan records and create access only to "AI Önerisi" and its child tables. No write permission on any submittable decision DocType. This makes "AI never approves" a permission fact, not a prompt instruction.
2. Treat every uploaded file (Kanıt Sürümü dosya) as untrusted. Use a quarantined pass to extract text and summaries; the planning model sees extracted text inside clearly marked data blocks and has no tool that writes outside proposals. Log any instruction-like text found in files to Olay Kaydı and show it to the user.
3. Record every AI call in Olay Kaydı: model, provider, region, prompt template version, retrieved evidence versions, tool calls, user, and the human's accept, edit or reject. This also covers KVKK traceability and EU AI Act marking.
4. MCP: offer a read-mostly MCP server per customer site later (so a customer's own Claude or Copilot can query plans), with the same role limits. Do not expose decision or permit writes over MCP. This matches what Perdoo and WorkBoard already market, with a stricter write boundary.
5. Offline: the device may queue AI requests, but never AI results that write; results land as proposals after sync.

### Gaps
- The MCP specification's current approval and elicitation features were not checked in this session.
- No measured prompt-injection success rates against current frontier models were retrieved.
- The KVKK agentic AI PDF itself was not read; findings rely on the announcement page and one law-firm summary, which disagree on the date (February versus 12 March 2026).

## 6. Competitor AI features: what they do, price, user feedback

### Takeaway
Competitor AI is mostly drafting (OKR and plan generation), summarising scorecards into narratives, exception reports, Q&A over strategy data, and MCP or Copilot connectors. Prices are almost all "contact sales"; AI is bundled in top tiers rather than sold per token. Independent evidence of accuracy is absent, and third-party reviewers rate some AI features low. None publishes evals, citation-to-evidence-version behaviour, or a clear human-decision boundary beyond "user applies changes".

### Cited Findings
- WorkBoard: Digital Chief of Staff and Leadership Coach agents GA (May 2025), portfolio analyst agents, A2A and MCP support, Microsoft 365 Copilot integration; acquired Quantive (StrategyAI) in 2025 (earlier note). G2 rating 4.7 from about 103–105 reviews; pricing "Contact Us", G2 perceived cost "$$$$$", average discount 16%, no self-serve paid tiers. No WorkBoard-specific AI complaint data found. [vendor + review site] — [G2 WorkBoard](https://www.g2.com/products/workboard/reviews); [G2 pricing](https://www.g2.com/products/workboard/pricing); [xpay index](https://www.xpay.sh/agent-ready-index/workboard/)
- G2 data across AI agent builders: 33% of recent reviews mention pricing as a dislike; a third of those complain about unpredictability. Category-wide, not WorkBoard. [secondary] — [G2 Learn Hub](https://learn.g2.com/what-buyers-really-think-about-ai-agent-builders)
- Cascade: AI branded "Tapestry AI" (strategic planning, alignment, powered updates, dependencies and risks, natural-language UI). Pricing page: free plan up to 2 users (no AI listed); Essentials up to 25 users, contact sales; Enterprise up to 100 users with Tapestry AI, data residency, contact sales. No prices or AI usage limits shown. [vendor page] — [Cascade pricing](https://www.cascade.app/pricing)
- Perdoo: "Vince AI Coach" launched January 2026, reviews draft objectives and answers OKR questions; AI goal importer from plain text; MCP server for ChatGPT and Claude. One benchmark rates its AI features 1.25 of 5. Price sources conflict (USD 8–10 per user per month versus other figures). [secondary] — [Tability Perdoo review](https://www.tability.io/compare/best-perdoo-alternatives); [Toolradar pricing](https://toolradar.com/tools/perdoo/pricing)
- ClearPoint: AI reviews scorecards, objectives, measures, initiatives, risks; semantic search; summaries and draft reports; board narratives; exception report (missed targets, negative trends, stalled progress); AI knowledge base with source citation; suggestions never auto-saved; global AI off switch. A ClearPoint ROI post claims about 70% less reporting time (marketing, not measured). [vendor claim] — [ClearPoint Next AI blog](https://www.clearpointstrategy.com/blog/clearpoint-next-ai); [ClearPoint support](https://next-support.clearpointstrategy.com/en/articles/13183655-ai-assistant-to-analyze-your-data); [ROI post](https://www.pulse.bot/management/news/boost-efficiency-try-clearpoint-strategys-roi-calculator-now-clearpoint-strategy-blog-2808223a-4b77-4471-b4b3-989959d4b2aa/)
- StrategyFrame (Germany): AI-assisted "strategy operating system" for SMEs, with market monitoring from external sources (trends, regulation, competitors); about 40% of clients use the self-serve SaaS package; OMR Reviews 5.0 from 17 reviews (ease of use, built-in OKR; learning curve noted); no published prices. [trade press + review site] — [The Innovator](https://theinnovator.news/?p=11868); [OMR Reviews](https://omr.com/en/reviews/product/strategyframe)
- DevOKR: AI OKR generation and AI quality analysis of goals before the quarter; price sources conflict (from USD 4 per user, free plan yes or no); paid pricing sales-led. [secondary] — [Capterra UK](https://www.capterra.co.uk/software/1034507/devokr); [xpay pricing](https://www.xpay.sh/saas-pricing/devokr)

### Inferences
- The visible gap in the market is trustworthy, auditable AI: evidence-version citations, refusal when evidence is missing, published evals, and a permission-level guarantee that AI cannot approve. None of the six vendors shows these.
- Bundling AI in upper tiers is the norm in this category; metered credits (earlier note) are the norm in broader SaaS. Karar Atlası can bundle a monthly AI allowance per customer site and show usage, which addresses the G2 complaint about unpredictable pricing.
- Generic OKR generation is becoming a commodity; do not lead with it.

### Gaps
- No independent accuracy test of any competitor's AI was found.
- Actual AI add-on prices for WorkBoard, Cascade, Quantive and ClearPoint were not found.
- No user review text specifically about these vendors' AI features was retrieved except Perdoo's low rating.
- "StrategyFrame.AI" as a separate product name could not be confirmed; results point to StrategyFrame (Germany).

## 7. Turkish context: enterprise AI use, executive attitudes, KVKK guidance

### Takeaway
AI use in Turkish enterprises almost doubled in a year but is still a minority: 14% of firms with 10+ employees in 2026, 37.1% of firms with 250+ employees. Turkish CEOs are more pessimistic than the global average and most report no financial gain from AI yet, while KPMG Türkiye finds AI is still their top investment priority. KVKK's November 2025 guide is technology-neutral and points to Article 9 for API transfers, separate notices for use versus model development, human oversight against hallucination, and a VKED as a measure.

### Cited Findings
- TÜİK, "Yapay Zeka İstatistikleri 2026" (reported 2–3 October 2026, enterprises with 10+ employees): any AI use 14% (2025: 7.5%; 2021: 2.7%). By size: 10–49 employees 12.8%, 50–249 employees 17%, 250+ employees 37.1% (2025: 24.1%). By sector: ICT 63.7%, publishing and broadcasting 57.1%, finance and insurance 30.2%, real estate 25.8%, wholesale and retail 12.7%, transport 9.7%, construction 6.9%. Individuals' generative AI use rose from 19.2% to 37.6%. [official statistics via AA wire] — [Foreks/AA, 3 Oct 2026](https://www.foreks.com/haber/detay/6ac0f13524008d7d4373b88a/AA/tr/turkiye-yapay-zekayi-en-cok-bilisimde-en-az-insaatta-kullaniyor-03-10-26/); [Takvim](https://www.takvim.com.tr/teknoloji/turkiyede-yapay-zeka-kullanimi-bir-yilda-ikiye-katlandi-6523674); [24 Saat](https://www.24saatgazetesi.com/turkiyenin-yapay-zeka-karnesi-buyuk-sirketlerde-kullanim-yuzde-37yi-asti)
- TÜİK 2025 bulletin: 7.5% of enterprises used AI; top purposes marketing or sales 46.5%, production or service processes 41.1%, R&D or innovation 41.0%; 9.0% did not use AI but were considering it; the main reason for not using AI was lack of expertise. [official statistics via secondary] — [Alomaliye](https://www.alomaliye.com/2025/10/01/yapay-zeka-istatistikleri-2025/); [CNBC-e](https://www.cnbce.com/teknoloji/tuikten-ilk-kez-yapay-zeka-kullanimina-iliskin-istatistik-turkiyede-kac-kisi-uretken-yapay-zeka-kullaniyor-en-cok-hangi-sektor-kullaniyor-h17836)
- Some news reports give other 250+ figures (17% or 14.9%); these probably refer to a different indicator. The TÜİK table itself was not opened. [conflict noted] — [24 Saat](https://www.24saatgazetesi.com/turkiyenin-yapay-zeka-karnesi-buyuk-sirketlerde-kullanim-yuzde-37yi-asti)
- PwC 29th Global CEO Survey, Türkiye cut (January 2026): 84 Turkish CEOs in a global sample of 4,454. A news report says 55% of Turkish companies have seen no financial benefit from AI so far, and Turkish CEOs' growth expectation fell to 24%. The PwC Türkiye PDF returned HTTP 403. PwC's August 2026 interim view says value from AI is diverging between firms. [survey via secondary] — [Karar](https://www.karar.com/ekonomi-haberleri/ceolarin-endiseleri-neler-neyden-korkuyorlar-patronlarin-2042152); [PwC Türkiye 29th survey page](https://www.pwc.com.tr/29-kuresel-ceo-arastirmasi); [PwC interim August 2026](https://www.pwc.com.tr/pwc-ceo-arastirmasi-ara-donem-gorunumu-agustos-2026)
- KPMG Türkiye: in 2025, 71% of CEOs saw AI as a priority investment; KPMG Türkiye's head said 69% allocate 10–20% of budgets to AI and expect returns in 3–5 years (interview figures). An October 2026 KPMG Türkiye release says 79% of CEOs expect AI to stay one of their top investment priorities over three years. [survey via press] — [Ekonomim](https://www.ekonomim.com/sektorler/ceolarin-yuzde-71i-yapay-zekayi-oncelikli-yatirim-alani-olarak-goruyor-haberi-853380); [Bloomberg HT](https://www.bloomberght.com/kpmgmurat-alsan-ceolar-butcelerinin-yuzde-20sini-yapay-zekaya-ayiriyor-3762721); [Foreks, 22 Oct 2026](https://www.foreks.com/haber/detay/6ad9ea6f9e3f57734fbcd0e6/FRKS/tr/kpmg-ceo-lar-dijital-dayaniklilik-ve-yapay-zekaya-odaklaniyor-22-10-26/)
- KPMG Türkiye–US AI Pulse (November 2025): efficiency is the main success measure for AI investment in both markets. [consultancy report] — [KPMG Türkiye](https://kpmg.com/tr/tr/home/insights/2025/11/yapay-zeka-donusumu-turkiye-ve-abd-perspektifleri.html)
- KVKK "Üretken Yapay Zekâ ve Kişisel Verilerin Korunması Rehberi (15 Soruda)", Yayın No 113, 24 November 2025. Content per a law-firm summary (the PDF could not be machine-read in this session): [regulator guide via secondary] — [KVKK page](https://www.kvkk.gov.tr/Icerik/8547/uretken-yapay-zeka-ve-kisisel-verilerin-korunmasi-rehberi-15-soruda); [İmer summary](https://imer.av.tr/kvkk-araclari/uretken-yapay-zeka-kisisel-veri-rehberi)
  - Q6: the law applies when personal data appears at any lifecycle stage, including incidentally in outputs; anonymity must be verified with technical methods.
  - Q7: controller or processor status depends on actual control, assessed per processing activity; a company using an existing model for its own purposes is generally a controller.
  - Q8: accuracy principle requires monitoring, filtering and human oversight against hallucination; data minimisation; limited retention.
  - Q9: each activity needs a legal basis; consent should not be sought if another basis applies; public data cannot rely on the "made public" ground.
  - Q10: transfers abroad follow adequacy, then appropriate safeguards (standard contracts, BCRs), then occasional exceptions.
  - Q11: notices must cover system use and model development separately, be in clear language and be accessible in the interface; users should know they are dealing with AI.
  - Q12: data subject rights apply across training, outputs and queries; privacy by design and by default.
  - Q13: security measures include VKED (DPIA), privacy-enhancing technologies, controls against prompt injection and jailbreaks, red teaming, MFA, secure logs.
  - Q14–15: advice to individuals and parents (do not share identifiers or sensitive data).
- KVKK "İş Yerlerinde Üretken Yapay Zekâ Araçlarının Kullanımı" (5 March 2026) and the agentic AI document (12 March 2026) are covered in `ai_mevzuat_guven_maliyet.md` section 2 and section 5 above.

### Inferences
- The ICP (family-owned mid-size firms) sits in the 50–249 and 250+ bands, where AI use is 17% and 37.1%. Most buyers will be AI-curious but inexperienced, and "lack of expertise" is the main barrier. This supports structured, scaffolded AI inside the workflow rather than an open chat box.
- Turkish executives report little AI return but keep AI as a priority. A strategy product should sell AI on visible time saved and better-checked decisions, with honest limits, not on transformation claims.
- KVKK makes these product features near-mandatory for Turkish customers: an in-interface AI notice; a per-tenant record of which provider and region processed data; a redaction step before external calls; human verification steps; and a template VKED that the customer can adapt. Q11's separate notice for "model development" means Karar Atlası should state plainly that it does not train models on customer data.
- Because Karar Atlası processes data for its customers, it is most likely a processor and the customer is the controller (LAWYER; earlier note).

### Gaps
- The KVKK guide PDF was not read directly; content relies on one law-firm summary.
- Deloitte Türkiye AI or CEO survey results were not researched in this session.
- PwC Türkiye's 29th survey Türkiye summary PDF returned HTTP 403; Türkiye AI figures rely on news reports.
- TÜİK's 2026 bulletin table (purposes, AI technology types, reasons for non-use, by size) was not opened.

## 8. Offline: what AI can run on the device

### Takeaway
On-device generation in Turkish is technically possible in late 2026 but not good enough for strategy drafting. Gemma 4 E2B/E4B run on phones at 5–56 tokens per second depending on hardware; Apple's on-device model supports Turkish since iOS 26.1; Android's Gemini Nano Prompt API lists only English and Korean as validated. Small models are weaker at grounded Turkish QA. Realistic offline AI is limited to light tasks with a clear label, and everything else queues until sync.

### Cited Findings
- Gemma 4 E2B: Google's LiteRT-LM reports about 52 tokens/s decode on Android GPU and 56 on iOS (Metal). Qualcomm model cards: about 30 tokens/s for E2B and about 16–18 for E4B on Snapdragon 8 Elite class chips. A developer test on a Galaxy A35 (8 GB RAM) saw 5–7 tokens/s for E2B and about 3.5 for E4B on CPU. [vendor + anecdotal] — [Google Developers Blog, LiteRT-LM](https://developers.googleblog.com/en/blazing-fast-on-device-genai-with-litert-lm/); [Qualcomm Gemma-4-E4B card](https://huggingface.co/qualcomm/Gemma-4-E4B-it); [Qualcomm Gemma-4-E2B card](https://huggingface.co/qualcomm/Gemma-4-E2B-it); [DEV Community test](https://dev.to/baiju_rajyaguru_a70384dfd/i-ran-gemma-4-on-a-mid-range-android-phone-heres-what-actually-happened-40ge)
- Memory: E2B about 1.3 GB quantised, runs on 6 GB RAM devices; E4B about 2.5 GB and needs at least 8 GB RAM. Model cards: out-of-the-box support for 35+ languages, pretrained on 140+. [secondary + model card] — [The Decoder](https://the-decoder.com/?p=34255); [Gemma-4-E2B card](https://huggingface.co/google/Gemma-4-E2B)
- Apple Foundation Models framework: Turkish added to Apple Intelligence with iOS 26.1; availability depends on the device system language; check `supportedLanguages` at runtime. [vendor + press] — [Apple Newsroom, June 2025](https://www.apple.com/newsroom/2025/06/apple-intelligence-gets-even-more-powerful-with-new-capabilities-across-apple-devices/); [MacRumors](https://www.macrumors.com/2025/09/22/ios-26-1-apple-intelligence-languages/); [Apple developer forum](https://developer.apple.com/forums/thread/805378)
- Android ML Kit GenAI Prompt API (Gemini Nano): official page lists English and Korean as validated; other languages depend on device and downloaded models. [vendor doc] — [Prompt API get started](https://developers.google.com/ml-kit/genai/prompt/android/get-started)
- Small open models on Turkish documents: 49–75% accuracy at 7–8B (section 1); smaller models are weaker. TurkBench: Kumru-2B 27.3, Qwen3-0.6B 29.5 overall. [preprint] — [arXiv 2609.28007](https://arxiv.org/html/2609.28007v1); [arXiv 2601.07020](https://arxiv.org/html/2601.07020v1)

### Inferences
- Offline on device, allow only: (a) local search over synced Kanıt Sürümü text (lexical; character TF-IDF performed as well as embeddings in the Turkish study), (b) short field-note clean-up for Gözlem entry, (c) a local "missing fields" checklist, which is rule code in TypeScript, not AI. Label any on-device text as "cihazda üretildi, taslak".
- Do not run option drafting, critique, pre-mortem or scoring on device. Queue the request in local SQLite with the evidence version ids it would use; run it on the server after sync; deliver the result as an AI Önerisi.
- Platform split makes a single on-device path hard: iOS has a Turkish system model; Android's system model is not validated for Turkish; bundling Gemma 4 E2B adds about 1.3 GB per install. This is a cost the product should not take on in the first release.

### Gaps
- No Turkish quality benchmark for Gemma 4 E2B/E4B or Apple's on-device model was found.
- Battery and thermal impact on mid-range phones common in Türkiye was not measured.

## 9. Cost: per-feature token estimates and monthly cost per customer

### Takeaway
At list prices on 16 November 2026, the recommended feature set costs roughly USD 7–11 per month for a typical mid-size customer site on Claude Sonnet 5.5 with Haiku 5.5 for light tasks, and about USD 30–45 for a heavy customer. A dedicated in-country GPU for one customer costs around USD 1,900–2,900 per month at international H100 rates, more than 100 times the API cost, so in-country AI only works as a shared pool or as a premium tier.

### Cited Findings
- Anthropic list prices (16 November 2026, per million tokens, input / output): Opus 5.5 USD 4 / 20; Sonnet 5.5 USD 2 / 10; Haiku 5.5 USD 0.10 / 0.50 for prompts up to 100,000 tokens and USD 0.50 / 2.50 above; cache hits on Opus 5.5 and Sonnet 5.5 at 0.05 times input (USD 0.20 and 0.10); 5-minute cache writes USD 5 (Opus) and USD 2.50 (Sonnet); Batch API 50% off; US-only inference 1.1 times; web search billed per search. [vendor doc] — [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Google Gemini API list prices (paid tier, per million tokens, page read 16 November 2026): Gemini 3.1 Pro preview USD 2 / 12 up to 200K prompts (4 / 18 above); Gemini 3.8 Flash USD 0.75 / 3.75 through 31 December 2026, rising to USD 1.50 / 7.50 from 1 January 2027; Gemini 3.5 Flash-Lite USD 0.30 / 2.50; Gemini 3.1 Flash-Lite USD 0.25 / 1.50; Batch 50% off. Paid-tier content is not used to improve products; free-tier Flash content is. [vendor doc] — [Google AI Studio pricing](https://aistudio.google.com/docs/pricing)
- OpenAI GPT-5.4 USD 2.50 / 15 per million tokens (earlier note; aggregator plus OpenAI snippet). — see `ai_mevzuat_guven_maliyet.md` section 4.
- Citations: `cited_text` is not billed as output or later input. [vendor doc] — [Claude Citations](https://platform.claude.com/docs/en/build-with-claude/citations)
- H100 rental reference USD 2.63–3.95 per hour on demand (not Turkish). [secondary] — [AIMultiple GPU index](https://aimultiple.com/tr/gpu-index)

### Inferences
Per-call estimates [own calculation, Sonnet 5.5 unless noted; English token counts; system prompt and plan context cached]:

| Feature | Input tokens | Output tokens | Model | Cost per call (USD) |
|---|---|---|---|---|
| Evidence summary with citations | 30,000 | 1,500 | Sonnet 5.5 | 0.060 + 0.015 = 0.075 |
| Option drafting (3 differentiated variants) | 15,000 | 4,000 | Sonnet 5.5 | 0.030 + 0.040 = 0.070 |
| Counter-argument and pre-mortem | 20,000 | 3,000 | Sonnet 5.5 | 0.040 + 0.030 = 0.070 |
| Multi-run scoring (5 runs, cached context) | 12,000 first + 4 × 12,000 cached | 5 × 1,000 | Sonnet 5.5 | 0.024 + 0.0048 + 0.050 ≈ 0.08 |
| Gap check for a gate | 25,000 | 1,000 | Haiku 5.5 | 0.0025 + 0.0005 = 0.003 |
| Observation or status summary | 10,000 | 1,000 | Haiku 5.5 | 0.001 + 0.0005 = 0.0015 |
| Evidence file screening (injection and personal-data check, 50 pages) | 35,000 | 500 | Haiku 5.5 | 0.0035 + 0.00025 ≈ 0.004 |
| Citation coverage check (second pass) | 5,000 | 300 | Haiku 5.5 | ≈ 0.0007 |

Monthly usage assumption for a mid-size customer site (3 active plans, about 15 users, 5 active planners) [assumption]: 40 evidence summaries, 20 option drafts, 20 critiques, 15 scoring runs, 60 gap checks, 100 observation summaries, 50 file screenings, 80 citation checks.
- Total: 40 × 0.075 + 20 × 0.07 + 20 × 0.07 + 15 × 0.08 + 60 × 0.003 + 100 × 0.0015 + 50 × 0.004 + 80 × 0.0007 = 3.00 + 1.40 + 1.40 + 1.20 + 0.18 + 0.15 + 0.20 + 0.06 ≈ USD 7.6 per month.
- Turkish token overhead assumed 1.5 times (unverified): about USD 11 per month.
- Heavy customer (four times the usage): about USD 30–45 per month.
- EU or US regional routing adds about 10%.
- Using Opus 5.5 instead of Sonnet for drafting and critique doubles those lines (about USD 4 more per month at base usage).
- Gemini 3.8 Flash for the Sonnet lines would cost about 40% of Sonnet in 2026 and about 75% from January 2027 at the announced prices; quality in Turkish is unverified.
- Embedding and vector storage costs are not included.

In-country tier [own calculation]: one H100 at USD 2.63–3.95 per hour × 730 hours ≈ USD 1,920–2,880 per month, before operations staff. One FP8 27–31B model on that GPU could serve many customer sites if they accept a shared in-country pool; a single-customer GPU is economic only for large public or finance accounts.

Pricing implication: include a monthly AI allowance per site sized at the heavy scenario (for example, USD 45 of model cost), show usage in the admin screen, and sell the in-country tier separately. This matches the market move to bundles plus credits (earlier note) and avoids the "unpredictable" complaint seen on G2.

### Gaps
- Turkish token counts for current tokenisers were not measured; the 1.5 times factor is an assumption.
- Turkish GPU prices were not published by providers.
- Real usage frequencies per feature are assumptions; they need pilot data.
- Azure and Bedrock EU regional prices for Claude were not re-checked.
- Exchange rate for TRY pricing was not checked.

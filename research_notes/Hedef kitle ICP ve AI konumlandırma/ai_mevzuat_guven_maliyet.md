# AI features in a Turkey-origin B2B strategy-planning SaaS: law, trust and cost (as of 15 November 2026)

Scope note: The product is multi-tenant, with one Frappe site and database per customer. It has an offline-capable PWA and a mobile app. It holds confidential strategy documents, budgets and evidence files. The planned AI features are research synthesis, option generation, red teaming and drafting. Humans make the final decisions. These notes are research, not legal advice. Items marked "LAWYER" need confirmation by Turkish or EU counsel. Items marked "NOT VERIFIED IN THIS SESSION" come from background knowledge of the statute text and were not re-fetched from a primary source.

## 1. EU AI Act: timeline after the Digital Omnibus, roles, Article 50, high-risk status

### Takeaway
The Digital Omnibus on AI is Regulation (EU) 2026/1744. Law-firm sources say it entered into force on 27 July 2026. It moves stand-alone Annex III high-risk duties to 2 December 2027 and product-embedded Annex I duties to 2 August 2028. Article 50 transparency duties were not postponed. They apply from 2 August 2026, with a grace period to 2 December 2026 for Article 50(2) marking by systems already on the market. A strategy-planning assistant is not listed in Annex III. It is therefore most likely a limited-risk system with Article 50 and AI-literacy duties. The exception is use in HR decisions about employees, for example performance evaluation through OKRs. That use could fall under Annex III.

### Cited Findings
- Council and Parliament reached a provisional agreement on 7 May 2026. Parliament endorsed it on 16 June 2026. The Council gave final approval on 29 June 2026. — [Sidley Data Matters, 22 June 2026](https://datamatters.sidley.com/2026/06/22/eu-lawmakers-reach-provisional-agreement-to-delay-key-eu-ai-act-obligations/); [Secure Privacy](https://secureprivacy.ai/blog/eu-ai-act-digital-omnibus-the-new-high-risk-ai-deadlines-after-council-approval)
- The regulation number is 2026/1744. It was published in the Official Journal on 24 July 2026 and entered into force three days later, on 27 July 2026. — [Cuatrecasas, 24 July 2026](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published); [Usercentrics](https://usercentrics.com/knowledge-hub/eu-ai-act-high-risk-delay-article-50-transparency-consent/); Council pre-publication text [PE-CONS 30/1/26 REV 1](https://data.consilium.europa.eu/doc/document/PE-30-2026-REV-1/en/pdf). FLAG: the EUR-Lex page itself was not reached in this session. Confirm the OJ reference on EUR-Lex.
- Annex III stand-alone high-risk systems now apply from 2 December 2027, under new Article 113. The original date was 2 August 2026. Annex I product-embedded systems now apply from 2 August 2028. — [Cuatrecasas](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published); [EU Transition Pathways](https://transition-pathways.europa.eu/adv-man/legislation/ai-act-digital-omnibus-high-risk-deadlines-postponed-machinery-carved-out)
- Article 50 was not amended. Article 50(1) requires disclosure when people interact with an AI system, unless this is obvious. Article 50(2) requires machine-readable marking of synthetic output by providers of generative AI. Systems placed on the market before 2 August 2026 have until 2 December 2026. Systems placed on the market on or after 2 August 2026 get no grace period. — [Usercentrics](https://usercentrics.com/knowledge-hub/eu-ai-act-high-risk-delay-article-50-transparency-consent/); [Cuatrecasas](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published)
- Article 50(4) covers deepfakes and AI-generated text published to inform the public on matters of public interest. It has an exemption when a human reviews the content and a person or legal entity holds editorial responsibility. — [Usercentrics](https://usercentrics.com/knowledge-hub/eu-ai-act-high-risk-delay-article-50-transparency-consent/)
- AI literacy (Article 4) is kept in a softer form. It is now framed as measures to "support" literacy, with no required level. The Commission will publish practical examples. — [Cuatrecasas](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published)
- Relief for SMEs is extended to small mid-caps (SMCs) through new Article 3(14a) and 3(14b). The relief covers simplified technical documentation, a proportionate quality management system and proportionate fines. — [Cuatrecasas](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published)
- New Article 4a allows processing of special-category data when "strictly necessary" to detect and correct bias, with safeguards. — [Cuatrecasas](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published)
- GPAI model obligations have applied since 2 August 2025 and were not changed by the Omnibus. The AI Office gains exclusive supervision of AI systems built on a GPAI model when the model and system come from the same provider or group. — [Usercentrics](https://usercentrics.com/knowledge-hub/eu-ai-act-high-risk-delay-article-50-transparency-consent/); [Cuatrecasas](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published)
- Two new Article 5 prohibitions target non-consensual intimate imagery and CSAM. One source says they apply from 2 December 2026. These are not relevant to this product. — [Usercentrics](https://usercentrics.com/knowledge-hub/eu-ai-act-high-risk-delay-article-50-transparency-consent/)
- Penalties are unchanged. The maximum fine is EUR 35 million or 7 percent of global turnover for the most serious breaches. — [Usercentrics](https://usercentrics.com/knowledge-hub/eu-ai-act-high-risk-delay-article-50-transparency-consent/)
- National AI regulatory sandboxes must be in place by 2 August 2027. — [Cuatrecasas](https://www.cuatrecasas.com/en/spain/intellectual-property/art/digital-omnibus-ai-has-been-published)
- Annex III areas: biometrics, critical infrastructure, education, employment and worker management, access to essential services (for example credit scoring), law enforcement, migration, and justice and democratic processes. Point 4 covers recruitment and decisions on promotion, termination, task allocation, and the monitoring and evaluation of workers' performance. Strategy planning is not listed. — [Regulation (EU) 2024/1689 on EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/1689/oj). NOT VERIFIED IN THIS SESSION: the Annex text was not re-fetched.
- Roles under the AI Act: The SaaS company will most likely be the "provider" of an AI system, because it puts the feature on the market under its own name. Its customers are "deployers". The LLM vendor (for example Anthropic, OpenAI or Google) is the GPAI model provider. The SaaS company becomes a GPAI model provider only if it substantially modifies a model. The Commission's July 2025 GPAI guidelines set an indicative threshold of more than one third of the original training compute. — NOT VERIFIED IN THIS SESSION. Source to confirm: [European Commission AI Act pages](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai).
- Territorial scope: Article 2 applies to providers outside the EU when they place systems on the EU market. It also applies when the output of the system is used in the EU. A Turkish provider selling to EU customers is therefore in scope. — [Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj). NOT VERIFIED IN THIS SESSION.

### Inferences
- For EU sales, the binding duties now are Article 50(1) and probably Article 50(2). Article 50(1) means a visible "you are working with AI" notice in chat and agent interfaces. Article 50(2) means machine-readable marking of AI-generated text. AI literacy support (Article 4) also applies.
- Article 50(2) has an exception for AI that only assists editing and does not substantially change the input. Whether this exception covers drafting features is a LAWYER question.
- Article 50(4) for public-interest text is unlikely to apply. Strategy documents are internal and a human takes editorial responsibility.
- Product design should keep AI out of employee evaluation. Example: do not let AI score an employee's performance from OKR results. This keeps the product out of Annex III point 4. If that feature is wanted, the Annex III duties apply from 2 December 2027. They include a risk management system, logging, human oversight and registration. LAWYER.
- Because the EU product will be offered from Turkey, the company may need an authorised EU representative only for high-risk systems or GPAI models. A limited-risk system probably does not need one. LAWYER.

### Gaps
- The EUR-Lex text of Regulation (EU) 2026/1744 was not opened. The OJ reference and the article numbers rely on law-firm summaries.
- No primary source was found on whether the Omnibus changed the Article 6(3) and Article 49 registration duty for Annex III systems that the provider considers not high-risk.
- The Commission's Article 50 guidelines and the Code of Practice on marking and labelling of AI content were not checked for final status.

## 2. Turkey: AI law, KVKK guidance, cross-border transfer, data residency

### Takeaway
Türkiye has no enacted horizontal AI law as of November 2026. Bill 2/2234 of June 2024 is reported to be still in committee. Other AI bills are also pending. The binding law for AI features is KVKK, Law No. 6698. Since 1 June 2024, Article 9 allows transfers abroad mainly through adequacy decisions or appropriate safeguards, with standard contracts the practical route. Each signed standard contract must be notified to the KVKK within five business days. KVKK published guidance on generative AI in November 2025, on workplace use in March 2026 and on agentic AI in March 2026. Public institutions and regulated finance expect data to stay in Türkiye.

### Cited Findings
- The AI Law Bill (Esas No. 2/2234) was submitted in June 2024. It proposes principles, risk management, registration and conformity assessment for high-risk AI, and turnover-based fines. A tracker reports it as still under committee review. No source reports a floor vote. — [regulations.ai Turkey overview](https://regulations.ai/regulations/turkey-summary); [Deep Lex tracker](https://www.deep-lex.com/ai-regulation-tracker/t-rkiye)
- A second bill (Esas No. 2/3358), dated 7 November 2025, amends existing laws for AI. It defines an "AI system" and extends access-blocking to crimes committed through AI. — [Legal 500](https://www.legal500.com/intelligence/turkey/technology/draft-law-proposing-amendments-to-certain-laws-regarding-artificial-intelligence-submitted-to-the-turkish-grand-national-assembly); [Gide](https://www.gide.com/en/news-insights/draft-law-on-measures-concerning-ai-generated-content/)
- A January 2026 bill proposes amending the data protection law to create platform liability for AI-generated content. — [CMS](https://cms.law/en/tur/legal-updates/tuerkiye-proposes-amendment-to-data-protection-law-introducing-platform-liability-for-ai-generated-content#utm_campaign=redirect_law-now)
- The Türkiye AI Action Plan 2026–2030 was announced on 13 June 2026. A source says a Presidential Circular dated 17 August 2026 put it into effect, published in the Official Gazette on 18 August 2026. — [Global Business Law blog](https://www.globalblaw.com/blog/turkiye-artificial-intelligence-action-plan-2026-2030). FLAG: secondary source. Confirm in the Resmî Gazete.
- A TBMM AI Investigation Commission report was published in March 2026, per a citing document. — [Future Free Speech, Turkey chapter, Oct 2026](https://futurefreespeech.org/wp-content/uploads/2026/10/AI-Report-Chapter-Turkey-CTF.pdf). FLAG: secondary.
- KVKK published "Üretken Yapay Zekâ ve Kişisel Verilerin Korunması Rehberi (15 Soruda)" on 24 November 2025. Law 6698 is technology-neutral and applies whenever personal data is processed anywhere in the AI lifecycle. Output can contain personal data even if the input does not. Human verification of outputs is stressed. A developer can be a controller or a processor depending on its level of control. — [KVKK announcement page](https://www.kvkk.gov.tr/Icerik/8547/uretken-yapay-zeka-ve-kisisel-verilerin-korunmasi-rehberi-15-soruda); [full PDF](https://www.kvkk.gov.tr/SharedFolderServer/CMSFiles/MTY5MjNmNmIwZWY3YTE.pdf); [Alomaliye summary](https://www.alomaliye.com/2025/11/24/sorularla-uretken-yapay-zeka-ve-kisisel-verilerin-korunmasi-rehberi/)
- KVKK published "İş Yerlerinde Üretken Yapay Zekâ Araçlarının Kullanımı" on 5 March 2026. It recommends anonymised or generalised data where possible and warns about "shadow AI", meaning staff use without a corporate policy. — [KVKK](https://www.kvkk.gov.tr/Icerik/8674/is-yerlerinde-uretken-yapay-zeka-araclarinin-kullanimi); [Erdem & Erdem](https://www.erdem-erdem.av.tr/bilgi-bankasi/is-yerlerinde-uretken-yapay-zeka-araclarinin-kullanimi-baslikli-kisisel-verileri-koruma-kurumu-duyurusu-yayimlandi)
- KVKK published a document on agentic AI ("Etken Yapay Zekâ") on 12 March 2026. — [KVKK](https://www.kvkk.gov.tr/Icerik/8683/etken-yapay-zeka-agentic-ai)
- Standard contracts for transfers abroad must be notified to the KVKK within five business days after signatures are complete. Notification can be physical, by KEP (registered e-mail) or through the Standard Contract Notification Module, which opened on 25 October 2024. Both parties must write their signature dates on the contract. Failure to notify can lead to an administrative fine. — [KVKK public announcement, 5 Feb 2025](https://www.kvkk.gov.tr/Icerik/8170/Yurt-Disina-Kisisel-Veri-Aktariminda-Kullanilacak-Standart-Sozlesmelerde-Dikkat-Edilmesi-Gereken-Hususlara-Iliskin-Kamuoyu-Duyurusu); [Erdem & Erdem on the module](https://www.erdem-erdem.av.tr/bilgi-bankasi/standart-sozlesme-bildirim-modulu-hakkinda-kamuoyu-duyurusu)
- KVKK has also published a guide on transfers abroad. — [Erdem & Erdem](https://www.erdem-erdem.av.tr/bilgi-bankasi/kisisel-verilerin-yurt-disina-aktarilmasi-rehberi-yayimlandi)
- Background on Article 9: Law No. 7499 amended Article 9, effective 1 June 2024. The new order is (1) adequacy decision, (2) appropriate safeguards such as standard contracts, binding corporate rules or written undertakings, and (3) limited occasional ("arızi") exceptions, including explicit consent. The implementing regulation on transfers abroad was published in July 2024. KVKK has issued four standard contract types, including processor-to-processor. — NOT VERIFIED IN THIS SESSION. Confirm on [kvkk.gov.tr](https://www.kvkk.gov.tr/). LAWYER.
- Public sector and critical infrastructure: a law-firm note says the Presidential information-security circular and the Digital Transformation Office's guide require critical data to be stored in Türkiye and not hosted abroad. The effect can reach private companies that serve these bodies. The public cloud strategy also foresees hosting in Türkiye. — [Gün + Partners note on data storage in Türkiye](https://beta.gun.av.tr/media/nmahshox/verilerin-tu-rkiye-de-depolanmasi-yo-nu-nde-gelis-meler.pdf); [Telkoder comments on the public cloud strategy, Nov 2023](https://telkoder.org.tr/wp-content/uploads/2023/11/2023-11-20-CBDDOKamuBulutBilisimStrateji_TelkoderGorusleri.pdf)
- Banks may use cloud services only if systems are kept in Türkiye. E-money and payment institutions must also keep data centres in Türkiye. — [Lexpera](https://www.lexpera.com.tr/literatur/derleme-makaleler/bankacilik-sektorunde-kisisel-verilerin-aktarilmasi-2-merkezi-yurtdisinda-bulunan-bankalarin-veri/1/sayfa-592); [KPMG Türkiye on community cloud for finance](https://assets.kpmg.com/content/dam/kpmg/tr/pdf/2025/02/w7_Finans%20Kuruluşları%20için%20Topluluk%20Bulut%20Kullanımı%20Danışmanlığı.pdf)
- The Cybersecurity Law No. 7545 of March 2025 expanded the powers of the Cybersecurity Directorate. — [Corbado](https://www.corbado.com/blog/turkey-financial-regulations-authentication). FLAG: secondary source.
- Demand for local cloud is rising because of KVKK and AI. AWS offers an Istanbul Local Zone for supported services. — [Ekonomi Gazetesi](https://www.ekonomigazetesi.com/sirket-haberleri/kvkk-ve-yapay-zeka-etkisiyle-yerli-buluta-ilgi-artiyor-83816)

### Inferences
- A prompt that contains personal data and goes to a US LLM API is a transfer abroad under Article 9. Examples of such personal data: names in a strategy document, budget lines tied to named staff, or evidence files. The US has no KVKK adequacy decision (NOT VERIFIED IN THIS SESSION). The practical route is a KVKK standard contract with each LLM vendor, notified within five business days. The SaaS company is a processor for its customers and the LLM vendor is a sub-processor, so the processor-to-processor type is probably the one to use. LAWYER.
- US LLM vendors will probably not sign a Turkish standard contract themselves. This gap must be handled before launch. Options: an EU or Türkiye hosting route, anonymising data before sending it, or a self-hosted model. LAWYER.
- Strategy documents often contain little personal data but much trade-secret data. Trade secrets are not KVKK data, but customers will still demand contractual protection. A redaction layer helps with both issues. Example: replace names with tokens before the call.
- Public bodies, banks, payment firms and critical-infrastructure customers should get an "AI off" or "in-country AI" tier. Examples of in-country AI: a self-hosted open-weight model in a Turkish data centre, or AWS Istanbul if the model service is available there (NOT VERIFIED IN THIS SESSION).
- The per-customer Frappe site design makes this easier. AI settings can be set per tenant: on or off, which provider, which region and what retention.

### Gaps
- The full text of the November 2025 KVKK guide was not read. Its exact advice on API transfers and processor roles is unconfirmed.
- I did not find a KVKK Board decision on transfers to LLM APIs in particular.
- The current Article 18 fine amounts for 2026 were not found. They are revalued every year.
- No primary source was found on whether the TBMM committee has scheduled bill 2/2234.

## 3. Enterprise trust: no training, retention, ZDR, regions, self-hosting, certifications

### Takeaway
All major API vendors say they do not train on API business data by default. Zero data retention (ZDR) is usually approval-gated and does not cover every model or feature. Anthropic's first-party API offers only "global" or "us" inference, and data at rest is stored only in the US. EU processing for Claude therefore needs a cloud partner region such as Bedrock or Google Cloud. OpenAI offers EU data residency projects with ZDR, at a 10 percent price uplift for newer models. Self-hosted open-weight models are the only option that keeps data fully under the company's control in Türkiye.

### Cited Findings
- Anthropic: API inputs and outputs are deleted within 30 days by default. The Commercial Terms bar training on customer content. ZDR needs Anthropic's approval through sales and is enabled per organisation. — [getvoibe summary of Anthropic terms](https://www.getvoibe.com/resources/claude-api-data-retention/); [developersdigest](https://www.developersdigest.tech/models/data-retention/anthropic). FLAG: secondary. Primary page to confirm: [Anthropic API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention).
- Anthropic: ZDR excludes "Covered Models". Secondary sources name Claude Fable 5.1, Mythos 5.1, Fable 5 and Mythos 5 as needing at least 30 days of retention since 9 June 2026. Anthropic's own data-residency page confirms that ZDR eligibility "excludes Covered Models". — [Anthropic data residency docs](https://platform.claude.com/docs/en/manage-claude/data-residency); [The Register, 2 Sep 2026](https://www.theregister.com/ai-and-ml/2026/09/02/anthropic-promises-zero-data-retention-but-customers-must-check-it-worked/5293789)
- Anthropic: safety classifier results are kept even under ZDR. Flagged inputs and outputs may be kept for up to two years. Claude Team and Enterprise app interfaces are not ZDR-eligible. — [getvoibe](https://www.getvoibe.com/resources/claude-api-data-retention/); [witness.ai](https://witness.ai/blog/ai-data-retention/). FLAG: secondary.
- Anthropic first-party API: `inference_geo` accepts only "global" and "us". Workspace geo (data at rest) is "us" only. US-only inference costs 1.1 times the standard price. On Bedrock and Google Cloud (Google-managed), the region comes from the endpoint, and these partners set their own regional pricing. — [Anthropic data residency docs](https://platform.claude.com/docs/en/manage-claude/data-residency); [Anthropic pricing docs](https://platform.claude.com/docs/en/about-claude/pricing)
- Anthropic pricing page: "Regional and multi-region endpoints include a 10 percent premium over global endpoints." — [Anthropic pricing docs](https://platform.claude.com/docs/en/about-claude/pricing)
- Anthropic became a Microsoft 365 Copilot subprocessor on 7 January 2026. That route is outside the EU Data Boundary. — [companyscope](https://companyscope.io/vendors/anthropic). FLAG: secondary.
- OpenAI launched European data residency in February 2025. Requests through European projects are handled in-region with zero data retention. Residency is set when the project is created. The endpoint is eu.api.openai.com. — [OpenAI announcement](https://openai.com/index/introducing-data-residency-in-europe/); [TechCrunch](https://techcrunch.com/2025/02/06/openai-launches-data-residency-in-europe)
- OpenAI now requires approval for non-US regions and a signed ZDR amendment. Residency endpoints carry a 10 percent uplift for eligible models released on or after 5 March 2026. — [Sovergate](https://sovergate.com/blog/openai-zero-data-retention-eu-data-residency); [wavect](https://wavect.io/blog/eu-data-residency-ai-apps-2026/). FLAG: secondary. Confirm on OpenAI's pricing page.
- A comparison recommends Azure OpenAI in an EU Data Zone, Vertex AI in an EU region, Bedrock in an EU region or OpenAI's EU residency for EU processing. It says Bedrock lets customers enable zero retention themselves. — [wavect](https://wavect.io/blog/eu-data-residency-ai-apps-2026/). FLAG: secondary.

### Inferences
- The enterprise trust checklist will probably include these items. Most come from market practice, not from law:
  1. A contract term saying the vendor does not train on customer data, flowing down to every LLM sub-processor.
  2. Retention set per tenant, with ZDR where available.
  3. A public sub-processor list that names each provider and region.
  4. Tenant-level switches for AI on or off and for the provider.
  5. Redaction of personal data before calls.
  6. Audit logs of prompts, sources and outputs, stored in the customer's own site.
  7. A DPA plus KVKK standard contracts.
- An offline-first PWA cannot run large-model AI features offline unless a small model runs on the device. AI calls should be queued and run when the device is online. Users should see clearly which features need a connection.
- For Turkish public or finance customers, the realistic options are a self-hosted open-weight model in Türkiye or no AI. The cost is GPU hosting plus the operations work.

### Gaps
- No primary source was found on SOC 2, ISO 27001 or ISO 42001 expectations in Turkish B2B procurement. ISO/IEC 42001:2023 is the AI management system standard. How often Turkish or EU buyers ask for it is unknown.
- Azure OpenAI EU Data Zone and Bedrock EU cross-region pricing were not found.
- Google Gemini API data-use terms and EU region options were not checked against a primary source.
- I did not find whether any frontier LLM vendor runs inference inside Türkiye.
- Self-hosted open-weight model costs in Türkiye (GPU rent per hour) were not researched.

## 4. Cost and pricing of AI in B2B SaaS

### Takeaway
In 2025–2026 the market moved from flat per-seat AI add-ons to a hybrid model: a seat plan with included AI, plus a pool of metered credits. API costs per typical strategy task are small with mid-tier models, often a few US cents to about 30 US cents. Long research runs with frontier models cost more. Prices change often, so recheck them before any pricing decision.

### Cited Findings
- Metronome's 2026 survey reportedly found that 64 percent of SaaS companies bill at least partly by usage, up from 39 percent in 2024. Maxio's 2025 report puts the share with a usage component at 67 percent. — [Falkster](https://falkster.com/blog/the-credit-is-the-new-seat). FLAG: secondary summary of surveys.
- A map of 41 brands found only 2 that sell a per-seat AI add-on (Microsoft Copilot and Dropbox Dash are named). Analysts call the flat per-user add-on a transitional model. — [Falkster](https://falkster.com/blog/the-credit-is-the-new-seat); [coommit](https://coommit.com/blog/saas-ai-pricing-2026)
- GitHub Copilot moved all plans to usage-based billing in June 2026. Each plan includes a monthly AI credit allowance, and extra use is billed per token. — [Falkster](https://falkster.com/blog/the-credit-is-the-new-seat). FLAG: confirm on GitHub's pricing page.
- Salesforce: USD 2 per conversation, then Flex Credits at about USD 0.10 per action, plus per-user add-ons and editions with credit pools. Atlassian Jira: seat plus pooled credits by tier. Figma: USD 0.03 per credit. Monday.com: credits at USD 0.01. Miro: 25 to 50 credits per user per month, depending on plan. — [Falkster](https://falkster.com/blog/the-credit-is-the-new-seat); [Hirondl explorer](https://www.hirondl.com/insights/ai-monetisation-explorer)
- Notion: sources conflict. One says AI is bundled only in Business at USD 18 or more. Another lists a USD 10 per seat add-on. — [Falkster](https://falkster.com/blog/the-credit-is-the-new-seat); contradicted by [subscriptionplaybook](https://www.subscriptionplaybook.com/pricing/saas/examples/). Check Notion's pricing page.
- Anthropic list prices per million tokens (input / output), from the primary pricing page:
  - Claude Opus 5.5: USD 4 / USD 20.
  - Claude Sonnet 5.5: USD 2 / USD 10.
  - Claude Haiku 5.5: USD 0.10 / USD 0.50 for prompts up to 100,000 tokens, and USD 0.50 / USD 2.50 above that.
  - Claude Fable 5.2: USD 8 / USD 40.
  - The Batch API gives 50 percent off. Cache hits on Opus 5.5 and Sonnet 5.5 cost 0.05 times the input price.
  - US-only inference costs 1.1 times the standard price. Regional endpoints on partner clouds carry a 10 percent premium.
  — [Anthropic pricing docs](https://platform.claude.com/docs/en/about-claude/pricing)
- OpenAI list prices per million tokens (input / output):
  - GPT-5.4: USD 2.50 / USD 15. The OpenAI pricing page snippet confirms this.
  - GPT-5: USD 1.25 / USD 10.
  - GPT-5.5: USD 5 / USD 30. This figure comes from aggregators only.
  — [OpenAI pricing](https://openai.com/api/pricing/); [llmx aggregator](https://llmx-tech.pages.dev/llm-pricing)
- Google list prices per million tokens (input / output): Gemini 3.1 Pro USD 2 / USD 12, Gemini 2.5 Pro USD 1.25 / USD 10. These come from aggregators only. — [solvimon](https://solvimon.com/pricing-guides/openai-vs-gemini). FLAG: secondary. Confirm on Google's pricing page.

### Inferences
- These are my own per-task estimates at Anthropic list prices. They are calculations, not published figures.
  - Research synthesis with 50,000 input and 4,000 output tokens: Sonnet 5.5 about USD 0.14, Opus 5.5 about USD 0.28, Haiku 5.5 about USD 0.007.
  - Red-teaming a 20,000-token plan with 3,000 output tokens: Sonnet 5.5 about USD 0.07.
  - Drafting with 10,000 input and 2,000 output tokens: Sonnet 5.5 about USD 0.04.
  - Option generation with 15,000 input and 3,000 output tokens: Opus 5.5 about USD 0.12.
  - Agentic research with web search and many turns can use ten times as many tokens or more. Web search and tool fees are extra.
- A heavy user with 200 Sonnet-class tasks a month at about USD 0.15 each costs about USD 30 a month. A light user with 30 tasks costs about USD 4.50. This spread supports included credits per seat plus paid top-up packs, rather than unlimited AI.
- Prompt caching of shared context can cut repeat-call input cost sharply. Examples of shared context: the company profile and the strategy framework.
- Self-hosted or EU and US regional routes add about 10 percent to API costs. Self-hosting adds fixed GPU costs that make sense only at scale or when customers demand it.
- Turkish lira pricing must account for the exchange rate. No current rate was checked.

### Gaps
- No verified published price was found for AI add-ons from strategy-planning or OKR tools such as Cascade, Quantive or Workboard.
- No Turkish-market data was found on what Turkish B2B buyers will pay for AI.
- Primary pricing pages were not opened for OpenAI (only a snippet), Google, Azure or Bedrock.

## 5. Liability, disclaimers and logging

### Takeaway
The EU withdrew the AI Liability Directive in February 2025. The new Product Liability Directive (EU) 2024/2853 treats software and AI as products, and member states must apply it by 9 December 2026. It mainly covers harm to natural persons, so a company's loss from a bad strategy decision is mostly a matter of contract and national law. In Türkiye, contract terms can limit liability, but not for intent or gross negligence (LAWYER). The AI Act requires automatic logs only for high-risk systems. Logs are still the best defence and a strong selling point.

### Cited Findings
- The Commission withdrew the AI Liability Directive proposal in February 2025, citing no foreseeable agreement. — [Bird & Bird](https://cm.twobirds.com/en/insights/2025/proposed-eu-ai-liability-rules-withdrawn); [TCI](https://www.tcilaw.de/en/ai-liability-eu-commission-withdraws-proposal-for-directive/)
- The revised PLD treats software as a product whether or not it is on a physical medium. AI systems and updates are included. Member states must transpose it by 9 December 2026. — [Bird & Bird, 2026](https://cm.twobirds.com/en/insights/2026/france/ai-liability-in-light-of-the-new-2024-pld-expanded-liability-challenging-defences-and-new-evidentiar); [IAPP](https://iapp.org/news/a/ai-as-product-vs-ai-as-service-unpacking-the-liability-divide-in-eu-safety-legislation)
- Cases outside the PLD fall under national liability law. The PLD does not cover negligence or unlawful conduct. — [Oxford Business Law Blog](https://blogs.law.ox.ac.uk/oblb/blog-post/2025/04/ai-liability-after-aild-withdrawal-why-eu-law-still-matters)
- PLD damage covers death, personal injury, damage to property and destruction or corruption of data. Property used only for professional purposes is excluded. Pure economic loss is not covered. — [Directive (EU) 2024/2853 on EUR-Lex](https://eur-lex.europa.eu/eli/dir/2024/2853/oj). NOT VERIFIED IN THIS SESSION.
- KVKK's generative AI guide stresses human verification of outputs. — [Alomaliye summary](https://www.alomaliye.com/2025/11/24/sorularla-uretken-yapay-zeka-ve-kisisel-verilerin-korunmasi-rehberi/)
- AI Act logging: Article 12 requires automatic logging for high-risk systems. Article 26(6) requires deployers of high-risk systems to keep logs for at least six months. Neither applies to limited-risk systems. — [Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj). NOT VERIFIED IN THIS SESSION.
- Turkish Code of Obligations (TBK) Article 115 voids clauses that exclude liability for intent or gross negligence. — NOT VERIFIED IN THIS SESSION. LAWYER.

### Inferences
- A loss from a bad strategy decision by a business customer is mainly a contract matter. The terms of service should cover these points:
  1. AI output is decision support, not advice.
  2. The customer decides and is responsible for the decision.
  3. A liability cap, for example fees paid in the last 12 months, within the limits of TBK Article 115.
  4. No warranty that AI output is accurate.
  5. The customer must review AI output before use.
- The product design should support this split. Examples:
  - a "draft by AI" badge on generated content;
  - source citations for research synthesis;
  - a required human approval step before AI text enters an official plan version;
  - a decision log that records who approved what and when.
  This supports Article 50, the KVKK human-review advice and the liability position at the same time.
- Recommended logs per tenant: model and version, provider and region, prompt template version, retrieved sources, output, the user who accepted or edited it, and a timestamp. Store these in the customer's own Frappe site. Set retention per customer.
- Disclaimers alone may not protect against claims of misleading marketing. Marketing should not promise "correct strategy".

### Gaps
- No Turkish court decision on liability for AI-generated business advice was found.
- No published benchmark was found for AI disclaimer wording in strategy SaaS products.
- A lawyer must confirm how TBK Article 115 and the rules on standard contract terms (TBK Articles 20–25) apply to B2B AI disclaimers.

# Alan sözleşmesi

Kontrol motoru ve raporlar bu alan adlarını okur. Adım tanımları bu adları aynen kullanır. Başka alan eklenebilir. Bu adlar değiştirilemez.

Bir kontrol yalnız kendi adımlarını ve önceki adımları okur. Sıra [süreç haritasındadır](surec-haritasi.md). Hazırlık kontrolü ve teslim raporu yalnız Adım 00 ile Adım 18 arasını okur.

Alan adları kod adıdır ve değişmez. Ekranda görünen terimler [terim sözlüğündedir](terim-sozlugu.md). Örneğin `pist` anahtarı kalır. Ekranda "Kasa süresi" yazar.

Her adımın cevapları `plan.steps["NN"].values` altında durur. Adım 00 ve Adım 02 özel durumdur. Adım 00 `plan.profile` nesnesine yazar. Adım 02 hem kendi cevaplarına hem `plan.limits` nesnesine yazar.

| Adım | Alan | Tür | Ne için okunur? |
|---|---|---|---|
| 00 | customer, offering, regulation, team, teamSize, funding, market, start, paid, needsPremises, smallReversible, marketplaceSeller, marketplaceBuyer, description | profile | Koşullar ve Kontrol 1 |
| 01 | whys | repeater, satır alanı `why` | Kontrol 1 |
| 01 | exitDirection | segmented | Kontrol 1 |
| 01 | fitDomain, fitStory, fitAccess, fitSkill | rate 1 ile 5 | Kontrol 1 uyum puanı |
| 01 | partners | repeater | Rapor |
| 02 | successSentence | text | Rapor |
| 02 | stopRules | repeater, satır alanı `rule` | Kontrol 1, rapor |
| 02 | monthlyBurnKurus, cashKurus, budgetKurus | money | Kasa süresi, sınırlar, Kontrol 1, 4, 5 |
| 02 | deadline | date | Sınırlar |
| 02 | retriesPerDecision | number | Deneme hakkı |
| 02 | hoursPerWeek | number | Süre uyarısı |
| 02 | extraIncome | toggle | Kontrol 1 beklet satırı |
| 03 | rights | repeater | Kontrol 1 |
| 06 | interviews | repeater, satır alanları `person, role, recognizes (toggle), spendsToday (toggle), lastEvent, frequency, loss, ladder (evidenceLadder), quote` | Kontrol 2 |
| 07 | repeatMeasure, effortMeasure, lossMeasure | measure | Kontrol 2 |
| 08 | behavior, accessPath | textarea | Kontrol 2 ve 3 |
| 09 | reachNotes | textarea | Kontrol 3 |
| 09 | somCustomers, targetCustomers | number | Kontrol 3 pazar ölçütü |
| 11 | options | repeater, ilk satır sabit "Bugünkü yöntem", satır alanı `name` | Kontrol 3 |
| 11 | currentMethodWins | toggle | Kontrol 3 beklet satırı |
| 12 | skills | repeater, satır alanları `skill, plan (select: yap, satinAl, ortak, yok), partnerConfirmed (toggle)` | Kontrol 3 |
| 14 | mode | segmented: ucretli, ucretsiz | Kontrol 4 |
| 14 | canInvoice | toggle | Kontrol 4 |
| 14 | budgetOwner | text | Kontrol 4 |
| 14 | deliveryAuthorized | toggle | Kontrol 4 |
| 15 | threshold | threshold | Kontrol 4 |
| 15 | offers | repeater, satır alanları `person, result (select: kabul, ret), ladder (evidenceLadder), reason` | Kontrol 4 |
| 16 | contributionMid | money | Kontrol 5 |
| 16 | paymentDays | repeater, satır alanları `date, balanceAfterKurus (money)` | Kontrol 5, kasa grafiği |
| 17 | risks | repeater, satır alanları `risk, likelihood (rate 1 ile 3), impact (rate 1 ile 3), trigger, response, owner` | Kontrol 5 |
| 04 | factorNotes | repeater, satır alanları `factor, change, effect (select: firsat, tehdit), action` | Adım 18 durum özeti |
| 02 | horizon | textarea, isteğe bağlı | Teslim raporu, sınırlar |
| 09 | failedAttempts | repeater, satır alanları `who, what, why, difference` | Teslim raporu |
| 10 | assumptions | repeater. Yeni satır alanı `affectsPath` isteğe bağlıdır. | Teslim raporu |
| 12 | strengths | repeater, satır alanları `name, valuable, rare, hardToCopy, organized (select: evet, hayir), basis` | Adım 12 tamamlama kuralı, Adım 16 güç listesi, Adım 18 durum özeti, teslim raporu |
| 12 | bottleneck, bottleneckLimit, bottleneckAlt | text, isteğe bağlı | Teslim raporu, sınırlar |
| 12 | groupResource, groupTerms, groupDecider, groupDemand, groupExpectation, groupAutonomy, groupBasis | yalnız grup profilinde | Teslim raporu |
| 15 | validRequests, matchedRequests, registeredSellers, activeSellers, matchHours | number, yalnız pazar yeri profilinde | Teslim raporu |
| 15 | participants, beneficiaries, benefitNote | yalnız ücretsiz hizmette | Teslim raporu |
| 16 | commitmentsKnown (segmented: var, yok, bilinmiyor), spentKurus, commitments (repeater: `what, amountKurus, dueDate, basis`) | isteğe bağlı | Serbest bütçe hesabı, teslim raporu |
| 08 | blockerPerson | text, isteğe bağlı | Teslim raporu |
| 17 | dependencies (chips), dependencyNote | isteğe bağlı | Teslim raporu, sınırlar |
| 17 | dissents | repeater, satır alanları `who, about, view, response (select: kabul, suruyor, bekliyor)` | Teslim raporu |
| 17 | worstCase | textarea, isteğe bağlı | Teslim raporu, sınırlar, "En kötü durum" |
| 17 | stakeholders | repeater, isteğe bağlı, satır alanları `who, effect (select), how, plan` | Teslim raporu, "İşi etkileyen kişiler" |
| 04 | uncertainty1Level, uncertainty2Level | select, isteğe bağlı | Teslim raporu, belirsizlik seviyesi |
| 18 | crossSO, crossWO, crossST, crossWT | textarea, isteğe bağlı | Teslim raporu |
| 18 | crux, cruxWhy, cruxPaths, cruxAlt, cruxSplit, cruxEvidence, cruxCounter | metin ve kanıt bağı, isteğe bağlı | Teslim raporu |
| 18 | successConditions | repeater, satır alanları `condition, paths, measure, baseline, threshold, thresholdWhen (select: once, sonra), owner, support, counter, comment` | Teslim raporu |
| 18 | pathLinks | repeater, satır alanları `path, a, b, relation (select: destekliyor, celisiyor, bilinmiyor), reason` | Teslim raporu |
| 18 | paths | repeater, satır alanları `name, where, how, revenue, vehicle (select: kendimiz, satinAl, ortak), giveUp, evidence, evidenceIds (kanıt bağı), origin (select: so, wo, st, wt, baska), cost, reversible`. İlk satır "Bugünkü durumu sürdürmek"tir. | Kontrol 5, hazırlık kontrolü, teslim raporu |
| 18 | pathScores, counterMove | puanlama ve textarea | Teslim raporu |
| 18 | openDecisions | repeater, satır alanları `question, alternatives, basis, owner, dueDate, reversalCost, door` | Teslim raporu |
| S21 (2.1) | diagnosis, diagnosisWhy | text ve textarea | Strateji oluşturmanın bitişi, yönetici raporu |
| S21 (2.1) | setAside | textarea, isteğe bağlı | Yalnız kayıt |
| S22 (2.2) | options | repeater, satır alanları `name, what, source (select: hazirlik, yeni), difference` | Strateji oluşturmanın bitişi, 2.3 adımının denetimi |
| S23 (2.3) | tests | repeater, satır alanları `option, mustBeTrue, weakest, how, result (select: destek, karsi, sinanmadi)` | Strateji oluşturmanın bitişi |
| S23 (2.3) | fit | scoreMatrix, isteğe bağlı, dört ölçüt | Yalnız kayıt |
| 19 (2.4) | chosenPath, choiceReason, givenUp | text ve textarea | Strateji oluşturmanın bitişi, yönetici raporu, aksiyon planı |
| 19 (2.4) | winningAim, playField | text ve textarea | Adımın tamamlanması, yönetici raporu |
| S25 (2.5) | moves | repeater, satır alanları `move, serves, capability, have (select: var, kurulacak, disaridan)` | Strateji oluşturmanın bitişi, yönetici raporu |
| 20 (çıkış kontrolü) | qualityCheck | checklist, 5 madde | Strateji oluşturmanın bitişi |
| 20 (çıkış kontrolü) | approvedBy, approvedAt | text ve date | Strateji oluşturmanın bitişi |
| U31 (3.1) | objective | text | Aksiyon planı |
| U31 (3.1) | keyResults | repeater, satır alanları `kr, baseline, target` | Adımın denetimi |
| U32 (3.2) | now, next, later | repeater, satır alanları `action, owner, dueDate` | Aksiyon planı, 3.3 adımının önerisi |
| U33 (3.3) | resources | repeater, satır alanları `item, budgetKurus (money), people` | Kaynak hesabı |
| U33 (3.3) | resourceOwner, resourceShift | text ve textarea | Adımın tamamlanması |
| 21 | buildWeeks | number | Adım 21 uyarısı |
| 22 | measure1, measure2, measure3, benefitMeasure | measure | Kontrol 6 |
| 22 | harmLimit | text | Rapor |
| 24 | results | repeater, satır alanları `channel, costKurus (money), reached, tried, paying` | Kontrol 7 |
| 25 | harmObserved | toggle | Kontrol 6 |
| 25 | pivotObserved | select: geriDonmuyor, beklenmedikAmac, odemeYok, yok | Kontrol 6 |
| 25 | hasIdeas | toggle | Kontrol 6 |
| 26 | cyclesDone | number | Kontrol 7 |
| 28 | signal | segmented: var, yok, bilinmiyor | Kontrol 7 |
| 29 | ltvKurus, cacKurus | money | Kontrol 7 |
| 29 | trendUp, cashFalling | toggle | Kontrol 7 |
| 31 | done | checklist | Kontrol 7 |
| 32 | delayGrowing | toggle | Kontrol 7 |
| 33 | direction | segmented: buyut, surdur, devret, kapat | Kontrol 8 |
| 33 | trialResult | segmented: ayni, farkli, bilinmiyor | Kontrol 8 |
| 33 | cashHolds | toggle | Kontrol 8 |
| 34 | acceptedInWriting | toggle | Kontrol 8 |

Para alanları kuruş cinsinden tam sayı tutar. Örneğin 1.250,50 TL için 125050.

## Adım kimlikleri ve kodlar

Strateji oluşturma ve strateji uygulama adımları ekranda alt aşama koduyla görünür. Veride ise kimlikleriyle durur.

| Kimlik | Ekrandaki kod | Ad |
|---|---|---|
| S21 | 2.1 | Teşhis |
| S22 | 2.2 | Seçenekler |
| S23 | 2.3 | Sınama |
| 19 | 2.4 | Seçim ve vazgeçiş |
| S25 | 2.5 | Ana hamleler ve gerekli yetkinlikler |
| 20 | Çıkış kontrolü | Strateji belgesi |
| U31 | 3.1 | Hedef ve gösterge |
| U32 | 3.2 | Ana işler ve sorumlular |
| U33 | 3.3 | Kaynak ve bütçe |

Öteki adımlar ekranda "Adım" sözüyle ve numarasıyla görünür. Örneğin "Adım 12".

## Strateji gözden geçirme kaydı

Kayıtlar `plan.strategyReviews` dizisinde durur. Son kayıt geçerlidir.

| Alan | Tür | Anlamı |
|---|---|---|
| holds | evet, kismen, hayir | "Seçim hâlâ doğru mu?" sorusunun cevabı |
| decision | surdur, duzelt, yenidenAc | Karar sahibinin kararı |
| reason | metin, en az 20 karakter | Gerekçe |
| evidence | metin, isteğe bağlı | Kararın dayandığı gözlem ya da sayı |
| decidedBy, decidedAt | metin ve tarih | Karar sahibi ve karar zamanı |

## Sürüm 3 taşıması

Eski kayıtta hedef ve iş alanları Adım 19'da durur. Yazılım açılışta bu alanları taşır:

- `objective` ve `keyResults` alanları U31 adımına geçer.
- `now`, `next`, `later` ve `weeklyBottleneck` alanları U32 adımına geçer.

Yeni adımda değer varsa yazılım üstüne yazmaz. İçe alınan eski dosya da aynı taşımadan geçer.

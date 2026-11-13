# Alan sözleşmesi

Kapı motoru ve raporlar bu alan adlarını okur. Adım tanımları bu adları aynen kullanır. Başka alan eklenebilir. Bu adlar değiştirilemez.

Her adımın cevapları `plan.steps["NN"].values` altında durur. Adım 00 ve Adım 02 özel durumdur. Adım 00 `plan.profile` nesnesine yazar. Adım 02 hem kendi cevaplarına hem `plan.limits` nesnesine yazar.

| Adım | Alan | Tür | Ne için okunur? |
|---|---|---|---|
| 00 | customer, offering, regulation, team, teamSize, funding, market, start, paid, needsPremises, smallReversible, marketplaceSeller, marketplaceBuyer, description | profile | Koşullar ve Kapı 1 |
| 01 | whys | repeater, satır alanı `why` | Kapı 1 |
| 01 | exitDirection | segmented | Kapı 1 |
| 01 | fitDomain, fitStory, fitAccess, fitSkill | rate 1 ile 5 | Kapı 1 uyum puanı |
| 01 | partners | repeater | Rapor |
| 02 | successSentence | text | Rapor |
| 02 | stopRules | repeater, satır alanı `rule` | Kapı 1, rapor |
| 02 | monthlyBurnKurus, cashKurus, budgetKurus | money | Pist, sınırlar, Kapı 1, 4, 5 |
| 02 | deadline | date | Sınırlar |
| 02 | retriesPerDecision | number | Deneme hakkı |
| 02 | hoursPerWeek | number | Süre uyarısı |
| 02 | extraIncome | toggle | Kapı 1 beklet satırı |
| 03 | rights | repeater | Kapı 1 |
| 06 | interviews | repeater, satır alanları `person, role, recognizes (toggle), spendsToday (toggle), lastEvent, frequency, loss, ladder (evidenceLadder), quote` | Kapı 2 |
| 07 | repeatMeasure, effortMeasure, lossMeasure | measure | Kapı 2 |
| 08 | behavior, accessPath | textarea | Kapı 2 ve 3 |
| 09 | reachNotes | textarea | Kapı 3 |
| 09 | somCustomers, targetCustomers | number | Kapı 3 pazar ölçütü |
| 11 | options | repeater, ilk satır sabit "Bugünkü yöntem", satır alanı `name` | Kapı 3 |
| 11 | currentMethodWins | toggle | Kapı 3 beklet satırı |
| 12 | skills | repeater, satır alanları `skill, plan (select: yap, satinAl, ortak, yok), partnerConfirmed (toggle)` | Kapı 3 |
| 14 | mode | segmented: ucretli, ucretsiz | Kapı 4 |
| 14 | canInvoice | toggle | Kapı 4 |
| 14 | budgetOwner | text | Kapı 4 |
| 14 | deliveryAuthorized | toggle | Kapı 4 |
| 15 | threshold | threshold | Kapı 4 |
| 15 | offers | repeater, satır alanları `person, result (select: kabul, ret), ladder (evidenceLadder), reason` | Kapı 4 |
| 16 | contributionMid | money | Kapı 5 |
| 16 | paymentDays | repeater, satır alanları `date, balanceAfterKurus (money)` | Kapı 5, kasa grafiği |
| 17 | risks | repeater, satır alanları `risk, likelihood (rate 1 ile 3), impact (rate 1 ile 3), trigger, response, owner` | Kapı 5 |
| 18 | chosenPath | text | Kapı 5, rapor |
| 18 | givenUp | textarea | Rapor |
| 19 | now, next, later | repeater, satır alanları `action, owner, dueDate` | Aksiyon planı |
| 20 | qualityCheck | checklist, 5 madde | Kapı 5 |
| 21 | buildWeeks | number | Kapı 5 pist |
| 22 | measure1, measure2, measure3, benefitMeasure | measure | Kapı 6 |
| 22 | harmLimit | text | Rapor |
| 24 | results | repeater, satır alanları `channel, costKurus (money), reached, tried, paying` | Kapı 7 |
| 25 | harmObserved | toggle | Kapı 6 |
| 25 | pivotObserved | select: geriDonmuyor, beklenmedikAmac, odemeYok, yok | Kapı 6 |
| 25 | hasIdeas | toggle | Kapı 6 |
| 26 | cyclesDone | number | Kapı 7 |
| 28 | signal | segmented: var, yok, bilinmiyor | Kapı 7 |
| 29 | ltvKurus, cacKurus | money | Kapı 7 |
| 29 | trendUp, cashFalling | toggle | Kapı 7 |
| 31 | done | checklist | Kapı 7 |
| 32 | delayGrowing | toggle | Kapı 7 |
| 33 | direction | segmented: buyut, surdur, devret, kapat | Kapı 8 |
| 33 | trialResult | segmented: ayni, farkli, bilinmiyor | Kapı 8 |
| 33 | cashHolds | toggle | Kapı 8 |
| 34 | acceptedInWriting | toggle | Kapı 8 |

Para alanları kuruş cinsinden tam sayı tutar. Örneğin 1.250,50 TL için 125050.

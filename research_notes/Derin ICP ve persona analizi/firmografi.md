# Turkish firmographics for sizing and segmenting the Karar Atlası ICP

Research date: 16 November 2026. Turkey only. Every figure has a source, year and URL. Calculations and estimates are marked **[CALC]** or **[EST]** with the formula. Blank or "c" cells in TÜİK tables are confidential (Law 5429), not zero.

**Source map (read first).** Four primary sources were opened and parsed in this session:

| Short name | What it is | Unit counted | Size criterion | Latest year | URL |
|---|---|---|---|---|---|
| YSHİ 2025 | TÜİK "Yıllık Sanayi ve Hizmet İstatistikleri, 2025", bulletin no. 58132, 27 August 2026, provisional, NACE Rev. 2.1, excludes finance and insurance | Enterprise (girişim) | Employees only | 2025 | [TÜİK bulletin 58132](https://veriportali.tuik.gov.tr/tr/press/58132) (table "Ekonomik faaliyet ve büyüklük grubuna göre temel göstergeler, 2025") |
| İş Kayıtları 2024 | TÜİK business register: "Büyüklük Grubuna Göre Girişim Sayısı" (DF_BR_BUYUKLUK_GIRISIM_V1) and "Number of Enterprises by Economic Activity and Size Group (IBBS-3, 2024 and beyond)" (DF_BR_FAALIYET_BUYUKLUK_GIRISIM_IBBS3_24_28) | Enterprise | Employees only | 2024 | [TÜİK databrowser, size × province](https://databrowser2.tuik.gov.tr/#/tr/tuik/TR,DF_BR_BUYUKLUK_GIRISIM_V1,1.0); [TÜİK databrowser, activity × size × province](https://databrowser2.tuik.gov.tr/#/tr/tuik/TR,DF_BR_FAALIYET_BUYUKLUK_GIRISIM_IBBS3_24_28,1.0) |
| KOSGEB 2026 | KOSGEB "Türkiye'deki KOBİ'lere İlişkin Bazı İstatistiki Göstergeler" (77 pages, 2026). Re-publishes TÜİK KOBİ İstatistikleri 2024 (24 December 2025) and İş Kayıtları 2024 | Enterprise | KOBİ tables: employees **and** financial limits. İş Kayıtları tables: employees only | 2024 | [KOSGEB PDF](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/Kurumsal/2026/Tu%CC%88rkiye'deki_KOBI%CC%87'lere_I%CC%87lis%CC%A7kin_Baz%C4%B1_I%CC%87statistiki_Go%CC%88stergeler.pdf) |
| SGK 2025 | SGK İstatistik Yıllığı 2025, Bölüm 1, Tables 1.9, 1.12, 1.14 (4/1-a scope) | **Workplace** (işyeri, i.e. an SGK-registered establishment), not enterprise | Insured employees | 2025 | [SGK yearbook page](https://www.sgk.gov.tr/Istatistik/Yillik/fcd5e59b-6af9-4d90-a451-ee7500eb1cb4/); [2025 zip file](https://www.sgk.gov.tr/download/downloadfile?f=cebae149-a5ac-41ba-8a5a-cbaf2af17dcb.zip&d=b449b3c3-1c9f-4c33-bc21-d317d29e97a4) |

Why three different "medium firm" counts exist (do not mix them):
- İş Kayıtları counts more units than YSHİ. It also counts registered firms with no turnover or staff, and it includes agriculture (A) and finance (K). YSHİ excludes A, K and part of S. — [KOSGEB 2026, p. 4](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/Kurumsal/2026/Tu%CC%88rkiye'deki_KOBI%CC%87'lere_I%CC%87lis%CC%A7kin_Baz%C4%B1_I%CC%87statistiki_Go%CC%88stergeler.pdf)
- The KOBİ statistics use employees **and** financial limits. So "orta" (medium) in KOBİ tables is 59,115 firms in 2024. The employee-only 50–249 count is 34,163 (İş Kayıtları 2024). The ICP is defined by employees, so use the employee-only counts. — [KOSGEB 2026, pp. 3, 5, 8](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/Kurumsal/2026/Tu%CC%88rkiye'deki_KOBI%CC%87'lere_I%CC%87lis%CC%A7kin_Baz%C4%B1_I%CC%87statistiki_Go%CC%88stergeler.pdf)
- SGK counts workplaces. A firm with three plants can appear three times, and public-sector workplaces are included. SGK is the only source here with a separate 250–499 band.

## 1. How many Turkish enterprises exist by size class, sector and region, with employment, turnover and value added?

### Takeaway
Turkey had 34,072 enterprises with 50–249 employees and 6,237 with 250+ in 2025 (YSHİ, employee-only). The business register gives 34,163 and 6,400 for 2024. A 50–249 firm had an average turnover of about 734 million TL in 2025. A 250+ firm had about 6.9 billion TL. Eleven ICP provinces hold 67% of all 50–249 enterprises and 77% of all 250+ enterprises.

### Cited Findings

**A. National totals by size class, YSHİ 2025 (provisional, employee-only, excl. finance)** — [TÜİK bulletin 58132, table "Ekonomik faaliyet ve büyüklük grubuna göre temel göstergeler, 2025"](https://veriportali.tuik.gov.tr/tr/press/58132)

| Size class | Enterprises | Persons employed | Turnover (billion TL) | Value added at factor cost (billion TL) | Avg turnover per firm (million TL) **[CALC: turnover ÷ enterprises]** |
|---|---|---|---|---|---|
| 1–9 | 3,772,033 | 7,334,066 | 32,243 | 3,179 | 8.5 |
| 10–49 | 203,717 | 3,950,672 | 24,686 | 3,569 | 121 |
| 50–249 | 34,072 | 3,400,681 | 25,018 | 5,053 | 734 |
| 250+ | 6,237 | 5,437,398 | 42,870 | 10,400 | 6,873 |
| Total | 4,016,059 | 20,122,817 | 124,816 | 22,201 | 31 |

- Size-class shares in 2025: turnover 25.8% (1–9), 19.8% (10–49), 20.1% (50–249), 34.3% (250+). Employment 36.4%, 19.6%, 17.0% and 27.0%. — [TÜİK bulletin 58132](https://veriportali.tuik.gov.tr/tr/press/58132)
- 2025 enterprises by sector group: services 48.4%, trade 31.6%, industry 12.4%. Industry holds 28.5% of turnover and 26.1% of employment. — [TÜİK bulletin 58132](https://veriportali.tuik.gov.tr/tr/press/58132)
- 54.4% of manufacturing enterprises were in low-technology activities in 2025. They held 47.9% of manufacturing employment and 35.8% of its turnover. — [TÜİK bulletin 58132](https://veriportali.tuik.gov.tr/tr/press/58132)
- TÜİK plans the final 2025 results and NACE Rev. 2.1 back-casts for 2009–2024 for December 2026. The 2025 figures above can therefore change. — [TÜİK bulletin 58132](https://veriportali.tuik.gov.tr/tr/press/58132)

**B. Sections by size class, YSHİ 2025.** NACE Rev. 2.1 section letters differ from Rev. 2 after J. In Rev. 2.1, K is telecom and IT, M is real estate, N is professional services, O is administrative support, Q is education, R is health, S is arts and T is other services. — [TÜİK bulletin 58132 table](https://veriportali.tuik.gov.tr/tr/press/58132)

| Section (Rev. 2.1) | 10–49 | 50–249 | Employed in 50–249 | Avg turnover 50–249 (mn TL) **[CALC]** | 250+ | Employed in 250+ | Avg turnover 250+ (mn TL) **[CALC]** | All firms |
|---|---|---|---|---|---|---|---|---|
| B Mining | 1,119 | 334 | 34,127 | 527 | 84 | 58,520 | 7,570 | 5,729 |
| C Manufacturing | 44,777 | 12,140 | 1,265,875 | 522 | 2,377 | 1,733,102 | 7,102 | 479,164 |
| D Energy | 778 | 252 | 27,260 | 4,793 | 85 | 93,507 | 23,173 | 7,065 |
| E Water and waste | 520 | 103 | 10,028 | 495 | 46 | 40,665 | 5,694 | 5,711 |
| F Construction | 33,683 | 5,554 | 528,842 | 399 | 599 | 323,092 | 3,576 | 305,137 |
| G Wholesale and retail | 44,902 | 5,085 | 470,442 | 2,104 | 697 | 871,502 | 18,369 | 1,268,261 |
| H Transport and storage | 15,736 | 1,853 | 178,013 | 533 | 321 | 371,157 | 12,061 | 626,085 |
| I Accommodation and food | 19,575 | 2,396 | 240,787 | 227 | 501 | 412,614 | 2,449 | 326,472 |
| J Publishing and broadcasting | 902 | 150 | 15,999 | 722 | 21 | 11,443 | 2,384 | 16,040 |
| K Telecom, IT, programming | 2,790 | 533 | 53,377 | 697 | 98 | 81,048 | 8,189 | 52,684 |
| M Real estate | 1,708 | 250 | 23,978 | 779 | 28 | 17,733 | 2,858 | 75,071 |
| N Professional, scientific, technical | 11,802 | 1,052 | 100,856 | 428 | 150 | 81,904 | 1,371 | 324,228 |
| O Administrative and support | 5,319 | 1,968 | 213,089 | 256 | 799 | 1,046,016 | 1,555 | 70,509 |
| Q Education | 7,473 | 1,154 | 113,236 | 138 | 169 | 122,713 | 1,278 | 36,519 |
| R Health and social work | 7,120 | 856 | 88,150 | 151 | 224 | 149,145 | 1,746 | 82,042 |
| S Arts, sport, recreation | 1,140 | 183 | 18,045 | 4,447 | 20 | 14,771 | 2,982 | 37,615 |
| T Other services | 4,373 | 209 | 18,577 | 329 | 18 | 8,466 | 1,640 | 297,727 |
| **Total** | **203,717** | **34,072** | **3,400,681** | **734** | **6,237** | **5,437,398** | **6,873** | **4,016,059** |

**C. Business register by section and size class, 2024 (İş Kayıtları, NACE Rev. 2, employee-only, includes A and K)** — [KOSGEB 2026, Tablo 1, p. 5](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/Kurumsal/2026/Tu%CC%88rkiye'deki_KOBI%CC%87'lere_I%CC%87lis%CC%A7kin_Baz%C4%B1_I%CC%87statistiki_Go%CC%88stergeler.pdf); same figures in [TÜİK databrowser DF_BR_FAALIYET_BUYUKLUK_GIRISIM_IBBS3_24_28](https://databrowser2.tuik.gov.tr/#/tr/tuik/TR,DF_BR_FAALIYET_BUYUKLUK_GIRISIM_IBBS3_24_28,1.0)

| Section (Rev. 2) | 0 | 1–9 | 10–49 | 50–249 | 250+ | Total |
|---|---|---|---|---|---|---|
| A Agriculture | 4,232 | 34,986 | 1,591 | 215 | 37 | 41,061 |
| B Mining | 1,616 | 3,960 | 1,072 | 348 | 86 | 7,082 |
| C Manufacturing | 18,811 | 437,372 | 45,314 | 12,388 | 2,487 | 516,372 |
| D Energy | 2,431 | 5,438 | 779 | 235 | 81 | 8,964 |
| E Water and waste | 469 | 5,994 | 543 | 121 | 45 | 7,172 |
| F Construction | 35,025 | 281,616 | 31,732 | 5,281 | 540 | 354,194 |
| G Trade | 48,728 | 1,431,818 | 45,098 | 4,854 | 681 | 1,531,179 |
| H Transport | 7,370 | 636,634 | 14,882 | 1,796 | 301 | 660,983 |
| I Accommodation and food | 11,003 | 312,691 | 18,021 | 2,250 | 484 | 344,449 |
| J Information and communication | 7,113 | 77,139 | 3,769 | 682 | 115 | 88,818 |
| K Finance and insurance | 3,622 | 19,100 | 1,079 | 256 | 104 | 24,161 |
| L Real estate | 5,574 | 84,457 | 1,583 | 237 | 28 | 91,879 |
| M Professional, scientific, technical | 14,039 | 320,703 | 11,327 | 1,023 | 139 | 347,231 |
| N Administrative and support | 9,119 | 66,945 | 5,692 | 2,046 | 813 | 84,615 |
| P Education | 3,392 | 28,730 | 7,028 | 1,124 | 168 | 40,442 |
| Q Health and social work | 3,043 | 72,968 | 6,643 | 813 | 240 | 83,707 |
| R Arts and recreation | 34,442 | 37,492 | 1,245 | 197 | 24 | 73,400 |
| S Other services | 181,037 | 200,077 | 3,906 | 297 | 27 | 385,344 |
| **Total** | **391,066** | **4,058,120** | **201,304** | **34,163** | **6,400** | **4,691,053** |

**D. Time series, business register (employee-only)** — [KOSGEB 2026, Tablo 2, p. 6](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/Kurumsal/2026/Tu%CC%88rkiye'deki_KOBI%CC%87'lere_I%CC%87lis%CC%A7kin_Baz%C4%B1_I%CC%87statistiki_Go%CC%88stergeler.pdf); [TÜİK databrowser DF_BR_BUYUKLUK_GIRISIM_V1](https://databrowser2.tuik.gov.tr/#/tr/tuik/TR,DF_BR_BUYUKLUK_GIRISIM_V1,1.0)

| Year | 10–49 | 50–249 | 250+ |
|---|---|---|---|
| 2015 | 172,178 | 28,135 | (not in KOSGEB table) |
| 2019 | 159,392 | 26,449 | 5,042 |
| 2020 | 165,158 | 26,661 | 5,038 |
| 2021 | 184,237 | 29,404 | 5,491 |
| 2022 | 193,043 | 31,089 | 5,880 |
| 2023 | 196,524 | 33,032 | 6,193 |
| 2024 | 201,304 | 34,163 | 6,400 |

- 250+ values for 2019–2024 come from the TÜİK databrowser. 10–49 and 50–249 values come from KOSGEB Tablo 2 and match the databrowser.
- **[CALC]** From 2020 to 2024, 50–249 enterprises grew 28.1% (34,163 ÷ 26,661 − 1). 250+ enterprises grew 27.0% (6,400 ÷ 5,038 − 1).

**E. KOBİ statistics 2024 (employee + financial criteria, YSHİ scope)** — [KOSGEB 2026, pp. vi–vii, 8, 11, 14, 27, 47, 51, 59](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/Kurumsal/2026/Tu%CC%88rkiye'deki_KOBI%CC%87'lere_I%CC%87lis%CC%A7kin_Baz%C4%B1_I%CC%87statistiki_Go%CC%88stergeler.pdf), reporting TÜİK "Küçük ve Orta Büyüklükteki Girişim İstatistikleri, 2024" (24 December 2025)
- Enterprises in 2024: micro 3,504,378, small 364,892, medium 59,115, large 14,410, total 3,942,795. SMEs are 99.6%.
- Manufacturing in 2024: micro 390,187, small 66,537, medium 16,418, large 4,862, total 478,004.
- Total turnover 91.5 trillion TL in 2024. Micro 8.2%, small 17.3%, medium 18.6%, so SMEs 44.1%.
- Turnover per enterprise in 2024: 23.2 million TL overall, 10.3 million TL for SMEs, 3.6 billion TL for large firms. In manufacturing: 48.7 million TL overall, 14.6 million TL for SMEs, 3.4 billion TL for large firms. KOSGEB calculated these ratios from TÜİK totals.
- Persons employed in 2024: 19,788,571. Micro 32.0%, small 20.1%, medium 16.5%, SMEs 68.5%. Large firms average 432.2 employees. Large manufacturing firms average 441.1.
- Value added per employee in 2024: 795.8 thousand TL overall, 478.7 thousand TL in SMEs, 1.5 million TL in large firms.
- Exporters in 2024: 176,703 enterprises, of which 169,911 are SMEs. 29.7% of medium firms and 47.1% of large firms export, versus 2.9% of micro firms. SMEs made 29.6% of 2024 exports (total 256.1 billion USD).
- Manufacturing division shares of all manufacturing SMEs in 2024: fabricated metal (25) 14.5%, apparel (14) 12.9%, food (10) 12.7%, furniture (31) 10.4%, repair and installation (33) 7.2%, textiles (13) 5.8%, machinery (28) 4.9%, rubber and plastics (22) 4.6%, wood (16) 4.3%, non-metallic minerals (23) 4.2%, leather (15) 2.3%, chemicals (20) 1.8%, motor vehicles (29) 1.4%.

**F. Enterprises by province, business register 2024 (employee-only, all sections)** — [TÜİK databrowser DF_BR_BUYUKLUK_GIRISIM_V1](https://databrowser2.tuik.gov.tr/#/tr/tuik/TR,DF_BR_BUYUKLUK_GIRISIM_V1,1.0), extracted through its JSON data endpoint on 16 November 2026. Manufacturing columns come from [DF_BR_FAALIYET_BUYUKLUK_GIRISIM_IBBS3_24_28](https://databrowser2.tuik.gov.tr/#/tr/tuik/TR,DF_BR_FAALIYET_BUYUKLUK_GIRISIM_IBBS3_24_28,1.0), section C.

| Province | All firms | 10–49 | 50–249 | 250+ | Mfg (C) 50–249 | Mfg (C) 250+ | 50–249 in 2020 | 250+ in 2020 |
|---|---|---|---|---|---|---|---|---|
| İstanbul | 1,194,437 | 62,190 | 11,511 | 2,661 | 3,968 | 890 | 9,812 | 2,207 |
| Ankara | 361,399 | 17,041 | 3,560 | 733 | 769 | 150 | 2,660 | 521 |
| İzmir | 296,360 | 12,493 | 1,950 | 391 | 829 | 193 | 1,624 | 309 |
| Bursa | 188,384 | 9,256 | 1,565 | 317 | 924 | 211 | 1,295 | 256 |
| Kocaeli | 108,504 | 5,798 | 1,209 | 223 | 601 | 131 | 948 | 180 |
| Antalya | 207,900 | 8,040 | 1,186 | 242 | 152 | 27 | 796 | 134 |
| Konya | 128,376 | 4,613 | 741 | 95 | c | c | 585 | 68 |
| Gaziantep | 99,384 | 3,869 | 685 | 191 | 294 | 125 | 563 | 149 |
| Adana | 110,343 | 3,937 | 657 | 101 | 224 | 49 | 489 | 75 |
| Mersin | 103,869 | 3,934 | 637 | 71 | 162 | 19 | 446 | 55 |
| Kayseri | 75,097 | 3,208 | 521 | 82 | 267 | 52 | 408 | 67 |
| Denizli | 69,604 | 2,869 | 489 | 79 | 283 | 48 | 402 | 70 |
| Tekirdağ | 61,025 | 2,514 | 444 | 93 | 250 | 60 | 342 | 74 |
| Manisa | 75,033 | 2,463 | 375 | 75 | 200 | 49 | 289 | 65 |
| Samsun | 67,675 | 2,670 | 327 | 43 | 102 | 18 | 241 | 31 |
| Sakarya | 58,466 | 2,446 | 308 | 45 | 143 | 23 | 251 | 36 |
| Eskişehir | 47,726 | 1,750 | 282 | 53 | 117 | 30 | 228 | 44 |
| Balıkesir | 71,817 | 2,567 | 294 | 48 | 96 | 20 | 229 | 36 |
| Aydın | 72,086 | 2,342 | 294 | 44 | 79 | 16 | 209 | 30 |
| Hatay | 64,550 | 1,937 | 256 | 37 | 66 | 17 | 210 | 41 |
| Kahramanmaraş | 43,061 | 1,473 | 254 | 65 | 113 | 48 | 194 | 57 |
| Afyonkarahisar | 36,652 | 1,212 | 175 | 25 | 76 | 10 | 140 | 17 |
| Malatya | 29,090 | 986 | 167 | 19 | 66 | c | 158 | 19 |
| Uşak | 21,353 | 807 | 108 | 18 | 61 | 14 | 79 | 17 |
| Diyarbakır | 48,191 | 2,458 | 652 | 54 | n/a | n/a | 345 | 30 |
| Batman | 17,071 | 1,143 | 378 | 22 | n/a | n/a | 241 | 15 |
| Mardin | 25,149 | 1,653 | 335 | 12 | n/a | n/a | 177 | 11 |
| **Türkiye** | **4,691,053** | **201,304** | **34,163** | **6,400** | **12,388** | **2,487** | **26,661** | **5,038** |

- Konya manufacturing cells are confidential. The NUTS-2 region TR52 (Konya and Karaman) has 404 manufacturing enterprises with 50–249 employees and 53 with 250+. — [TÜİK databrowser DF_BR_FAALIYET_BUYUKLUK_GIRISIM_IBBS3_24_28](https://databrowser2.tuik.gov.tr/#/tr/tuik/TR,DF_BR_FAALIYET_BUYUKLUK_GIRISIM_IBBS3_24_28,1.0)
- Manufacturing 50–249 / 250+ by NUTS-2 region, 2024: TR10 İstanbul 3,968/890; TR41 Bursa-Eskişehir-Bilecik 1,064/248; TR42 Kocaeli-Sakarya-Düzce-Bolu-Yalova 981/185; TR31 İzmir 829/193; TR51 Ankara 769/150; TRC3 Mardin-Batman-Şırnak-Siirt 485/11; TR52 Konya-Karaman 404/53; TR32 Aydın-Denizli-Muğla 403/70; TR33 Manisa-Afyon-Kütahya-Uşak 387/86; TR62 Adana-Mersin 386/68; TRC1 Gaziantep-Adıyaman-Kilis 376/129; TR21 Tekirdağ-Edirne-Kırklareli 303/68; TR72 Kayseri-Sivas-Yozgat 303/60. — [same TÜİK dataset](https://databrowser2.tuik.gov.tr/#/tr/tuik/TR,DF_BR_FAALIYET_BUYUKLUK_GIRISIM_IBBS3_24_28,1.0)
- Data point to check: Diyarbakır, Batman and Mardin show unusually many 50–249 enterprises (652, 378 and 335) but few 250+ firms. TRC3 shows 485 manufacturing enterprises with 50–249 employees. SGK workplace counts show the same pattern (Mardin 404 and Batman 394 workplaces with 50–249 insured staff). The cause is not documented in the sources I read. Treat these provinces with care before targeting them.
- New-enterprise births in 2024 by province: İstanbul 25.8%, Ankara 7.5%, İzmir 6.5%. — [Alomaliye, reporting TÜİK Girişimcilik ve İş Demografisi 2024 (16 December 2025)](https://www.alomaliye.com/2025/12/16/girisimcilik-ve-is-demografisi-2024/)

### Inferences
- **[CALC]** The 11 ICP provinces named in the brief hold 67.5% of all 50–249 enterprises (23,050 ÷ 34,163) and 77.2% of all 250+ enterprises (4,940 ÷ 6,400) in 2024. The 11 provinces are İstanbul, Ankara, İzmir, Bursa, Kocaeli, Konya, Kayseri, Gaziantep, Denizli, Manisa and Tekirdağ.
- **[CALC]** For manufacturing 50–249, ten of these provinces hold 8,385 of 12,388 enterprises (67.7%). Konya is excluded because its cell is confidential. Adding the Konya-Karaman region (404) gives at most 8,789 (70.9%). For manufacturing 250+, the ten provinces hold 1,909 of 2,487 (76.8%).
- İstanbul alone holds 33.7% of 50–249 enterprises and 41.6% of 250+ enterprises. In manufacturing, its shares are 32.0% (50–249) and 35.8% (250+). A first sales motion focused on İstanbul plus the Marmara industrial belt (Bursa, Kocaeli, Tekirdağ, Sakarya) reaches about half of the mid-market. **[CALC]** All-sector 50–249 in these five provinces: 11,511 + 1,565 + 1,209 + 444 + 308 = 15,037. 15,037 ÷ 34,163 = 44.0%.
- An average 50–249 enterprise had turnover of about 734 million TL in 2025 (about 522 million TL in manufacturing). Many such firms exceed the 1 billion TL KOBİ limit and count as "large" in KOBİ statistics. The ICP should be defined by employees, not by the KOBİ label.

### Gaps
- TÜİK databrowser tables give sections and 4-digit classes, not 2-digit divisions. At province level, most 4-digit cells for 50–249 and 250+ are confidential. So **division × province × size is not usable from public data.** Ask TÜİK for a special tabulation, or use the TÜİK Mikro Veri Araştırma Merkezi.
- I did not find whether the business register assigns a multi-plant enterprise to its head-office province. This matters for Kocaeli, Tekirdağ and Manisa, where plants of İstanbul-registered firms sit. Check the TÜİK İş Kayıtları metadata or ask TÜİK.
- No public source gives turnover by province × size class.
- The YSHİ 2025 figures are provisional. Final figures are due in December 2026.

## 2. How many enterprises have 50–249 and 250–499 employees, by manufacturing division and by province?

### Takeaway
TÜİK does not publish a 250–499 band. At the enterprise level it publishes only 250+. SGK publishes 250–499 for **workplaces**. In 2025 there were 3,807 workplaces with 250–499 insured staff, 1,176 of them in manufacturing. **[EST]** About 3,960 enterprises had 250–499 employees in 2025, about 1,560 of them in manufacturing. **[EST]** The 50–499 employee band therefore holds about 38,000 enterprises, about 13,700 of them in manufacturing.

### Cited Findings

**A. Manufacturing divisions, enterprises (TÜİK İş Kayıtları 2024, national).** TÜİK publishes 4-digit classes only. I summed the classes into divisions. The sums are **lower bounds** because some class cells are confidential. — [TÜİK databrowser DF_BR_FAALIYET_BUYUKLUK_GIRISIM_IBBS3_24_28](https://databrowser2.tuik.gov.tr/#/tr/tuik/TR,DF_BR_FAALIYET_BUYUKLUK_GIRISIM_IBBS3_24_28,1.0)

**B. Manufacturing divisions, SGK workplaces (2025, national, 4/1-a).** — [SGK İstatistik Yıllığı 2025, Tablo 1.12](https://www.sgk.gov.tr/Istatistik/Yillik/fcd5e59b-6af9-4d90-a451-ee7500eb1cb4/)

| Division | TÜİK enterprises 10–49 (2024) | TÜİK enterprises 50–249 (2024, ≥) | TÜİK enterprises 250+ (2024, ≥) | Confidential class cells (50–249 / 250+) | SGK workplaces 50–249 (2025) | SGK workplaces 250–499 (2025) | SGK workplaces 500+ (2025) | SGK workplaces, all sizes (2025) |
|---|---|---|---|---|---|---|---|---|
| 10 Food | 5,972 | 1,004 | 234 | 6 / 11 | 1,301 | 187 | 95 | 50,960 |
| 11 Beverages | 149 | 8 | 0 | 2 / 3 | 99 | 6 | 0 | 770 |
| 13 Textiles | 3,122 | 1,154 | 365 | 0 / 0 | 1,190 | 162 | 55 | 18,600 |
| 14 Apparel | 6,226 | 2,253 | 282 | 0 / 2 | 2,218 | 128 | 40 | 35,514 |
| 15 Leather and footwear | 1,120 | 127 | 12 | 2 / 2 | 146 | 12 | 2 | 7,117 |
| 16 Wood (excl. furniture) | 986 | 84 | 19 | 3 / 3 | 123 | 12 | 8 | 11,528 |
| 17 Paper | 804 | 268 | 55 | 2 / 2 | 257 | 26 | 7 | 3,837 |
| 18 Printing | 658 | 98 | 14 | 2 / 0 | 104 | 8 | 4 | 8,858 |
| 20 Chemicals | 1,050 | 264 | 57 | 7 / 8 | 351 | 40 | 15 | 7,280 |
| 21 Pharmaceuticals | 111 | 56 | 45 | 0 / 0 | 84 | 24 | 22 | 847 |
| 22 Rubber and plastics | 2,573 | 672 | 125 | 2 / 2 | 752 | 58 | 27 | 15,070 |
| 23 Non-metallic minerals | 2,260 | 794 | 126 | 9 / 11 | 671 | 66 | 29 | 15,864 |
| 24 Basic metals | 984 | 337 | 108 | 5 / 8 | 434 | 57 | 51 | 7,236 |
| 25 Fabricated metal | 5,553 | 1,194 | 165 | 0 / 4 | 1,053 | 94 | 35 | 40,881 |
| 26 Electronics and optics | 204 | 24 | 14 | 8 / 5 | 172 | 15 | 14 | 2,792 |
| 27 Electrical equipment | 1,414 | 451 | 136 | 0 / 0 | 458 | 69 | 45 | 8,995 |
| 28 Machinery n.e.c. | 3,684 | 754 | 120 | 9 / 6 | 666 | 35 | 17 | 18,031 |
| 29 Motor vehicles and parts | 938 | 413 | 141 | 0 / 0 | 533 | 106 | 77 | 5,706 |
| 30 Other transport | 383 | 179 | 46 | 2 / 2 | 185 | 22 | 32 | 2,209 |
| 31 Furniture | 3,019 | 500 | 51 | 2 / 2 | 427 | 20 | 12 | 27,910 |
| 32 Other manufacturing | 1,521 | 174 | 26 | 6 / 2 | 184 | 11 | 5 | 10,147 |
| 33 Repair and installation | 2,060 | 402 | 25 | 3 / 3 | 273 | 15 | 22 | 22,858 |
| **C total** | **45,314** | **12,388** (published section total) | **2,487** (published section total) | — | **11,711** **[CALC: sum of divisions 10–33]** | **1,176** | **621** | **323,399** |

- The TÜİK division sums add up to 11,233 (50–249) and 2,174 (250+). The published section totals are 12,388 and 2,487. So about 1,155 and 313 enterprises sit in confidential cells. **[CALC]** 12,388 − 11,233 = 1,155. 2,487 − 2,174 = 313.
- Smaller rows (12 tobacco, 19 coke) are omitted from the table. Their counts are below 20 in every cell.

**C. Provinces, SGK workplaces with 50–249 and 250–499 insured staff (2025, all activities)** — [SGK İstatistik Yıllığı 2025, Tablo 1.14](https://www.sgk.gov.tr/Istatistik/Yillik/fcd5e59b-6af9-4d90-a451-ee7500eb1cb4/)

| Province | Workplaces 50–249 | Workplaces 250–499 | Workplaces 500+ | All workplaces |
|---|---|---|---|---|
| İstanbul | 8,958 | 871 | 595 | 618,326 |
| Ankara | 2,966 | 264 | 181 | 171,951 |
| İzmir | 2,099 | 208 | 103 | 152,393 |
| Bursa | 1,674 | 155 | 97 | 96,197 |
| Kocaeli | 1,409 | 190 | 96 | 61,096 |
| Antalya | 1,305 | 153 | 69 | 99,245 |
| Konya | 887 | 71 | 39 | 60,039 |
| Gaziantep | 879 | 120 | 67 | 44,130 |
| Tekirdağ | 803 | 109 | 38 | 32,436 |
| Adana | 758 | 89 | 42 | 49,612 |
| Mersin | 649 | 64 | 32 | 49,116 |
| Manisa | 616 | 78 | 44 | 34,825 |
| Hatay | 579 | 100 | 79 | 29,757 |
| Kayseri | 518 | 48 | 33 | 39,735 |
| Denizli | 481 | 46 | 10 | 32,115 |
| Kahramanmaraş | 468 | 79 | 36 | 21,169 |
| Sakarya | 454 | 41 | 36 | 31,020 |
| Eskişehir | 390 | 32 | 40 | 25,103 |
| **Türkiye** | **36,522** | **3,807** | **2,191** | **2,303,874** |

- SGK size bands are 1, 2–3, 4–6, 7–9, 10–19, 20–29, 30–49, 50–99, 100–249, 250–499, 500–749, 750–999 and 1000+. The 50–249 column above is 50–99 plus 100–249. SGK says the reference period is the previous year. The tables do not state which month they use. — [SGK yearbook 2025, Metaveri sheet](https://www.sgk.gov.tr/Istatistik/Yillik/fcd5e59b-6af9-4d90-a451-ee7500eb1cb4/)
- National SGK time series of workplaces with 250–299 insured staff: 1,109 (2016), 1,309 (2023), 1,293 (2024), 1,303 (2025). For 450–499: 284 (2016), 411 (2025). — [SGK yearbook 2025, Tablo 1.9](https://www.sgk.gov.tr/Istatistik/Yillik/fcd5e59b-6af9-4d90-a451-ee7500eb1cb4/)
- SGK also gives workplaces by activity division × province (Tablo 1.11), but without size bands. — [SGK yearbook 2025](https://www.sgk.gov.tr/Istatistik/Yillik/fcd5e59b-6af9-4d90-a451-ee7500eb1cb4/)

### Inferences
- **[EST] Enterprises with 250–499 employees, 2025.** Formula: TÜİK 250+ enterprises × SGK share of 250–499 among 250+ workplaces. All sectors: 6,237 × 3,807 ÷ (3,807 + 2,191) = 6,237 × 0.635 ≈ **3,960**. Manufacturing: 2,377 × 1,176 ÷ (1,176 + 621) = 2,377 × 0.654 ≈ **1,560**. The method assumes enterprises and workplaces have the same size distribution above 250. Multi-plant groups break this assumption, so the true share for enterprises is probably somewhat lower.
- **[EST] ICP band of 50–499 employees, 2025.** All sectors: 34,072 + 3,960 ≈ **38,000 enterprises**. Manufacturing: 12,140 + 1,560 ≈ **13,700 enterprises**.
- The largest manufacturing pools of mid-sized firms (50–249) are apparel (about 2,250), fabricated metal (about 1,190), textiles (about 1,150), food (about 1,000), non-metallic minerals (about 790) and machinery (about 750). Motor vehicle parts (29) and electrical equipment (27) have the largest share of 250+ firms, which fits a "large investment or export market" trigger.
- SGK and TÜİK mostly agree on the provincial ranking. Their top 8 provinces for 50–249 are the same and in the same order: İstanbul, Ankara, İzmir, Bursa, Kocaeli, Antalya, Konya, Gaziantep. Places 9 and 10 differ. In TÜİK they are Adana and Diyarbakır. In SGK they are Tekirdağ and Adana. Tekirdağ ranks higher in SGK, which fits the idea that plants of firms registered in İstanbul sit there. That idea is not verified.

### Gaps
- No public source counts **enterprises** with 250–499 employees. Ask TÜİK for an İş Kayıtları special tabulation with a 250–499 band, by NACE division and province. SGK can also produce enterprise-level (vergi numarası based) counts on request.
- Division × province × size for enterprises is suppressed in public TÜİK data. TOBB's Sanayi Kapasite Raporu database and the Sanayi ve Teknoloji Bakanlığı Sanayi Sicil Bilgi Sistemi may give firm-level employee counts by province. I did not open them in this session.

## 3. What is the legal KOBİ definition, with current thresholds and the regulation reference?

### Takeaway
A KOBİ has fewer than 250 employees and net sales or a balance sheet of no more than 1 billion TL. This limit applies since August 2025. Before that, the limit was 500 million TL.

### Cited Findings
- Current thresholds of the "Küçük ve Orta Büyüklükteki İşletmeler Yönetmeliği": — [KOSGEB 2026, p. 1](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/Kurumsal/2026/Tu%CC%88rkiye'deki_KOBI%CC%87'lere_I%CC%87lis%CC%A7kin_Baz%C4%B1_I%CC%87statistiki_Go%CC%88stergeler.pdf)

| Class | Annual employees | Annual net sales **or** balance sheet total |
|---|---|---|
| Micro | fewer than 10 | up to 10 million TL |
| Small | fewer than 50 | up to 100 million TL |
| Medium | fewer than 250 | up to 1 billion TL |

- The 2025 amendment raised the medium limit from 500 million TL to 1 billion TL. The employee limit of 250 did not change. — [Ekonomi Gazetesi](https://www.ekonomigazetesi.com/ekonomi/is-dunyasinin-talepleri-karsilik-buldu-kobi-tanimi-degistirildi-56129); [Forbes Türkiye](https://www.forbes.com.tr/ekonomi/kobi-tanimi-yeniden-duzenlendi-bilanco-siniri-1-milyar-liraya-yukseldi); [Capital](https://www.capital.com.tr/haberler/tum-haberler/yonetmelik-yayimlandi-kimlere-kobi-deniyor-taniminda-neler-degisti)
- Legal reference: Presidential Decision no. 10182, published in Resmî Gazete no. 32979 on 7 August 2025. This comes from a search summary of the news pages above. I did not open the Resmî Gazete text. — [search summary of the pages above; verify on resmigazete.gov.tr]
- The previous change was Presidential Decision no. 7297 (May 2023). — [Alomaliye, KOBİ Yönetmeliği Karar Sayısı 7297](https://www.alomaliye.com/2023/05/25/kucuk-ve-orta-buyuklukteki-isletmeler-yonetmeligi-karar-sayisi-7297/)
- KOBİDER estimated that the new limit would add 450,000 to 500,000 firms to the KOBİ group. This is an association estimate, not an official count. — [Bloomberg HT](https://www.bloomberght.com/kobi-sayisinda-yarim-milyonluk-artik-beklentisi-3754396)
- BDDK set the bank-regulation KOBİ limit at 1 billion TL for resident KOBİs with decision no. 11287 of 13 November 2025. — [KOSGEB 2026, p. 3, footnote 3](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/Kurumsal/2026/Tu%CC%88rkiye'deki_KOBI%CC%87'lere_I%CC%87lis%CC%A7kin_Baz%C4%B1_I%CC%87statistiki_Go%CC%88stergeler.pdf)
- Presidential Decision no. 10329 (Resmî Gazete no. 33003, 31 August 2025) let newly qualifying firms use non-KOBİ guarantee limits until 31 December 2025. This also comes from a search summary. — [Alomaliye, 31 Ağustos 2025 Resmi Gazete](https://www.alomaliye.com/2025/08/31/kredi-garanti-kurumlarina-saglanan-hazine-destegi-karar-sayisi-10329/)

### Inferences
- The ICP band (50–499 employees) cuts across the legal line. Firms with 50–249 employees and up to 1 billion TL in sales are legally KOBİ and can use KOSGEB support. Firms with 250–499 employees are never KOBİ.
- With an average 2025 turnover of 734 million TL for 50–249 firms, a large minority of them likely exceed 1 billion TL and lose KOBİ status. Messaging such as "for KOBİs" would miss them.

### Gaps
- I did not open the Resmî Gazete text in this session. The decision and gazette numbers should be checked there.
- No public table counts 50–249 employee firms by turnover band, so the share above 1 billion TL is unknown.

## 4. What share of Turkish firms are family-owned, by size and sector? Which generation is in control, and how common is succession planning?

### Takeaway
No official Turkish statistic counts family firms. The common "90–95% of firms" figure is an estimate that sources repeat from each other. PwC's 2016 Turkey survey (82 Turkish family firms) found that 54% had no succession plan. Only 4% had a documented and communicated succession plan. Recent Turkey-only succession data (2023–2026) are missing. Global 2025 data show 22% have a fully developed plan.

### Cited Findings
**Share of family firms**
- "95% of companies and 75% of listed companies in Turkey are family firms." This is PwC Türkiye's own statement in its 2016 report. No method is given. — [PwC Küresel Aile Şirketleri Araştırması 2016, Türkiye sonuçları (TAİDER copy)](https://taider.org.tr/images/belgeler/pwc_kuresel_aile_sirketleri_arastirmasi__turkiye_sonuclari_2016.pdf)
- Academic articles repeat the 95% figure. They cite older works such as Birincioğlu and Acuner (2015) or Kiracı and Alkara. It is not a new data set. — [DergiPark article 861771](https://dergipark.org.tr/tr/download/article-file/861771); [DergiPark article 224454](https://dergipark.org.tr/en/download/article-file/224454)
- Other sources give "about 90%" or "more than 90%". — [ASO, Aile Şirketleri](https://aso.org.tr/yayinlarimiz/ailesirketleri.pdf); [Alomaliye, Aile şirketleri (2024)](https://www.alomaliye.com/2024/07/09/aile-sirketleri/)
- Borsa İstanbul's IPO guide says most Turkish companies are family firms but gives no number. — [Borsa İstanbul halka arz rehberi](https://borsaistanbul.com/files/halka-arz-ve-borsa-istanbulda-islem-gorme-rehberi.pdf) (via search summary)

**Generation and succession, Turkey**
- PwC 2016, Turkey sample: 82 family firms chosen by a statistical method from a 500-firm sample. 40% had turnover above 100 million USD. 52% of respondents were family members and 48% were senior managers. The global survey had 2,802 interviews in 50 countries. — [PwC 2016 Türkiye sonuçları](https://taider.org.tr/images/belgeler/pwc_kuresel_aile_sirketleri_arastirmasi__turkiye_sonuclari_2016.pdf)
- PwC 2016, Turkey results: — [PwC 2016 Türkiye sonuçları](https://taider.org.tr/images/belgeler/pwc_kuresel_aile_sirketleri_arastirmasi__turkiye_sonuclari_2016.pdf)
  - 54% had not yet made a succession plan (global 43%).
  - 4% had a written, robust succession plan shared with the relevant people (global 15%).
  - More than half of owners planned to pass ownership (not management) to the next generation. 35% planned to pass management. 10% planned to sell or list.
  - 90% had at least one procedure for family conflicts (global 82%).
  - 71% grew sales in the past year. 15% saw a fall.
  - International sales were 36% of turnover, expected to reach 44% in five years.
- TKYD–TAİDER "Gelecek Neslin İşe Bakışı" survey: online, June to August 2021, 134 next-generation members of TAİDER families, aged 18–42. 83% held an active executive role. Management was controlled by the first generation in 66 firms, the second in 41 and the third in 21. "Succession plan" was the lowest-rated of three satisfaction areas. The lowest items were "we have a written succession plan" (mean −0.79) and "written rules that all family members know" (−0.73). — [TKYD–TAİDER report (published January 2024)](https://www.tkyd.org/wp-content/uploads/2024/01/TKYD-TAIDER-Gelecek-Neslin-Ise-Bakisi-Arastirma-Raporu.pdf)
- An earlier TAİDER member survey found that one in three families had friction during handover because of poor planning. This is quoted in the TKYD–TAİDER foreword. No year or sample is given. — [TKYD–TAİDER report](https://www.tkyd.org/wp-content/uploads/2024/01/TKYD-TAIDER-Gelecek-Neslin-Ise-Bakisi-Arastirma-Raporu.pdf)
- A survey of 200 family firms by Ortak Akıl Danışmanlık found that only 50% had institutionalised. — [Para Dergi, 24 July 2023](https://www.paradergi.com.tr/is-dunyasi-kulis/2023/07/24/aile-sirketlerinin-yalnizca-yarisi-kurumsallasiyor)
- Generation split of Turkish family firms: 38% first, 47% second, 13% third, 2% fourth or later. Average life is 34 years. This is secondary and dated. — [İSO, Aile şirketlerinde kurumsallaşma](https://www.iso.org.tr/sites/1/upload/files/aile_sirketlerinde_kurumsallasma-112.pdf) (via earlier research note; not re-opened)
- A TKYD study with the Milan stock exchange gives an average economic life of family firms of 104 years in Italy and 34 years in Turkey. — [Bloomberg HT](https://www.bloomberght.com/italyada-aile-sirketleri-104-yil-ayakta-kaliyor-turkiyede-ise-34-yil-3767321) (via search summary)
- A 2026 Turkish study of 601 SME managers says tension between generations slows digital transformation more than technology budgets do. — [Forbes Türkiye, 4 February 2026](https://www.forbes.com.tr/dergi/kurucular-temkinli-ikinci-kusak-hizli-dijital-donusum-gerilim-yaratiyor) (via earlier research note)
- A 2026 article says that "about two thirds" of Turkish family firms fail to pass to the second generation. It cites an İstanbul Ticaret Üniversitesi thesis without year or sample. It also says "the great majority" of İSO-member family firms surveyed lack a formal succession plan, with no number. — [Para Dergi, 18 August 2026](https://paradergi.com.tr/life-style/2026/08/18/aile-sirketlerinde-gelecek-dugumu-veliaht-var-lider-yok)

**Global benchmarks (not Turkey-specific)**
- PwC 12th Global Family Business Survey (published November 2025): 1,325 owners and senior leaders in more than 60 countries. 22% have a fully developed succession plan for all key roles, down from 26% two years earlier. 25% achieved double-digit sales growth, down from 43%. 71% see value in hiring outside professionals for future leadership. 13% use AI in a significant part of operations. The news coverage gives no Turkey breakdown. — [Bloomberg HT](https://www.bloomberght.com/pwc-aile-sirketleri-artan-kuresel-baskilarla-karsi-karsiya-3762476); [Ekonomim, 27 November 2025](https://www.ekonomim.com/is-dunyasi/aile-sirketlerinde-buyume-sert-geriledi-haberi-858244)
- Deloitte global family business work: the biggest obstacle to leadership transfer is the next generation's lack of experience (35%), then the lack of a suitable successor (33%). — [Para Dergi, 18 August 2026](https://paradergi.com.tr/life-style/2026/08/18/aile-sirketlerinde-gelecek-dugumu-veliaht-var-lider-yok)

### Inferences
- **[EST] Family-owned firms with 50–499 employees, 2025.** Formula: 38,000 (ICP band, Section 2) × 75% to 95%. This gives about **28,500 to 36,100 firms**. The 95% top end is PwC's "all companies" figure. The 75% bottom end is PwC's figure for listed companies, a proxy for the largest firms. Both are 2016 PwC statements without a published method, so the range is a rough guide only.
- Turkish family firms have planned succession much less than the global average (4% vs 15% with a robust plan in 2016). A generational handover is therefore a real and usually unplanned decision trigger. It fits the "one bounded decision" ICP.
- First-generation control was most common in the TAİDER sample (66 of 128). TAİDER members are larger, more institutionalised families, so the general population probably has an even higher first-generation share. That is not verified.

### Gaps
- No official or recent study gives the share of family firms by size class or sector in Turkey. Options: ask TÜİK whether the business register can flag ownership. Run a screener question in our own survey. Use the TOBB company register (ticaret sicili) to see partner surnames.
- The PwC 11th (2023) and 12th (2025) Turkey country editions could not be opened (HTTP 403 from pwc.com.tr). They may contain Turkey-only succession figures and sample sizes.
- No Turkish data on how often family firms in the 50–499 band use outside consultants or formal strategy processes.

## 5. Business demography: births, deaths, survival and high-growth enterprises

### Takeaway
About 16% of Turkish enterprises are newly born each year, and 13% die. Only 41% of SMEs born in 2019 were still active five years later. Fast growth is concentrated in medium-sized firms: 20.4% of medium SMEs were high-growth by employment in 2024, against 4.7% of small firms.

### Cited Findings
**TÜİK Girişimcilik ve İş Demografisi, 2024 (16 December 2025)** — [Alomaliye, reporting TÜİK](https://www.alomaliye.com/2025/12/16/girisimcilik-ve-is-demografisi-2024/)
- Birth rate: 15.8% in 2024 (15.5% in 2023). New enterprises held 4.9% of employment.
- Births by sector: trade 32.1%, transport and storage 16.8%, construction 10.1%.
- Death rate: 12.9% in 2022, the latest death year (11.9% in 2021). Dead enterprises held 4.2% of employment. Deaths by sector: trade 35.0%, transport 16.3%, accommodation and food 10.6%. Deaths by province: İstanbul 25.7%, Ankara 7.0%, İzmir 6.0%.
- Survival: 78.3% of enterprises born in 2023 survived to 2024. Of those born in 2022, 75.2% survived one year and 58.6% survived two years.
- High-growth enterprise rate 14.4% and gazelle rate 2.4% in 2024. The page also gives "manufacturing 23.5%, trade 20.5%, construction 15.2%" for high-growth firms and "manufacturing 27.0%, trade 15.2%, construction 12.4%" for gazelles. The page does not make clear whether these are sector rates or shares of all high-growth firms. Check the TÜİK bulletin before using them.

**SME demography from TÜİK KOBİ İstatistikleri 2024** — [KOSGEB 2026, pp. vii, 70–74](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/Kurumsal/2026/Tu%CC%88rkiye'deki_KOBI%CC%87'lere_I%CC%87lis%CC%A7kin_Baz%C4%B1_I%CC%87statistiki_Go%CC%88stergeler.pdf)
- SME birth rate: 15.9% in 2024 (15.5% in 2023). Birth rate falls as firm size rises.
- SME death rate: 13.0% in 2022 (12.0% in 2021).
- Survival of SMEs born in 2019: 80.6% after 1 year, 64.4% after 2, 54.8% after 3, 47.0% after 4 and 41.2% after 5 years.
- High-growth firms by employment, 2024: 4.7% of small firms, 20.4% of medium firms, 6.9% of all small and medium SMEs (9.3% in 2023). High growth means at least 10% average yearly growth over three years.
- High-growth firms by turnover, 2022: 8.9% of small firms, 29.9% of medium firms, 11.8% of small and medium SMEs. TÜİK has not published turnover-based figures for 2023–2024.
- Gazelles (high-growth firms at most 5 years old), 2024, by employment: 0.9% of small firms, 3.1% of medium firms, 1.2% of SMEs (1.6% in 2023). By turnover, 2022: 1.4% of small, 3.6% of medium, 1.7% of SMEs.
- Absolute counts from a news source: high-growth SMEs rose from 20,715 to 29,882 in five years, and high-growth large firms from 1,937 to 2,680 (2023 data). — [Bloomberg HT](https://www.bloomberght.com/ceylan-ve-hizli-buyuyen-girisim-sayisi-5-yilda-yuzde-40-tan-fazla-artti-3737826) (via earlier research note)

### Inferences
- **[EST]** About 7,000 medium firms grow fast each year. Formula: 34,072 enterprises with 50–249 employees (YSHİ 2025) × 20.4% (2024 medium high-growth rate) ≈ 6,950. The rate comes from the KOBİ statistics, which define "medium" with financial limits too, so this is a rough figure. Fast growth often brings the decisions in the ICP, such as a new plant, a new export market or a large investment.
- The 50–249 population grew about 28% from 2020 to 2024. The target pool is growing, not static.

### Gaps
- No public table gives births, deaths or high-growth counts by size class × sector × province.
- I did not open the original TÜİK Girişimcilik ve İş Demografisi 2024 bulletin. Figures come from Alomaliye's copy of it. The bulletin is on the TÜİK Veri Portalı under the same title.

"""Ajan kendi defterini sınar. Kullanım: python3 test_defter.py <ad> <defter_yolu>"""
import sys, json
ad, yol = sys.argv[1], sys.argv[2]
import os
W = os.path.dirname(os.path.abspath(__file__))
want = {}
for l in open(f'{W}/birimler_{ad}.jsonl'):
    u = json.loads(l); want[u['id']] = u['h']
TUR = {'başlık','ilke','açıklama','tanım','örnek','kaynak','dipnot','tablo','kutu','künye','içindekiler','biçim'}
seen, fails = set(), []
try:
    lines = open(yol).read().splitlines()
except FileNotFoundError:
    lines = []; fails.append('defter yok')
for i, l in enumerate(lines, 1):
    if not l.strip(): continue
    try: e = json.loads(l)
    except Exception: fails.append(f'{i}. satır JSON bozuk'); continue
    k = e.get('id')
    if k not in want: fails.append(f'{i}. satır bilinmeyen kimlik {k}'); continue
    if k in seen: fails.append(f'{k} iki kez'); 
    seen.add(k)
    if e.get('h') != want[k]: fails.append(f'{k} h yanlış')
    if e.get('tur') not in TUR: fails.append(f'{k} tur geçersiz')
    if not str(e.get('ozet','')).strip(): fails.append(f'{k} ozet boş')
    if 'atlas' not in e or 'ref' not in e: fails.append(f'{k} atlas ya da ref alanı yok')
eksik = [k for k in want if k not in seen]
if eksik: fails.append(f'{len(eksik)} birim eksik. İlk: {eksik[:5]}')
print(f'{ad}: beklenen {len(want)}, incelenen {len(seen)}, hata {len(fails)}')
for x in fails[:30]: print(' -', x)
sys.exit(1 if fails else 0)

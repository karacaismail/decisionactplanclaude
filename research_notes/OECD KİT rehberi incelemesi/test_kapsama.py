"""Kapsama testi. 1) Çıkarılan birimler sayfa metninin bütün kelimelerini sırasıyla taşır.
2) Her birim tam bir kez bir ajanın defterinde, doğru özet kodu ve dolu alanlarla yer alır."""
import sys, json, glob, re
corpus_dir, ledger_dir, plan_path = sys.argv[1], sys.argv[2], sys.argv[3]
units = [json.loads(l) for l in open(f'{corpus_dir}/units.jsonl')]
pages = {json.loads(l)['page']: json.loads(l)['text'] for l in open(f'{corpus_dir}/units_pages.jsonl')}
plan = json.load(open(plan_path))
fails = []
# Test 1: kelime kelime çıkarım bütünlüğü
for p, txt in pages.items():
    a = txt.split()
    b = ' '.join(u['text'] for u in units if u['page'] == p).split()
    if a != b: fails.append(f'T1 sayfa {p}: kelime dizisi eşleşmiyor ({len(a)} ve {len(b)})')
# Test 2: defter kapsaması
TUR = {'başlık','ilke','açıklama','tanım','örnek','kaynak','dipnot','tablo','kutu','künye','içindekiler','biçim'}
want = {u['id']: u for u in units}
seen = {}
owner = {}
for a in plan['agents']:
    for p in range(a['from'], a['to'] + 1): owner[p] = a['name']
files = sorted(glob.glob(f'{ledger_dir}/defter_*.jsonl'))
if not files: fails.append('T2: hiç defter yok')
for f in files:
    name = re.search(r'defter_(.+)\.jsonl$', f).group(1)
    for i, line in enumerate(open(f), 1):
        line = line.strip()
        if not line: continue
        try: e = json.loads(line)
        except Exception: fails.append(f'T2 {name}:{i} JSON bozuk'); continue
        uid = e.get('id')
        if uid not in want: fails.append(f'T2 {name}:{i} bilinmeyen kimlik {uid}'); continue
        if uid in seen: fails.append(f'T2 {uid} iki kez var ({seen[uid]} ve {name})')
        seen[uid] = name
        u = want[uid]
        if e.get('h') != u['h']: fails.append(f'T2 {uid} özet kodu yanlış')
        if owner.get(u['page']) != name: fails.append(f'T2 {uid} başka ajanın sayfasında ({name})')
        if e.get('tur') not in TUR: fails.append(f'T2 {uid} tür geçersiz: {e.get("tur")}')
        if not str(e.get('ozet', '')).strip(): fails.append(f'T2 {uid} özet boş')
        if 'atlas' not in e: fails.append(f'T2 {uid} atlas alanı yok')
missing = [k for k in want if k not in seen]
if missing: fails.append(f'T2: {len(missing)} birim incelenmemiş. İlk: {missing[:5]}')
print(f'Birim: {len(units)}. İncelenen: {len(seen)}. Hata: {len(fails)}')
for x in fails[:40]: print(' -', x)
sys.exit(1 if fails else 0)

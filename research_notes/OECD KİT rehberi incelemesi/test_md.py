"""Bulgu ve kaynak belgelerini sınar.
Kullanım: python3 test_md.py <ad> <cikti_klasoru>
1) bulgular_<ad>.md gerekli başlıkları taşır. Andığı her birim kimliği gerçekten vardır.
2) kaynaklar_<ad>.md, defterde ref alanı dolu her birimin kimliğini anar.
3) İki belgede noktalı virgül ve uzun çizgi yoktur. Bağlantı ve kod satırları sayılmaz."""
import sys, json, os, re
ad, out = sys.argv[1], sys.argv[2]
W = os.path.dirname(os.path.abspath(__file__))
units = {json.loads(l)['id'] for l in open(f'{W}/birimler_{ad}.jsonl')}
fails = []
BASLIK = ['ana ilke', 'karar atlası', 'aile şirket', 'kamu kurum', 'karar sahipliği',
          'yönetim kurulu', 'açıklama ve kayıt', 'risk ve iç denetim']
ID = re.compile(r'p\d{1,3}-s\d{3}')


def oku(yol):
    try:
        return open(yol, encoding='utf-8').read()
    except FileNotFoundError:
        fails.append(f'{os.path.basename(yol)} yok')
        return ''


def isaret(metin, ad_):
    kod = False
    for i, l in enumerate(metin.splitlines(), 1):
        if l.strip().startswith('```'):
            kod = not kod
            continue
        if kod or l.startswith('    '):
            continue
        temiz = re.sub(r'`[^`]*`', '', re.sub(r'\]\([^)]*\)|https?://\S+', '', l))
        if ';' in temiz or '—' in temiz:
            fails.append(f'{ad_}:{i} noktalı virgül ya da uzun çizgi')


b = oku(f'{out}/bulgular_{ad}.md')
k = oku(f'{out}/kaynaklar_{ad}.md')
if b:
    basliklar = ' '.join(l.lower() for l in b.splitlines() if l.startswith('#'))
    for s in BASLIK:
        if s not in basliklar:
            fails.append(f'bulgular başlığı yok: {s}')
    yabanci = sorted({x for x in ID.findall(b) if x not in units})
    if yabanci:
        fails.append(f'bulgular bilinmeyen kimlik anıyor: {yabanci[:5]}')
    if len(set(ID.findall(b)) & units) < 20:
        fails.append('bulgular 20 birimden az kimlik anıyor')
    isaret(b, 'bulgular')
if k:
    defter = f'{out}/defter_{ad}.jsonl'
    refli = []
    for l in open(defter, encoding='utf-8'):
        if l.strip():
            e = json.loads(l)
            if str(e.get('ref', '')).strip():
                refli.append(e['id'])
    anilan = set(ID.findall(k))
    eksik = [x for x in refli if x not in anilan]
    if eksik:
        fails.append(f'kaynaklar {len(eksik)} ref birimini anmıyor. İlk: {eksik[:5]}')
    yabanci = sorted({x for x in anilan if x not in units})
    if yabanci:
        fails.append(f'kaynaklar bilinmeyen kimlik anıyor: {yabanci[:5]}')
    isaret(k, 'kaynaklar')
print(f'{ad}: hata {len(fails)}')
for x in fails[:30]:
    print(' -', x)
sys.exit(1 if fails else 0)

"""Birleşik bulgu belgesini ve kaynak haritasını sınar.
Kullanım: python3 test_birlesik.py <bulgular.md> <kaynak_haritasi.md> <defter_klasoru>
1) Bulgu belgesi gerekli başlıkları taşır.
2) Bulgu belgesi sekiz sayfa aralığının her birinden en az 15 birim anar.
3) Kaynak haritası, defterlerde ref alanı dolu 341 birimin hepsini anar.
4) İki belgenin andığı her kimlik gerçekten vardır.
5) İki belgede noktalı virgül ve uzun çizgi yoktur. Bağlantı ve kod sayılmaz."""
import sys, json, os, re, glob
bul, kay, ddir = sys.argv[1], sys.argv[2], sys.argv[3]
W = os.path.dirname(os.path.abspath(__file__))
units = {json.loads(l)['id']: json.loads(l) for l in open(f'{W}/corpus/units.jsonl')}
plan = json.load(open(f'{W}/plan.json'))
fails = []
ID = re.compile(r'p\d{1,3}-s\d{3}')
BASLIK = ['kapsam', 'ana ilke', 'karar atlası', 'strateji öncesi', 'strateji oluşturma',
          'strateji uygulama', 'aile şirket', 'kamu kurum', 'karar sahipliği',
          'yönetim kurulu', 'açıklama ve kayıt', 'risk ve iç denetim',
          'zorunluluk', 'lisans']
KAY_BASLIK = ['ana belge', 'rehberin kendi', 'oecd', 'diğer', 'lisans']


def oku(yol):
    try:
        return open(yol, encoding='utf-8').read()
    except FileNotFoundError:
        fails.append(f'{os.path.basename(yol)} yok')
        return ''


def isaret(metin, ad):
    kod = False
    for i, l in enumerate(metin.splitlines(), 1):
        if l.strip().startswith('```'):
            kod = not kod
            continue
        if kod or l.startswith('    '):
            continue
        temiz = re.sub(r'`[^`]*`', '', re.sub(r'\]\([^)]*\)|https?://\S+', '', l))
        if ';' in temiz or '—' in temiz:
            fails.append(f'{ad}:{i} noktalı virgül ya da uzun çizgi')


def basliklar(metin):
    return ' '.join(l.lower() for l in metin.splitlines() if l.startswith('#'))


b, k = oku(bul), oku(kay)
if b:
    h = basliklar(b)
    for s in BASLIK:
        if s not in h:
            fails.append(f'bulgular başlığı yok: {s}')
    ids = set(ID.findall(b))
    for a in plan['agents']:
        n = len([x for x in ids if x in units and a['from'] <= units[x]['page'] <= a['to']])
        if n < 15:
            fails.append(f"bulgular {a['from']}-{a['to']}. sayfalardan yalnız {n} birim anıyor")
    yab = sorted(x for x in ids if x not in units)
    if yab:
        fails.append(f'bulgular bilinmeyen kimlik anıyor: {yab[:5]}')
    isaret(b, 'bulgular')
if k:
    h = basliklar(k)
    for s in KAY_BASLIK:
        if s not in h:
            fails.append(f'kaynak haritası başlığı yok: {s}')
    refli = []
    for f in sorted(glob.glob(f'{ddir}/defter_*.jsonl')):
        for l in open(f, encoding='utf-8'):
            if l.strip():
                e = json.loads(l)
                if str(e.get('ref', '')).strip():
                    refli.append(e['id'])
    if len(refli) < 300:
        fails.append(f'defterlerde yalnız {len(refli)} ref birimi bulundu')
    anilan = set(ID.findall(k))
    eksik = [x for x in refli if x not in anilan]
    if eksik:
        fails.append(f'kaynak haritası {len(eksik)} ref birimini anmıyor. İlk: {eksik[:8]}')
    yab = sorted(x for x in anilan if x not in units)
    if yab:
        fails.append(f'kaynak haritası bilinmeyen kimlik anıyor: {yab[:5]}')
    isaret(k, 'kaynaklar')
print(f'birleşik: hata {len(fails)}')
for x in fails[:40]:
    print(' -', x)
sys.exit(1 if fails else 0)

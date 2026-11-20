import sys, json, re, hashlib
from pypdf import PdfReader
pdf, out = sys.argv[1], sys.argv[2]
r = PdfReader(pdf)
def norm(t): return re.sub(r'\s+', ' ', t).strip()
def h(t): return hashlib.sha1(norm(t).encode()).hexdigest()[:8]
units = []
pages = []
for pi, page in enumerate(r.pages, start=1):
    raw = page.extract_text() or ''
    pages.append({'page': pi, 'text': norm(raw)})
    # split into lines, then join lines into sentences
    lines = [l.strip() for l in raw.split('\n')]
    buf = ''
    segs = []
    for l in lines:
        if not l:
            if buf: segs.append(buf); buf = ''
            continue
        # bullets or numbered items start new unit
        if re.match(r'^(•|●|▪|–|-|\d+\.\s|[a-z]\)\s|[ivx]+\)\s)', l) and buf:
            segs.append(buf); buf = ''
        buf = (buf + ' ' + l).strip()
        if re.search(r'[.!?:;]["”’)]?$', l):
            segs.append(buf); buf = ''
    if buf: segs.append(buf)
    # split long segs into sentences
    n = 0
    for sg in segs:
        parts = re.split(r'(?<=[.!?])\s+(?=[A-Z“"(])', sg)
        for p in parts:
            p = norm(p)
            if not p: continue
            n += 1
            units.append({'id': f'p{pi:02d}-s{n:03d}', 'page': pi, 'h': h(p), 'words': len(p.split()), 'text': p})
with open(out, 'w') as f:
    for u in units: f.write(json.dumps(u, ensure_ascii=False) + '\n')
with open(out.replace('.jsonl', '_pages.jsonl'), 'w') as f:
    for p in pages: f.write(json.dumps(p, ensure_ascii=False) + '\n')
print(len(r.pages), 'pages', len(units), 'units', sum(u['words'] for u in units), 'words')

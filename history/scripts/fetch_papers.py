"""Download openly licensed paper PDFs listed in site_src/data/papers.json (entries with "mirror": true)
into assets/papers/<slug>.pdf. Runs on GitHub Actions, which has internet access."""
import json, os, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "papers")
os.makedirs(OUT, exist_ok=True)
papers = json.load(open(os.path.join(ROOT, "site_src", "data", "papers.json"), encoding="utf-8"))
UA = "Mozilla/5.0 (research-encyclopedia open-access mirror; +https://github.com)"
ok = fail = 0
for p in papers:
    if not p.get("mirror") or not p.get("pdf_url"):
        continue
    dest = os.path.join(OUT, p["slug"] + ".pdf")
    if os.path.exists(dest) and os.path.getsize(dest) > 10000:
        continue
    try:
        req = urllib.request.Request(p["pdf_url"], headers={"User-Agent": UA, "Accept": "application/pdf"})
        data = urllib.request.urlopen(req, timeout=60).read(60_000_000)
        if not data.startswith(b"%PDF"):
            raise ValueError("not a PDF (publisher returned HTML)")
        open(dest, "wb").write(data)
        ok += 1
        print("saved", p["slug"], len(data) // 1024, "KB")
    except Exception as e:
        fail += 1
        print("skip", p["slug"], "-", e)
print(f"{ok} downloaded, {fail} skipped (they stay linked to the publisher)")

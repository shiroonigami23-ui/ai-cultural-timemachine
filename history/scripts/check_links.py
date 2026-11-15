"""Fail if any relative link or image points at a missing file.

Checks repository Markdown (except site_src/, whose links are site-absolute) and every
generated HTML page of the site (index.html and wiki/**).
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP = {"connected", "site_src", "node_modules"}
md_pat = re.compile(r"!?\[[^\]]*\]\(([^)\s]+)\)")
html_pat = re.compile(r'(?:href|src)="([^"]+)"')
bad = 0


def check(src, target):
    global bad
    t = target.split("#")[0].split("?")[0]
    if not t or re.match(r"^[a-z]+:", t) or t.startswith("//"):
        return
    if not os.path.exists(os.path.normpath(os.path.join(os.path.dirname(src), t))):
        print(f"{os.path.relpath(src, ROOT)} -> missing {t}")
        bad += 1


for dp, dn, fn in os.walk(ROOT):
    dn[:] = [d for d in dn if not d.startswith(".") and d not in SKIP]
    for f in fn:
        p = os.path.join(dp, f)
        if f.endswith(".md") and f != "prompts.md":
            for m in md_pat.finditer(open(p, encoding="utf-8").read()):
                check(p, m.group(1))
        elif f.endswith(".html") and (p == os.path.join(ROOT, "index.html") or os.sep + "wiki" + os.sep in p):
            for m in html_pat.finditer(open(p, encoding="utf-8").read()):
                check(p, m.group(1))
print("broken links:", bad)
sys.exit(1 if bad else 0)

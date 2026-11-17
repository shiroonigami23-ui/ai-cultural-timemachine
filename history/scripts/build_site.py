"""Static research-site generator for GitHub Pages (serves from repo root).

Source:   site_src/site.json + site_src/<section>/<page>.md
Output:   index.html, wiki/**.html, assets/site/*  (all relative links -> works under /<repo>/)
Run:      python scripts/build_site.py
Needs:    markdown, jinja2
"""
import json, os, re, shutil, html, datetime, zlib, urllib.parse
import markdown
from jinja2 import Environment, BaseLoader
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import charts as CH

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "site_src")
CFG = json.load(open(os.path.join(SRC, "site.json"), encoding="utf-8"))
STATS = json.load(open(os.path.join(SRC, "stats.json"), encoding="utf-8")) if os.path.exists(os.path.join(SRC, "stats.json")) else {"charts": {}, "groups": []}
COLL_CHARTS = []
GH = f"https://github.com/{CFG['github']}"
OUT_WIKI = os.path.join(ROOT, "wiki")
ASSETS = os.path.join(ROOT, "assets", "site")


def parse(path):
    raw = open(path, encoding="utf-8").read()
    meta, body = {}, raw
    if raw.startswith("---"):
        _, fm, body = raw.split("---", 2)
        for line in fm.strip().splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
    return meta, body


def callouts(body):
    body = re.sub(r"\{\{chart:([\w-]+)\}\}", lambda m: "\n\n" + CH.render(STATS["charts"][m.group(1)]) + "\n\n", body)
    # :::facts Title  ...  :::   -> styled boxes (markdown inside)
    def rep(m):
        kind, title, inner = m.group(1), (m.group(2) or "").strip(), m.group(3)
        head = f'<div class="callout-title">{html.escape(title)}</div>' if title else ""
        return f'\n<div class="callout {kind}" markdown="1">\n{head}\n\n{inner}\n\n</div>\n'
    def rep2(m):
        title, inner = m.group(1).strip(), m.group(2)
        idattr = ""
        mm = re.match(r"#([\w-]+)\s+(.*)", title)
        if mm:
            idattr, title = f' id="{mm.group(1)}"', mm.group(2)
        op = " open" if title.startswith("!") else ""
        return f'\n<details class="coll trkcard"{idattr}{op}><summary>{html.escape(title.lstrip("!"))}</summary>\n<div class="collin" markdown="1">\n\n{inner}\n\n</div></details>\n'
    body = re.sub(r"^:::collapse[ \t]*(.*?)\n(.*?)^:::[ \t]*$", rep2, body, flags=re.S | re.M)
    return re.sub(r"^:::(\w+)[ \t]*(.*?)\n(.*?)^:::[ \t]*$", rep, body, flags=re.S | re.M)


def include_repo_file(rel, page_url):
    """Pull a Markdown file from the repo and fix its relative links."""
    p = os.path.join(ROOT, rel)
    text = open(p, encoding="utf-8-sig").read()
    base = os.path.dirname(rel)
    def fix(m):
        bang, label, target = m.group(1), m.group(2), m.group(3)
        if re.match(r"^[a-z]+:|^#", target):
            return m.group(0)
        t = os.path.normpath(os.path.join(base, target.split("#")[0])).replace("\\", "/")
        if bang:
            return f"{bang}[{label}](/{t})"
        mapped = CFG.get("repo_map", {}).get(t)
        if mapped:
            return f"[{label}]({mapped})"
        if t.endswith((".html", ".pdf")) or t.startswith(("labs/", "assets/")):
            return f"[{label}](/{t})"
        return f"**{label}**"
    text = re.sub(r"(!?)\[([^\]]*)\]\(([^)\s]+)\)", fix, text)
    text = re.sub(r"^# .*\n", "", text, count=1)  # drop duplicate H1
    return text


def relativize(htmltext, depth):
    pre = "../" * depth if depth else "./"
    return re.sub(r'(href|src)="/(?!/)', lambda m: f'{m.group(1)}="{pre}', htmltext)


MD_EXT = ["extra", "toc", "sane_lists", "smarty", "md_in_html"]
MD_CFG = {"toc": {"permalink": "#", "toc_depth": "2-3"}, "footnotes": {"BACKLINK_TEXT": "↩"}}

TEMPLATE = r"""<!DOCTYPE html>
<html lang="en" data-theme="{{ cfg.theme_default }}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ title }} · {{ cfg.name }}</title>
<meta name="description" content="{{ summary|e }}">
<link rel="stylesheet" href="{{ root }}assets/site/site.css">
<script>try{const t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
</head><body class="{{ bodyclass }}" data-anim="{{ cfg.hero_anim or '' }}">
<a class="skip" href="#main">Skip to content</a>
<header class="topbar"><div class="wrap topin">
 <a class="brand" href="{{ root }}index.html"><span class="logo">{{ cfg.logo }}</span><span><b>{{ cfg.name }}</b><small>{{ cfg.kicker }}</small></span></a>
 <button class="browsebtn" aria-expanded="false" aria-controls="megamenu" onclick="document.body.classList.toggle('megaopen');this.setAttribute('aria-expanded',document.body.classList.contains('megaopen'))">☰ <span>Browse</span></button>
 <nav class="quicknav">{% for s in nav[:6] %}<a href="{{ root }}wiki/{{ s.id }}/index.html" class="{{ 'on' if s.id==cur_sec }}">{{ s.title }}</a>{% endfor %}</nav>
 <div class="search live"><input id="qs" placeholder="Search everything…  ( / )" aria-label="Search" autocomplete="off"><div id="qsres" class="qsres" hidden></div></div>
 <button class="themebtn" title="Light / dark" aria-label="Toggle theme" onclick="const d=document.documentElement;d.dataset.theme=d.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('theme',d.dataset.theme)}catch(e){}">🌓</button>
</div>
<div id="megamenu" class="megamenu"><div class="wrap"><div class="megagrid">
 {% if cfg.home_groups %}{% set cmap = {} %}{% for c in cfg.collections %}{% set _ = cmap.update({c.id: c}) %}{% endfor %}{% for g in cfg.home_groups %}<div class="megahead">{{ g.icon }} {{ g.title }}</div>{% for i in g.ids %}{% if i in cmap %}{% set c = cmap[i] %}<a class="megatile cat" href="{{ root }}wiki/{{ c.id }}/index.html"><span class="mi">{{ c.icon }}</span><b>{{ c.title }}</b></a>{% endif %}{% endfor %}{% endfor %}<div class="megahead">📚 Articles & tools</div>{% else %}{% for c in cfg.collections %}<a class="megatile cat" href="{{ root }}wiki/{{ c.id }}/index.html"><span class="mi">{{ c.icon }}</span><b>{{ c.title }}</b><small>{{ c.short or 'Catalog' }}</small></a>{% endfor %}{% endif %}
 {% for s in sections %}<a class="megatile" href="{{ root }}wiki/{{ s.id }}/index.html"><span class="mi">{{ s.icon }}</span><b>{{ s.title }}</b><small>{{ s.pages|length }} articles</small></a>{% endfor %}
 <a class="megatile" href="{{ root }}wiki/statistics/index.html"><span class="mi">📊</span><b>Statistics</b><small>Animated charts</small></a>
 <a class="megatile" href="{{ root }}wiki/timeline.html"><span class="mi">🕰</span><b>Timeline</b><small>Key dates</small></a>
 <a class="megatile" href="{{ root }}wiki/glossary.html"><span class="mi">📖</span><b>Glossary</b><small>Terms explained</small></a>
 <a class="megatile" href="{{ root }}wiki/sources.html"><span class="mi">🔗</span><b>Sources</b><small>Every reference</small></a>
</div></div></div></header>
{% if tracker %}<details class="trackbar"{% if bodyclass=='homepage' %} data-openwide="1"{% endif %}><summary><span class="live">●</span> Live research tracker <span class="muted">· {{ tracker|length }} streams · updated {{ built }}</span></summary>
<div class="wrap"><div class="trackgrid">{% for t in tracker %}<a class="trk" href="/wiki/{{ cfg.tracker_page }}.html#{{ t.id }}"><span class="ti">{{ t.icon }}</span><b>{{ t.name }}</b><span class="st">{{ t.status }}</span><span class="nx">Next: {{ t.next }}</span></a>{% endfor %}</div>
<p class="small"><a href="/wiki/{{ cfg.tracker_page }}.html">Open the full tracker with sources →</a></p></div></details>{% endif %}
<div id="main"></div>{{ content }}
<button class="totop" aria-label="Back to top" onclick="scrollTo({top:0,behavior:'smooth'})">↑</button>
<nav class="tabbar" aria-label="Quick navigation"><a href="{{ root }}index.html">🏠<span>Home</span></a><button onclick="document.body.classList.toggle('megaopen');scrollTo({top:0})">🧭<span>Browse</span></button><a href="{{ root }}wiki/search.html">🔎<span>Search</span></a>{% if tracker %}<a href="{{ root }}wiki/{{ cfg.tracker_page }}.html">📡<span>Tracker</span></a>{% endif %}<a href="{{ root }}wiki/statistics/index.html">📊<span>Stats</span></a></nav>
<footer class="foot"><div class="wrap">
 <div class="footrow"><div class="brand small"><span class="logo">{{ cfg.logo }}</span><b>{{ cfg.name }}</b></div>
 <nav class="footlinks">{% for c in cfg.collections %}<a href="{{ root }}wiki/{{ c.id }}/index.html">{{ c.title }}</a>{% endfor %}{% for s in sections %}<a href="{{ root }}wiki/{{ s.id }}/index.html">{{ s.title }}</a>{% endfor %}<a href="{{ root }}wiki/statistics/index.html">Statistics</a><a href="{{ root }}wiki/glossary.html">Glossary</a><a href="{{ root }}wiki/timeline.html">Timeline</a><a href="{{ root }}wiki/sources.html">Sources</a><a href="{{ root }}wiki/about.html">About</a></nav></div>
 <details class="sitemap"><summary>🗺 Full site map ({{ npages }} articles)</summary><div class="smgrid">{% for s in sections %}<div><h4>{{ s.icon }} {{ s.title }}</h4><ul>{% for p in s.pages %}<li><a href="{{ root }}wiki/{{ s.id }}/{{ p.slug }}.html">{{ p.title }}</a></li>{% endfor %}</ul></div>{% endfor %}</div></details>
 <p class="footnote">{{ cfg.footer }} · Reviewed {{ built }} · MIT licensed · <a href="https://github.com/{{ cfg.github }}">Source on GitHub</a></p>
</div></footer>
<script src="{{ root }}assets/site/site.js"></script>
</body></html>"""

ARTICLE = r"""<div class="wrap layout">
<aside class="sidebar"><div class="sidehead"><a href="{{ root }}wiki/{{ sec.id }}/index.html">{{ sec.icon }} {{ sec.title }}</a></div>
<ul>{% for p in sec.pages %}<li><a class="{{ 'on' if p.slug==page.slug }}" href="{{ root }}wiki/{{ sec.id }}/{{ p.slug }}.html">{{ p.title }}</a></li>{% endfor %}</ul>
<div class="sidehead other">Other sections</div><ul class="others">{% for s in sections if s.id!=sec.id %}<li><a href="{{ root }}wiki/{{ s.id }}/index.html">{{ s.icon }} {{ s.title }}</a></li>{% endfor %}</ul></aside>
<main class="article">
<div class="crumbs"><a href="{{ root }}index.html">Home</a> › <a href="{{ root }}wiki/{{ sec.id }}/index.html">{{ sec.title }}</a> › {{ page.title }}</div>
<h1>{{ page.title }}</h1>
{% if page.summary %}<p class="lede">{{ page.summary }}</p>{% endif %}
<div class="meta">{% if page.updated %}<span>📅 Reviewed {{ page.updated }}</span>{% endif %}<span>⏱ {{ page.minutes }} min read</span><span>🔗 {{ page.nrefs }} sources</span>{% if page.level %}<span>🎓 {{ page.level }}</span>{% endif %}</div>
{% if sec.pdf %}<div class="pdfbar"><a class="btn" target="_blank" rel="noopener" href="{{ root }}assets/pdf/{{ page.slug }}.pdf">📄 Open PDF in new tab</a><a class="btn alt" download href="{{ root }}assets/pdf/{{ page.slug }}.pdf">⬇ Download PDF</a></div>{% endif %}
<div class="prose">{{ page.html }}</div>
<nav class="pager">{% if prev %}<a class="prev" href="{{ root }}wiki/{{ sec.id }}/{{ prev.slug }}.html">← {{ prev.title }}</a>{% else %}<span></span>{% endif %}{% if next %}<a class="next" href="{{ root }}wiki/{{ sec.id }}/{{ next.slug }}.html">{{ next.title }} →</a>{% endif %}</nav>
</main>
<aside class="toc"><div class="tochead">On this page</div>{{ page.toc }}</aside>
</div>"""

SECTION = r"""<section class="sechero"><div class="wrap"><div class="crumbs"><a href="{{ root }}index.html">Home</a> › {{ sec.title }}</div>
<h1>{{ sec.icon }} {{ sec.title }}</h1><p class="lede">{{ sec.desc }}</p></div></section>
<main class="wrap"><div class="cards">{% for p in sec.pages %}<a class="card" href="{{ root }}wiki/{{ sec.id }}/{{ p.slug }}.html">{% if p.image %}<img src="{{ root }}{{ p.image }}" alt="" loading="lazy">{% endif %}<div class="cb"><h3>{{ p.title }}</h3><p>{{ p.summary }}</p><span class="cm">{{ p.minutes }} min · {{ p.nrefs }} sources</span></div></a>{% endfor %}</div></main>"""

PLAIN = r"""<main class="wrap plain"><div class="crumbs"><a href="{{ root }}index.html">Home</a> › {{ title }}</div><h1>{{ title }}</h1>{{ body }}</main>"""


# ---------------------------------------------------------------- collections (data-driven catalogs)
IMG_EXT = (".webp", ".png", ".jpg", ".jpeg")
PROMPTS = []
PHOTOS = []
WIKIMAP = {}
SITEMAP = []


def find_img(cid, slug):
    for e in IMG_EXT:
        rel = f"assets/img/{cid}/{slug}{e}"
        if os.path.exists(os.path.join(ROOT, rel)):
            return rel
    return None


def placeholder(icon, name, sub, hue):
    return (f'<svg class="ph" viewBox="0 0 640 360" role="img" aria-label="{html.escape(name)}">'
            f'<defs><linearGradient id="g{hue}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl({hue},70%,32%)"/>'
            f'<stop offset="1" stop-color="hsl({(hue+40)%360},70%,12%)"/></linearGradient></defs>'
            f'<rect width="640" height="360" fill="url(#g{hue})"/><text x="320" y="170" font-size="110" text-anchor="middle">{icon}</text>'
            f'<text x="320" y="250" font-size="30" fill="#fff" text-anchor="middle" font-family="system-ui" font-weight="700">{html.escape(name)}</text>'
            f'<text x="320" y="290" font-size="20" fill="#dde" text-anchor="middle" font-family="system-ui" font-style="italic">{html.escape(str(sub or ""))}</text>'
            f'<text x="320" y="340" font-size="14" fill="#aab" text-anchor="middle" font-family="system-ui">Loading photo…</text></svg>')


def visual(v, it):
    if not v:
        return ""
    if v["type"] == "depth":
        lo, hi = it.get(v["min"]), it.get(v["max"])
        if lo is None or hi is None:
            return ""
        X = lambda d: 40 + 560 * (max(d, 0) / 11000) ** 0.5
        ticks = "".join(f'<line x1="{X(d)}" y1="34" x2="{X(d)}" y2="70" stroke="currentColor" opacity=".25"/><text x="{X(d)}" y="88" font-size="11" text-anchor="middle" fill="currentColor" opacity=".7">{d:,}</text>' for d in (0, 200, 1000, 2000, 4000, 6000, 8000, 11000))
        return (f'<figure class="viz"><svg viewBox="0 0 640 100" class="vizsvg">{ticks}'
                f'<rect x="40" y="44" width="560" height="16" rx="8" fill="currentColor" opacity=".08"/>'
                f'<rect x="{X(lo)}" y="44" width="{max(X(hi)-X(lo),4)}" height="16" rx="8" fill="var(--accent)"/>'
                f'<text x="40" y="24" font-size="13" fill="currentColor">{v.get("label", "Depth range")}: {lo:,}–{hi:,} m (square-root scale)</text></svg></figure>')
    if v["type"] == "size":
        r = it.get(v["key"])
        if not isinstance(r, (int, float)) or r <= 0:
            return ""
        ref = v.get("ref", 6371); refname = v.get("refname", "Earth")
        scale = 120 / max(r, ref)
        return (f'<figure class="viz"><svg viewBox="0 0 640 300" class="vizsvg"><circle cx="190" cy="160" r="{max(ref*scale,1.5)}" fill="#4f9cf0" opacity=".85"/>'
                f'<text x="190" y="295" font-size="13" text-anchor="middle" fill="currentColor">{refname} ({ref:,} km)</text>'
                f'<circle cx="460" cy="160" r="{max(r*scale,1.5)}" fill="var(--accent)" opacity=".9"/>'
                f'<text x="460" y="295" font-size="13" text-anchor="middle" fill="currentColor">{html.escape(it[v.get("label","name")])} ({r:,} km)</text>'
                f'<text x="20" y="22" font-size="13" fill="currentColor">Radius to scale</text></svg></figure>')
    return ""


def coll_charts(c, items):
    out = []
    cid = c["id"]
    for sp in c.get("charts", []):
        t = sp["type"]
        if t in ("count", "count_donut"):
            cnt = {}
            for it in items:
                v = it.get(sp["key"])
                for x in (v if isinstance(v, list) else [v]):
                    if x not in (None, ""):
                        cnt[x] = cnt.get(x, 0) + 1
            kv = sorted(cnt.items(), key=lambda a: -a[1])[: sp.get("n", 30)]
            if t == "count":
                out.append(CH.hbar(sp["title"], [k for k, _ in kv], [v for _, v in kv]))
            else:
                out.append(CH.donut(sp["title"], [k for k, _ in kv], [v for _, v in kv]))
        elif t == "top":
            rows = sorted([it for it in items if isinstance(it.get(sp["key"]), (int, float))], key=lambda it: -it[sp["key"]])[: sp.get("n", 15)]
            if sp.get("asc"):
                rows = sorted([it for it in items if isinstance(it.get(sp["key"]), (int, float))], key=lambda it: it[sp["key"]])[: sp.get("n", 15)]
            out.append(CH.hbar(sp["title"], [it[c.get("name_key", "name")] for it in rows], [it[sp["key"]] for it in rows], sp.get("unit", ""), log=sp.get("log", False)))
        elif t == "ranges":
            rows = [it for it in items if isinstance(it.get(sp["min"]), (int, float)) and isinstance(it.get(sp["max"]), (int, float))]
            rows.sort(key=lambda it: (it[sp["max"]], it[sp["min"]]))
            out.append('<div style="grid-column:1/-1">' + CH.ranges(sp["title"], [(it[c.get("name_key", "name")], it[sp["min"]], it[sp["max"]], f"/wiki/{cid}/{it['slug']}.html") for it in rows],
                       maxv=sp.get("maxv", 11000), sqrt=sp.get("sqrt", True), unit=sp.get("unit", " m")) + "</div>")
        elif t == "scatter":
            pts = [(it[c.get("name_key", "name")], it.get(sp["x"]), it.get(sp["y"]), f"/wiki/{cid}/{it['slug']}.html") for it in items
                   if isinstance(it.get(sp["x"]), (int, float)) and isinstance(it.get(sp["y"]), (int, float)) and it.get(sp["x"]) > 0 and it.get(sp["y"]) > 0]
            out.append(CH.scatter(sp["title"], pts, sp["xlabel"], sp["ylabel"], sp.get("logx", False), sp.get("logy", False), sp.get("note", "")))
        elif t == "timeline_count":
            cnt = {}
            for it in items:
                v = it.get(sp["key"])
                if isinstance(v, (int, float)):
                    b = int(v // sp.get("bin", 10) * sp.get("bin", 10))
                    cnt[b] = cnt.get(b, 0) + 1
            ks = sorted(cnt)
            out.append(CH.vbar(sp["title"], [f"{k}s" if sp.get("bin", 10) >= 10 else str(k) for k in ks], [cnt[k] for k in ks]))
    return "".join(out)


ALL = {}
ARTS = {}


def _m(aliases, strings):
    al = [a.lower() for a in (aliases or []) if a]
    ss = [str(x).lower() for x in (strings if isinstance(strings, list) else [strings]) if x]
    return any(a in t for a in al for t in ss)


def related_html(c, it):
    out = []
    for L in c.get("links", []):
        t = L["type"]
        if t == "articles":
            arts = [ARTS[k] for k in it.get(L.get("mine", "see"), []) if k in ARTS]
            if arts:
                out.append(f'<div class="rel"><h3>{L["label"]}</h3><div class="relchips">' + "".join(f'<a class="rchip art" href="{a["url"]}">📖 {html.escape(a["title"])}</a>' for a in arts) + "</div></div>")
            continue
        oc = next((x for x in CFG["collections"] if x["id"] == L["coll"]), None)
        if not oc:
            continue
        items = ALL.get(oc["id"], [])
        if t == "match":
            hits = [o for o in items if _m(it.get(L["mine"]), o.get(L["theirs"]))]
        elif t == "rmatch":
            hits = [o for o in items if _m(o.get(L["theirs"]), it.get(L["mine"]))]
        elif t == "ref":
            hits = [o for o in items if o["slug"] == it.get(L["mine"])]
        elif t == "backref":
            hits = [o for o in items if o.get(L["theirs"]) == it["slug"]]
        elif t == "text":
            txt = str(it.get(L["mine"], "")).lower()
            def _key(o):
                n = re.sub(r"\s*\(.*?\)", "", o[oc.get("name_key", "name")].lower())
                return n.replace(" ocean", "").replace(" sea", "") if oc["id"] == "seas" else n
            hits = [o for o in items if o is not it and re.search(r"(?<![\w-])" + re.escape(_key(o)) + r"(?:s|es)?(?![\w-])", txt)]
        elif t == "backname":
            nm = re.sub(r"\s*\(.*?\)", "", it[c.get("name_key", "name")]).lower()
            hits = [o for o in items if re.search(r"(?<![\w-])" + re.escape(nm) + r"(?:s|es)?(?![\w-])", str(o.get(L["theirs"], "")).lower())]
        else:
            hits = []
        if not hits:
            continue
        nk = oc.get("name_key", "name"); gk = oc.get("group_key", "group")
        groups = {}
        for o in hits:
            groups.setdefault(o.get(gk, ""), []).append(o)
        body = ""
        for g, os_ in sorted(groups.items(), key=lambda a: -len(a[1])):
            chips = "".join(f'<a class="rchip" href="/wiki/{oc["id"]}/{o["slug"]}.html">{o.get("emoji", "")} {html.escape(o[nk])}</a>' for o in sorted(os_, key=lambda o: o[nk]))
            body += (f'<div class="relg"><b>{html.escape(str(g))}</b> <span class="muted">({len(os_)})</span></div>' if len(groups) > 1 else "") + f'<div class="relchips">{chips}</div>'
        n = len(hits)
        if n > 24:
            out.append(f'<details class="rel big"><summary><h3>{L["label"]} <span class="cnt">{n}</span></h3></summary>{body}</details>')
        else:
            out.append(f'<div class="rel"><h3>{L["label"]} <span class="cnt">{n}</span></h3>{body}</div>')
    return "".join(out)


def glance_html(c, it):
    if not c.get("glance"):
        return ""
    bits = []
    nk = c.get("name_key", "name")
    a, avg, mx = it.get("area_km2"), it.get("avg_depth"), it.get("max_depth")
    s = f"<b>{html.escape(it[nk])}</b>"
    if a:
        s += f" covers about <b>{a:,} km²</b>"
    if avg:
        s += f", averages <b>{avg:,} m</b> deep"
    if mx:
        s += f" and reaches <b>{mx:,} m</b>" + (f" at {html.escape(it['deepest_point'])}" if it.get("deepest_point") and it["deepest_point"] != "—" else "")
    bits.append(s + ".")
    for L in c.get("links", []):
        if L["type"] != "match":
            continue
        oc = next((x for x in CFG["collections"] if x["id"] == L["coll"]), None)
        hits = [o for o in ALL.get(L["coll"], []) if _m(it.get(L["mine"]), o.get(L["theirs"]))]
        if hits and oc:
            hits.sort(key=lambda o: (0 if o.get("summary") and not o.get("compact") else 1, o[oc.get("name_key", "name")]))
            ex = ", ".join(f'<a href="/wiki/{oc["id"]}/{o["slug"]}.html">{html.escape(o[oc.get("name_key", "name")])}</a>' for o in hits[:8])
            bits.append(f'This encyclopedia links <a href="#connections"><b>{len(hits)} {oc.get("noun", oc["title"].lower())}</b></a> to it, including {ex}.')
    wr = [o for o in ALL.get("wrecks", []) if o.get("sea") == it["slug"]]
    if wr:
        bits.append("Wrecks and discoveries here: " + ", ".join(f'<a href="/wiki/wrecks/{o["slug"]}.html">{html.escape(o["name"])}</a>' for o in wr) + ".")
    return '<div class="glance"><h3>🧭 At a glance</h3><p>' + " ".join(bits) + "</p></div>"


def build_collections(env, write, sections, search, built):
    out = []
    for c in CFG.get("collections", []):
        ALL[c["id"]] = json.load(open(os.path.join(SRC, c["file"]), encoding="utf-8"))
    for sec in sections:
        for p in sec["pages"]:
            ARTS[f'{sec["id"]}/{p["slug"]}'] = p
    for c in CFG.get("collections", []):
        items = ALL[c["id"]]
        cid = c["id"]; nk = c.get("name_key", "name"); sk = c.get("sub_key")
        groups = sorted({it.get(c.get("group_key", "group"), "Other") for it in items})
        cards, rows = [], []
        for i, it in enumerate(items):
            slug = it["slug"]; name = it[nk]; sub = str(it.get(sk, "")) if sk and it.get(sk) is not None else ""; name = str(name)
            WIKIMAP.setdefault("__pages", {})[f"wiki/{cid}/{slug}.html"] = [name, it.get("emoji", c["icon"]), cid]
            WIKIMAP.setdefault("__colls", {})[cid] = [c["title"], c["icon"]]
            hue = zlib.crc32(str(it.get(c.get("group_key", "group"), "")).encode()) % 360
            img = find_img(cid, slug)
            if img:
                pic = f'<img class="hero-img" src="/{img}" alt="{html.escape(name)}">'
                thumb = f'<img src="/{img}" alt="" loading="lazy">'
            else:
                icon = it.get("emoji", c["icon"])
                try:
                    prompt = it["prompt"] if it.get("prompt") else c["prompt"].format(**{k: (v if not isinstance(v, list) else ", ".join(map(str, v))) for k, v in it.items()})
                except KeyError:
                    prompt = f"Scientific illustration of {name}"
                wk = urllib.parse.unquote(str(it.get(c.get("photo_key", "wiki"), ""))).replace("_", " ") if c.get("live_photos") else ""
                if wk and it.get("sensitive"):
                    WIKIMAP.setdefault("__blur", []).append(wk.lower())
                if wk:
                    WIKIMAP[wk.lower()] = f"wiki/{cid}/{slug}.html"
                    PHOTOS.append(dict(wiki=wk, name=name, save=f"assets/img/{cid}/{slug}.png", coll=c["title"]))
                da = f' data-wiki="{html.escape(str(wk))}" data-save="assets/img/{cid}/{slug}.png"' if wk else ""
                if it.get("sensitive"): da += ' data-blur="1"'
                pic = f'<div class="livepic big"{da}>{placeholder(icon, name, sub, hue)}</div>'
                thumb = f'<div class="livepic"{da}>{placeholder(icon, name, sub, hue)}</div>'
                if not c.get("no_prompt"):
                    PROMPTS.append((c["title"], name, f"assets/img/{cid}/{slug}.png", prompt))
            facts = "".join(f"<tr><th>{lab}</th><td>{html.escape(', '.join(map(str, it[k])) if isinstance(it.get(k), list) else (f'{it[k]:,}' if isinstance(it[k], int) and abs(it[k]) >= 10000 else str(it[k])))}</td></tr>" for k, lab in c["facts"] if it.get(k) not in (None, "", []))
            body = ""
            for k, lab in c["texts"]:
                if it.get(k):
                    txt = it[k] if isinstance(it[k], str) else "\n".join(f"- {x}" for x in it[k])
                    body += f"\n\n## {lab}\n\n{txt}"
            srcs = []
            for lab, t in c.get("source_tpl", []):
                try:
                    srcs.append((lab, t.format(**{k: urllib.parse.quote(str(v), safe="_(),'") for k, v in it.items()})))
                except KeyError:
                    pass
            srcs += [("Source", u) for u in it.get("sources", [])]
            body += "\n\n## Sources\n\n" + "\n".join(f"{n+1}. {lab}: <{u}>" for n, (lab, u) in enumerate(srcs))
            md = markdown.Markdown(extensions=MD_EXT, extension_configs=MD_CFG)
            h = md.convert(callouts(body))
            srch = ""
            if '<h2 id="sources">' in h:
                h, srch = h.split('<h2 id="sources">', 1)
                srch = '<h2 id="sources">' + srch
            prev = items[i - 1] if i else None; nxt = items[i + 1] if i + 1 < len(items) else None
            content = env.from_string(COLL_ITEM).render(c=c, it=it, name=name, sub=sub, pic=pic, facts=facts, viz=visual(c.get("visual"), it), rel=related_html(c, it), glance=glance_html(c, it), wk=urllib.parse.unquote(str(it.get("wiki", ""))).replace("_", " "),
                                                       body=h, srch=srch, toc=md.toc, prev=prev, next=nxt, nk=nk, n=len(items))
            write(f"wiki/{cid}/{slug}.html", name, content, 2, it.get("summary", ""), cid)
            search.append({"t": name, "s": c["title"], "u": f"wiki/{cid}/{slug}.html", "d": it.get("summary", sub),
                           "x": re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", h))[:3000]})
            grp = it.get(c.get("group_key", "group"), "Other")
            cells = "".join(f'<td>{html.escape(", ".join(map(str, it[k])) if isinstance(it.get(k), list) else str(it.get(k, "")))}</td>' for k, _ in c["columns"])
            rows.append(f'<tr data-g="{html.escape(grp)}"><td><a href="/wiki/{cid}/{slug}.html">{html.escape(name)}</a>{"<br><i class=muted>" + html.escape(sub) + "</i>" if sub else ""}</td>{cells}</tr>')
            snd = f'<button class="cardsnd" title="Play sound" data-sound="{html.escape(it.get("sound") or (it.get("scientific") or name))}">🔊</button>' if c.get("sounds") and (it.get("sound") or grp in c.get("vocal_groups", [])) else ""
            cards.append(f'<a class="card" data-g="{html.escape(grp)}" href="/wiki/{cid}/{slug}.html">{snd}{thumb}<div class="cb"><span class="tag">{html.escape(grp)}</span><h3>{html.escape(name)}</h3><p>{html.escape(it.get("summary", ""))}</p></div></a>')
        cht = coll_charts(c, items)
        COLL_CHARTS.append((c, cht))
        chips = '<button class="chip on" data-g="*">All</button>' + "".join(f'<button class="chip" data-g="{html.escape(g)}">{html.escape(g)}</button>' for g in groups)
        head = "".join(f"<th>{lab}</th>" for _, lab in c["columns"])
        content = env.from_string(COLL_INDEX).render(c=c, n=len(items), cht=cht, chips=chips, cards="".join(cards), rows="".join(rows), head=head, ngroups=len(groups))
        write(f"wiki/{cid}/index.html", c["title"], content, 2, c["desc"], cid)
        out.append((c, len(items)))
    return out


COLL_ITEM = r"""<div class="wrap layout">
<aside class="sidebar"><div class="sidehead"><a href="/wiki/{{ c.id }}/index.html">{{ c.icon }} {{ c.title }}</a></div>
<p class="muted small">{{ n }} entries · use the catalog filters to browse.</p>
{% if prev %}<a class="sidebtn" href="/wiki/{{ c.id }}/{{ prev.slug }}.html">← {{ prev[nk] }}</a>{% endif %}
{% if next %}<a class="sidebtn" href="/wiki/{{ c.id }}/{{ next.slug }}.html">{{ next[nk] }} →</a>{% endif %}</aside>
<main class="article"><div class="crumbs"><a href="/index.html">Home</a> › <a href="/wiki/{{ c.id }}/index.html">{{ c.title }}</a> › {{ name }}</div>
<h1>{{ it.emoji or '' }} {{ name }}</h1>{% if sub %}<p class="sci">{{ sub }}</p>{% endif %}
{% if it.summary %}<p class="lede">{{ it.summary }}</p>{% endif %}
<div class="entry-top"><div class="entry-pic">{{ pic }}</div><table class="factbox">{{ facts }}</table></div>
{% if c.paperbox %}<div class="paperbox" data-local="/assets/papers/{{ it.slug }}.pdf" data-src="{{ (it.pdf_url or '')|e }}">
 <div class="pbhead"><span class="pbicon">📄</span><div><b>{{ it.journal }}{% if it.year %} · {{ it.year }}{% endif %}</b><div class="small">{{ it.authors }} · <span class="acc {{ 'open' if it.access=='Open access' else 'closed' }}">{{ it.access }}</span>{% if it.license %} · {{ it.license }}{% endif %}</div></div></div>
 <div class="pbbtns"><button class="btn pbview" hidden>📖 Read here</button>{% if it.pdf_url %}<a class="btn pbopen" href="{{ it.pdf_url|e }}" target="_blank" rel="noopener">↗ Open PDF in new tab</a><a class="btn pbdl" href="{{ it.pdf_url|e }}" target="_blank" rel="noopener" download>⬇ Download PDF</a>{% else %}<a class="btn pbopen" hidden></a><a class="btn pbdl" hidden></a>{% endif %}{% if it.doi %}<a class="btn ghost" href="https://doi.org/{{ it.doi }}" target="_blank" rel="noopener">🔗 Publisher page</a>{% endif %}{% if it.analysis %}<a class="btn ghost" href="{{ it.analysis }}">🧠 Our analysis</a>{% endif %}</div>
 <div class="pbnote small">Checking for a copy hosted on this site…</div>
 <iframe class="pbframe" title="PDF viewer" hidden></iframe></div>{% endif %}
{% if c.sounds %}<div class="soundbox" data-name="{{ (it.scientific or name)|e }}" data-common="{{ name|e }}" data-sound="{{ (it.sound or '')|e }}" data-local="/assets/audio/{{ c.id }}/{{ it.slug }}.mp3" data-kind="{{ c.sound_kind or 'species' }}" data-silent="{{ '1' if it.silent else '' }}"><span class="sinfo">🔊 Loading sound…</span>{% if it.sound_desc %}<div class="sounddesc"><b>What it sounds like:</b> {{ it.sound_desc }}</div>{% endif %}</div>{% endif %}
{{ viz }}{{ glance }}
{% if c.live_photos %}<div class="wikibox" data-wiki="{{ wk|e }}" hidden></div>{% endif %}
<div class="prose">{{ body }}</div>
{% if c.live_photos %}<section class="deepwiki" data-wiki="{{ wk|e }}"><h2 id="in-depth">📚 In depth</h2><div class="loadingbar"></div><p class="small muted">Loading the full encyclopedia article (habitat, anatomy, behaviour, research, threats and more)…</p></section>{% endif %}
{% if c.studies %}<section class="studies" data-q="{{ (it.scientific or it.study_q or name)|e }}"><h2 id="research">🔬 Research & studies</h2><p class="small">Scientific papers about {{ name|e }}, retrieved live from OpenAlex (250M+ works). Green <span class="oa" style="background:var(--ok);padding:0 6px;border-radius:9px;color:#012">PDF</span> badges open free full-text PDFs.</p><div class="sttabs"><button class="on" data-sort="cited_by_count:desc">Most cited</button><button data-sort="publication_date:desc">Newest</button></div><div class="loadingbar"></div><ul class="stlist"></ul></section>{% endif %}
{% if srch %}<div class="prose srcs">{{ srch }}</div>{% endif %}
{% if rel %}<section class="related"><h2 id="connections">🔗 Connections</h2>{{ rel }}</section>{% endif %}</main>
<aside class="toc"><div class="tochead">On this page</div>{{ toc }}</aside></div>"""

COLL_INDEX = r"""<section class="sechero"><div class="wrap"><div class="crumbs"><a href="/index.html">Home</a> › {{ c.title }}</div>
<h1>{{ c.icon }} {{ c.title }}</h1><p class="lede">{{ c.desc }}</p><p class="muted">{{ n }} entries in {{ ngroups }} groups.</p></div></section>
<main class="wrap">{% if cht %}<details class="charts" open><summary>📊 Charts and statistics for this catalog</summary><div class="chartgrid">{{ cht }}</div></details>{% endif %}<div class="catbar"><input class="catfilter" placeholder="Filter {{ n }} entries…"><div class="chips">{{ chips }}</div>
<div class="viewtoggle"><button class="chip on" data-v="grid">Cards</button><button class="chip" data-v="table">Table</button></div></div>
<div class="cards catgrid">{{ cards }}</div>
<div class="cattable" hidden><table class="sortable"><thead><tr><th>Name</th>{{ head }}</tr></thead><tbody>{{ rows }}</tbody></table></div></main>"""


def write_prompts():
    json.dump(WIKIMAP, open(os.path.join(ASSETS, "wikimap.json"), "w", encoding="utf-8"), ensure_ascii=False)
    json.dump(PHOTOS, open(os.path.join(ASSETS, "photo-index.json"), "w", encoding="utf-8"), ensure_ascii=False)
    json.dump([dict(sec=a, name=b, save=c, prompt=d) for a, b, c, d in PROMPTS],
              open(os.path.join(ASSETS, "prompts.json"), "w", encoding="utf-8"), ensure_ascii=False)
    path = os.path.join(ROOT, "prompts.md")
    lines = ["# Image prompts (Nano Banana)", "",
             "Auto-generated by `scripts/build_site.py`. Catalog entries load a real, openly licensed photo from Wikimedia Commons in the visitor's browser.",
             "**Only generate an image when the site cannot find one.** Open the site's *Photo status* page (wiki/photo-status.html): it checks every entry live and lists exactly which ones still need a picture, with the prompt and a copy button.",
             "Then save the image at the path shown and rerun the build. A local image always takes priority over the live photo.",
             "Generate the image, save it at the path shown (PNG/JPG/WEBP all work, 16:9 recommended), then rerun the build; the placeholder is replaced automatically.", "",
             f"Total pending: **{len(PROMPTS)}**", ""]
    cur = None
    for sec, name, target, prompt in PROMPTS:
        if sec != cur:
            lines += ["", f"## {sec}", ""]; cur = sec
        lines += [f"### {name}", f"- Save as: `{target}`", "```text", prompt, "```", ""]
    open(path, "w", encoding="utf-8").write("\n".join(lines))


def export_pdfs(sections):
    import subprocess, shutil as sh
    chrome = next((c for c in ("google-chrome", "chromium", "chromium-browser") if sh.which(c)), None)
    if not chrome:
        print("PDF export skipped (no Chrome)"); return
    outdir = os.path.join(ROOT, "assets", "pdf"); os.makedirs(outdir, exist_ok=True)
    n = 0
    for sec in sections:
        if not sec.get("pdf"):
            continue
        for p in sec["pages"]:
            src = os.path.join(ROOT, "wiki", sec["id"], p["slug"] + ".html")
            dst = os.path.join(outdir, p["slug"] + ".pdf")
            subprocess.run([chrome, "--headless=new", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
                            f"--print-to-pdf={dst}", "file://" + src], capture_output=True, timeout=120)
            n += os.path.exists(dst)
    print(f"exported {n} PDFs")


TRACKED = None

def main():
    env = Environment(loader=BaseLoader(), autoescape=False)
    T = env.from_string(TEMPLATE)
    built = CFG.get("reviewed", datetime.date.today().isoformat())
    global TRACKED
    _ff = os.path.join(SRC, "data", "tracker_feed.json")
    TRACKED = json.load(open(_ff, encoding="utf-8")).get("updated") if os.path.exists(_ff) else None
    sections, allpages, search = [], [], []
    global NAV
    NAV = [dict(id=x["id"], title=x["title"]) for x in CFG.get("nav_order", [])] or [dict(id=x["id"], title=x["title"]) for x in CFG["sections"] + CFG.get("collections", [])]
    for s in CFG["sections"]:
        sec = dict(s); sec["pages"] = []
        for slug in s["pages"]:
            meta, body = parse(os.path.join(SRC, s["id"], slug + ".md"))
            url = f"/wiki/{s['id']}/{slug}.html"
            if meta.get("include"):
                body = body + "\n\n" + include_repo_file(meta["include"], url)
            md = markdown.Markdown(extensions=MD_EXT, extension_configs=MD_CFG)
            h = md.convert(callouts(body))
            words = len(re.sub(r"<[^>]+>", " ", h).split())
            refs = re.findall(r'<li id="fn:[^"]+">(.*?)</li>', h, flags=re.S)
            links = re.findall(r'href="(https?://[^"]+)"', "".join(refs))
            if not refs:  # pages that cite with inline links instead of footnotes
                links = [u for u in dict.fromkeys(re.findall(r'href="(https?://[^"]+)"', h)) if "github.com/" + CFG["github"] not in u]
                refs = links
            p = dict(slug=slug, title=meta.get("title", slug), summary=meta.get("summary", ""), updated=meta.get("updated", built),
                     level=meta.get("level", ""), image=(meta.get("image", "").lstrip("/") or (find_img("articles", slug) or "")), html=h, toc=md.toc,
                     minutes=max(1, round(words / 220)), nrefs=len(refs), links=links, words=words, url=url, sec=s["id"])
            sec["pages"].append(p); allpages.append(p)
            text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", h))[:6000]
            search.append({"t": p["title"], "s": s["title"], "u": url.lstrip("/"), "d": p["summary"], "x": text})
        sections.append(sec)

    if os.path.isdir(OUT_WIKI):
        shutil.rmtree(OUT_WIKI)
    os.makedirs(ASSETS, exist_ok=True)
    for f in ("site.css", "site.js"):
        shutil.copy(os.path.join(SRC, "_assets", f), os.path.join(ASSETS, f))
    VER = zlib.crc32(open(os.path.join(ASSETS, "site.js"), "rb").read() + open(os.path.join(ASSETS, "site.css"), "rb").read()) & 0xffffffff
    json.dump(search, open(os.path.join(ASSETS, "search-index.json"), "w"), ensure_ascii=False)

    def write(rel, title, content, depth, summary="", cur_sec="", bodyclass=""):
        root = "../" * depth if depth else ""
        page = T.render(cfg=CFG, nav=NAV, title=title, summary=summary, content=content, root=root, sections=sections,
                        cur_sec=cur_sec, npages=len(allpages), built=TRACKED or built, bodyclass=bodyclass, tracker=CFG.get("tracker", []))
        out = os.path.join(ROOT, rel); os.makedirs(os.path.dirname(out), exist_ok=True)
        page = page.replace('assets/site/site.js"', f'assets/site/site.js?v={VER:x}"').replace('assets/site/site.css"', f'assets/site/site.css?v={VER:x}"')
        su = CFG.get("site_url", "").rstrip("/")
        if su:
            url = su + "/" + ("" if rel == "index.html" else rel)
            if rel != "wiki/read.html": SITEMAP.append(url)
            img = CFG.get("og_image", "")
            extra = (f'<link rel="canonical" href="{url}">\n<meta property="og:type" content="website">'
                     f'<meta property="og:site_name" content="{html.escape(CFG["name"])}">'
                     f'<meta property="og:title" content="{html.escape(title)}">'
                     f'<meta property="og:description" content="{html.escape(summary or CFG.get("tagline", ""))}">'
                     f'<meta property="og:url" content="{url}">' + (f'<meta property="og:image" content="{img}">' if img else "")
                     + '<meta name="twitter:card" content="summary_large_image">')
            if CFG.get("google_verify") and rel == "index.html":
                extra += f'\n<meta name="google-site-verification" content="{CFG["google_verify"]}">'
            page = page.replace("</head>", extra + "\n</head>", 1)
        open(out, "w", encoding="utf-8").write(relativize(page, depth))

    A, S, P = env.from_string(ARTICLE), env.from_string(SECTION), env.from_string(PLAIN)
    feedf = os.path.join(SRC, "data", "tracker_feed.json")
    FEED = json.load(open(feedf, encoding="utf-8")) if os.path.exists(feedf) else None
    if FEED:
        tp = CFG.get("tracker_page", "")
        for sec in sections:
            for p in sec["pages"]:
                if f"{sec['id']}/{p['slug']}" == tp:
                    names = {t["id"]: (t.get("icon", ""), t["name"]) for t in CFG.get("tracker", [])}
                    blocks = []
                    for tid, works in FEED.get("streams", {}).items():
                        if not works: continue
                        ic, nm = names.get(tid, ("", tid))
                        li = "".join(f'<li><a href="{html.escape(w["url"])}" target="_blank" rel="noopener">{html.escape(w["title"])}</a> <span class="muted small">· {html.escape(w.get("venue") or "")} · {html.escape(w["date"])}</span></li>' for w in works)
                        blocks.append(f'<h3>{ic} {html.escape(nm)}</h3><ul>{li}</ul>')
                    if blocks:
                        p["html"] = p["html"] + f'<h2 id="latest-research">📡 Latest research (updated automatically every week)</h2><p class="muted">Newest papers matching each stream, from OpenAlex. Last checked {html.escape(FEED["updated"])}.</p>' + "".join(blocks)
    for sec in sections:
        root = "../../"
        write(f"wiki/{sec['id']}/index.html", sec["title"], S.render(sec=sec, root=root), 2, sec["desc"], sec["id"])
        for i, p in enumerate(sec["pages"]):
            prev = sec["pages"][i - 1] if i else None
            nxt = sec["pages"][i + 1] if i + 1 < len(sec["pages"]) else None
            write(f"wiki/{sec['id']}/{p['slug']}.html", p["title"],
                  A.render(sec=sec, page=p, sections=sections, root=root, prev=prev, next=nxt), 2, p["summary"], sec["id"])

    colls = build_collections(env, write, sections, search, built)
    for p in allpages:
        if not p["image"]:
            PROMPTS.append(("Articles", p["title"], f"assets/img/articles/{p['slug']}.png",
                            f"Editorial scientific illustration for an encyclopedia article titled \"{p['title']}\": {p['summary']} "
                            f"{CFG.get('prompt_style', 'Photorealistic, accurate, high detail, 16:9, no text')}"))
    json.dump(search, open(os.path.join(ASSETS, "search-index.json"), "w"), ensure_ascii=False)
    write_prompts()
    # special pages
    for name in ("glossary", "timeline", "about"):
        meta, body = parse(os.path.join(SRC, f"{name}.md"))
        h = markdown.markdown(callouts(body), extensions=MD_EXT, extension_configs=MD_CFG)
        write(f"wiki/{name}.html", meta.get("title", name), P.render(title=meta.get("title", name), body=f'<div class="prose wide">{h}</div>', root="../"), 1, meta.get("summary", ""))
    # bibliography
    biblio = {}
    for p in allpages:
        for l in p["links"]:
            biblio.setdefault(l, []).append(p)
    rows = "".join(f'<li><a href="{html.escape(l)}">{html.escape(re.sub(r"^https?://(www\.)?", "", l)[:110])}</a> <span class="muted">— cited in ' +
                   ", ".join(f'<a href="/wiki/{q["sec"]}/{q["slug"]}.html">{html.escape(q["title"])}</a>' for q in ps[:4]) + "</span></li>"
                   for l, ps in sorted(biblio.items(), key=lambda kv: re.sub(r"^https?://(www\.)?", "", kv[0])))
    write("wiki/sources.html", "All sources", P.render(title=f"All sources ({len(biblio)})",
          body=f'<p class="lede">Every external source cited anywhere on this site, with the articles that cite it.</p><ol class="biblio">{rows}</ol>', root="../"), 1)
    write("wiki/photo-status.html", "Photo status", P.render(title="Photo status", root="../",
          body='<p class="lede">This page checks every catalog entry against Wikipedia / Wikimedia Commons right now. Entries with a real, openly licensed photo are counted; the ones without are listed with a ready-made Nano Banana prompt and the exact path to save the image to.</p><div id="photostatus" class="prose wide"><p>Checking…</p></div>'), 1, bodyclass="photostatus")
    groups = ""
    for g in STATS.get("groups", []):
        groups += f'<h2 id="{g.get("id", "")}">{html.escape(g["title"])}</h2>' + (f'<p>{g["desc"]}</p>' if g.get("desc") else "") + '<div class="chartgrid">' + "".join(CH.render(STATS["charts"][k]) for k in g["charts"]) + "</div>"
    for c, cht in COLL_CHARTS:
        if cht:
            groups += f'<h2>{c["icon"]} {html.escape(c["title"])}</h2><p><a href="/wiki/{c["id"]}/index.html">Open the {html.escape(c["title"])} catalog →</a></p><div class="chartgrid">{cht}</div>'
    nch = groups.count('<figure class="chart')
    write("wiki/statistics/index.html", "Statistics & data", P.render(title="📊 Statistics & data", root="../../",
          body=f'<p class="lede">{nch} animated charts built from cited datasets and from this encyclopedia\'s own catalogs. Hover any point or bar for exact values; every chart lists its source.</p>{groups}'), 2, "Animated charts and statistics", "statistics")
    write("wiki/read.html", "Reader", re.sub(r"<h1>📖 Reader</h1>", "", P.render(title="📖 Reader", root="../", body='<div id="reader" class="reader"></div>')), 1, "Read any article inside this encyclopedia", bodyclass="readerpage")
    write("wiki/search.html", "Search", P.render(title="Search", root="../", body='<input id="q" class="bigsearch" placeholder="Type to search every article…" autofocus><div id="results"></div>'), 1, bodyclass="searchpage")

    # home
    meta, body = parse(os.path.join(SRC, "home.md"))
    home_html = markdown.markdown(callouts(body), extensions=MD_EXT, extension_configs=MD_CFG)
    stats = "".join(f'<div class="stat"><b>{html.escape(a)}</b><span>{html.escape(b)}</span></div>' for a, b in CFG["stats"])
    seccards = "".join(f'<a class="seccard" href="/wiki/{s["id"]}/index.html"><div class="si">{s["icon"]}</div><h3>{s["title"]}</h3><p>{html.escape(s["desc"].split(". ")[0])}</p><span class="cm">{len(s["pages"])} articles</span></a>' for s in sections)
    card = lambda c, n: f'<a class="seccard coll" href="/wiki/{c["id"]}/index.html"><div class="si">{c["icon"]}</div><h3>{c["title"]}</h3><p>{html.escape(c.get("short") or c["desc"].split(". ")[0])}</p><span class="cm">{n} entries</span></a>'
    collcards = "".join(card(c, n) for c, n in colls)
    hg = CFG.get("home_groups")
    if hg:
        byid = {c["id"]: (c, n) for c, n in colls}; used = set(); parts = []
        for g in hg:
            cs = [byid[i] for i in g["ids"] if i in byid]; used.update(g["ids"])
            if cs: parts.append(f'<section class="homegroup"><h3 class="hg">{g.get("icon","")} {html.escape(g["title"])}</h3><div class="secgrid compact">{"".join(card(c, n) for c, n in cs)}</div></section>')
        rest = [cn for cn in colls if cn[0]["id"] not in used]
        if rest: parts.append(f'<section class="homegroup"><h3 class="hg">More catalogs</h3><div class="secgrid compact">{"".join(card(c, n) for c, n in rest)}</div></section>')
        collblock = "<h2>Explore the encyclopedia</h2>" + "".join(parts)
    else:
        collblock = f"<h2>Encyclopedia catalogs</h2><div class=\"secgrid compact\">{collcards}</div>"
    nentries = sum(n for _, n in colls)
    feat = [p for p in allpages if p["slug"] in CFG.get("featured", [])]
    featcards = "".join(f'<a class="card" href="{p["url"]}">{('<img src="/' + p["image"] + '" alt="" loading="lazy">') if p["image"] else ""}<div class="cb"><span class="tag">{next(s["title"] for s in sections if s["id"]==p["sec"])}</span><h3>{p["title"]}</h3><p>{p["summary"]}</p></div></a>' for p in feat)
    totalwords = sum(p["words"] for p in allpages)
    hints = ('<div class="hints">Try: ' + " ".join(f'<a href="/wiki/search.html?q={html.escape(h.replace(" ", "+"))}">{html.escape(h)}</a>' for h in CFG.get("search_hints", [])) + '</div>') if CFG.get("search_hints") else ""
    content = f'''<section class="hero"><div class="wrap"><div class="kicker">{CFG["kicker"]}</div><h1>{CFG["logo"]} {CFG["name"]}</h1><p class="lede">{CFG["tagline"]}</p>
<form class="herosearch" action="/wiki/search.html"><input name="q" placeholder="🔎 Search this encyclopedia and all of Wikipedia…" aria-label="Search"></form>{hints}
<div class="stats">{stats}</div></div></section>
<main class="wrap home">{collblock}<h2>In-depth articles by section</h2><div class="secgrid compact">{seccards}</div>
<h2>Featured deep dives</h2><div class="cards">{featcards}</div>
<div class="prose wide homebody">{home_html}</div>
<p class="muted small">{len(allpages)} articles · {nentries} catalog entries · ~{totalwords//1000}k words · {len(biblio)} distinct sources · reviewed {built}</p></main>'''
    write("index.html", CFG["name"], content, 0, CFG["tagline"], bodyclass="homepage")
    if os.environ.get("SKIP_PDF") != "1":
        export_pdfs(sections)
    if SITEMAP:
        today = datetime.date.today().isoformat() if "datetime" in globals() else ""
        xs = "".join(f"<url><loc>{html.escape(u)}</loc>{f'<lastmod>{today}</lastmod>' if today else ''}</url>" for u in sorted(set(SITEMAP)))
        open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + xs + "</urlset>\n")
    print(f"built {len(allpages)} articles, {len(biblio)} sources, ~{totalwords} words")


if __name__ == "__main__":
    main()

"""Generate branching regional timelines (site_src/timelines/*.md) from the history catalogs.
Run before build_site.py. Each region is a 'branch' because societies developed at different speeds."""
import json, os, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "site_src", "data")
OUT = os.path.join(ROOT, "site_src", "timelines"); os.makedirs(OUT, exist_ok=True)
L = lambda f: json.load(open(os.path.join(D, f), encoding="utf-8"))
civs, dyn, ev, ppl, sites, inv, hom = L("civilizations.json"), L("dynasties.json"), L("events.json"), L("people.json"), L("sites.json"), L("inventions.json"), L("hominins.json")
LANES = ["Africa", "Middle East", "Europe", "South Asia", "Central Asia", "East Asia", "Southeast Asia", "Americas", "Oceania", "Global"]
SLUG = {"Africa": "africa", "Middle East": "middle-east", "Europe": "europe", "South Asia": "south-asia", "Central Asia": "central-asia",
        "East Asia": "east-asia", "Southeast Asia": "southeast-asia", "Americas": "americas", "Oceania": "oceania", "Global": "global"}
def fmt(y):
    y = int(y)
    if y <= -1000000: return f"{-y/1e6:.1f} Myr ago".replace(".0 ", " ")
    if y <= -10000: return f"{-y:,} yr ago"
    if y < 0: return f"{-y} BCE"
    return f"{y} CE" if y < 1000 else str(y)
def lane_of(x, default="Global"):
    if x.get("lane"): return x["lane"]
    t = " ".join(str(x.get(k, "")) for k in ("region", "country", "where"))
    for k, words in {"South Asia": "India Pakistan Bangladesh Nepal Sri Lanka Gandhara Bengal".split(), "East Asia": "China Japan Korea Mongolia".split(),
                     "Southeast Asia": "Indonesia Cambodia Vietnam Thailand Philippines Java Sumatra Malaysia".split(), "Middle East": "Iraq Iran Persia Syria Turkey Israel Palestine Jordan Arabia Baghdad Babylon Levant Lebanon".split(),
                     "Africa": "Egypt Africa Ethiopia Kenya Tanzania Mali Ghana Morocco Sudan Zimbabwe Nigeria".split(), "Europe": "Greece Italy Rome France Germany England Britain Spain Poland Russia Europe UK Netherlands".split(),
                     "Americas": "Mexico Peru USA America Guatemala Chile Brazil Cuba".split(), "Oceania": "Australia Zealand Pacific Polynesia".split(), "Central Asia": "Kazakhstan Uzbekistan Central Asia Samarkand Georgia".split()}.items():
        if any(w in t for w in words): return k
    return default
items = []  # (year, lane, kind, name, url, note)
for c in civs: items.append((c["start"], c.get("lane") or lane_of(c), "🏛 Civilisation begins", c["name"], f"/wiki/civilizations/{c['slug']}.html", c.get("when", "")))
for c in dyn: items.append((c["start"], c["lane"], "👑 Dynasty", c["name"], f"/wiki/dynasties/{c['slug']}.html", c.get("rise", "")))
for e in ev:
    if isinstance(e.get("year"), int): items.append((e["year"], e.get("lane") or lane_of(e), "📅 " + str(e.get("etype", "Event")), e["name"], f"/wiki/events/{e['slug']}.html", e.get("impact", "")))
for p in ppl:
    if isinstance(p.get("born"), int) and not p.get("group", "").startswith("Legendary"): items.append((p["born"], lane_of(p), "👤 Born", p["name"], f"/wiki/people/{p['slug']}.html", p.get("known_for", "")))
for s in sites:
    if isinstance(s.get("year"), int): items.append((s["year"], lane_of(s), "🗿 Built / founded", s["name"], f"/wiki/sites/{s['slug']}.html", s.get("built_by", "")))
for i in inv:
    if isinstance(i.get("year"), int): items.append((i["year"], lane_of(i), "⚙ Invention", i["name"], f"/wiki/inventions/{i['slug']}.html", i.get("where", "")))
man, bel, lang, hid = L("manuscripts.json"), L("beliefs.json"), L("languages.json"), L("hidden_history.json")
eng = L("engineering.json")
for e in eng: items.append((e["year"], e["lane"], "🏗 Built", e["name"], f"/wiki/engineering/{e['slug']}.html", e.get("where", "")))
bat = L("battles.json")
for b in bat: items.append((b["year"], b["lane"], "⚔ Battle", b["name"], f"/wiki/battles/{b['slug']}.html", b.get("war", "")))
cre = L("creatures.json")
for c in cre: items.append((c["year"], c["lane"], "🐉 Myth", c["name"], f"/wiki/creatures/{c['slug']}.html", c.get("origin", "")))
for h in hid: items.append((h["year"], h["lane"], "🔓 Hidden history", h["name"], f"/wiki/hidden_history/{h['slug']}.html", h.get("verdict", "")))
for m in man: items.append((m["year"], m["lane"], "📜 Manuscript", m["name"], f"/wiki/manuscripts/{m['slug']}.html", m.get("when", "")))
for h in hom: items.append((h["start"], lane_of(h, "Africa"), "🦴 Human species appears", h["name"], f"/wiki/hominins/{h['slug']}.html", h.get("region", "")))
PERIODS = [(-10**9, -10000, "Deep prehistory (before 10,000 BCE)"), (-10000, -3000, "Neolithic and first farmers (10,000–3000 BCE)"), (-3000, -1200, "Bronze Age (3000–1200 BCE)"),
           (-1200, -500, "Iron Age (1200–500 BCE)"), (-500, 500, "Classical age (500 BCE–500 CE)"), (500, 1000, "Early medieval (500–1000)"), (1000, 1500, "Late medieval (1000–1500)"),
           (1500, 1800, "Early modern (1500–1800)"), (1800, 1945, "Industrial and imperial age (1800–1945)"), (1945, 3000, "Contemporary (1945–today)")]
def page(lane, rows, title, intro):
    md = [f"---\ntitle: {title}\nsummary: {intro}\nlevel: Timeline\n---", intro, ""]
    for a, b, label in PERIODS:
        sub = sorted([r for r in rows if a <= r[0] < b], key=lambda r: r[0])
        if not sub: continue
        md.append(f":::collapse {'!' if a >= -3000 and a < 1500 else ''}{label} ({len(sub)})")
        md.append('<div class="timeline">')
        for y, ln, kind, name, url, note in sub:
            extra = f" <span class='muted'>· {html.escape(ln)}</span>" if lane == "ALL" else ""
            md.append(f'<div class="ev"><span class="yr">{fmt(y)}</span>: {kind}: <a href="{url}">{html.escape(name)}</a>{extra}{(" — " + html.escape(str(note))[:140]) if note else ""}</div>')
        md.append("</div>\n:::\n")
    return "\n".join(md)
# swimlane SVG of civilisations and dynasties
BR = [(-3500, 0), (-1200, 260), (500, 520), (1500, 780), (2030, 1060)]
def X(y):
    y = max(min(y, 2030), -3500)
    for (y0, x0), (y1, x1) in zip(BR, BR[1:]):
        if y <= y1: return 140 + x0 + (y - y0) / (y1 - y0) * (x1 - x0)
lanes_svg, ytop = [], 30
for lane in LANES[:-1]:
    bars = sorted([(max(c["start"], -3500), min(c["end"], 2026), c["name"], f"/wiki/civilizations/{c['slug']}.html", "c") for c in civs if (c.get("lane") or lane_of(c)) == lane and c["end"] > -3500] +
                  [(max(d["start"], -3500), min(d["end"], 2026), d["name"], f"/wiki/dynasties/{d['slug']}.html", "d") for d in dyn if d["lane"] == lane and d["end"] > -3500])
    rows_end = []
    placed = []
    for s, e, n, u, k in bars:
        r = next((i for i, last in enumerate(rows_end) if last < s), None)
        if r is None: rows_end.append(e); r = len(rows_end) - 1
        else: rows_end[r] = e
        placed.append((r, s, e, n, u, k))
    h = max(1, len(rows_end)) * 14 + 16
    g = [f'<text x="8" y="{ytop + 14}" class="lnl">{lane}</text>', f'<line x1="140" x2="1200" y1="{ytop + h - 4}" y2="{ytop + h - 4}" class="lnd"/>']
    for r, s, e, n, u, k in placed:
        x1, x2 = X(s), max(X(e), X(s) + 3)
        g.append(f'<a href="{u}"><rect x="{x1:.1f}" y="{ytop + 4 + r * 14}" width="{x2 - x1:.1f}" height="11" rx="3" class="bar {k}"><title>{html.escape(n)} ({fmt(s)} – {fmt(e)})</title></rect></a>')
    lanes_svg.append("".join(g)); ytop += h
ticks = "".join(f'<line x1="{X(y):.0f}" x2="{X(y):.0f}" y1="22" y2="{ytop}" class="tk"/><text x="{X(y):.0f}" y="16" class="tkl">{fmt(y)}</text>' for y in (-3000, -2000, -1200, -500, 0, 500, 1000, 1500, 1800, 2000))
svg = (f'<div class="swim"><svg viewBox="0 0 1210 {ytop + 10}" role="img" aria-label="Branching timeline of civilisations and dynasties by region">'
       '<style>.lnl{font:600 12px system-ui;fill:var(--fg)}.lnd{stroke:var(--line)}.tk{stroke:var(--line);stroke-dasharray:2 4}.tkl{font:10px system-ui;fill:var(--muted);text-anchor:middle}'
       '.bar.c{fill:var(--accent);opacity:.85}.bar.d{fill:var(--link);opacity:.55}.bar:hover{opacity:1;stroke:var(--fg)}</style>'
       f'{ticks}{"".join(lanes_svg)}</svg></div>')
intro = ("Human history did not move in step everywhere. Farming, cities, iron, writing and industry arrived at different times in different regions, so this timeline branches by region. "
         "Each bar is a civilisation (amber) or dynasty (blue); hover for dates and click to open it. Below are the region timelines, each with every catalogued civilisation, dynasty, event, person, monument, invention and human species, sorted by date.")
links = " · ".join(f"[{l}](/wiki/timelines/{SLUG[l]}.html)" for l in LANES) + "\n\n**Theme timelines:** [Religions](/wiki/timelines/religions-and-beliefs.html) · [Languages and writing](/wiki/timelines/languages-and-writing.html) · [Technology](/wiki/timelines/technology-and-science.html) · [Manuscripts](/wiki/timelines/manuscripts-and-texts.html) · [Rulers and dynasties](/wiki/timelines/rulers-and-dynasties.html) · [Wars, plagues and disasters](/wiki/timelines/wars-plagues-and-disasters.html) · [Hidden history and conspiracies](/wiki/timelines/hidden-history-and-conspiracies.html) · [Engineering](/wiki/timelines/engineering-and-construction.html) · [Invasions and conquests](/wiki/timelines/invasions-and-conquests.html) · [Battles, betrayals and atrocities](/wiki/timelines/battles-betrayals-and-atrocities.html) · [Myths and legendary creatures](/wiki/timelines/myths-and-legendary-creatures.html)"
allrows = [r for r in items]
ov = ["---\ntitle: The Branching Timeline of Humanity\nsummary: Civilisations and dynasties of every region side by side from 3500 BCE to today, with region-by-region timelines of every event.\nlevel: Timeline\n---",
      intro, "", svg, "", "**Region timelines:** " + links, "",
      "Not everyone evolved at the same rate: Mesopotamia and Egypt had cities and writing by 3200 BCE, while much of Europe, the Americas and Africa south of the Sahara were still farming villages or hunter-gatherer lands; Australia's peoples kept a hunter-gatherer way of life for 65,000 years; and Polynesians reached New Zealand only around 1300 CE. Each branch below follows its own path.", "",
      page("ALL", allrows, "", "").split("---", 2)[-1].split("\n", 2)[-1]]
open(os.path.join(OUT, "branching-timeline.md"), "w", encoding="utf-8").write("\n".join(ov))
for lane in LANES:
    rows = [r for r in items if r[1] == lane]
    open(os.path.join(OUT, SLUG[lane] + ".md"), "w", encoding="utf-8").write(page(lane, rows, f"Timeline: {lane}", f"Every catalogued civilisation, dynasty, event, person, monument, invention and human species in {lane}, from the earliest evidence to today ({len(rows)} entries)."))
print("timelines:", len(items), "items")

# thematic branches: the same history cut by theme instead of region
THEMES = [
 ("religions-and-beliefs", "Timeline: Religions and philosophies", "When each religion and philosophy began, where, and who founded it, from the earliest ritual burials to modern faiths.",
  [(b["founded"], lane_of({"region": b.get("origin", "")}), "🛕 Founded", b["name"], f"/wiki/beliefs/{b['slug']}.html", f"{b.get('origin','')} · {b.get('founder','')}") for b in bel if isinstance(b.get("founded"), int)]),
 ("languages-and-writing", "Timeline: Languages and writing", "How language families spread and when scripts and key texts appeared, from proto-languages to modern tongues.",
  [(l["start"], lane_of({"region": l.get("homeland", "")}), "🗣 " + l.get("family", "Language"), l["name"], f"/wiki/languages/{l['slug']}.html", l.get("homeland", "")) for l in lang if isinstance(l.get("start"), int)] +
  [(m["year"], m["lane"], "📜 Manuscript", m["name"], f"/wiki/manuscripts/{m['slug']}.html", m.get("script", "")) for m in man]),
 ("technology-and-science", "Timeline: Technology and science", "Every catalogued invention and discovery, from 3.3-million-year-old stone tools to the internet, showing how knowledge accumulated and spread between regions.",
  [r for r in items if r[2].startswith("⚙")]),
 ("manuscripts-and-texts", "Timeline: Manuscripts and written records", "The oldest surviving manuscripts, inscriptions and books of every civilisation, in the order they were written.",
  [r for r in items if r[2].startswith("📜")]),
 ("hidden-history-and-conspiracies", "Timeline: Hidden history, cover-ups and conspiracy theories", "Documented secrets, cover-ups, forgeries and famous conspiracy theories in date order, each with a verdict based on the evidence.",
  [r for r in items if r[2].startswith("🔓")]),
 ("engineering-and-construction", "Timeline: How it was built — engineering through the ages", "Monuments, bridges, tunnels, bunkers and everyday technology in the order they were built.",
  [r for r in items if r[2].startswith("🏗")]),
 ("invasions-and-conquests", "Timeline: Invasions and conquests", "Every catalogued invasion, conquest, siege and war of conquest, from the Sea Peoples and Alexander to the 21st century.",
  [r for r in items if (r[2].startswith("⚔")) or r[2].startswith("📅") and any(w in r[2].lower()+" "+r[3].lower() for w in ("invasion", "conquest", "conquer", "siege", "sack", "raid", "campaign", "expedition", "battle", "war"))]),
 ("battles-betrayals-and-atrocities", "Timeline: Battles, betrayals and atrocities", "Every catalogued battle and siege in date order — how it was fought, who betrayed whom, the war crimes behind the official story, and how each one reshaped history.",
  [r for r in items if r[2].startswith("⚔")]),
 ("myths-and-legendary-creatures", "Timeline: Myths and legendary creatures", "When each legendary creature first appears in art or writing, from the Xishuipo shell dragon (c. 4500 BCE) and the griffins of Susa to the vampire panics of the 1720s and modern cryptids.",
  [r for r in items if r[2].startswith("🐉")]),
 ("rulers-and-dynasties", "Timeline: Rulers, dynasties and empires", "Every catalogued empire and dynasty in date order across the world: who rose, when, and alongside whom.",
  [r for r in items if r[2].startswith("🏛") or r[2].startswith("👑")]),
 ("wars-plagues-and-disasters", "Timeline: Wars, plagues and disasters", "The shocks that ended empires and reshaped populations: eruptions, ice ages, droughts, pandemics, invasions and world wars.",
  [r for r in items if r[2].startswith("📅") and any(w in r[2].lower() for w in ("war", "battle", "plague", "pandemic", "epidemic", "volcan", "climate", "drought", "famine", "invasion", "conquest", "collapse", "disaster", "earthquake", "genocide", "revolt", "rebellion"))]),
]
for slug, title, intro, rows in THEMES:
    open(os.path.join(OUT, slug + ".md"), "w", encoding="utf-8").write(page("ALL", rows, title, intro + f" ({len(rows)} entries)"))
print("themes:", [(t[0], len(t[3])) for t in THEMES])

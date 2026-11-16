"""Build hidden link_text fields so people, events, empires, dynasties and beliefs interlink in both directions.
Run before build_site.py."""
import json, os, re
D = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site_src", "data")
L = lambda f: json.load(open(os.path.join(D, f + ".json"), encoding="utf-8"))
S = lambda f, x: json.dump(x, open(os.path.join(D, f + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
ppl, ev, civ, dyn, bel = L("people"), L("events"), L("civilizations"), L("dynasties"), L("beliefs")
key = lambda n: re.sub(r"\s*\(.*?\)", "", n).lower()
def has(txt, name):
    return re.search(r"(?<![\w-])" + re.escape(key(name)) + r"(?:s|es)?(?![\w-])", txt.lower()) is not None
def blob(x, ks): return " ".join(str(x.get(k, "")) for k in ks)
for e in ev: e["link_text"] = blob(e, ("summary", "details", "impact", "region"))
for p in ppl:
    extra = []
    for coll, ks in ((ev, ("summary", "details")), (civ, ("summary", "rise", "fall", "government", "legacy", "culture")), (dyn, ("founder", "notable", "rise", "fall")), (bel, ("founder", "summary"))):
        extra += [o["name"] for o in coll if has(blob(o, ks), p["name"])]
    p["link_text"] = " ; ".join([blob(p, ("summary", "known_for", "connections", "region"))] + extra)
S("people", ppl); S("events", ev)
print("link_text built for", len(ppl), "people and", len(ev), "events")

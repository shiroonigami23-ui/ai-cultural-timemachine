"""Refresh the live research tracker: newest papers for each tracker stream from OpenAlex.
Writes site_src/data/tracker_feed.json. Run weekly by GitHub Actions (no API key needed)."""
import datetime, json, os, re, sys, time, urllib.parse, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "site_src")
cfg = json.load(open(os.path.join(SRC, "site.json"), encoding="utf-8"))
today = datetime.date.today()
since = (today - datetime.timedelta(days=int(os.environ.get("TRACKER_DAYS", "730")))).isoformat()
out = {"updated": today.isoformat(), "streams": {}}
def fetch(filt):
    url = "https://api.openalex.org/works?" + urllib.parse.urlencode({
        "filter": f"{filt},from_publication_date:{since},type:article", "sort": "publication_date:desc",
        "per-page": "25", "select": "title,publication_date,doi,id,primary_location", "mailto": "research-hubs@users.noreply.github.com"})
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "research-hub-tracker/1.0"}), timeout=30) as r:
            return json.load(r).get("results", [])
    except Exception as e:
        print("skip", filt, e, file=sys.stderr); return []
for t in cfg.get("tracker", []):
    q = t.get("query") or re.sub(r"\(.*?\)", "", t["name"]).strip()
    must = [w.lower() for w in (t.get("must") or [max(re.findall(r"[A-Za-z][\w-]+", q), key=len)])]
    seen, works = set(), []
    for filt in (f'title.search:"{q}"', f"title.search:{q}", f'title_and_abstract.search:"{q}"'):
        for w in fetch(filt):
            title = re.sub(r"<[^>]+>", "", w.get("title") or "")
            if not title or title.lower() in seen or not any(m in title.lower() for m in must): continue
            seen.add(title.lower())
            src = ((w.get("primary_location") or {}).get("source") or {}).get("display_name") or ""
            works.append({"title": title[:220], "date": w.get("publication_date", ""), "venue": src, "url": w.get("doi") or w.get("id")})
        if len(works) >= 3: break
        time.sleep(0.2)
    works.sort(key=lambda w: w["date"], reverse=True)
    out["streams"][t["id"]] = works[:3]
    print(t["id"], len(works), works[0]["title"][:70] if works else "")
json.dump(out, open(os.path.join(SRC, "data", "tracker_feed.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

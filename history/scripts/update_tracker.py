"""Refresh the live research tracker: newest papers for each tracker stream from OpenAlex.
Writes site_src/data/tracker_feed.json. Run weekly by GitHub Actions (no API key needed)."""
import datetime, json, os, re, sys, time, urllib.parse, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "site_src")
cfg = json.load(open(os.path.join(SRC, "site.json"), encoding="utf-8"))
today = datetime.date.today()
since = (today - datetime.timedelta(days=int(os.environ.get("TRACKER_DAYS", "365")))).isoformat()
out = {"updated": today.isoformat(), "streams": {}}
for t in cfg.get("tracker", []):
    q = t.get("query") or re.sub(r"\(.*?\)", "", t["name"]).strip()
    url = ("https://api.openalex.org/works?" + urllib.parse.urlencode({
        "search": q, "filter": f"from_publication_date:{since},type:article", "sort": "publication_date:desc",
        "per-page": "4", "select": "title,publication_date,doi,id,primary_location", "mailto": "research-hubs@users.noreply.github.com"}))
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "research-hub-tracker/1.0"}), timeout=30) as r:
            res = json.load(r).get("results", [])
    except Exception as e:
        print("skip", t["id"], e, file=sys.stderr); res = []
    works = []
    for w in res:
        if not w.get("title"): continue
        src = ((w.get("primary_location") or {}).get("source") or {}).get("display_name") or ""
        works.append({"title": re.sub(r"<[^>]+>", "", w["title"])[:220], "date": w.get("publication_date", ""), "venue": src,
                      "url": w.get("doi") or w.get("id")})
    out["streams"][t["id"]] = works[:3]
    print(t["id"], len(works))
    time.sleep(0.3)
json.dump(out, open(os.path.join(SRC, "data", "tracker_feed.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

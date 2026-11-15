"""Generic compact catalog builder.
@file name.json     @fields f1|f2|...    # Group|emoji     then pipe-separated rows.
Numeric strings become numbers; ';' splits lists for fields ending in 's_list'. wiki defaults to name."""
import json, re, sys, os
def slugify(s): return re.sub(r"[^a-z0-9]+", "-", s.lower().replace("'", "")).strip("-")
def num(v):
    v = v.strip()
    if re.fullmatch(r"-?\d+", v): return int(v)
    if re.fullmatch(r"-?\d*\.\d+(e-?\d+)?|-?\d+e-?\d+", v): return float(v)
    return v
def run(path):
    out = {}; fields = None; fn = None; group = emoji = None
    for ln in open(path, encoding="utf-8"):
        ln = ln.rstrip("\n")
        if not ln.strip(): continue
        if ln.startswith("@file"):
            if fn: save(fn, out)
            fn = ln.split()[1]; out = {}
            p = os.path.join("..", fn)
            if os.path.exists(p): out = {x["slug"]: x for x in json.load(open(p))}
            continue
        if ln.startswith("@fields"): fields = ln.split(None, 1)[1].split("|"); continue
        if ln.startswith("# "): group, emoji = [x.strip() for x in ln[2:].split("|")]; continue
        vals = ln.split("|")
        x = {}
        for f, v in zip(fields, vals):
            v = v.strip()
            if v in ("", "-"): continue
            x[f] = [s.strip() for s in v.split(";")] if f.endswith("_list") else num(v)
        x["group"] = group; x["emoji"] = emoji
        x["slug"] = x.get("slug") or slugify(str(x["name"]))
        x.setdefault("wiki", str(x["name"]).replace(" ", "_"))
        out[x["slug"]] = x
    if fn: save(fn, out)
def save(fn, out):
    json.dump(list(out.values()), open(os.path.join("..", fn), "w"), ensure_ascii=False, indent=0)
    print(fn, len(out))
if __name__ == "__main__":
    for p in sys.argv[1:]: run(p)

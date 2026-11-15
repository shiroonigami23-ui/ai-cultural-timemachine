"""Animated, theme-aware SVG charts for the static site (no JS libraries needed)."""
import html, math

PAL = ["var(--accent)", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#eab308", "#6366f1", "#84cc16"]


def _fmt(v):
    if isinstance(v, (int, float)):
        if abs(v) >= 1e6:
            return f"{v/1e6:,.1f}M"
        if abs(v) >= 1e4:
            return f"{v:,.0f}"
        return f"{v:,.4g}" if isinstance(v, float) else f"{v:,}"
    return str(v)


def _wrap(title, svg, note="", source=""):
    s = f' <span class="src">Source: {source}</span>' if source else ""
    n = f'<figcaption>{html.escape(note)}{s}</figcaption>' if (note or source) else ""
    return f'<figure class="chart anim"><div class="ctitle">{html.escape(title)}</div>{svg}{n}</figure>'


def hbar(title, labels, values, unit="", note="", source="", log=False):
    n = len(labels)
    W, rowh, lw = 720, 26, 250
    H = n * rowh + 20
    vmax = max(values) or 1
    f = (lambda v: math.log10(max(v, 1)) / math.log10(max(vmax, 10))) if log else (lambda v: v / vmax)
    rows = []
    for i, (l, v) in enumerate(zip(labels, values)):
        y = 10 + i * rowh
        w = max(2, (W - lw - 90) * f(v))
        lab = str(l) if len(str(l)) <= 36 else str(l)[:34] + "…"
        rows.append(f'<text x="{lw-8}" y="{y+16}" text-anchor="end" class="cl"><title>{html.escape(str(l))}</title>{html.escape(lab)}</text>'
                    f'<rect class="bar" style="animation-delay:{i*40}ms" x="{lw}" y="{y+3}" width="{w:.1f}" height="{rowh-8}" rx="4" fill="{PAL[i % len(PAL)] if n <= 10 else PAL[0]}"/>'
                    f'<text x="{lw+w+6:.1f}" y="{y+16}" class="cv">{_fmt(v)}{html.escape(unit)}</text>')
    return _wrap(title, f'<svg viewBox="0 0 {W} {H}" class="csvg">{"".join(rows)}</svg>', note, source)


def vbar(title, labels, values, unit="", note="", source="", hl=None):
    n = len(labels)
    W, H, pad = 720, 300, 46
    vmax = max(values) or 1
    bw = (W - pad * 2) / n
    out = [f'<line x1="{pad}" y1="{H-40}" x2="{W-pad}" y2="{H-40}" class="axis"/>']
    for i, (l, v) in enumerate(zip(labels, values)):
        h = (H - 80) * v / vmax
        x = pad + i * bw + bw * 0.12
        col = "#f59e0b" if hl is not None and i in hl else PAL[0]
        out.append(f'<rect class="vbar" style="animation-delay:{i*50}ms" x="{x:.1f}" y="{H-40-h:.1f}" width="{bw*0.76:.1f}" height="{h:.1f}" rx="3" fill="{col}"/>'
                   f'<text x="{x+bw*0.38:.1f}" y="{H-44-h:.1f}" text-anchor="middle" class="cv">{_fmt(v)}{html.escape(unit)}</text>'
                   f'<text x="{x+bw*0.38:.1f}" y="{H-22}" text-anchor="middle" class="cl">{html.escape(str(l))}</text>')
    return _wrap(title, f'<svg viewBox="0 0 {W} {H}" class="csvg">{"".join(out)}</svg>', note, source)


def line(title, x, series, unit="", note="", source="", ymin=None):
    W, H, L, B = 720, 320, 60, 44
    allv = [v for s in series for v in s["values"] if v is not None]
    lo = min(allv) if ymin is None else ymin
    hi = max(allv)
    if hi == lo:
        hi = lo + 1
    X = lambda i: L + (W - L - 20) * i / max(len(x) - 1, 1)
    Y = lambda v: H - B - (H - B - 20) * (v - lo) / (hi - lo)
    out = []
    span = hi - lo; mag = 10 ** math.floor(math.log10(span / 4)) if span > 0 else 1
    step_y = min((m * mag for m in (1, 2, 2.5, 5, 10) if span / (m * mag) <= 6), default=mag * 10)
    hi = math.ceil(hi / step_y) * step_y; v = math.floor(lo / step_y) * step_y; lo = v
    while v <= hi + 1e-9:
        out.append(f'<line x1="{L}" x2="{W-20}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" class="grid"/><text x="{L-6}" y="{Y(v)+4:.1f}" text-anchor="end" class="cl">{_fmt(round(v, 2))}</text>')
        v += step_y
    step = max(1, len(x) // 8)
    for i in range(0, len(x), step):
        out.append(f'<text x="{X(i):.1f}" y="{H-B+18}" text-anchor="middle" class="cl">{html.escape(str(x[i]))}</text>')
    leg = []
    for j, s in enumerate(series):
        pts = " ".join(f"{X(i):.1f},{Y(v):.1f}" for i, v in enumerate(s["values"]) if v is not None)
        col = s.get("color", PAL[j % len(PAL)])
        out.append(f'<polyline class="ln" points="{pts}" fill="none" stroke="{col}" stroke-width="3" pathLength="1"/>')
        for i, v in enumerate(s["values"]):
            if v is not None and (len(x) <= 24 or i == len(x) - 1):
                out.append(f'<circle class="dot" cx="{X(i):.1f}" cy="{Y(v):.1f}" r="3.5" fill="{col}"><title>{html.escape(str(x[i]))}: {_fmt(v)}{html.escape(unit)}</title></circle>')
        leg.append(f'<span><i style="background:{col}"></i>{html.escape(s["name"])}</span>')
    svg = f'<svg viewBox="0 0 {W} {H}" class="csvg">{"".join(out)}</svg>'
    if len(series) > 1:
        svg += f'<div class="legend">{"".join(leg)}</div>'
    return _wrap(title + (f" ({unit.strip()})" if unit.strip() else ""), svg, note, source)


def donut(title, labels, values, note="", source=""):
    tot = sum(values) or 1
    R, r, cx, cy = 110, 64, 150, 140
    a = -math.pi / 2
    out, leg = [], []
    for i, (l, v) in enumerate(zip(labels, values)):
        da = 2 * math.pi * v / tot
        x1, y1 = cx + R * math.cos(a), cy + R * math.sin(a)
        x2, y2 = cx + R * math.cos(a + da), cy + R * math.sin(a + da)
        xi2, yi2 = cx + r * math.cos(a + da), cy + r * math.sin(a + da)
        xi1, yi1 = cx + r * math.cos(a), cy + r * math.sin(a)
        big = 1 if da > math.pi else 0
        col = PAL[i % len(PAL)]
        if v >= tot:
            out.append(f'<circle cx="{cx}" cy="{cy}" r="{(R+r)/2}" fill="none" stroke="{col}" stroke-width="{R-r}"/>')
        else:
            out.append(f'<path class="seg" style="animation-delay:{i*70}ms" d="M{x1:.1f},{y1:.1f} A{R},{R} 0 {big} 1 {x2:.1f},{y2:.1f} L{xi2:.1f},{yi2:.1f} A{r},{r} 0 {big} 0 {xi1:.1f},{yi1:.1f}Z" fill="{col}"><title>{html.escape(str(l))}: {v}</title></path>')
        leg.append(f'<text x="300" y="{40+i*22}" class="cl"><tspan fill="{col}">■</tspan> {html.escape(str(l))} — {v} ({100*v/tot:.0f}%)</text>')
        a += da
    out.append(f'<text x="{cx}" y="{cy+6}" text-anchor="middle" class="cbig">{tot}</text>')
    H = max(290, 50 + len(labels) * 22)
    return _wrap(title, f'<svg viewBox="0 0 720 {H}" class="csvg">{"".join(out)}{"".join(leg)}</svg>', note, source)


def ranges(title, items, lo_label="", maxv=11000, sqrt=True, unit=" m"):
    """items: list of (label, lo, hi, href). Gantt-style range chart, e.g. depth ranges."""
    W, rowh, lw = 720, 16, 190
    H = len(items) * rowh + 50
    sc = (lambda v: (max(v, 0) / maxv) ** 0.5) if sqrt else (lambda v: max(v, 0) / maxv)
    out = []
    for t in ([0, 200, 1000, 2000, 4000, 6000, 8000, 11000] if maxv == 11000 else [maxv * k / 4 for k in range(5)]):
        x = lw + (W - lw - 20) * sc(t)
        out.append(f'<line x1="{x:.1f}" x2="{x:.1f}" y1="20" y2="{H-10}" class="grid"/><text x="{x:.1f}" y="14" text-anchor="middle" class="cl">{_fmt(t)}</text>')
    for i, (l, lo, hi, href) in enumerate(items):
        y = 26 + i * rowh
        x1 = lw + (W - lw - 20) * sc(lo); x2 = lw + (W - lw - 20) * sc(hi)
        lab = f'<a href="{href}"><text x="{lw-6}" y="{y+11}" text-anchor="end" class="cl sm">{html.escape(l)}</text></a>' if href else f'<text x="{lw-6}" y="{y+11}" text-anchor="end" class="cl sm">{html.escape(l)}</text>'
        out.append(lab + f'<rect class="bar" style="animation-delay:{min(i*15,1500)}ms" x="{x1:.1f}" y="{y+2}" width="{max(x2-x1,3):.1f}" height="{rowh-5}" rx="3" fill="{PAL[0]}"><title>{html.escape(l)}: {lo:,}–{hi:,}{unit}</title></rect>')
    return _wrap(title, f'<svg viewBox="0 0 {W} {H}" class="csvg">{"".join(out)}</svg>', "Square-root depth scale. Hover a bar for exact values." if sqrt else "")


def scatter(title, pts, xlabel, ylabel, logx=False, logy=False, note="", source=""):
    """pts: list of (label, x, y, href)."""
    W, H, L, B = 720, 380, 64, 48
    xs = [p[1] for p in pts if p[1]]; ys = [p[2] for p in pts if p[2]]
    if not xs or not ys:
        return ""
    tx = (lambda v: math.log10(v)) if logx else (lambda v: v)
    ty = (lambda v: math.log10(v)) if logy else (lambda v: v)
    x0, x1 = tx(min(xs)), tx(max(xs)); y0, y1 = ty(min(ys)), ty(max(ys))
    x1 = x1 if x1 > x0 else x0 + 1; y1 = y1 if y1 > y0 else y0 + 1
    X = lambda v: L + (W - L - 20) * (tx(v) - x0) / (x1 - x0)
    Y = lambda v: H - B - (H - B - 20) * (ty(v) - y0) / (y1 - y0)
    out = [f'<line x1="{L}" y1="{H-B}" x2="{W-20}" y2="{H-B}" class="axis"/><line x1="{L}" y1="20" x2="{L}" y2="{H-B}" class="axis"/>',
           f'<text x="{(W+L)/2}" y="{H-10}" text-anchor="middle" class="cl">{html.escape(xlabel)}{" (log)" if logx else ""}</text>',
           f'<text x="16" y="{H/2}" transform="rotate(-90 16 {H/2})" text-anchor="middle" class="cl">{html.escape(ylabel)}{" (log)" if logy else ""}</text>']
    for k in range(5):
        vx = x0 + (x1 - x0) * k / 4; vy = y0 + (y1 - y0) * k / 4
        lx = 10 ** vx if logx else vx; ly = 10 ** vy if logy else vy
        out.append(f'<text x="{X(lx):.1f}" y="{H-B+16}" text-anchor="middle" class="cl sm">{_fmt(round(lx, 3))}</text>'
                   f'<text x="{L-6}" y="{Y(ly)+4:.1f}" text-anchor="end" class="cl sm">{_fmt(round(ly, 3))}</text>')
    for i, (l, x, y, href) in enumerate(pts):
        if not x or not y:
            continue
        c = f'<circle class="dot pop" style="animation-delay:{min(i*20,1200)}ms" cx="{X(x):.1f}" cy="{Y(y):.1f}" r="5" fill="{PAL[i % len(PAL)]}" opacity=".85"><title>{html.escape(l)}: {_fmt(x)}, {_fmt(y)}</title></circle>'
        out.append(f'<a href="{href}">{c}</a>' if href else c)
    return _wrap(title, f'<svg viewBox="0 0 {W} {H}" class="csvg">{"".join(out)}</svg>', note, source)


def render(spec):
    t = spec["type"]
    common = dict(note=spec.get("note", ""), source=spec.get("source", ""))
    if t == "hbar":
        return hbar(spec["title"], spec["labels"], spec["values"], spec.get("unit", ""), log=spec.get("log", False), **common)
    if t == "vbar":
        return vbar(spec["title"], spec["labels"], spec["values"], spec.get("unit", ""), hl=spec.get("hl"), **common)
    if t == "line":
        return line(spec["title"], spec["x"], spec["series"], spec.get("unit", ""), ymin=spec.get("ymin"), **common)
    if t == "donut":
        return donut(spec["title"], spec["labels"], spec["values"], **common)
    return ""

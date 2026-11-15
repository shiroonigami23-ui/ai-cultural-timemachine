// Copies the static history encyclopedia (history/index.html, history/wiki, history/assets)
// into public/history so Next.js serves it at /history/index.html.
const fs = require("fs");
const path = require("path");
const src = path.join(__dirname, "..", "history");
const dest = path.join(__dirname, "..", "public", "history");
if (!fs.existsSync(path.join(src, "index.html"))) {
  console.log("history/index.html not found; run `npm run history:build` first. Skipping copy.");
  process.exit(0);
}
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
for (const item of ["index.html", "wiki", "assets", "prompts.md"]) {
  const s = path.join(src, item);
  if (fs.existsSync(s)) fs.cpSync(s, path.join(dest, item), { recursive: true });
}
console.log("Copied history encyclopedia to public/history");

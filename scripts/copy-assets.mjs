// Copies only the images the site actually references (/assets/...) into the build output,
// instead of shipping the whole attached_assets folder.
import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "dist/public/assets");
const re = /\/assets\/([A-Za-z0-9_./~-]+\.(?:png|jpe?g|webp|svg))/g;
const found = new Set();
const walk = dir => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name))
      for (const m of fs.readFileSync(p, "utf8").matchAll(re)) found.add(m[1]);
  }
};
["server", "shared", "client/src"].forEach(d => walk(path.join(root, d)));
let copied = 0;
for (const rel of found) {
  const from = path.join(root, "attached_assets", rel);
  if (!fs.existsSync(from)) { console.warn("missing asset:", rel); continue; }
  fs.mkdirSync(path.dirname(path.join(out, rel)), { recursive: true });
  fs.copyFileSync(from, path.join(out, rel));
  copied++;
}
console.log(`copied ${copied} referenced assets`);

import fs from "node:fs";
import { read } from "./p2-source.mjs";
const dir = new URL("../", import.meta.url);
const expand = group => {
  const ids = [];
  for (const raw of group.split(",")) {
    const token = raw.replace(/P2L-/g, "").trim();
    const range = /^(\d+)\.\.(\d+)$/.exec(token);
    if (range) for (let n = +range[1]; n <= +range[2]; n++) ids.push(n);
    else if (/^\d+$/.test(token)) ids.push(+token);
  }
  return ids.map(n => "P2L-" + String(n).padStart(3, "0"));
};
/* id -> [{file, title}] built from the "[P2L-...]" tags in test titles of tests/p2-0-*.test.mjs */
export function coverageByTitle() {
  const map = new Map();
  for (const f of fs.readdirSync(dir).filter(f => /^p2-0-.*\.test\.mjs$/.test(f))) {
    const src = read("tests/" + f);
    for (const m of src.matchAll(/test\(\s*(?:`|"|')\[(P2L-[^\]]+)\]([^\n]*)/g)) {
      for (const id of expand(m[1])) { if (!map.has(id)) map.set(id, []); map.get(id).push({ file: f, title: m[2].slice(0, 120) }); }
    }
    for (const m of src.matchAll(/test\("\[" \+ c\.id \+ "\]/g)) { /* per-observer tests are generated; counted via the observer block */ }
  }
  return map;
}

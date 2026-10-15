/* P2-5-0 L2 mutation check (NOT part of `node --test`). Usage: node tests/browser/p2-5-0-l2-mutation-check.mjs <outFile.json> [concurrency=3]
 * For each deliberate production mutation: copy the tree, apply it, run the REAL-browser scenarios in the copy, then require
 * (a) the golden comparison to FAIL, or (b) for `acs3` mutants, the dynamic AC-S3 check to FAIL. The repository under test is never modified. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";

const ROOT = path.resolve(new URL("../../", import.meta.url).pathname);
const NODE = process.execPath;
const M = [
  // [name, file, from, to, mode, check]
  ["OBS-10 editor title text changed", "index.html", 'textContent=editing?"プレーヤー編集":"プレーヤー登録"', 'textContent=editing?"編集":"プレーヤー登録"', "free", "golden"],
  ["OBS-03 setup text changed", "final-ui-build18.js", 'display(2,"対戦相手を追加")', 'display(2,"相手を追加")', "free", "golden"],
  ["OBS-16 badge text changed", "monetization-v1.js", '">🔒 Pro</span>', '">Pro</span>', "free", "golden"],
  ["OBS-16 badge aria changed", "monetization-v1.js", 'aria-label="Pro限定"', 'aria-label="Pro"', "free", "golden"],
  ["OBS-09 mirror stops copying text", "index.html", "const update=()=>{target.textContent=old.textContent;", "const update=()=>{", "free", "golden"],
  ["allow-listed OBS-05 starts rewriting text (dynamic AC-S3 must catch it)", "index.html", "      syncModalAccessibility();\n    });", '      syncModalAccessibility();const t250=document.getElementById("playerLibraryTitle");if(t250&&t250.textContent!=="X250")t250.textContent="X250";\n    });', "free", "acs3"],
  ["OBS-13 stops deleting analysis buttons", "index.html", 'forEach(button=>button.remove());\n  new MutationObserver(addHistoryAnalysisEntriesV5)', 'forEach(button=>button);\n  new MutationObserver(addHistoryAnalysisEntriesV5)', "pro", "golden"],
  ["OBS-23 date rewrite reordered", "ui-revision-v12.js", "date.textContent=`${Number(match[1])}/${Number(match[2])}${match[3]} ${match[4]}`", "date.textContent=`${Number(match[2])}/${Number(match[1])}${match[3]} ${match[4]}`", "pro", "golden"],
  ["OBS-15 predicate shifted", "index.html", 'node.textContent.includes("0上回った")', 'node.textContent.includes("1上回った")', "free", "golden"],
  ["final-rc match wording changed", "analysis-final-rc.js", '"同じでした"', '"同一でした"', "pro", "golden"]
];
const CONC = Number(process.argv[3] || 3);
const results = [];
const run = (cmd, args, cwd) => new Promise(res => { const p = spawn(cmd, args, { cwd, env: { ...process.env, NODE_TEST_CONTEXT: undefined }, stdio: ["ignore", "pipe", "pipe"] }); let out = ""; p.stdout.on("data", d => out += d); p.stderr.on("data", d => out += d); p.on("close", code => res({ code, out })); });
async function one(i) {
  const [name, file, from, to, mode, check] = M[i];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "p250l2-"));
  execFileSync("rsync", ["-a", "--exclude", ".git", "--exclude", "ios", "--exclude", "node_modules", "--exclude", "native-web", "--exclude", "website-archive", "--exclude", "outputs", ROOT + "/", tmp + "/"]);
  const target = path.join(tmp, file), original = fs.readFileSync(target, "utf8");
  const n = original.split(from).length - 1;
  if (n < 1) { results[i] = { name, applied: false, note: "pattern not found" }; fs.rmSync(tmp, { recursive: true, force: true }); return; }
  fs.writeFileSync(target, original.replace(from, to));
  const out = path.join(tmp, "out");
  const r = await run(NODE, [path.join(tmp, "tests/browser/p2-5-0-observer-scenarios.mjs"), out, "ja", mode], tmp);
  const json = path.join(out, `scenarios_ja_${mode}.json`);
  if (!fs.existsSync(json)) { results[i] = { name, applied: true, killed: false, note: "scenario run failed: " + r.out.slice(-200) }; fs.rmSync(tmp, { recursive: true, force: true }); return; }
  const cmp = check === "acs3"
    ? await run(NODE, [path.join(ROOT, "tests/browser/p2-5-0-scenarios-compare.mjs"), json, "--ac-s3"], ROOT)
    : await run(NODE, [path.join(ROOT, "tests/browser/p2-5-0-scenarios-compare.mjs"), json, path.join(ROOT, `tests/fixtures/p2/observer-scenarios/golden_ja_${mode}.json`)], ROOT);
  results[i] = { name, mode, check, applied: true, killed: cmp.code === 1, detail: cmp.out.replace(/\s+/g, " ").slice(0, 300) };
  fs.rmSync(tmp, { recursive: true, force: true });
}
let next = 0; await Promise.all(Array.from({ length: CONC }, async () => { while (next < M.length) await one(next++); }));
const out = { mutations: results.length, applied: results.filter(r => r.applied).length, killed: results.filter(r => r.killed).length, survived: results.filter(r => r.applied && !r.killed).map(r => r.name), notApplied: results.filter(r => !r.applied), results };
fs.writeFileSync(process.argv[2] || "p2-5-0-l2-mutation-results.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify({ mutations: out.mutations, applied: out.applied, killed: out.killed, survived: out.survived, notApplied: out.notApplied }));

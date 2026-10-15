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
  // [name, file, from, to, mode, check]   check: golden | acs3 | fault:<variant>:<rich>:<fixture> | flow:<lang>:<mode>:<fixture>
  ["OBS-10 editor title text changed (opener)", "index.html", 'modalTitle.textContent = player ? "プレーヤー編集" : "プレーヤー登録"', 'modalTitle.textContent = player ? "編集" : "プレーヤー登録"', "free", "golden"],
  ["OBS-03 setup text changed", "final-ui-build18.js", 'display(2,"対戦相手を追加")', 'display(2,"相手を追加")', "free", "golden"],
  ["OBS-16 badge text changed", "monetization-v1.js", '">🔒 Pro</span>', '">Pro</span>', "free", "golden"],
  ["OBS-16 badge aria changed", "monetization-v1.js", 'aria-label="Pro限定"', 'aria-label="Pro"', "free", "golden"],
  ["OBS-09 generation guard removed (mirrors created again)", "index.html", 'if (window.CueScoreFeatureAccess.canUse("cloudSync")) {\n    mirrorStatus(', 'if (true) {\n    mirrorStatus(', "free", "golden"],
  ["allow-listed OBS-05 starts rewriting text (dynamic AC-S3 must catch it)", "index.html", "      syncModalAccessibility();\n    });", '      syncModalAccessibility();const t250=document.getElementById("playerLibraryTitle");if(t250&&t250.textContent!=="X250")t250.textContent="X250";\n    });', "free", "acs3"],
  ["OBS-03 trigger dropped (closePlayerLibrary), setup texts stale", "final-ui-build18.js", '"closePlayerLibrary",', "", "free", "golden"],
  ["journey: reviseHistory never runs (stands for every trigger removed at once)", "ui-revision-v12.js", "  function reviseHistory(){", "  function reviseHistory(){return;", "pro", "journey:ja:journey_ja.json"],
  ["journey: reviseRivals never runs (stands for every trigger removed at once)", "ui-revision-v12.js", "  function reviseRivals(){", "  function reviseRivals(){return;", "pro", "journey:ja:journey_ja.json"],
  ["journey: row date pattern wrong", "ui-revision-v12.js", 'date.textContent=window.cueDate(dt,"md-w-sp-hm")', 'date.textContent=window.cueDate(dt,"md-w-hm")', "pro", "journey:ja:journey_ja.json"],
  ["journey: aria suffix applied twice-style change", "ui-revision-v12.js", 'const detailSuffix="、試合詳細を開く"', 'const detailSuffix="、詳細を開く"', "pro", "journey:ja:journey_ja.json"],
  ["OBS-13 stops deleting analysis buttons", "index.html", 'forEach(button=>button.remove());\n  new MutationObserver(addHistoryAnalysisEntriesV5)', 'forEach(button=>button);\n  new MutationObserver(addHistoryAnalysisEntriesV5)', "pro", "golden"],
  ["journey row date uses the wrong pattern (golden)", "ui-revision-v12.js", 'date.textContent=window.cueDate(dt,"md-w-sp-hm")', 'date.textContent=window.cueDate(dt,"ymd-w-sp-hm")', "pro", "golden"],
  ["final-rc match wording changed", "analysis-final-rc.js", '"同じでした"', '"同一でした"', "pro", "golden"],
  ["OBS-15 generated predicate shifted, final-rc unavailable (fault)", "index.html", 'String(f2-f1).endsWith("0")', 'String(f2-f1).endsWith("1")', "pro", "fault:block-final-rc:0:fault_block-final-rc_0.json"],
  ["OBS-15 high-run quirk lost, final-rc and build4 unavailable (fault)", "index.html", 'String(high2-high1).endsWith("0")', 'high2===high1', "pro", "fault:block-both:0:fault_block-both_0.json"],
  ["OBS-14 explicit step not called, final-rc and build4 unavailable (fault)", "index.html", "    applyPriorGamesGuardV1();\n  }\n", "  }\n", "pro", "fault:block-both:0:fault_block-both_0.json"],
  ["OBS-14 guard acts although final-rc is present (build4 unavailable)", "index.html", "    if(window.CueScoreAnalyticsFinalRC)return;\n    const playerView", "    const playerView", "pro", "fault:block-build4:0:fault_block-build4_0.json"],
  ["OBS-17 title helper stops forcing the Player-tab title", "index.html", 'return document.body.dataset.cuePlayerContext === "browse" ? window.cueT("player.title") : text;', "return text;", "free", "flow:ja:free:flow_ja_free.json"],
  ["OBS-10 save label changed (opener)", "index.html", 'saveButton.textContent = player ? "変更" : "登録"', 'saveButton.textContent = player ? "保存" : "登録"', "pro", "flow:en:pro:flow_en_pro.json"]
];
const CONC = Number(process.argv[3] || 3);
const ONLY = process.env.P2_MUT_ONLY ? new RegExp(process.env.P2_MUT_ONLY) : null; // re-run selected mutants only (e.g. after a load-induced watchdog)
const results = [];
const run = (cmd, args, cwd) => new Promise(res => { const p = spawn(cmd, args, { cwd, env: { ...process.env, NODE_TEST_CONTEXT: undefined }, stdio: ["ignore", "pipe", "pipe"] }); let out = ""; p.stdout.on("data", d => out += d); p.stderr.on("data", d => out += d); p.on("close", code => res({ code, out })); });
async function one(i) {
  const [name, file, from, to, mode, check] = M[i];
  if (ONLY && !ONLY.test(name)) return;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "p250l2-"));
  execFileSync("rsync", ["-a", "--exclude", ".git", "--exclude", "ios", "--exclude", "node_modules", "--exclude", "native-web", "--exclude", "website-archive", "--exclude", "outputs", ROOT + "/", tmp + "/"]);
  const target = path.join(tmp, file), original = fs.readFileSync(target, "utf8");
  const n = original.split(from).length - 1;
  if (n < 1) { results[i] = { name, applied: false, note: "pattern not found" }; fs.rmSync(tmp, { recursive: true, force: true }); return; }
  fs.writeFileSync(target, original.replace(from, to));
  const out = path.join(tmp, "out");
  let cmp;
  if (check.startsWith("fault:") || check.startsWith("flow:") || check.startsWith("journey:")) {
    const parts = check.split(":"); const file = path.join(out, "x.json");
    fs.mkdirSync(out, { recursive: true });
    const script = check.startsWith("fault:") ? ["tests/browser/p2-5a-1-fault-scenarios.mjs", file, parts[1], parts[2]] : check.startsWith("journey:") ? ["tests/browser/p2-5b-journey-flows.mjs", file, parts[1]] : ["tests/browser/p2-5a-1-flow-scenarios.mjs", file, parts[1], parts[2]];
    const fixture = check.startsWith("journey:") ? parts[2] : parts[3];
    const r = await run(NODE, [path.join(tmp, script[0]), ...script.slice(1)], tmp);
    if (!fs.existsSync(file)) { results[i] = { name, applied: true, killed: false, note: "run failed: " + r.out.slice(-200) }; fs.rmSync(tmp, { recursive: true, force: true }); return; }
    const expected = JSON.parse(fs.readFileSync(path.join(ROOT, "tests/fixtures/p2/observer-scenarios", fixture), "utf8")), got = JSON.parse(fs.readFileSync(file, "utf8"));
    cmp = { code: JSON.stringify(expected) === JSON.stringify(got) ? 0 : 1, out: "fixture " + fixture + (JSON.stringify(expected) === JSON.stringify(got) ? " identical" : " differs") };
  } else {
  const r = await run(NODE, [path.join(tmp, "tests/browser/p2-5-0-observer-scenarios.mjs"), out, "ja", mode], tmp);
  const json = path.join(out, `scenarios_ja_${mode}.json`);
  if (!fs.existsSync(json)) { results[i] = { name, applied: true, killed: false, note: "scenario run failed: " + r.out.slice(-200) }; fs.rmSync(tmp, { recursive: true, force: true }); return; }
  cmp = check === "acs3"
    ? await run(NODE, [path.join(ROOT, "tests/browser/p2-5-0-scenarios-compare.mjs"), json, "--ac-s3"], ROOT)
    : await run(NODE, [path.join(ROOT, "tests/browser/p2-5-0-scenarios-compare.mjs"), json, path.join(ROOT, `tests/fixtures/p2/observer-scenarios/golden_ja_${mode}.json`)], ROOT);
  }
  results[i] = { name, mode, check, applied: true, killed: cmp.code === 1, detail: cmp.out.replace(/\s+/g, " ").slice(0, 300) };
  fs.rmSync(tmp, { recursive: true, force: true });
}
let next = 0; await Promise.all(Array.from({ length: CONC }, async () => { while (next < M.length) await one(next++); }));
const done = results.filter(Boolean);
const out = { mutations: done.length, applied: done.filter(r => r.applied).length, killed: done.filter(r => r.killed).length, survived: done.filter(r => r.applied && !r.killed).map(r => r.name), notApplied: done.filter(r => !r.applied), results: done };
fs.writeFileSync(process.argv[2] || "p2-5-0-l2-mutation-results.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify({ mutations: out.mutations, applied: out.applied, killed: out.killed, survived: out.survived, notApplied: out.notApplied }));

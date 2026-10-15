/* P2-5-0 mutation check (NOT part of `node --test`). Usage: node tests/browser/p2-5-0-mutation-check.mjs <outFile.json>
 * Copies the working tree to a temp dir, applies ONE deliberate abnormal-value mutation at a time to PRODUCTION sources and requires the
 * P2-5-0 observer tests (L0 static AC-S3 + L1 characterization) to FAIL. The repository under test is never modified. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync, execFileSync } from "node:child_process";

const ROOT = path.resolve(new URL("../../", import.meta.url).pathname);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "p250mut-"));
execFileSync("rsync", ["-a", "--exclude", ".git", "--exclude", "ios", "--exclude", "node_modules", "--exclude", "native-web", "--exclude", "website-archive", "--exclude", "outputs", ROOT + "/", TMP + "/"]);
const M = [
  /* registration / allow-list integrity */
  ["a 24th MutationObserver is registered", "player-detail-build6.js", "const dateValue=", "new MutationObserver(()=>{});const dateValue="],
  ["a MutationObserver alias is introduced", "monetization-v1.js", "const badge=()=>", "const MO250=MutationObserver;const badge=()=>"],
  ["allow-listed observer (shell reconcile) gains a text write", "navigation-shell-phase1.js", "reconcileQueued=true;", 'reconcileQueued=true;document.title="x";document.getElementById("playerLibraryTitle").textContent="x";'],
  ["allow-listed observer (modal sync) gains innerHTML write", "index.html", "const scheduleModalSyncV148 = () => {", 'const scheduleModalSyncV148 = () => { document.body.innerHTML += "";'],
  ["new observer reaches cueT", "navigation-shell-phase1.js", "reconcileQueued=true;", 'reconcileQueued=true;window.cueT("x");'],
  ["a text-writing observer is made structural (OBS-17 write removed)", "navigation-phase2-6.js", "rootTitle.textContent=window.cueT(\"player.title\");", ""],
  ["a display-text comparison is added (AC-S2 ratchet)", "index.html", 'if(node.textContent.includes("0回少なく抑えた"))', 'if(node.textContent.includes("1回少なく抑えた"))node.textContent="x";if(node.textContent.includes("0回少なく抑えた"))'],
  /* OBS-15 correct */
  ["OBS-15 predicate shifted (fouls)", "index.html", 'node.textContent.includes("0回少なく抑えた")', 'node.textContent.includes("1回少なく抑えた")'],
  ["OBS-15 quirk 'fixed' (endsWith instead of includes)", "index.html", 'node.textContent.includes("0上回った")', 'node.textContent.endsWith("を0上回った")'],
  ["OBS-15 output wording changed (fouls)", "index.html", 'node.textContent="ファール数は相手と同じ"', 'node.textContent="ファール数は同じ"'],
  ["OBS-15 output wording changed (high run)", "index.html", 'node.textContent="ハイランは相手と同じ"', 'node.textContent="ハイランは同じ"'],
  ["OBS-15 observer options widened", "index.html", "new MutationObserver(correct).observe(root,{childList:true,subtree:true});", "new MutationObserver(correct).observe(root,{childList:true,subtree:true,characterData:true});"],
  /* OBS-14 enforce */
  ["OBS-14 FinalRC guard removed", "index.html", "    if(window.CueScoreAnalyticsFinalRC)return;\n    const playerView", "    const playerView"],
  ["OBS-14 threshold changed", "index.html", "Number(priorGames)>=3)return;\n    if(playerView.querySelector", "Number(priorGames)>=2)return;\n    if(playerView.querySelector"],
  ["OBS-14 accumulating text changed", "index.html", 'status.textContent="蓄積中"', 'status.textContent="蓄積"'],
  ["analysis-final-rc stops publishing its global", "analysis-final-rc.js", "window.CueScoreAnalyticsFinalRC =", "window.CueScoreAnalyticsFinalRC_x ="],
  /* OBS-09 mirror / cloud gate */
  ["OBS-09 mirror copies the wrong class", "index.html", 'old.classList.contains("error")?" error"', 'old.classList.contains("error")?" err"'],
  ["OBS-09 mirror options changed", "index.html", "observe(old,{childList:true,subtree:true,characterData:true,attributes:true})", "observe(old,{childList:true,subtree:true})"],
  ["Cloud Sync feature flag enabled (Free)", "index.html", "cloudSync:false,", "cloudSync:true,"],
  ["setView cloud guard removed", "index.html", 'if (view === "cloud" && !window.CueScoreFeatureAccess.canUse("cloudSync")) return;', ""],
  ["cloud IIFE guard removed", "index.html", 'if (!window.CueScoreFeatureAccess.canUse("cloudSync")) return;\n    const SUPABASE_CONFIG_KEY', 'const SUPABASE_CONFIG_KEY'],
  ["cloud source status node gets static text", "index.html", 'id="cloudSyncStatus" role="status" aria-live="polite"></div>', 'id="cloudSyncStatus" role="status" aria-live="polite">x</div>'],
  /* OBS-19 / OBS-13 */
  ["OBS-13 analysis-button removal dropped", "index.html", 'forEach(button=>button.remove());\n  new MutationObserver(addHistoryAnalysisEntriesV5)', 'forEach(button=>button);\n  new MutationObserver(addHistoryAnalysisEntriesV5)'],
  ["OBS-19 detail label changed", "player-detail-build6.js", 'detail.textContent="詳細"', 'detail.textContent="詳しく"'],
  ["OBS-19 analysis label changed", "player-detail-build6.js", 'analysis.textContent="分析"', 'analysis.textContent="分析す"'],
  ["OBS-19 stops hiding the analysis button", "player-detail-build6.js", "analysis.hidden=true;", ""],
  ["OBS-19 idempotence guard removed", "player-detail-build6.js", 'if(row.closest(".pd8-history-match"))return;', ""],
  /* OBS-23 date regex */
  ["OBS-23 date regex widened (3 digits)", "ui-revision-v12.js", "\\d{4}\\/(\\d{2})\\/(\\d{2})", "\\d{4}\\/(\\d{3})\\/(\\d{2})"],
  ["OBS-23 date output reordered", "ui-revision-v12.js", "date.textContent=`${Number(match[1])}/${Number(match[2])}${match[3]} ${match[4]}`", "date.textContent=`${Number(match[2])}/${Number(match[1])}${match[3]} ${match[4]}`"],
  ["OBS-23 date weekday group removed", "ui-revision-v12.js", "(（.）)", "(（..）)"],
  /* existing source-pin protection stays */
  ["existing test weakened (comment added)", "tests/analysis-v2.test.mjs", "import", "// weakened\nimport"]
];
const results = [];
for (const [name, file, from, to] of M) {
  const target = path.join(TMP, file); const original = fs.readFileSync(path.join(ROOT, file), "utf8");
  const n = original.split(from).length - 1;
  if (n < 1) { results.push({ name, file, applied: false, note: `pattern not found (${n})` }); continue; }
  fs.writeFileSync(target, original.replace(from, to));
  const files = fs.readdirSync(path.join(TMP, "tests")).filter(f => /^p2-(0-l0-static|5-0-.*)\.test\.mjs$/.test(f)).map(f => "tests/" + f);
  const r = spawnSync(process.execPath, ["--test", "--test-skip-pattern=L0 anchor", ...files], { cwd: TMP, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  const failed = [...r.stdout.matchAll(/^✖ (\[[^\n]*?)(?: \(\d)/gm)].map(m => m[1].slice(0, 90)).filter((v, i, a) => a.indexOf(v) === i);
  results.push({ name, file, applied: true, killed: r.status !== 0, failingTests: failed.slice(0, 3), failingCount: failed.length });
  fs.writeFileSync(target, original);
}
const out = { mutations: results.length, applied: results.filter(r => r.applied).length, killed: results.filter(r => r.killed).length, survived: results.filter(r => r.applied && !r.killed).map(r => r.name), notApplied: results.filter(r => !r.applied), results };
fs.writeFileSync(process.argv[2] || "p2-5-0-mutation-results.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify({ mutations: out.mutations, applied: out.applied, killed: out.killed, survived: out.survived, notApplied: out.notApplied }));
fs.rmSync(TMP, { recursive: true, force: true });

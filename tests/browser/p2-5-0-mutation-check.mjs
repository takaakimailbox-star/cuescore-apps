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
  ["OBS-17 observer reintroduces a title text write (cueT)", "navigation-phase2-6.js", "if(register)register.hidden=true;", 'if(register)register.hidden=true;document.getElementById("playerLibraryTitle").textContent=window.cueT("player.title");'],
  ["OBS-10 observer reintroduces an editor text write", "index.html", "    playerOverlay.classList.add(\"player-management-formal-v1\");", "    playerOverlay.classList.add(\"player-management-formal-v1\");document.getElementById(\"playerEditorModalTitleV1\").textContent=\"x\";"],
  ["a display-text comparison is added (AC-S2 ratchet)", "index.html", "if(!playerView)return;\n    const priorGames", "if(!playerView||playerView.textContent.includes(\"蓄積\"))return;\n    const priorGames"],
  /* OBS-15 generated wording (P2-5a-1) */
  ["OBS-15 generated predicate shifted (fouls)", "index.html", 'String(f2-f1).endsWith("0")', 'String(f2-f1).endsWith("1")'],
  ["OBS-15 quirk 'fixed' (numeric zero test instead of last digit)", "index.html", 'String(f2-f1).endsWith("0")', '(f2-f1)===0'],
  ["OBS-15 high-run opponent branch loses the quirk", "index.html", 'String(high2-high1).endsWith("0")', 'high2===high1'],
  ["OBS-15 high-run player branch loses the quirk", "index.html", 'String(high1-high2).endsWith("0")', 'high1===high2'],
  ["OBS-15 output wording changed (fouls)", "index.html", '"ファール数は相手と同じ":`ファールを相手より', '"ファール数は同じ":`ファールを相手より'],
  ["OBS-15 output wording changed (high run)", "index.html", '"ハイランは相手と同じ":`ハイランで相手を', '"ハイランは同じ":`ハイランで相手を'],
  ["wording guard observer re-introduced", "index.html", "function applyPriorGamesGuardV1(){", "new MutationObserver(correct250).observe(document.body,{childList:true});function applyPriorGamesGuardV1(){"],
  ["OBS-14 explicit step no longer called", "index.html", "    applyPriorGamesGuardV1();\n  }\n", "  }\n"],
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
  ["OBS-09 generation guard removed", "index.html", 'if (window.CueScoreFeatureAccess.canUse("cloudSync")) {\n    mirrorStatus(', 'if (true) {\n    mirrorStatus('],
  ["OBS-09 fourth mirror outside the guard", "index.html", '  // P2 OBS-09: the status sources', '  mirrorStatus("cloudSyncStatus","#suiteSyncStatus");\n  // P2 OBS-09: the status sources'],
  ["OBS-03 observer re-introduced", "final-ui-build18.js", "const refreshSoon=()=>requestAnimationFrame(refresh);", "new MutationObserver(()=>requestAnimationFrame(refresh)).observe(document.body,{childList:true});const refreshSoon=()=>requestAnimationFrame(refresh);"],
  ["OBS-03 trigger wrapper dropped (closePlayerLibrary)", "final-ui-build18.js", '"closePlayerLibrary",', ""],
  ["OBS-03 overlay events narrowed", "final-ui-build18.js", '["click","input","change"]', '["click"]'],
  ["OBS-03 navigation hook dropped", "navigation-shell-phase1.js", "window.CueScoreBuild18PlayerSelection?.refreshSoon?.();};", "};"],
  ["OBS-03 new selection writer added", "index.html", "    selectedRegisteredPlayer[playerLibraryTarget] = id;", "    selectedRegisteredPlayer[playerLibraryTarget] = id; selectedRegisteredPlayer[3-playerLibraryTarget] = selectedRegisteredPlayer[3-playerLibraryTarget];"],
  /* P2-6 date formatter */
  ["date pattern ymd-hm loses zero padding", "i18n-v1.js", '"ymd-hm":"YYYY/MM/DD HH:mm"', '"ymd-hm":"YYYY/M/D HH:mm"'],
  ["date pattern md gains padding", "i18n-v1.js", '"md":"M/D"', '"md":"MM/DD"'],
  ["weekday table reordered", "i18n-v1.js", '["日","月","火","水","木","金","土"]', '["月","火","水","木","金","土","日"]'],
  ["date token H padded", "i18n-v1.js", 'case "H":return String(date.getHours());', 'case "H":return two(date.getHours());'],
  ["invalid date special-cased again", "i18n-v1.js", '// No special case for an invalid Date', 'if(Number.isNaN(date.getTime()))return "";// No special case for an invalid Date'],
  ["date coerced from strings again", "i18n-v1.js", 'const date=value; //', 'const date=value instanceof Date?value:new Date(value); //'],
  ["history card uses the wrong pattern", "index.html", 'window.cueDate(dt,"ymd-w-sp-hm")', 'window.cueDate(dt,"ymd-w-hm")'],
  ["home preview uses the wrong pattern", "index.html", 'dateText=Number.isNaN(date.getTime())?window.cueT("p3.6b344146"):window.cueDate(date,"ymd");', 'dateText=Number.isNaN(date.getTime())?window.cueT("p3.6b344146"):window.cueDate(date,"ymd-hm");'],
  ["CSV date format changed", "index.html", "const dateText = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;", "const dateText = `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;"],
  ["an inline weekday array returns", "index.html", "function fmtDate(d,short=false){", 'const WD250=["日","月","火","水","木","金","土"];function fmtDate(d,short=false){'],
  /* Phase F P2-7 parity */
  ["match-sharing validation altered", "match-sharing-validation-v1.js", "toLocaleLowerCase(", "toLocaleLowerCase( "],
  ["backup payload producer altered", "index.html", "function makeBackupPayload()", "function makeBackupPayload( )"],
  ["CSV date producer altered", "index.html", "function formatCsvDateParts(", "function formatCsvDateParts( "],
  ["golden file edited", "tests/fixtures/p2/golden/analytics-coach.json", "[", "[ "],
  /* Phase E-2 OBS-01 / OBS-02 */
  ["build4 observer re-added", "analysis-build4.js", "queueMicrotask(render);", "new MutationObserver(()=>queueMicrotask(render)).observe(view,{childList:true});queueMicrotask(render);"],
  ["final-rc observer re-added", "analysis-final-rc.js", "  api.apply = apply;", "  new MutationObserver(()=>apply()).observe(root,{childList:true,subtree:true});\n  api.apply = apply;"],
  ["final-rc apply not published", "analysis-final-rc.js", "  api.apply = apply;", ""],
  ["openPlayer does not run the step", "index.html", 'setView("player");runAnalysisPostRenderV1()}', 'setView("player")}'],
  ["openMatch does not run the step", "index.html", 'setView("match");runAnalysisPostRenderV1()}', 'setView("match")}'],
  ["select change does not run the step (player)", "index.html", 'selectedPlayerId=event.target.value;renderPlayerWithDisciplineMetrics();runAnalysisPostRenderV1()}', 'selectedPlayerId=event.target.value;renderPlayerWithDisciplineMetrics()}'],
  ["step order changed (render first)", "index.html", "finalRc?.apply?.();build4?.render?.();finalRc?.apply?.();}", "build4?.render?.();finalRc?.apply?.();finalRc?.apply?.();}"],
  ["step runs before the view is visible", "index.html", 'function openPlayer(){renderPlayerWithDisciplineMetrics();setView("player");runAnalysisPostRenderV1()}', 'function openPlayer(){renderPlayerWithDisciplineMetrics();runAnalysisPostRenderV1();setView("player")}'],
  /* Phase E OBS-16 */
  ["badge observer re-added", "monetization-v1.js", "  syncSettingsPlan();decorate();", "  new MutationObserver(()=>requestAnimationFrame(decorate)).observe(document.body,{subtree:true,childList:true});syncSettingsPlan();decorate();"],
  ["hub render decorate call dropped", "navigation-phase2-6.js", "\n    window.CueScorePro?.decorate?.();\n  }", "\n  }"],
  ["legacy detail decorate call dropped", "player-detail-build6.js", "renderInfo(player);window.CueScorePro?.decorate?.();}", "renderInfo(player);}"],
  ["decorate not published", "monetization-v1.js", "source:()=>currentSource,decorate});", "source:()=>currentSource});"],
  ["a new emitter of decorated hosts appears", "ui-revision-v12.js", "  const time=record=>", '  const emit250=`<div class="hub-bests-v2"></div>`;innerHTML250=emit250;\n  const time=record=>'],
  /* Phase D journey */
  ["journey observer re-added in ui-revision", "ui-revision-v12.js", "  const history=document.getElementById(\"playerMatchHistoryV2\");", "  const history=document.getElementById(\"playerMatchHistoryV2\");if(history)new MutationObserver(()=>requestAnimationFrame(reviseHistory)).observe(history,{childList:true});"],
  ["history-row compaction observer re-added", "player-detail-build6.js", "  let returnFromEditor=false;", "  if(historyRoot)new MutationObserver(()=>{}).observe(historyRoot,{childList:true});\n  let returnFromEditor=false;"],
  ["renderHistory no longer revises", "index.html", "${window.cueT(\"p3.9fa9885d\")}</div>`}`;window.CueScoreUiRevisionV12?.reviseHistory?.();}", "${window.cueT(\"p3.9fa9885d\")}</div>`}`;}"],
  ["show() no longer revises", "index.html", "if(root===historyRoot)window.CueScoreUiRevisionV12?.reviseHistory?.();else if(root===rivalRoot)window.CueScoreUiRevisionV12?.reviseRivals?.();}", "}"],
  ["displayed date parsed again", "ui-revision-v12.js", 'const dt=recordTime(row.dataset.playerRecordId);', 'const dt=recordTime(row.dataset.playerRecordId);date.textContent.match(/\\d{4}\\/(\\d{2})\\/(\\d{2})(（.）)\\s+(\\d{2}:\\d{2})/);'],
  ["record date fallback chain shortened", "ui-revision-v12.js", "new Date(record.endedAt||record.playedAt||record.startedAt||0):null;};", "new Date(record.endedAt||0):null;};"],
  ["an analysis-button emitter appears", "index.html", "const addHistoryAnalysisEntriesV5=()=>", 'const emit250=`<button data-player-analysis-record-id="x"></button>`;const addHistoryAnalysisEntriesV5=()=>'],
  /* OBS-19 / OBS-13 */
  ["OBS-13 analysis-button removal dropped", "index.html", 'forEach(button=>button.remove());\n  new MutationObserver(addHistoryAnalysisEntriesV5)', 'forEach(button=>button);\n  new MutationObserver(addHistoryAnalysisEntriesV5)'],
  /* OBS-23 date regex */
  /* P2-5a-1 formalization audit */
  ["guard gets a second call site", "index.html", 'function openHome(){renderHome();', 'function openHome(){applyPriorGamesGuardV1();renderHome();'],
  ["player view becomes visible without a render", "index.html", 'function openMatch(){renderMatchForViewerV5();setView("match");runAnalysisPostRenderV1()}', 'function openMatch(){renderMatchForViewerV5();setView("match");setView("player");runAnalysisPostRenderV1()}'],
  ["wording generator reads rendered text", "index.html", 'const points=[shot1||shot2?', 'const points=[(viewNode("match").textContent,0)||shot1||shot2?'],
  ["wording generator becomes stateful", "index.html", 'const points=[shot1||shot2?', 'const points=[(window.__pts=(window.__pts||0)+1)&&shot1||shot2?'],
  /* existing source-pin protection stays */
  ["existing test weakened (comment added)", "tests/analysis-v2.test.mjs", "import", "// weakened\nimport"]
];
const results = [];
for (const [name, file, from, to] of M) {
  const target = path.join(TMP, file); const original = fs.readFileSync(path.join(ROOT, file), "utf8");
  const n = original.split(from).length - 1;
  if (n < 1) { results.push({ name, file, applied: false, note: `pattern not found (${n})` }); continue; }
  fs.writeFileSync(target, original.replace(from, to));
  const files = fs.readdirSync(path.join(TMP, "tests")).filter(f => /^p2-(0-l0-static|5-[0-9]-.*|6-.*|7-.*)\.test\.mjs$/.test(f)).map(f => "tests/" + f);
  const r = spawnSync(process.execPath, ["--test", "--test-skip-pattern=L0 anchor", ...files], { cwd: TMP, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  const failed = [...r.stdout.matchAll(/^✖ (\[[^\n]*?)(?: \(\d)/gm)].map(m => m[1].slice(0, 90)).filter((v, i, a) => a.indexOf(v) === i);
  results.push({ name, file, applied: true, killed: r.status !== 0, failingTests: failed.slice(0, 3), failingCount: failed.length });
  fs.writeFileSync(target, original);
}
const out = { mutations: results.length, applied: results.filter(r => r.applied).length, killed: results.filter(r => r.killed).length, survived: results.filter(r => r.applied && !r.killed).map(r => r.name), notApplied: results.filter(r => !r.applied), results };
fs.writeFileSync(process.argv[2] || "p2-5-0-mutation-results.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify({ mutations: out.mutations, applied: out.applied, killed: out.killed, survived: out.survived, notApplied: out.notApplied }));
fs.rmSync(TMP, { recursive: true, force: true });

/* P2-0 mutation check (NOT part of `node --test`). Usage: node tests/browser/p2-mutation-check.mjs <outFile.json>
 * Copies the working tree to a temp dir, applies one deliberate "abnormal value" mutation at a time and requires the P2-0 tests to FAIL.
 * The repository under test is never modified. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync, execFileSync } from "node:child_process";

const ROOT = path.resolve(new URL("../../", import.meta.url).pathname);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "p2mut-"));
execFileSync("rsync", ["-a", "--exclude", ".git", "--exclude", "ios", "--exclude", "node_modules", "--exclude", "native-web", "--exclude", "website-archive", "--exclude", "outputs", ROOT + "/", TMP + "/"]);
const M = [
  ["resultLabel Domain constant changed (スクラッチ)", "domain-constants-v1.js", 'SCRATCH:"スクラッチ"', 'SCRATCH:"スクラッチ！"'],
  ["resultLabel Domain constant changed (無得点)", "domain-constants-v1.js", 'NO_SCORE:"無得点"', 'NO_SCORE:"無得点x"'],
  ["resultLabel producer priority changed", "index.html", 'decision.preBreakFoul ? CueScoreDomainV1.RESULT_LABELS.PRE_BREAK_FOUL : decision.scratch', 'decision.scratch ? CueScoreDomainV1.RESULT_LABELS.SCRATCH : decision.preBreakFoul'],
  ["consumer list: drop 2個 (13091)", "index.html", "[CueScoreDomainV1.RESULT_LABELS.ONE,CueScoreDomainV1.RESULT_LABELS.TWO,CueScoreDomainV1.RESULT_LABELS.TWO_OR_MORE,CueScoreDomainV1.RESULT_LABELS.THREE_OR_MORE].includes(", "[CueScoreDomainV1.RESULT_LABELS.ONE,CueScoreDomainV1.RESULT_LABELS.TWO_OR_MORE,CueScoreDomainV1.RESULT_LABELS.THREE_OR_MORE].includes("],
  ["consumer lists unified (16580 gains 2個)", "index.html", "[CueScoreDomainV1.RESULT_LABELS.ONE,CueScoreDomainV1.RESULT_LABELS.TWO_OR_MORE].includes(", "[CueScoreDomainV1.RESULT_LABELS.ONE,CueScoreDomainV1.RESULT_LABELS.TWO,CueScoreDomainV1.RESULT_LABELS.TWO_OR_MORE].includes("],
  ["Mapper maps 2個 to the wrong key", "i18n-v1.js", '"2個":"mapper.resultLabel.two"', '"2個":"mapper.resultLabel.twoOrMore"'],
  ["final-RC state code mapping changed", "analysis-final-rc.js", 'else if (worsened >= 2 && improved === 0) statusCode = "attention";', 'else if (worsened >= 2 && improved === 1) statusCode = "attention";'],
  ["trend threshold 2 -> 3 (rate kind)", "index.html", "Math.max(isRate ? 2 : 0.3, scale * 0.04)", "Math.max(isRate ? 3 : 0.3, scale * 0.04)"],
  ["trend threshold reverts to label text", "index.html", "Math.max(isRate ? 2 : 0.3, scale * 0.04)", 'Math.max(label.includes("率") ? 2 : 0.3, scale * 0.04)'],
  ["win-rate chart loses isRate", "index.html", 'label: "勝率", lowerIsBetter: false, suffix: "%", isRate: true', 'label: "勝率", lowerIsBetter: false, suffix: "%"'],
  ["coach threshold 60 -> 61", "index.html", "(s.winRate||0)>=60", "(s.winRate||0)>=61"],
  ["new MutationObserver added", "player-detail-build6.js", "const dateValue=", "new MutationObserver(()=>{});const dateValue="],
  ["ja collation replaced at one site", "index.html", 'a.name.localeCompare(b.name, CueScoreDomainV1.SORT_LOCALE));', 'a.name.localeCompare(b.name, "en"));'],
  ["identity unified with NFKC at one site", "index.html", 'const name = String(player.name || "").trim().toLocaleLowerCase(CueScoreDomainV1.IDENTITY_LOCALE);', 'const name = String(player.name || "").normalize("NFKC").trim().toLocaleLowerCase(CueScoreDomainV1.IDENTITY_LOCALE);'],
  ["IDENTITY_LOCALE changed", "domain-constants-v1.js", 'const IDENTITY_LOCALE="ja";', 'const IDENTITY_LOCALE="tr";'],
  ["SORT_LOCALE changed", "domain-constants-v1.js", 'const SORT_LOCALE="ja";', 'const SORT_LOCALE="en";'],
  ["reserved category list loses Free", "domain-constants-v1.js", "[FREE_CATEGORY.name,...LEGACY_REMOVED_CATEGORY_NAMES]", "[...LEGACY_REMOVED_CATEGORY_NAMES]"],
  ["Domain script tag removed from index.html", "index.html", '  <script src="./domain-constants-v1.js"></script>\n', ""],
  ["Domain asset dropped from Service Worker precache", "sw.js", '  "./domain-constants-v1.js",\n', ""],
  ["Domain asset dropped from native bundle", "scripts/build-native-web.mjs", '  "domain-constants-v1.js",\n', ""],
  ["consumer reads Domain with wrong locale (record-access)", "record-access-v1.js", "domain.SORT_LOCALE,{numeric:true}", '"en",{numeric:true}'],
  ["literal comparison re-introduced in index.html", "index.html", "=== CueScoreDomainV1.RESULT_LABELS.NO_SCORE).length", '=== "無得点").length'],
  ["Mapper loses the 2個 entry", "i18n-v1.js", '"2個":"mapper.resultLabel.two",', ""],
  ["Mapper loses the 記録なし entry", "i18n-v1.js", ',"記録なし":"mapper.resultLabel.skipped"', ""],
  ["en catalog shows the canonical value for 2個", "i18n-catalog-en-v1.js", '"mapper.resultLabel.two": "2 balls",', '"mapper.resultLabel.two": "2個",'],
  ["ja catalog changes a canonical display value", "i18n-catalog-ja-v1.js", '"mapper.resultLabel.skipped": "記録なし",', '"mapper.resultLabel.skipped": "記録無し",'],
  ["display site bypasses the Mapper", "index.html", 'window.cueResultLabel(e.resultLabel || e.result || window.cueT("p3.fe7cf641"))', '(e.resultLabel || e.result || window.cueT("p3.fe7cf641"))'],
  ["Display Mapper leaks into the stored producer", "index.html", "CueScoreDomainV1.pocketedLabel(decision.pocketedBalls.length)", "window.cueResultLabel(CueScoreDomainV1.pocketedLabel(decision.pocketedBalls.length))"],
  ["Domain SKIPPED value changed", "domain-constants-v1.js", 'SKIPPED:"記録なし"', 'SKIPPED:"記録無し"'],
  ["quota: legacy Japanese-message alternative dropped", "index.html", "/quota|storage quota|保存容量が不足/i.test(", "/quota|storage quota/i.test("],
  ["quota: English branch dropped", "index.html", "/quota|storage quota|保存容量が不足/i.test(", "/storage quota|保存容量が不足/i.test("],
  ["quota: Japanese phrase altered", "index.html", "保存容量が不足/i.test(", "保存容量不足/i.test("],
  ["quota: cause chain dropped", "index.html", "currentError = currentError.cause;", "currentError = null;"],
  ["quota: code 22 dropped", "index.html", "currentError.code === 22 ||", ""],
  ["re-rack notice kind ignored", "index.html", 'notice.kind==="rerack"', 'notice.kind==="x"'],
  ["re-rack call loses its kind", "index.html", 'null, "rerack");', 'null);'],
  ["stale recovery flag value changed", "index.html", "button.dataset.saving === '1'", "button.dataset.saving === '0'"],
  ["editor flag always true", "index.html", "playerEditorIsEditingV1 = Boolean(player);", "playerEditorIsEditingV1 = true;"],
  ["analysis-v2 guard threshold changed", "index.html", "Number(priorGames)>=3", "Number(priorGames)>=2"],
  ["analysis-v2 renderer loses prior-games attribute", "index.html", ' data-prior-games="${before.games}"', ""],
  ["analysis-v2 guard state marker dropped", "index.html", 'status.dataset.analysisState="accumulating";', ""],
  ["best-card kind changed", "ui-revision-v12.js", 'card.dataset.pd7BestKey==="score"', 'card.dataset.pd7BestKey==="highRun"'],
  ["best-card attribute dropped", "player-detail-build6.js", ' data-pd7-best-key="${esc(best.key)}"', ""],
  ["title comparison re-introduced", "navigation-shell-phase1.js", "// P2-4: the former title text comparison was removed.", 'const title=document.getElementById("playerLibraryTitle");if(title?.textContent==="プレーヤー一覧")title.textContent="x"; //'],
  ["Backup schemaVersion 2 -> 3", "index.html", "const BACKUP_SCHEMA_VERSION = 2;", "const BACKUP_SCHEMA_VERSION = 3;"],
  ["Backup format renamed", "index.html", 'const BACKUP_FORMAT = "cuescore-apps-backup";', 'const BACKUP_FORMAT = "cuescore-apps-backup2";'],
  ["Backup file name changed", "index.html", "CueScore_Apps_v1.0_Backup_", "CueScore_Apps_v1.1_Backup_"],
  ["CSV header renamed", "index.html", '"試合ID", "試合日"', '"試合Id", "試合日"'],
  ["date format: month padding removed (P2-6: the pattern table in i18n-v1.js; was the hand-built formatter in index.html)", "i18n-v1.js", '"ymd-hm":"YYYY/MM/DD HH:mm"', '"ymd-hm":"YYYY/M/DD HH:mm"'],
  ["QR allow-list loses resultLabel", "match-sharing-adapters-v1.js", '["breakPlayer","resultLabel",', '["breakPlayer",'],
  ["default category renamed", "domain-constants-v1.js", 'TOURNAMENT:Object.freeze({id:"category_tournament",name:"大会"})', 'TOURNAMENT:Object.freeze({id:"category_tournament",name:"大会 "})'],
  ["IAP product id changed", "monetization-v1.js", "com.takaakimailboxstar.cuescoreapps.pro", "com.takaakimailboxstar.cuescoreapps.pro2"],
  ["Free record limit 20 -> 21", "record-access-v1.js", "const FREE_LIMIT=20;", "const FREE_LIMIT=21;"],
  ["quota detection regex changed", "index.html", "保存容量が不足", "保存容量不足"],
  ["existing test weakened (comment added)", "tests/analysis-v2.test.mjs", "import", "// weakened\nimport"],
  ["hub status code mapping changed (phase2-6)", "navigation-phase2-6.js", 'current.winRate>previous.winRate?"improving"', 'current.winRate>=previous.winRate?"improving"'],
  ["overlay status code mapping changed (build4)", "analysis-build4.js", 'previous.games<3?"stable"', 'previous.games<2?"stable"'],
  ["highlight flag dropped for masuwari", "analysis-final-rc.js", 'new Set(["masuwari"])', "new Set([])"],
  ["highlight flag dropped for fouls", "analysis-final-rc.js", 'new Set(["shotRate", "highRun", "average", "avgFouls"])', 'new Set(["shotRate", "highRun", "average"])'],
  ["rating order swapped", "index.html", "Object.freeze(['shot','scoring','run','stability','finish'])", "Object.freeze(['shot','scoring','run','finish','stability'])"],
  ["coach tone rule changed", "index.html", "else if(growth?.ready && downs>=3 && downs>ups){tone='alert';}", "else if(growth?.ready && downs>=2 && downs>ups){tone='alert';}"],
  ["growth status code threshold changed", "index.html", "score>=2?'improving'", "score>=3?'improving'"],
  ["final-RC badge class reads text again", "analysis-final-rc.js", 'result.statusCode === "attention")', 'result.status === "要調整")'],
  ["Observer role: allowed observer gains Japanese text", "index.html", 'const syncAvatarChooserViewportV55=()=>document.body.classList.toggle("player-avatar-chooser-visible-v55",!chooser.classList.contains("hidden"));', 'const syncAvatarChooserViewportV55=()=>{document.body.classList.toggle("player-avatar-chooser-visible-v55",!chooser.classList.contains("hidden"));document.title="あ";};']
];
const results = [];
for (const [name, file, from, to] of M) {
  const target = path.join(TMP, file); const original = fs.readFileSync(path.join(ROOT, file), "utf8");
  const count = original.split(from).length - 1;
  if (count < 1) { results.push({ name, file, applied: false, note: `pattern not found (${count})` }); continue; }
  fs.writeFileSync(target, original.replace(from, to));
  const r = spawnSync(process.execPath, ["--test", ...(process.env.SKIP_ANCHORS === "1" ? ["--test-skip-pattern=L0 anchor"] : []), ...fs.readdirSync(path.join(TMP, "tests")).filter(f => /^p2-[01234]-.*\.test\.mjs$/.test(f)).map(f => "tests/" + f)], { cwd: TMP, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  const failed = [...r.stdout.matchAll(/^✖ (\[[^\n]*?)(?: \(\d)/gm)].map(m => m[1].slice(0, 90)).filter((v, i, a) => a.indexOf(v) === i);
  results.push({ name, file, applied: true, killed: r.status !== 0, failingTests: failed.slice(0, 4), failingCount: failed.length });
  fs.writeFileSync(target, original);
}
const out = { mutations: results.length, applied: results.filter(r => r.applied).length, killed: results.filter(r => r.killed).length, survived: results.filter(r => r.applied && !r.killed).map(r => r.name), notApplied: results.filter(r => !r.applied).map(r => r.name), results };
fs.writeFileSync(process.argv[2] || "p2-mutation-results.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify({ mutations: out.mutations, applied: out.applied, killed: out.killed, survived: out.survived, notApplied: out.notApplied }));
fs.rmSync(TMP, { recursive: true, force: true });

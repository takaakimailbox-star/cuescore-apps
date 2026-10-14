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
  ["analysis status word changed", "analysis-final-rc.js", 'let status = "安定";', 'let status = "安定 ";'],
  ["label-text threshold changed (10818)", "index.html", 'label.includes("率") ? 2 : 0.3', 'label.includes("Rate") ? 2 : 0.3'],
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
  ["display site bypasses the Mapper", "index.html", 'window.cueResultLabel(e.resultLabel || e.result || "記録")', '(e.resultLabel || e.result || "記録")'],
  ["Display Mapper leaks into the stored producer", "index.html", "CueScoreDomainV1.pocketedLabel(decision.pocketedBalls.length)", "window.cueResultLabel(CueScoreDomainV1.pocketedLabel(decision.pocketedBalls.length))"],
  ["Domain SKIPPED value changed", "domain-constants-v1.js", 'SKIPPED:"記録なし"', 'SKIPPED:"記録無し"'],
  ["Backup schemaVersion 2 -> 3", "index.html", "const BACKUP_SCHEMA_VERSION = 2;", "const BACKUP_SCHEMA_VERSION = 3;"],
  ["Backup format renamed", "index.html", 'const BACKUP_FORMAT = "cuescore-apps-backup";', 'const BACKUP_FORMAT = "cuescore-apps-backup2";'],
  ["Backup file name changed", "index.html", "CueScore_Apps_v1.0_Backup_", "CueScore_Apps_v1.1_Backup_"],
  ["CSV header renamed", "index.html", '"試合ID", "試合日"', '"試合Id", "試合日"'],
  ["date format: month padding removed", "index.html", 'return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;\n  }\n\n  function openRecords', 'return `${d.getFullYear()}/${d.getMonth()+1}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;\n  }\n\n  function openRecords'],
  ["QR allow-list loses resultLabel", "match-sharing-adapters-v1.js", '["breakPlayer","resultLabel",', '["breakPlayer",'],
  ["default category renamed", "domain-constants-v1.js", 'TOURNAMENT:Object.freeze({id:"category_tournament",name:"大会"})', 'TOURNAMENT:Object.freeze({id:"category_tournament",name:"大会 "})'],
  ["IAP product id changed", "monetization-v1.js", "com.takaakimailboxstar.cuescoreapps.pro", "com.takaakimailboxstar.cuescoreapps.pro2"],
  ["Free record limit 20 -> 21", "record-access-v1.js", "const FREE_LIMIT=20;", "const FREE_LIMIT=21;"],
  ["quota detection regex changed", "index.html", "保存容量が不足", "保存容量不足"],
  ["existing test weakened (comment added)", "tests/analysis-v2.test.mjs", "import", "// weakened\nimport"],
  ["status expression changed in phase2-6", "navigation-phase2-6.js", 'current.winRate>previous.winRate?"改善傾向"', 'current.winRate>=previous.winRate?"改善傾向"'],
  ["Observer role: allowed observer gains Japanese text", "index.html", 'const syncAvatarChooserViewportV55=()=>document.body.classList.toggle("player-avatar-chooser-visible-v55",!chooser.classList.contains("hidden"));', 'const syncAvatarChooserViewportV55=()=>{document.body.classList.toggle("player-avatar-chooser-visible-v55",!chooser.classList.contains("hidden"));document.title="あ";};']
];
const results = [];
for (const [name, file, from, to] of M) {
  const target = path.join(TMP, file); const original = fs.readFileSync(path.join(ROOT, file), "utf8");
  const count = original.split(from).length - 1;
  if (count < 1) { results.push({ name, file, applied: false, note: `pattern not found (${count})` }); continue; }
  fs.writeFileSync(target, original.replace(from, to));
  const r = spawnSync(process.execPath, ["--test", ...(process.env.SKIP_ANCHORS === "1" ? ["--test-skip-pattern=L0 anchor"] : []), ...fs.readdirSync(path.join(TMP, "tests")).filter(f => /^p2-[012]-.*\.test\.mjs$/.test(f)).map(f => "tests/" + f)], { cwd: TMP, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  const failed = [...r.stdout.matchAll(/^✖ (\[[^\n]*?)(?: \(\d)/gm)].map(m => m[1].slice(0, 90)).filter((v, i, a) => a.indexOf(v) === i);
  results.push({ name, file, applied: true, killed: r.status !== 0, failingTests: failed.slice(0, 4), failingCount: failed.length });
  fs.writeFileSync(target, original);
}
const out = { mutations: results.length, applied: results.filter(r => r.applied).length, killed: results.filter(r => r.killed).length, survived: results.filter(r => r.applied && !r.killed).map(r => r.name), notApplied: results.filter(r => !r.applied).map(r => r.name), results };
fs.writeFileSync(process.argv[2] || "p2-mutation-results.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify({ mutations: out.mutations, applied: out.applied, killed: out.killed, survived: out.survived, notApplied: out.notApplied }));
fs.rmSync(TMP, { recursive: true, force: true });

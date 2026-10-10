import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const fn = name => { const start = html.indexOf(`function ${name}(`); assert.ok(start > 0, `${name} must exist`); return html.slice(start, html.indexOf("\n  }\n", start)); };

test("the Back confirmation reuses the existing Break dialog design (same classes, same structure) and has the approved wording", () => {
  const dialog = html.match(/<section id="breakResultBackConfirmV1" class="break-interrupt-overlay-v3 hidden"[\s\S]*?<\/section>/);
  assert.ok(dialog);
  assert.match(dialog[0], /role="dialog"/);
  assert.match(dialog[0], /aria-modal="true"/);
  assert.match(dialog[0], /<div class="break-interrupt-card-v3">/);
  assert.match(dialog[0], /<div class="break-interrupt-actions-v3">/);
  assert.match(dialog[0], /ブレイク結果が未入力です/);
  assert.match(dialog[0], /入力をやめると、今回のブレイク結果は記録されません。/);
  assert.match(dialog[0], /id="breakResultBackConfirmReturnV1"[^>]*data-dialog-close>入力に戻る<\/button>/);
  assert.match(dialog[0], /id="breakResultBackConfirmCloseV1"[^>]*>閉じる<\/button>/);
  assert.doesNotMatch(dialog[0], /完全|必ず/, "the wording must not promise that nothing is ever lost");
});

test("Back asks only for a game-source, current-rack Break prompt; new-match and next-rack prompts keep their existing behaviour", () => {
  const body = fn("handleBreakResultBackV3");
  assert.match(body, /if \(breakResultSourceV3 === "new-match"\) \{\s*showBreakInterruptConfirmV3\(\);/);
  assert.match(body, /if \(breakResultSourceV3 === "game" && !pendingBreakStartsNextRackV1\) \{\s*showBreakResultBackConfirmV1\(\);\s*if \(fromHistory\) markBreakResultHistoryV3\(\);\s*return;\s*\}\s*breakResultBackHandlingV3 = true;\s*closeBreakResultPromptV61\(\);/);
});

test("\"入力に戻る\" only hides the dialog; \"閉じる\" closes the prompt exactly like the previous Back; neither saves a Break result", () => {
  assert.match(html, /el\("breakResultBackConfirmReturnV1"\)\?\.addEventListener\("click", \(\) => hideBreakResultBackConfirmV1\(\)\);/);
  assert.match(html, /el\("breakResultBackConfirmCloseV1"\)\?\.addEventListener\("click", closeBreakResultFromBackConfirmV1\);/);
  assert.match(fn("closeBreakResultFromBackConfirmV1"), /hideBreakResultBackConfirmV1\(\);\s*breakResultBackHandlingV3 = true;\s*closeBreakResultPromptV61\(\);/);
  for (const name of ["showBreakResultBackConfirmV1", "hideBreakResultBackConfirmV1", "closeBreakResultFromBackConfirmV1"]) assert.doesNotMatch(fn(name), /saveBreakResultV61\(|recordAnalysisEventV60\(|appendCommonEventV700\(/);
});

test("system Back on the confirmation means \"入力に戻る\", and closing the prompt also hides the confirmation", () => {
  assert.match(html, /window\.addEventListener\("popstate", \(\) => \{\s*if \(isBreakResultBackConfirmOpenV1\(\)\) \{[^}]*hideBreakResultBackConfirmV1\(\{restoreHistory:true\}\);\s*return;/);
  assert.match(fn("closeBreakResultPromptV61"), /el\("breakResultBackConfirmV1"\)\?\.classList\.add\("hidden"\)/);
});

test("the existing new-match interruption dialog and its handlers are unchanged", () => {
  assert.match(html, /<h2 id="breakInterruptTitleV3">ゲームを中断しますか？<\/h2>/);
  assert.match(html, /入力中のブレイク結果は保存されません。New Match画面へ戻ります。/);
  assert.match(html, /el\("breakInterruptProceedV3"\)\?\.addEventListener\("click", interruptNewMatchFromBreakV3\);/);
});

test("button emphasis: \"入力に戻る\" is the primary (black) action, \"閉じる\" the secondary (white); order unchanged", () => {
  assert.match(html, /#breakResultBackConfirmReturnV1\{border:1px solid #171717;color:#fff;background:#171717\}/);
  assert.match(html, /#breakResultBackConfirmCloseV1\{border:1px solid #cfcfcb;color:#171717;background:#fff\}/);
  const d = html.match(/<section id="breakResultBackConfirmV1"[\s\S]*?<\/section>/)[0];
  assert.ok(d.indexOf("breakResultBackConfirmReturnV1") < d.indexOf("breakResultBackConfirmCloseV1"));
});

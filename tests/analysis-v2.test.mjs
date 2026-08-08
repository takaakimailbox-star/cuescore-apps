import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");

assert.match(html,/CueScore Analysis v2\.0/);
assert.match(html,/id="cueHomeAnalysisV3"/);
assert.match(html,/cueHomeAnalysisV3[^\n]+openRankingsBtn/);
assert.match(html,/data-analysis-view="home"/);
assert.match(html,/data-analysis-view="player"/);
assert.match(html,/data-analysis-view="match"/);
assert.match(html,/プレーヤー分析/);
assert.match(html,/試合分析/);
assert.match(html,/現在の変化/);
assert.match(html,/変化の根拠/);
assert.match(html,/勝敗を分けたポイント/);
assert.match(html,/スコア推移/);
assert.match(html,/サマリー比較/);
assert.match(html,/data sufficiency guard/);
assert.match(html,/前期間の試合数が少ないため、変化はまだ評価しません/);
assert.match(html,/textContent===.蓄積中./);
assert.match(html,/ファール数は相手と同じ/);
assert.match(html,/ハイランは相手と同じ/);
assert.match(html,/\.analysis-v2\{min-width:0;overflow:hidden\}/);
assert.match(html,/#rankingsScreen>\.analytics-shell-v1[^}]+display:none!important/);
assert.match(sw,/1\.0-analysis-v2/);

console.log("Analysis v2 home, player change analysis, and match analysis checks passed.");

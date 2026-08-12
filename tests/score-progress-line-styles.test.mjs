import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

const officialStart=html.indexOf("function makeOfficialResultChartSvgV1");
const officialEnd=html.indexOf("function resultAvatarSvgV1",officialStart);
const official=html.slice(officialStart,officialEnd);
assert.match(official,/class="score-progress-line-p1-v1"/);
assert.doesNotMatch(official,/score-progress-line-p1-v1[^>]*stroke-dasharray/);
assert.match(official,/class="score-progress-line-p2-v1"[^>]*stroke-dasharray="8 6"/);

const detailStart=html.indexOf("function chartSvgV1(record, winner)");
const detailEnd=html.indexOf("function miniBallV1",detailStart);
const detail=html.slice(detailStart,detailEnd);
assert.match(detail,/class="score-progress-line-p1-v1"/);
assert.doesNotMatch(detail,/score-progress-line-p1-v1[^>]*stroke-dasharray/);
assert.match(detail,/class="score-progress-line-p2-v1"[^>]*stroke-dasharray="8 6"/);

assert.match(html,/official-result-chart-header-v1 \.p2\{[^}]*border-top-style:dashed/);
assert.match(html,/score-progress-legend-p2-v1::before\{border-top-style:dashed\}/);
assert.match(html,/class="score-progress-legend-p1-v1"/);
assert.match(html,/class="score-progress-legend-p2-v1"/);

for(const discipline of ["9ball","10ball","rotation","jpa9","straightPool","threeCushion"]){
  assert.match(html,new RegExp(`id:"${discipline}"`),`${discipline} remains supported by the shared result/detail path`);
}

console.log("Shared score-progress solid/dashed line and legend checks passed");

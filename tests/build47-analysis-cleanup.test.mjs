import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=name=>readFileSync(new URL(`../${name}`,import.meta.url),"utf8");

test("Build 47 analysis UI removes foul rate and trend graphs",()=>{
  for(const name of ["analysis-build4.js","navigation-phase2-6.js","player-detail-build6.js"]){
    assert.doesNotMatch(read(name),/foulRate|ファール率/);
  }
  assert.doesNotMatch(read("analysis-build4.js"),/data-b4-trend-select|analysis-b4-trend/);
  assert.doesNotMatch(read("navigation-phase2-6.js"),/data-hub-trends/);
  assert.doesNotMatch(read("ui-revision-v12.js"),/pd12Trends|openTrends|グラフで見る/);

  const index=read("index.html");
  const analytics=index.slice(index.indexOf("CueScore Analytics v1.0"),index.indexOf("CueScore Settings Suite"));
  assert.doesNotMatch(analytics,/推移グラフ|analyticsTabsV1|analyticsChartV1|ファール平均|平均ファール/);
});

test("Build 47 keeps stored foul calculations available for data compatibility",()=>{
  assert.match(read("analytics-build4-metrics.js"),/foulRateForRecord/);
});

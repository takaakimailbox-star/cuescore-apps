import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=name=>readFileSync(new URL(`../${name}`,import.meta.url),"utf8");

test("Build 53 keeps foul rate removed while restoring the original dedicated trends page",()=>{
  for(const name of ["analysis-build4.js","navigation-phase2-6.js","player-detail-build6.js"]){
    assert.doesNotMatch(read(name),/foulRate|ファール率/);
  }
  assert.match(read("analysis-build4.js"),/data-b4-trend-select|analysis-b4-trend/);
  assert.match(read("navigation-phase2-6.js"),/data-hub-trends/);
  assert.match(read("ui-revision-v12.js"),/pd12Trends|openTrends/);

  const index=read("index.html");
  const analytics=index.slice(index.indexOf("CueScore Analytics v1.0"),index.indexOf("CueScore Settings Suite"));
  assert.match(analytics,/推移グラフ/);
  assert.match(analytics,/analyticsTabsV1/);
  assert.match(analytics,/analyticsChartV1/);
  assert.doesNotMatch(analytics,/ファール平均|平均ファール/);
});

test("Build 53 Player Info analysis opens the original cumulative per-metric trends page",()=>{
  const hub=read("navigation-phase2-6.js");
  assert.match(hub,/data-hub-trends/);
  assert.doesNotMatch(hub,/hub-trend-v52|data-hub-trend-select|data-hub-trend-chart/);
  assert.doesNotMatch(hub,/foulRate|ファール率/);
  const revision=read("ui-revision-v12.js");
  assert.match(revision,/records\.slice\(0,index\+1\)/);
  assert.match(revision,/pd12-trend-card/);
  assert.doesNotMatch(revision,/foulRate|ファール率/);
});

test("Build 54 makes the dedicated trends compact, readable, and full screen",()=>{
  const analysis=read("analysis-build4.js"),revision=read("ui-revision-v12.js"),css=read("ui-revision-v12.css");
  assert.match(analysis,/data-b4-point/);
  assert.match(analysis,/data-b4-point-callout/);
  assert.match(analysis,/getMonth\(\)\+1.*getDate\(\)/);
  assert.match(analysis,/right=48/);
  assert.match(revision,/pd12-trend-heading/);
  assert.match(revision,/formatTrendValue/);
  assert.match(revision,/pd12-trends-open/);
  assert.match(css,/\.pd12-chart-scroll \.analysis-b4-chart \{ height:154px/);
  assert.match(css,/\.pd12-trends-open \.cue-phase1-tab-bar/);
});

test("Build 51 splash covers the complete viewport above every app surface",()=>{
  const index=read("index.html");
  assert.match(index,/\.cue-logo-splash-v1\{position:fixed!important;z-index:2147483647!important;inset:0!important;width:100vw!important;height:100dvh!important/);
});

test("Build 47 keeps stored foul calculations available for data compatibility",()=>{
  assert.match(read("analytics-build4-metrics.js"),/foulRateForRecord/);
});

import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("both modes use one renderer, one metrics map and one chart renderer",()=>{
  assert.match(html,/function openMatchDetailV1\(recordId,options=\{\}\)/);
  assert.match(html,/const resultMode=options\?\.source==="result"/);
  assert.equal((html.match(/const summaryRows=/g)||[]).length,1);
  assert.equal((html.match(/const chart=chartSvgV1\(record,winner\)/g)||[]).length,1);
});

test("rack games share shoot, run-out and foul labels",()=>{
  assert.match(html,/\["9ball","10ball"\]\.includes\(disciplineV4\) \? \[\s*shotRowV4,\s*\["マス割"[\s\S]*?foulRowV4/);
});

test("Rotation, JPA and Straight Pool share their three adopted analysis metrics",()=>{
  assert.match(html,/disciplineV4==="rotation" \? \[\s*shotRowV4,highRunRowV4,foulRowV4/);
  assert.match(html,/disciplineV4==="straightPool" \? \[\s*averageRowV4,highRunRowV4,foulRowV4/);
  assert.match(html,/disciplineV4==="jpa9" \? \[\s*averageRowV4,highRunRowV4,foulRowV4/);
});

test("JPA result facts and analysis are rendered in both modes",()=>{
  for(const label of ["SL","Race／先取点","最終取得点","マッチポイント","イニング","セーフティ","試合結果情報","分析情報"]){
    assert.ok(html.includes(label),`missing JPA label: ${label}`);
  }
  assert.match(html,/jpa9MatchPointsForPlayersV1\(winner,record\.players,record\?\.jpa9\?\.skillLevels\)/);
});

test("3C order is inning, high run, average and has no filler foul",()=>{
  assert.match(html,/const inningsRowV4=\["イニング"/);
  assert.match(html,/\] : \[inningsRowV4,highRunRowV4,averageRowV4\];/);
});

test("result-only and detail-only lower sections stay separated",()=>{
  assert.match(html,/const history=resultMode\?"":gameHistoryV1\(record\)/);
  assert.match(html,/resultMode\?`<footer[^`]*officialResultReturnGameV1[^`]*officialResultHomeV1[^`]*officialResultRematchV1/s);
  assert.match(html,/resultMode\?"":`<section class="match-detail-delete-section-v1"/);
});

test("result mode has no header close/back button and remains width-safe",()=>{
  assert.match(html,/resultMode\?'<span class="match-detail-header-spacer-v5"/);
  assert.match(html,/overflow-x:hidden/);
  assert.match(html,/@media\(max-width:370px\)/);
});

test("PWA cache and document script versions stay synchronized",()=>{
  const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
  assert.match(sw,/APP_VERSION = "2\.0-result-detail-common-layout-v1"/);
  assert.match(sw,/demo-data\.js\?v=2\.0-result-detail-common-layout-v1/);
  assert.match(html,/demo-data\.js\?v=2\.0-result-detail-common-layout-v1/);
});

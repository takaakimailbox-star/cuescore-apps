import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const start=html.indexOf("const JPA9_SL_TARGETS");
const end=html.indexOf("let activeGameTypeV1",start);
assert.ok(start>=0&&end>start,"JPA match-point helpers are present");
const context={window:{}};
vm.createContext(context);
vm.runInContext(`${html.slice(start,end)};window.__targets=JPA9_SL_TARGETS;window.__bounds=JPA9_MATCH_POINT_UPPER_BOUNDS_V1;`,context);

const targets={1:14,2:19,3:25,4:31,5:38,6:46,7:55,8:65,9:75};
const bounds={
  1:[2,3,4,6,7,8,10,11,13],2:[3,5,7,8,10,12,14,16,18],3:[4,6,9,11,14,16,19,21,24],
  4:[5,8,11,14,18,21,24,27,30],5:[6,10,14,18,22,26,29,33,37],6:[8,12,17,22,27,31,36,40,45],
  7:[10,15,21,26,32,37,43,49,54],8:[13,19,26,32,39,45,52,58,64],9:[17,24,31,38,46,53,60,67,74]
};

test("JPA official SL targets and all loser-score bands match the supplied scoresheet",()=>{
  assert.deepEqual({...context.window.__targets},targets);
  for(const sl of Object.keys(bounds))assert.deepEqual([...context.window.__bounds[sl]],bounds[sl]);
});

test("every SL boundary maps from 20-0 through 12-8 and always totals 20",()=>{
  for(let sl=1;sl<=9;sl++){
    let lower=0;
    bounds[sl].forEach((upper,loserPoints)=>{
      for(const score of new Set([lower,upper])){
        const result=context.window.calculateJPA9MatchPointsV1(sl,score);
        assert.deepEqual({...result},{winner:20-loserPoints,loser:loserPoints},`SL${sl} score ${score}`);
        assert.equal(result.winner+result.loser,20);
      }
      lower=upper+1;
    });
    assert.equal(context.window.calculateJPA9MatchPointsV1(sl,-1),null);
    assert.equal(context.window.calculateJPA9MatchPointsV1(sl,targets[sl]),null);
  }
});

test("player order is preserved and incomplete/non-JPA data stays unassigned",()=>{
  assert.deepEqual({...context.window.jpa9MatchPointsForPlayersV1(1,{1:{score:38,skillLevel:5},2:{score:22,skillLevel:5}})},{1:16,2:4});
  assert.deepEqual({...context.window.jpa9MatchPointsForPlayersV1(2,{1:{score:22,skillLevel:5},2:{score:38,skillLevel:5}})},{1:4,2:16});
  assert.equal(context.window.jpa9MatchPointsForPlayersV1(0,{1:{score:0},2:{score:0}}),null);
  assert.equal(context.window.jpa9MatchPointsForPlayersV1(1,{1:{score:38},2:{score:22}}),null);
});

test("Game Result and Match Detail use the same shared allocation",()=>{
  assert.match(html,/const jpaMatchPoints=isJPA9V1\(\)\?jpa9MatchPointsForPlayersV1/);
  assert.match(html,/const jpaMatchPointsV1=disciplineV4==="jpa9"[\s\S]*?jpa9MatchPointsForPlayersV1\(winner,record\.players,record\?\.jpa9\?\.skillLevels\)/);
  assert.match(html,/separator\.textContent=jpaMatchPoints\?`\$\{jpaMatchPoints\[1\]\}–\$\{jpaMatchPoints\[2\]\}`:"—"/);
  assert.match(html,/const jpaMatchPointValueV3=disciplineV4==="jpa9"[\s\S]*?jpaMatchPointsV1\[1\][\s\S]*?jpaMatchPointsV1\[2\]/);
  assert.match(html,/official-result-match-points-v3/);
  assert.match(html,/match-detail-match-points-v3/);
  assert.doesNotMatch(html,/<(?:span|small|strong|b|i)[^>]*>マッチポイント<\//);
  assert.doesNotMatch(html,/<(?:small|i)>pt<\//);
  assert.doesNotMatch(html,/<div class="jpa-match-points-v1/);
});

test("20-0, 16-4, 14-6 and 12-8 keep Player 1 / Player 2 order in one compact line",()=>{
  assert.deepEqual({...context.window.jpa9MatchPointsForPlayersV1(1,{1:{score:38,skillLevel:5},2:{score:0,skillLevel:5}})},{1:20,2:0});
  assert.deepEqual({...context.window.jpa9MatchPointsForPlayersV1(1,{1:{score:38,skillLevel:5},2:{score:19,skillLevel:5}})},{1:16,2:4});
  assert.deepEqual({...context.window.jpa9MatchPointsForPlayersV1(1,{1:{score:38,skillLevel:5},2:{score:27,skillLevel:5}})},{1:14,2:6});
  assert.deepEqual({...context.window.jpa9MatchPointsForPlayersV1(1,{1:{score:38,skillLevel:5},2:{score:34,skillLevel:5}})},{1:12,2:8});
  assert.match(html,/\.official-result-match-points-v3\{[\s\S]*?font-weight:500;[\s\S]*?white-space:nowrap/);
  assert.match(html,/\.match-detail-match-points-v3\{[\s\S]*?font-weight:480;[\s\S]*?white-space:nowrap/);
});

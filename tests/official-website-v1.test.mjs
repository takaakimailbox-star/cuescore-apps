import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {resolve} from "node:path";

const root=resolve(new URL("..",import.meta.url).pathname);
const read=path=>readFileSync(resolve(root,path),"utf8");
const site=read("docs/index.html");

test("official website has the adopted structure and truthful pre-release CTA",()=>{
  assert.match(site,/<title>CueScore \| Billiards Score &amp; Match Tracker<\/title>/);
  for(const id of ["features","games"])assert.match(site,new RegExp(`id="${id}"`));
  for(const label of ["記録","振り返り","成績","対応ゲーム","App Store 公開予定"])assert.ok(site.includes(label));
  assert.doesNotMatch(site,/apps\.apple\.com|App Storeで見る|JPA 8-Ball|CueSketch/);
});

test("website links, images and official document sources resolve inside Pages root",()=>{
  const refs=[...site.matchAll(/(?:href|src)="\.\/([^"#]+)"/g)].map(match=>match[1]);
  for(const ref of refs)assert.ok(existsSync(resolve(root,"docs",ref)),`missing ${ref}`);
  for(const page of ["support","privacy","terms"]){
    const html=read(`docs/${page}.html`);
    const source=html.match(/data-source="\.\/([^"]+)"/)?.[1];
    assert.ok(source&&existsSync(resolve(root,"docs",source)),`${page} official source missing`);
    assert.match(html,/href="\.\/"/);
  }
});

test("all six implemented games use official icons",()=>{
  for(const game of ["rotation","9ball","10ball","jpa-9ball","14-1","3cushion"]){
    assert.match(site,new RegExp(`site-assets/icons/game-${game}\\.svg`));
  }
});

test("GitHub Pages website does not replace the app runtime",()=>{
  const app=read("index.html"),project=read("ios/App/App.xcodeproj/project.pbxproj");
  assert.match(app,/id="cueScoreApp"|CueScore Apps v1\.0/);
  assert.match(project,/CURRENT_PROJECT_VERSION = 54;/);
  assert.doesNotMatch(app,/Billiards Score &amp; Match Tracker/);
});

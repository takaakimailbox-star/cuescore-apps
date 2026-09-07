import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {resolve,dirname} from "node:path";

const root=resolve(new URL("..",import.meta.url).pathname);
const read=path=>readFileSync(resolve(root,path),"utf8");

const pages=["docs/index.html","docs/en/index.html","docs/cuesnapi/index.html","docs/en/cuesnapi/index.html","docs/cuesnapi/support/index.html","docs/en/cuesnapi/support/index.html","docs/cuesnapi/privacy/index.html","docs/en/cuesnapi/privacy/index.html"];

test("Cue Series provides Japanese and English product, support, and privacy pages",()=>{
  for(const page of pages)assert.ok(existsSync(resolve(root,page)),`missing ${page}`);
  assert.match(read("docs/index.html"),/Cue Series/);
  assert.match(read("docs/index.html"),/CueScore/);
  assert.match(read("docs/index.html"),/CueSnap<span>i/);
  assert.match(read("docs/en/index.html"),/Play\. Capture/);
});

test("CueSnapi uses current formal Build 31 assets and truthful availability",()=>{
  const ja=read("docs/cuesnapi/index.html"),en=read("docs/en/cuesnapi/index.html");
  assert.match(ja,/home-build31\.png/);
  assert.match(ja,/TestFlightで開発中/);
  assert.match(en,/In development on TestFlight/);
  assert.ok(existsSync(resolve(root,"docs/site-assets/cuesnapi/home-build31.png")));
  assert.ok(existsSync(resolve(root,"docs/site-assets/cuesnapi/app-icon.png")));
  assert.doesNotMatch(ja+en,/App Storeでダウンロード|Download on the App Store/);
});

test("local relative links and images in new pages resolve",()=>{
  for(const page of pages){
    const html=read(page),dir=dirname(resolve(root,page));
    for(const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)){
      const ref=match[1];
      if(/^(?:https?:|mailto:)/.test(ref))continue;
      assert.ok(existsSync(resolve(dir,ref)),`${page}: missing ${ref}`);
    }
  }
});

test("legacy CueScore public legal URLs remain unchanged",()=>{
  for(const page of ["support","privacy","terms"]){
    assert.ok(existsSync(resolve(root,`docs/${page}.html`)));
  }
  assert.match(read("docs/official/app-store-v1.0/submission/CueScore_App_Store_Public_URLs_v1.0_RC.md"),/cuescore-apps\/privacy\.html/);
});

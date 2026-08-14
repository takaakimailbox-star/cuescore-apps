import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=name=>fs.readFileSync(new URL(`../${name}`,import.meta.url),"utf8");
const html=read("index.html");
const normal=JSON.parse(read("manifest.webmanifest"));
const diagnostic=JSON.parse(read("manifest-fa-iphone-003-diagnostic.webmanifest"));
const sw=read("sw.js");

test("normal and diagnostic Home Screen entries keep separate start URLs",()=>{
  assert.equal(normal.start_url,"./index.html");
  assert.equal(diagnostic.start_url,"./index.html?debug=fa-iphone-003");
  assert.equal(normal.scope,"./");
  assert.equal(diagnostic.scope,"./");
});

test("only the explicit diagnostic query selects the temporary manifest",()=>{
  assert.match(html,/<link rel="manifest" href="\.\/manifest\.webmanifest" \/>/);
  assert.match(html,/new URLSearchParams\(location\.search\)\.get\("debug"\) === "fa-iphone-003"[\s\S]*?link\[rel="manifest"\][\s\S]*?manifest-fa-iphone-003-diagnostic\.webmanifest/);
  assert.doesNotMatch(normal.start_url,/debug=/);
});

test("diagnostic manifest is offline-cached and versioned with the diagnostic build",()=>{
  assert.match(sw,/const APP_VERSION = "2\.0-fa-iphone-003-diagnostic-v2"/);
  assert.match(sw,/"\.\/manifest\.webmanifest"/);
  assert.match(sw,/"\.\/manifest-fa-iphone-003-diagnostic\.webmanifest"/);
  assert.match(html,/const PWA_VERSION = "2\.0-fa-iphone-003-diagnostic-v2"/);
});

test("diagnostic activation remains query-gated without storage or UI schema changes",()=>{
  assert.match(html,/const FA_IPHONE_003_DEBUG_V1 = new URLSearchParams\(location\.search\)\.get\("debug"\) === "fa-iphone-003"/);
  assert.match(html,/const IN_PROGRESS_MATCH_SCHEMA_V1 = 1/);
  assert.match(html,/\.cue-resume-card-v1\{[^}]*min-height:64px!important/);
});

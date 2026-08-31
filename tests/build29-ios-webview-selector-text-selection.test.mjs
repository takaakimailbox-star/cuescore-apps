import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const navigation=readFileSync(new URL("../navigation-phase2-6.js",import.meta.url),"utf8");

test("discipline selector exposes ordered WebView instrumentation through UI paint",()=>{
  for(const stage of [
    "handler:start",
    "state:update",
    "state-restoration:skipped",
    "localStorage:complete",
    "render:complete",
    "ui:paint"
  ])assert.match(html,new RegExp(stage.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  assert.match(html,/active-match-snapshot:complete/);
  for(const type of ["touchstart","touchend","pointerdown","pointerup","click"])
    assert.match(navigation,new RegExp(`event:\\$\\{event\\.type\\}`));
});

test("selector avoids duplicate compatibility mouse handlers and synchronous smooth scrolling",()=>{
  assert.doesNotMatch(navigation,/addEventListener\("mousedown",beginSwipe/);
  assert.doesNotMatch(navigation,/addEventListener\("mouseup",endSwipe/);
  assert.doesNotMatch(navigation,/event=>event\.target\.closest\("\[data-discipline\]"\)\?\.scrollIntoView\(\{behavior:"smooth"/);
  assert.match(navigation,/scrollIntoView\(\{behavior:"auto",block:"nearest",inline:"nearest"\}\)/);
});

test("non-editable UI blocks iOS selection and callout while editors retain native selection",()=>{
  assert.match(html,/:where\(html, body, body \*\)[\s\S]*?-webkit-user-select: none;[\s\S]*?-webkit-touch-callout: none;/);
  assert.match(html,/:where\(input, textarea, \[contenteditable="true"\], \[contenteditable="plaintext-only"\]\)[\s\S]*?-webkit-user-select: text;[\s\S]*?-webkit-touch-callout: default;/);
  assert.match(html,/document\.addEventListener\("contextmenu",event=>\{if\(!editable\(event\.target\)\)event\.preventDefault\(\);\},true\)/);
  assert.match(html,/document\.addEventListener\("selectstart",event=>\{if\(!editable\(event\.target\)\)event\.preventDefault\(\);\},true\)/);
});

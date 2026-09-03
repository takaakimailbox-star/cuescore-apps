import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("player registration and editing keep two persistent footer actions",()=>{
  assert.match(html,/\.player-editor-actions-v1\{display:grid;grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/);
  assert.match(html,/\.player-editor-cancel-v1\{display:block;/);
  assert.doesNotMatch(html,/\.player-editor-cancel-v1\{display:none!important\}/);
  assert.match(html,/existingSave\.textContent=editing\?"変更":"登録"/);
});

test("player editor owns the full iOS visual viewport and hides the app tab bar",()=>{
  assert.match(html,/document\.body\.classList\.toggle\("player-editor-visible-v55",open\)/);
  assert.match(html,/body\.player-editor-visible-v55 \.cue-phase1-tab-bar,[\s\S]*body\.player-avatar-chooser-visible-v55 \.cue-phase1-tab-bar\{display:none!important;pointer-events:none!important\}/);
  assert.match(html,/\.player-editor-modal-v1 \.player-editor\{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important/);
});

test("avatar chooser keeps its decision footer inside the full viewport",()=>{
  assert.match(html,/data-avatar-apply-v5>この画像に決定/);
  assert.match(html,/\.player-avatar-chooser-v2\{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important/);
  assert.match(html,/player-avatar-chooser-visible-v55/);
  assert.match(html,/new MutationObserver\(syncAvatarChooserViewportV55\)/);
});

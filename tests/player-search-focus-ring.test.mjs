import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=readFileSync(new URL("../navigation-phase2-6.css",import.meta.url),"utf8");

test("Player Search alone suppresses the shared yellow focus-visible outline",()=>{
  assert.match(html,/:where\(button, a, input, select, textarea, \[tabindex\]\):focus-visible\s*\{[\s\S]*?outline: 3px solid #ffd54a !important/);
  assert.match(css,/\.player-library-search:focus,\.player-library-search:focus-visible\{outline:none!important;outline-offset:0!important\}/);
  assert.doesNotMatch(css,/:where\([^}]*\):focus-visible\s*\{[^}]*outline:none/);
});

test("Player1, Player2, and management reuse the same searchable input",()=>{
  assert.match(html,/id="playerLibrarySearch" type="search"/);
  assert.match(html,/el\("p1PlayerSearchBtn"\)\?\.addEventListener\("click", \(\) => openPlayerLibrary\(1\)\)/);
  assert.match(html,/el\("p2PlayerSearchBtn"\)\?\.addEventListener\("click", \(\) => openPlayerLibrary\(2\)\)/);
  assert.match(html,/function openPlayerManagementV145\(\)[\s\S]*?el\("playerLibrarySearch"\)\.value = ""/);
});

test("Search input behavior and filtering remain unchanged",()=>{
  assert.match(html,/el\("playerLibrarySearch"\)\?\.addEventListener\("input", \(\) => renderPlayerLibrary\(\)\)/);
  assert.match(html,/const query = \(el\("playerLibrarySearch"\)\?\.value \|\| ""\)\.trim\(\)\.toLocaleLowerCase\("ja"\)/);
  assert.match(html,/\.filter\(row => !query \|\| row\.player\.name\.toLocaleLowerCase\("ja"\)\.includes\(query\)\)/);
});

import "./helpers/ja-fs.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

// Decision 045 / Official 132-133: the Home shows six discipline tiles (2 columns x 3 rows) in the PO-adopted order;
// the match setup screen no longer shows the horizontal six-discipline menu. The measured browser proof is tests/browser/new-home-grid.mjs.
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../navigation-phase2-6.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../navigation-phase2-6.js", import.meta.url), "utf8");
const switcher = () => { const a = html.indexOf('id="cueDisciplineSwitcherV1"'); return html.slice(a, html.indexOf("</div>", a)); };

test("the six tiles are in the PO-adopted order with the adopted icons and unchanged labels (AC-H1, AC-H2)", () => {
  const tiles = [...switcher().matchAll(/data-discipline="([A-Za-z0-9]+)">\s*<img class="cue-game-icon-v1" src="assets\/icons\/games\/([^"]+)"[^>]*\/>\s*<span class="cue-discipline-label-v1"><strong>([^<]+)<\/strong>/g)].map(m => [m[1], m[2], m[3]]);
  assert.deepEqual(tiles, [
    ["9ball", "game-9ball.svg", "9-Ball"],
    ["10ball", "game-10ball.svg", "10-Ball"],
    ["jpa9", "game-jpa-9ball.svg", "JPA 9-Ball"],
    ["rotation", "game-rotation.svg", "Rotation"],
    ["straightPool", "game-14-1.svg", "14-1"],
    ["threeCushion", "game-3cushion.svg", "3 Cushion"],
  ]);
  for (const [, icon] of tiles) assert.ok(existsSync(new URL("../assets/icons/games/" + icon, import.meta.url)), icon + " exists (adopted icon, not replaced)");
});

test("the grid is 2 columns, every tile is at least 72px high (>= 44pt hit area) and the setup hides the menu (AC-H4, AC-H8, AC-H9)", () => {
  assert.match(css, /#cueHomeV1:not\(\.match-setup-active-v3\) #cueDisciplineSwitcherV1\{display:grid!important;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
  const tile = css.match(/#cueHomeV1:not\(\.match-setup-active-v3\) #cueDisciplineSwitcherV1 \.cue-discipline-v1\{([^}]*)\}/);
  assert.ok(tile, "tile rule exists");
  const m = tile[1].match(/min-height:(\d+)px!important/);
  assert.ok(m && Number(m[1]) >= 72 && Number(m[1]) >= 44);
  assert.match(css, /#cueHomeV1\.match-setup-active-v3 #cueDisciplineSwitcherV1\{display:none!important\}/);
});

test("the Home has no new-match button, the discipline menu stays on Home and no separate setup back button exists (AC-H3, AC-H6)", () => {
  assert.doesNotMatch(js, /home-new-match-v2/);
  assert.match(js, /cueMatchSetupBackV3"\)\?\.remove\(\)/);
  assert.doesNotMatch(js, /insertAdjacentElement\("afterend",switcher\)/);
  assert.match(html, /cueDisciplineSwitcherV1"\)\?\.addEventListener\("click",event=>\{if\(event\.target\.closest\("\[data-discipline\]"\)\)openSetup\(\)\}\)/);
  // the selected game icon and name stay on the setup screen
  assert.match(html, /id="cueSelectedGameIconV1"/);
  assert.match(html, /id="cueSelectedGameNameV1"/);
});

test("no new translation key is introduced and the accessible names keep the existing keys (AC-H10)", () => {
  const keys = [...switcher().matchAll(/data-i18n-aria-label="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(keys, ["home.discipline.aria", "home.discipline.nineBall.aria", "home.discipline.tenBall.aria", "home.discipline.jpa9.aria", "home.discipline.rotation.aria", "home.discipline.straightPool.aria", "home.discipline.threeCushion.aria"]);
});

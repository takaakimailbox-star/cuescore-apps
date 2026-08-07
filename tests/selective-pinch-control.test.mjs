import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(
  html,
  /const restrictedSelector="#proGameScreen:not\(\.hidden\),#breakResultOverlayV61:not\(\.hidden\)"/,
  "pinch control must be limited to the live match and break-input screens"
);
assert.match(html, /event\.touches\.length>1 && restrictedTarget\(event\.target\)/);
assert.match(html, /\["gesturestart","gesturechange"\]/);
assert.doesNotMatch(
  html,
  /user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i,
  "global browser zoom must remain available"
);
assert.match(
  html,
  /\.record-detail-overlay\.match-detail-overlay-v1\{[\s\S]*?height:100dvh!important;[\s\S]*?max-height:100dvh!important;/,
  "match detail height must not collapse with the zoomed visual viewport"
);
assert.match(html, /preserveAspectRatio="xMidYMid meet"/);
assert.match(
  html,
  /\.match-detail-chart-svg-v1\{[\s\S]*?max-width:100%;[\s\S]*?aspect-ratio:680\/205;[\s\S]*?overflow:visible;/,
  "the score chart must retain responsive SVG geometry while zoomed"
);

console.log("Selective pinch control and zoom-stable match detail checks passed.");

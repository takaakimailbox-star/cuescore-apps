import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");
const terms=fs.readFileSync(new URL("../terms.html",import.meta.url),"utf8");
const privacy=fs.readFileSync(new URL("../privacy.html",import.meta.url),"utf8");

test("Settings connects Terms and Privacy without changing the footer layout",()=>{
  assert.match(html,/class="settings-info-link-v1" type="button" data-settings-legal="terms\.html"><span>利用規約/);
  assert.match(html,/class="settings-info-link-v1" type="button" data-settings-legal="privacy\.html"><span>プライバシーポリシー/);
  assert.match(html,/const legalPage = event\.target\.closest\("\[data-settings-legal\]"\)[\s\S]*?sessionStorage\.setItem\("cuescore\.returnToSettings\.v1","1"\)[\s\S]*?window\.location\.assign\(new URL\(legalPage, window\.location\.href\)\.href\)/);
  assert.match(html,/sessionStorage\.getItem\("cuescore\.returnToSettings\.v1"\) === "1"[\s\S]*?sessionStorage\.removeItem[\s\S]*?document\.getElementById\("settingsBtn"\)\?\.click\(\)/);
});

test("License remains explicitly unavailable until an official source exists",()=>{
  assert.match(html,/aria-disabled="true" disabled><span>ライセンス/);
  assert.doesNotMatch(html,/data-settings-legal="license/);
});

test("Terms and Privacy official sources are cached for offline navigation",()=>{
  assert.match(terms,/CueScore_Terms_of_Use_v1\.0_Official\.md/);
  assert.match(privacy,/CueScore_Privacy_Policy_v1\.0_Official\.md/);
  for(const path of ["./terms.html","./privacy.html","./official-document.js","./official-pages.css"])assert.ok(sw.includes(`"${path}"`));
  assert.match(sw,/cache\.put\(event\.request, response\.clone\(\)\)/);
  assert.doesNotMatch(sw,/cache\.put\("\.\/index\.html", response\.clone\(\)\)/);
});

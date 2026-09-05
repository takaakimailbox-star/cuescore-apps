import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");
const terms=fs.readFileSync(new URL("../terms.html",import.meta.url),"utf8");
const privacy=fs.readFileSync(new URL("../privacy.html",import.meta.url),"utf8");
const support=fs.readFileSync(new URL("../support.html",import.meta.url),"utf8");
const script=fs.readFileSync(new URL("../official-document.js",import.meta.url),"utf8");
const styles=fs.readFileSync(new URL("../official-pages.css",import.meta.url),"utf8");
const supportMarkdown=fs.readFileSync(new URL("../docs/official/app-store-v1.0/public/CueScore_Support_v1.0_Official.md",import.meta.url),"utf8");
const privacyMarkdown=fs.readFileSync(new URL("../docs/official/app-store-v1.0/public/CueScore_Privacy_Policy_v1.0_Official.md",import.meta.url),"utf8");
const termsMarkdown=fs.readFileSync(new URL("../docs/official/app-store-v1.0/public/CueScore_Terms_of_Use_v1.0_Official.md",import.meta.url),"utf8");

test("Settings connects Terms and Privacy without changing the footer layout",()=>{
  assert.match(html,/class="settings-info-link-v1" type="button" data-settings-legal="terms\.html"><span>利用規約/);
  assert.match(html,/class="settings-info-link-v1" type="button" data-settings-legal="privacy\.html"><span>プライバシーポリシー/);
  assert.match(html,/const legalPage = event\.target\.closest\("\[data-settings-legal\]"\)[\s\S]*?sessionStorage\.setItem\("cuescore\.returnToSettings\.v1","1"\)[\s\S]*?window\.location\.assign\(new URL\(legalPage, window\.location\.href\)\.href\)/);
  assert.match(html,/const restoreSettingsAfterLegalV160 = \(\) => \{[\s\S]*?sessionStorage\.getItem\("cuescore\.returnToSettings\.v1"\) !== "1"[\s\S]*?sessionStorage\.removeItem[\s\S]*?document\.getElementById\("settingsBtn"\)\?\.click\(\)[\s\S]*?window\.addEventListener\("pageshow", restoreSettingsAfterLegalV160\)/);
});

test("License is hidden when no official destination or resource exists",()=>{
  assert.doesNotMatch(html,/>ライセンス</);
  assert.doesNotMatch(html,/data-settings-legal="license/);
});

test("Terms, Privacy and Support official sources are cached for offline navigation",()=>{
  assert.match(terms,/CueScore_Terms_of_Use_v1\.0_Official\.md/);
  assert.match(privacy,/CueScore_Privacy_Policy_v1\.0_Official\.md/);
  assert.match(support,/CueScore_Support_v1\.0_Official\.md/);
  for(const path of ["./terms.html","./privacy.html","./support.html","./official-document.js?v=1.0-build64-legal-viewport-v1","./official-pages.css?v=1.0-build64-legal-viewport-v1"])assert.ok(sw.includes(`"${path}"`));
  assert.match(sw,/cache\.put\(event\.request, response\.clone\(\)\)/);
  assert.doesNotMatch(sw,/cache\.put\("\.\/index\.html", response\.clone\(\)\)/);
});

test("Terms, Privacy and Support share an accessible in-page Back control",()=>{
  for(const page of [terms,privacy,support]){
    assert.match(page,/<button class="legal-back-v1" type="button" data-legal-back aria-label="CueScore Appsへ戻る">/);
    assert.match(page,/<path d="m15 4-8 8 8 8"\/>/);
    assert.match(page,/<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">/);
    assert.match(page,/<div class="legal-scroll-v2"><main class="document">/);
    assert.match(page,/official-pages\.css\?v=1\.0-build64-legal-viewport-v1/);
    assert.match(page,/official-document\.js\?v=1\.0-build64-legal-viewport-v1/);
  }
  assert.match(styles,/\.legal-back-v1\{[^}]*min-width:48px;min-height:48px/);
  assert.match(styles,/padding-top:env\(safe-area-inset-top\)/);
  assert.match(styles,/min-height:calc\(60px \+ env\(safe-area-inset-top\)\)/);
  assert.match(styles,/body\{[^}]*height:100dvh[^}]*grid-template-rows:auto minmax\(0,1fr\)[^}]*overflow:hidden/);
  assert.match(styles,/\.site-header\{position:relative/);
  assert.match(styles,/\.legal-scroll-v2\{[^}]*min-height:0[^}]*overflow-y:auto/);
});

test("About close removes only its yellow focus and tap ring",()=>{
  assert.match(html,/\.cue-about-card-v1 button:focus,\.cue-about-card-v1 button:focus-visible\{outline:none!important;outline-color:transparent!important;box-shadow:none!important\}/);
  assert.match(html,/\.cue-about-card-v1 button\{-webkit-tap-highlight-color:transparent\}/);
  assert.match(html,/about\.querySelector\("button"\)\?\.addEventListener\("click",\(\) => about\.close\(\)\)/);
  assert.doesNotMatch(html,/\*:focus\s*\{[^}]*outline\s*:\s*none/);
});

test("Official Markdown is rendered as safe semantic DOM instead of raw Markdown text",()=>{
  for(const page of [terms,privacy,support]){
    assert.match(page,/<article class="official-document-v2" data-document/);
    assert.doesNotMatch(page,/<pre data-document>/);
    for(const destination of ["privacy.html","terms.html","support.html"])assert.ok(page.includes(`./${destination}`));
  }
  assert.match(script,/fetch\(source\)[\s\S]*?renderOfficialMarkdown\(text,output\)/);
  for(const tag of ["h${heading[1].length}","ul","li","strong","code","a","hr"])assert.ok(script.includes(`document.createElement(${tag.startsWith("h$")?"`":"\""}${tag}${tag.startsWith("h$")?"`":"\""})`));
  assert.match(script,/\["http:","https:","mailto:"\]\.includes\(url\.protocol\)/);
  assert.doesNotMatch(script,/innerHTML\s*=/);
  assert.match(styles,/\.official-document-v2\{min-width:0;overflow-wrap:anywhere/);
});

test("Published support contact exists and pre-release TODO text is absent",()=>{
  assert.match(supportMarkdown,/\[cuescore\.apps@gmail\.com\]\(mailto:cuescore\.apps@gmail\.com\)/);
  assert.match(supportMarkdown,/https:\/\/takaakimailbox-star\.github\.io\/cuescore-apps\/support\.html/);
  const published=[supportMarkdown,privacyMarkdown,termsMarkdown].join("\n");
  for(const todo of ["公開前必須設定","公開前に必ず","［公開URLを設定］","［公開用メールアドレスを設定］","［必要に応じて設定］"]){
    assert.doesNotMatch(published,new RegExp(todo));
  }
});

test("Settings child Back controls show only the arrow and retain destination labels",()=>{
  assert.match(html,/data-suite-back="\$\{back\}" aria-label="\$\{back === "settings" \? "設定へ戻る" : "クラウド同期へ戻る"\}">\$\{icon\.back\}<\/button>/);
  assert.doesNotMatch(html,/\$\{icon\.back\}<span>\$\{back === "settings"/);
});

test("legal Back returns directly to Settings even after website navigation and safely falls back to Home",()=>{
  assert.match(script,/window\.location\.assign\(homeUrl\)/);
  assert.doesNotMatch(script,/window\.history\.back\(\)/);
});

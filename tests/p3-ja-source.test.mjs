import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { jaSource as resolve } from "./helpers/ja-source.mjs";
// The sample sources are written with "@T(" so that this very file never contains a real call marker (other tests read every test file through the patched fs).
const jaSource = (src, catalog) => resolve(src.replaceAll("@T(", "window.cueT("), catalog);

// P3 test infrastructure: jaSource() restores the Japanese text that production code now resolves through @T("p3.…").
const C = { "p3.aaaaaaaa": "保存", "p3.bbbbbbbb": "{n}件", "p3.cccccccc": "目標 {a}点・{b}", "p3.dddddddd": "確認\n続けますか？", "p3.eeeeeeee": "{count}試合" };

test("a standalone call returns the original quote style (key quote = original literal quote)", () => {
  assert.equal(jaSource('el.textContent = @T("p3.aaaaaaaa");', C), 'el.textContent = "保存";');
  assert.equal(jaSource("el.textContent = @T('p3.aaaaaaaa');", C), "el.textContent = '保存';");
  assert.equal(jaSource("el.textContent = @T(`p3.aaaaaaaa`);", C), "el.textContent = `保存`;");
});
test("calls inside templates and concatenations merge back into the surrounding literal", () => {
  assert.equal(jaSource('h=`<b>${@T("p3.aaaaaaaa")}</b>${@T("p3.bbbbbbbb",{n:list.length})}`;', C), "h=`<b>保存</b>${list.length}件`;");
  assert.equal(jaSource('h="<b>" + @T("p3.aaaaaaaa") + "</b>";', C), 'h="<b>保存</b>";');
  assert.equal(jaSource("h='<b>' + @T('p3.aaaaaaaa') + '</b>';", C), "h='<b>保存</b>';");
});
test("parameters keep their original expression text, including nested calls and multi-line padding", () => {
  assert.equal(jaSource('t=@T(`p3.cccccccc`,{a:f(x,{y:1}),b:"z"});', C), 't=`目標 ${f(x,{y:1})}点・${"z"}`;');
  assert.equal(jaSource('t=`${@T("p3.bbbbbbbb",{n:\n  a ? b : c\n})}`;', C), "t=`${\n  a ? b : c\n}件`;");
});
test("newlines in a message become escape sequences and the plural count helper argument is not shown", () => {
  assert.equal(jaSource('ok=window.confirm(@T("p3.dddddddd"));', C), 'ok=window.confirm("確認\\n続けますか？");');
  assert.equal(jaSource('t=@T(`p3.eeeeeeee`,{count:n.length});', C), "t=`試合`;".replace("試合", "${n.length}試合"));
});
test("static data-i18n keys are removed and source without keys is returned unchanged", () => {
  assert.equal(jaSource('<button class="x" data-i18n="p3.aaaaaaaa" aria-label="閉じる" data-i18n-aria-label="p3.bbbbbbbb">保存</button>', C), '<button class="x" aria-label="閉じる">保存</button>');
  const plain = 'const a = "日本語"; @T("log.key");';
  assert.equal(jaSource(plain, C), plain.replaceAll("@T(", "window.cueT("));
});
test("an unknown p3 key is reported instead of being silently skipped", () => {
  assert.throws(() => jaSource('x=@T("p3.00000000");', C), /not in ja catalog/);
});

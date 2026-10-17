import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

// Decision 037 / Official 119 (PD-P4A-B, PD-P4A-C): the PO-approved wording for the 9 R3 keys and the two clarified terms.
// The stored values (target numbers, JPA dead-ball counts, resultLabel canonical values) are unchanged; only display text moves.
const require = createRequire(import.meta.url);
const cat = { ja: require("../i18n-catalog-ja-v1.js"), en: require("../i18n-catalog-en-v1.js"), zh: require("../i18n-catalog-zh-hans-v1.js") };
const expect = {
  // 3 Cushion 持ち点: each player's target points (en: Target points / zh-Hans: 目标分)
  "home.condition.startingPoints": ["持ち点", "Target points", "目标分"],
  "p3.4746cc5f": ["持ち点", "Target points", "目标分"],
  "p3.49d49b41": ["おすすめ持ち点", "Recommended target points", "推荐目标分"],
  "p3.a9b376d6": ["持ち点を選択", "Select target points", "选择目标分"],
  "p3.b36868e0": ["持ち点制", "Target-points format", "目标分制"],
  // JPA Dead Ball (en keeps "Dead")
  "p3.393999a9": ["デッド", "Dead", "无效球"],
  "p3.37634bac": ["ラック、イニング、デッド累計", "Rack, inning and dead ball totals", "局数、回合数和无效球累计"],
  "p3.7310d74f": ["直前に選択したボールをデッドにする", "Mark the last selected ball as dead", "将刚选择的球标记为无效球"],
  // 14-1 opening break foul
  "p3.2e56fdaa": ["オープニングブレイクファール", "Opening break foul", "首次开球犯规"],
  // clarified terms
  "p3.a21d9543": ["3ファール", "3 consecutive fouls", "连续3次犯规"],
  "mapper.resultLabel.foulBreakChange": ["ファール（ブレイク交代）", "Foul (break passes to opponent)", "犯规（交换开球）"],
};
test("PO-approved wording is in the catalogs and ja is untouched", () => {
  for (const [key, [ja, en, zh]] of Object.entries(expect)) {
    assert.equal(cat.ja[key], ja, `${key} ja`);
    assert.equal(cat.en[key], en, `${key} en`);
    assert.equal(cat.zh[key], zh, `${key} zh`);
  }
});
test("the old wording is gone (Starting points / 持分 / 死球 / hyphenated Break-and-run)", () => {
  const text = o => Object.values(o).map(v => typeof v === "object" ? Object.values(v).join(" ") : v).join("\n");
  assert.doesNotMatch(text(cat.en), /[Ss]tarting points/);
  assert.doesNotMatch(text(cat.zh), /持分|死球/);
  assert.doesNotMatch(text(cat.en), /[Bb]reak-and-run/);
});
test("terms kept as approved: Break and run / Rack / High run / First, Second / Push out / Inning", () => {
  assert.equal(cat.en["p3.d3bde92d"], "Break and run");
  assert.equal(cat.zh["p3.d3bde92d"], "清台");
  assert.equal(cat.en["p3.e03b7761"], "Rack");
  assert.equal(cat.zh["p3.e03b7761"], "局");
  assert.equal(cat.en["p3.761345d1"], "High run");
  assert.equal(cat.en["p3.873e0204"], "First");
  assert.equal(cat.en["p3.890ca109"], "Second");
  assert.equal(cat.en["p3.42a55623"], "Push out");
  assert.equal(cat.zh["p3.42a55623"], "推出球");
  assert.equal(cat.en["p3.36e33545"], "Inning");
  assert.equal(cat.zh["p3.36e33545"], "回合");
});

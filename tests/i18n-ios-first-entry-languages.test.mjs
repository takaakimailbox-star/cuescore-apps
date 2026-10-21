import "./helpers/ja-fs.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { core } from "./helpers/i18n-ja-catalog.mjs";

// Decision 044 / Official 131 (AC-U10-1, AC-U10-2): navigator.languages values observed on iOS (first preferred language only, region form).
// Observed: iOS 26.5 Simulator WKWebView (Evidence 88, 16 patterns) and iPhone 16e iOS 26.6.2 Mobile Safari (Evidence 96, 4 configurations).
// The resolver is unchanged; this table documents the effective result for the observed input forms. It is not a guarantee for every iOS version.
const observedFirstEntry = [
  [["ja"], "ja"], [["en-US"], "en"], [["zh-CN"], "zh-Hans"], [["zh-TW"], "ja"], [["zh-HK"], "ja"], [["fr-FR"], "ja"], [["ko-KR"], "ja"],
];
const observedDevicePreferenceLists = [
  // [OS preferred-language list, observed Safari navigator.languages (first entry only), expected resolution]
  [["ja"], ["ja"], "ja"], [["en-US", "ja"], ["en-US"], "en"], [["zh-CN", "en-US", "ja"], ["zh-CN"], "zh-Hans"], [["zh-HK", "zh-CN", "en-US", "ja"], ["zh-HK"], "ja"],
];
const simulatorPreferenceLists = [
  [["zh-Hant", "en"], ["zh-TW"], "ja"], [["en", "zh-Hant"], ["en-US"], "en"], [["zh-Hans", "zh-Hant"], ["zh-CN"], "zh-Hans"], [["zh-Hant", "zh-Hans"], ["zh-TW"], "ja"],
  [["ko", "zh-Hant", "en"], ["ko-KR"], "ja"], [["ko", "zh-Hant", "zh-Hans"], ["ko-KR"], "ja"], [["ja", "zh-Hant"], ["ja"], "ja"],
];

test("observed iOS first-entry inputs resolve as recorded (resolver unchanged)", () => {
  for (const [languages, expected] of observedFirstEntry) assert.equal(core.resolveDeviceLanguage(languages).language, expected, JSON.stringify(languages));
  for (const [, observed, expected] of [...observedDevicePreferenceLists, ...simulatorPreferenceLists]) assert.equal(core.resolveDeviceLanguage(observed).language, expected, JSON.stringify(observed));
});

test("the documented divergence: a list whose first entry is unsupported resolves to the supported later entry only when the later entries are supplied", () => {
  // Official 108 section 3 (list input) is unchanged and still expected by the resolver.
  assert.equal(core.resolveDeviceLanguage(["ko-KR", "zh-Hant-TW", "en-US"]).language, "en");
  assert.equal(core.resolveDeviceLanguage(["ko-KR", "en-US"]).language, "en");
  // iOS supplies only the first entry, so the same OS preference order resolves to ja.
  assert.equal(core.resolveDeviceLanguage(["ko-KR"]).language, "ja");
  assert.equal(core.resolveDeviceLanguage(["zh-TW"]).language, "ja");
});

test("a Traditional-Chinese-first device resolves to ja whether or not later entries are supplied (U10)", () => {
  for (const languages of [["zh-TW"], ["zh-TW", "en-US"], ["zh-HK", "zh-CN", "en-US", "ja"], ["zh-Hant-TW", "zh-Hans-CN"]]) assert.equal(core.resolveDeviceLanguage(languages).language, "ja", JSON.stringify(languages));
});

test("a stored manual preference still wins over any device list (resolver contract)", () => {
  const stored = { getItem: () => "en" };
  const result = core.resolve({ storage: stored, languages: ["ko-KR"] });
  assert.equal(result.language, "en");
});

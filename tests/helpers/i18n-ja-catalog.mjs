// Existing tests asserted Japanese literals that now live in the canonical ja catalog.
// They keep asserting the same product text through this helper (no expectation is weakened).
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
export const core = require("../../i18n-v1.js");
export const ja = require("../../i18n-catalog-ja-v1.js");
export const jaText = (key, params) => core.createI18n({ language: "ja", storage: null }).t(key, params);

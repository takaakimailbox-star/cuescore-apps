/*
 * P1 runtime harness (browser side). NOT part of `node --test`.
 *
 * Load it into a page served from the P1 worktree, e.g.
 *   const s=document.createElement("script");s.src="/tests/browser/p1-runtime-harness.js";document.head.appendChild(s);
 * It drives the real application (no mocks) and posts evidence to a local sink (POST /save?name=...).
 * Used for: Japanese-invariance DOM capture, snapshot identity, language switching against
 * saved interrupted matches (Official 108 C1-C6 / T-SW-1..10).
 */
(() => {
  const h = window.__h = window.__h || {};
  // The embedded browser pane reports document.hidden=true and only produces frames on demand, which stalls
  // requestAnimationFrame. Timer-based frames keep the real application logic running during the flows.
  if (!window.__rafPatched) {
    window.__rafPatched = true;
    window.requestAnimationFrame = callback => setTimeout(() => callback(performance.now()), 16);
    window.cancelAnimationFrame = id => clearTimeout(id);
  }
  const SINK = "http://127.0.0.1:8780/save?name=";
  h.wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  h.waitFor = async (fn, timeout = 6000, step = 50) => {
    const started = Date.now();
    for (;;) {
      try { const value = await fn(); if (value) return value; } catch (_) { /* retry */ }
      if (Date.now() - started > timeout) throw new Error("waitFor timeout: " + String(fn).slice(0, 100));
      await h.wait(step);
    }
  };
  h.save = (name, data) => fetch(SINK + encodeURIComponent(name), { method: "POST", body: JSON.stringify(data) }).then(response => response.text());
  h.hex = buffer => [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, "0")).join("");
  h.sha256 = async text => h.hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
  h.store = () => Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)]));
  h.hashes = async (filter = () => true) => {
    const out = {};
    for (const [key, value] of Object.entries(h.store())) if (filter(key)) out[key] = await h.sha256(value);
    return out;
  };

  /* Ordered text and accessibility strings of the whole document (hidden overlays included). */
  h.dump = () => {
    const out = ["html lang=" + document.documentElement.lang];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.currentNode;
    const skip = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]);
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        if (parent && skip.has(parent.tagName)) continue;
        if (parent && parent.closest("svg")) continue;
        const text = node.textContent.replace(/\s+/g, " ").trim();
        if (text) out.push("T " + text);
      } else if (node.nodeType === Node.ELEMENT_NODE && !skip.has(node.tagName)) {
        for (const attribute of ["aria-label", "placeholder", "title", "alt"]) {
          const value = node.getAttribute(attribute);
          if (value) out.push("@" + attribute + " " + value.replace(/\s+/g, " ").trim());
        }
      }
    }
    return out;
  };

  /* Storage write trap (class C check). The log of localStorage writes is mirrored into sessionStorage
     (key __h_writes) so it survives the reload that follows a language change. */
  h.trapStart = () => {
    if (h._orig) return;
    h.writes = [];
    const proto = Storage.prototype;
    h._orig = { set: proto.setItem, remove: proto.removeItem, clear: proto.clear };
    const persist = () => h._orig.set.call(sessionStorage, "__h_writes", JSON.stringify(h.writes));
    const track = (storage, entry) => { if (storage === window.localStorage) { h.writes.push(entry); persist(); } };
    proto.setItem = function (key, value) { track(this, { op: "set", key, length: String(value).length, value: String(value).slice(0, 40) }); return h._orig.set.call(this, key, value); };
    proto.removeItem = function (key) { track(this, { op: "remove", key }); return h._orig.remove.call(this, key); };
    proto.clear = function () { track(this, { op: "clear" }); return h._orig.clear.call(this); };
    persist();
  };
  h.trapStop = () => {
    if (!h._orig) return h.writes || [];
    Storage.prototype.setItem = h._orig.set; Storage.prototype.removeItem = h._orig.remove; Storage.prototype.clear = h._orig.clear;
    h._orig = null;
    return h.writes;
  };
  h.persistedWrites = () => JSON.parse(sessionStorage.getItem("__h_writes") || "[]");
  h.session = {
    get: key => { const raw = sessionStorage.getItem("__h_" + key); return raw === null ? null : JSON.parse(raw); },
    set: (key, value) => sessionStorage.setItem("__h_" + key, JSON.stringify(value))
  };

  /* JSON audit: every string value that contains Japanese characters (C5 snapshot audit). */
  h.jaStrings = (value, path = "$", out = []) => {
    const JA = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
    if (typeof value === "string") { if (JA.test(value)) out.push({ path, value }); }
    else if (Array.isArray(value)) value.forEach((item, index) => h.jaStrings(item, `${path}[${index}]`, out));
    else if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) h.jaStrings(item, `${path}.${key}`, out);
    return out;
  };

  /* Application flows (real UI). */
  h.tab = async key => { document.querySelector(`[data-phase1-tab="${key}"]`).click(); await h.wait(700); };
  h.seedPlayers = () => {
    const now = Date.now();
    const make = (id, name, primary, index) => ({ id, name, avatar: { type: "default", id: "default_silhouette" }, race: 120, skillLevel: 2, memo: "", isPrimary: primary, createdAt: now - 100000 - index, updatedAt: now - 100000 - index, lastUsed: now - 100000 - index });
    localStorage.setItem("rotationScoreboard.players.v1", JSON.stringify([make("p_fix_1", "テスト太郎", true, 1), make("p_fix_2", "Alice", false, 2), make("p_fix_3", "王小明", false, 3)]));
  };
  h.startMatch = async (discipline, p2id = "p_fix_2", opts = {}) => {
    await h.tab("home");
    if (!document.getElementById("cueHomeV1").classList.contains("match-setup-active-v3")) { document.querySelector("#cueDisciplineSwitcherV1 [data-discipline]").click(); await h.wait(500); }
    document.querySelector(`.cue-discipline-v1[data-discipline="${discipline}"]`).click(); await h.wait(600);
    if (!document.getElementById("p2Name").value) {
      document.getElementById("p2PlayerSearchBtn").click(); await h.wait(500);
      document.querySelector(`[data-select-player="${p2id}"]`).click(); await h.wait(500);
    }
    if (opts.skill) for (const id of ["p1Skill", "p2Skill"]) { const input = document.getElementById(id); input.value = String(opts.skill); input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); }
    if (opts.race) for (const id of ["p1Race", "p2Race"]) { const input = document.getElementById(id); input.value = String(opts.race); input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); }
    await h.waitFor(() => !document.getElementById("startGameBtn").disabled, 10000);
    document.getElementById("startGameBtn").click();
    await h.waitFor(() => document.querySelector(".app").classList.contains("pro-game-mode"), 6000);
    await h.wait(600);
    return { discipline, guard: window.CueScoreLanguageGuardV1 ? window.CueScoreLanguageGuardV1.state() : null };
  };
  h.pagehide = () => window.dispatchEvent(new Event("pagehide"));
  h.hidden = hidden => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
    document.dispatchEvent(new Event("visibilitychange"));
  };
  // In Demo mode the in-progress snapshot lives under the demo-namespaced settings key (CueScoreDemoData.resolveSettingKey).
  h.snapKey = () => (window.CueScoreDemoData && window.CueScoreDemoData.resolveSettingKey ? window.CueScoreDemoData.resolveSettingKey("cueScore.inProgressMatch.v1") : "cueScore.inProgressMatch.v1");
  h.isSnapKey = key => key === "cueScore.inProgressMatch.v1" || key === "cuescore-demo.settings.cueScore.inProgressMatch.v1";
  h.snapshotRaw = () => localStorage.getItem(h.snapKey());
  h.openLanguage = async () => {
    await h.tab("settings");
    document.querySelector("[data-settings-open-language]").click(); await h.wait(500);
    return h.languageUi();
  };
  h.languageUi = () => {
    const radios = [...document.querySelectorAll('input[name="suiteLanguage"]')];
    return {
      checked: radios.find(input => input.checked)?.value || null,
      disabled: radios.map(input => input.disabled),
      applyDisabled: document.getElementById("suiteLanguageApply").disabled,
      status: document.getElementById("suiteLanguageStatus").textContent
    };
  };
  h.chooseLanguage = value => { const input = document.querySelector(`input[name="suiteLanguage"][value="${value}"]`); input.click(); return input.checked; };
  h.applyLanguage = () => document.getElementById("suiteLanguageApply").click();
  h.deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  /* ---------- S-B scenario (Official 108 C1-C6, T-SW-1/2/3/4/7) ---------- */
  const SNAPSHOT_KEY = "cueScore.inProgressMatch.v1";
  const LANGUAGE_KEY = "cueScore.language.v1";
  const HTML_LANG = { ja: "ja", en: "en", "zh-Hans": "zh-Hans" };
  h.hiddenState = value => { if (value === undefined) delete document.hidden; else Object.defineProperty(document, "hidden", { configurable: true, get: () => value }); };
  const diffKeys = (before, after) => {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    return [...keys].filter(key => before[key] !== after[key]).sort();
  };
  h.waitBoot = async () => { await h.waitFor(() => !document.documentElement.classList.contains("cue-app-booting-v2"), 10000); await h.wait(900); };

  // Step P: start a real match, check S-A, refuse a language change, background the app (snapshot), then restart the page.
  h.sbPrepare = async discipline => {
    await h.waitBoot();
    const started = await h.startMatch(discipline);
    const guardLive = window.CueScoreLanguageGuardV1.state();
    h.trapStart();
    let reloadCalled = false;
    const refusal = window.CueScoreI18nV1.requestLanguageChange("en", { guard: window.CueScoreLanguageGuardV1, storage: window.localStorage, reload: () => { reloadCalled = true; } });
    const refusalWrites = h.trapStop();
    h.pagehide();
    const raw1 = h.snapshotRaw();
    h.hiddenState(true); document.dispatchEvent(new Event("visibilitychange")); h.hiddenState(undefined);
    const raw2 = h.snapshotRaw();
    const parsed = JSON.parse(raw2);
    const audit = h.jaStrings(parsed);
    h.session.set("sb", { discipline, raw: raw2, sha: await h.sha256(raw2), type: parsed.state.activeGameTypeV1, guardLive, refusal: { ok: refusal.ok, code: refusal.code }, reloadCalled, refusalWrites: refusalWrites.length, audit, stateKeys: Object.keys(parsed.state).length });
    sessionStorage.removeItem("__h_writes");
    setTimeout(() => location.reload(), 80);
    return { discipline, type: parsed.state.activeGameTypeV1, guardLive: guardLive.state, refusal: refusal.code, reloadCalled, refusalWrites: refusalWrites.length, snapshotBytes: raw2.length, stateKeys: Object.keys(parsed.state).length, jaStrings: audit };
  };

  // Step S0: cold start #1 with the saved interrupted match (S-B). Records the baseline, then performs the CONTROL reload.
  h.sbCold = async () => {
    await h.waitBoot();
    const rec = h.session.get("sb");
    const rawNow = h.snapshotRaw();
    const guard = window.CueScoreLanguageGuardV1.state();
    const card = document.getElementById("cueResumeCardV1");
    const hashesOther = await h.hashes(key => key !== SNAPSHOT_KEY);
    h.trapStart();
    h.pagehide(); h.hiddenState(true); document.dispatchEvent(new Event("visibilitychange")); h.hiddenState(false); document.dispatchEvent(new Event("visibilitychange")); h.hiddenState(undefined);
    const lifecycleWrites = h.trapStop();
    // The real unload of the page that was recording persists once more (new savedAt), so the cold-start snapshot is the
    // at-rest reference. Its state must equal what the recording page had saved.
    const coldParsed = JSON.parse(rawNow), recParsed = JSON.parse(rec.raw);
    const coldStateEqual = h.deepEqual(coldParsed.state, recParsed.state) && h.deepEqual(coldParsed.undoHistory, recParsed.undoHistory);
    h.session.set("sb0", { rawCold: rawNow, coldStateEqual, guard, cardVisible: !card.hidden, cardAria: card.getAttribute("aria-label"), hashesOther, lifecycleWrites, rawAfterLifecycle: h.snapshotRaw() === rawNow });
    sessionStorage.removeItem("__h_writes");
    setTimeout(() => location.reload(), 80);
    return { coldStateEqual, guard: guard.state, allow: guard.allowSavedInterrupted, cardVisible: !card.hidden, lifecycleWrites: lifecycleWrites.length, rawAfterLifecycle: h.snapshotRaw() === rawNow };
  };

  // Until the next reload, drop writes to the snapshot key. Used only to discard a mounted game without letting the
  // real pagehide persist overwrite the at-rest snapshot that the next step needs.
  h.blockSnapshot = () => {
    const proto = Storage.prototype, set = proto.setItem, remove = proto.removeItem;
    proto.setItem = function (key, value) { if (this === window.localStorage && h.isSnapKey(key)) return; return set.call(this, key, value); };
    proto.removeItem = function (key) { if (this === window.localStorage && h.isSnapKey(key)) return; return remove.call(this, key); };
  };

  // Step C: after the control reload. Resume WITHOUT any language change to learn what the existing restore path itself
  // normalises (the pre-enumerated fluctuation set), then discard the mounted game and keep the at-rest snapshot.
  h.sbControl = async () => {
    await h.waitBoot();
    const rec = h.session.get("sb"), s0 = h.session.get("sb0");
    const hashesOther = await h.hashes(key => key !== SNAPSHOT_KEY);
    const controlDiff = diffKeys(s0.hashesOther, hashesOther);
    const controlRaw = h.snapshotRaw() === s0.rawCold;
    document.getElementById("cueResumeCardV1").click();
    await h.waitFor(() => document.querySelector(".app").classList.contains("pro-game-mode"), 8000); await h.wait(700);
    h.pagehide();
    const ctrl = JSON.parse(h.snapshotRaw()), original = JSON.parse(s0.rawCold);
    const tolerated = Object.keys(original.state).filter(key => !h.deepEqual(original.state[key], ctrl.state[key])).concat(Object.keys(ctrl.state).filter(key => !(key in original.state))).sort();
    h.session.set("sbc", { state: ctrl.state, undo: ctrl.undoHistory, tolerated, undoEqualToOriginal: h.deepEqual(original.undoHistory, ctrl.undoHistory) });
    h.session.set("sb1h", { hashesOther, controlDiff, controlRaw });
    // Fixture step: put the at-rest snapshot back (the control resume above persisted a normalised copy), then block the
    // pagehide persist of the mounted game while the page reloads.
    localStorage.setItem(SNAPSHOT_KEY, s0.rawCold);
    h.blockSnapshot();
    setTimeout(() => location.reload(), 80);
    return { controlDiff, controlRaw, tolerated, undoEqualToOriginal: h.deepEqual(original.undoHistory, ctrl.undoHistory) };
  };

  // Step S1: after the control resume + discard. Open the language screen and switch language with the write trap on (reload follows).
  h.sbSwitch = async language => {
    await h.waitBoot();
    const s0 = h.session.get("sb0"), s1h = h.session.get("sb1h");
    const hashesOther = await h.hashes(key => key !== SNAPSHOT_KEY);
    const controlDiff = s1h.controlDiff;
    const controlRaw = h.snapshotRaw() === s0.rawCold; // the at-rest snapshot survived the control resume + discard
    const guard = window.CueScoreLanguageGuardV1.state();
    const ui = await h.openLanguage();
    const checked = h.chooseLanguage(language);
    h.trapStart();
    h.session.set("sb1", { language, controlDiff, controlRaw, guard, ui, hashesOther, checked });
    h.applyLanguage();
    return { language, controlDiff, controlRaw, guard: guard.state, ui, checked };
  };

  // Step V: after the switch reload. Verify C1/C2, language, then resume and compare the restored state (C3) and S-A (T-SW-4).
  h.sbVerify = async () => {
    await h.waitBoot();
    const rec = h.session.get("sb"), s1 = h.session.get("sb1");
    const writes = h.persistedWrites();
    const s0 = h.session.get("sb0");
    const rawSame = h.snapshotRaw() === s0.rawCold;
    const hashesOther = await h.hashes(key => key !== SNAPSHOT_KEY && key !== LANGUAGE_KEY);
    const before = { ...s1.hashesOther }; delete before[LANGUAGE_KEY];
    const switchDiff = diffKeys(before, hashesOther);
    const guard = window.CueScoreLanguageGuardV1.state();
    const card = document.getElementById("cueResumeCardV1");
    const result = {
      language: window.CueScoreI18n.language, htmlLang: document.documentElement.lang, languageOk: window.CueScoreI18n.language === s1.language && document.documentElement.lang === HTML_LANG[s1.language],
      storedPreference: localStorage.getItem(LANGUAGE_KEY), writes, onlyLanguageWritten: writes.length === 1 && writes[0].op === "set" && writes[0].key === LANGUAGE_KEY && writes[0].value === s1.language,
      rawSame, switchDiff, guard: guard.state, cardVisible: !card.hidden, cardAria: card.getAttribute("aria-label"), controlDiff: s1.controlDiff
    };
    card.click();
    await h.waitFor(() => document.querySelector(".app").classList.contains("pro-game-mode"), 8000); await h.wait(700);
    result.guardAfterResume = window.CueScoreLanguageGuardV1.state().state;
    h.trapStart(); let reloaded = false;
    const refusal = window.CueScoreI18nV1.requestLanguageChange(s1.language === "ja" ? "en" : "ja", { guard: window.CueScoreLanguageGuardV1, storage: window.localStorage, reload: () => { reloaded = true; } });
    result.refusalAfterResume = { ok: refusal.ok, code: refusal.code, reloaded, writes: h.trapStop().length };
    h.pagehide();
    const restored = JSON.parse(h.snapshotRaw()), original = JSON.parse(rec.raw);
    const ctrl = h.session.get("sbc");
    const diffFromOriginal = Object.keys(original.state).filter(key => !h.deepEqual(original.state[key], restored.state[key])).concat(Object.keys(restored.state).filter(key => !(key in original.state))).sort();
    result.restoredType = restored.state.activeGameTypeV1;
    result.equalToControlRestore = h.deepEqual(restored.state, ctrl.state) && h.deepEqual(restored.undoHistory, ctrl.undo);
    result.diffFromOriginal = diffFromOriginal;
    result.tolerated = ctrl.tolerated;
    result.diffWithinTolerated = diffFromOriginal.every(key => ctrl.tolerated.includes(key));
    result.undoEqualToOriginal = h.deepEqual(restored.undoHistory, original.undoHistory);
    result.stateEqual = diffFromOriginal.length === 0;
    await h.save(`sb_${rec.discipline}_${s1.language}.json`, { rec: { ...rec, raw: undefined }, s0: { ...h.session.get("sb0"), hashesOther: undefined }, s1: { ...s1, hashesOther: undefined }, ctrl: { tolerated: ctrl.tolerated }, result });
    return result;
  };
    h.reset = () => { localStorage.clear(); sessionStorage.clear(); h.seedPlayers(); setTimeout(() => location.reload(), 50); return "reset"; };

  /* ---------- unattended plan runner (survives reloads through sessionStorage) ---------- */
  h.planGet = () => { try { return JSON.parse(sessionStorage.getItem("__h_plan") || "null"); } catch (_) { return null; } };
  h.planSet = plan => sessionStorage.setItem("__h_plan", JSON.stringify(plan));
  const sbSummary = (item, r) => {
    const sb = h.session.get("sb"), s0 = h.session.get("sb0"), s1 = h.session.get("sb1");
    const expectedType = { "9ball": "nineBall", "10ball": "tenBall", rotation: "rotation", straightPool: "straightPool", jpa9: "jpa9Ball", threeCushion: "threeCushion" }[item.discipline];
    const checks = {
      "requested discipline was recorded": sb.type === expectedType && r.restoredType === expectedType,
      "T-SW-1 recording is S-A and refuses without writing": sb.guardLive.state === "S-A" && sb.refusal.code === "BLOCKED_ACTIVE_MATCH" && !sb.reloadCalled && sb.refusalWrites === 0,
      "T-SW-3 lifecycle events without a live context do not touch the snapshot": s0.lifecycleWrites.length === 0 && s0.rawAfterLifecycle,
      "cold start: saved interrupted match is S-B with the resume card": s0.guard.state === "S-B" && s0.cardVisible && s0.coldStateEqual,
      "control reload changes no other key": s1.controlDiff.length === 0,
      "C1 only cueScore.language.v1 was written": r.onlyLanguageWritten,
      "C2 snapshot raw value is byte-identical": r.rawSame,
      "switch changes no other key (Class A/B)": r.switchDiff.length === 0,
      "language + html lang applied": r.languageOk,
      "S-B before resume": r.guard === "S-B",
      "resume card is rendered in the new language": r.cardVisible,
      "C3 restore equals the no-switch restore": r.equalToControlRestore && r.diffWithinTolerated && r.undoEqualToOriginal,
      "T-SW-4 S-A after resume refuses a language change": r.guardAfterResume === "S-A" && r.refusalAfterResume.code === "BLOCKED_ACTIVE_MATCH" && !r.refusalAfterResume.reloaded && r.refusalAfterResume.writes === 0
    };
    return { item, type: r.restoredType, checks, pass: Object.values(checks).every(Boolean), tolerated: r.tolerated, diffFromOriginal: r.diffFromOriginal, jaStrings: sb.audit, stateKeys: sb.stateKeys, cardAria: r.cardAria, language: r.language };
  };
  /* B-2: the same input sequence recorded under different UI languages must store identical domain data. */
  h.normalize = value => JSON.stringify(value)
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, "<iso>")
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "<uuid>")
    .replace(/"(savedAt|currentGameStartedAt|startedAt|endedAt|timestamp|createdAt|updatedAt|ts|time|at)":\d{10,}/g, '"$1":<epoch>')
    .replace(/(game|session|record|event|rack)[A-Za-z]*(Id|ID)":"[^"]+"/g, '$1Id":"<id>"');
  h.recRun = async language => {
    await h.waitBoot();
    const lang = [document.documentElement.lang, window.CueScoreI18n.language, document.querySelector(".cue-home-menu-v3 strong").textContent];
    await h.startMatch("9ball");
    const ov = document.getElementById("breakResultOverlayV61");
    document.getElementById("breakPlayerP1V1").click(); await h.wait(300);
    [...ov.querySelectorAll("button")].find(b => !b.id && b.textContent.trim() === "1").click(); await h.wait(300);
    document.getElementById("breakResultSaveV695").click(); await h.wait(1200);
    h.pagehide();
    const parsed = JSON.parse(h.snapshotRaw());
    const keep = { state: { ...parsed.state }, undo: parsed.undoHistory };
    return { language, lang, labels: parsed.state.analysisEventsV60.filter(e => e.type === "break_result").map(e => e.resultLabel), normalized: h.normalize(keep), bytes: h.snapshotRaw().length, store: Object.keys(h.store()).sort() };
  };
  h.autoStart = async () => {
    await new Promise(resolve => (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", resolve, { once: true }) : resolve()));
    const plan = h.planGet();
    if (!plan || plan.done) return;
    const item = plan.items ? plan.items[plan.index] : null;
    if (plan.kind === "c3") return h.c3Step(plan);
    if (plan.kind === "t1") return h.t1Step(plan);
    if (plan.kind === "t3") return h.t3Step(plan);
    if (plan.kind === "t7") return h.t7Step(plan);
    if (plan.kind === "t9") return h.t9Step(plan);
    if (plan.kind === "dom") return h.domStep(plan);
    if (plan.kind === "fit") return h.fitStep(plan);
    if (plan.kind === "c3inv") return h.invStep(plan);
    if (plan.kind === "rinv") return h.rinvStep(plan);
    if (plan.kind === "compat") return h.compatStep(plan);
    if (plan.kind === "vis") return h.visStep(plan);
    if (plan.kind === "modal") { // T-SW-8: Interrupted Match modal (resume / new / cancel) behaves identically in every language
      const language = item.language, g = id => document.getElementById(id);
      const openDialog = async () => { document.querySelector('.cue-discipline-v1[data-discipline="9ball"]').click(); await h.wait(600); return !g("cueInProgressChoiceV1").classList.contains("hidden"); };
      try {
        await h.waitBoot();
        if (plan.step === "prepare") {
          await h.startMatch("rotation"); h.pagehide();
          plan.raw = h.snapshotRaw(); plan.step = "check1"; h.planSet(plan); setTimeout(() => location.reload(), 80);
        } else if (plan.step === "check1") {
          const res = { language, htmlLang: document.documentElement.lang, i18n: window.CueScoreI18n.language };
          const rawAtRest = h.snapshotRaw(); // the page that was recording persisted once more on unload, so compare with the at-rest value
          const homeBefore = !g("cueHomeV1").classList.contains("match-setup-active-v3");
          res.cardVisible = !g("cueResumeCardV1").hidden;
          res.opened = await openDialog();
          const dlg = g("cueInProgressChoiceV1"), section = dlg.querySelector("section");
          res.structure = { role: section.getAttribute("role"), modal: section.getAttribute("aria-modal"), labelledby: section.getAttribute("aria-labelledby"), describedby: section.getAttribute("aria-describedby"), buttons: [...dlg.querySelectorAll("button")].map(b => b.id), buttonsEnabled: [...dlg.querySelectorAll("button")].every(b => !b.disabled), ariaHidden: dlg.getAttribute("aria-hidden"), focusId: (document.activeElement || {}).id, bodyClass: document.body.classList.contains("cue-in-progress-choice-visible-v1") };
          res.texts = [...dlg.querySelectorAll("h2,p,button")].map(e => e.textContent.trim());
          g("cueInProgressCancelV1").click(); await h.wait(400);
          res.cancel = { closed: dlg.classList.contains("hidden"), snapshotIntact: h.snapshotRaw() === rawAtRest, stillHome: homeBefore && !g("cueHomeV1").classList.contains("match-setup-active-v3"), noGame: !document.querySelector(".app").classList.contains("pro-game-mode"), bodyClassCleared: !document.body.classList.contains("cue-in-progress-choice-visible-v1") };
          res.reopened = await openDialog();
          g("cueInProgressResumeV1").click(); await h.waitFor(() => document.querySelector(".app").classList.contains("pro-game-mode"), 8000); await h.wait(600);
          res.resume = { gameMounted: true, dialogClosed: dlg.classList.contains("hidden"), guard: window.CueScoreLanguageGuardV1.state().state, type: JSON.parse((h.pagehide(), h.snapshotRaw())).state.activeGameTypeV1 };
          plan.res = plan.res || {}; plan.res[language] = res; plan.step = "check2";
          localStorage.setItem(SNAPSHOT_KEY, plan.raw); h.blockSnapshot(); h.planSet(plan); setTimeout(() => location.reload(), 80);
        } else if (plan.step === "check2") {
          const res = plan.res[language];
          res.openedAgain = await openDialog();
          g("cueInProgressNewV1").click(); await h.wait(900);
          res.newMatch = { snapshotRemoved: h.snapshotRaw() === null, dialogClosed: g("cueInProgressChoiceV1").classList.contains("hidden"), setupActive: g("cueHomeV1").classList.contains("match-setup-active-v3"), noGameYet: !document.querySelector(".app").classList.contains("pro-game-mode"), cardHidden: g("cueResumeCardV1").hidden, selected: document.querySelector('.cue-discipline-v1[aria-selected="true"]')?.dataset.discipline };
          plan.index += 1; plan.step = "prepare";
          if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(plan.name + "_final.json", plan.res); return; }
          h.planSet(plan);
          localStorage.clear(); h.seedPlayers(); const next = plan.items[plan.index]; if (next.language !== "ja") localStorage.setItem(LANGUAGE_KEY, next.language);
          h.blockSnapshot(); setTimeout(() => location.reload(), 60);
        }
      } catch (error) { plan.done = true; plan.error = String(error); h.planSet(plan); await h.save((plan.name || "plan") + "_error.json", { error: String(error), step: plan.step, res: plan.res }); }
      return;
    }
    if (plan.kind === "t6") { // T-SW-6: invalid / unsupported snapshots behave exactly as before, with or without a language change
      const key = SNAPSHOT_KEY, names = Object.keys(plan.cases), name = names[plan.index];
      const outcome = () => (localStorage.getItem(key) === null ? "deleted-by-existing-reader" : localStorage.getItem(key) === plan.cases[name] ? "kept" : "changed");
      try {
        await h.waitBoot();
        plan.res[name] = plan.res[name] || {};
        if (plan.step === "control") {
          localStorage.setItem(key, plan.cases[name]);
          const g1 = window.CueScoreLanguageGuardV1.state().state, g2 = window.CueScoreLanguageGuardV1.state().state;
          Object.assign(plan.res[name], { peekStates: [g1, g2], peekLeftRawIntact: localStorage.getItem(key) === plan.cases[name] });
          plan.step = "control-reload"; h.planSet(plan); h.blockSnapshot(); setTimeout(() => location.reload(), 60);
        } else if (plan.step === "control-reload") {
          plan.res[name].afterControlReload = outcome();
          localStorage.setItem(key, plan.cases[name]);
          const ui = await h.openLanguage(); h.chooseLanguage("en");
          plan.res[name].uiEnabled = !ui.disabled.some(Boolean) && !ui.applyDisabled;
          plan.step = "verify"; h.planSet(plan); h.trapStart(); h.blockSnapshot(); h.applyLanguage();
        } else if (plan.step === "verify") {
          Object.assign(plan.res[name], { afterSwitchReload: outcome(), switchWrites: h.persistedWrites().map(w => w.op + ":" + w.key), language: window.CueScoreI18n.language });
          plan.res[name].sameAsControl = plan.res[name].afterSwitchReload === plan.res[name].afterControlReload;
          plan.index += 1; plan.step = "control";
          if (plan.index >= names.length) { plan.done = true; h.planSet(plan); await h.save(plan.name + "_final.json", plan.res); return; }
          h.planSet(plan);
          localStorage.clear(); h.seedPlayers(); h.blockSnapshot(); setTimeout(() => location.reload(), 60);
        }
      } catch (error) { plan.done = true; plan.error = String(error); h.planSet(plan); await h.save(plan.name + "_error.json", { error: String(error), step: plan.step, res: plan.res }); }
      return;
    }
    if (plan.kind === "rec") {
      try {
        const result = await h.recRun(item.language);
        plan.results.push(result); plan.index += 1;
        if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(plan.name + "_final.json", plan.results); return; }
        h.planSet(plan);
        localStorage.clear(); h.seedPlayers();
        const next = plan.items[plan.index]; if (next.language !== "ja") localStorage.setItem(LANGUAGE_KEY, next.language);
        h.blockSnapshot();
        setTimeout(() => location.reload(), 50);
      } catch (error) { plan.done = true; plan.error = String(error); h.planSet(plan); await h.save((plan.name || "plan") + "_error.json", { error: String(error), item, results: plan.results }); }
      return;
    }
    const advance = step => { plan.step = step; h.planSet(plan); };
    try {
      if (plan.step === "prepare") { advance("cold"); await h.sbPrepare(item.discipline); }
      else if (plan.step === "cold") { advance("control"); await h.sbCold(); }
      else if (plan.step === "control") { advance("switch"); await h.sbControl(); }
      else if (plan.step === "switch") { advance("verify"); await h.sbSwitch(item.language); }
      else if (plan.step === "verify") {
        const result = await h.sbVerify();
        plan.results.push(sbSummary(item, result));
        plan.index += 1; plan.step = "prepare";
        if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(plan.name + "_final.json", plan.results); return; }
        h.planSet(plan);
        const next = plan.items[plan.index];
        localStorage.clear(); h.seedPlayers();
        if (next.startLanguage) localStorage.setItem(LANGUAGE_KEY, next.startLanguage);
        h.blockSnapshot(); // the resumed game is still mounted: do not let the unload persist a stale snapshot into the next item
        setTimeout(() => location.reload(), 50);
      }
    } catch (error) {
      plan.done = true; plan.error = String(error); h.planSet(plan);
      await h.save((plan.name || "plan") + "_error.json", { error: String(error), item, step: plan.step, results: plan.results });
    }
  };

  /* ---------- C3 full flow (Official 108 C3 / T-SW-2 / T-SW-5): interrupt -> cold start -> [switch] -> resume -> continue -> finish + save ---------- */
  const g = id => document.getElementById(id);
  const ovBreak = async n => {
    const ov = g("breakResultOverlayV61");
    g("breakPlayerP1V1").click(); await h.wait(250);
    [...ov.querySelectorAll("button")].find(b => !b.id && b.textContent.trim() === String(n)).click(); await h.wait(250);
    g("breakResultSaveV695").click(); await h.wait(900);
  };
  const ball = async n => { [...document.querySelectorAll("#proGameScreen .pro-ball")].find(b => b.textContent.trim() === String(n)).click(); await h.wait(600); };
  const visible = el => !!el && el.getBoundingClientRect().width > 0 && !el.closest("[hidden],.hidden");
  const resultShown = () => visible(g("officialResultHomeV1"));
  const overlayOpen = () => visible(g("breakResultOverlayV61"));
  const addPoint = async () => { g("threeCushionAddV1").click(); await h.wait(600); };
  const C3_SCRIPTS = {
    rotation: { start: { race: 10 }, pre: async () => { await ovBreak(3); }, post: async () => { await ball(7); } },
    "9ball": { start: { race: 2 }, pre: async () => { await ovBreak(9); }, post: async () => { await ovBreak(9); } },
    "10ball": { start: { race: 2 }, pre: async () => { await ovBreak(10); }, post: async () => { await ovBreak(10); } },
    straightPool: { start: { race: 5 }, pre: async () => { await ball(12); await ball(9); }, post: async () => { await ball(8); await ball(7); await ball(6); } },
    jpa9: { start: {}, pre: async () => { await ovBreak(1); for (const n of [2, 3, 4, 5, 6, 7, 8, 9]) await ball(n); },
      post: async () => { for (let i = 0; i < 60 && !resultShown(); i += 1) { if (overlayOpen()) { await ovBreak(1); for (const n of [2, 3, 4, 5, 6, 7, 8, 9]) { if (resultShown()) break; await ball(n); } } else await h.wait(300); } } },
    threeCushion: { start: { race: 3 }, pre: async () => { await addPoint(); await addPoint(); }, post: async () => { await addPoint(); } }
  };
  // Scenario "start-only": interrupted before any input. restore() ends with closeBreakResultPromptV61(), which re-arms nothing and
  // clears the break prompt, so the match is played from the first rack after the resume; the first break prompt is not re-opened.
  const winLoop = ball_ => async () => { for (let i = 0; i < 30 && !resultShown(); i += 1) { if (overlayOpen()) await ovBreak(ball_); else await ball(ball_); } };
  const C3_START_ONLY = {
    rotation: async () => { if (overlayOpen()) await ovBreak(3); else await ball(3); await ball(7); },
    "9ball": winLoop(9),
    // 10-ball: pocket 1..10 in order; a break prompt that opens for the next rack is answered with the 10
    "10ball": async () => { for (let i = 0; i < 30 && !resultShown(); i += 1) { if (overlayOpen()) { await ovBreak(10); continue; } for (let n = 1; n <= 10 && !resultShown() && !overlayOpen(); n += 1) await ball(n); } }
  };
  const EXPECTED_TYPE = { "9ball": "nineBall", "10ball": "tenBall", rotation: "rotation", straightPool: "straightPool", jpa9: "jpa9Ball", threeCushion: "threeCushion" };
  // Fixed allow-list (Official 108 C3, existing restore path): the break-prompt bookkeeping that updateGame() re-creates after restore().
  // Source: restore() copies state.pendingBreakPlayerV61/RackV61 (null at rest) and updateGame() re-opens the break prompt, which sets them.
  const C3_RESTORE_ALLOW = Object.freeze(["pendingBreakPlayerV61", "pendingBreakRackV61"]);
  const restoreDiff = (original, restored) => Object.keys(original).filter(key => !h.deepEqual(original[key], restored[key])).concat(Object.keys(restored).filter(key => !(key in original))).sort();
  const c3Fresh = (language) => { localStorage.clear(); h.seedPlayers(); if (language && language !== "ja") localStorage.setItem(LANGUAGE_KEY, language); h.blockSnapshot(); };
  const c3Resume = async (plan, item, base) => {
    const card = g("cueResumeCardV1");
    base.cardVisible = !card.hidden; base.cardAria = card.getAttribute("aria-label");
    base.guardBeforeResume = window.CueScoreLanguageGuardV1.state().state;
    card.click();
    await h.waitFor(() => document.querySelector(".app").classList.contains("pro-game-mode"), 8000); await h.wait(700);
    base.guardAfterResume = window.CueScoreLanguageGuardV1.state().state;
    h.trapStart(); let reloaded = false;
    const refusal = window.CueScoreI18nV1.requestLanguageChange(window.CueScoreI18n.language === "ja" ? "en" : "ja", { guard: window.CueScoreLanguageGuardV1, storage: window.localStorage, reload: () => { reloaded = true; } });
    base.refusalAfterResume = { ok: refusal.ok, code: refusal.code, reloaded, writes: h.trapStop().length };
    h.pagehide();
    const restored = JSON.parse(h.snapshotRaw()), original = JSON.parse(base.rawCold);
    base.restoredState = restored.state; base.restoredUndo = restored.undoHistory;
    base.restoreDiffKeys = restoreDiff(original.state, restored.state);
    base.restoreDiffWithinAllow = base.restoreDiffKeys.every(key => C3_RESTORE_ALLOW.includes(key));
    base.restoreDiffValues = Object.fromEntries(base.restoreDiffKeys.map(key => [key, { before: original.state[key] ?? null, after: restored.state[key] ?? null }]));
    base.restoreDiffValuesValid = base.restoreDiffKeys.every(key => { const a = restored.state[key] ?? null, b = original.state[key] ?? null; return a === null && (b === null || (key === "pendingBreakPlayerV61" ? (b === 1 || b === 2) : (Number.isInteger(b) && b >= 1))); }); // source: restore() ends with closeBreakResultPromptV61() => both keys become null
    base.undoEqualToOriginal = h.deepEqual(original.undoHistory, restored.undoHistory);
    base.restoredType = restored.state.activeGameTypeV1; base.isDemo = !!(window.CueScoreDemoData && window.CueScoreDemoData.isDemo());
    if (item.tag === "start-only" && C3_START_ONLY[item.discipline]) await C3_START_ONLY[item.discipline]();
    else { if (item.tag === "start-only") await C3_SCRIPTS[item.discipline].pre(); await C3_SCRIPTS[item.discipline].post(); }
    await h.waitFor(resultShown, 15000).catch(() => {});
    await h.wait(1200);
    base.finished = resultShown();
    base.snapshotAfterFinish = h.snapshotRaw();
    const store = h.store();
    base.records = store[item.demo ? "cuescore-demo.matchRecords.v1" : "rotationScoreboard.matchRecords.v1"] || null;
    for (const key of Object.keys(store)) if (h.isSnapKey(key)) delete store[key];
    base.storeAfter = store;
    base.language = window.CueScoreI18n.language; base.htmlLang = document.documentElement.lang;
    await h.save(`${item.demo ? "c3d" : item.tag === "start-only" ? "c3so" : "c3"}_${item.discipline}_${item.mode}_${item.language}.json`, base);
    plan.results.push({ discipline: item.discipline, mode: item.mode, language: item.language, finished: base.finished });
    plan.index += 1; plan.step = "prepare";
    if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(plan.name + "_final.json", plan.results); return; }
    h.planSet(plan); h.session.set("c3", null); sessionStorage.removeItem("__h_writes");
    c3Fresh(plan.items[plan.index].startLanguage || "ja"); setTimeout(() => location.reload(), 60);
  };
  h.c3Step = async plan => {
    const item = plan.items[plan.index];
    try {
      await h.waitBoot();
      if (plan.step === "prepare") {
        if (item.demo && !window.CueScoreDemoData.isDemo()) { window.CueScoreDemoData.enter(); setTimeout(() => location.reload(), 80); return; }
        const script = C3_SCRIPTS[item.discipline];
        const started = await h.startMatch(item.discipline, item.demo ? "demo-player-02" : "p_fix_2", script.start);
        const guardLive = window.CueScoreLanguageGuardV1.state().state;
        if (item.tag !== "start-only") await script.pre();
        h.pagehide();
        const raw = h.snapshotRaw(), parsed = JSON.parse(raw);
        h.session.set("c3", { discipline: item.discipline, mode: item.mode, language: item.language, rawPrepare: raw, guardLive, type: parsed.state.activeGameTypeV1, expectedType: EXPECTED_TYPE[item.discipline], jaStringsAudit: h.jaStrings(parsed) });
        plan.step = "cold"; h.planSet(plan); setTimeout(() => location.reload(), 80);
      } else if (plan.step === "cold") {
        const base = h.session.get("c3");
        base.rawCold = h.snapshotRaw();
        const cold = JSON.parse(base.rawCold), prep = JSON.parse(base.rawPrepare);
        base.coldStateEqualPrepare = h.deepEqual(cold.state, prep.state) && h.deepEqual(cold.undoHistory, prep.undoHistory);
        base.guardCold = window.CueScoreLanguageGuardV1.state();
        base.hashesBefore = await h.hashes(key => !h.isSnapKey(key) && key !== LANGUAGE_KEY);
        if (item.mode !== "switch") { await c3Resume(plan, item, base); return; }
        const ui = await h.openLanguage(); base.languageUi = ui; base.chosen = h.chooseLanguage(item.language);
        h.session.set("c3", base); plan.step = "afterSwitch"; h.planSet(plan);
        h.trapStart(); h.applyLanguage();
      } else if (plan.step === "afterSwitch") {
        const base = h.session.get("c3");
        const writes = h.persistedWrites();
        base.switchWrites = writes;
        base.onlyLanguageWritten = writes.length === 1 && writes[0].op === "set" && writes[0].key === LANGUAGE_KEY && writes[0].value === item.language;
        base.rawSame = h.snapshotRaw() === base.rawCold;
        const hashesAfter = await h.hashes(key => !h.isSnapKey(key) && key !== LANGUAGE_KEY);
        base.otherKeysChanged = diffKeys(base.hashesBefore, hashesAfter);
        base.languageApplied = window.CueScoreI18n.language === item.language && document.documentElement.lang === HTML_LANG[item.language];
        base.guardAfterSwitch = window.CueScoreLanguageGuardV1.state().state;
        await c3Resume(plan, item, base);
      }
    } catch (error) {
      plan.done = true; plan.error = String(error); h.planSet(plan);
      await h.save((plan.name || "c3") + "_error.json", { error: String(error), step: plan.step, item, results: plan.results });
    }
  };

  /* ---------- T-SW-1 / T-SW-3 / T-SW-7 plans ---------- */
  const pushOutToInput = async () => {
    const ov = g("breakResultOverlayV61");
    g("breakPlayerP1V1").click(); await h.wait(300);
    [...ov.querySelectorAll("button")].find(b => !b.id && b.textContent.trim() === "1").click(); await h.wait(300);
    g("breakPushOutToggleV695").hidden = false; // production hides this toggle unconditionally (showBreakResultPromptV61); the isolated copy un-hides it so the real click handler and Push Out flow run
    g("breakPushOutToggleV695").click(); await h.wait(300);
    g("breakResultSaveV695").click(); await h.waitFor(() => visible(g("pushOutInputOverlayV730")), 6000); await h.wait(300);
  };
  const T1_STATES = {
    "break-prompt": { discipline: "rotation", setup: async () => {} },
    "recording-idle": { discipline: "rotation", setup: async () => { await ovBreak(3); } },
    "safety-pending": { discipline: "rotation", setup: async () => { await ovBreak(3); g("proSafetyBtn").click(); await h.wait(600); } },
    "foul-pending": { discipline: "rotation", setup: async () => { await ovBreak(3); g("proFoulBtn").click(); await h.wait(600); } },
    "dead-ball": { discipline: "jpa9", setup: async () => { await ovBreak(1); g("jpaDeadBtnV1").click(); await h.wait(600); } },
    "result-screen": { discipline: "9ball", start: { race: 1 }, setup: async () => { await ovBreak(9); await h.waitFor(resultShown, 8000); await h.wait(600); } },
    // Only meaningful on the isolated Push Out proof copy (the production source forces pushOut:false).
    "push-out-input": { discipline: "9ball", setup: async () => { await pushOutToInput(); } },
    "push-out-decision": { discipline: "9ball", setup: async () => { await pushOutToInput(); g("pushOutConfirmV730").click(); await h.wait(900); } }
  };
  h.t1Step = async plan => {
    const item = plan.items[plan.index], state = T1_STATES[item.state];
    try {
      await h.waitBoot();
      const started = await h.startMatch(state.discipline, "p_fix_2", state.start || {});
      await state.setup();
      const out = { state: item.state, discipline: state.discipline, guard: window.CueScoreLanguageGuardV1.state().state };
      out.pageText = document.querySelector(".app").innerText.replace(/\s+/g, " ").slice(0, 160);
      out.stateReached = item.state === "push-out-input" ? visible(g("pushOutInputOverlayV730")) : item.state === "push-out-decision" ? visible(g("pushOutDecisionOverlayV730")) : item.state === "result-screen" ? resultShown() : item.state === "break-prompt" ? overlayOpen() : true;
      h.trapStart(); let reloaded = false;
      const refusal = window.CueScoreI18nV1.requestLanguageChange("en", { guard: window.CueScoreLanguageGuardV1, storage: window.localStorage, reload: () => { reloaded = true; } });
      out.api = { ok: refusal.ok, code: refusal.code, reloaded, writes: h.trapStop().length };
      document.querySelector('[data-phase1-tab="settings"]').click(); await h.wait(500);
      const row = document.querySelector("[data-settings-open-language]");
      out.uiReachable = !!row;
      if (row) { row.click(); await h.wait(500); out.ui = h.languageUi(); out.uiMessage = g("suiteLanguageStatus").textContent; }
      out.languageKeyAfter = localStorage.getItem(LANGUAGE_KEY);
      await h.save(`t1_${item.state}.json`, out);
      plan.results.push({ state: item.state, guard: out.guard, code: out.api.code });
      plan.index += 1;
      if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(plan.name + "_final.json", plan.results); return; }
      h.planSet(plan); localStorage.clear(); h.seedPlayers(); const next = T1_STATES[plan.items[plan.index].state]; if (next.pre) next.pre(); h.blockSnapshot(); setTimeout(() => location.reload(), 60);
    } catch (error) { plan.done = true; plan.error = String(error); h.planSet(plan); await h.save((plan.name || "t1") + "_error.json", { error: String(error), item, results: plan.results }); }
  };
  h.t3Step = async plan => {
    const item = plan.items[plan.index];
    try {
      await h.waitBoot();
      if (plan.step === "prepare") {
        const script = C3_SCRIPTS[item.discipline];
        await h.startMatch(item.discipline, "p_fix_2", script.start); await script.pre(); h.pagehide();
        h.session.set("t3", { rawPrepare: h.snapshotRaw() });
        plan.step = "cold"; h.planSet(plan); setTimeout(() => location.reload(), 80);
      } else if (plan.step === "cold") {
        const base = h.session.get("t3");
        base.rawCold = h.snapshotRaw(); base.guard = window.CueScoreLanguageGuardV1.state().state;
        h.trapStart();
        h.pagehide();
        h.hiddenState(true); document.dispatchEvent(new Event("visibilitychange")); h.hiddenState(false); document.dispatchEvent(new Event("visibilitychange")); h.hiddenState(undefined);
        window.dispatchEvent(new Event("freeze")); window.dispatchEvent(new Event("pageshow")); window.dispatchEvent(new Event("blur")); window.dispatchEvent(new Event("focus"));
        base.lifecycleWrites = h.trapStop().length;
        base.rawAfterLifecycle = h.snapshotRaw() === base.rawCold;
        h.session.set("t3", base);
        h.trapStart();                               // keeps logging until the real unload; the log survives in sessionStorage
        plan.step = "after"; h.planSet(plan); setTimeout(() => location.reload(), 80);
      } else if (plan.step === "after") {
        const base = h.session.get("t3");
        const out = { discipline: item.discipline, guardCold: base.guard, lifecycleWrites: base.lifecycleWrites, rawAfterLifecycle: base.rawAfterLifecycle,
          writesAcrossReload: h.persistedWrites().length, rawAfterReload: h.snapshotRaw() === base.rawCold, guardAfterReload: window.CueScoreLanguageGuardV1.state().state, cardVisible: !g("cueResumeCardV1").hidden };
        await h.save(`t3_${item.discipline}.json`, out);
        plan.results.push(out); plan.index += 1; plan.step = "prepare";
        if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(plan.name + "_final.json", plan.results); return; }
        h.planSet(plan); sessionStorage.removeItem("__h_writes"); localStorage.clear(); h.seedPlayers(); h.blockSnapshot(); setTimeout(() => location.reload(), 60);
      }
    } catch (error) { plan.done = true; plan.error = String(error); h.planSet(plan); await h.save((plan.name || "t3") + "_error.json", { error: String(error), step: plan.step, item, results: plan.results }); }
  };
  // T-SW-7: a state change lands between the guard check that allowed the change and the reload, on the real app + real guard.
  h.t7Step = async plan => {
    const item = plan.items[plan.index];
    try {
      await h.waitBoot();
      if (plan.step === "make") {
        await h.startMatch("rotation", "p_fix_2", C3_SCRIPTS.rotation.start); await C3_SCRIPTS.rotation.pre(); h.pagehide();
        h.session.set("t7", { raw: h.snapshotRaw() });
        sessionStorage.removeItem("__h_writes"); localStorage.clear(); h.seedPlayers(); h.blockSnapshot(); plan.step = "attempt"; h.planSet(plan); setTimeout(() => location.reload(), 80);
      } else if (plan.step === "attempt") {
        const base = h.session.get("t7");
        const out = { variant: item.variant, flagAllowsSavedInterrupted: window.CueScoreLanguageGuardV1.state().allowSavedInterrupted, guardBefore: window.CueScoreLanguageGuardV1.state().state, preexistingLanguageKey: localStorage.getItem(LANGUAGE_KEY) };
        if (item.priorLanguage) localStorage.setItem(LANGUAGE_KEY, item.priorLanguage);
        out.priorLanguage = localStorage.getItem(LANGUAGE_KEY);
        const ui = await h.openLanguage(); out.uiBefore = ui; h.chooseLanguage("en");
        window.__t7marker = "same-page";
        h.trapStart();
        const proto = Storage.prototype, setItem = proto.setItem; const app = document.querySelector(".app");
        // trapStart replaced setItem; wrap it once more so the injected transition happens right after the language write.
        proto.setItem = function (key, value) {
          const result = setItem.call(this, key, value);
          if (this === window.localStorage && key === LANGUAGE_KEY && !window.__t7injected) {
            window.__t7injected = true;
            if (item.variant === "S-B-concurrent") setItem.call(window.localStorage, h.snapKey(), base.raw);
            if (item.variant === "S-A-forced") app.classList.add("pro-game-mode");
          }
          return result;
        };
        h.session.set("t7", { ...base, out });
        plan.step = "after"; h.planSet(plan);
        h.applyLanguage();
        await h.wait(900);
        // Reached only when no reload happened (change was aborted).
        const stay = window.__t7marker === "same-page";
        const o = h.session.get("t7").out;
        o.noReloadHappened = stay; o.languageKeyAfter = localStorage.getItem(LANGUAGE_KEY); o.snapshotUntouched = h.snapshotRaw() === base.raw; o.snapshotAbsent = h.snapshotRaw() === null; o.expectedSnapshot = item.variant === "S-B-concurrent" ? "equals the concurrently written snapshot" : "stays absent";
        o.status = g("suiteLanguageStatus") && g("suiteLanguageStatus").textContent; o.writes = h.persistedWrites().map(w => `${w.op}:${w.key}`);
        app.classList.remove("pro-game-mode");
        await h.save(`t7_${item.variant}_${item.priorLanguage || "none"}_${plan.name}.json`, o);
        plan.results.push(o); plan.index += 1; plan.step = "make";
        if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(plan.name + "_final.json", plan.results); return; }
        h.planSet(plan); sessionStorage.removeItem("__h_writes"); localStorage.clear(); h.seedPlayers(); h.blockSnapshot(); setTimeout(() => location.reload(), 60);
      } else if (plan.step === "after") { // the page reloaded: the change went through
        const base = h.session.get("t7"), o = base.out;
        o.noReloadHappened = false; o.languageKeyAfter = localStorage.getItem(LANGUAGE_KEY); o.snapshotUntouched = h.snapshotRaw() === base.raw;
        o.languageApplied = window.CueScoreI18n.language; o.writes = h.persistedWrites().map(w => `${w.op}:${w.key}`);
        await h.save(`t7_${item.variant}_${item.priorLanguage || "none"}_${plan.name}.json`, o);
        plan.results.push(o); plan.index += 1; plan.step = "make";
        if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(plan.name + "_final.json", plan.results); return; }
        h.planSet(plan); sessionStorage.removeItem("__h_writes"); localStorage.clear(); h.seedPlayers(); h.blockSnapshot(); setTimeout(() => location.reload(), 60);
      }
    } catch (error) { plan.done = true; plan.error = String(error); h.planSet(plan); await h.save((plan.name || "t7") + "_error.json", { error: String(error), step: plan.step, item, results: plan.results }); }
  };

  // T-SW-9: Free/Pro access decisions do not depend on the display language (runtime output of the real policy objects).
  h.t9Step = async plan => {
    const item = plan.items[plan.index];
    try {
      await h.waitBoot();
      const recs = Array.from({ length: 60 }, (_, i) => ({ id: "r" + i, endedAt: new Date(1700000000000 + i * 1000).toISOString(), playedAt: new Date(1700000000000 + i * 1000).toISOString() }));
      const proPolicy = window.CueScoreRecordPolicyFactory.createRecordPolicy(() => true), freePolicy = window.CueScoreRecordPolicyFactory.createRecordPolicy(() => false);
      const keys = ["detailedAnalytics", "ranking", "backup", "cloudSync", "dataSharing", "csvExport", "advancedFeatures", "aiAnalysis", "seasonManagement"];
      const out = { language: window.CueScoreI18n.language, htmlLang: document.documentElement.lang, entitlementIsPro: window.CueScoreEntitlement.isPro(), entitlementStatus: window.CueScoreEntitlement.snapshot.status,
        featureDefaults: window.CueScoreFeatureAccess.defaults, canUseFree: Object.fromEntries(keys.map(k => [k, window.CueScoreFeatureAccess.canUse(k)])),
        freeLimit: window.CueScoreRecordAccess.FREE_LIMIT, freeEligible: window.CueScoreRecordAccess.getEligibleRecords(recs).map(r => r.id), hasHiddenFree: window.CueScoreRecordAccess.hasHiddenRecords(recs),
        policyFree: { eligible: freePolicy.getEligibleRecords(recs).length, hidden: freePolicy.hasHiddenRecords(recs) }, policyPro: { eligible: proPolicy.getEligibleRecords(recs).length, hidden: proPolicy.hasHiddenRecords(recs) } };
      // The real provider hook with a Pro entitlement as input (no native bridge in the browser).
      window.CueScoreFeatureAccess.connectEntitlementProvider(defaults => ({ ...defaults, detailedAnalytics: true, ranking: true, backup: true }));
      out.canUseProInput = Object.fromEntries(keys.map(k => [k, window.CueScoreFeatureAccess.canUse(k)]));
      out.planView = window.CueScoreIapDiagnostic.planViewState({ isPro: false, status: "ready" });
      out.planViewPro = window.CueScoreIapDiagnostic.planViewState({ isPro: true });
      await h.save(`t9_${item.language}.json`, out);
      plan.results.push(out); plan.index += 1;
      if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(plan.name + "_final.json", plan.results); return; }
      h.planSet(plan); localStorage.setItem(LANGUAGE_KEY, plan.items[plan.index].language); setTimeout(() => location.reload(), 60);
    } catch (error) { plan.done = true; plan.error = String(error); h.planSet(plan); await h.save((plan.name || "t9") + "_error.json", { error: String(error), item, results: plan.results }); }
  };

  // Japanese-invariance capture: ordered text / aria strings of the whole document in 6 states, written as dom_<label>_<state>.json.
  h.domStep = async plan => {
    try {
      await h.waitBoot();
      const save = (state, lines) => h.save(`dom_${plan.label}_${state}.json`, lines);
      if (plan.step === "a") {
        await h.tab("home"); await save("home0", h.dump());
        await h.tab("player"); await save("player", h.dump());
        await h.tab("settings"); await save("settings", h.dump());
        await h.tab("history"); await save("history", h.dump());
        await h.tab("home");
        await h.startMatch("rotation", "p_fix_2", C3_SCRIPTS.rotation.start); await C3_SCRIPTS.rotation.pre(); h.pagehide();
        plan.step = "b"; h.planSet(plan); setTimeout(() => location.reload(), 80);
      } else if (plan.step === "b") {
        await h.tab("home"); await h.wait(600);
        await save("home1", h.dump());
        document.querySelector('.cue-discipline-v1[data-discipline="9ball"]').click(); await h.wait(700);
        await save("homeDialog", h.dump());
        plan.done = true; h.planSet(plan); await h.save(`dom_${plan.label}_final.json`, { done: true, language: window.CueScoreI18n ? window.CueScoreI18n.language : "n/a (baseline)" });
      }
    } catch (error) { plan.done = true; plan.error = String(error); h.planSet(plan); await h.save(`dom_${plan.label}_error.json`, { error: String(error), step: plan.step }); }
  };

  // Visual / layout probe for the current screen: horizontal overflow, clipped text, off-screen elements, bottom-nav overlap.
  h.visProbe = async label => {
    const de = document.documentElement, vw = window.innerWidth, bad = [];
    document.querySelectorAll("body *").forEach(el => {
      const b = el.getBoundingClientRect(); if (!b.width || !b.height) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || el.closest("[hidden],.hidden,[aria-hidden=true]")) return;
      if (b.right > vw + 0.5 || b.left < -0.5) bad.push(["offscreen", el.tagName, (el.className + "").slice(0, 30), Math.round(b.left), Math.round(b.right), el.textContent.trim().slice(0, 16)]);
      if (el.children.length === 0 && el.textContent.trim() && el.scrollWidth > el.clientWidth + 1 && cs.overflow !== "visible" && cs.textOverflow === "clip") bad.push(["clipped", el.tagName, (el.className + "").slice(0, 30), el.scrollWidth, el.clientWidth, el.textContent.trim().slice(0, 16)]);
      if (el.children.length === 0 && el.textContent.trim() && cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) bad.push(["ellipsis-truncated", el.tagName, (el.className + "").slice(0, 30), el.textContent.trim().slice(0, 20)]);
    });
    const nav = document.querySelector(".cue-phase1-tab-bar").getBoundingClientRect();
    // scroll every scroller to the bottom, then check that no visible content ends below the top of the tab bar
    const scrollers = [document.scrollingElement, ...document.querySelectorAll("*")].filter(e => e && e.scrollHeight > e.clientHeight + 2 && ["auto", "scroll", "visible"].includes(getComputedStyle(e).overflowY) && e.clientHeight > 200 && !e.closest("[hidden],.hidden"));
    scrollers.forEach(s => { s.scrollTop = s.scrollHeight; }); await h.wait(250);
    // Anything visible whose centre point is covered by the bottom tab bar is obscured by it (fully or partly).
    const navEl = document.querySelector(".cue-phase1-tab-bar");
    const overlap = [...document.querySelectorAll("body *")]
      .filter(e => e.children.length === 0 && e.textContent.trim() && !e.closest(".cue-phase1-tab-bar,[hidden],.hidden,[aria-hidden=true],script,style") && getComputedStyle(e).visibility !== "hidden")
      .map(e => { const r = e.getBoundingClientRect(); return { r, e }; })
      .filter(({ r }) => r.height > 0 && r.width > 0 && r.top < window.innerHeight && r.bottom > nav.top)
      .filter(({ r }) => { const x = r.left + r.width / 2, y = Math.min(r.top + r.height / 2, window.innerHeight - 1); const top = document.elementFromPoint(x, y); return !!top && navEl.contains(top); })
      .map(({ r, e }) => ({ top: Math.round(r.top), bottom: Math.round(r.bottom), text: e.textContent.trim().slice(0, 24) }));
    scrollers.forEach(s => { s.scrollTop = 0; });
    return { label, viewport: [window.innerWidth, window.innerHeight], docOverflow: de.scrollWidth > de.clientWidth, bodyOverflow: document.body.scrollWidth > vw, offenders: bad, navTop: Math.round(nav.top), navOverlap: overlap.slice(0, 5), pass: de.scrollWidth <= de.clientWidth && bad.filter(b => b[0] !== "ellipsis-truncated").length === 0 && overlap.length === 0 };
  };
  // Player rows: count, order, and integrity (name + aria + badge visible, no overflow).
  h.playerRows = () => [...document.querySelectorAll(".player-management-row-v1")].filter(e => e.getBoundingClientRect().height > 0).map(e => {
    const info = e.querySelector(".player-hub-info-v3"), edit = [...e.querySelectorAll("button")].find(b => b !== info);
    return { name: (e.querySelector(".player-management-name-v1") || {}).textContent, text: e.innerText.replace(/\s+/g, " ").trim().slice(0, 60), infoAria: info && info.getAttribute("aria-label"), editAria: edit && edit.getAttribute("aria-label"), width: Math.round(e.getBoundingClientRect().width), height: Math.round(e.getBoundingClientRect().height), overflow: e.scrollWidth > e.clientWidth + 1 };
  });
  h.visStep = async plan => {
    try {
      await h.waitBoot();
      const lang = window.CueScoreI18n.language, out = { language: lang, htmlLang: document.documentElement.lang, probes: {} };
      await h.tab("home"); out.probes.home = await h.visProbe("home");
      await h.tab("player"); out.probes.player = await h.visProbe("player"); out.playerRows = h.playerRows(); out.playerCountText = (document.querySelector("#playerInfoScreen") || document.body).innerText.match(/(Registered players: \d+|登録プレーヤー[:：]? ?\d+|已注册球员[:：]? ?\d+|登録[^\n]*\d+)/);
      await h.tab("settings"); out.probes.settings = await h.visProbe("settings");
      await h.openLanguage(); out.probes.language = await h.visProbe("language"); out.languageUi = h.languageUi();
      await h.save(`vis_${lang}.json`, out);
      plan.results.push({ lang, pass: Object.values(out.probes).every(p => p.pass) }); plan.index += 1;
      if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(plan.name + "_final.json", plan.results); return; }
      h.planSet(plan); localStorage.setItem(LANGUAGE_KEY, plan.items[plan.index].language); setTimeout(() => location.reload(), 60);
    } catch (error) { plan.done = true; plan.error = String(error); h.planSet(plan); await h.save((plan.name || "vis") + "_error.json", { error: String(error), results: plan.results }); }
  };

  /* ---------- C3 investigation: interrupted at the first Break prompt, resumed, versus an uninterrupted match ---------- */
  const INV_FULL = {
    rotation: async () => { await ovBreak(3); await ball(7); },
    "9ball": async () => { await ovBreak(9); await ovBreak(9); },
    "10ball": async () => { await ovBreak(10); await ovBreak(10); },
    jpa9: async () => { await C3_SCRIPTS.jpa9.pre(); await C3_SCRIPTS.jpa9.post(); }
  };
  const invCapture = label => {
    const raw = (() => { h.pagehide(); return h.snapshotRaw(); })();
    const st = raw ? JSON.parse(raw).state : null;
    const prompt = g("breakResultOverlayV61");
    return { label, overlayOpen: overlayOpen(), resultShown: resultShown(),
      selectedBreaker: [g("breakPlayerP1V1"), g("breakPlayerP2V1")].map(b => b && (b.getAttribute("aria-pressed") || b.className.slice(0, 60))),
      top: (g("proGameScreen").innerText || "").replace(/\s+/g, " ").slice(0, 150),
      state: st && { current: st.current, startingPlayer: st.startingPlayer, nextBreakPlayer: st.nextBreakPlayer, rack: st.rack, inning: st.inning, scores: st.scores, rackScores: st.rackScores, breakCount: st.breakCount,
        gameEnded: st.gameEnded, rows: st.rows && st.rows.length, pendingBreakPlayerV61: st.pendingBreakPlayerV61, pendingBreakRackV61: st.pendingBreakRackV61,
        eventTypes: (st.analysisEventsV60 || []).map(e => e.type), breakResultEvents: (st.analysisEventsV60 || []).filter(e => e.type === "break_result").length, undoDepth: undefined } };
  };
  h.invStep = async plan => {
    const item = plan.items[plan.index];
    try {
      await h.waitBoot();
      const finish = async (steps, out) => {
        await h.waitFor(resultShown, 15000).catch(() => {}); await h.wait(1000);
        out.finished = resultShown(); const recs = JSON.parse(localStorage.getItem("rotationScoreboard.matchRecords.v1") || "[]");
        out.record = recs[0] ? { winner: recs[0].winner, result: recs[0].result, rack: recs[0].rack, inning: recs[0].inning, initialBreaker: recs[0].initialBreaker, rackResults: recs[0].rackResults, byType: recs[0].analysis && recs[0].analysis.summary && recs[0].analysis.summary.byType,
          eventTypes: (recs[0].analysis && recs[0].analysis.events || []).map(e => e.type), breakResultLabels: (recs[0].analysis && recs[0].analysis.events || []).filter(e => e.type === "break_result").map(e => e.resultLabel), players: recs[0].analysis && recs[0].analysis.summary && recs[0].analysis.summary.players && Object.fromEntries(Object.entries(recs[0].analysis.summary.players).map(([k, v]) => [k, { break: v.break, score: v.score }])) } : null;
        out.recordCount = recs.length;
      };
      const script = C3_SCRIPTS[item.discipline];
      if (plan.step === "prepare") {
        await h.startMatch(item.discipline, "p_fix_2", script.start);
        if (item.mode === "mid-resumed") await script.pre();                 // first rack played, the Break prompt of the next rack is open
        if (item.mode === "p2-resumed" || item.mode === "p2-uninterrupted") { g("breakPlayerP2V1").click(); await h.wait(300); } // the user picked Player 2 as breaker but did not press OK
        const out = { discipline: item.discipline, mode: item.mode, S0: invCapture("interrupted state (Break prompt open)") };
        if (item.mode === "uninterrupted" || item.mode === "p2-uninterrupted") {
          await INV_FULL[item.discipline](); await finish(null, out);
          await h.save(`c3inv_${item.discipline}_${item.mode}.json`, out); plan.results.push(item); plan.index += 1;
          if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(plan.name + "_final.json", plan.results); return; }
          h.planSet(plan); localStorage.clear(); h.seedPlayers(); h.blockSnapshot(); setTimeout(() => location.reload(), 60); return;
        }
        h.session.set("inv", out); plan.step = "resume"; h.planSet(plan); setTimeout(() => location.reload(), 80);
      } else if (plan.step === "resume") {
        const out = h.session.get("inv");
        out.homeCardVisible = !g("cueResumeCardV1").hidden;
        g("cueResumeCardV1").click(); await h.waitFor(() => document.querySelector(".app").classList.contains("pro-game-mode"), 8000); await h.wait(800);
        out.S1 = invCapture("after resume");
        // what can the user do now? the controls that are visible
        out.visibleControls = [...document.querySelectorAll("#proGameScreen button")].filter(b => visible(b)).map(b => (b.id || b.className.split(" ")[0]) + ":" + b.textContent.trim().slice(0, 8)).slice(0, 30);
        // the first input the user can make without a Break prompt
        out.guidedByOverlay = { overlayOpenAfterResume: out.S1.overlayOpen };
        if (item.mode === "mid-resumed") { if (C3_START_ONLY[item.discipline] && item.discipline !== "rotation") await C3_START_ONLY[item.discipline](); else await C3_SCRIPTS[item.discipline].post(); }
        else if (C3_START_ONLY[item.discipline]) await C3_START_ONLY[item.discipline](); else { await C3_SCRIPTS[item.discipline].pre(); await C3_SCRIPTS[item.discipline].post(); }
        await finish(null, out);
        await h.save(`c3inv_${item.discipline}_${item.mode}.json`, out); plan.results.push(item); plan.index += 1; plan.step = "prepare";
        if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(plan.name + "_final.json", plan.results); return; }
        h.planSet(plan); localStorage.clear(); h.seedPlayers(); h.blockSnapshot(); setTimeout(() => location.reload(), 60);
      }
    } catch (error) { plan.done = true; plan.error = String(error); h.planSet(plan); await h.save((plan.name || "c3inv") + "_error.json", { error: String(error), step: plan.step, item }); }
  };

  // R-FIT: Settings (non-scrolling at 780-900px height) vertical budget per language at the current viewport.
  h.fitStep = async plan => {
    try {
      await h.waitBoot(); await h.tab("settings");
      const s = document.querySelector(".settings-formal-scroll-v1"), copy = document.querySelector(".settings-copyright-v1").getBoundingClientRect(), nav = document.querySelector(".cue-phase1-tab-bar").getBoundingClientRect();
      const rows = [...document.querySelectorAll(".settings-formal-main-v1 .settings-data-row-v1, .settings-formal-main-v1 .settings-info-link-v1, .settings-plan-card-v72")].map(e => ({ cls: e.className.split(" ")[0], text: e.textContent.trim().slice(0, 18), h: Math.round(e.getBoundingClientRect().height * 10) / 10 }));
      const lang = document.querySelector("[data-settings-open-language]").getBoundingClientRect();
      const probe = await h.visProbe("settings");
      const out = { label: plan.label, language: window.CueScoreI18n.language, viewport: [innerWidth, innerHeight], scrollerOverflowY: getComputedStyle(s).overflowY, scrollHeight: s.scrollHeight, clientHeight: s.clientHeight,
        copyrightBottom: Math.round(copy.bottom * 10) / 10, tabBarTop: Math.round(nav.top * 10) / 10, slackPx: Math.round((nav.top - copy.bottom) * 10) / 10, languageRowHeight: Math.round(lang.height * 10) / 10, languageRowTop: Math.round(lang.top), rows, probe };
      await h.save(`fit_${plan.label}_${innerWidth}x${innerHeight}_${out.language}.json`, out);
      plan.results.push({ language: out.language, slack: out.slackPx }); plan.index += 1;
      if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(`fit_${plan.label}_${innerWidth}x${innerHeight}_final.json`, plan.results); return; }
      h.planSet(plan); localStorage.setItem(LANGUAGE_KEY, plan.items[plan.index].language); setTimeout(() => location.reload(), 60);
    } catch (error) { plan.done = true; plan.error = String(error); h.planSet(plan); await h.save("fit_error.json", { error: String(error) }); }
  };

  /* ---------- Restore root-cause investigation (initial Break prompt) ---------- */
  const FIRST_BALL = { rotation: 3, "9ball": 9, "10ball": 10, jpa9: 1 };
  const ovBreakDefault = async n => { // keep the prompt's own default breaker, pick a ball, OK
    const ov = g("breakResultOverlayV61");
    [...ov.querySelectorAll("button")].find(b => !b.id && b.textContent.trim() === String(n)).click(); await h.wait(250);
    g("breakResultSaveV695").click(); await h.wait(900);
  };
  const rFinish = async discipline => { // play the match out with whatever the screen offers (prompt answered when it is open)
    const winBall = { "9ball": 9, "10ball": 10 }[discipline];
    for (let i = 0; i < 40 && !resultShown(); i += 1) {
      if (overlayOpen()) { await ovBreakDefault(FIRST_BALL[discipline]); continue; }
      if (discipline === "rotation") { await ball(7); }
      else if (discipline === "9ball" || discipline === "10ball") { for (let n = 1; n <= winBall && !resultShown() && !overlayOpen(); n += 1) await ball(n); }
      else if (discipline === "jpa9") { for (let n = 1; n <= 9 && !resultShown() && !overlayOpen(); n += 1) await ball(n); }
      else await h.wait(300);
    }
  };
  const rSummary = () => {
    const recs = JSON.parse(localStorage.getItem(h.recordsKey()) || "[]"), r = recs[recs.length - 1];
    if (!r) return null;
    const ev = (r.analysis && r.analysis.events) || [];
    return { winner: r.winner, rack: r.rack, initialBreaker: r.initialBreaker, events: ev.map(e => e.type + (e.player ? ":p" + e.player : "")), breakResults: ev.filter(e => e.type === "break_result").map(e => ({ player: e.player, label: e.resultLabel, rack: e.rackNumber })), byType: r.analysis && r.analysis.summary && r.analysis.summary.byType };
  };
  h.recordsKey = () => (window.CueScoreDemoData && window.CueScoreDemoData.isDemo && window.CueScoreDemoData.isDemo() ? "cuescore-demo.matchRecords.v1" : "rotationScoreboard.matchRecords.v1");
  h.rinvStep = async plan => {
    const item = plan.items[plan.index];
    const next = async () => {
      plan.results.push(item.id); plan.index += 1; plan.step = "prepare";
      if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(`${plan.name}_final.json`, plan.results); return; }
      h.planSet(plan); localStorage.clear(); h.seedPlayers(); h.blockSnapshot(); setTimeout(() => location.reload(), 60);
    };
    try {
      await h.waitBoot();
      if (plan.step === "prepare") {
        if (item.demo && !window.CueScoreDemoData.isDemo()) { window.CueScoreDemoData.enter(); setTimeout(() => location.reload(), 80); return; }
        const script = C3_SCRIPTS[item.discipline] || { start: {} };
        await h.startMatch(item.discipline, item.demo ? "demo-player-02" : "p_fix_2", script.start);
        const out = { id: item.id, scenario: item.scenario, discipline: item.discipline, demo: !!item.demo, S0: { overlayOpen: overlayOpen() } };
        if (item.scenario === "p2" || item.scenario === "p2-uninterrupted") { g("breakPlayerP2V1").click(); await h.wait(300); }
        if (item.scenario === "post-ok") await ovBreakDefault(FIRST_BALL[item.discipline]);
        if (item.scenario === "back-prompt") { g("breakResultBackV3").click(); await h.wait(800); out.afterBack = { overlayOpen: overlayOpen(), gameMounted: document.querySelector(".app").classList.contains("pro-game-mode"), homeVisible: visible(g("cueHomeV1")), screenText: document.body.innerText.replace(/\s+/g, " ").slice(0, 140) }; await h.save(`rinv_${item.id}.json`, out); return next(); }
        h.pagehide(); const st0 = JSON.parse(h.snapshotRaw()).state;
        out.S0.snapshot = { current: st0.current, startingPlayer: st0.startingPlayer, nextBreakPlayer: st0.nextBreakPlayer, rack: st0.rack, pendingBreakPlayerV61: st0.pendingBreakPlayerV61, pendingBreakRackV61: st0.pendingBreakRackV61, pendingBreakStartsNextRackV1: st0.pendingBreakStartsNextRackV1, rackEnded: st0.rackEnded, breakEvents: (st0.analysisEventsV60 || []).filter(e => e.type === "break_result").length, selectedBreakerButton: [g("breakPlayerP1V1"), g("breakPlayerP2V1")].map(b => b && b.className.includes("selected")) };
        if (item.scenario === "p2-uninterrupted") { // user who picks Player 2 and answers the prompt
          await ovBreakDefault(FIRST_BALL[item.discipline]); await rFinish(item.discipline); await h.wait(800); out.finished = resultShown(); out.record = rSummary(); await h.save(`rinv_${item.id}.json`, out); return next();
        }
        h.session.set("rinv", out); plan.step = "resume"; h.planSet(plan); setTimeout(() => location.reload(), 80);
      } else if (plan.step === "resume") {
        const out = h.session.get("rinv");
        out.homeCardVisible = !g("cueResumeCardV1").hidden;
        g("cueResumeCardV1").click(); await h.waitFor(() => document.querySelector(".app").classList.contains("pro-game-mode"), 8000); await h.wait(800);
        h.pagehide(); const st1 = JSON.parse(h.snapshotRaw()).state;
        out.S1 = { overlayOpen: overlayOpen(), current: st1.current, nextBreakPlayer: st1.nextBreakPlayer, rack: st1.rack, pendingBreakPlayerV61: st1.pendingBreakPlayerV61, pendingBreakRackV61: st1.pendingBreakRackV61, top: g("proGameScreen").innerText.replace(/\s+/g, " ").slice(0, 100) };
        if (item.scenario === "back-after-resume") { // Back on the prompt that came back with the resume
          const back = g("breakResultBackV3"); back.click(); await h.wait(800);
          out.afterBack = { overlayOpen: overlayOpen(), interruptConfirmVisible: !!document.querySelector("[id*=Interrupt]:not(.hidden)") && [...document.querySelectorAll("[id*=Interrupt]")].some(e => visible(e)), gameMounted: document.querySelector(".app").classList.contains("pro-game-mode") };
          await h.save(`rinv_${item.id}.json`, out); return next();
        }
        if (item.undoProbe) { const u = g("proUndoBtn"); out.undoProbe = { disabled: u && u.disabled, ariaDisabled: u && u.getAttribute("aria-disabled") }; if (u && !u.disabled) { u.click(); await h.wait(700); } out.undoProbe.overlayAfter = overlayOpen(); await h.save(`rinv_${item.id}.json`, out); return next(); }
        out.S1.selectedBreaker = [g("breakPlayerP1V1"), g("breakPlayerP2V1")].map(b => b && b.className.includes("selected"));
        if (overlayOpen() && FIRST_BALL[item.discipline]) { out.promptAnswered = true; await ovBreakDefault(FIRST_BALL[item.discipline]); }
        else if (item.scenario === "p2") { g("proSwitchBtn").click(); await h.wait(600); out.afterSwitch = { current: (() => { h.pagehide(); return JSON.parse(h.snapshotRaw()).state.current; })() }; }
        if (!out.promptAnswered && (item.scenario === "init" || item.scenario === "p2")) { if (item.discipline === "rotation") await ball(3); else if (item.discipline === "9ball") await ball(9); else if (item.discipline === "10ball") { for (let n = 1; n <= 10; n += 1) await ball(n); } else if (item.discipline === "jpa9") { for (let n = 1; n <= 9; n += 1) await ball(n); } }
        await rFinish(item.discipline); await h.wait(800);
        out.finished = resultShown(); out.record = rSummary();
        await h.save(`rinv_${item.id}.json`, out); return next();
      }
    } catch (error) { plan.done = true; plan.error = String(error); h.planSet(plan); await h.save((plan.name || "rinv") + "_error.json", { error: String(error), step: plan.step, item }); }
  };

  // Compatibility: a snapshot written by the UNFIXED code (taken from earlier evidence) is installed as stored data and resumed.
  h.compatStep = async plan => {
    const item = plan.items[plan.index];
    try {
      await h.waitBoot();
      g("cueResumeCardV1").click(); await h.waitFor(() => document.querySelector(".app").classList.contains("pro-game-mode"), 8000); await h.wait(800);
      const out = { id: item.id, discipline: item.discipline, snapshotBytes: item.raw.length, overlayOpen: overlayOpen(), selectedBreaker: [g("breakPlayerP1V1"), g("breakPlayerP2V1")].map(b => b && b.className.includes("selected")) };
      if (overlayOpen() && FIRST_BALL[item.discipline]) { await ovBreakDefault(FIRST_BALL[item.discipline]); out.answered = true; }
      await rFinish(item.discipline); await h.wait(800);
      out.finished = resultShown(); out.record = rSummary();
      await h.save(`compat_${item.id}.json`, out);
      plan.index += 1;
      if (plan.index >= plan.items.length) { plan.done = true; h.planSet(plan); await h.save(plan.name + "_final.json", { done: true }); return; }
      h.planSet(plan); localStorage.clear(); h.seedPlayers(); localStorage.setItem("cueScore.inProgressMatch.v1", plan.items[plan.index].raw); h.blockSnapshot(); setTimeout(() => location.reload(), 60);
    } catch (error) { plan.done = true; plan.error = String(error); h.planSet(plan); await h.save("compat_error.json", { error: String(error), item: item && item.id }); }
  };
  if (window.__H_AUTORUN) h.autoStart();
    h.version = "p1-1";
})();

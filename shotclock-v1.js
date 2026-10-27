/* CueScore Shot Clock v1 (Decision 046 / Official 134-135). Manual three-button clock (start-pause-resume, reset, extend +60) shown under the match log.
 * Zero linkage: this file never reads or writes match data, score, log, stats or Backup/QR keys, and no scoring/foul/safety/switch/Undo/rack/match-end code calls it.
 * Default OFF. When OFF nothing is mounted on the match screen. State lives only under its own key `cueScore.shotClock.v1`.
 * Timing is deadline based (absolute Date.now()), so background / lock / resume recompute the remaining time from the real clock. */
(function (root) {
  "use strict";
  const KEY = "cueScore.shotClock.v1";
  const BASES = Object.freeze([30, 35, 40, 45, 60]);
  const DEFAULT_BASE = 45;
  const EXT_MS = 60000;
  const UNDO_MS = 3000;
  const MAX_MS = 24 * 3600 * 1000;

  /* ---------- pure state machine (testable in Node; every method takes `now` in ms) ---------- */
  function createClock(base) {
    const c = { state: "idle", base: BASES.includes(base) ? base : DEFAULT_BASE, remainMs: 0, deadline: 0, extCount: 0, undo: null };
    c.remainMs = c.base * 1000;
    const remaining = now => (c.state === "running" ? Math.max(0, c.deadline - now) : c.remainMs);
    const sync = now => {
      if (c.state === "running" && c.deadline <= now) { c.state = "expired"; c.remainMs = 0; c.deadline = 0; c.undo = null; return true; }
      return false;
    };
    const api = {
      get state() { return c.state; }, get base() { return c.base; }, get extCount() { return c.extCount; }, get undo() { return c.undo; },
      remaining, sync,
      seconds(now) { return c.state === "expired" ? 0 : c.state === "idle" ? c.base : Math.ceil(remaining(now) / 1000 - 1e-9); },
      setBase(sec) { if (!BASES.includes(sec)) return false; c.base = sec; if (c.state === "idle") c.remainMs = sec * 1000; return true; },
      /* the single main button: start (idle / expired), pause (running), resume (paused) */
      toggle(now) {
        sync(now);
        if (c.state === "idle") { c.remainMs = c.base * 1000; c.state = "running"; c.deadline = now + c.remainMs; }
        else if (c.state === "running") { c.remainMs = remaining(now); c.deadline = 0; c.state = "paused"; }
        else if (c.state === "paused") { c.state = "running"; c.deadline = now + c.remainMs; }
        else { c.remainMs = c.base * 1000; c.extCount = 0; c.state = "running"; c.deadline = now + c.remainMs; }
        c.undo = null; return c.state;
      },
      /* reset: back to the base time, running / paused state is kept, expired goes back to idle, no undo */
      reset(now) {
        sync(now);
        c.extCount = 0; c.remainMs = c.base * 1000; c.undo = null;
        if (c.state === "expired") c.state = "idle";
        if (c.state === "running") c.deadline = now + c.remainMs;
        return c.state;
      },
      /* extend +60 s: no count limit; disabled while idle; from expired it restarts counting at 60 s */
      extend(now) {
        sync(now);
        if (c.state === "idle") return false;
        const wasExpired = c.state === "expired";
        if (wasExpired) { c.remainMs = EXT_MS; c.state = "running"; c.deadline = now + EXT_MS; }
        else if (c.state === "running") c.deadline += EXT_MS;
        else c.remainMs += EXT_MS;
        c.extCount += 1; c.undo = { wasExpired, at: now };
        return true;
      },
      /* undo of the last extension, only within 3 s; elapsed time is not given back */
      undoExtend(now) {
        const u = c.undo;
        if (!u || now - u.at > UNDO_MS) { c.undo = null; return false; }
        sync(now);
        if (u.wasExpired) { c.state = "expired"; c.remainMs = 0; c.deadline = 0; }
        else if (c.state === "running") { c.deadline -= EXT_MS; if (c.deadline <= now) { c.state = "expired"; c.remainMs = 0; c.deadline = 0; } }
        else if (c.state === "paused") c.remainMs = Math.max(0, c.remainMs - EXT_MS);
        c.extCount = Math.max(0, c.extCount - 1); c.undo = null; return true;
      },
      expireUndo(now) { if (c.undo && now - c.undo.at > UNDO_MS) { c.undo = null; return true; } return false; },
      /* persistence: a running clock is stored with its remaining time and comes back paused */
      snapshot(now) { sync(now); return { state: c.state, remainMs: Math.round(remaining(now)), extCount: c.extCount }; },
      restore(snap, now) {
        if (!snap || typeof snap !== "object") return false;
        const states = ["idle", "running", "paused", "expired"];
        if (!states.includes(snap.state) || !Number.isFinite(snap.remainMs) || !Number.isInteger(snap.extCount) || snap.extCount < 0 || snap.extCount > 9999) return false;
        const max = c.base * 1000 + snap.extCount * EXT_MS;
        const remain = Math.min(Math.max(0, snap.remainMs), Math.min(max, MAX_MS));
        c.extCount = snap.extCount; c.undo = null; c.deadline = 0;
        if (snap.state === "idle") { c.state = "idle"; c.remainMs = c.base * 1000; c.extCount = 0; }
        else if (snap.state === "expired" || remain <= 0) { c.state = "expired"; c.remainMs = 0; }
        else { c.state = "paused"; c.remainMs = remain; }
        return true;
      }
    };
    return api;
  }

  /* ---------- storage (own key only; every access is guarded) ---------- */
  function readStore(storage) {
    const out = { enabled: false, base: DEFAULT_BASE, clock: null };
    try {
      const raw = storage && storage.getItem(KEY); if (!raw) return out;
      const v = JSON.parse(raw); if (!v || typeof v !== "object" || v.v !== 1) return out;
      if (v.enabled === true) out.enabled = true;
      if (BASES.includes(v.base)) out.base = v.base;
      if (v.clock && typeof v.clock === "object" && typeof v.clock.key === "string") out.clock = v.clock;
    } catch (_) { /* invalid value -> defaults (OFF, 45 s) */ }
    return out;
  }
  function writeStore(storage, data) {
    try { storage && storage.setItem(KEY, JSON.stringify({ v: 1, enabled: data.enabled === true, base: data.base, clock: data.clock || null })); return true; } catch (_) { return false; }
  }

  const api = { KEY, BASES, DEFAULT_BASE, EXT_MS, UNDO_MS, createClock, readStore, writeStore };
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document === "undefined" || !root.document) return;
  root.CueScoreShotClockV1 = api;

  /* ---------- UI ---------- */
  const doc = document;
  const CAT = root.CueScoreShotClockCatalogV1 || {};
  const LANG = () => (root.CueScoreI18n && root.CueScoreI18n.language) || "ja";
  /* own provisional catalog (see i18n-catalog-shotclock-v1.js); missing language or key falls back to ja, then to the key (same policy as the main catalogs) */
  const T = (key, params) => {
    const lang = LANG(), dict = CAT[lang] || CAT.ja || {};
    let v = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : (CAT.ja || {})[key];
    if (v === undefined) return key;
    if (v && typeof v === "object") { let form = "other"; try { form = new Intl.PluralRules(lang === "zh-Hans" ? "zh-CN" : lang).select(Number(params && params.count)); } catch (_) { /* other */ } v = v[form] !== undefined ? v[form] : v.other; }
    return String(v).replace(/\{([A-Za-z0-9_]+)\}/g, (m, n) => (params && Object.prototype.hasOwnProperty.call(params, n) ? String(params[n]) : m));
  };
  const $ = (sel, scope) => (scope || doc).querySelector(sel);
  const storage = (() => { try { return root.localStorage; } catch (_) { return null; } })();
  let store = readStore(storage);
  const save = () => writeStore(storage, store);

  const ICON_PLAY = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" fill="currentColor"/></svg>';
  const ICO = '<i class="cue-sc-ico" aria-hidden="true"></i>';

  let clock = null, dock = null, els = null, ticker = 0, textScale = 1, pendingNew = false, lastSec = -1, lastAnnounce = "", lastSig = "";
  const screen = () => $("#proGameScreen");
  const shown = () => { const s = screen(); return Boolean(s && !s.classList.contains("hidden") && s.offsetParent !== null); };
  /* identity of the match on screen (start time + player names + discipline), stored only as a short hash so the clock key holds no names */
  const matchKey = () => {
    const text = ["#proStartTime", "#proP1Name", "#proP2Name", "#proGameTitleV1"].map(sel => ($(sel) && $(sel).textContent || "").trim()).join("|");
    let h = 0x811c9dc5; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return "m" + h.toString(16);
  };
  const level = (c, n) => (c.state === "expired" ? "over" : c.state === "idle" ? "ok" : n <= 5 ? "danger" : n <= 10 ? "warn" : "ok");

  function persistClock() {
    if (!clock) return;
    const snap = clock.snapshot(Date.now());
    store.clock = Object.assign({ key: matchKey() }, snap); save();
  }
  function mk(html) { const d = doc.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; }

  function mount() {
    const s = screen(), wrap = s && $(".pro-log-wrap", s);
    if (!s || !wrap || dock) return false;
    dock = mk('<section class="cue-sc-dock" role="timer"><div class="cue-sc-bar" role="presentation"><i></i></div><div class="cue-sc-time"><b class="cue-sc-num"></b><span class="cue-sc-unit"></span></div>' +
      '<button type="button" class="cue-sc-btn cue-sc-extb"></button><button type="button" class="cue-sc-btn cue-sc-resetb"><span class="cue-sc-lb"></span></button><button type="button" class="cue-sc-btn cue-sc-main"></button>' +
      '<span class="cue-sc-sr" aria-live="polite"></span></section>');
    wrap.appendChild(dock); s.classList.add("cue-sc-on");
    els = { num: $(".cue-sc-num", dock), unit: $(".cue-sc-unit", dock), fill: $(".cue-sc-bar i", dock), main: $(".cue-sc-main", dock), ext: $(".cue-sc-extb", dock), rst: $(".cue-sc-resetb", dock), live: $(".cue-sc-sr", dock), wrap };
    els.main.addEventListener("click", () => { clock.toggle(Date.now()); after(); });
    els.rst.addEventListener("click", () => { clock.reset(Date.now()); after(); });
    els.ext.addEventListener("click", () => { const now = Date.now(); if (clock.undo) clock.undoExtend(now); else clock.extend(now); after(); scheduleUndoExpiry(); });
    dock.setAttribute("aria-label", T("shotclock.aria.role"));
    els.rst.setAttribute("aria-label", T("shotclock.aria.reset"));
    return true;
  }
  function unmount() {
    clearInterval(ticker); ticker = 0; clearTimeout(undoTimer);
    if (dock) dock.remove();
    const s = screen(); if (s) s.classList.remove("cue-sc-on");
    if (els && els.wrap) els.wrap.classList.remove("cue-sc-nolog");
    dock = null; els = null; clock = null; lastSec = -1; lastAnnounce = ""; lastSig = "";
  }
  let undoTimer = 0;
  function scheduleUndoExpiry() { clearTimeout(undoTimer); if (clock && clock.undo) undoTimer = setTimeout(() => { if (clock && clock.expireUndo(Date.now())) render(); }, UNDO_MS + 30); }
  function after() { render(); persistClock(); startTicker(); }
  function startTicker() {
    if (!clock) return;
    if (clock.state === "running" && !ticker) ticker = setInterval(tick, 200);
    if (clock.state !== "running" && ticker) { clearInterval(ticker); ticker = 0; }
  }
  function tick() {
    if (!clock) return;
    const now = Date.now(), before = clock.state;
    clock.sync(now); clock.expireUndo(now);
    render();
    if (clock.state !== before) { persistClock(); startTicker(); }
    else if (clock.state === "running") { const n = clock.seconds(now); if (n !== lastSec) { lastSec = n; persistClock(); } }
  }

  function render() {
    if (!clock || !dock) return;
    const now = Date.now(); clock.sync(now);
    const n = clock.seconds(now), st = clock.state, lv = level(clock, n), un = clock.undo && now - clock.undo.at <= UNDO_MS;
    const total = Math.max(clock.base * 1000 + clock.extCount * EXT_MS, 1);
    const frac = st === "idle" ? 1 : Math.max(0, Math.min(1, clock.remaining(now) / total));
    els.fill.style.width = frac * 100 + "%";
    const sig = [n, st, lv, un ? 1 : 0, clock.extCount, textScale].join("|");
    if (sig === lastSig) return;                      // only the progress bar moves between whole seconds: no DOM churn under the user's finger
    lastSig = sig;
    dock.dataset.lv = lv; dock.dataset.st = st; dock.style.setProperty("--cue-scv-ts", String(textScale));
    dock.classList.toggle("cue-sc-lg", textScale >= 1.3); dock.classList.toggle("cue-sc-lg2", textScale >= 1.6);
    els.wrap.classList.remove("cue-sc-nolog");
    if (textScale >= 1.3 && els.wrap.getBoundingClientRect().height < 200) els.wrap.classList.add("cue-sc-nolog");
    els.num.textContent = String(n);
    const ct = x => '<span class="cue-sc-cap-t">' + x + "</span>";
    const sec = T("shotclock.sec");
    els.unit.innerHTML = st === "idle" ? ct(T("shotclock.ready")) : st === "paused" ? ct(T("shotclock.paused")) : st === "expired" ? ICO + ct(T("shotclock.expired")) : lv === "ok" ? ct(sec) : ICO + ct(sec);
    const label = st === "running" ? T("shotclock.pause") : st === "paused" ? T("shotclock.resume") : T("shotclock.start");
    els.main.innerHTML = '<span class="cue-sc-ic">' + (st === "running" ? ICON_PAUSE : ICON_PLAY) + '</span><span class="cue-sc-lb"></span>';
    $(".cue-sc-lb", els.main).textContent = label; els.main.setAttribute("aria-label", T("shotclock.aria.role") + ", " + label);
    $(".cue-sc-lb", els.rst).textContent = T("shotclock.reset");
    els.rst.disabled = st === "idle";
    const hot = lv !== "ok" && !un;
    els.ext.dataset.hot = hot ? "1" : "0"; els.ext.dataset.undo = un ? "1" : "0";
    els.ext.dataset.count = !un && clock.extCount > 0 ? "×" + clock.extCount : "";
    els.ext.disabled = st === "idle";
    els.ext.innerHTML = '<span class="cue-sc-lb"></span><small></small>';
    $(".cue-sc-lb", els.ext).textContent = un ? T("shotclock.undo") : T("shotclock.extend"); $("small", els.ext).textContent = un ? "−60" : "+60";
    els.ext.setAttribute("aria-label", un ? T("shotclock.aria.undo") : (clock.extCount > 0 ? T("shotclock.aria.extend") + ", " + T("shotclock.aria.extCount", { count: clock.extCount }) : T("shotclock.aria.extend")));
    const msg = st === "expired" ? T("shotclock.aria.expired") : (st === "running" && [30, 10, 5].includes(n)) ? T("shotclock.aria.left", { count: n }) : "";
    if (msg && msg !== lastAnnounce) { els.live.textContent = msg; lastAnnounce = msg; } else if (!msg) lastAnnounce = "";
  }

  function show() {
    if (!store.enabled) return;                       // OFF: nothing is created on the match screen
    if (!mount()) return;
    clock = createClock(store.base);
    const key = matchKey(), saved = store.clock;
    if (!pendingNew && saved && saved.key === key) clock.restore(saved, Date.now());
    pendingNew = false;
    render(); persistClock(); startTicker(); scheduleUndoExpiry();
  }
  function hide() {
    if (clock) { const now = Date.now(); clock.sync(now); if (clock.state === "running") clock.toggle(now); persistClock(); }
    unmount();
  }
  let wasShown = false;
  function reconcile() {
    const nowShown = shown();
    if (nowShown && !wasShown) { wasShown = true; requestAnimationFrame(() => { if (shown()) show(); }); }
    else if (!nowShown && wasShown) { wasShown = false; hide(); }
  }
  function onVisibility() {
    if (!clock) return;
    if (doc.visibilityState === "hidden") persistClock();
    else { clock.sync(Date.now()); render(); persistClock(); startTicker(); }
  }

  /* ---------- match setup row (ON/OFF + base time), inserted above the start button ---------- */
  function buildSetup() {
    const start = $("#startGameBtn"), card = start && start.closest(".cue-new-match-v1");
    if (!start || !card || $(".cue-sc-setup", card)) return;
    const sec = mk('<section class="cue-sc-setup"><div class="cue-sc-setup-row"><div class="cue-sc-setup-text"><span class="cue-sc-setup-title"></span><span class="cue-sc-setup-sub"></span></div>' +
      '<button type="button" role="switch" class="cue-sc-switch"><span class="cue-sc-track"><span class="cue-sc-knob"></span></span></button></div>' +
      '<div class="cue-sc-base" role="radiogroup"><span class="cue-sc-base-label"></span><span class="cue-sc-base-btns"></span></div></section>');
    start.parentNode.insertBefore(sec, start);
    const sw = $(".cue-sc-switch", sec), baseWrap = $(".cue-sc-base", sec), btns = $(".cue-sc-base-btns", sec);
    $(".cue-sc-setup-title", sec).textContent = T("shotclock.title");
    $(".cue-sc-setup-sub", sec).textContent = T("shotclock.supplement");
    $(".cue-sc-base-label", sec).textContent = T("shotclock.baseTime");
    sw.setAttribute("aria-label", T("shotclock.title"));
    baseWrap.setAttribute("aria-label", T("shotclock.baseTime") + " (" + T("shotclock.sec") + ")");
    BASES.forEach(b => { const o = doc.createElement("button"); o.type = "button"; o.setAttribute("role", "radio"); o.dataset.base = String(b); o.className = "cue-sc-base-btn"; o.textContent = String(b); o.setAttribute("aria-label", b + " " + T("shotclock.sec")); btns.appendChild(o); });
    const paint = () => {
      sw.setAttribute("aria-checked", String(store.enabled)); sec.dataset.on = store.enabled ? "1" : "0"; baseWrap.hidden = !store.enabled;
      btns.querySelectorAll("button").forEach(o => o.setAttribute("aria-checked", String(Number(o.dataset.base) === store.base)));
    };
    sw.addEventListener("click", () => { store.enabled = !store.enabled; save(); paint(); });
    btns.addEventListener("click", e => { const b = e.target.closest("button[data-base]"); if (!b) return; store.base = Number(b.dataset.base); save(); paint(); });
    paint();
  }

  function init() {
    buildSetup();
    const s = screen();
    /* show / hide of the match screen is detected with IntersectionObserver (display:none <-> visible); a slow poll is the fallback */
    if (s && typeof root.IntersectionObserver === "function") new root.IntersectionObserver(reconcile).observe(s);
    else setInterval(reconcile, 500);
    const sb = $("#startGameBtn");
    if (sb) sb.addEventListener("click", () => { pendingNew = true; }, true);
    doc.addEventListener("visibilitychange", onVisibility);
    root.addEventListener("pageshow", onVisibility);
    root.addEventListener("resize", () => { lastSig = ""; render(); });
    root.addEventListener("pagehide", () => { if (clock) persistClock(); });
    reconcile();
  }
  /* verification hooks (inert unless called): pseudo text enlargement for the 100/130/160/200% layout checks, and read-only state */
  api.setTextScale = v => { textScale = Number(v) > 0 ? Number(v) : 1; render(); };
  api.debug = () => ({ enabled: store.enabled, base: store.base, mounted: Boolean(dock), state: clock ? clock.state : null, extCount: clock ? clock.extCount : null });
  api.reloadStore = () => { store = readStore(storage); };
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})(typeof globalThis !== "undefined" ? globalThis : this);

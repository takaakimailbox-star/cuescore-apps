/* CueScore UI Pilot P1 (internal comparison build). NOT adopted: it exists only so the Product Owner can compare the new 9-Ball / 10-Ball match controls with the current ones on the same iPhone and match.
 * Default OFF. Scope: 9-Ball and 10-Ball match screens only. Presentation only: it never reads or writes match data, score, turn, log, the shot clock or entitlements.
 * Storage: its own key `cueScore.uiPilot.v1` (not backed up). It is a single removable unit: ui-pilot-v1.js / .css, i18n-catalog-uipilot-v1.js and their 3 tags in index.html (see docs: removal before an App Store submission).
 * No DOM mutation watchers: visibility uses IntersectionObserver, animation triggers use a requestAnimationFrame comparison that runs only while the Pilot is applied. */
(function (root) {
  "use strict";
  const KEY = "cueScore.uiPilot.v1";
  const RACK_ICONS = Object.freeze(["game-9ball.svg", "game-10ball.svg"]);
  const isRackIconSrc = src => RACK_ICONS.some(name => String(src || "").split("?")[0].endsWith("/" + name) || String(src || "") === name);
  function readStore(storage) {
    const out = { enabled: false, on: true };
    try {
      const raw = storage && storage.getItem(KEY); if (!raw) return out;
      const v = JSON.parse(raw); if (!v || typeof v !== "object" || v.v !== 1) return out;
      if (v.enabled === true) out.enabled = true;
      if (v.on === false) out.on = false;
    } catch (_) { /* defaults: OFF */ }
    return out;
  }
  function writeStore(storage, s) { try { storage && storage.setItem(KEY, JSON.stringify({ v: 1, enabled: s.enabled === true, on: s.on !== false })); return true; } catch (_) { return false; } }
  /* the Pilot style is applied only for an enabled comparison, the current choice "new", and a 9-Ball / 10-Ball match */
  const applied = (s, iconSrc) => Boolean(s.enabled && s.on && isRackIconSrc(iconSrc));
  const api = { KEY, isRackIconSrc, readStore, writeStore, applied };
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document === "undefined" || !root.document) return;
  root.CueScoreUiPilotV1 = api;

  const doc = document, $ = (s, r) => (r || doc).querySelector(s);
  const CAT = root.CueScoreUiPilotCatalogV1 || {};
  const LANG = () => (root.CueScoreI18n && root.CueScoreI18n.language) || "ja";
  const T = (key, params) => {
    const dict = CAT[LANG()] || CAT.ja || {}; let v = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : (CAT.ja || {})[key];
    if (v === undefined) return key;
    return String(v).replace(/\{([A-Za-z0-9_]+)\}/g, (m, n) => (params && Object.prototype.hasOwnProperty.call(params, n) ? String(params[n]) : m));
  };
  const storage = (() => { try { return root.localStorage; } catch (_) { return null; } })();
  let store = readStore(storage);
  const save = () => writeStore(storage, store);
  const screen = () => $("#proGameScreen");
  const shown = () => { const s = screen(); return Boolean(s && !s.classList.contains("hidden") && s.offsetParent !== null); };
  const matchIcon = () => { const i = $("#proGameTitleIconV1"); return (i && i.getAttribute("src")) || ""; };
  const reduceMotion = () => { try { return root.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (_) { return false; } };

  /* ---------- match screen ---------- */
  let raf = 0, last = null, bound = false;
  const stateWord = () => T(store.on ? "uipilot.new" : "uipilot.old");
  function applyScreen() {
    const s = screen(); if (!s) return;
    const rack = shown() && isRackIconSrc(matchIcon()), compare = rack && store.enabled;
    s.classList.toggle("ui-pilot-p1", compare && store.on);
    const st = $("#proStartTime");
    if (st) {
      if (compare) {
        st.dataset.uip = " · " + stateWord(); st.setAttribute("role", "switch"); st.setAttribute("tabindex", "0"); st.setAttribute("aria-checked", String(store.on));
        st.setAttribute("aria-label", (st.textContent || "").trim() + ". " + T("uipilot.aria", { state: stateWord() }));
        if (!bound) { bound = true; st.addEventListener("click", toggle); st.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } }); }
      } else if (st.dataset.uip !== undefined) { delete st.dataset.uip; st.removeAttribute("role"); st.removeAttribute("tabindex"); st.removeAttribute("aria-checked"); st.removeAttribute("aria-label"); }
    }
    if (compare && store.on && !reduceMotion()) startLoop(); else stopLoop();
  }
  function toggle() { if (!shown() || !store.enabled) return; store.on = !store.on; save(); applyScreen(); }
  /* animation triggers: compare the visible score text / newest log row each frame (only while applied) */
  const sig = () => { const l = $("#proTurnLog"); return { s1: ($("#proP1Score") || {}).textContent, s2: ($("#proP2Score") || {}).textContent, n: l ? l.childElementCount : 0, t: l && l.lastElementChild ? l.lastElementChild.textContent : "" }; };
  const play = (node, cls) => { if (!node) return; node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); node.addEventListener("animationend", () => node.classList.remove(cls), { once: true }); };
  function frame() {
    raf = 0; if (!shown()) { last = null; return; }
    const now = sig();
    if (last) {
      if (now.s1 !== last.s1) play($("#proP1Score"), "uip-tick");
      if (now.s2 !== last.s2) play($("#proP2Score"), "uip-tick");
      if (now.n > last.n || (now.n === last.n && now.t !== last.t && now.n > 0)) { const l = $("#proTurnLog"); if (l && l.lastElementChild) play(l.lastElementChild, "uip-row"); }
    }
    last = now; raf = root.requestAnimationFrame(frame);
  }
  function startLoop() { if (!raf) { last = null; raf = root.requestAnimationFrame(frame); } }
  function stopLoop() { if (raf) { root.cancelAnimationFrame(raf); raf = 0; } last = null; }

  /* ---------- match setup row (only while a 9-Ball / 10-Ball setup is open) ---------- */
  let row = null;
  function mk(html) { const d = doc.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; }
  function buildRow() {
    const start = $("#startGameBtn"), card = start && start.closest(".cue-new-match-v1");
    if (!start || !card || $(".uip-setup", card)) return;
    row = mk('<section class="uip-setup" hidden><div class="uip-setup-text"><span class="uip-setup-title"></span><span class="uip-setup-sub"></span></div><button type="button" role="switch" class="uip-switch"><span class="uip-track"><span class="uip-knob"></span></span></button></section>');
    start.parentNode.insertBefore(row, start);
    $(".uip-setup-title", row).textContent = T("uipilot.title"); $(".uip-setup-sub", row).textContent = T("uipilot.sub");
    const sw = $(".uip-switch", row); sw.setAttribute("aria-label", T("uipilot.title"));
    const paint = () => sw.setAttribute("aria-checked", String(store.enabled));
    sw.addEventListener("click", () => { store.enabled = !store.enabled; if (store.enabled) store.on = true; save(); paint(); });
    row.refresh = () => { const icon = $("#cueSelectedGameIconV1"); row.hidden = !isRackIconSrc(icon && icon.getAttribute("src")); paint(); };
    row.refresh();
  }
  const refreshRow = () => { if (row && row.refresh) row.refresh(); };

  function init() {
    buildRow();
    const s = screen();
    if (s && typeof root.IntersectionObserver === "function") new root.IntersectionObserver(() => applyScreen()).observe(s); else setInterval(applyScreen, 500);
    const card = $(".cue-new-match-v1");
    if (card && typeof root.IntersectionObserver === "function") new root.IntersectionObserver(refreshRow).observe(card);
    doc.addEventListener("click", () => root.setTimeout(refreshRow, 0), true);
    doc.addEventListener("visibilitychange", () => { if (doc.visibilityState === "visible") applyScreen(); });
    applyScreen();
  }
  api.debug = () => ({ enabled: store.enabled, on: store.on, applied: Boolean(screen() && screen().classList.contains("ui-pilot-p1")), looping: Boolean(raf) });
  api.reloadStore = () => { store = readStore(storage); refreshRow(); applyScreen(); };
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})(typeof globalThis !== "undefined" ? globalThis : this);

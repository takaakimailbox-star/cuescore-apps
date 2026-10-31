/* CueScore match-setup UX trial (Build 95 candidate). Presentation only:
 *  - CueScoreMenuV1: a small anchored tap menu (listbox) used for the clock times and, as a VIEW over the existing Race-to sheet, for short Race-to / Skill Level lists.
 *  - empty-player state (is-empty-v1) and the footer reason line for the disabled "start match" button.
 * It never changes a match setting, a start condition or stored data: choosing a menu row clicks the SAME button of the existing sheet (data-race-value), so the existing
 * validation / apply code runs unchanged. The start button keeps its HTML `disabled` attribute (owned by final-ui-build18.js); this file only reads it. */
(function (root) {
  "use strict";
  const doc = root.document;
  if (!doc) return;
  const $ = (s, r) => (r || doc).querySelector(s);
  const CAT = root.CueScoreSetupUxCatalogV1 || {};
  const LANG = () => (root.CueScoreI18n && root.CueScoreI18n.language) || "ja";
  const T = key => { const d = CAT[LANG()] || CAT.ja || {}; return Object.prototype.hasOwnProperty.call(d, key) ? d[key] : ((CAT.ja || {})[key] || key); };
  const ROW_PX = 46, MENU_MAX_HEIGHT = Math.round(ROW_PX * 7.5 + 14);      // bounded list: about 6.5 scrolling rows + the pinned "Other" row; longer lists scroll

  /* ---------- tap menu ---------- */
  let openMenu = null;
  function closeMenu(restoreFocus) {
    if (!openMenu) return;
    const m = openMenu; openMenu = null;
    doc.removeEventListener("keydown", m.onKey, true);
    root.removeEventListener("resize", m.onResize);
    m.layer.remove();
    if (m.anchor) { m.anchor.setAttribute("aria-expanded", "false"); if (restoreFocus && m.anchor.isConnected) try { m.anchor.focus({ preventScroll: true }); } catch (_) { /* focus is best effort */ } }
    if (typeof m.onClose === "function") m.onClose();
  }
  function menuOpen(opts) {
    closeMenu(false);
    const anchor = opts.anchor, rows = opts.options || [];
    const layer = doc.createElement("div"); layer.className = "cue-menu-layer-v1";
    const scrim = doc.createElement("div"); scrim.className = "cue-menu-scrim-v1"; scrim.setAttribute("role", "presentation");      // NOT aria-hidden: the global [aria-hidden=true]{pointer-events:none} rule would make the outside tap fall through to the layer below
    const menu = doc.createElement("div"); menu.className = "cue-menu-v1"; menu.setAttribute("role", "listbox"); if (opts.title) menu.setAttribute("aria-label", opts.title);
    rows.forEach((o, i) => {
      const b = doc.createElement("button"); b.type = "button"; b.className = "cue-menu-row-v1"; b.setAttribute("role", "option"); b.dataset.i = String(i);
      b.setAttribute("aria-selected", String(Boolean(o.selected))); if (o.pinned) b.classList.add("is-pinned-v1");
      const t = doc.createElement("span"); t.className = "cue-menu-text-v1"; t.textContent = o.label;
      if (o.sub) { const s = doc.createElement("small"); s.textContent = o.sub; t.appendChild(s); }
      const ck = doc.createElement("span"); ck.className = "cue-menu-check-v1"; ck.setAttribute("aria-hidden", "true"); ck.textContent = o.selected ? "✓" : "";
      b.appendChild(t); b.appendChild(ck); menu.appendChild(b);
    });
    layer.appendChild(scrim); layer.appendChild(menu); doc.body.appendChild(layer);
    if (anchor) anchor.setAttribute("aria-expanded", "true");
    const place = () => {
      const r = anchor ? anchor.getBoundingClientRect() : { left: 8, right: 8 + 200, top: 100, bottom: 120, width: 200 };
      const vw = root.innerWidth, vh = root.innerHeight, gap = 6, pad = 8;
      menu.style.width = Math.min(Math.max(r.width, 190), vw - 2 * pad) + "px";
      menu.style.maxHeight = ""; menu.style.top = "0px"; menu.style.left = "0px";
      const want = Math.min(menu.scrollHeight, vh * 0.62, MENU_MAX_HEIGHT), below = vh - r.bottom - gap - pad, above = r.top - gap - pad;
      const up = below < want && above > below, h = Math.max(120, Math.min(want, up ? above : below));
      menu.style.maxHeight = h + "px";
      menu.style.left = Math.max(pad, Math.min(r.left, vw - pad - menu.offsetWidth)) + "px";
      menu.style.top = (up ? Math.max(pad, r.top - gap - h) : r.bottom + gap) + "px";
    };
    place();
    const pick = i => { const o = rows[i]; if (!o) return; const cb = opts.onPick; closeMenu(true); if (typeof cb === "function") cb(o.value, o); };
    menu.addEventListener("click", e => { const b = e.target.closest(".cue-menu-row-v1"); if (b) pick(Number(b.dataset.i)); });
    const cancel = () => { const cb = opts.onCancel; closeMenu(true); if (typeof cb === "function") cb(); };
    scrim.addEventListener("click", cancel);
    const buttons = () => Array.from(menu.querySelectorAll(".cue-menu-row-v1"));
    const onKey = e => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); cancel(); return; }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault(); const bs = buttons(), i = bs.indexOf(doc.activeElement);
      bs[(i + (e.key === "ArrowDown" ? 1 : -1) + bs.length) % bs.length].focus();
    };
    doc.addEventListener("keydown", onKey, true);
    const onResize = () => place(); root.addEventListener("resize", onResize);
    openMenu = { layer, anchor, onKey, onResize, onClose: opts.onClose };
    const sel = menu.querySelector('[aria-selected="true"]') || menu.querySelector(".cue-menu-row-v1");
    if (sel) { menu.scrollTop = Math.max(0, sel.offsetTop - (menu.clientHeight - sel.offsetHeight) / 2); root.setTimeout(() => { try { sel.focus({ preventScroll: true }); } catch (_) { /* best effort */ } }, 0); }
    return { close: () => closeMenu(false) };
  }
  root.CueScoreMenuV1 = Object.freeze({ open: menuOpen, close: () => closeMenu(false), maxHeight: MENU_MAX_HEIGHT });

  /* ---------- Race to / Skill Level: the existing sheet is shown as a tap menu when the list is short ---------- */
  let lastRaceTrigger = null;
  function adaptRacePicker() {
    const picker = $("#newMatchRacePickerV1");
    if (!picker) return;
    const adapt = () => {
      if (picker.classList.contains("hidden") || picker.classList.contains("is-custom-v6") || picker.classList.contains("cue-menu-mode-v1") || !lastRaceTrigger) return;
      const real = Array.from(picker.querySelectorAll(".new-match-race-options-v1 [data-race-value]"));
      if (!real.length) return;
      const rows = real.map(b => {
        const small = b.querySelector("small"), clone = b.cloneNode(true); if (clone.querySelector("small")) clone.querySelector("small").remove();
        const other = b.dataset.raceValue === "other";
        return { value: b.dataset.raceValue, label: other ? T("setupux.menu.other") : clone.textContent.trim(), sub: small ? small.textContent.trim() : "", selected: b.classList.contains("is-selected"), real: b, pinned: other };
      });
      picker.classList.add("cue-menu-mode-v1");
      const title = (($("#newMatchRacePickerTitleV1") || {}).textContent || "").trim();
      menuOpen({
        anchor: lastRaceTrigger, title, options: rows,
        onPick: (v, o) => o.real.click(),            // the existing sheet applies / validates exactly as before (and shows its custom input for "Other")
        onCancel: () => { const c = $("#newMatchRacePickerCloseV1"); if (c) c.click(); },
        onClose: () => { if (picker.classList.contains("cue-menu-mode-v1")) picker.classList.remove("cue-menu-mode-v1"); }   // guarded: classList.remove() on an absent class still rewrites the attribute
      });
    };
    /* explicit trigger (no DOM watching): the existing click handler opens the sheet first; the menu is shown in the next frame */
    doc.addEventListener("click", e => {
      const t = e.target.closest && e.target.closest("[data-race-target]");
      if (t) { lastRaceTrigger = t; root.requestAnimationFrame(() => root.setTimeout(adapt, 0)); }
    }, true);
  }

  /* ---------- empty player state + footer reason ---------- */
  function setupReason() {
    const start = $("#startGameBtn"), reason = $("#cueSetupReasonV1");
    if (!start || !reason) return;
    const name = n => (($("#p" + n + "Name") || {}).value || "").trim();
    const update = () => {
      const home = $("#cueHomeV1");
      if (!home || !home.classList.contains("match-setup-active-v3")) return;      // only while the setup screen is open (no work during a match)
      [1, 2].forEach(n => { const card = $("#newMatchPlayerCard" + n + "V1"); if (card) card.classList.toggle("is-empty-v1", !name(n)); });
      const miss = [];
      if (!name(1)) miss.push(1);
      if (!name(2)) miss.push(2);
      /* fewer than two registered players: the existing guide card (final-ui-build18.js) already explains it and offers "add player"; saying "select" would mislead, so the reason line stays quiet */
      const guide = $(".match-player-guide-v18");
      if (!start.disabled || (guide && !guide.hidden)) { reason.hidden = true; reason.textContent = ""; reason.removeAttribute("data-slot"); return; }
      const key = miss.length === 2 ? "setupux.reason.both" : miss[0] === 1 ? "setupux.reason.p1" : miss[0] === 2 ? "setupux.reason.p2" : "setupux.reason.other";
      reason.hidden = false; reason.textContent = T(key); reason.dataset.slot = String(miss[0] || 2);
      reason.setAttribute("aria-label", T("setupux.reason.aria") + ": " + T(key));
    };
    /* the reason line leads to the missing selection through the EXISTING player-select button (no new dialog, no start-condition change) */
    reason.addEventListener("click", () => { const b = $("#p" + (reason.dataset.slot || "2") + "PlayerSearchBtn"); if (b) b.click(); });
    /* explicit triggers only (the same pattern as final-ui-build18.js refreshSoon): every change of the selection comes from a user interaction; update after the next two frames so
       the existing refresh (which owns the start button's disabled state) has already run */
    const later = () => { root.requestAnimationFrame(() => root.requestAnimationFrame(update)); root.setTimeout(update, 250); root.setTimeout(update, 800); };   // the selection can settle a little later on a slow device (library overlay -> refresh)
    ["click", "input", "change"].forEach(t => doc.addEventListener(t, later, true));
    root.addEventListener("pageshow", update);
    root.addEventListener("popstate", later);
    update();
    [300, 1200].forEach(ms => root.setTimeout(update, ms));     // the first selection (main player) is applied during boot
  }

  function init() { adaptRacePicker(); setupReason(); }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})(typeof globalThis !== "undefined" ? globalThis : this);

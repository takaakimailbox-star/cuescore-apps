/* CueScore Android shell adapter (Android only; injected by scripts/build-android-web.mjs, never loaded by iOS/PWA).
   Maps the Android system Back gesture/button onto the app's existing in-app Back controls. It adds no UI,
   no feature and no new screen: it only clicks the visible Back button that the shared UI already provides. */
(() => {
  "use strict";
  if (window.CueScoreAndroidBackV1) return;
  // Highest precedence first: modal-like overlays, then full screens, then sub-screens.
  const BACK_SELECTORS = Object.freeze([
    ".cue-pro-overlay-v1:not([hidden]) .cue-pro-back-v1",
    "#breakResultBackConfirmCloseV1",
    "#matchSharingFlowBackV1",
    "#matchSharingReceiverBackV1",
    "#matchSharingSenderBackV1",
    "#classificationManagerBackV381",
    "#statisticsFilterBackBtn",
    "#recordDetailBackBtn",
    "#vsAnalysisBackBtn",
    "#rankingsBackBtn",
    "#playerStatsBackBtn",
    "#playerLibraryBackBtn",
    "#dataManagementBackBtn",
    "#settingsBackBtn",
    "#recordsBackV2",
    "#proGameBackBtn",
    "#cueMatchSetupBackV3",
    "#breakResultBackV3"
  ]);
  const visible = node => {
    if (!node || node.hidden || node.disabled) return false;
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return false;
    for (let parent = node.parentElement; parent; parent = parent.parentElement) {
      if (parent.hidden || parent.classList.contains("hidden") || getComputedStyle(parent).display === "none") return false;
    }
    return node.getClientRects().length > 0;
  };
  /* ---- PROTOTYPE (not the formal spec until Product Owner approval; default policy stays "current") ----
     Proposal "proposal": modal -> close it; sub-screen Back controls (as today); Players/History/Settings -> Home tab;
     a discipline selected on Home -> back to the 6-discipline list (Home tab); Home list -> minimize (unhandled). */
  const PROPOSAL_MODAL_PAIRS = Object.freeze([
    ["#newMatchRacePickerV1", "#newMatchRacePickerCloseV1"],
    ["#cueInProgressChoiceV1", "#cueInProgressCancelV1"]
  ]);
  let policy = "current";
  const homeTab = () => document.querySelector('[data-phase1-tab="home"]');
  const activeTab = () => (document.body && document.body.dataset && document.body.dataset.cuePhase1Tab) || "home";
  function handleProposal() {
    for (const [container, close] of PROPOSAL_MODAL_PAIRS) {
      const c = document.querySelector(container), b = document.querySelector(close);
      if (visible(c) && visible(b)) { b.click(); return true; }
    }
    const tab = homeTab();
    if (!tab) return false;
    if (activeTab() !== "home") { tab.click(); return true; }
    const tiles = document.querySelector("#cueDisciplineSwitcherV1"), home = document.querySelector("#cueHomeV1");
    if (visible(home) && tiles && !visible(tiles)) { tab.click(); return true; }
    return false;
  }
  /** Returns true when an in-app Back control consumed the event; false means "at root: let the shell minimize". */
  function handle() {
    for (const selector of BACK_SELECTORS) {
      const node = document.querySelector(selector);
      if (visible(node)) { node.click(); return true; }
    }
    return policy === "proposal" ? handleProposal() : false;
  }
  const setPolicy = name => { if (name !== "current" && name !== "proposal") return false; policy = name; return true; };
  window.CueScoreAndroidBackV1 = Object.freeze({ handle, selectors: BACK_SELECTORS, setPolicy, getPolicy: () => policy });
})();

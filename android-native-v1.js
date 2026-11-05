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
  /** Returns true when an in-app Back control consumed the event; false means "at root: let the shell minimize". */
  function handle() {
    for (const selector of BACK_SELECTORS) {
      const node = document.querySelector(selector);
      if (visible(node)) { node.click(); return true; }
    }
    return false;
  }
  window.CueScoreAndroidBackV1 = Object.freeze({ handle, selectors: BACK_SELECTORS });
})();

# CueScore Apps 1.2 (81) — Resume Match Modal Focus Fix Evidence

**Date:** 2026-10-01
**Git baseline:** `039b966cdcdc2fbdcf20644ff49a0815ef0098e8`
**Gate:** Implementation / Test / Visual / Native Sync / Physical RC refresh
**Distribution:** Not changed

## Product Owner evidence

Player sort、custom Delete dialog `キャンセル / 削除`、Delete success notification、Delete blocked notificationはProduct Owner Physical PASS。後続findingは`中断中の試合があります`modalの`中断中の試合を再開`tapでyellow focus outlineが残る1点だけ。

## Root cause

- Global contractは`:where(button, a, input, select, textarea, [tabindex]):focus-visible`へ3px `#ffd54a` outlineを付与する。
- modal open時はResumeへprogrammatic initial focusする。
- iOS WebViewのtouch後にもfocusが残り、global yellow outlineがResumeへ適用された。
- DOM、button layout、transition、保存dataの問題ではない。

## Fix

- modal内の`cueInProgressResumeV1`と`cueInProgressNewV1`だけをscopeとした。
- touch／coarse pointerでは`:focus`／`:focus-visible`のoutline、offset、shadowを0にした。
- keyboard focusは既存neutral `#171717` 3px outlineを維持した。
- Cancel、global focus rule、Resume initial focus、Player Search focus suppression、button layout、Bottom Navigationを変更していない。
- Cache identityはBuild 81のworking candidateとして`2.0-build81-resume-modal-focus-v1`へ更新した。Version／Buildは`1.2 (81)`のまま。

## Tests / Visual

- focused（Resume modal、Player Search、Player UX）：`26/26 PASS`。
- Full Node：`595/595 PASS`、FAIL `0`、SKIPPED `0`。
- `git diff --check`：PASS。
- 390×844 touch Visual：Resume／New Matchとも`outline-style:none`、`box-shadow:none`、48pt action、horizontal overflow 0、両transition PASS。
- Evidence：`outputs/resume-match-modal-focus/Visual_Audit.json`と3 PNG。

## Native / Physical RC

- 正式native sync完了。source／native-web／iOS public `index.html` SHA-256：`249874810ded8272fc08bae3dfff560351595f9eb5fe80d92772570e6dd0165e`。
- Physical device Build／sign：PASS。Executable SHA-256：`f90c6332a5f2f724b1df1e6ae63730e84d3b46c1708069207ec2418ec5dfaf5e`。`.storekit` 0。
- `CueScore RC 1.2`／`com.takaakimailboxstar.cuescoreapps.rc12`／`1.2 (81)`へuninstallなしで上書きinstall。
- RC LocalStorage database SHA-256は前後`948852ef207e003746f00f4fee0286d13a742dcc5b7a646d7dcae8967a139b0e`で一致。WAL／SHM hashも一致。
- 公開`com.takaakimailboxstar.cuescoreapps`へ操作していない。

## Boundary

- Product Owner physical re-test pending。PASSを自動記録しない。
- commit／pushなし。Build 82、Archive、TestFlight、App Store Connect、公開版操作なし。

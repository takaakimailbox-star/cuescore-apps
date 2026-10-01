# CueScore Apps 1.2 (81) — Interrupted Match Modal Bottom Navigation Fix Evidence

**Date:** 2026-10-01
**Git baseline:** `039b966cdcdc2fbdcf20644ff49a0815ef0098e8`
**Gate:** Implementation / Test / Visual / Native Sync / Release Simulator / Physical RC refresh
**Distribution:** Not changed

## Product Owner physical finding

Physical RC `CueScore RC 1.2` Version `1.2 (81)`で、`中断中の試合があります`modal下部が固定Bottom Navigationの背面へ入った。Resume focus fix自体のFAILとは判定せず、modal layoutの独立findingとして扱う。

## Actions and freeze diagnosis

source上のactionは次の3個である。

1. `中断中の試合を再開`
2. `新しい試合を始める`
3. `キャンセル`

Physical Evidenceで隠れていた最下段actionは`キャンセル`。app処理のfreeze、focus trap、modal state停滞ではない。backdropが背景を意図どおりblockする一方、modalのz-indexがNavigationより低く、dismiss actionがNavigation背面へ隠れたためfreezeのように感じられた。

## Root cause and fix

- 変更前modalはbottomに`18px + safe area`しか予約せず、z-index `9200`だった。
- fixed Bottom Navigationは68px、z-index `18000`であり、sheet／backdropより前面だった。
- modal outer insetを`68px + 18px + safe area`へ変更した。
- modal z-indexを`18020`へ上げ、open中はNavigationのpointer interactionを無効化した。
- sheetへdynamic viewportとsafe areaから算出する`max-height`、`overflow-y:auto`、touch momentum scrolling、overscroll containmentを追加した。
- open／closeでbody state classを追加／解除し、close後はHome操作を回復する。
- Navigationの位置／高さは変更していない。Resume／New Matchのtouch yellow outline 0とkeyboard neutral focusも維持した。
- working cache identityは`2.0-build81-resume-modal-nav-inset-v1`。Navigation asset固有の既存query `2.0-build81-player-list-bottom-inset-v1`は独立identityとして維持した。

## Verification

- modal／Player Search／Player UX／Player Delete／Match Sharing focused：`146/146 PASS`。
- Full Node：`596/596 PASS`、FAIL `0`、SKIPPED `0`。
- native source／native-web／iOS public `index.html` SHA-256：`c1756eb31ca521437a085a7f4146d2c1f86ebc833d22623413eb259ae8027cd3`で一致。
- `git diff --check`：PASS。
- Release Simulator Build：PASS。Bundle ID `com.takaakimailboxstar.cuescoreapps`、Version `1.2`、Build `81`、`.storekit` 0、built `index.html`同一hash。

## 390×844 Visual evidence

- viewport height：844pt。
- Navigation top／height／bottom：776／68／844pt。
- modal top／bottom：0／844pt。
- sheet top／bottom／height：455.625／758／302.375pt。
- final action `キャンセル` top／bottom／height：690／738／48pt。
- final action → Navigation gap：38pt。
- sheet → Navigation gap：18pt。
- sheet scrollHeight／clientHeight：302／302。390×844ではscroll不要で、短いviewport／Dynamic Type向け内部scroll contractを保持。
- horizontal overflow：0。
- modal z-index／Navigation z-index：18020／18000。
- open中Navigation pointer events：none。Navigation領域のhit targetはmodal backdrop。
- Resume／New Match touch yellow outline：0。keyboard neutral focus：solid 3px `#171717`。
- Resume／New Match／Cancelの全transition、modal close、close後Home操作：PASS。

## Physical RC / boundary

- Signed Physical RC artifactは`CueScore RC 1.2`、`com.takaakimailboxstar.cuescoreapps.rc12`、Version `1.2 (81)`としてBuild／sign／overwrite installをPASSした。uninstallは行っていない。
- 実機read-backでDisplay Name、Bundle ID、Version／Buildが一致した。RC LocalStorageはinstall前後でbyte-identical：database `7c62ffe38598c76d732aa5904bd86e9cc903575cf5ef2c5f2ebb223354552617`、WAL `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`、SHM `a6dbd7c9d70afe2b8dbe81b2952572894cd48d34b0b837e3854ddcd7712d159b`。
- Physical RC executable SHA-256：`303fe81d63cd438582261627bade8e5f0e0da50e5135404c147898185c338b53`。built `index.html`はsourceと同一hash、`.storekit` 0。
- Product Owner physical re-test：PASS。全3action表示、Cancel dismiss、Bottom Navigation overlap 0、Resume／New Match yellow outline 0、modal close後Home操作の5項目を実iPhoneで確認した。
- commit／pushなし。Build 82、Archive、TestFlight、App Store Connect、公開版操作なし。

## Later formalization

上記はImplementation／Physical RC Gate時点の境界記録である。後続のProduct Owner承認により、同一product contentをAccepted Product Source commit `a0971212b13fa09ace7bbb2b0ab2571a0cd7497b`として正本化した。過去Gateでcommit／pushなしだった事実は変更しない。

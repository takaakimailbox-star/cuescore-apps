# CueScore Apps 1.2 (84) — Receiver Camera Permission UI Polish

Date: 2026-10-03 (JST)

## Outcome

Implementation, automated regression, 390×844 visual audit, native sync, Release Simulator Build, and Physical RC overwrite installation are complete.

Current gate state:

`PRODUCT OWNER PHYSICAL ACCEPTED / SOURCE FORMALIZED`

Product Owner confirmed the Settings-only permission UI and recovery flow on Physical RC. Product Source commit is `8783c5e2ef4a73405ea6334c268422f6964fc920`. Source formalization was authorized separately; no Archive, Upload, TestFlight, App Store Connect, App Review resubmission, Release, or Build 85 operation was performed.

## Baseline and repository identity

- Canonical worktree: `/Users/Ludique/Documents/Codex/cuescore-build84-match-sharing-fix`
- Branch: `codex/build84-match-sharing-fix`
- External GitHub `main`: `39a42bc35612233a7ccf62a8398a68e193ef7955`
- Cache identity remains: `2.0-build84-match-sharing-fix-v1`
- Version / Build remain: `1.2 (84)`

## Product Owner physical evidence used

- Original: `/Users/Ludique/Desktop/IMG_3840.PNG`
- Dimensions: `1170×2532`
- SHA-256: `5ff9f5e3512e031862a57e0c842673d4c7c6c132a350da8bac5e47c336b751f2`
- Repository copy: `docs/implementation/evidence/build84-camera-permission-ui/IMG_3840.PNG`
- The original was copied byte-for-byte and shows the previous two-action permission UI (`カメラを確認する` and `設定を開く`).

Already accepted physical results retained as prior evidence:

- Sender: PASS
- Receiver: PASS
- Sender Single QR: PASS
- Re-share: PASS
- Receiver Camera ON scanner start: PASS
- Receiver permission recovery through Settings and a later `受け取る`: PASS

## Root cause and limited fix

The permission renderer reused the normal QR retry button for `permission=denied`, changed its label to `カメラを確認する`, and attached a permission retry mode. That action rechecked the same denied authorization state and did not provide a useful recovery route.

The fix is limited to the Receiver permission UI:

- Added one pure `receiverActionState` contract to the Receiver module.
- `denied` and `restricted` expose Settings only.
- Removed the permission-specific retry mode and retry click branch from the production UI.
- Preserved normal scan-error retry and duplicate retry behavior.
- Preserved the existing Back button and Settings action.

No Sender, QR format, compression, Base45, scanner native code, mapping, duplicate, transaction, identity, Player, navigation, Backup / Restore, Free / Pro, or schema contract was changed.

## Permission state contract

- `notDetermined`: one iOS permission request; authorized result starts scanner.
- `authorized`: scanner starts directly.
- `denied`: permission explanation; Settings action only; scanner start count remains zero.
- `restricted`: permission explanation; Settings action only; scanner start count remains zero.
- After Settings grants permission: the next History → `受け取る` entry performs a fresh authorization read and starts scanner.
- No automatic scanner start on foreground return was added.

## Automated verification

- Camera permission UI dedicated: `5/5 PASS`
- Build 84 focused plus permission recovery: `13/13 PASS`
- Match Sharing focused: `122/122 PASS`
- Full Node: `609/609 PASS`
- FAIL: `0`
- SKIPPED: `0`
- `git diff --check`: PASS

The first focused run found one stale test expectation that searched `index.html` for a duplicate-retry label after the label contract moved to the Receiver module. The test was corrected to verify the exported Receiver action contract. Product behavior did not require an additional change.

## 390×844 visual audit

Generated evidence:

- `docs/implementation/evidence/build84-camera-permission-ui/Receiver_Camera_Permission_Denied_390x844.png`
- `docs/implementation/evidence/build84-camera-permission-ui/Receiver_Camera_Permission_Denied_390x844.json`

Measured result:

- `カメラを確認する`: 0 visible
- `設定を開く`: 1 visible
- Back: 1 visible
- Settings target: `320×50 pt`
- Back target: `44×44 pt`
- clipping: 0
- horizontal overflow: 0
- Bottom Navigation visible/overlap: 0
- message `scrollHeight/clientHeight`: `753/753`

The one-action composition remains centered and does not create an abnormal internal gap.

## Native sync and builds

- Formal workflow: source → `native-web` → Capacitor iOS public
- `index.html` SHA-256 in source/native-web/iOS public/built app: `4f8840d5d9c09c67944cfe7b2ba3f4f56d3ea13b02574b0ced8e76c19a9f1da3`
- `match-sharing-receiver-v1.js` SHA-256 in source/native-web/iOS public/built app: `d6345bc520499e5d458eddae15fbf63757175f2b520c0f1dfed0fc7b0fa3eb40`
- Release Simulator Build: PASS
- Simulator artifact: `com.takaakimailboxstar.cuescoreapps / 1.2 (84)`
- Built artifact `.storekit`: 0

## Physical RC refresh and data preservation

- Device: physical iPhone 16e
- Display Name: `CueScore RC 1.2`
- Bundle ID: `com.takaakimailboxstar.cuescoreapps.rc12`
- Version / Build: `1.2 (84)`
- Release device Build / Sign: PASS
- Installation: overwrite install PASS
- Uninstall: not performed
- Launch after install: PASS

RC data-container preservation:

- WebKit / WebsiteData / LocalStorage metadata entries before: 71
- Entries after: 71
- Path/size SHA-256 before and after: `ec8abd903f5d6c07864f17f34258191e2d9c2fde3db6c26b45866060de718bf1`
- LocalStorage-only path/size SHA-256 before and after: `fdd73273256ab0217eef8ea85a9f26c3e2a18d6ce90c5dec29b69168a89d23ae`

Installed app read-back after overwrite:

- RC: `com.takaakimailboxstar.cuescoreapps.rc12 / 1.2 (84)`
- Formal/TestFlight app unchanged: `com.takaakimailboxstar.cuescoreapps / 1.2 (83)`

## Product Owner physical acceptance

Product Owner completed the Receiver permission flow:

1. Turn Camera OFF in iOS Settings.
2. Open CueScore RC 1.2 → History → `受け取る`.
3. Confirm `カメラを確認する` is absent.
4. Confirm only `設定を開く` is shown.
5. Confirm the top-left Back returns to History.
6. Open the permission screen again and tap `設定を開く`.
7. Turn Camera ON.
8. Return to the app.
9. Open History → `受け取る`.
10. Confirm the scanner starts normally.

Result: `10/10 PASS`。`カメラを確認する`は表示されず、`設定を開く`のみ、Back、Settings遷移、Camera ON後の次回Scanner起動を確認した。

Sender retest is not required because Sender code was not changed by this polish.

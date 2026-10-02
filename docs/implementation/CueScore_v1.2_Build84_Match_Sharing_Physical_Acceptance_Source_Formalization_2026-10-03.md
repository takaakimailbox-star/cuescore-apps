# CueScore Apps 1.2 Build 84 — Match Sharing Physical Acceptance / Source Formalization

- Date: 2026-10-03 JST
- Baseline: `39a42bc35612233a7ccf62a8398a68e193ef7955`
- Product Source commit: `8783c5e2ef4a73405ea6334c268422f6964fc920`
- Version / Build: `1.2 (84)`
- Gate: `PHYSICAL ACCEPTED / SOURCE FORMALIZED / UNDISTRIBUTED`

## Product Owner Physical Acceptance

- Sender Match Detail share: PASS
- Sender Single QR: PASS
- Generic error toast absent: PASS
- Back → re-share: PASS
- Receiver entry / Native Scanner / Camera ON: PASS
- Camera OFF → permission screen: PASS
- `カメラを確認する` absent: PASS
- `設定を開く` only: PASS
- Back: PASS
- Settings opens iOS Settings: PASS
- Camera ON → app → History → `受け取る` → Scanner: PASS

Physical evidence original `IMG_3840.PNG` is stored byte-for-byte at `evidence/build84-camera-permission-ui/IMG_3840.PNG` with SHA-256 `5ff9f5e3512e031862a57e0c842673d4c7c6c132a350da8bac5e47c336b751f2`.

## Accepted implementation

- Sender events and summaries are rebuilt from explicit Match Sharing v1 allow-lists; local/private and unknown fields are omitted while the validator remains strict.
- A new `sharedMatchId` is persisted only after validation, encoding, and QR artifact generation succeed.
- Receiver shows Scanner only after native `startScan` succeeds; retry tears down the previous session/listeners and performs a fresh authorization read.
- denied/restricted permission UI exposes Settings only and preserves Back. No retry loop or renamed equivalent was added.
- Official 101／102、schema、Player mapping、duplicate、atomic import、Backup／Restore、Free／Pro contractは変更していない。

## Verification evidence

- Camera permission dedicated: `5/5 PASS`
- Build 84 focused: `13/13 PASS`
- Match Sharing focused: `122/122 PASS`
- Full Node: `609/609 PASS`
- FAIL / SKIPPED: `0 / 0`
- 390×844 Visual: Settings 1、Camera check 0、Back 1、clipping／horizontal overflow／Bottom Navigation overlap 0
- Native parity: PASS
- Release Simulator Build: PASS
- Built `.storekit`: 0
- Physical RC overwrite install / data preservation: PASS

These are the already completed fresh results for the accepted Product Source; commit operations did not alter product content and were not recorded as test re-execution.

## App Store / distribution state

- Build 83 review submission is withdrawn; App Version 1.2 is `DEVELOPER_REJECTED`.
- Build 83 remains `VALID`／`APP_STORE_ELIGIBLE`／Internal TestFlight `IN_BETA_TESTING`.
- Release type remains `MANUAL`; public Version 1.1 is unchanged.
- Build 84 Archive、Upload、TestFlight、App Store Connect linkage、review resubmission、Releaseは未実施。
- Build 85は未作成。

## Scope audit

- A Sender fix: source commitに収載。
- B Receiver recovery: source commitに収載。
- C Camera permission UI polish: source commitに収載。
- D tests / scripts: source commitに収載。
- E native integration: Xcode Build identityのみ収載。generated native copiesはrepository policyどおり除外。
- F documentation / Evidence: documentation commitへ収載。
- G generated / local-only: commit対象外。
- H unknown / unrelated: 0。
- Credential / API key / token / private key: 0。

## STOP

Source formalizationまで。Archive、Upload、TestFlight、App Store Connect、App Review再提出、Releaseへ進まない。

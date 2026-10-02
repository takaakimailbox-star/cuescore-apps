# CueScore 1.2 Build 82 Player List Few-Players Content Fit Evidence

Date: 2026-10-02
Baseline: `433c97deaf47762301b4ae3d9dc5ec0f954cfeae`
Product Source commit: `f2cd1c769c96c1104caf33944eb35d65372f4a0e`
Gate: `IMPLEMENTATION COMPLETE / AUTOMATED PASS / VISUAL PASS / PRODUCT OWNER PHYSICAL ACCEPTED / UNDISTRIBUTED`

## Result

Product Owner final smokeの主要項目はALL PASS。追加UI polishとして、Player数が少ない場合にPlayer card内へ残る過剰空白を修正した。Build 82の既存App Store eligible／Internal TestFlight artifactは変更していない。

Physical RC `CueScore RC 1.2 / 1.2 (82)`でProduct Ownerがcontent-fit、Player row／鉛筆、Bottom Navigation overlap 0、通常page余白を確認し、Physical AcceptanceはPASS。修正はまだ配布artifactへ反映していない。

## Root Cause

Player Listの実scroll ownerは`.player-library-list`。既存Bottom Navigation fixは、Navigation 68px＋通常余白18px＋`env(safe-area-inset-bottom)`を同要素の`padding-bottom`へ置いていた。このreserveは安全な最下端scrollを作る一方、少人数時にも白いcard内部として描画され、最終Player row後に86px相当の空白を作っていた。`min-height`、固定height、Player row height、sortは原因ではない。

## Fix

- 実scroll ownerと`overflow-y:auto`を維持。
- Bottom Navigation reserveをcard内部`padding-bottom`から同要素の外側`margin-bottom`へ移動。
- card内部`padding-bottom`は0、通常の`scroll-padding-bottom`は18px。
- Player row height／spacing、sort、row／鉛筆構造、Navigation geometryは変更なし。

## 390×844 Visual / Numeric Evidence

| Players | max scroll | card末尾余白 | 最終Player→Navigation | row／鉛筆 | horizontal overflow |
|---:|---:|---:|---:|---:|---:|
| 0 | 0px | n/a | n/a | 0／0 | 0 |
| 1 | 0px | 1px | 580px | 1／1 | 0 |
| 2 | 0px | 1px | 523px | 2／2 | 0 |
| 7 | 0px | 1px | 238px | 7／7 | 0 |
| 11 | 9px | 1px | 19px | 11／11 | 0 |
| 12 | 66px | 1px | 19px | 12／12 | 0 |

- 検索結果1件／2件: max scroll 0、card末尾余白1px、row／鉛筆ID一致。
- keyboard相当viewport 390×560、12 Players: 最終Player→Navigation gap 19px。
- scroll release movement 0、blank row 0、orphan control 0。
- History regression: 12 Matches最下端gap 23px。
- Home／Player／History／Settings: Navigation表示、selected state、horizontal overflow 0。

Evidence:

- `outputs/player-list-bottom-navigation/Player_2_Normal_390x844.png`
- `outputs/player-list-bottom-navigation/Player_11_Normal_390x844.png`
- `outputs/player-list-bottom-navigation/Player_11_Final_390x844.png`
- `outputs/player-list-bottom-navigation/Visual_Audit.json`
- `docs/implementation/evidence/player-list-few-players-content-fit-2026-10-02/IMG_3835.PNG`（Product Owner Physical Evidence原本、1170×2532、SHA-256 `5181e26db886558b68e6bdba97f6455caa811bccfff7de2720cd24c30870dc2d`）

## Tests / Build

- Player List／Player UX／Player Delete／Match Sharing focused: `147/147 PASS`
- Full Node: `596/596 PASS`, FAIL 0, SKIPPED 0
- native foundation＋Player List: `11/11 PASS`
- native parity: source／native-web／iOS public CSS SHA-256 `799eda0651e20a974fec1c852ac5d298ea4e4ee3ccff5dd1c7bc3a20dbf01ec6`
- `git diff --check`: PASS
- Release Simulator Build: PASS
- Built artifact read-back: Bundle ID `com.takaakimailboxstar.cuescoreapps`, Version `1.2`, Build `82`

## Boundary / STOP

- Build 82 distribution artifact変更0。修正前artifactであり、Version 1.2最終提出候補には使用しない
- Build 83未作成
- Release device Archive／Upload未実施
- TestFlight／App Store Connect未操作
- App Store Version 1.2未作成
- Product Sourceはcommit `f2cd1c769c96c1104caf33944eb35d65372f4a0e`として固定。本GateではDocumentation／Evidenceを別commit化し、External GitHub `main`へ反映する

## Physical RC Refresh

- 正式workflowでsource → native-web → Capacitor iOS publicを再同期。
- source／native-web／iOS public／Physical RC内`navigation-shell-phase1.css` SHA-256は`799eda0651e20a974fec1c852ac5d298ea4e4ee3ccff5dd1c7bc3a20dbf01ec6`で一致。
- Signed Debug device Build: PASS。Team ID `U26DF88PRW`。
- Display Name: `CueScore RC 1.2`。
- Bundle ID: `com.takaakimailboxstar.cuescoreapps.rc12`。
- Version／Build: `1.2 (82)`。
- executable SHA-256: `d98a37e33b25b8e042866cd4dce66bfaf7606f84846cffd6309d4ba5c543221c`。
- built `.storekit`: 0。
- 同じRC Bundle IDへuninstallなしでoverwrite install: PASS。
- install前後のLocalStorage metadataは一致：database 132KB／2026-10-01 16:46、SHM 32KB／2026-10-02 10:05、WAL 0KB／2026-10-02 10:05。container削除／再作成を行っていない。
- 公開版Bundleはread-only identity確認のみ。install／container操作0。
- Product Owner Physical Acceptance: PASS。

## Physical Acceptance

- Physical Evidence: `IMG_3835.PNG`（1170×2532、原本を改変せず収載）。
- Player cardが最終Player row直後で自然に終了: PASS。
- 過剰なcard内白余白: 解消。
- Player row／鉛筆: PASS。
- Bottom Navigation overlap: 0。
- card下部: 通常page余白。
- State: `Implementation Complete / Automated PASS / Visual PASS / Product Owner Physical Accepted / Undistributed`。
- Next candidate: Version `1.2` Build `83`。本Gateでは未作成。

## Safe Two-Player Check

RCのPlayer Searchへ`削除テスト`と入力し、既存の`削除テストA`／`削除テストB`の2件だけへ安全に絞る。2件表示にならない場合はPlayerを削除せず、その時点でSTOPする。

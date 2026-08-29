# CueScore v1.0 — Break Input Immediate Display / Build 17 Candidate

Date: 2026-08-29  
Status: implementation, automated verification, Archive, Validate and TestFlight internal distribution PASS / physical iPhone verification pending

## Basis

- Start SHA: `833cc69ab3bdd4d4c271c871cfa2cccee56f27dc`
- Marketing Version: `1.0`
- Build 16は旧RCとして再利用しない。App Store ConnectのiOSビルド一覧でBuild 17が未使用であることを確認した。
- Build-number source SHA: `51c2ad096fcaac3119e98236a34d0b5d5254c5a6`。
- Marketing Version `1.0`／Build Number `17`。

## Direct Cause

- Match開始はrack通知表示後、`window.setTimeout(..., 700)`の完了までBreak Inputを表示していなかった。
- 次rack／gameは`setTimeout(..., 220)`の後にrack通知を出し、さらに`window.setTimeout(..., 700)`を待っていたため合計`920ms`の人工delayがあった。
- Break InputのDOM更新、保存、計算、state整合処理は遅延原因ではなかった。
- Break権交代、次rack開始、再ブレイクにも`setTimeout(..., 0)`経由が残り、共通の即時表示契約になっていなかった。

## Implementation

- Match開始と次rack／gameはrack通知を維持し、その直後の同じ同期処理でBreak Inputをrenderする。
- Break権交代、`startNextRackWith`、14-1 rebreakの共通呼び出しから`setTimeout(..., 0)`を除去した。
- Undo復元はもともと同期表示であり、その契約を維持した。
- 対象競技は9-Ball、10-Ball、Rotation、JPA 9-Ball。14-1と3 Cushionは従来どおり通常Break Input対象外。
- 既存の`breakResultSavingV1` guardとSave button disabled stateを維持した。

## Verification

- Immediate-display regression: Match開始、次rack／game、Break権交代、rebreakのtimer非依存を検証。
- Break Player／rack stateと対象競技scopeを検証。
- 二重入力防止guardを検証。
- Full automated tests after native sync: `249 pass / 0 fail / 0 skipped`。
- source／native-web／iOS copied assets:一致。
- 390×844 in-app browser: Break Input visible／`aria-hidden="false"`、Break Player 1選択、Save操作可能、viewport／document幅390、横overflowなし。
- iOS Simulator Debug: `BUILD SUCCEEDED`。
- iOS Simulator Release: `BUILD SUCCEEDED`。
- Signed Release Archive: `ARCHIVE SUCCEEDED`。
- App Store validation: `App 1.0 (17) validated`、all validation checks PASS。
- Xcode distribution: `Upload for TestFlight (Internal Testing Only)`で`App 1.0 (17) uploaded`。
- App Store Connect: Apple処理完了。輸出コンプライアンスは正式回答「上記のアルゴリズムのどれでもない」で保存した。Build 17は内部グループ`CI CueScore Internal Testers`（招待数1）に含まれ、状態は`テスト中`。
- RC Build 17 physical iPhone: pending。

## Unchanged

- scoring rules、break判定、foul／safety／dead、turn change、saved-data schema、analytics formula、Backup／Restore、その他UI。
- App Store Review、External TestFlight、一般公開は実施しない。

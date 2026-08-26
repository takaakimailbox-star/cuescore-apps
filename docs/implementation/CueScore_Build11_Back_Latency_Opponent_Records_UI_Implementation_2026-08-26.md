# CueScore Build 11 — Back Latency / Opponent Records UI Implementation

- Date: 2026-08-26
- Version / Build: 1.0 / 11
- Source baseline: `98653d4fc70547a3c0f900f8cb98bfa581b1962a`

## Investigation and change

Back遅延を画面別と入力方法別に監査した。edge Swipe Backは完了後190ms、非tracking fallbackで最大280msの固定待機を持っていた。左上BackではPlayer情報や履歴を戻す際、過去試合scanとDOM再生成が表示切替より先に同期実行される経路があった。

固定待機を0msへ変更し、swipe完了時は表示中Back controlを直ちに実行する。tap／swipe共通で押下中の視覚反応を追加した。Player一覧、Player情報、競技詳細、競技固定履歴、Player編集は保持済みDOMを先に再表示する経路へ変更した。runtime測定は入力受付、handler開始、DOM切替完了、double `requestAnimationFrame`後の視覚利用可能を最大40件だけメモリ保持する。

対戦相手別成績はcompact header、4要素summary、既存sort、compact cardへ更新した。過去試合のW／L badge列を削除し、相手cardからPlayer・相手・競技固定履歴、さらにMatch Detailへ進む導線にした。結果欠損は勝敗分母から除外する。

## Verification

- Automated tests: `226 pass / 0 fail / 0 skipped`
- Build 11 tests: fixed wait除去、段階計測、保持DOM復帰、compact opponent UI、固定履歴Navigation、欠損勝敗を検証
- Native web sync: PASS
- iOS Simulator Debug: `BUILD SUCCEEDED`
- iOS Simulator Release: `BUILD SUCCEEDED`
- 390×844: responsive CSSと自動契約を確認。実iPhoneでの体感・表示確認はpending

## Scope boundary

採点、競技ルール、保存schema、Backup／Restore、分析指標定義、Match Detail本体、通常／サンプル分離は変更していない。App Store Review、外部TestFlight、一般公開は実施しない。

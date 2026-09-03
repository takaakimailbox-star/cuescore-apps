# CueScore Build 58 History Asymmetric Race Label

Date: 2026-09-04

## Request

全体の試合履歴で左右の目標点が異なる長いRace表記により、同じ長い日本語氏名でも一部カードだけ省略される問題を修正し、main反映およびInternal TestFlight配布まで行う。

## Root cause

全体履歴カードは上段のRace列と下段のscore列で同一のCSS Grid列を共有する。従来の「Race to 90 / 61」は右側のauto列を大きく拡張し、その分だけ下段の左右プレーヤー名領域を縮小してellipsisを発生させていた。

## Implementation

- 左右同一目標点は従来どおり「Race to 61」。
- 左右異なる目標点は「Race 90/61」へ短縮。
- 競技アイコン、score、chevron、カード高、氏名1行表示は維持。
- 非対称Race表記の回帰testを追加。

## Verification

- Automated tests: 362 pass / 0 fail / 0 skipped
- native web生成、Capacitor iOS assets同期: 完了
- Release Archive: 成功
- Version: 1.0
- Build: 58
- Source/build commit: 48458c1
- App Store Connect Build ID: 54a64ee1-0310-4d92-a292-70c633048d71
- Xcode upload: App 1.0 (58) uploaded
- 輸出コンプライアンス: 「上記のアルゴリズムのどれでもない」を保存
- TestFlight status: テスト中
- Internal group: CueScore Internal Testers（内部、テスター1名）

実iPhoneでの最終受入はpending。External TestFlight、App Review、審査用追加、一般公開は未実施。

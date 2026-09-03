# CueScore Build 56 試合履歴氏名表示修正／Internal TestFlight配布

## 実装

- 全体の試合履歴カードで、左右プレーヤー名の表示領域を拡張した。
- 390px幅で「小瀬古 賢太郎」「一ノ瀬 沙夜香」を省略せず1行表示できるよう、avatar、名前間隔、score列を再配分した。
- score、Race to、競技アイコン、chevronは維持し、氏名とscoreの重なりを防止した。
- Version `1.0`／Build Number `56`へ更新し、native web assetsを同期した。

## 検証

- 全自動test: `360 pass / 0 fail / 0 skipped`
- 390×844表示確認:
  - 両氏名の`clientWidth`と`scrollWidth`は各71pxで一致（省略なし）
  - card内horizontal overflowなし
  - 氏名領域とscore列の間隔6px、重なりなし
- Release Archive／IPA export成功

## 配布

- source commit: `15baa3f`
- App Store Connect Build ID: `a2074d86-1c43-49fc-9ff0-82433a5e18e2`
- Xcode `TestFlight Internal Only`で`App 1.0 (56) uploaded`を確認。
- 輸出コンプライアンスは「上記のアルゴリズムのどれでもない」を保存し、`テスト準備完了`を確認。
- Internal group `CueScore Internal Testers`（内部、テスター1名）への配布を確認。
- External TestFlight、App Review、審査用追加、一般公開は未実施。
- 実iPhoneでの最終表示受入はpending。

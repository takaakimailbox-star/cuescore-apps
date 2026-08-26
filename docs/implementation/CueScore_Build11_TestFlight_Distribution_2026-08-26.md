# CueScore Apps — TestFlight Build 11 Internal Distribution Record

Date: 2026-08-26 (JST)  
Status: Internal TestFlight distribution PASS / physical-iPhone verification pending

## Final report

1. Baseline — Build 10配信後の`origin/main` commit `98653d4fc70547a3c0f900f8cb98bfa581b1962a`、clean、branch `main`。
2. Adopted scope — Back即時応答、保持済み文脈の先行復帰、runtime段階計測、compactな対戦相手別成績、相手・競技固定履歴、Match Detail導線。
3. Back cause/fix — edge Swipe Back完了後190ms／最大280msの固定待機を0msへ変更。同期的なPlayer／履歴再生成より保持済みDOMの表示を先行した。
4. Opponent records — `対戦相手 / 試合 / 勝敗 / 勝率`、対戦数／勝率sort、compact card、W／L badge履歴なし。相手cardは深いRival Analysisではなく固定履歴を開く。
5. Missing results — 判定不能結果を敗戦または0%へ補完しない。
6. Automated tests — `226 pass / 0 fail / 0 skipped`。
7. Native sync — sourceから`native-web`とXcode copied assetsへ同期し、整合テストPASS。
8. Simulator — Debug／Releaseとも`BUILD SUCCEEDED`。iPhone 17 Simulatorでネイティブ起動とportrait Home表示を確認。
9. Candidate commit — `8236d45a9430c137bc24574822927654896322f9`（`feat: improve back response and opponent records for build 11`）。
10. GitHub — candidate commitを`origin/main`へpushし、Archive前にlocal／remote一致を確認。
11. Build — Marketing Version `1.0`／Build Number `11`。Build `1`〜`11`は再利用しない。
12. Signed Archive — PASS。`/Users/Ludique/Library/Developer/Xcode/Archives/2026-08-26/CueScore Build 11.xcarchive`、arm64、Bundle ID `com.takaakimailboxstar.cuescoreapps`。
13. Validate — `App 1.0 (11) validated`、全validation checks PASS。
14. Upload — Xcode Organizerの`TestFlight Internal Only`で`App 1.0 (11) uploaded`。App Store Connectアップロード日`2026年8月26日 9:14` JST。
15. Export compliance — 既存正式回答「上記のアルゴリズムのどれでもない」を保存。
16. Internal group — 既存`CueScore Internal Testers`へBuild 11が追加され、App Store Connect上の状態`テスト中`を確認。
17. Boundary — 実iPhone確認はpending。App Store Review、外部TestFlight、一般公開、価格／地域変更は実施していない。

## Next verification

実iPhoneのTestFlight Build 11で、左上Back／Swipe Backの体感応答、Player／競技／相手文脈、対戦相手別成績と固定履歴、Match Detail往復、390×844、長い名前、通常／サンプル、既存6競技主要機能を確認する。未確認項目をPASS扱いにしない。

# CueScore Apps — TestFlight Build 12 Internal Distribution Record

Date: 2026-08-26 (JST)
Status: Internal TestFlight distribution PASS / physical-iPhone verification pending

## Final report

1. Baseline — branch `main`、UI／Navigation Revision commit `dbc3e97c`を含むcleanな最新sourceを確認した。
2. Adopted scope — Player／競技固定の全画面推移、自己ベスト整理、対戦相手別成績・相手固定履歴・Player履歴・Player一覧のcompact化とNavigation整理。
3. Automated tests — `232 pass / 0 fail`。
4. Browser verification — Chrome `390×844`で全画面Trends、固定Opponent Records、固定履歴、横overflowなしを正規操作でPASS。
5. Native sync — source、`native-web`、Xcode copied assetsの整合を確認。
6. Simulator — Debug／Releaseとも`BUILD SUCCEEDED`。
7. Candidate commits — UI実装`dbc3e97`（`feat: revise v1 UI navigation and trends`）、Build Number設定`42c0d97df1342fb32e4feb67a79dafc9040c37d8`（`build: set TestFlight build number 12`）。
8. GitHub — Build 12 sourceを`origin/main`へpushし、Archive前にlocal／remote一致を確認。
9. Build — Marketing Version `1.0`／Build Number `12`。Build `1`〜`12`は再利用しない。
10. Signed Archive — PASS。`/Users/Ludique/Library/Developer/Xcode/Archives/2026-08-26/CueScore Build12 2026-08-26, 16.20.xcarchive`、arm64、Bundle ID `com.takaakimailboxstar.cuescoreapps`。
11. Validate — `App 1.0 (12) validated`、全validation checks PASS。
12. Upload — Xcode Organizerの`TestFlight Internal Only`で`App 1.0 (12) uploaded`。App Store Connectアップロード日`2026年8月26日 16:27` JST。
13. Export compliance — 正式回答「上記のアルゴリズムのどれでもない」を保存。メタデータ上の非免除暗号化は「いいえ」。
14. Internal group — 既存`CueScore Internal Testers`（内部テスター1名）へBuild 12が追加され、App Store Connect上の状態`テスト中`を確認。
15. Boundary — 実iPhone確認はpending。App Store Review、外部TestFlight、一般公開、価格／地域変更は実施していない。

## Next verification

実iPhoneのTestFlight Build 12で、Safe Area、左上Back／Swipe Backの体感応答、Player／競技／相手文脈、全画面推移、対戦相手別成績と固定履歴、Player履歴／一覧、Match Detail往復、390×844、長い実データ名、OS picker、通常／サンプル、既存6競技主要機能を確認する。未確認項目をPASS扱いにしない。

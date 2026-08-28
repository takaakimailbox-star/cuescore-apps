# CueScore Apps — TestFlight Build 14 Internal Distribution Record

Date: 2026-08-28 (JST)
Status: Internal TestFlight distribution PASS / physical-iPhone verification pending

## Final report

1. Baseline — `origin/main` commit `0bec2e68fc8d6df4e5664585bb1054686ee6cf0d`を基準に、全ページBack修正と正式CueScore App Iconを含むcleanな最新sourceを確認した。
2. Automated tests — Build Number更新前後とも`237 pass / 0 fail / 0 skipped`。
3. Native sync — native web bundleを再生成してCapacitor iOSへ同期し、`native-web`とXcode copied assetsの内容一致を確認した。Capacitor生成の`cordova.js`／`cordova_plugins.js`だけがcopied側の追加ファイルである。
4. Simulator — Debug／Releaseとも`BUILD SUCCEEDED`。
5. Candidate commit — Marketing Version `1.0`／Build Number `14`を設定したcommit `a9f5eb6bfa860c12067b6938cbce6a3422e332e9`（`build: set TestFlight build number 14`）。
6. GitHub — candidate commitを`origin/main`へpushし、Archive前にlocal／remoteの同一SHAとclean状態を確認した。
7. Signed Archive — PASS。`/private/tmp/CueScore-Build14.xcarchive`、arm64、Bundle ID `com.takaakimailboxstar.cuescoreapps`、Team `TAKAAAKI ISHIZUKA`。
8. Validate — Xcode Organizerで`App 1.0 (14) validated`、全validation checks PASS。
9. Upload — Xcode Organizerの`TestFlight Internal Only`で`App 1.0 (14) uploaded`。Apple processing完了後、App Store ConnectでBuild 14を確認した。
10. Export compliance — 正式回答「上記のアルゴリズムのどれでもない」を保存した。
11. Internal group — 既存`CueScore Internal Testers`（内部テスター1名）へBuild 14が追加され、App Store Connect上の状態`テスト中`を確認した。
12. Reuse boundary — Build Number `1`〜`14`は再利用しない。
13. Distribution boundary — App Store Review、外部TestFlight、一般公開、価格／配信地域変更は実施していない。

## Next verification

実iPhoneのTestFlight Build 14で、正式CueScore App Icon、全ページ左上Back tap、edge Swipe Back、Player／競技／対戦相手／履歴／Match Detail／全画面推移の文脈復帰、Safe Area、390×844、長い実データ名、写真、OS picker、通常／サンプル、既存6競技主要機能を確認する。未確認項目をPASS扱いにしない。

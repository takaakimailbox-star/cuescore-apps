# CueScore v1.0 Step 7 — Native iOS Preparation

Date: 2026-08-15  
Status: Planning Complete / Product Owner Review Required  
Baseline: `0dcd146ec70aed6c5dcce328aeec478a5e4109c9` (`origin/main`)

## 1. Purpose

PWA Final Acceptance後のCueScore Appsを、保存互換・オフライン・iPhone縦画面・既存UIを維持したままApp Store提出可能なiOSアプリへ移行するための方式比較と実装前計画を確定する。本Stepではコード、Xcodeプロジェクト、署名、TestFlight、App Store Connectを変更しない。

## 2. Audited baseline

- `origin/main`、`docs/official/`、最新Official Design Decision Log、`docs/CURRENT_STATE.md`、現行実装を照合した。
- 現行はビルド工程のない静的PWA。中心は`index.html`、`analysis-final-rc.*`、`demo-data.js`、`official-document.*`、manifest、Service Worker、画像、公開法務Markdownである。
- FA-IPHONE-003はiPhone PASS、診断コード削除済み。正式回帰テストは140件成功／失敗0／スキップ0。
- PWA cache versionは`2.0-final-acceptance-rc1`。PWA v1.0は完成状態であり、本計画は正式仕様を変更しない。

## 3. Current PWA architecture

- UIと競技ロジックはHTML/CSS/JavaScriptに集約され、6競技、Player Library、History、Analytics、Settingsを提供する。
- 通常データとサンプルデータは分離される。試合履歴、Player、カテゴリー、シーズン、中断試合、Undo等は主に`localStorage`へ保存する。IndexedDB依存はない。
- Player写真はファイル選択後、Canvasで最大320×320のJPEG（quality 0.78）へ縮小し、data URLとしてPlayerデータに保持する。
- Backupはschema v2 `cuescore-apps-backup` JSONをBlob downloadで書き出し、file inputから同一JSONをRestoreする。
- Service WorkerはApp Shellをcache-firstで保持し、Home、競技画面、History、Support／Legalをオフライン再起動可能にする。
- manifestは`portrait-primary`。JSのorientation lockはbest effort、CSSはsafe-areaを考慮する。

## 4. Native approach comparison

| 方式 | 既存資産再利用 | iOS連携 | 依存／保守 | v1.0リスク | 評価 |
|---|---:|---:|---:|---:|---|
| Capacitor薄型コンテナ | 高 | 標準plugin／限定bridge | Capacitor依存あり | 低〜中 | 推奨 |
| 最小Swift + `WKWebView` | 高 | 全て自作 | 外部依存は少ないが自作量大 | 中〜高 | 次点 |
| Cordova／Tauri等 | 高 | framework依存 | 新規toolchainと検証範囲増 | 中〜高 | 利点不足 |
| Swift／SwiftUI全面再実装 | 低 | 高 | 二重実装・全面回帰 | 極高 | v1.0対象外 |

Capacitorは設定した`webDir`の完成済みWeb assetsをiOSの`WKWebView`へ同梱できる。公式情報：[Capacitor iOS](https://capacitorjs.com/docs/ios)、[Configuration](https://capacitorjs.com/docs/config)。

最小Swift方式でも[`WKWebView.loadFileURL`](https://developer.apple.com/documentation/webkit/wkwebview/1414973-loadfileurl)でbundle内ファイルを読めるが、local origin、navigation、mailto、download、file picker、lifecycle、更新時永続性を個別設計する必要がある。

## 5. Recommended approach

**提案（採用待ち）：Capacitor v8を用いたiPhone専用の薄いnative containerへ、現行Web assetsをbundleする。**

理由は、現行UI・競技ロジック・schemaを最も多く再利用しつつ、Xcode／署名／App Store標準工程と、必要時だけのnative API追加を両立できるため。最初はnative pluginを最小化し、Backup export/importとPlayer写真が実機でWeb標準のまま成立しない場合だけadapterを追加する。依存versionは固定し、generated binaryとprivacy manifestを毎回監査する。

## 6. Proposed native boundary

- Web側に残す：全画面、6競技ロジック、Player／History／Analytics、schema、validation、sample data、画像圧縮、法務本文。
- Native側に置く：app lifecycle、bundle配信、外部URL／mailto、必要時のみdocument/photo picker、署名と配布設定。
- bridgeはplatform adapterの背後へ限定し、競技ロジックから直接呼ばない。
- PWAとnativeは同じ正式Web sourceを共有し、native固有分岐を最小にする。

## 7. Asset bundling plan

- `index.html`と参照されるJS/CSS、画像、icon、font相当資産、`terms.html`／`privacy.html`／`support.html`、公開Markdownを`webDir`へ完全同梱する。
- relative URLと大小文字を検査し、ネットワークなしのcold launchで全主要画面とLegalを確認する。
- GitHub Pages URLはApp Store metadata用の公開URLとして維持し、native runtimeの画面表示には依存させない。
- bundle sourceを生成する最小の再現可能copy工程とasset inventoryをStep 7Bで追加する。現在は生成・コピーしない。

## 8. Service Worker handling

- PWA版のService Workerとoffline挙動は変更しない。
- Native版はassets自体がbundle内にあるためService Workerへ依存しない。native runtimeを確実に識別してregistrationを抑止する小さな分岐をStep 7Bで実装する。
- 既登録worker、update、cache versionがnative起動を阻害しないことを確認する。PWA用コードやcacheを削除しない。

## 9. Persistence and app updates

- native WebViewの`localStorage`を現行schemaの保存先として維持し、v1.0でnative databaseやfile-based schemaへ移行しない。
- 同一Bundle IDの通常アップデートでdata containerが保持される前提だが、Simulator、実機debug、TestFlight updateで必ず検証する。アプリ削除時の保持は保証しない。
- localStorage quotaはPlayer写真を含めstress testする。quota対策としてv1.0直前に保存方式を変更しない。
- bundle version、Capacitor version、iOS versionを跨ぐ起動、background／foreground、強制終了、低容量条件をテストする。

## 10. PWA-to-native migration

- Safari／Home Screen PWAのstorageとnative app sandbox／originは別であり、自動移行を約束しない。
- 正式移行経路は **PWAのBackup JSONを保存 → native appのRestoreで読み込む**。既存schema v2、validation、Player写真data URLをそのまま利用する。
- 移行前に通常モードへ戻してBackupし、nativeの通常領域へRestoreする。サンプルデータはnative側で再生成可能なため移送対象にしない。
- 現行Backup payloadは中断試合snapshotとUndo stackを含まない。移行前に試合を完了または破棄し、進行中試合を移せないことを明示する。
- 移行後にPlayer数、写真、履歴件数、6競技のdetail／analyticsを照合し、元PWAは確認完了まで削除しない。

## 11. Backup and Restore

- JSON schema、filename semantics、validation、通常／サンプル分離を変更しない。
- まず既存のBlob + download linkと`<input type=file>`をnative実機で検証する。
- exportが不安定な場合は[Capacitor Filesystem](https://capacitorjs.com/docs/apis/filesystem)と[Share](https://capacitorjs.com/docs/apis/share)、またはAppleの[`UIDocumentPickerViewController`](https://developer.apple.com/documentation/uikit/uidocumentpickerviewcontroller)を薄いadapter経由で使用する。
- importはfile inputが成立すれば維持し、不成立時だけdocument pickerで取得した同一JSONを既存Restoreへ渡す。
- cancel、同名file、iCloud Drive／On My iPhone、破損JSON、容量超過、restore rollbackを実機確認する。

## 12. Player photo handling

- 最初は既存`accept=image/*` file input、Canvas圧縮、data URL保存を維持する。
- iPhone実機で選択、取消、HEIC等の入力、再起動、Backup／Restore、複数写真時quotaを検証する。
- 不成立時のみ[PhotosUI / PHPicker](https://developer.apple.com/documentation/photosui/phpickerviewcontroller)を限定adapterとして用い、選択結果を既存圧縮pipelineへ渡す。全写真libraryへの広いアクセス権を前提にしない。
- camera撮影、native file storage移行、画像schema変更はv1.0に追加しない。

## 13. Offline behavior

- 機内モードの初回native起動から、Home、6競技setup／進行／保存、Player、History、Analytics、Settings、Legal／Supportを利用可能にする。
- 外部公開URLとmailtoはoffline時に失敗してもapp stateを失わず、明確に復帰できること。
- bundle欠落、runtime fetch、CDN、GitHub Pagesへの暗黙依存をnetwork inspectionで検出する。
- PWAのService Worker offline testとnative bundle offline testは別Gateとして維持する。

## 14. Orientation and safe area

- iPhone only、portrait onlyを提案する。manifest、既存portrait guard、App Store説明と整合させる。
- Xcodeのsupported orientationをportraitへ限定し、rotation lock APIだけに依存しない。
- Capacitor content insetは既存CSSがsafe-areaを処理するため`never`を初期候補とし、Dynamic Island／notch／Home Indicator機種で二重insetがないか確認して確定する。
- keyboard、modal、bottom sheet、Game Result、compact suspended cardを390px相当と小型／大型実機で再確認する。

## 15. Proposed app identity and build settings

以下は提案であり未採用。

- Display Name: `CueScore Apps`
- Product name: `CueScoreApps`
- Marketing Version: `1.0`
- Initial Build: `1`
- Platform: iPhone / portrait
- Minimum iOS: iOS 15（Capacitor v8採用時の候補。Step 7Bでtoolchainと再確認）
- Category: Sports（primary）、Utilities（secondary候補）
- Bundle ID: Product Owner管理domainを基に一意なreverse-DNSを決定する。`com.cuescore.apps`は例示のみで予約・確定しない。
- Signing Team／distribution certificate／provisioning／App Store Connect recordは未設定。

## 16. App icon and launch screen

- 現行repoで確認できるiconは180、192、512px。App Store提出用1024×1024 iconの正式masterは未確認で、Step 7B開始前の不足物である。
- 既存正式CueScore logoをlaunch screenの基礎候補とするが、背景色、余白、light/darkの採用判断はProduct Owner確認待ち。
- 推測で新しいlogoを作らず、正式masterからXcode asset catalogを生成し、alpha、corner、縮小時視認性を検査する。

## 17. Privacy, permissions, and platform metadata

- 現行方針はaccount不要、trackingなし、外部uploadなし、Player写真は任意・端末内保存。App Store privacy answers、Privacy Policy、実装を一致させる。
- 実際に組み込むSDK／plugin／binaryが確定後、[`PrivacyInfo.xcprivacy`](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files)と[required-reason API](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)を監査する。理由codeを推測で追加しない。
- system photo pickerで足りる場合は広いPhotos permissionを要求しない。採用pluginがusage descriptionを必要とする場合だけ、実機能と一致する文言をInfo.plistへ追加する。
- analytics、広告、push、account、cloud sync、location、cameraはv1.0 native化の便乗追加をしない。

## 18. Navigation and external actions

- app内relative navigationはWebView内、privacy／terms／supportはbundle内表示を基本とする。
- App Store metadataの公開URLは現行GitHub Pages URLを維持する。
- `mailto:`と明示的external web URLはnative側でsystem appへ渡し、未知scheme、popup、新規windowはdeny-by-defaultで扱う。
- back／foreground復帰、file picker復帰、memory pressure後もmatch stateを失わないことを検証する。

## 19. App Review risks

- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) 2.1に対し、complete build、動作するURL、review notes、sample確認経路を揃える。
- 同Guideline 4.2のminimum functionalityは主要リスク。単なるWeb site wrapperに見せず、6競技のoffline scoring、local Player／History／Analytics、Backup／Restoreという独立した実用性をreview notesと実機で示す。ただし審査結果は保証しない。
- placeholder、broken link、diagnostic UI、debug flag、未使用permission、外部network依存をsubmission buildから排除する。
- app内説明、App Store description、screenshots、privacy answersの差分を提出前に再監査する。

## 20. App Store submission package delta

既存Step 4／5のdescription、keywords、release notes、review notes、privacy/support/terms URLは再利用可能。native化に伴う追加・更新は以下。

- Bundle ID、SKU、version/build、signing、App Store Connect app record
- 1024px App Store icon、launch screen、device screenshots
- native buildのoffline／file／photo操作を反映したReview Notes
- App Privacy answers、privacy manifest、Info.plist usage descriptionsの最終照合
- archive validation、TestFlight internal test結果、export compliance、content rights、age ratingの確認
- PWA→native migration手順と「進行中試合は移行しない」support案内

## 21. Step 7B implementation and verification gates

1. Product Ownerが方式、Bundle ID、Apple Team、icon／launch方針を承認。
2. branch上でCapacitor／Xcode最小projectを生成し、依存versionを固定。
3. Web assetsをbundleし、native runtimeだけService Worker registrationを抑止。
4. external navigation、mailto、Backup／Restore、Player写真をWeb標準で検証し、不成立箇所だけadapter追加。
5. 保存互換、update保持、PWA Backup→native Restore、quota、offline、orientation、safe-areaをSimulatorと実機で確認。
6. 6競技end-to-end、140件のWeb回帰、native smoke test、archive validationをPASS。
7. privacy manifest／permissions／SDK、App Store package差分を再監査。
8. Product Owner承認後にのみTestFlightへ進む。提出／Releaseは別の明示承認Gateとする。

No-Go条件：data loss、Backup／Restore非互換、offline初回起動不可、Player写真破損、主要画面のsafe-area欠損、未説明permission、PWA回帰、正式asset不足、署名／Bundle ID未確定、Guideline上の未解消Major以上。

## 22. Product Owner decisions and final recommendation

Product Owner確認待ち：

- Capacitor薄型コンテナ方式の採用
- 正式Bundle ID、Apple Developer Team、App Store Connect所有者
- 1024×1024 icon masterとlaunch screenの正式見た目
- iOS 15 minimum、iPhone only、portrait only、Sports category
- PWA→native移行時に中断試合／Undoが移らない案内の承認
- Step 7B開始、および後続TestFlight Gate

結論：**Step 7Bの実装準備は条件付きGO、TestFlight／App Store提出は現時点NO-GO。** 上記判断と正式assetが揃えば、Capacitor薄型コンテナで開始する。全面Swift再実装、schema変更、cloud追加、Service Worker削除は行わない。

Step 7 Native iOS Preparation: Planning Complete / Product Owner Review Required

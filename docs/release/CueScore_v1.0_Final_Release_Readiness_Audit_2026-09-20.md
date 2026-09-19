# CueScore v1.0 Final Release Readiness Audit

- Decision ID: `CUESCORE-V1-FINAL-RELEASE-READINESS-AUDIT-20260920`
- Audit date: 2026-09-20
- Audit mode: AUDIT ONLY
- Repository: `takaakimailbox-star/cuescore-apps`
- GitHub main: `bd3af248dcaf9e895f6321dde26c664bf43c4050`
- Build source: `9828a8499f514d239b717d248a9a99976db23944`
- Candidate: `1.0 (77)`
- App Store Connect Build ID: `a1ebcb96-b6a4-4e88-b5e5-f79e149e15dd`

## Executive Summary

**NOT READY — BLOCKED — FINAL RELEASE READINESS**

Build 77の製品実装、Archive identity、固定dependency、全Node回帰、Free→Pro購入lifecycle、データ保全、主要offline経路はPASSしている。一方、App Store提出面には現行buildと一致しない重大な状態が残る。

1. App Store Version 1.0に紐づくbuildがBuild 77ではなくBuild 24。
2. App Review NotesがBuild 21／課金なしの内容で、Pro必須のBackup review pathと矛盾。
3. App Store screenshotのBackup画像が現行Pro境界を表さず、Pro専用機能を無条件利用可能に見せる。
4. Japan Sandbox実機でFresh `Product.displayPrice`が`$5.99`、Apple購入sheetが`¥980`。Productionでの非再現を証明できず、Sandbox limitationと断定できない。
5. アプリ本体は175地域で利用可能だが、CueScore Pro IAPのavailabilityはJPNのみ。公開範囲と収益化範囲の方針が未確定。

この監査ではsource、Official文書、App Store Connectを変更せず、App Review提出も行っていない。

## Blockers

### B-01 — App Store Version 1.0の選択buildがBuild 24

- Classification: **BLOCKER**
- App Store Version state: `PREPARE_FOR_SUBMISSION`
- 現在のVersion relationship build: Build `24`, ID `37118e35-1893-48f1-9a5c-3b1e8ba2f592`
- 提出候補: Build `77`, ID `a1ebcb96-b6a4-4e88-b5e5-f79e149e15dd`
- Build 77自体は`VALID`、`APP_STORE_ELIGIBLE`、`usesNonExemptEncryption=false`。

現状のままではBuild 77ではなく旧buildを提出する危険がある。別DecisionでVersion 1.0のbuildを77へ変更し、保存後にrelationshipを再読取する必要がある。

### B-02 — App Review Notesが現行IAP buildと矛盾

- Classification: **BLOCKER**
- App Store Connectの実登録notesはOfficial templateと同じ旧内容。
- `No paid subscription or external purchase is required...`の記述が残る。
- `Settings > Backup`を直接reviewする手順だが、Build 77ではBackupはCueScore Pro機能。
- Official templateには`Build 21`、`提出ビルドに課金機能がない`が残る。

Review担当者にIAP、Free／Pro境界、購入・復元経路を正確に伝えられない。AppleのAccurate Metadata要件にも抵触しうるため、提出前の修正が必須。

#### App Review Notes proposal（Official改訂候補）

```text
CueScore Apps is an iPhone billiards match scoring, history, player management, and analytics app. No CueScore account or sign-in is required. Core match entry, local history viewing, and basic statistics work offline; In-App Purchase product loading, purchase, and restore require access to the App Store.

Version 1.0 includes one non-consumable In-App Purchase:
- Product name: CueScore Pro
- Product ID: com.takaakimailboxstar.cuescoreapps.pro
- Type: Non-Consumable

Free users can use all six match workflows and can view the newest 20 saved matches across all disciplines. Older matches remain stored and are not deleted. CueScore Pro unlocks all history, personal bests, detailed analytics and trends, opponent-specific review, Backup, and Restore.

Suggested free review path:
1. Launch CueScore Apps.
2. Open プレーヤー and register two players.
3. Return to ホーム, select a discipline, and complete a match.
4. Confirm the saved result in 履歴 and open Match Detail.

Suggested In-App Purchase review path:
1. Open 設定.
2. Select Proを購入・購入を復元 (Free) or 購入・復元について (already entitled).
3. Wait for the StoreKit-provided price to load, then select Proを購入.
4. After a verified purchase, confirm 設定 shows CueScore Pro ✓ and Backup／Restore are available.
5. Use 購入を復元 to review restore behavior.

The app does not use an external purchase method. Purchase authority and entitlement verification use StoreKit 2. User-created match and player data is stored locally on device in Version 1.0. Automatic cloud sync and CSV import/export are not included.

Supported disciplines: Rotation, 9 Ball, 10 Ball, JPA 9 Ball, Straight Pool (14.1), and Three Cushion (3C).

Privacy Policy: https://takaakimailbox-star.github.io/cuescore-apps/privacy.html
Terms of Use: https://takaakimailbox-star.github.io/cuescore-apps/terms.html
Support: https://takaakimailbox-star.github.io/cuescore-apps/support.html
Support email: cuescore.apps@gmail.com
```

### B-03 — 登録済みBackup screenshotが現行Pro境界を反映しない

- Classification: **BLOCKER**
- 日本語iPhone 6.5-inch screenshot set: 6枚、asset stateは全件`COMPLETE`。
- `07_Backup.jpg`を実表示で確認。
- 旧Backup画面を直接表示し、CueScore Proへの購入導線・Pro専用表示がない。
- Build 77ではBackup／RestoreはPro限定。

App Store screenshotは現在の主要体験とFree／Pro境界を正確に示す必要がある。少なくともBackup画像は差し替え必須。他の5枚もBuild 77 UIとのvisual再確認が必要。

### B-04 — Pro画面`$5.99`とApple sheet`¥980`の不一致

- Classification: **BLOCKER**
- Build 77はPro画面open時に旧productを破棄し、native `Product.products(for:)`をFresh実行。
- UI価格authorityは`Product.displayPrice`。`¥980`／`$5.99`の製品hard-codeなし。
- old price fallbackなしをfocused testで確認。
- Japan Sandbox実機でPro画面は`$5.99`、Apple purchase sheetは`¥980`。
- Apple購入は成功し、verified entitlement、即時Pro解放、再起動後維持までPASS。
- App Store ConnectのJPN manual priceは`980 JPY`。USA automatic priceは`5.99 USD`。

Fresh StoreKit metadataが返した表示と最終購入sheetが異なるため、単なる旧Web cacheではない。TestFlight／Sandbox storefront behaviorの可能性はあるが、Productionで生じない証拠がない。現時点では`APPLE SANDBOX LIMITATION`または`ACCEPTED RISK`と断定せず、release blockerとする。

### B-05 — アプリavailabilityとIAP availabilityの不一致

- Classification: **BLOCKER**
- App: Free、175地域すべてavailable、`availableInNewTerritories=true`。
- IAP: available territoryはJPNのみ、`availableInNewTerritories=false`。
- IAP base territory: JPN、customer price: `¥980`。

JPN以外でもアプリを入手できる一方、CueScore Proは購入できない構成。意図されたJapan-only launchならアプリavailabilityを合わせ、global launchならIAP availabilityを対象地域へ合わせる必要がある。どちらを採用するかはProduct Owner判断事項。

## Required Before Submission

### R-01 — 初回Non-Consumable IAPをVersion 1.0と同一submissionへ追加

- Classification: **REQUIRED BEFORE SUBMISSION**
- CueScore Pro state: `READY_TO_SUBMIT`
- Review submission draft: 0件
- Appleの初回IAP要件上、最初のNon-Consumableは新しいapp versionと同じsubmissionへ含める必要がある。

Build 77をVersion 1.0へ選択し、CueScore Pro IAPを同じdraft submissionへ追加したことを提出直前に再確認する。

### R-02 — App Store Description／Promotional TextのFree／Pro表現

- Classification: **REQUIRED BEFORE SUBMISSION**
- 現在の説明とPromotional TextはBackup／Restoreを一般機能として列挙し、Pro機能であることを示さない。
- Freeの最新20件表示、21件目以降も保持、Pro解放対象の説明がない。

Proposal:

- 主な機能を「Freeで6競技の記録・最新20件の履歴確認」「CueScore Proで全履歴、自己ベスト、詳細分析・推移、対戦相手別、Backup／Restoreを解放」と分ける。
- 「一度の購入で利用できるNon-Consumable」であることを簡潔に記載する。
- `Product.displayPrice`に委ね、説明本文へ固定価格を記載しない。

### R-03 — Privacy PolicyのIAP／StoreKit説明

- Classification: **REQUIRED BEFORE SUBMISSION**
- ローカル保存、写真、広告・trackingなしの説明は実装と整合。
- ただしStoreKit購入・verified entitlementの取り扱いが未記載。

Proposal:

- 購入はAppleのIn-App Purchase／StoreKitで処理されること。
- アプリはAppleが返す検証済み購入資格を確認し、Pro機能の解放に使うこと。
- CueScore専用アカウントや独自決済サーバーは使わないこと。
- 決済情報の取り扱いはAppleの規約・プライバシー方針にも従うこと。

App Store ConnectのApp Privacy answersはAPIで取得できず、Web UIも再認証が必要だったため`NOT VERIFIED`。提出前に実回答と現行実装の一致をProduct Ownerが確認する。

### R-04 — Terms of UseのFree／Pro／IAP条件

- Classification: **REQUIRED BEFORE SUBMISSION**
- 現TermsはBackup／Restoreを一般提供として記載し、CueScore Pro、買い切り、Apple決済、復元、返金を定義しない。

Proposal:

- CueScore ProはApple In-App PurchaseによるNon-Consumableであること。
- 支払・請求・返金はAppleの規定およびApple Accountを通じて処理されること。
- 購入済み資格は「購入を復元」で再確認できること。
- StoreKit／通信／storefront状態により商品取得や購入が一時利用できない場合があること。
- Backup／RestoreをPro提供条件として記載すること。

### R-05 — Supportの購入・復元FAQ

- Classification: **REQUIRED BEFORE SUBMISSION**
- 現SupportはBackup／Restoreを一般機能として記載し、Pro、購入、購入復元、価格取得失敗の案内がない。

Proposal:

- Free／Proの違い。
- CueScore Proの購入場所。
- 購入済みなのにProにならない場合の「購入を復元」。
- 価格取得にはApp Store接続が必要であること。
- Apple sheetが最終購入価格であること。
- 解決しない場合のsupport emailと必要情報。

### R-06 — App Privacy answersの実画面確認

- Classification: **REQUIRED BEFORE SUBMISSION / NOT VERIFIED**
- Privacy Policy URLは登録済みで公開到達可能。
- App Privacy質問への回答値はApp Store Connect APIで取得できず、監査browserは再ログイン状態だった。
- 提出前にApp Privacy画面で、アプリ本体と組込みSDKを含むdata handlingが正確に申告されていることを確認する。

## Passed Gates

### Source / Build identity — PASS

- HEAD／origin/main: `bd3af248dcaf9e895f6321dde26c664bf43c4050`
- Build source: `9828a8499f514d239b717d248a9a99976db23944`
- Build source以降の差分はdocsのみ。製品source差分なし。
- Archive: `com.takaakimailboxstar.cuescoreapps` / `1.0 (77)`。
- Archive内`.storekit`: 0件。
- `monetization-v1.js` SHA-256: `388ce045c2c925c761cc3f7c1055c4a41f76dbecdf5f9069d5cfc2dca9f30dca`（source／iOS copied／Archive一致）。
- `index.html` SHA-256: `531e8e892ded979670ac5dac7d7ceebd79475a5ba93843e8a2c61f483dd1ffa0`（source／iOS copied／Archive一致）。
- iOS copied public directoryとArchive public directory: 差分なし。
- `ion-ios-filesystem 1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`。
- `capacitor-swift-pm 8.0.2` / `13a39179b3df796f3bb2e70c47ccdd92593f34d2`。
- Archive DerivedData checkout revisionも上記と一致。

### Build / TestFlight processing — PASS

- Build 77: `VALID`, `APP_STORE_ELIGIBLE`。
- `usesNonExemptEncryption=false`。
- Internal group `CueScore Internal Testers`: internal、全Build access、Build 77を含む。
- External TestFlight／App Review／Release: 未実施。

### Final regression — PASS

- Audit時にmainで再実行: `432 pass / 0 fail / 0 skipped`。
- 6競技、scoring、manual turn、break、foul、undo、result、history、detail、analyticsを含む既存回帰がPASS。
- Build 77 Fresh price focused testsを含む。

### Product Owner Build 77 device gate — PASS with display exception

- Japan Sandbox tester。
- CueScore Freeから購入。
- Apple sheet `¥980`。
- verified purchase完了後、即時`CueScore Pro ✓`。
- Pro badge消滅、Pro機能へ直接アクセス。
- 完全終了／再起動後もPro維持。
- Free→Pro purchase lifecycle: PASS。
- Pro画面`$5.99`: B-04として分離。

### Core product / Player / Data safety — PASS

- Release scopeの6競技をテストsuiteと過去実機gateで確認。
- Player create／edit／delete／main player／avatar／photo／history／statistics／opponent recordsの既存回帰PASS。
- Freeは全競技共通の最新20件表示。21件目以降も保存し、Free／Pro遷移で削除しない。
- completed match保存失敗時のlive snapshot復元、in-progress snapshot、削除confirmを確認。
- 全データ削除は二段階confirm。

### Backup / Restore — PASS

- Pro gate、JSON backup、native Filesystem write、Share sheet wiringを確認。
- supported schema validation、migration-before-write、invalid／future schema拒否を確認。
- quota初回失敗は変更なし、partial writeはin-memory snapshotからrollback、rollback verificationを確認。
- backup schema／filename compatibilityを確認。
- ユーザーcancelや失敗時に既存dataを破壊しない契約を維持。

### Offline / Settings / Legal navigation — PASS

- native runtimeはremote server URLを持たず、web assetsとlegal pagesをbundle。
- player、match、save、history、statistics、settingsの主要経路はlocal-first。
- IAPだけをApp Store接続依存として分離。
- Startup Promise Safetyにより誤った通信／保存toastを出さない既存契約を維持。
- SettingsはUnknown／Free／Pro、purchase／restore、Backup、Restore、Data Delete、About、Terms、Privacy、Version、copyrightを維持。
- Build 76 scroll lock、spacing、Privacy表示、bottom nav非重複を回帰testで確認。

### Public legal/support URLs — PASS

以下3ページを実browserで開き、読取可能でGitHub Official本文と一致することを確認。

- `https://takaakimailbox-star.github.io/cuescore-apps/privacy.html`
- `https://takaakimailbox-star.github.io/cuescore-apps/terms.html`
- `https://takaakimailbox-star.github.io/cuescore-apps/support.html`

## Product Functional Evidence

- 6競技（Rotation、9 Ball、10 Ball、JPA 9 Ball、Straight Pool 14.1、Three Cushion 3C）のsetup、player選択、start、scoring、manual turn、break、foul、undo、result、save、history、detail、analyticsを既存回帰で確認。
- Player create／edit／delete／main player／avatar／photo／history／statistics／opponent recordsを既存回帰で確認。
- Build 77以降に製品source変更はなく、監査時の全Node回帰は`432 pass / 0 fail / 0 skipped`。
- 致命的な製品機能FAILは検出していない。提出を止めているのは本報告のmetadata／IAP／価格表示blocker。

## Data Safety

- Freeは全競技共通の最新20件を表示し、21件目以降も保存を維持。Free／Pro遷移で既存dataを削除しない。
- Backup／RestoreはPro gateを維持し、schema validation、migration-before-write、invalid／future schema拒否、quota／partial write rollback、user cancel時non-destructiveを既存回帰で確認。
- match保存失敗時のlive snapshot復元、in-progress snapshot、二段階の全データ削除confirmを確認。
- Build 77 ArchiveとGitHub sourceのweb assets／dependencyは一致し、updateによるdata schema変更はない。

## Legal / Privacy

- Privacy／Terms／Supportの公開URLは読取可能でGitHub Official本文と一致。
- tracking／広告／analytics SDKはなく、Info.plistの用途説明はプレーヤー写真用cameraのみ。Archive組込みframeworkのprivacy manifestはtracking=false、collected dataなし。
- 現行公開文書はIAP導入前のため、PrivacyのStoreKit説明、TermsのNon-Consumable／Apple決済／復元／返金条件、SupportのFree／Pro／購入／復元FAQを提出前に改訂する必要がある。
- App Privacy answersはAPIで取得できず、Web UIも再認証が必要だったため`NOT VERIFIED`。Product Ownerの実画面確認が必要。

## App Store Connect Checklist

| Item | Result | Evidence / action |
|---|---|---|
| App Name | PASS | `CueScore Apps` |
| Subtitle | PASS | `ビリヤードの試合・履歴・分析` |
| Description | REQUIRED | Free／Pro境界とBackup／RestoreのPro条件を追記 |
| Keywords | PASS | 6競技と用途に整合 |
| Primary Category | PASS | SPORTS |
| Secondary Category | PASS | UTILITIES |
| Age Rating | PASS | 4+、申告項目はすべてNONE／false |
| Copyright | PASS | `2026 TAKAAAKI ISHIZUKA` |
| Support URL | PASS | 公開到達・Official一致 |
| Privacy Policy URL | PASS | 公開到達・Official一致 |
| Marketing URL | PASS | 空欄（任意） |
| App Privacy answers | NOT VERIFIED | API対象外、browser再認証。PO実画面確認必須 |
| Content Rights | PASS | `DOES_NOT_USE_THIRD_PARTY_CONTENT` |
| Encryption | PASS | Build 77 `false` |
| Version | PASS | 1.0 / PREPARE_FOR_SUBMISSION |
| Selected build | BLOCKER | 現在Build 24。Build 77へ変更必須 |
| Release option | PASS | MANUAL |
| App availability | BLOCKER | Free／175地域。IAPはJPNのみで、公開範囲の整合判断が必要 |
| App price | PASS | Free (`0.0`) |
| App Review Notes | BLOCKER | Build 21／課金なしの旧内容 |
| App Review contact | PASS | 氏名・email・phone登録済み（値は本報告に再掲しない） |
| Screenshots | BLOCKER | 6枚completeだがBackup画像が現行Pro境界と不一致 |
| IAP metadata | PASS | Product ID／Non-Consumable／ja localization／review note／screenshot complete |
| IAP state | REQUIRED | READY_TO_SUBMIT。初回IAPをVersion 1.0と同時提出 |
| IAP availability | BLOCKER | JPNのみ。App 175地域との方針不一致 |
| IAP price | PASS | JPN base / JPY / customerPrice 980 |
| Review submission draft | REQUIRED | 現在0件。提出時にapp version＋初回IAPを同一draftへ |

## Official Documentation Consistency

### PASS

- Product Architecture、Design System、UI Kit、UI Componentsのcore journeyは現行実装と重大矛盾なし。
- Monetization authorityはOfficial `97`／`98`が補完し、Product ID、verified StoreKit 2 entitlement、Free最新20件、21件目以降保持、Pro境界と一致。
- 現行実装は`CueScoreEntitlement`をSSOTとし、UI専用の永続Pro flagを持たない。

### REQUIRED

- `docs/official/app-store-v1.0`は課金導入前の内容。Review Notes、Description、Privacy、Terms、Supportを別Decisionで改訂する必要がある。
- app-store package READMEのRelease ScopeもBackup／RestoreがProであることを明示する必要がある。

### RECOMMENDED

- `docs/Development_Orchestrator_SSOT.md`のprotected current boundaryがBuild 66記述のまま。提出操作前にBuild 77／本監査へ更新し、古いGateへの誤復帰を防ぐ。

## IAP Evidence

- Product ID: `com.takaakimailboxstar.cuescoreapps.pro`（source／native／StoreKit config／ASC一致）。
- Type: `NON_CONSUMABLE`。
- ASC state: `READY_TO_SUBMIT`。
- Localization: ja / `CueScore Pro` / prepare for submission。
- Review note: 全履歴、自己ベスト、詳細分析、推移、対戦相手別、Backup／Restoreを解放する買い切り商品として登録。
- Review screenshot: 1170×2532、asset state `COMPLETE`。
- JPN base price: `¥980`。
- Verified transactionだけがProを解放し、`transaction.finish()`、`currentEntitlements`、`Transaction.updates`、`AppStore.sync()`契約を維持。

## Privacy Manifest / Permissions

### PASS

- Info.plist permission descriptionは`NSCameraUsageDescription`のみ。用途はプレーヤー写真撮影として明記。
- tracking permission、広告SDK、analytics SDK、Firebase／Sentry等なし。
- ArchiveのCapacitor.framework／Cordova.frameworkに`PrivacyInfo.xcprivacy`あり。
- 両manifestはtracking=false、collected dataなし、tracking domainsなし。
- Build 77 uploadは`VALID`。

### NOT VERIFIED / RECOMMENDED

- App target独自の`PrivacyInfo.xcprivacy`はない。
- Filesystem dependency sourceにはstat／file attribute API経路があるが、CueScoreの製品経路はbackup file writeのみ。Archive binaryからRequired Reason APIの完全な静的到達性までは確定できなかった。
- 提出前にXcodeのPrivacy ReportまたはOrganizerのprivacy warningを確認し、Required Reason API warningが0件であることをEvidence化することを推奨。

## Accepted Risk Candidates

現時点で受入推奨できるriskはなし。特に`$5.99`表示は、Apple sheetが正しいことだけを理由にProduction riskとして受け入れない。Production非再現またはAppleからの説明が得られた場合にのみ再分類する。

## Deferred

- CSV import/export。
- Automatic cloud sync。
- Match Sharing。
- External TestFlight。

いずれもv1.0 scope外であり、本監査で追加しない。

## Product Owner Actions

別Decisionで次を順番に確定する。

1. **販売地域方針**: Japan-only appか、175地域app＋対応IAPかを選ぶ。
2. **価格表示Gate**: Japan storefrontでPro画面とApple sheetが一致するproduction-equivalent evidenceを取得。再現時はApple Developer Supportへの照会を検討。
3. **Official文書改訂承認**: Review Notes、Description、Privacy、Terms、Support、app-store README。
4. **Screenshot更新承認**: 少なくともBackupを現行Pro状態へ差し替え、全6枚をBuild 77 UIで再監査。
5. **App Privacy実画面確認**: 現行answerが実装・SDKと一致するか確認。
6. **提出準備操作**: Version 1.0へBuild 77を選択し、初回CueScore Pro IAPを同じreview submissionへ追加。
7. 上記完了後、再度Final Release Readiness Gateを実施する。

## Final Recommendation

**BLOCKED — FINAL RELEASE READINESS**

製品機能とBuild 77 artifactは高い確度で提出候補として保全されているが、提出build、Review Notes、screenshots、販売地域、価格表示の5点が未解消。修正・App Store Connect更新・提出には別Decisionが必要。

Audit中の操作:

- Product source変更: なし
- Official文書変更: なし
- Build 78: 作成なし
- commit: なし
- push: なし
- External TestFlight: なし
- App Review submission: なし
- Release: なし

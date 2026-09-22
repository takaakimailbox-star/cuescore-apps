# CueScore Apps Build 78 App Review Resubmission

Date: 2026-09-22 JST  
Result: `APP REVIEW RESUBMITTED — WAITING_FOR_REVIEW`

## Result

- Version `1.0`の審査BuildをBuild `77`からBuild `78`へ変更した。
- 既存Review submission `7fd64b66-fe2e-424e-9038-a37cbddf8e87`のRejected App Version itemをBuild 78でresolvedとし、Version 1.0とCueScore Proの2項目を同じsubmissionで再提出した。
- API read-backとApp Store Connect画面の双方で、submission、Version 1.0、CueScore Proが`WAITING_FOR_REVIEW`／「審査待ち」であることを確認した。
- submitted timestampは`2026-09-22T13:10:04.044Z`（`2026-09-22 22:10:04.044 JST`）。
- Release、自動Release、Build 79、source変更は実施していない。

## Apple reply

App Store ConnectのResolution Centerで、2026-09-22 22:08 JSTに次を送信し、メッセージ一覧へ表示されたことを確認した。

> Hello App Review Team,
>
> Thank you for the detailed crash reports.
>
> We identified the cause of the launch crash in version 1.0 (Build 77). The app had not adopted the UIScene lifecycle required when running the iOS 27 SDK build on iOS/iPadOS 27.
>
> We have updated the app to use the UIScene lifecycle and submitted a new build, Build 78.
>
> We verified the fix with repeated cold launches on iOS 27 iPhone and iPad simulator environments, as well as on a physical iPhone through TestFlight. The app now launches normally.
>
> No user data format, scoring rules, or in-app purchase product identifiers were changed as part of this fix.
>
> Thank you for reviewing the updated build.
>
> Best regards,  
> CueScore Apps

## Submitted items

| Item | Resource ID | Submitted state |
| --- | --- | --- |
| iOS App Version `1.0 (78)` | `deb842d0-c7f5-4bcf-9248-443bcb090cdf` | `WAITING_FOR_REVIEW` |
| CueScore Pro IAP version 1 | `77232928-f772-40ca-9982-9ec8cbef32ff` | `WAITING_FOR_REVIEW` |

Build 78 ID: `eb2f6582-c42b-444d-9755-218e5e03ff49`  
Build state: `VALID`  
Build 78 source commit: `6e0a569e32e473f6b5bfa14c74eeca1482820467`

## Unchanged controls

- App availability: JPNのみ。
- App `availableInNewTerritories=false`。
- CueScore Pro availability: JPNのみ。
- CueScore Pro `availableInNewTerritories=false`。
- CueScore Pro Product ID: `com.takaakimailboxstar.cuescoreapps.pro`。
- CueScore Pro type: `NON_CONSUMABLE`。
- Japan customer price: `JPY 980`。
- Version 1.0 release type: `MANUAL`。
- metadata、screenshots、Privacy、source、IAP価格、availabilityは変更していない。

## Read-back evidence

- API at `2026-09-22T13:11:50.336Z`: submission `WAITING_FOR_REVIEW`、Version `WAITING_FOR_REVIEW`、CueScore Pro `WAITING_FOR_REVIEW`、Build 78 `VALID`、release type `MANUAL`。
- App Store Connect UI: submission「審査待ち」、`1.0 (78)`「審査待ち」、CueScore Pro「審査待ち」、提出日`2026年9月22日 22:10`、Apple replyをメッセージ2件目として表示。
- Machine-readable evidence: `docs/release/evidence/CueScore_Build78_App_Review_Resubmission_2026-09-22.json`。

## Operational note

再提出方法のAPI検証中に空のreview draft `ccca99c0-4ab6-4518-8133-58c51abe378e`が作成された。これは`READY_FOR_REVIEW`、submittedDateなし、item 0件で、今回提出したreviewには含まれない。削除、Release、提出操作は行っていない。

## Stop

App Review再提出完了後、審査結果待ちでSTOP。Version 1.0は一般公開していない。

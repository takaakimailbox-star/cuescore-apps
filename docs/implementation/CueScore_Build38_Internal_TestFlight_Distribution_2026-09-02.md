# CueScore Build 38 Internal TestFlight配布記録

**Date:** 2026-09-02  
**Version:** 1.0  
**Build:** 38  
**配布範囲:** Internal TestFlightのみ

## 基準

- 実行開始時 latest `main`: `061cde8ee35cb8c01f4364aa135168016416b62c`
- Build番号採番・Archive source commit: `b5d3c74`
- App Store ConnectでBuild 37まで使用済みであることを確認し、次の未使用番号38を採番した。

## 配布前確認

- automated tests: `337 pass / 0 fail / 0 skipped`
- Simulator Debug: `BUILD SUCCEEDED`
- Simulator Release: `BUILD SUCCEEDED`
- 390×844 horizontal overflow: `0`
- console errors: `0`
- Match Detail遷移／左上Back contract: 回帰なし
- Bottom Navigation: 回帰なし
- 9-Ball selector／全試合filter: 回帰なし
- Build 35 exact-origin復元: 維持

## Archive / Upload

- Signed Archive: `/private/tmp/CueScore-Build38.xcarchive`
- Archive result: `ARCHIVE SUCCEEDED`
- Export／Upload: Xcode App Store Connect方式で成功
- Build upload ID: `f5a51a91-8843-4f45-8819-0e7998f4d593`
- Apple processing: `VALID`
- `usesNonExemptEncryption=false`を保存

## Internal TestFlight

- Internal group: `CueScore Internal Testers`
- Build 38が同groupの配布対象に含まれることをApp Store Connect APIで確認した。
- Product OwnerはiPhoneのTestFlightアプリからVersion 1.0 Build 38へ更新・インストール可能。
- 実iPhoneでの最終受入は未実施のためPending。Edge Swipe Back、Dynamic Typeを含む実機項目もPendingのままとする。

## 実施していない操作

- External TestFlight／外部テスター招待／Public Link: 未実施
- Beta App Review／App Review／審査用に追加: 未実施
- Version 1.0審査用buildの変更: 未実施
- 一般公開／Release to App Store: 未実施


# CueScore Current UI Screenshot Index — 2026-08-26

## 1. 概要

- 対象: CueScore v1.0 / Build 11 / `main`
- 主監査条件: Browser `390 × 844`、Light、DPR 1
- 撮影済み: 22枚
- 状態: **部分完了**。分析の主要導線は撮影済み。Gameplay等は未撮影のためFull Audit完了とは判定しない

## 2. 最初に確認する5画面

|順|画面|用途|画像|
|---:|---|---|---|
|1|Home|アプリ入口と主導線|[001 Home](assets/ui-audit/2026-08-26-current-app/v1/001_Home_Sample_Data.png)|
|2|Player情報|Player起点の全体像|[003 Player Info](assets/ui-audit/2026-08-26-current-app/v1/003_Player_Info_Main.png)|
|3|9-Ball競技詳細|主要指標・自己ベスト・履歴入口|[010 9-Ball](assets/ui-audit/2026-08-26-current-app/v1/010_9Ball_Detail.png)|
|4|対戦相手別成績|Build 11の主要変更|[070 Opponents](assets/ui-audit/2026-08-26-current-app/v1/070_Opponent_Records_Match_Count_Sort.png)|
|5|Match Detail|履歴からの到達先|[074 Match Detail](assets/ui-audit/2026-08-26-current-app/v1/074_Match_Detail.png)|

## 3. 通常画面

|番号|分類|画面 / 状態|画像|
|---:|---|---|---|
|001|Sample|Home|[画像](assets/ui-audit/2026-08-26-current-app/v1/001_Home_Sample_Data.png)|
|002|Sample|Player一覧|[画像](assets/ui-audit/2026-08-26-current-app/v1/002_Player_List.png)|
|003|Sample|メインPlayer情報|[画像](assets/ui-audit/2026-08-26-current-app/v1/003_Player_Info_Main.png)|
|010|Sample|9-Ball競技詳細|[画像](assets/ui-audit/2026-08-26-current-app/v1/010_9Ball_Detail.png)|
|020|Sample|10-Ball競技詳細|[画像](assets/ui-audit/2026-08-26-current-app/v1/020_10Ball_Detail.png)|
|030|Sample|Rotation競技詳細|[画像](assets/ui-audit/2026-08-26-current-app/v1/030_Rotation_Detail.png)|
|040|Sample|14-1競技詳細|[画像](assets/ui-audit/2026-08-26-current-app/v1/040_14-1_Detail.png)|
|050|Sample|JPA 9-Ball競技詳細|[画像](assets/ui-audit/2026-08-26-current-app/v1/050_JPA9_Detail.png)|
|060|Sample|3 Cushion競技詳細|[画像](assets/ui-audit/2026-08-26-current-app/v1/060_3Cushion_Detail.png)|
|070|Sample|対戦相手別成績・対戦数順|[画像](assets/ui-audit/2026-08-26-current-app/v1/070_Opponent_Records_Match_Count_Sort.png)|
|071|Sample|対戦相手別成績・勝率順|[画像](assets/ui-audit/2026-08-26-current-app/v1/071_Opponent_Records_Win_Rate_Sort.png)|
|072|Sample|相手・競技固定の試合履歴|[画像](assets/ui-audit/2026-08-26-current-app/v1/072_Opponent_Specific_Match_History.png)|
|073|Sample|Player・競技固定の全試合|[画像](assets/ui-audit/2026-08-26-current-app/v1/073_Player_Match_History.png)|
|074|Sample|Match Detail|[画像](assets/ui-audit/2026-08-26-current-app/v1/074_Match_Detail.png)|
|090|Sample|設定|[画像](assets/ui-audit/2026-08-26-current-app/v1/090_Settings_Sample_Data.png)|

## 4. Popup / Modal

|番号|画面|確認点|画像|
|---:|---|---|---|
|011|勝率の推移|Y/X軸・点・閉じる|[画像](assets/ui-audit/2026-08-26-current-app/modals/011_9Ball_Trend_WinRate.png)|
|012|シュート率の推移|同上|[画像](assets/ui-audit/2026-08-26-current-app/modals/012_9Ball_Trend_ShootRate.png)|
|013|ブレイクイン率の推移|同上|[画像](assets/ui-audit/2026-08-26-current-app/modals/013_9Ball_Trend_BreakInRate.png)|
|014|マス割り率の推移|同上|[画像](assets/ui-audit/2026-08-26-current-app/modals/014_9Ball_Trend_MasuwariRate.png)|
|015|ファール率の推移|小数2桁・軸|[画像](assets/ui-audit/2026-08-26-current-app/modals/015_9Ball_Trend_FoulRate.png)|
|091|About CueScore|Version / Build表示|[画像](assets/ui-audit/2026-08-26-current-app/modals/091_About_CueScore.png)|
|092|Backup|通常データ領域|[画像](assets/ui-audit/2026-08-26-current-app/modals/092_Backup.png)|

## 5. 未撮影（完了判定を止める項目）

- Player編集、登録、avatar全category、写真選択、削除確認
- 6競技のSetupとGameplay、break/foul/safety/history、終了・結果・resume
- Self Best単独の空状態、履歴の空／1件状態、非メインPlayer
- Restore、import/export chooser、成功／失敗、permission UI
- 3 Cushionの`+1 / 交代 / 戻る`とinning table
- 実iPhoneでのSafe Area、Swipe Back、写真／ファイル／camera permission

詳細は[Screen Inventory](CueScore_Current_UI_Screen_Inventory_2026-08-26.md)を参照。

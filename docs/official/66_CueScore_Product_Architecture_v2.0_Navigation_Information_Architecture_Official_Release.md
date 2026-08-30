# CueScore Product Architecture v2.0 — Navigation & Information Architecture

- Date: 2026-08-30
- Status: Official Release
- Approval: Product Owner adopted
- Baseline: `6ddfa0660f08cee131c8fb24afaa599d183e6843`

## Core Principle

CueScoreの通常閲覧は、少数のtop-level領域を明確に分け、通常操作を原則3階層以内へ収める。選択だけを目的とする中間画面を増やさず、必要な詳細だけを段階的に開示する。

既存Product Architecture v1.0の`1画面1目的`、Progressive Disclosure、Card First / Template First、Game One-Screen、試合中のGame最優先、予測可能なBack、通常4階層以上を作らない原則は維持する。

## Normal Mode Top-level

通常モードは次の4領域とする。

`ホーム｜プレーヤー｜履歴｜設定`

- ホーム：新しい試合、進行中試合の再開、最近の試合
- プレーヤー：プレーヤー閲覧とPlayer Hub
- 履歴：全プレーヤー横断の試合履歴
- 設定：プレーヤー管理、データ管理、アプリ設定

将来、個人練習を正式採用・実装する段階でのみ`練習`を第5領域として追加する。v1.0では表示しない。

## Player Hub

Player Hubはプレーヤー閲覧の中心とし、Player avatar／name、競技Selector、`成績｜試合｜分析`を共通構造とする。

- 成績：試合数、勝敗、勝率、競技別自己ベスト
- 試合：最近の試合、すべての試合、対戦相手別
- 分析：今の状態、主要指標、推移、強み、次の課題、対戦相手分析

自己ベストは成績に置く。既存aggregate／analytics SSOTは維持する。

## Shared Match Detail

Home、Player Hub、自己ベスト、履歴、対戦相手別、分析関連導線は同じMatch Detail実装を利用する。Backは開いた元の文脈へ戻る。

## Navigation Rules

1. `＜`／edge swipeは現在の文脈で1つ戻る。
2. bottom tabはtop-level領域を移動する。
3. Match Mode中はbottom tabを表示しない。

CueScore logoはbrandingのみとし、Home buttonにしない。別tabから戻った場合は各top-levelの前回閲覧状態をruntimeで復元し、選択中tabの再tapはその領域のrootへ戻す。新しいsaved-data schemaは追加しない。

## Home

active matchがある場合は再開card、新しい試合、最近の試合3件の順とする。active matchがない場合は新しい試合、最近の試合3件の順とする。既存の進行中試合再開機能を維持する。

## Match Mode

試合開始時点からGame Result flowを終えて通常閲覧へ戻るまでMatch Modeとする。Match Mode中はbottom tabを非表示にし、Home／Player／History／Settingsへ直接移動させない。

## Settings Boundary

`プレーヤー`は閲覧、`設定 → プレーヤー管理`は編集・削除・main設定を担当する。

## Migration Policy

1. Navigation Shell
2. Player Hub Shell
3. Player Flow Consolidation
4. Analysis Consolidation
5. Settings Cleanup
6. Final Journey／State／iPhone Review

各Phaseで既存test 0 failを維持し、実iPhoneで確認する価値のある節目をTestFlight内部配信する。

## Boundaries

scoring、勝敗判定、Player ID／Match ID、saved-data schema、Race to保存、Backup／Restore semantics、analytics計算式、aggregate SSOT、競技ルール、Break Input、14-1 rerackは変更しない。

## Replacement Boundary

Product Architecture v1.0の通常時Home中心の階層を、`ホーム／プレーヤー／履歴／設定`の並列top-level構造へ更新する。Game One-Screen、Progressive Disclosure、3階層以内、予測可能なBack、データ安全性、scoring分離の原則は維持する。

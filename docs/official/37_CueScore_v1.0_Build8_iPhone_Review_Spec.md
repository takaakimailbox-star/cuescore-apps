# CueScore v1.0 Build 8候補 実iPhoneレビュー修正 Specification

- Status: Official Specification
- Published: 2026-08-23 (JST)
- Decision: Official 036

## Player journey

1. 競技詳細はcompact Player summary、主要指標、初期closedの推移、自己ベスト、Rival入口、当該競技の全試合入口で構成し、「最近の試合」は生成しない。
2. Navigation Titleは正式競技アイコンと競技別Titleを中央表示する。
3. 競技詳細から開く全試合はPlayer IDと競技IDをruntime contextで固定し、競技selectorを表示しない。保存schemaへcontextを追加しない。
4. 試合カードは右端上段「詳細」、下段「分析」とし、独立した大きな分析ボタンを置かない。詳細と分析を1ページへ統合しない。
5. 固定履歴のBackは同じ競技詳細へ、競技詳細のBackはPlayer情報へ戻る。button Backとedge Swipe Backは同じ表示中Back controlを使用する。
6. Player削除は既存Player編集にだけ表示し、確認、destructive backup、削除後の履歴保持を変更しない。
7. file inputで画像が確定したらavatar chooserを閉じ、登録／編集formのpreviewへ即時反映する。Photo Library、Choose File、Take Photo、キャンセルは同じinput lifecycleを使用する。

## Motion

edge Swipe Backは左端からの単指横gestureに限定し、移動量を表示中surfaceへ反映する。成立時は右方向へ完了して表示中Back controlを実行し、不成立またはcancel時は元位置へ戻す。Game、Result、blocking modal等の既存禁止範囲を維持する。

## 3 Cushion

操作領域は3等分の1段とする。`null`／未生成値は空白、確定0は`-`、正の確定得点は数値で表示する。加点、交代、イニング進行、current marker、Undo historyは変更しない。

## Break return

ブレイク結果保存後、overlay close完了時に現在rackのdividerまたは同rack最新行を対象に、game history containerだけを必要量scrollする。Undo、Result復帰、他overlay closeでは実行しない。

## iOS camera

Info.plistは日本語の`NSCameraUsageDescription`を含む。カメラ専用pluginや新保存fieldは追加しない。実iPhoneで初回permission、撮影、決定、キャンセル、編集previewを再確認するまでTake PhotoをPASS扱いにしない。

## Prohibitions

Player／Match／Backup／event schema、競技ルール、平均ファール計算、分析機能の採否、Build Number 8、Archive、Validate、TestFlight、App Review、一般公開を本Specだけで変更・実行しない。


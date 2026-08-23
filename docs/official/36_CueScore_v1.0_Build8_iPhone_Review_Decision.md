# CueScore v1.0 Build 8候補 実iPhoneレビュー修正 Decision

- Status: Official Decision
- Adopted: 2026-08-23 (JST)
- Owner: Product Owner

## Decision

Build 7実iPhoneレビューを受け、競技詳細から重複する「最近の試合」を削除する。競技詳細から開く全試合はPlayerと競技を固定し、競技selectorを表示しない。各試合カードは独立したMatch Detail／Player目線Single Match Analysisの2導線を維持したまま、右端の「詳細」「分析」へcompact化する。

Navigation Backは履歴を1階層ずつ戻し、競技固定履歴からは同じ競技詳細、競技詳細からはPlayer情報へ戻る。edge Swipe Backも同じBack targetを使用し、指追従、完了、キャンセルのmotionを持つ。

Player情報から削除操作を除き、既存確認と履歴保持契約を維持したままPlayer編集へ移す。写真選択完了後はavatar chooserへ戻さず、選択結果を反映した新規登録／編集画面へ直接戻る。競技詳細Navigation Titleには既存正式競技アイコンを表示する。

3 Cushionの操作は`+1`／`交代`／`戻る`の1段3列とする。イニング表は、確定した0点手番だけ`-`、得点ありの確定手番は数値、未到達または未確定セルは空白とする。Undoと競技ルールは変更しない。

ブレイク入力完了後は、現行close lifecycleの後に現在ラックのdividerまたは最新行が見える位置へ履歴を移動する。

## Native camera safety

iOS Take Photoはカメラ利用目的文を必須とする。`NSCameraUsageDescription`をアプリInfo.plistへ含め、既存file input、Photo Library、Choose File、画像圧縮、保存schemaは変更しない。

## Supersession and compatibility

Official 035の「最近の試合を表示」と、Player情報に削除操作を置く記載を本Decisionが後続確定する。Official 034/035のderived metrics、eligible判定、欠損、安全、schema互換、Rival Analysis、Match Detail、Single Match Analysis契約は維持する。

平均ファールの名称／計算変更と分析導線全体の再設計は本Decisionに含めない。Build 8 TestFlight upload、App Review、一般公開は別承認とする。


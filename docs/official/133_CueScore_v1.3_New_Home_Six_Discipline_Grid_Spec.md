# 133 CueScore v1.3 New Home — Six-Discipline Grid Specification

- Status: Official Release
- Published: 2026-10-24
- Decision: Official 132（Decision 045）／Official Design Decision Log v2.21
- Applies to: Version 1.3系（iPhone縦画面）

## 1 Home

- 構成（上から）: CueScoreロゴ、中断試合の再開カード（中断試合が存在する場合のみ）、6種目タイル、下部ナビ（ホーム／プレーヤー／履歴／設定）。「新しい試合」ボタン、見出し、補足文、最近の試合は置かない。
- 6種目タイルは**2列×3段**。DOM順・フォーカス順・読み上げ順・視覚順は一致させる。

| 順 | 位置 | 種目ID（`data-discipline`） | ラベル | アイコン |
|---|---|---|---|---|
| 1 | 上段・左 | `9ball` | 9-Ball | `assets/icons/games/game-9ball.svg` |
| 2 | 上段・右 | `10ball` | 10-Ball | `assets/icons/games/game-10ball.svg` |
| 3 | 中段・左 | `jpa9` | JPA 9-Ball | `assets/icons/games/game-jpa-9ball.svg` |
| 4 | 中段・右 | `rotation` | Rotation | `assets/icons/games/game-rotation.svg` |
| 5 | 下段・左 | `straightPool` | 14-1 | `assets/icons/games/game-14-1.svg` |
| 6 | 下段・右 | `threeCushion` | 3 Cushion | `assets/icons/games/game-3cushion.svg` |

- 各タイルは採用済みの種目アイコンとラベルを表示する。タイルの高さは**72pt以上**（44×44pt以上のhit areaを満たす）。左右余白は14pt、タイル間隔は10ptを基準とする。ラベルは1行（長い場合は省略）。
- iPhone幅320pt／390ptの両方で、2列が収まり、横スクロールが発生しない。再開カードと併用した場合は縦スクロールで全タイルへ到達できる。
- アクセシブル名は既存のi18nキー（`home.discipline.*.aria`）を使い、選択状態は既存どおり（`aria-selected`／`is-selected`）とする。

## 2 種目タイルの動作

- タイルのタップで、その種目が選択され（既存の選択処理）、既存の試合設定へ進む。直前の種目選択の保存（`DISCIPLINE_KEY`）は従来どおり。
- 中断試合のスナップショットが存在する場合、タイルのタップは既存の確認（再開／新しい試合を始める／キャンセル）を表示する。「新しい試合を始める」は従来どおり中断試合を破棄して選択した種目の設定へ進む。再開カード（`中断中の試合を再開`）は従来どおり動作する。

## 3 試合設定画面

- 維持: 選択済み種目の大きなアイコンと種目名、プレーヤー（先攻／後攻）の選択、Race to／Skill Level／Target pointsなど種目別設定、ゲームルール表示の現行状態、試合開始（`startGameBtn`）の動作と条件。
- 削除: 上部の横並び6種目メニュー（表示しない）。
- 追加しない: 左上の別の戻るボタン。種目の切替はHomeへ戻って別のタイルを選ぶ。

## 4 Homeへの復帰

- 試合設定画面で下部の「ホーム」タブを押すと、未開始の設定画面を閉じて新しいHomeを表示する。設定済みの値は試合開始まで保存データへ書き込まれず、この操作で試合データ・スナップショット・進行中の試合を破棄または変更しない。
- 試合記録中（Match Mode）は下部ナビが非表示で、ホーム要求は無視する（既存）。

## 5 変更しないもの

保存schema・保存キー、Player Identity、QR、Backup／Restore、Free／Pro、IAP、試合の計算・記録、分析、履歴、プレーヤー、設定画面、Paywall、既存の翻訳catalog（キー・文言）、Native設定（Bundle ID／Team／署名／Capabilities／StoreKit）。

## 6 受入条件

| ID | 条件 |
|---|---|
| AC-H1 | Homeの種目タイルは6個、2列×3段で、順序が上表と完全に一致する（DOM順を含む） |
| AC-H2 | 各タイルは採用済みアイコン（`assets/icons/games/`）とラベルを表示し、独自アイコンを使わない |
| AC-H3 | 各タイルのタップで、その種目の試合設定が表示され、選択済み種目のアイコンと名前が一致する |
| AC-H4 | 試合設定画面に上部の横並び6種目メニューが表示されない（DOM上も表示されない） |
| AC-H5 | 試合設定画面で、プレーヤー選択・先攻／後攻・Race to／Skill Level・試合開始が従来どおり動作し、試合開始と記録が従来どおり行える |
| AC-H6 | 下部ホームタブで試合設定画面から新しいHomeへ戻る。保存データ・スナップショットが不変で、進行中の試合を破棄しない |
| AC-H7 | 中断試合が存在する場合、再開カードが従来どおり表示・動作し、種目タイルのタップで既存の確認（再開／新規／キャンセル）が表示される |
| AC-H8 | 390pt幅と320pt幅で、2列が収まり、横スクロールがなく、全タイルへ到達できる |
| AC-H9 | すべてのタイルのhit areaが44×44pt以上 |
| AC-H10 | ja／en／zh-Hansで表示と操作が同一。新しい翻訳文言を追加しない |
| AC-H11 | Free／Proの境界、保存schema、QR、Backup、IAPの既存テストが回帰しない |
| AC-H12 | 既存の自動テストを削除・弱体化しない（置換する検証は旧→新の対応表で記録する） |

## 7 本仕様が決めていないこと

- Homeの見出し・補足文（追加する場合は別Decision）。
- Homeのタイルの色・影などの細部（採用済み種目アイコンと既存のデザイントークンに従う）。
- ゲームルールカードの表示（本仕様は現行状態を維持）。

# CueScore v1.0 — Opponent VS Row Removal / Full Screenshot Review Implementation

Date: 2026-08-28
Status: Implementation and automated/browser verification PASS / Product Owner screenshot review pending

## Implementation

- `ui-revision-v12.js`の相手固定履歴後処理で、`data-pd8-opponent`が有効な場合だけ`.journey-history-opponent-v11`を行全体で削除した。
- 通常Player試合履歴、aggregate、月別履歴、match cards、Match Detail、Back／Swipe Backには変更していない。
- scoring rules、saved-data schema、Backup／Restore、analytics formulaは変更していない。

## Verification

- 全自動テスト：`238 pass / 0 fail / 0 skipped`。
- Chrome相当390×844：相手固定履歴のVS行`0`、横overflowなし。全画面推移、対戦相手別成績、履歴もPASS。
- source／native-web／iOS copied assets一致。Simulator Debug／Releaseはいずれも`BUILD SUCCEEDED`。

## Screenshot review set

- Folder: `docs/assets/review-ui/2026-08-28/`
- 41 PNGを保存。うち`001`〜`087`の30枚は390×844を寸法検査済み。`088`〜`107`の11枚は最終passでブラウザviewportがresetされ731×720となったため、補足レビュー画像として保持し、390×844の証跡とは扱わない。
- Home、Player管理、全6競技詳細／推移、対戦相手別成績、VS行削除後の相手固定履歴、Player履歴、Match Detail、Match Setup／picker、全6競技入力、9-Ball Result、Settings、Backup／Restore、About、Terms、Privacy、Supportを撮影した。
- `080_9Ball_Match_Setup.png`は中断試合選択modal、`081_9Ball_Match_Setup.png`が実際のMatch Setupである。
- 未撮影：各競技別Result（共通Resultの9-Ball代表のみ）、各長画面の全scroll位置、empty／no-data全組合せ、OS提供の写真／ファイルpicker、データ削除確定dialog、Sample Data実行確認dialog、全体試合履歴一覧、および`088`〜`107`の正寸390×844再撮影。理由は、同一レビューセットでの状態破壊回避、OS UI境界、ブラウザ確認dialog待機、viewport reset、および共通renderer代表撮影のため。撮影漏れはこの一覧のとおり残るため、完全網羅とは扱わない。

## Documentation

- Official 052／053がOfficial 046／047／048／049の競合箇所を置き換える。
- 画像はreview用であり、`adopted-ui`へは追加していない。

# CueScore v1.x — Navigation & Information Architecture Spec

- Date: 2026-08-30
- Status: Official Spec
- Decision: Official 067
- Architecture: Official 066

## Bottom Navigation

v1.x normal modeは`ホーム｜プレーヤー｜履歴｜設定`の4tab。Player root titleは`プレーヤー`とし、`プレーヤー一覧`は使用しない。Match Mode中は非表示とする。

選択中tab再tapはHome top／Player root／History root／Settings rootへ戻る。別tabから戻った場合は、selected Player、selected discipline、Player Hub tab、History discipline、技術的に安定するscroll位置をruntimeで復元する。新しいsaved-data schemaは追加しない。

## Player Root and Hub

Player card tapはPlayer Hubを開く。Player tabは閲覧、Settings／Player Managementは編集・削除・primary設定を担当する。

Player Hubはavatar、Player名、primary表示、discipline selector、`成績｜試合｜分析`を共有する。初回は`9-Ball／成績`、2回目以降はPlayerごとの最後の選択を復元する。

## Results, Matches, and Analysis

- 成績：試合数、勝敗、勝率、競技別自己ベスト
- 試合：最近の試合、すべての試合、対戦相手別
- 分析：今の状態、recent summary、主要指標、推移、強み、次の課題、対戦相手分析

自己ベストにsource matchがある場合はshared Match Detailを開ける。分析は既存SSOTを再利用する。

## Opponent Detail

相手選択後は相手情報、試合数、勝敗、勝率、相手固定試合一覧を同一画面へ表示する。相手選択と試合一覧の間に追加のselection-only画面を置かない。

## Shared Match Detail

全入口で同一実装を利用し、Backは正確なopening contextへ戻す。Detail表示中に別bottom tabが選択された場合はDetailを閉じ、選択top-levelへ移動し、別tab上にDetailを残さない。

## Home and Match Mode

active matchありは再開card、新しい試合、recent 3件。active matchなしは新しい試合、recent 3件。既存active-match resumeを維持し、完全終了後の復元は明示的に回帰検証する。

Start Match後はbottom navigationを非表示にする。active scoring中はtop-level tabを提供せず、Game Set後の既存result flowを経てnormal navigationを復帰する。

## Practice

v1.0ではrenderしない。別途Decision／Specを採用した場合のみ`ホーム｜プレーヤー｜履歴｜練習｜設定`へ拡張する。

## Migration Phases

1. Navigation Shell
2. Player Hub Shell
3. Player Flow Consolidation
4. Analysis Consolidation
5. Settings Cleanup
6. Final Verification

Phase 1は4 bottom tabs、top-level roots、runtime state container、retap、cross-tab restore、Match Detail cross-tab close、Match Mode hide/show、Safe Area、active-match resume維持だけを実装する。Player Hub全面実装、standalone discipline selection削除、opponent統合、Personal Best移動、analysis統合は後続Phaseとする。

## Acceptance

- v1.0 normal top-levelは正確に4tab、`練習`は0件。
- Player root titleは`プレーヤー`。
- tab再tapはroot、別tabからの復帰は前回状態。
- Match Detailはshared、Backはorigin、cross-tabはDetailを閉じる。
- active Match Modeのbottom navは0件、result flow後は復帰。
- scoring／data calculations／saved-data schemaは不変。
- 全自動testは0 fail／0 skipped。
- 390×844で横overflowなし、Safe Areaとcontent bottom insetが正常。
- release promotion前に実iPhone確認を行う。

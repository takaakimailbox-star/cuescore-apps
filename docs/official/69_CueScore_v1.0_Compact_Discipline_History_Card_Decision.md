# CueScore v1.0 — Compact Discipline History Card Decision

- Date: 2026-08-30
- Status: Official RC addendum
- Approval: Product Owner adopted

## Decision

競技固定履歴cardの高さは95〜100pxを第一候補とし、窮屈な場合だけ最大105px程度とする。文字、avatar、score、chevronは縮めず、主に上下paddingと段間gapを圧縮する。

## Replacement Boundary

本DecisionはOfficial 065の「約115〜120px相当を第一候補」とBuild 20の116px実装だけを置き換える。上段の短縮日時／勝敗、下段の相手avatar／相手名／score／chevron、`vs`／競技名／Race to非表示、Match Detail Race to、card tap、Back／Swipe Backは維持する。

## Separation

Navigation Architectureとは独立した表示密度変更とする。scoring、勝敗判定、sorting、grouping、saved-data schema、Backup／Restore、analyticsは変更しない。

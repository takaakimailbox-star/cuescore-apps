# CueScore v1.0 — Compact Discipline History Card Spec

- Date: 2026-08-30
- Status: Official RC addendum
- Decision: Official 069

## Layout

- card heightは95〜100pxを第一候補、最大105px程度。
- 上段は`M/D HH:mm`と勝敗、下段は相手avatar、相手名、score、chevron。
- 文字、avatar、score、chevronの既存寸法を維持し、上下paddingと段間gapを主に圧縮する。
- 相手名は全角6文字相当までellipsisなし、7文字以上は必要に応じ1行ellipsis。
- `vs`、競技名、Race toはcard内に表示しない。Match DetailではRace toを維持する。

## Acceptance

- 390×844でcard高さが採用範囲内、横overflow、文字重なり、score／chevron欠けがない。
- 全角6文字相当名、3桁score、avatar、勝敗、短縮日時、chevronが読める。
- touch targetとcard tapによるMatch Detail導線を維持する。
- 約5試合を一覧した際にBuild 20より高い一覧性を持つ。
- 全自動test 0 fail／0 skipped、native asset一致、Simulator Debug／Release `BUILD SUCCEEDED`。

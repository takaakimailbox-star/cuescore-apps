# CueScore Localization P3 — Implementation Record（2026-10-16）

- 基準: Official 107／108／113／114／115／116、Decision Log v2.11。Product Owner は U6 のみ承認（Decision 035）。U3／U4／U8 は未決のまま。
- 方式: 表示文言を `cueT("p3.<sha1 8桁>", {params})` に移し、ja catalog は元の日本語文（byte 一致）、en／zh-Hans は **P3-PROVISIONAL**。静的 markup は `data-i18n*`。日本語 canonical 保存値・CSV・Backup・QR は不変。
- 範囲: P3-① Home／Match Setup／Recording、② Match Result／Detail／History、③ Player、④ Backup／Restore／Settings／Free-Pro／Match Sharing、⑤ Analytics（コーチ文を含む）、⑥ Navigation／オーバーレイ層の文言（重複描画層の整理は**未実装**）。
- 除外（allow-list `tests/fixtures/p3/ja-allowlist.json`）: Cloud Sync（非表示）、CSV 契約、`BREAK_RESULT_LABELS_V61` の canonical 値、U4（Paywall／購入面）、U8（Backup Share Sheet）、言語名、meta description。
- 検証: ja ソースは AST 意味同一、L2 実ブラウザ golden 差異 0、Data／QR／Backup／CSV／Identity／Analytics パリティ一致（ja／en／zh-Hans）、3 言語 × Free／Pro 実走で未訳検出 0（pending／later を除く）、Full Node 1076／1076。
- 詳細・Evidence: 永続領域の `38_…`〜`47_…`（`CueScore_i18n_P3_Completion_Report.md`）。

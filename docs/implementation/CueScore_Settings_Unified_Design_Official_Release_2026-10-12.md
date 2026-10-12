# CueScore Settings Unified Design — Official Decision Publication（2026-10-12）

Decision 032 / Official 110（Decision）/ Official 111（Specification）/ Official Design Decision Log v2.8 を発行した。Documentation-only。製品実装は別 Gate（Implementation NOT STARTED）。

## 承認
Product Owner は 2026-10-12 に Settings Unified Design R案を正式承認し、同日、CF-1（データ管理行の高さ）をB案で確定した。

- 830px 以下: データ管理行 56px 以上／831px 以上: 62px 以上（境界: 830px は 56px 以上、831px は 62px 以上）
- 375×812・390×844: 1画面完結／アプリ情報行 44〜46px／カード角丸 20pt／小画面スクロール fallback
- Official 84 の 62px 規則は、Settings の 830px 以下に限り後続 Decision で置換する。他画面の規則は変更しない。

## 発行内容
- `docs/official/110_CueScore_Settings_Unified_Design_Decision.md`（Decision 032、A〜L）
- `docs/official/111_CueScore_Settings_Unified_Design_Spec.md`（SU-001〜、AC-SU-1〜13）
- `docs/official/07_CueScore_Official_Design_Decision_Log_v2.8_Official_Release.docx`（v2.7 の Decision 001〜031 を byte 単位で維持し Decision 032 を追加。v2.7 は保存）
- Official 109 は Localization Glossary 用に予約したまま未使用。Decision 014・Official 84 は改変していない。
- 更新: `docs/README.md`、`docs/CURRENT_STATE.md`、`docs/CURRENT_STATUS.md`、`docs/handoff/`、`tests/localization-official-docs.test.mjs`（番号ガードを最大 111 へ、README の v2.8 表記。弱体化なし）。新規: `tests/settings-unified-design-decision.test.mjs`。

## 画面検証（Prototype 実測。正式仕様の行高さ）
Chrome 154、Safe Area 上 47pt・下 34pt、DPR 3。角丸 20pt、プラン行 52px、データ行 56px（830px 以下）／62px（831px 以上）、アプリ情報行 46px／44px（830px 以下）。

| 条件 | Bottom Navigation との余白 | 重なり | clipping | 横 overflow | 最小操作領域 |
|---|---|---|---|---|---|
| 390×844 ja / en / zh-Hans | +14px | 0 | 0 | 0 | 46px |
| 375×812 en / zh-Hans | +18px | 0 | 0 | 0 | 44px |
| 375×812 ja | +11.9px（副題の折返しで 6px のスクロール余地） | 0 | 0 | 0 | 44px |
| 境界 390×830（3言語） | +36px | 0 | 0 | 0 | 44px |
| 境界 390×831（3言語） | **+1px** | 0 | 0 | 0 | 46px |

831px は余白が 1px しかなく、実装で行高さ・余白を増やしてはならない（Spec SU-032A）。小画面（375×667、320×568）は縦スクロールで最下部まで到達できる。

## NOT VERIFIED
実機（iPhone 16e・WKWebView）の Safe Area と 1画面、文字拡大、Version 単一定義の実装と Native `MARKETING_VERSION` との一致、新 Key `settings.section.appInfo` の 3 カタログ登録、翻訳の最終品質（P4）。

## 境界
Settings 製品実装、P1 source、P2、S-B flag（false 維持）、Device Build、iPhone install、Archive / Upload、TestFlight、App Store Connect、Release、CueScore Apps・Score RC の変更は行っていない。P1 は未完成・未 commit。

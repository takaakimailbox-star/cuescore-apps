# 118 — CueScore Localization P4 Review Policy Spec（Decision 036 付随 Spec）

**状態: Adopted / Official（2026-10-17 発行）。** Official 108 を改変せず、Decision 036（Official 117）の適用規則と受入条件を定める。108 と食い違う場合は 108 の既存語義が優先し、本書は新状態 `P4-AI-VERIFIED` と記録様式を追加するだけである。

## 1. 規則
- P4R-R1: `P4-AI-VERIFIED` は**キー単位**で付与する。付与には §2 の Evidence 欄がすべて埋まっていること。埋まらないキーは `P3-PROVISIONAL` のまま。
- P4R-R2: AI の検証を `P4-REVIEWED` と記録しない。レビュアー欄に AI 名を書く場合は「AI（モデル名）」と明示し、人間レビュアーの欄と区別する。
- P4R-R3: `P4-APPROVED` は Product Owner の承認記録（日付・範囲）なしに付与しない。AI が付与・代行しない。
- P4R-R4: アプリ内 Official の意味（出典: Spec／Decision）と一般の競技規則（出典: WPA 等）を別欄に記録する。一致が確認できない場合は一致と書かず、PO 判断へ回す。
- P4R-R5: 一次資料は URL、文書名、発行元、版（文書内の表記とファイル名が食い違う場合は両方）、該当節・ページ、確認日を記録する。逐語引用は短い断片に留める。確認できなかった資料は `NOT VERIFIED` と記録する。
- P4R-R6: 資料間の版・意味の食い違いは統合せず、そのまま記録する。
- P4R-R7: catalog を変更できるのは、根拠が記録された修正に限る。根拠が不十分、または PO 判断が必要な提案は catalog に入れず、`P3-PROVISIONAL` のまま未承認として保持する。ja catalog と ja 表示は変更しない。
- P4R-R8: 重点領域（Decision 036 の A〜F）のキーには、必ず残余リスク（§3）を記録する。
- P4R-R9: 人間の独立レビュー未実施を、各 Evidence とリリース資料で明示する（D036-6）。

## 2. キー単位 Evidence の必須欄
key／領域（A〜G）／ja 原文／en 現行／zh-Hans 現行／意味の照合結果（en・zh 別）／用語（該当する場合）と根拠 ID／プレースホルダ・数値・単位の一致／実画面確認の有無／結論（`VERIFIED`／`VERIFIED-WITH-RISK`／`PO-DECISION`）／残余リスク等級／検証者（AI 名・日付）／変更の有無。

## 3. 残余リスク等級
- R0: 意味・用法が自明で一次資料と矛盾がない。
- R1: 自然さ・文体の揺れが残る（意味は正しい）。
- R2: 競技用語・規則の意味に、一次資料の裏付けが一部しかない。
- R3: 意味が確定できず、PO 判断が必要（`PO-DECISION`、`P3-PROVISIONAL` のまま）。

## 4. 受入基準
- AC-P4R-1: manifest の全キーに状態があり、`P4-REVIEWED` と `P4-APPROVED` は PO 承認前は 0。
- AC-P4R-2: `P4-AI-VERIFIED` の全キーに §2 の Evidence 行がある。
- AC-P4R-3: R2／R3 のキーに残余リスクが記録されている。R3 は `P4-AI-VERIFIED` にならない。
- AC-P4R-4: catalog の変更は、根拠が記録された修正のみで、旧→新の対応表がある。ja は無変更。
- AC-P4R-5: 3 言語で overflow／clipping を再測定し、日本語表示差異が 0。
- AC-P4R-6: 「人間の独立レビュー未実施」が Evidence に明記されている。
- AC-P4R-7: 公開後の修正手順（D036-7）が文書化されている。

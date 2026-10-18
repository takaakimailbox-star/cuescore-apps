# 127 — CueScore Localization Glossary 25 Terms Approval Decision（Decision 041）

**状態: Adopted / Official。** 2026年10月18日発行（Decision 041、Official Design Decision Log v2.17）。Product Ownerの明示承認（2026-10-18）に基づく。
**Scope:** Evidence 84のGlossary 27語のうち、G14・G25を除く25語のCueScore内訳語と意味の承認記録だけ。外部競技団体の正式名称・正式訳語の確認、catalog変更、Official 109の完成版発行には一般化しない。

## 1. 番号（fresh確認、GitHub main `0ac0bd9d53576fd326c32be183c69a7658bb9786`）

- Decision Logはv2.16（Decision 001〜040）。本書 = **Decision 041**（未使用を確認）、Decision Log = **v2.17**（001〜040は改変しない）。
- Official文書の最大番号は126。本書 = **Official 127**（Decision）、付随Spec = **Official 128**（`128_CueScore_Localization_Glossary_25_Terms_Approval_Spec.md`）。
- **Official 109は完成版Glossary用の予約番号として未発行のまま維持する。** G14／G25が未承認であるため、Official 119 §4の発行条件を満たさない。

## 2. Product Owner承認（2026-10-18、明示）

Product OwnerはEvidence 84の正本台帳を基準として、次の25語を承認した。

`G01, G02, G03, G04, G05, G06, G07, G08, G09, G10, G11, G12, G13, G15, G16, G17, G18, G19, G20, G21, G22, G23, G24, G26, G27`

**G14とG25は承認対象に含まれない。** 人間の独立レビューは未実施であり、中国語公式用語集、JPA団体正式名称等の一次資料不足は`NOT VERIFIED`のまま保持する。

## 3. 決定

### D041-1 25語の状態

Official 108 L-GLOSの状態定義に従い、§2の25語を**CONFIRMED（PO承認記録、残余リスクあり）**とする。採用する日本語・英語・簡体字中国語、CueScore内の意味、根拠、残余リスクはOfficial 128 §2の台帳に固定する。

### D041-2 未承認2語

G14（アベレージ／平均）とG25（スポット）は**PENDING**を維持する。Source AuditとPO判断資料をEvidenceへ保存するが、追加のPO承認なしにCONFIRMEDへ変更しない。

### D041-3 承認の意味

本承認はCueScore内の意味と採用表示語を確定する。外部競技団体の正式名称・中国語の公式競技用語・JPA外部ルールを確認済みとするものではない。根拠不足はNOT VERIFIEDのまま残し、誤訳指摘はOfficial 117 D036-7の手順で扱う。

### D041-4 Official 109との関係

本Decisionは部分承認記録であり、Glossary全体の完成版ではない。G14／G25がPENDINGのため、Official 109を発行せず、Official 108 AC-1のGlossary `PENDING`／`CANDIDATE` 0をPASSとしない。

### D041-5 不変条件

catalog、ja表示、production source、Match／Snapshot schema、Player Identity、QR／Backup／CSV、Analytics数値、Free／Pro、IAP Product ID、S-B（`false`）、Native設定、Version／Buildを変更しない。実機、Apple Developer、ASC、TestFlight、Releaseを操作しない。

## 4. 既存承認との関係

Decision 037／Official 119・120でCONFIRMEDとなった11語は保持し、置換・取消・再解釈しない。本Decisionの25語はEvidence 84の別台帳であり、G24「Re-rack」は既存承認語「Rack」と別概念として扱う。

## 5. 承認・発行

POの承認（2026-10-18）に基づき、2026-10-18にDocumentation-onlyで発行する。G14／G25の最終承認、Official 109、catalog／source変更、P6 Closeout、P7は別Gateとする。

# CueScore Localization Native Camera Decision 040 — Official Release

Date: 2026-10-18  
Baseline: `4f2c0c13f18602963e9618062c1aa717846ce7fb`

## Conclusion

Product Ownerの明示承認に基づき、Nativeの `NSCameraUsageDescription` をja／en／zh-Hansで提供し、未対応OS言語をjaへfallbackする方針をDecision 040として正式化した。

## Published SSOT

- Decision 040 / Official 125
- Official 126 (acceptance specification)
- Official Design Decision Log v2.16

## Reconciliation

Decision 039のU11 4設定値と過去のOfficial整合性FAIL記録は保持する。Official 124 U11-R4の `lproj`／`InfoPlist.strings` 禁止は、Decision 040発行後、`NSCameraUsageDescription` の3言語資産とXcode resource登録にだけ限定例外を認める。他のNative設定・権限文言へは拡張しない。

## Gate Boundary

本commitはDocumentation-only。Native実装、Simulator検証、実機Build/install、Build 84上書き、Apple Developer、ASC、TestFlight、Releaseは含まない。Native実装は本Decisionのread-back PASS後に独立commitで行う。

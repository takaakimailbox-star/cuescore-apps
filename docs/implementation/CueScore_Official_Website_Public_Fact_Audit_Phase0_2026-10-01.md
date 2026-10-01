# CueScore Official Website Public Fact Audit — Phase 0

- Date: 2026-10-01
- Repository: `takaakimailbox-star/cuescore-apps`
- Baseline: `039b966cdcdc2fbdcf20644ff49a0815ef0098e8`
- Audit branch: `codex/website-fact-audit`
- Public URL: `https://takaakimailbox-star.github.io/cuescore-apps/`
- CueScore URL: `https://takaakimailbox-star.github.io/cuescore-apps/cuescore/`
- Hosting: GitHub Pages legacy build, `main` branch `/docs`, HTTPS enforced
- Deploy status: not deployed in this gate

## Conclusion

The published CueScore product page still presented CueScore as pre-release in two calls to action. The local candidate replaces only those stale labels with the verified Japanese App Store URL. Page structure, copy outside those labels, layout, color, typography, assets, supported games, Free/Pro contract, and the CueScore app source are unchanged.

## Verified facts

- Japanese App Store URL: `https://apps.apple.com/jp/app/cuescore-apps/id6802027038`
- The App Store page and current official support documents agree on six supported games: Rotation, 9 Ball, 10 Ball, JPA 9 Ball, Straight Pool 14.1, and Three Cushion 3C.
- Public CueScore support, privacy, and terms pages resolve and render their official Markdown sources.
- The public pages do not state a fixed CueScore Pro price; they direct users to the App Store purchase confirmation price.
- CueSnapi TestFlight wording concerns a separate product and was not changed by this CueScore fact-correction gate.

## Corrections

`docs/cuescore/index.html`:

1. Hero `App Store 公開予定` disabled label → `App Storeで見る` link.
2. Final `Coming soon` / `App Store 公開予定` → `App Store` / `App Storeで見る` link.
3. Both links use the verified App Store URL above.

No CSS or layout files changed.

## Verification

- Focused website tests: 8/8 PASS.
- Full Node discovery: 583 tests; 581 PASS, 2 FAIL because this isolated source checkout does not contain generated `native-web` / copied iOS web assets. Both failures are native generated-copy prerequisites and are unrelated to the website source change.
- `git diff --check`: PASS.
- Public HTTP audit: 13/13 URLs returned HTTP 200, including root, CueScore, Support, Privacy, Terms, Japanese/English CueSnapi pages, and the App Store URL.
- 390×844 visual audit across root, CueScore, Support, Privacy, and Terms: horizontal overflow 0 on all five pages; broken images 0; official-document loading residue 0.
- CueScore desktop audit at 1440×900: horizontal overflow 0.
- CueScore mobile CTA measurements: both App Store links visible, 164.07×50 px; stale pre-release labels 0.

## Boundary

- Commit: not performed.
- Push: not performed.
- Production deploy: not performed.
- CueScore app source: unchanged.
- App Store Connect / TestFlight: not operated.

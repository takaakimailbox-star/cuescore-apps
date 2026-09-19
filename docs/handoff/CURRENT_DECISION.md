# CueScore Current Decision

- Decision ID: `CUESCORE-B77-FRESH-STOREKIT-PRICE-20260919`
- Date: 2026-09-19
- Product Owner Decision: GO
- Gate state: Build 77 candidate verified; Internal TestFlight pending

## Objective

Pro画面を開くたびにnative StoreKitから商品をFresh取得し、取得前の古いstorefront価格を表示しない。取得中は`価格を確認中…`かつ購入不可、成功後はfresh `Product.displayPrice`を表示して購入可能、失敗時は`価格を取得できません`かつ購入不可とする。

## Acceptance

- stateに旧`$5.99`があってもopen直後に描画しない。
- Fresh取得成功で`¥980`等のStoreKit `Product.displayPrice`へ更新し、購入buttonを有効化。
- Fresh取得失敗で旧価格へfallbackせず、verified Proも降格しない。
- purchase／verified／finish／entitlement／restore semanticsは不変。
- Full Node regression fail 0、固定dependencyでRelease build／ArchiveをPASS。

## Boundary

Build `1.0 (77)`をInternal TestFlightへ反映し、`READY FOR PRODUCT OWNER BUILD 77 FRESH STOREKIT PRICE TEST`でSTOPする。Build 78、External TestFlight、App Review、Releaseへ進まない。

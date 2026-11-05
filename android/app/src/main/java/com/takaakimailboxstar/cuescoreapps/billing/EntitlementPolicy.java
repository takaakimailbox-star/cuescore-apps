package com.takaakimailboxstar.cuescoreapps.billing;

import java.util.List;

/**
 * Pure (Android-free) decision policy for the one-time CueScore Pro entitlement. Kept free of Play Billing
 * types so it can be unit tested on a plain JVM. Fail-closed: anything that is not a purchase in the
 * PURCHASED state for exactly the Pro product grants nothing.
 */
public final class EntitlementPolicy {
    public static final int STATE_UNSPECIFIED = 0;
    public static final int STATE_PURCHASED = 1;
    public static final int STATE_PENDING = 2;

    public static final class PurchaseSnapshot {
        public final List<String> productIds;
        public final int purchaseState;
        public final boolean acknowledged;

        public PurchaseSnapshot(List<String> productIds, int purchaseState, boolean acknowledged) {
            this.productIds = productIds;
            this.purchaseState = purchaseState;
            this.acknowledged = acknowledged;
        }
    }

    public static final class Result {
        public final boolean isPro;
        public final boolean pending;
        public final boolean needsAcknowledge;

        Result(boolean isPro, boolean pending, boolean needsAcknowledge) {
            this.isPro = isPro;
            this.pending = pending;
            this.needsAcknowledge = needsAcknowledge;
        }
    }

    private EntitlementPolicy() {}

    public static Result evaluate(String proProductId, List<PurchaseSnapshot> purchases) {
        boolean pro = false;
        boolean pending = false;
        boolean needsAck = false;
        if (proProductId == null || proProductId.isEmpty() || purchases == null) {
            return new Result(false, false, false);
        }
        for (PurchaseSnapshot purchase : purchases) {
            if (purchase == null || purchase.productIds == null || !purchase.productIds.contains(proProductId)) continue;
            if (purchase.purchaseState == STATE_PURCHASED) {
                pro = true;
                if (!purchase.acknowledged) needsAck = true;
            } else if (purchase.purchaseState == STATE_PENDING) {
                pending = true;
            }
        }
        return new Result(pro, pending && !pro, needsAck);
    }
}

package com.takaakimailboxstar.cuescoreapps;

import static org.junit.Assert.*;

import com.takaakimailboxstar.cuescoreapps.billing.EntitlementPolicy;
import com.takaakimailboxstar.cuescoreapps.billing.EntitlementPolicy.PurchaseSnapshot;
import com.takaakimailboxstar.cuescoreapps.scanner.PermissionStatus;
import java.util.*;
import org.junit.Test;

public class EntitlementPolicyTest {
    private static final String PRO = "com.takaakimailboxstar.cuescoreapps.pro";
    private static List<String> ids(String... v) { return Arrays.asList(v); }

    @Test public void noPurchasesIsFree() {
        EntitlementPolicy.Result r = EntitlementPolicy.evaluate(PRO, Collections.emptyList());
        assertFalse(r.isPro); assertFalse(r.pending); assertFalse(r.needsAcknowledge);
    }
    @Test public void purchasedGrantsAndRequestsAcknowledge() {
        EntitlementPolicy.Result r = EntitlementPolicy.evaluate(PRO, Arrays.asList(new PurchaseSnapshot(ids(PRO), 1, false)));
        assertTrue(r.isPro); assertTrue(r.needsAcknowledge);
    }
    @Test public void acknowledgedPurchaseGrantsWithoutAck() {
        EntitlementPolicy.Result r = EntitlementPolicy.evaluate(PRO, Arrays.asList(new PurchaseSnapshot(ids(PRO), 1, true)));
        assertTrue(r.isPro); assertFalse(r.needsAcknowledge);
    }
    @Test public void pendingDoesNotGrant() {
        EntitlementPolicy.Result r = EntitlementPolicy.evaluate(PRO, Arrays.asList(new PurchaseSnapshot(ids(PRO), 2, false)));
        assertFalse(r.isPro); assertTrue(r.pending); assertFalse(r.needsAcknowledge);
    }
    @Test public void unspecifiedStateFailsClosed() {
        assertFalse(EntitlementPolicy.evaluate(PRO, Arrays.asList(new PurchaseSnapshot(ids(PRO), 0, true))).isPro);
    }
    @Test public void otherProductDoesNotGrant() {
        assertFalse(EntitlementPolicy.evaluate(PRO, Arrays.asList(new PurchaseSnapshot(ids("other"), 1, true))).isPro);
    }
    @Test public void refundedPurchaseDisappearsAndRevokes() {
        assertFalse(EntitlementPolicy.evaluate(PRO, new ArrayList<>()).isPro);
    }
    @Test public void nullInputsFailClosed() {
        assertFalse(EntitlementPolicy.evaluate(null, Arrays.asList(new PurchaseSnapshot(ids(PRO), 1, true))).isPro);
        assertFalse(EntitlementPolicy.evaluate(PRO, null).isPro);
        assertFalse(EntitlementPolicy.evaluate(PRO, Arrays.asList((PurchaseSnapshot) null)).isPro);
    }
    @Test public void purchasedWinsOverStalePending() {
        EntitlementPolicy.Result r = EntitlementPolicy.evaluate(PRO, Arrays.asList(
            new PurchaseSnapshot(ids(PRO), 2, false), new PurchaseSnapshot(ids(PRO), 1, true)));
        assertTrue(r.isPro); assertFalse(r.pending);
    }
    @Test public void permissionStatusMapping() {
        assertEquals("authorized", PermissionStatus.map(true, true, false));
        assertEquals("notDetermined", PermissionStatus.map(false, false, false));
        assertEquals("notDetermined", PermissionStatus.map(false, true, true));  // re-promptable after denial
        assertEquals("denied", PermissionStatus.map(false, true, false));        // permanent -> settings
    }
}

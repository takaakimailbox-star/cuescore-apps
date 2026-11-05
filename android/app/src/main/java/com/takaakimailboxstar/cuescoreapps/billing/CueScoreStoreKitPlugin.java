package com.takaakimailboxstar.cuescoreapps.billing;

import android.app.Activity;
import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Google Play Billing adapter exposing the SAME JS contract as ios CueScoreStoreKitPlugin (jsName
 * "CueScoreStoreKit": getProduct / currentEntitlement / purchase / restore, events entitlementChanged /
 * purchaseDiagnostic) so monetization-v1.js is reused unmodified.
 *
 * UNAPPROVED: PRO_PRODUCT_ID is the iOS ID reused as a placeholder. No Play Console product exists yet and
 * no real purchase has been performed. Entitlement is fail-closed: it is only granted for a Play-reported
 * PURCHASED purchase of the Pro product. There is no server-side verification (no backend); see report.
 */
@CapacitorPlugin(name = "CueScoreStoreKit")
public class CueScoreStoreKitPlugin extends Plugin {
    static final String PRO_PRODUCT_ID = "com.takaakimailboxstar.cuescoreapps.pro";

    private BillingClient client;
    private PluginCall pendingPurchaseCall;

    @Override
    public void load() {
        client = BillingClient.newBuilder(getContext())
            .setListener((result, purchases) -> onPurchasesUpdated(result, purchases))
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .enableAutoServiceReconnection()
            .build();
    }

    @Override
    protected void handleOnDestroy() {
        if (client != null) client.endConnection();
        pendingPurchaseCall = null;
    }

    private interface Ready { void run(); }

    private void whenConnected(PluginCall call, Ready ready) {
        if (client.isReady()) { ready.run(); return; }
        client.startConnection(new BillingClientStateListener() {
            @Override public void onBillingSetupFinished(BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) ready.run();
                else rejectBilling(call, "BILLING_UNAVAILABLE", "Google Play Billing is unavailable.", result);
            }
            @Override public void onBillingServiceDisconnected() { /* auto reconnection enabled */ }
        });
    }

    private void rejectBilling(PluginCall call, String code, String message, BillingResult result) {
        JSObject data = new JSObject();
        data.put("diagnosticState", "BILLING_ERROR");
        data.put("errorDomain", "BillingClient");
        data.put("errorCode", result == null ? -1 : result.getResponseCode());
        call.reject(message, code, data);
    }

    private QueryProductDetailsParams productQuery() {
        return QueryProductDetailsParams.newBuilder().setProductList(Collections.singletonList(
            QueryProductDetailsParams.Product.newBuilder().setProductId(PRO_PRODUCT_ID).setProductType(BillingClient.ProductType.INAPP).build()
        )).build();
    }

    @PluginMethod
    public void getProduct(PluginCall call) {
        whenConnected(call, () -> client.queryProductDetailsAsync(productQuery(), (result, queryResult) -> {
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                rejectBilling(call, "BILLING_ERROR", "Unable to load CueScore Pro.", result);
                return;
            }
            List<ProductDetails> list = queryResult.getProductDetailsList();
            ProductDetails details = null;
            for (ProductDetails d : list) if (PRO_PRODUCT_ID.equals(d.getProductId())) details = d;
            if (details == null || details.getOneTimePurchaseOfferDetails() == null) {
                JSObject data = new JSObject();
                data.put("diagnosticState", "PRODUCTS_EMPTY");
                data.put("productsCount", list.size());
                call.reject("CueScore Pro is not available.", "PRODUCTS_EMPTY", data);
                return;
            }
            JSObject payload = new JSObject();
            payload.put("productId", details.getProductId());
            payload.put("displayName", details.getName());
            payload.put("description", details.getDescription());
            payload.put("localizedPrice", details.getOneTimePurchaseOfferDetails().getFormattedPrice());
            payload.put("diagnosticState", "PRODUCTS_OK");
            payload.put("productsCount", list.size());
            payload.put("productIdMatched", true);
            call.resolve(payload);
        }));
    }

    private interface EntitlementCallback { void done(EntitlementPolicy.Result result); }

    /** Re-queries Play (source of truth) and acknowledges any un-acknowledged valid purchase. */
    private void queryEntitlement(PluginCall call, EntitlementCallback callback) {
        whenConnected(call, () -> client.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
            (result, purchases) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    rejectBilling(call, "BILLING_ERROR", "Unable to query purchases.", result);
                    return;
                }
                EntitlementPolicy.Result decision = EntitlementPolicy.evaluate(PRO_PRODUCT_ID, snapshots(purchases));
                if (decision.needsAcknowledge) acknowledgeAll(purchases);
                callback.done(decision);
            }));
    }

    private List<EntitlementPolicy.PurchaseSnapshot> snapshots(List<Purchase> purchases) {
        List<EntitlementPolicy.PurchaseSnapshot> out = new ArrayList<>();
        for (Purchase p : purchases) {
            out.add(new EntitlementPolicy.PurchaseSnapshot(p.getProducts(), p.getPurchaseState(), p.isAcknowledged()));
        }
        return out;
    }

    private void acknowledgeAll(List<Purchase> purchases) {
        for (Purchase p : purchases) {
            if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED && !p.isAcknowledged() && p.getProducts().contains(PRO_PRODUCT_ID)) {
                client.acknowledgePurchase(
                    AcknowledgePurchaseParams.newBuilder().setPurchaseToken(p.getPurchaseToken()).build(),
                    r -> { /* retried on next entitlement query if it failed */ });
            }
        }
    }

    private JSObject entitlementPayload(EntitlementPolicy.Result r) {
        JSObject o = new JSObject();
        o.put("verified", true);
        o.put("isPro", r.isPro);
        return o;
    }

    @PluginMethod
    public void currentEntitlement(PluginCall call) {
        queryEntitlement(call, r -> call.resolve(entitlementPayload(r)));
    }

    @PluginMethod
    public void restore(PluginCall call) {
        // Play has no "restore" action; re-querying owned purchases is the equivalent (also after reinstall).
        queryEntitlement(call, r -> call.resolve(entitlementPayload(r)));
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String requested = call.getString("productId");
        if (requested != null && !PRO_PRODUCT_ID.equals(requested)) {
            call.reject("Unknown product.", "PURCHASE_ERROR");
            return;
        }
        Activity activity = getActivity();
        if (activity == null) { call.reject("Purchase screen is unavailable.", "PURCHASE_ERROR"); return; }
        if (pendingPurchaseCall != null) { call.reject("A purchase is already in progress.", "PURCHASE_ERROR"); return; }
        whenConnected(call, () -> client.queryProductDetailsAsync(productQuery(), (result, queryResult) -> {
            ProductDetails details = null;
            if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                for (ProductDetails d : queryResult.getProductDetailsList()) if (PRO_PRODUCT_ID.equals(d.getProductId())) details = d;
            }
            if (details == null) { rejectBilling(call, "PURCHASE_ERROR", "CueScore Pro is not available.", result); return; }
            final ProductDetails product = details;
            getBridge().executeOnMainThread(() -> {
                pendingPurchaseCall = call;
                BillingFlowParams flow = BillingFlowParams.newBuilder().setProductDetailsParamsList(Collections.singletonList(
                    BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(product).build())).build();
                BillingResult launch = client.launchBillingFlow(activity, flow);
                if (launch.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    pendingPurchaseCall = null;
                    rejectBilling(call, "PURCHASE_ERROR", "Unable to start the purchase.", launch);
                }
            });
        }));
    }

    private JSObject status(String status, boolean isPro) {
        JSObject o = new JSObject();
        o.put("status", status);
        o.put("verified", isPro);
        o.put("isPro", isPro);
        return o;
    }

    private void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        PluginCall call = pendingPurchaseCall;
        pendingPurchaseCall = null;
        int code = result.getResponseCode();
        if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
            if (call != null) call.resolve(status("cancelled", false));
            return;
        }
        if (code == BillingClient.BillingResponseCode.OK && purchases != null) {
            EntitlementPolicy.Result decision = EntitlementPolicy.evaluate(PRO_PRODUCT_ID, snapshots(purchases));
            if (decision.needsAcknowledge) acknowledgeAll(purchases);
            if (decision.isPro) {
                JSObject event = new JSObject();
                event.put("verified", true);
                event.put("isPro", true);
                notifyListeners("entitlementChanged", event);
                if (call != null) call.resolve(status("success", true));
            } else if (call != null) {
                call.resolve(status(decision.pending ? "pending" : "failure", false));
            }
            return;
        }
        if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED && call != null) {
            queryEntitlement(call, r -> call.resolve(status(r.isPro ? "success" : "failure", r.isPro)));
            return;
        }
        if (call != null) rejectBilling(call, "PURCHASE_ERROR", "Unable to purchase CueScore Pro.", result);
    }
}

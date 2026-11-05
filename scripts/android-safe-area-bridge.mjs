// Android-only post-processing of the shared web bundle (never applied to iOS/PWA sources).
// Capacitor 8 SystemBars injects --safe-area-inset-{top,right,bottom,left} on API 35+ (viewport-fit=cover),
// but native env(safe-area-inset-*) is unreliable on WebView <=139 (insets are consumed by the plugin).
// Each env(safe-area-inset-X[, fallback]) becomes var(--safe-area-inset-X, env(safe-area-inset-X[, fallback])):
// one source of truth (the injected var) when present, the original env() otherwise -> no double application.
const RE = /env\(\s*safe-area-inset-(top|right|bottom|left)\s*((?:,[^()]*)?)\)/g;

export function bridgeSafeArea(text) {
  let count = 0;
  const out = text.replace(RE, (_m, side, fb) => {
    count += 1;
    const fallback = fb ? fb.trim() : ", 0px";
    return `var(--safe-area-inset-${side}, env(safe-area-inset-${side}${fallback.startsWith(",") ? fallback : ", " + fallback}))`;
  });
  return { text: out, count };
}

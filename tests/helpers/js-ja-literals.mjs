/* P3 / AC-S1 scanner. Finds every string / template literal text (and static HTML text / attribute) that still contains Japanese kana or kanji,
 * ignoring comments and regular expressions. Pure text scan, no parser dependency. */
const JA = /[\u3040-\u30fa\u30fc-\u30ff\u4e00-\u9fff]/; // the katakana middle dot (U+30FB) is a neutral separator, not Japanese text

/* literals of one JS source: [{ line, text }] (template literals contribute each static chunk separately) */
export function jaLiteralsInJs(src, lineOffset = 0) {
  const out = [];
  const lineAt = idx => lineOffset + 1 + (src.slice(0, idx).match(/\n/g) || []).length;
  const regexAllowed = i => {
    let j = i - 1; while (j >= 0 && /\s/.test(src[j])) j--;
    if (j < 0) return true;
    return /[(,=:;!&|?{}[+\-*%<>~^]/.test(src[j]) || /\b(return|typeof|case|in|of|delete|void|throw|new)$/.test(src.slice(Math.max(0, j - 6), j + 1));
  };
  function scanTemplate(start) { // start points after the opening backtick; returns index after closing backtick
    let i = start, chunkStart = start;
    const flush = end => { const t = src.slice(chunkStart, end); if (JA.test(t)) out.push({ line: lineAt(chunkStart), text: t }); };
    while (i < src.length) {
      const c = src[i];
      if (c === "\\") { i += 2; continue; }
      if (c === "`") { flush(i); return i + 1; }
      if (c === "$" && src[i + 1] === "{") { flush(i); i = scanCode(i + 2, true); chunkStart = i; continue; }
      i++;
    }
    return i;
  }
  function scanCode(start, untilBrace) { // returns index after the closing brace when untilBrace
    let i = start, depth = 0;
    while (i < src.length) {
      const c = src[i], n = src[i + 1];
      if (c === "/" && n === "/") { i = src.indexOf("\n", i); if (i < 0) return src.length; continue; }
      if (c === "/" && n === "*") { const e = src.indexOf("*/", i + 2); i = e < 0 ? src.length : e + 2; continue; }
      if (c === "'" || c === '"') {
        let j = i + 1; while (j < src.length && src[j] !== c && src[j] !== "\n") { if (src[j] === "\\") j++; j++; }
        const t = src.slice(i + 1, j); if (JA.test(t)) out.push({ line: lineAt(i), text: t }); i = j + 1; continue;
      }
      if (c === "`") { i = scanTemplate(i + 1); continue; }
      if (c === "/" && regexAllowed(i)) {
        let j = i + 1, inClass = false;
        while (j < src.length) { const d = src[j]; if (d === "\\") { j += 2; continue; } if (d === "[") inClass = true; else if (d === "]") inClass = false; else if (d === "/" && !inClass) break; else if (d === "\n") break; j++; }
        i = j + 1; continue;
      }
      if (untilBrace) { if (c === "{") depth++; else if (c === "}") { if (depth === 0) return i + 1; depth--; } }
      i++;
    }
    return i;
  }
  scanCode(0, false);
  return out;
}

/* static markup of an HTML file: text nodes and attribute values with Japanese, outside <script>/<style>/comments; elements that already carry a data-i18n key are reported with that key */
export function jaMarkupInHtml(html) {
  const masked = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, " "));
  const out = [];
  const lineAt = idx => 1 + (masked.slice(0, idx).match(/\n/g) || []).length;
  const re = /<(\/?)([A-Za-z][A-Za-z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)/g; let m, keyed = false;
  while ((m = re.exec(masked))) {
    if (m[2]) {
      if (/^br$/i.test(m[2])) continue; // a line break keeps the key state of the surrounding element
      keyed = false;
      if (m[1]) continue;
      for (const a of m[3].matchAll(/\s(aria-label|title|placeholder|alt|content|value)="([^"]*)"/g)) if (JA.test(a[2])) out.push({ line: lineAt(m.index), text: a[2], kind: a[1], keyed: new RegExp("data-i18n-" + a[1] + "=").test(m[3]) });
      keyed = /\bdata-i18n(?:-text-first|-text-last)?="/.test(m[3]);
    } else if (m[4] && JA.test(m[4]) && m[4].trim()) out.push({ line: lineAt(m.index), text: m[4].trim(), kind: "text", keyed });
    else if (m[4]) { /* whitespace between tags keeps the element's key state */ }
  }
  return out;
}

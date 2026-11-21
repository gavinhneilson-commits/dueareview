/**
 * Small, safe Markdown renderer for review bodies.
 * All input is HTML-escaped first, so authors cannot inject scripts.
 * Supports: ## / ### headings, paragraphs, **bold**, *italic*, [links](https://…),
 * - bullet lists, 1. numbered lists, > blockquotes, --- rules, and
 * "> [!opinion]" / "> [!fact]" / "> [!test]" callouts so readers can tell facts,
 * test results and opinion apart (Honesty Policy point 6).
 */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function safeHref(href: string): string | null {
  const h = href.trim();
  if (/^https?:\/\//i.test(h) || h.startsWith("/") || h.startsWith("#") || /^mailto:/i.test(h)) return h;
  return null;
}

function inline(text: string): string {
  let s = esc(text);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) => {
    const decoded = href.replace(/&amp;/g, "&");
    const ok = safeHref(decoded);
    if (!ok) return label;
    const ext = /^https?:\/\//i.test(ok) && !ok.includes("dueareview.com");
    return `<a href="${esc(ok)}"${ext ? ' rel="noopener nofollow" target="_blank"' : ""}>${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  return s;
}

const CALLOUTS: Record<string, string> = { fact: "Verified fact", test: "Test result", opinion: "Our opinion" };

export function renderMarkdown(md: string): string {
  const lines = (md || "").replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{2,4})\s+(.*)$/))) {
      const lvl = m[1].length;
      out.push(`<h${lvl}>${inline(m[2])}</h${lvl}>`); i++; continue;
    }
    if (/^---+\s*$/.test(line)) { out.push("<hr/>"); i++; continue; }
    if (/^\|.*\|\s*$/.test(line)) {
      const rows: string[][] = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) {
        const cells = lines[i].trim().slice(1, -1).split("|").map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...bodyRows] = rows;
      out.push(`<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th scope="col">${inline(c)}</th>`).join("")}</tr></thead><tbody>${bodyRows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      const c = buf[0]?.match(/^\[!(fact|test|opinion)\]\s*$/i);
      if (c) {
        const kind = c[1].toLowerCase();
        out.push(`<aside class="callout callout-${kind}"><span class="callout-label">${CALLOUTS[kind]}</span><p>${inline(buf.slice(1).join(" "))}</p></aside>`);
      } else out.push(`<blockquote><p>${inline(buf.join(" "))}</p></blockquote>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ""))}</li>`); i++; }
      out.push(`<ul>${items.join("")}</ul>`); continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { items.push(`<li>${inline(lines[i].replace(/^\s*\d+[.)]\s+/, ""))}</li>`); i++; }
      out.push(`<ol>${items.join("")}</ol>`); continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,4}\s|>|\||\s*[-*]\s+|\s*\d+[.)]\s+|---+\s*$)/.test(lines[i])) { para.push(lines[i]); i++; }
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

export function plainText(md: string, max = 160): string {
  const t = (md || "").replace(/[#>*_\[\]()`-]/g, " ").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

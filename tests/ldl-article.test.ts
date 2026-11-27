import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleMarkdown } from "../src/components/markdown";
import { getArticle, referencedMarkdown, toSearchArticle } from "../src/lib/content";
import { coreHeadingsFor, headingsFor } from "../src/lib/article-reading";
import { searchArticles } from "../src/lib/search";
import { getHealthTool } from "../src/lib/tool-catalog";

const contract = JSON.parse(fs.readFileSync("tests/fixtures/ldl-import-contract.json", "utf8"));
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const normalize = (s: string) => s.replace(/^\s*(?:>\s*)+/gm, "").replace(/^#{1,6} .*$/gm, "").replace(/^<[^\n]+>.*$/gm, "").replace(/^\[![^\]]+\].*$/gm, "").replace(/\[來源:[a-z0-9-]+\]|\[\d+(?:[–-]\d+)?(?:,\s*\d+)*\]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "").replace(/^- /gm, "").replace(/\s+/g, "");

test("LDL import preserves the original medical paragraphs, tables, FAQ and stable citation relationships", () => {
  const a = getArticle("ldl-cholesterol")!;
  assert.equal(a.category, "chronic-disease"); assert.equal(a.kind, "education");
  assert.equal(a.updated, "2026-11-27"); assert.equal(a.status, "pending-review");
  const text = [a.body, ...a.summary, ...a.warnings, ...a.faq.flatMap(q => [q.question, q.answer])].join("\n\n");
  const parts = text.replace(/^>$/gm, "").split(/\n\n+/).map(normalize).filter(Boolean), hashes = new Set<string>();
  // Paragraphs may be split for mobile reading, but their original sequence must survive.
  for (let i = 0; i < parts.length; i++) for (let count = 1; count <= 8 && i + count <= parts.length; count++) hashes.add(hash(parts.slice(i, i + count).join("")));
  for (const protectedHash of contract.blocks) assert.ok(hashes.has(protectedHash), `Original clinical block missing: ${protectedHash}`);
  assert.deepEqual(a.summary.map(hash), contract.summaryHashes);
  assert.deepEqual(a.faq.map(q => q.question), contract.faqQuestions);
  assert.deepEqual(a.references.map(({ id, url, doi, pubmed }) => ({ id, url, ...(doi ? { doi } : {}), ...(pubmed ? { pubmed } : {}) })), contract.references);
  assert.deepEqual(a.references.map(r => hash(r.vancouver!)), contract.vancouverHashes);
  const counts: Record<string, number> = {};
  for (const m of text.matchAll(/\[來源:([a-z0-9-]+)\]/g)) counts[m[1]] = (counts[m[1]] ?? 0) + 1;
  assert.deepEqual(counts, contract.citationCounts);
  const first = [...new Set([...a.body.matchAll(/\[來源:([a-z0-9-]+)\]/g)].map(m => m[1]))];
  assert.deepEqual(first, a.references.map(r => r.id));
});

test("LDL renders six default-closed advanced blocks and informative responsive tables without raw HTML", () => {
  const a = getArticle("ldl-cholesterol")!;
  const html = renderToStaticMarkup(createElement(ArticleMarkdown, { body: a.body, references: a.references }));
  assert.equal([...html.matchAll(/<details class="deep-dive"/g)].length, 6);
  assert.doesNotMatch(html, /<details[^>]*\bopen|&lt;details|&lt;summary|\[!DEEPDIVE\]/);
  assert.equal([...html.matchAll(/<table>/g)].length, 9);
  assert.doesNotMatch(html, /<figure|<img|<h1/);
  assert.ok(headingsFor(a.body).some(h => h.advanced && h.text.startsWith("表一")));
  assert.ok(coreHeadingsFor(a.body).every(h => !h.advanced && h.depth === 2));
  assert.ok(a.reading.full > a.reading.core);
  assert.match(html, /假設相對風險下降 20%/);
  assert.match(html, /不是台灣族群的直接研究結果/);
  assert.match(html, /2026 年 12 月 1 日起的修訂/);
  assert.match(html, /11 月 30 日以前仍依當時有效條文/);
  assert.match(referencedMarkdown("[來源:ldl-ref8][來源:ldl-ref9][來源:ldl-ref10]", a.references), /#ref-ldl-ref8.*#ref-ldl-ref9.*#ref-ldl-ref10/);
});

test("LDL navigation links the new article, related thyroid content and existing LDL tool", () => {
  const a = getArticle("ldl-cholesterol")!;
  assert.ok(a.body.includes("/articles/tsh/"));
  assert.ok(a.body.includes("/tools/ldl-target/"));
  assert.ok(getHealthTool("ldl-target")!.related.some(link => link.href === "/articles/ldl-cholesterol/"));
  assert.equal(searchArticles([toSearchArticle(a)], "inclisiran")[0].slug, a.slug);
});

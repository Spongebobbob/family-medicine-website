import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleMarkdown } from "../src/components/markdown";
import { getArticle, toSearchArticle } from "../src/lib/content";
import { coreHeadingsFor } from "../src/lib/article-reading";
import { searchArticles } from "../src/lib/search";
import { getHealthTool } from "../src/lib/tool-catalog";

const contract = JSON.parse(fs.readFileSync("tests/fixtures/masld-import-contract.json", "utf8"));
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const normalize = (s: string) => s.replace(/^\s*(?:>\s*)+/gm, "").replace(/^#{1,6} .*$/gm, "").replace(/^<[^\n]+>.*$/gm, "").replace(/^\[![^\]]+\].*$/gm, "").replace(/\[來源:[a-z0-9-]+\]|\[\d+(?:[–-]\d+)?(?:,\s*\d+)*\]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "").replace(/^- /gm, "").replace(/\s+/g, "");

test("MASLD import preserves the original medical paragraphs, tables, FAQ and stable citation relationships", () => {
  const a = getArticle("masld")!;
  assert.equal(a.category, "health-check"); assert.equal(a.kind, "education");
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

test("MASLD reuses three collapsed deep dives and preserves four informative tables and estimated effects", () => {
  const a = getArticle("masld")!;
  const html = renderToStaticMarkup(createElement(ArticleMarkdown, { body: a.body, references: a.references }));
  assert.equal([...html.matchAll(/<details class="deep-dive"/g)].length, 3);
  assert.equal([...html.matchAll(/<table>/g)].length, 4);
  assert.doesNotMatch(html, /<details[^>]*\bopen|&lt;details|\[!DEEPDIVE\]|<img|<figure|<h1/);
  assert.ok(a.reading.full > a.reading.core);
  assert.ok(coreHeadingsFor(a.body).every(h => h.depth === 2 && !h.advanced));
  assert.match(a.body, /62\.9% \| 34\.3% \| 28\.7 個百分點/);
  assert.match(a.body, /36\.8% \| 22\.4% \| 14\.4 個百分點/);
  assert.match(a.body, /第 72 週期中分析共 800 人/);
  assert.match(a.body, /每治療約 7 人/);
  assert.match(a.body, /兩藥不能用不同試驗的反應率直接比較優劣/);
  assert.match(a.body, /不代表台灣健保一定給付/);
  assert.match(a.body, /超過 65 歲者使用 2\.0/);
  assert.match(a.body, /未滿 35 歲或急性生病/);
  assert.equal(a.faq.length, 2); assert.equal(a.warnings.length, 1);
  assert.equal(a.body.includes("若新出現黃疸"), false);
  assert.match(a.warnings[0], /黃疸.*吐血、解黑便、意識混亂或昏厥/);
});

test("MASLD is discoverable from FIB-4 and links related evidence and tools", () => {
  const a = getArticle("masld")!;
  assert.ok(a.body.includes("/tools/fib-4/"));
  assert.ok(a.body.includes("/articles/ldl-cholesterol/"));
  assert.ok(a.body.includes("/tools/bmi/"));
  assert.ok(getHealthTool("fib-4")!.related.some(link => link.href === "/articles/masld/"));
  assert.equal(searchArticles([toSearchArticle(a)], "MASH")[0].slug, a.slug);
});


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

const contract = JSON.parse(fs.readFileSync("tests/fixtures/alt-ast-import-contract.json", "utf8"));
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const normalize = (s: string) => s.replace(/^\s*(?:>\s*)+/gm, "").replace(/^#{1,6} .*$/gm, "").replace(/^<[^\n]+>.*$/gm, "").replace(/^\[![^\]]+\].*$/gm, "").replace(/\[來源:[a-z0-9-]+\]|\[\d+(?:[–-]\d+)?(?:,\s*\d+)*\]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "").replace(/^- /gm, "").replace(/\s+/g, "");

test("ALT/AST import preserves all original medical blocks, numbers and citation identities", () => {
  const a = getArticle("alt-ast")!;
  assert.equal(a.category, "health-check"); assert.equal(a.kind, "education");
  assert.equal(a.updated, "2026-11-28"); assert.equal(a.status, "pending-review");
  const text = [...a.summary, a.body, ...a.faq.map(q => q.answer)].join("\n\n");
  const parts = text.replace(/^>$/gm, "").split(/\n\n+/).map(normalize).filter(Boolean), hashes = new Set<string>();
  // Allow paragraph breaks for mobile, but require every original clinical block in full.
  for (let i = 0; i < parts.length; i++) for (let count = 1; count <= 8 && i + count <= parts.length; count++) hashes.add(hash(parts.slice(i, i + count).join("")));
  for (const protectedHash of contract.blocks) assert.ok(hashes.has(protectedHash), `Original clinical block missing: ${protectedHash}`);
  assert.deepEqual(a.summary.map(hash), contract.summaryHashes);
  assert.deepEqual(a.faq.map(q => q.question), contract.faqQuestions);
  assert.deepEqual(a.references.map(({ id, url, pubmed }) => ({ id, url, ...(pubmed ? { pubmed } : {}) })), contract.references);
  assert.deepEqual(a.references.map(r => hash(r.vancouver!)), contract.vancouverHashes);
  const counts: Record<string, number> = {};
  for (const m of text.matchAll(/\[來源:([a-z0-9-]+)\]/g)) counts[m[1]] = (counts[m[1]] ?? 0) + 1;
  assert.deepEqual(counts, contract.citationCounts);
  assert.deepEqual([...new Set([...a.body.matchAll(/\[來源:([a-z0-9-]+)\]/g)].map(m => m[1]))], a.references.map(r => r.id));
  assert.ok(a.body.includes(contract.fulltextUrl));
});

test("ALT/AST keeps safety and eligibility in core text with four collapsed deep dives and four tables", () => {
  const a = getArticle("alt-ast")!;
  const html = renderToStaticMarkup(createElement(ArticleMarkdown, { body: a.body, references: a.references }));
  assert.equal([...html.matchAll(/<details class="deep-dive"/g)].length, 4);
  assert.equal([...html.matchAll(/<table>/g)].length, 4);
  assert.equal([...html.matchAll(/class="article-table-scroll comparison-table" tabindex="0" role="region"/g)].length, 4);
  assert.doesNotMatch(html, /<details[^>]*\bopen|&lt;details|\[!DEEPDIVE\]|<img|<figure|<h1/);
  assert.ok(a.reading.full > a.reading.core);
  assert.ok(coreHeadingsFor(a.body).every(h => h.depth === 2 && !h.advanced));
  const core = a.body.split("## 進階實證")[0];
  assert.match(core, /40 U\/L 示範/);
  assert.match(core, /並非單靠數字即可決定的固定規則/);
  assert.match(core, /200–600 \| 當日聯繫醫療院所/);
  assert.match(core, /65 歲以上低風險界值通常改為 2\.0/);
  assert.match(core, /35 歲以下辨識能力較差；急性肝損傷期間不宜/);
  assert.match(core, /疑似藥物過量，應當日緊急就醫/);
  assert.match(core, /處方藥先與開藥醫師討論，不宜自行停藥/);
  assert.match(core, /民國 75 年（1986 年）含以前出生、未滿 80 歲/);
  assert.match(core, /2–4 週；這是實務上的示例/);
  assert.match(core, /孕婦、兒童及已知肝硬化患者/);
  assert.match(a.body, /男性約 29–33 U\/L、女性約 19–25 U\/L/);
  assert.match(a.body, /R ≥ 5.*R ≤ 2.*2 < R < 5/);
  assert.match(a.body, /並不代表每一項檢查都已有隨機試驗證明可降低死亡率/);
  assert.equal([...a.body.matchAll(/35 歲以下辨識能力/g)].length, 1);
  assert.equal(a.faq.length, 2); assert.equal(a.warnings.length, 0);
  assert.match(a.faq[1].answer, /macro-AST/);
});

test("ALT/AST article is searchable and connected to the homepage, MASLD and FIB-4", () => {
  const a = getArticle("alt-ast")!;
  assert.ok(a.body.includes("/articles/masld/")); assert.ok(a.body.includes("/tools/fib-4/"));
  assert.ok(getArticle("masld")!.body.includes("/articles/alt-ast/"));
  assert.match(fs.readFileSync("src/app/page.tsx", "utf8"), /label: "ALT", href: "\/articles\/alt-ast\/"/);
  for (const query of ["GOT", "GPT", "ALT", "AST", "肝指數"]) assert.equal(searchArticles([toSearchArticle(a)], query)[0].slug, a.slug);
});

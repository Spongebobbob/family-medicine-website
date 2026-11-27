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

const contract = JSON.parse(fs.readFileSync("tests/fixtures/egfr-ckd-import-contract.json", "utf8"));
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const normalize = (s: string) => s.replace(/^\s*(?:>\s*)+/gm, "").replace(/^#{1,6} .*$/gm, "").replace(/^<!--.*?-->$/gm, "").replace(/^\[![^\]]+\].*$/gm, "").replace(/\[來源:[a-z0-9-]+\]|\[\d+(?:[–-]\d+)?(?:,\s*\d+)*\]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "").replace(/^- /gm, "").replace(/\s+/g, "");

test("eGFR import preserves all original medical blocks, summary, FAQ and citation identities", () => {
  const a = getArticle("egfr-ckd")!;
  assert.equal(a.category, "health-check"); assert.equal(a.kind, "education");
  assert.equal(a.updated, "2026-11-27"); assert.equal(a.status, "pending-review");
  const text = [...a.summary, a.body, ...a.faq.map(q => q.answer)].join("\n\n");
  const parts = text.replace(/^>$/gm, "").split(/\n\n+/).map(normalize).filter(Boolean), hashes = new Set<string>();
  // Allow mobile paragraph breaks while retaining the complete original words and sequence.
  for (let i = 0; i < parts.length; i++) for (let count = 1; count <= 8 && i + count <= parts.length; count++) hashes.add(hash(parts.slice(i, i + count).join("")));
  for (const protectedHash of contract.blocks) assert.ok(hashes.has(protectedHash), `Original clinical block missing: ${protectedHash}`);
  assert.deepEqual(a.summary.map(hash), contract.summaryHashes);
  assert.deepEqual(a.faq.map(q => q.question), contract.faqQuestions);
  assert.deepEqual(a.references.map(({ id, url, doi }) => ({ id, url, ...(doi ? { doi } : {}) })), contract.references);
  assert.deepEqual(a.references.map(r => hash(r.vancouver!)), contract.vancouverHashes);
  const counts: Record<string, number> = {};
  for (const m of text.matchAll(/\[來源:([a-z0-9-]+)\]/g)) counts[m[1]] = (counts[m[1]] ?? 0) + 1;
  assert.deepEqual(counts, contract.citationCounts);
  assert.deepEqual([...new Set([...text.matchAll(/\[來源:([a-z0-9-]+)\]/g)].map(m => m[1]))], a.references.map(r => r.id));
});

test("eGFR uses collapsed shared deep dives and accessible tables while keeping urgent care visible", () => {
  const a = getArticle("egfr-ckd")!;
  const html = renderToStaticMarkup(createElement(ArticleMarkdown, { body: a.body, references: a.references }));
  assert.equal([...html.matchAll(/<details class="deep-dive"/g)].length, 3);
  assert.equal([...html.matchAll(/<table>/g)].length, 5);
  assert.equal([...html.matchAll(/class="article-table-scroll comparison-table" tabindex="0" role="region"/g)].length, 5);
  assert.doesNotMatch(html, /<details[^>]*\bopen|advanced:start|\[!DEEPDIVE\]|<img|<figure|<h1/);
  assert.ok(a.reading.full > a.reading.core);
  assert.ok(coreHeadingsFor(a.body).every(h => h.depth === 2 && !h.advanced));
  const core = a.body.split("## 進階實證")[0];
  assert.match(core, /若突然明顯尿量減少.*應立即就醫/);
  assert.match(core, /第一次發現|首次發現/);
  assert.match(core, /不必等待|不必從今天重新等待/);
  assert.match(core, /兩週內複驗/);
  assert.match(core, /兒童、孕婦或急重症患者/);
  assert.match(core, /G1、G2 合併 A1 若沒有其他腎損傷證據，不算 CKD/);
  assert.match(core, /不是看到某一數值就決定/);
  assert.equal(a.faq.length, 2); assert.equal(a.warnings.length, 0);
  assert.match(a.faq[0].answer, /12 小時避免吃肉/);
  assert.match(a.body, /五年腎衰竭風險 3–5%/);
  assert.match(a.body, /eGFR ≥20 且 UACR ≥200 mg\/g/);
  assert.match(a.body, /eGFR 20–45 且 UACR <200 mg\/g 為較弱建議/);
  assert.match(a.body, /未正式改用年齡校正的 CKD 定義/);
});

test("eGFR article is linked from the existing calculator, homepage and search", () => {
  const a = getArticle("egfr-ckd")!;
  for (const link of ["/tools/egfr/", "/articles/ldl-cholesterol/", "/articles/hyperuricemia/"]) assert.ok(a.body.includes(link));
  assert.ok(getHealthTool("egfr")!.related.some(link => link.href === "/articles/egfr-ckd/"));
  assert.match(fs.readFileSync("src/app/page.tsx", "utf8"), /label: "eGFR", href: "\/articles\/egfr-ckd\/"/);
  assert.equal(searchArticles([toSearchArticle(a)], "慢性腎臟病")[0].slug, a.slug);
  assert.equal(searchArticles([toSearchArticle(a)], "UACR")[0].slug, a.slug);
});

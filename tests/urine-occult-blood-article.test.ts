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

const contract = JSON.parse(fs.readFileSync("tests/fixtures/urine-occult-blood-import-contract.json", "utf8"));
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const normalize = (s: string) => s.replace(/^\s*(?:>\s*)+/gm, "").replace(/^#{1,6} .*$/gm, "").replace(/^<!--.*?-->$/gm, "").replace(/^\[![^\]]+\].*$/gm, "").replace(/\[來源:[a-z0-9-]+\]|\[\d+(?:[–-]\d+)?(?:,\s*\d+)*\]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "").replace(/^- /gm, "").replace(/\s+/g, "");

test("urine occult blood import preserves every original clinical block and citation relationship", () => {
  const a = getArticle("urine-occult-blood")!;
  assert.equal(a.category, "health-check"); assert.equal(a.kind, "education");
  assert.equal(a.updated, "2026-11-27"); assert.equal(a.status, "pending-review");
  const text = [...a.summary, a.body, ...a.faq.map(q => q.answer)].join("\n\n");
  const parts = text.replace(/^>$/gm, "").split(/\n\n+/).map(normalize).filter(Boolean), hashes = new Set<string>();
  for (let i = 0; i < parts.length; i++) for (let count = 1; count <= 8 && i + count <= parts.length; count++) hashes.add(hash(parts.slice(i, i + count).join("")));
  for (const protectedHash of contract.blocks) assert.ok(hashes.has(protectedHash), `Original clinical block missing: ${protectedHash}`);
  assert.deepEqual(a.summary.map(hash), contract.summaryHashes);
  assert.deepEqual(a.faq.map(q => q.question), contract.faqQuestions);
  assert.deepEqual(a.references.map(({ id, url, doi, pubmed }) => ({ id, url, ...(doi ? { doi } : {}), ...(pubmed ? { pubmed } : {}) })), contract.references);
  assert.deepEqual(a.references.map(r => hash(r.vancouver!)), contract.vancouverHashes);
  const counts: Record<string, number> = {};
  for (const m of text.matchAll(/\[來源:([a-z0-9-]+)\]/g)) counts[m[1]] = (counts[m[1]] ?? 0) + 1;
  assert.deepEqual(counts, contract.citationCounts);
  assert.deepEqual([...new Set([...a.body.matchAll(/\[來源:([a-z0-9-]+)\]/g)].map(m => m[1]))], a.references.map(r => r.id));
  assert.ok(a.body.includes(contract.algorithmUrl));
});

test("urine occult blood keeps urgent care visible and uses three shared deep dives with seven accessible tables", () => {
  const a = getArticle("urine-occult-blood")!;
  const html = renderToStaticMarkup(createElement(ArticleMarkdown, { body: a.body, references: a.references }));
  assert.equal([...html.matchAll(/<details class="deep-dive"/g)].length, 3);
  assert.equal([...html.matchAll(/<table>/g)].length, 7);
  assert.equal([...html.matchAll(/class="article-table-scroll comparison-table" tabindex="0" role="region"/g)].length, 7);
  assert.doesNotMatch(html, /<details[^>]*\bopen|ADVANCED:START|\[!DEEPDIVE\]|<img|<figure|<h1/);
  assert.ok(a.reading.full > a.reading.core);
  assert.ok(coreHeadingsFor(a.body).every(h => h.depth === 2 && !h.advanced));
  const core = a.body.split("## 進階實證")[0];
  assert.match(core, /血塊造成尿不出來.*發燒畏寒合併側腰痛/);
  assert.match(core, /適用於已確認顯微血尿/);
  assert.match(core, /不需要直接跑急診/);
  assert.match(core, /約 3 週至 3 個月內/);
  assert.match(core, /6 個月內複驗/);
  assert.match(a.body, /女性年齡 \| <60 \| ≥60 \| 不以年齡單獨列入/);
  assert.match(a.body, /男性年齡 \| <40 \| 40–59 \| ≥60/);
  assert.match(a.body, /低風險須同時符合各項低風險條件/);
  assert.match(a.body, /0–0\.4%、中度 0\.2–3\.1%、高度 1\.3–6\.3%/);
  assert.match(a.body, /不是個人終生風險，也未必能直接套用於台灣人口/);
  assert.match(a.body, /不能直接證明某一檢查策略可以降低死亡率/);
  assert.match(a.body, /12 個月內複驗尿液，持續血尿者應接受膀胱鏡/);
  assert.match(a.body, /高度風險者不應以陰性標記取代膀胱鏡/);
  assert.equal(a.faq.length, 2); assert.equal(a.warnings.length, 0);
  assert.match(a.faq[0].answer, /不要自行停用醫師開立的抗血小板或抗凝血藥/);
  assert.match(a.faq[1].answer, /肌酸激酶（CK）或溶血相關指標/);
});

test("urine occult blood is searchable and linked with the existing kidney article and calculator", () => {
  const a = getArticle("urine-occult-blood")!;
  assert.ok(a.body.includes("/articles/egfr-ckd/"));
  assert.ok(a.body.includes("/tools/egfr/"));
  assert.ok(getArticle("egfr-ckd")!.body.includes("/articles/urine-occult-blood/"));
  for (const query of ["尿液潛血", "血尿", "RBC/HPF", "Occult blood"]) assert.equal(searchArticles([toSearchArticle(a)], query)[0].slug, a.slug);
});

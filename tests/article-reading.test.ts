import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import matter from "gray-matter";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleMarkdown } from "../src/components/markdown";
import { getArticle, parseArticle } from "../src/lib/content";
import { headingsFor, coreHeadingsFor, readingTime } from "../src/lib/article-reading";

test("advanced content is server rendered once, closed by default, with stable nested anchors", () => {
  const body = `## 核心\n\n核心內文。\n\n> [!DEEPDIVE] 研究方法\n>\n> ## 進階\n>\n> > [!EVIDENCE] 研究限制\n> >\n> > 方法內文。\n>\n> ### 核心\n>\n> [來源:ref1]\n\n## FAQ`;
  const headings = headingsFor(body);
  assert.deepEqual(coreHeadingsFor(body).map(h => h.id), ["核心", "faq-1"]);
  assert.deepEqual(headings.map(h => h.id), ["核心", "進階", "核心-1", "faq-1"]);
  const html = renderToStaticMarkup(createElement(ArticleMarkdown, { body, references: getArticle("hyperuricemia")!.references }));
  assert.match(html, /<details class="deep-dive" data-deep-dive="true">/);
  assert.doesNotMatch(html, /<details[^>]+open/);
  assert.match(html, /<summary>.*研究方法/s);
  assert.match(html, /id="進階"/);
  assert.match(html, /id="核心-1"/);
  assert.match(html, /href="#ref-ref1"/);
  assert.equal(html.split("方法內文。").length - 1, 1);
  assert.doesNotMatch(html, /\[!DEEPDIVE\]|\[!EVIDENCE\]/);
  assert.match(html, /class="evidence-card"/);
});

test("all optional reading blocks support Markdown and semantic comparison tables", () => {
  const body = ["TAKEAWAYS", "ACTION", "RED-FLAGS", "EVIDENCE"].map(kind => `> [!${kind}] 自訂標題\n>\n> **重點**`).join("\n\n") + "\n\n| 項目 | 比較 |\n|---|---|\n| A | B |";
  const html = renderToStaticMarkup(createElement(ArticleMarkdown, { body }));
  for (const cls of ["key-takeaways", "clinical-action", "warning-box", "evidence-card", "comparison-table"]) assert.ok(html.includes(cls));
  assert.match(html, /<strong>重點<\/strong>/);
  assert.match(html, /tabindex="0" role="region"/);
  assert.match(html, /<table>/);
  assert.match(html, /<thead>/);
  const parsed = matter(fs.readFileSync("content/articles/sleep-basics.md", "utf8"));
  for (const key of ["summary", "warnings", "faq"]) delete parsed.data[key];
  const article = parseArticle(matter.stringify(parsed.content, parsed.data), "optional-blocks");
  assert.deepEqual(article.summary, []); assert.deepEqual(article.warnings, []); assert.deepEqual(article.faq, []);
});

test("core reading time excludes deep dives, includes health warnings and preserves full search content", () => {
  const base = "## 核心\n\n" + "文".repeat(450);
  const advanced = "\n\n> [!DEEPDIVE] 方法\n>\n> " + "深".repeat(900);
  const timing = readingTime(base + advanced);
  assert.equal(timing.core, readingTime(base).core);
  assert.ok(timing.full > timing.core);
  assert.ok(readingTime(base, ["警".repeat(900)]).core > timing.core);
  const article = getArticle("hyperuricemia")!;
  assert.ok(article.reading.hasDeepDive); assert.ok(article.reading.full > article.reading.core);
  assert.equal(article.minutes, article.reading.core);
  assert.ok(article.body.includes("NLRP3"));
});

test("hyperuricemia preserves original clinical sentences, numbers, frontmatter and reference numbering", () => {
  const contract = JSON.parse(fs.readFileSync("tests/fixtures/hyperuricemia-reading-contract.json", "utf8"));
  const { data, content } = matter(fs.readFileSync("content/articles/hyperuricemia.md", "utf8"));
  const hash = (text: string) => createHash("sha256").update(text).digest("hex");
  assert.equal(hash(JSON.stringify(data)), contract.frontmatterHash);
  assert.deepEqual(headingsFor(content).map(h => h.id), contract.headingIds);
  const sentences = content.replace(/^\s*(?:>\s*)+/gm, "").replace(/^\[![^\]]+\].*$/gm, "").replace(/^#{1,6} .*$/gm, "").replace(/^!\[.*$/gm, "").replace(/\[來源:[a-z0-9-]+\]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "").split(/[。！？]/).map(x => x.replace(/\s+/g, "")).filter(Boolean);
  const now = new Set(sentences.map(hash));
  for (const sentence of contract.sentences) assert.ok(now.has(sentence), `Protected sentence changed from ${contract.baseline}: ${sentence}`);
  const html = renderToStaticMarkup(createElement(ArticleMarkdown, { body: content, references: data.references, figures: getArticle("hyperuricemia")!.figures }));
  assert.equal(html.split("ACR 2020 對單純無症狀高尿酸者").length - 1, 1);
  assert.equal(html.split("無症狀者可能多年不發病").length - 1, 1);
  assert.equal([...html.matchAll(/<figure /g)].length, 4);
  assert.match(html, /<strong>高尿酸血症是一種生化異常，痛風則是尿酸鹽結晶引發的疾病<\/strong>。/);
  assert.doesNotMatch(html, /\*\*高尿酸/);
});
